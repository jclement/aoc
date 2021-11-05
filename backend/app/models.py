from .database import Base
from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
import datetime


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password = Column(String(200))
    is_admin = Column(Boolean(), nullable=False, default=False)
    created = Column(DateTime, nullable=False,
                        default=datetime.datetime.utcnow())

class Challenge(Base):
    __tablename__ = 'challenges'
    id = Column(Integer, primary_key=True)
    email = Column(String(120), nullable=False)
    secret = Column(String(80), unique=True, nullable=False)
    expires = Column(DateTime, nullable=False, default=datetime.datetime.utcnow(
    ) + datetime.timedelta(minutes=10))


class Question(Base):
    __tablename__ = 'questions'
    id = Column(Integer, primary_key=True)
    title = Column(String(100), nullable=False)
    body = Column(String())
    answer = Column(String())
    activate_date = Column(DateTime, nullable=False)
    deactivate_date = Column(DateTime, nullable=False)

    def is_visible(self):
        return datetime.datetime.utcnow() >= self.activate_date

    def is_active(self):
        return \
            datetime.datetime.utcnow() >= self.activate_date and \
            datetime.datetime.utcnow() < self.deactivate_date


class Response(Base):
    __tablename__ = 'responses'
    id = Column(Integer, primary_key=True)
    question_id = Column(Integer, ForeignKey('questions.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    response = Column(String())
    bonus_points = Column(Integer, nullable=False, default=0)
    response_date = Column(
        DateTime, nullable=False, default=datetime.datetime.utcnow())
    tags = relationship("Tag")

class Tag(Base):
    __tablename__ = 'tags'
    id = Column(Integer, primary_key=True)
    response_id = Column(Integer, ForeignKey(
        'responses.id'), nullable=False)
    tag = Column(String(30))