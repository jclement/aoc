from flask_restful import Resource, abort
from sqlalchemy import and_
from .util import validate_tenant,score
from database.models import User, Question, Response
from database import db


class LeaderboardApi(Resource):

    @validate_tenant
    def get(self, tenant_id):
        users = {}
        for u,q,r in db.session.query(User, Question, Response)\
            .filter(User.tenant_id == tenant_id)\
            .outerjoin(Question, Question.tenant_id == User.tenant_id)\
            .outerjoin(Response, and_(Question.id == Response.question_id, Response.user_id == User.id))\
            .all():
            if not u.is_admin:
                if not u in users:
                    users[u] = 0
                users[u] += score(q,r)
            leader = sorted(users.items(), key=lambda x:x[1])
        return {
            "leaderboard": [{"id": x[0].id, "username":x[0].username, "score": x[1]} for x in leader]
        } 
