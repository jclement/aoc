from flask_restful import Resource, abort, reqparse
from sqlalchemy import and_
import datetime
from database import db
from database.models import Question, Response
from .util import validate_tenant, token_required, score
from .question import questionParser


def question_to_simple(q, a):
    return {
        "id": q.id,
        "title": q.title,
        "active": q.is_active(),
        "answered": not a is None,
        "activate_date": q.activate_date.isoformat(),
        "deactivate_date": q.deactivate_date.isoformat(),
        "points": score(q, a)
    }


class QuestionsApi(Resource):

    @validate_tenant
    @token_required()
    def get(self, current_user, tenant_id):
        questions = db.session.query(Question, Response).filter(
            Question.tenant_id == tenant_id,
            current_user.is_admin or datetime.datetime.utcnow() >= Question.activate_date,
        ).outerjoin(Response, and_(
            Response.question_id == Question.id,
            Response.user_id == current_user.id,
        )).order_by(Question.activate_date)
        return {"questions": [question_to_simple(q, a) for (q, a) in questions]}

    @validate_tenant
    @token_required(admin=True)
    def post(self, current_user, tenant_id):
        args = questionParser.parse_args()
        s = db.session()
        q = Question()
        q.tenant_id = tenant_id
        q.title = args.title
        q.body = args.body
        q.activate_date = args.activate_date
        q.deactivate_date = args.deactivate_date
        q.answer = args.answer
        s.add(q)
        s.commit()
        return {"id": q.id}
