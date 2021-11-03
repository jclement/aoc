from flask_restful import Resource, abort, reqparse
from .util import validate_tenant, token_required, score
from database import db
from database.models import Question, Response
from sqlalchemy import and_

class MeApi(Resource):

    @validate_tenant
    @token_required()
    def get(self, current_user, tenant_id):
        myscore = 0
        for q,r in db.session.query(Question, Response)\
            .filter(Question.tenant_id == tenant_id)\
            .outerjoin(Response, and_(Question.id == Response.question_id, Response.user_id == current_user.id))\
            .all():
            myscore += score(q,r)
        return {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "score": myscore,
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
