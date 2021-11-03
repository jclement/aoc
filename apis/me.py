from flask_restful import Resource, abort
from .util import validate_tenant, token_required

class MeApi(Resource):

    @validate_tenant
    @token_required
    def get(self, current_user, tenant_id):
        return {}

    @validate_tenant
    @token_required
    def put(self, current_user, tenant_id):
        return {}




