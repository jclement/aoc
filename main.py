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

from werkzeug.http import HTTP_STATUS_CODES

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URI']
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.config['SECRET_KEY']=os.environ['SECRET_KEY']

api = Api(app)
db = SQLAlchemy(app)
migrate = Migrate(app, db)

class Tenants(db.Model):
    id = db.Column(db.String(20), nullable=False, unique=True, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    email_domain = db.Column(db.String(80), unique=False, nullable=True)
    active = db.Column(db.Boolean(), nullable=False)

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.String(20), db.ForeignKey('tenants.id'), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    is_admin = db.Column(db.Boolean(), nullable=False, default=False)
    created = db.Column(db.DateTime, nullable=False, default=datetime.datetime.utcnow())

class Challenges(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer(), db.ForeignKey('users.id'), nullable=False)
    secret = db.Column(db.String(80), unique=True, nullable=False)
    expires = db.Column(db.DateTime, nullable=False, default=datetime.datetime.utcnow() + datetime.timedelta(minutes=10))

class Questions(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.String(20), db.ForeignKey('tenants.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    body = db.Column(db.String())
    answer = db.Column(db.String())
    activate_date = db.Column(db.DateTime, nullable=False)
    deactivate_date = db.Column(db.DateTime, nullable=False)

class Responses(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    response = db.Column(db.String())
    bonus_points = db.Column(db.Integer, nullable=False, default=0)
    response_date = db.Column(db.DateTime, nullable=False, default=datetime.datetime.utcnow())

class Tags(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    response_id = db.Column(db.Integer, db.ForeignKey('responses.id'), nullable=False)
    tag = db.Column(db.String(30))

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
           current_user = Users.query.filter_by(id=data['id']).first()
       except:
           return jsonify({'message': 'token is invalid'})
       return f(current_user, *args, **kwargs)
   return decorator

def token_optional(f):
   @wraps(f)
   def decorator(*args, **kwargs):
       token = None
       current_user = None
       if 'Authorization' in request.headers:
           token = request.headers['Authorization'][7:]
       if token:
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = Users.query.filter_by(id=data['id']).first()
        finally:
            pass
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
        tenant = Tenants.query.filter_by(id=kwargs['tenant'], active=True).first()
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

# ====== API ROUTES =========================================

@app.route('/<tenant>/api/login', methods=['POST'])
@validate_tenant
def login(tenant):
    print(request.json["email"])
    user = Users.query.filter_by(tenant_id=tenant, email=request.json["email"]).first()
    if user:
        token = jwt.encode({'id' : user.id, 'exp' : datetime.datetime.utcnow() + datetime.timedelta(days=30)}, app.config['SECRET_KEY'], "HS256")
        return jsonify({'token' : token})
    return jsonify({'message': 'invalid user'}), 404
    
@app.route('/<tenant>/api/leaderboard')
@validate_tenant
@token_optional
def leaderboard(current_user, tenant):
    return {}

def serialize_question(q, a):
    return {
        "id": q.id,
        "title": q.title,
        "activate_date": q.activate_date.isoformat(),
        "deactivate_date": q.deactivate_date.isoformat(),
        "answered": not a is None,
        "answered_date": None if not a else a.response_date.isoformat(),
        "points": 0 if not a else (1 if q.answer == a.response else 0) + a.bonus_points,
    } 

@app.route('/<tenant>/api/questions')
@validate_tenant
@token_required
def get_questions(current_user, tenant):
    """
    Returns any past and active questions
    """
    questions = db.session.query(Questions, Responses).filter(
        Questions.tenant_id==tenant,
        datetime.datetime.utcnow() > Questions.activate_date,
        ).outerjoin(Responses, and_(
                Responses.question_id == Questions.id,
                Responses.user_id == current_user.id,
            )).order_by(Questions.activate_date)   
    return {"questions" : [serialize_question(q,a) for (q,a) in questions]}
    
@app.route('/<tenant>/api/questions/<question_id>')
@validate_tenant
@token_required
def get_question(current_user, tenant, question_id):
    q,a = db.session.query(Questions, Responses).filter(
        Questions.tenant_id==tenant,
        Questions.id == question_id,
        datetime.datetime.utcnow() > Questions.activate_date,
        ).outerjoin(Responses, and_(
                Responses.question_id == Questions.id,
                Responses.user_id == current_user.id,
            )).first()
    return serialize_question(q,a)

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

@app.route('/<tenant>/api/questions/<question_id>/response', methods=['POST'])
@validate_tenant
@token_required
def post_response(current_user, tenant, question_id):
    return {}
    
@app.route('/<tenant>/api/current_user')
@validate_tenant
@token_required
def current_user(current_user, tenant):
    questions = db.session.query(Questions, Responses).filter(
        Questions.tenant_id==tenant,
        datetime.datetime.utcnow() > Questions.activate_date,
        ).outerjoin(Responses, and_(
                Responses.question_id == Questions.id,
                Responses.user_id == current_user.id,
            )).order_by(Questions.activate_date)   
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