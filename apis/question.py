from flask_restful import Resource, abort, reqparse, inputs
from sqlalchemy import and_
import datetime
from database.models import Question, Response
from database import db
from .util import validate_tenant, token_required, score

questionParser = reqparse.RequestParser(bundle_errors=True)
questionParser.add_argument('title', required=True)
questionParser.add_argument('activate_date', type=inputs.datetime_from_iso8601, required=True)
questionParser.add_argument('deactivate_date', type=inputs.datetime_from_iso8601, required=True)
questionParser.add_argument('body', required=True)
questionParser.add_argument('answer', required=True)

class QuestionApi(Resource):

    @validate_tenant
    @token_required()
    def get(self, current_user, tenant_id, question_id):
        q,a = db.session.query(Question, Response).filter(
            Question.tenant_id==tenant_id,
            Question.id == question_id,
            current_user.is_admin or datetime.datetime.utcnow() >= Question.activate_date,
            ).outerjoin(Response, and_(
                    Response.question_id == Question.id,
                    Response.user_id == current_user.id,
                )).first()
        return {
            "id": q.id,
            "title": q.title,
            "body": q.body,
            "active": q.is_active(),
            #TODO: Does it make sense to return response status/score in question like this? 
            "answered": not a is None,
            "answer": q.answer if current_user.is_admin else None,
            "points": score(q, a),
            "activate_date": q.activate_date.isoformat(),
            "deactivate_date": q.deactivate_date.isoformat(),
            "response_date": None if a is None else a.response_date.isoformat(),
            "response": None if a is None else a.response,
        }

    @validate_tenant
    @token_required(admin=True)
    def put(self, current_user, tenant_id, question_id):
        args = questionParser.parse_args()
        s = db.session()
        q = db.session.query(Question).filter(
            Question.tenant_id==tenant_id,
            Question.id == question_id,
            ).first()
        q.title = args.title
        q.body = args.body
        q.activate_date = args.activate_date
        q.deactivate_date = args.deactivate_date
        q.answer = args.answer
        s.commit()
        return { "message": "updated" }