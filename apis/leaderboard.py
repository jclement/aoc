from flask_restful import Resource, abort
from .util import validate_tenant


class LeaderboardApi(Resource):

    @validate_tenant
    def get(self, tenant_id):
        return {}
