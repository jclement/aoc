from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import text, and_
import datetime
from . import db


class Tenant(db.Model):
    id = db.Column(db.String(20), nullable=False,
                   unique=True, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    email_domain = db.Column(db.String(80), unique=False, nullable=True)
    active = db.Column(db.Boolean(), nullable=False)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.String(20), db.ForeignKey(
        'tenant.id'), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    is_admin = db.Column(db.Boolean(), nullable=False, default=False)
    created = db.Column(db.DateTime, nullable=False,
                        default=datetime.datetime.utcnow())


class Challenge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer(), db.ForeignKey('user.id'), nullable=False)
    secret = db.Column(db.String(80), unique=True, nullable=False)
    expires = db.Column(db.DateTime, nullable=False, default=datetime.datetime.utcnow(
    ) + datetime.timedelta(minutes=10))


class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.String(20), db.ForeignKey(
        'tenant.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    body = db.Column(db.String())
    answer = db.Column(db.String())
    activate_date = db.Column(db.DateTime, nullable=False)
    deactivate_date = db.Column(db.DateTime, nullable=False)

    def is_visible(self):
        return datetime.datetime.utcnow() >= self.activate_date

    def is_active(self):
        return \
            datetime.datetime.utcnow() >= self.activate_date and \
            datetime.datetime.utcnow() < self.deactivate_date


class Response(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey(
        'question.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    response = db.Column(db.String())
    bonus_points = db.Column(db.Integer, nullable=False, default=0)
    response_date = db.Column(
        db.DateTime, nullable=False, default=datetime.datetime.utcnow())
    tags = db.relationship("Tag")


class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    response_id = db.Column(db.Integer, db.ForeignKey(
        'response.id'), nullable=False)
    tag = db.Column(db.String(30))
