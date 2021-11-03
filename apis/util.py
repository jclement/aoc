from flask import request
from flask_restful import abort
from functools import wraps
import jwt
from app import app
from database.models import Tenant, User

def token_required(f):
   @wraps(f)
   def decorator(*args, **kwargs):
       token = None
       if 'Authorization' in request.headers:
           token = request.headers['Authorization'][7:]
       if not token:
           abort(500, message="token missing")
       try:
           data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
           current_user = User.query.filter_by(id=data['id']).first()
       except:
           abort(500, message="token invalid")
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

def score(q, a):
    return 0 if not a else (1 if q.answer == a.response else 0) + a.bonus_points