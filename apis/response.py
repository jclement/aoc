from flask_restful import Resource, abort, reqparse
from sqlalchemy import and_
from database import db
from database.models import Question, Response, Tag
from .util import validate_tenant, token_required


class ResponseApi(Resource):

    @validate_tenant
    @token_required()
    def get(self, current_user, tenant_id, question_id):
        r = db.session.query(Response).filter(
            Response.question_id == question_id,
            Response.user_id == current_user.id,
        ).first()
        return {
            "response": None if not r else r.response,
            "response_date": None if not r else r.response_date.isoformat(),
            "tags": None if not r else [t.tag for t in r.tags]
        }

    @validate_tenant
    @token_required()
    def put(self, current_user, tenant_id, question_id):
        responseParser = reqparse.RequestParser(bundle_errors=True)
        responseParser.add_argument('response', required=True)
        responseParser.add_argument('tags', action='append')
        req = responseParser.parse_args()

        res = db.session.query(Question, Response).filter(
            Question.tenant_id == tenant_id,
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
        r.tags = [Tag(tag=t) for t in req.tags]
        s.add(r)
        s.commit()

        return {'message': 'response saved'}
