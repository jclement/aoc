from flask import request
from flask_restful import Resource, abort
import jwt
import datetime

from app import app

from database.models import User
from .util import validate_tenant


class LoginApi(Resource):

    @validate_tenant
    def get(self, tenant_id):
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'][7:]
            try:
                data = jwt.decode(
                    token, app.config['SECRET_KEY'], algorithms=["HS256"])
                if User.query.filter_by(id=data['id']).first():
                    return {"authenticated": True}
            except:
                pass
        return {"authenticated": False}

    @validate_tenant
    def post(self, tenant_id):
        # TODO: actually implement some sort of emailing thing here.  It's easier this way thought
        user = User.query.filter_by(
            tenant_id=tenant_id, email=request.json["email"]).first()
        if user:
            token = jwt.encode({'id': user.id, 'exp': datetime.datetime.utcnow(
            ) + datetime.timedelta(days=30)}, app.config['SECRET_KEY'], "HS256")
            return {'token': token}
        abort(404, message="invalid user")
