from flask_restful import Resource, abort, reqparse
from .util import validate_tenant, token_required
from database import db


class MeApi(Resource):

    @validate_tenant
    @token_required()
    def get(self, current_user, tenant_id):
        return {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "score": 0, #TODO: return score
        }

    @validate_tenant
    @token_required()
    def put(self, current_user, tenant_id):
        responseParser = reqparse.RequestParser(bundle_errors=True)
        responseParser.add_argument('username', required=True)
        req = responseParser.parse_args()

        current_user.username = req.username
        db.session.commit()

        return {'message': 'response saved'}
