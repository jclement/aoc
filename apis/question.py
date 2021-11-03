from flask_restful import Resource, abort, reqparse
from sqlalchemy import and_
import datetime
from database.models import Question, Response
from database import db
from .util import validate_tenant, token_required, score

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