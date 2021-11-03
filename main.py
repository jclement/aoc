from flask import render_template
from flask_migrate import Migrate

from app import app, api
import apis

from database import db
from database.testdata import create_test_data_if_empty

db.init_app(app)
migrate = Migrate(app, db)

# ====== THROW AWAY INIT THING =========================================


@app.before_first_request
def init_database():
    create_test_data_if_empty()

# ====== WEB PAGE ROUTES =========================================


@app.route('/')
def index():
    return render_template("welcome.html")


@app.route('/<tenant_id>/')
@app.route('/<tenant_id>/<path:path>')
@apis.util.validate_tenant
def tenant_index(tenant_id, path=""):
    return render_template("main.html")


@app.route('/<tenant_id>/leaderboard/')
@apis.util.validate_tenant
def tenant_leader(tenant_id):
    return render_template("leader.html")


# ======= APIs ======================================================
api.add_resource(apis.LoginApi, '/<tenant_id>/api/login')
api.add_resource(apis.MeApi, '/<tenant_id>/api/me')
api.add_resource(apis.LeaderboardApi, '/<tenant_id>/api/leaderboard')
api.add_resource(apis.QuestionsApi, '/<tenant_id>/api/questions')
api.add_resource(apis.QuestionApi,
                 '/<tenant_id>/api/questions/<int:question_id>')
api.add_resource(apis.ResponseApi,
                 '/<tenant_id>/api/questions/<int:question_id>/response')

if __name__ == '__main__':
    app.run(debug=True)
