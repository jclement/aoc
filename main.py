from flask import Flask, render_template, request, jsonify, make_response
from flask_restful import Resource, Api, reqparse, abort
from flask_migrate import Migrate
from functools import wraps
import jwt
import datetime
import os

from database import db
from database.models import * 
from database.testdata import create_test_data_if_empty 

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URI']
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.config['SECRET_KEY']=os.environ['SECRET_KEY']

api = Api(app)
db.init_app(app)
migrate = Migrate(app, db)

# ====== THROW AWAY INIT THING =========================================

@app.before_first_request
def init_database():
    create_test_data_if_empty()

# ====== HELPFUL DECORATORS =========================================

def token_required(f):
   @wraps(f)
   def decorator(*args, **kwargs):
       token = None
       if 'Authorization' in request.headers:
           token = request.headers['Authorization'][7:]
       if not token:
           abort(500, "token missing")
       try:
           data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
           current_user = User.query.filter_by(id=data['id']).first()
       except:
           abort(500, "token invalid")
       return f(*args, current_user, **kwargs)
   return decorator

def validate_tenant(f):
    """
    Verify that the tenant provided actually exists
    """
    @wraps(f)
    def decorator(*args, **kwargs): 
        if not 'tenant_id' in kwargs:
           abort(500, message="tenant missing")
        tenant_id = Tenant.query.filter_by(id=kwargs['tenant_id'], active=True).first()
        if not tenant_id:
           abort(500, message="tenant does not exist")
        return f(*args, **kwargs)
    return decorator

# ====== WEB PAGE ROUTES =========================================

@app.route('/')
def index():
    return render_template("welcome.html")

@app.route('/<tenant>/')
@app.route('/<tenant_id>/<path:path>')
@validate_tenant
def tenant_index(tenant_id, path=""):
    return render_template("main.html")

@app.route('/<tenant_id>/leaderboard/')
@validate_tenant
def tenant_leader(tenant_id):
    return render_template("leader.html")

# ====== HELPERS =========================================

def score(q, a):
    return 0 if not a else (1 if q.answer == a.response else 0) + a.bonus_points

# ====== API ROUTES =========================================

class LoginApi(Resource):

    @validate_tenant
    def get(self, tenant_id):
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'][7:]
            try:
                data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
                current_user = User.query.filter_by(id=data['id']).first()
                return {"authenticated": True}
            except:
                pass
        return {"authenticated": False}

    @validate_tenant
    def post(self, tenant_id):
        #TODO: actually implement some sort of emailing thing here.  It's easier this way thought
        user = User.query.filter_by(tenant_id=tenant_id, email=request.json["email"]).first()
        if user:
            token = jwt.encode({'id' : user.id, 'exp' : datetime.datetime.utcnow() + datetime.timedelta(days=30)}, app.config['SECRET_KEY'], "HS256")
            return {'token' : token}
        abort(404, message="invalid user")
        return jsonify({'message': 'invalid user'}), 404

class MeApi(Resource):

    @validate_tenant
    @token_required
    def get(self, current_user, tenant_id):
        return {}

    @validate_tenant
    @token_required
    def put(self, current_user, tenant_id):
        return {}

class LeaderboardApi(Resource):

    @validate_tenant
    def get(self, tenant_id):
        return {}

class QuestionsApi(Resource):

    @validate_tenant
    @token_required
    def get(self, current_user, tenant_id):
        questions = db.session.query(Question, Response).filter(
            Question.tenant_id==tenant_id,
            datetime.datetime.utcnow() >= Question.activate_date,
            ).outerjoin(Response, and_(
                    Response.question_id == Question.id,
                    Response.user_id == current_user.id,
                )).order_by(Question.activate_date)   
        return {
            "questions": [{
            "id": q.id,
            "title": q.title,
            "active": q.is_active(),
            "answered": not a is None,
            "points": score(q, a)
        } for (q,a) in questions]}

    @validate_tenant
    @token_required
    def post(self, current_user, tenant_id):
        return {}

class QuestionApi(Resource):

    @validate_tenant
    @token_required
    def get(self, current_user, tenant_id, question_id):
        q,a = db.session.query(Question, Response).filter(
            Question.tenant_id==tenant_id,
            Question.id == question_id,
            datetime.datetime.utcnow() >= Question.activate_date,
            ).outerjoin(Response, and_(
                    Response.question_id == Question.id,
                    Response.user_id == current_user.id,
                )).first()
        return {
            "id": q.id,
            "title": q.title,
            "body": q.body,
            "active": q.is_active(),
            "answered": not a is None,
            "points": score(q, a),
            "activate_date": q.activate_date.isoformat(),
            "deactivate_date": q.deactivate_date.isoformat(),
            "response_date": None if a is None else a.response_date.isoformat(),
            "response": None if a is None else a.response,
        }

    @validate_tenant
    @token_required
    def put(self, current_user, tenant_id, question_id):
        return {}

class ResponseApi(Resource):

    @validate_tenant
    @token_required
    def get(self, current_user, tenant_id, question_id):
        q, a = db.session.query(Question, Response).filter(
            Question.tenant_id==tenant_id,
            Question.id == question_id,
            Question.is_active(),
            ).outerjoin(Response, and_(
                    Response.question_id == Question.id,
                    Response.user_id == current_user.id,
                )).first()
        return {
            "response": None if not a else a.response,
            "response_date": None if not a else a.response_date
        }

    @validate_tenant
    @token_required
    def put(self, current_user, tenant_id, question_id):
        responseParser = reqparse.RequestParser(bundle_errors=True)
        responseParser.add_argument('response', required=True)
        responseParser.add_argument('tags', action='append')
        req = responseParser.parse_args()

        res = db.session.query(Question, Response).filter(
            Question.tenant_id==tenant_id,
            Question.id == question_id,
            ).outerjoin(Response, and_(
                    Response.question_id == Question.id,
                    Response.user_id == current_user.id,
                )).first()
        if not res:
            abort(404, message="question does not exist")
        if not res[0].is_active():
            abort(500, message="question is not active")
        if not res[1] is None:
            abort(500, message="response already posted")

        s = db.session()

        r = Response()
        r.question_id = question_id
        r.user_id = current_user.id
        r.response = req.response
        s.add(r)
        s.commit()
        
        for tag in req.tags:
            t = Tag()
            t.response_id = r.id
            t.tag = tag
            s.add(t)

        s.commit()
        return {'message': 'response saved'}
    

api.add_resource(LoginApi, '/<tenant_id>/api/login')
api.add_resource(MeApi, '/<tenant_id>/api/me')
api.add_resource(LeaderboardApi, '/<tenant_id>/api/leaderboard')
api.add_resource(QuestionsApi, '/<tenant_id>/api/questions')
api.add_resource(QuestionApi, '/<tenant_id>/api/questions/<int:question_id>')
api.add_resource(ResponseApi, '/<tenant_id>/api/questions/<int:question_id>/response')

if __name__ == '__main__':
    app.run(debug=True)