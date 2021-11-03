from flask_restful import Resource, abort, reqparse
from sqlalchemy import and_
import datetime
from database import db
from database.models import Question, Response
from .util import validate_tenant, token_required, score

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