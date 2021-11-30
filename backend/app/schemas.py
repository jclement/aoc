from pydantic import BaseModel
from typing import Optional,List
import datetime
from . import models
from sqlalchemy.sql.sqltypes import String

class Status(BaseModel):
    """
    ISO-9746 Standard Response Object, at your service
    """
    result: bool
    message: Optional[str] = ""

class WriteableUser(BaseModel):
    username: str

class User(WriteableUser):
    id: str
    is_admin: bool
    email: str

class WriteableComment(BaseModel):
    comment: str

class Comment(WriteableComment):
    id: str
    comment: str
    comment_date: datetime.datetime
    user_id: str
    username: str

class LeaderboardEntry(BaseModel):
    user_id: str
    username: str
    is_admin: bool
    email: str
    score: int

class QuestionSummary(BaseModel):
    id: str
    title: str
    activate_date: datetime.datetime
    deactivate_date: datetime.datetime
    is_active: bool
    is_visible: bool
    is_complete: bool

    @classmethod
    def createFromOrm(cls, q: models.Question):
        return QuestionSummary(
            id= q.id,
            title = q.title,
            activate_date = q.activate_date,
            deactivate_date = q.deactivate_date,
            is_active = q.is_active(),
            is_visible = q.is_visible(),
            is_complete = q.is_complete(),
        )

class WritableQuestionDetail(BaseModel):
    title: str
    activate_date: datetime.datetime
    deactivate_date: datetime.datetime
    body: str

class QuestionDetail(WritableQuestionDetail):
    id: str
    is_active: bool
    is_visible: bool
    is_complete: bool

    @classmethod
    def createFromOrm(cls, q: models.Question):
        return QuestionDetail(
            id= q.id,
            title = q.title,
            activate_date = q.activate_date,
            deactivate_date = q.deactivate_date,
            is_active = q.is_active(),
            is_visible = q.is_visible(),
            is_complete = q.is_complete(),
            body = q.body,
        )

class Answer(BaseModel):
    answer: Optional[str]

class Score(BaseModel):
    score: int

class Response(BaseModel):
    response: str
    tags: List[str]

class UserResponse(Response):
    user_id: str
    username: str
    email: str
    response_date: datetime.datetime

class InitiateEmailLoginRequest(BaseModel):
    email: str

class ActiveateEmailLoginRequest(BaseModel):
    email: str
    secret: str

class Tag(BaseModel):
    tag: str
    count: int
