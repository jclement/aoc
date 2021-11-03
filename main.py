from threading import active_count
from flask import Flask, render_template, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import text, and_
from flask_restful import Resource, Api, reqparse, abort
from flask_migrate import Migrate
from functools import wraps
import jwt
import datetime
import os

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URI']
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.config['SECRET_KEY']=os.environ['SECRET_KEY']

api = Api(app)
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# ====== DATABASE MODELS =========================================

class Tenant(db.Model):
    id = db.Column(db.String(20), nullable=False, unique=True, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    email_domain = db.Column(db.String(80), unique=False, nullable=True)
    active = db.Column(db.Boolean(), nullable=False)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.String(20), db.ForeignKey('tenant.id'), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    is_admin = db.Column(db.Boolean(), nullable=False, default=False)
    created = db.Column(db.DateTime, nullable=False, default=datetime.datetime.utcnow())

class Challenge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer(), db.ForeignKey('user.id'), nullable=False)
    secret = db.Column(db.String(80), unique=True, nullable=False)
    expires = db.Column(db.DateTime, nullable=False, default=datetime.datetime.utcnow() + datetime.timedelta(minutes=10))

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.String(20), db.ForeignKey('tenant.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    body = db.Column(db.String())
    answer = db.Column(db.String())
    activate_date = db.Column(db.DateTime, nullable=False)
    deactivate_date = db.Column(db.DateTime, nullable=False)

class Response(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    response = db.Column(db.String())
    bonus_points = db.Column(db.Integer, nullable=False, default=0)
    response_date = db.Column(db.DateTime, nullable=False, default=datetime.datetime.utcnow())

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    response_id = db.Column(db.Integer, db.ForeignKey('response.id'), nullable=False)
    tag = db.Column(db.String(30))

# ====== THROW AWAY INIT THING =========================================

@app.before_first_request
def init_database():
    s = db.session()
    if len(s.query(Tenant).all()) == 0:
        print("No data detected.  Creating testing tenant.")

        t = Tenant()
        t.name = "Testing Tenant"
        t.id = "test"
        t.active = True
        s.add(t)

        u = User()
        u.username = "admin"
        u.email = "admin@admin.com"
        u.is_admin = True
        u.tenant_id = t.id
        s.add(u)

        q1 = Question()
        q1.title = "Hello, World"
        q1.body = """
What command prints something to the `console` in Python?
        """
        q1.answer = "print"
        q1.activate_date = datetime.datetime.utcnow()
        q1.deactivate_date = datetime.datetime.utcnow() + datetime.timedelta(days=10)
        q1.tenant_id = t.id
        s.add(q1)

        q2 = Question()
        q2.title = "Author"
        q2.body = """
Who created Python? (first name.  lower case)

```python
import os
print("hello world")
```
        """
        q2.answer = "guido"
        q2.activate_date = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        q2.deactivate_date = datetime.datetime.utcnow() + datetime.timedelta(days=10)
        q2.tenant_id = t.id
        s.add(q2)

        s.commit()


# ====== HELPFUL DECORATORS =========================================

def token_required(f):
   @wraps(f)
   def decorator(*args, **kwargs):
       token = None
       if 'Authorization' in request.headers:
           token = request.headers['Authorization'][7:]
       if not token:
           return jsonify({'message': 'a valid token is missing'})
       try:
           data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
           current_user = User.query.filter_by(id=data['id']).first()
       except:
           return jsonify({'message': 'token is invalid'})
       return f(current_user, *args, **kwargs)
   return decorator

def validate_tenant(f):
    """
    Verify that the tenant provided actually exists
    """
    @wraps(f)
    def decorator(*args, **kwargs): 
        if not 'tenant' in kwargs:
           return jsonify({'message': 'no tenant specified'}),500
        tenant = Tenant.query.filter_by(id=kwargs['tenant'], active=True).first()
        if not tenant:
           return jsonify({'message': 'invalid tenant specified'}),404
        return f(*args, **kwargs)
    return decorator

# ====== WEB PAGE ROUTES =========================================

@app.route('/')
def index():
    return render_template("welcome.html")

@app.route('/<tenant>/')
@app.route('/<tenant>/<path:path>')
@validate_tenant
def tenant_index(tenant, path=""):
    return render_template("main.html")

@app.route('/<tenant>/leaderboard/')
@validate_tenant
def tenant_leader(tenant):
    return render_template("leader.html", leaderboard=leaderboard(tenant))

# ====== HELPERS =========================================

def question_is_visible(q):
    return datetime.datetime.utcnow() >= q.activate_date

def question_is_active(q):
    return \
        datetime.datetime.utcnow() >= q.activate_date and \
        datetime.datetime.utcnow() < q.deactivate_date

def score(q, a):
    return 0 if not a else (1 if q.answer == a.response else 0) + a.bonus_points

# ====== API ROUTES =========================================

@app.route('/<tenant>/api/login', methods=['POST'])
@validate_tenant
def login(tenant):
    print(request.json["email"])
    user = User.query.filter_by(tenant_id=tenant, email=request.json["email"]).first()
    if user:
        token = jwt.encode({'id' : user.id, 'exp' : datetime.datetime.utcnow() + datetime.timedelta(days=30)}, app.config['SECRET_KEY'], "HS256")
        return jsonify({'token' : token})
    return jsonify({'message': 'invalid user'}), 404
    
@app.route('/<tenant>/api/leaderboard')
@validate_tenant
def leaderboard(tenant):
    return {}

@app.route('/<tenant>/api/questions')
@validate_tenant
@token_required
def get_questions(current_user, tenant):
    """
    Returns any past and active questions
    """
    questions = db.session.query(Question, Response).filter(
        Question.tenant_id==tenant,
        question_is_visible(Question),
        ).outerjoin(Response, and_(
                Response.question_id == Question.id,
                Response.user_id == current_user.id,
            )).order_by(Question.activate_date)   
    return {
        "questions": [{
        "id": q.id,
        "title": q.title,
        "active": question_is_active(q),
        "answered": not a is None,
        "points": score(q, a)
    } for (q,a) in questions]}
    
@app.route('/<tenant>/api/questions/<question_id>')
@validate_tenant
@token_required
def get_question(current_user, tenant, question_id):
    q,a = db.session.query(Question, Response).filter(
        Question.tenant_id==tenant,
        Question.id == question_id,
        datetime.datetime.utcnow() > Question.activate_date,
        ).outerjoin(Response, and_(
                Response.question_id == Question.id,
                Response.user_id == current_user.id,
            )).first()
    return {
        "id": q.id,
        "title": q.title,
        "body": q.body,
        "active": question_is_active(q),
        "answered": not a is None,
        "points": score(q, a),
        "activate_date": q.activate_date.isoformat(),
        "deactivate_date": q.deactivate_date.isoformat(),
        "response_date": None if a is None else a.response_date.isoformat(),
        "response": None if a is None else a.response,
    }

@app.route('/<tenant>/api/questions/<question_id>', methods=['PUT'])
@validate_tenant
@token_required
def update_question(current_user, tenant, question_id):
    return {}

@app.route('/<tenant>/api/questions/<question_id>', methods=['POST'])
@validate_tenant
@token_required
def add_question(current_user, tenant, question_id):
    return {}


@api.route('/<tenant>/api/questions/<question_id>/response', methods=['POST'])
@validate_tenant
@token_required
def post_response(current_user, tenant, question_id):
    responseParser = reqparse.RequestParser(bundle_errors=True)
    responseParser.add_argument('response', required=True)
    responseParser.add_argument('tags', action='append')
    req = responseParser.parse_args()

    q,a = db.session.query(Question, Response).filter(
        Question.tenant_id==tenant,
        Question.id == question_id,
        ).outerjoin(Response, and_(
                Response.question_id == Question.id,
                Response.user_id == current_user.id,
            )).first()
    if not q:
        abort(404, message="question does not exist")
    if not question_is_active(q):
        abort(500, message="question is not active")
    if not a is None:
        abort(500, message="response already posted")

    print(len(req.tags))
    return ""

    s = db.session()

    r = Response()
    r.question_id = question_id
    r.response = req.response
    s.add(r)
    
    for tag in req.tags:
        t = Tag()
        t.response = r
        t.tag = tag
        s.add(t)

    s.commit()
    return {'message': 'response saved'}
    
@app.route('/<tenant>/api/current_user')
@validate_tenant
@token_required
def current_user(current_user, tenant):
    questions = db.session.query(Question, Response).filter(
        Question.tenant_id==tenant,
        datetime.datetime.utcnow() > Question.activate_date,
        ).outerjoin(Response, and_(
                Response.question_id == Question.id,
                Response.user_id == current_user.id,
            )).order_by(Question.activate_date)   
    points = 0
    for q,a in questions:
        points +=  0 if not a else (1 if q.answer == a.response else 0) + a.bonus_points
    return {
        "id": current_user.id,
        "user": current_user.username,
        "points": points,
        }

@app.route('/<tenant>/api/current_user', methods=['PUT'])
@validate_tenant
@token_required
def update_current_user(current_user, tenant=None):
    return {}

if __name__ == '__main__':
    app.run(debug=True)