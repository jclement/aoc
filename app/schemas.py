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
    id: int
    is_admin: bool
    email: str

class LeaderboardEntry(BaseModel):
    user_id: int
    username: str
    score: int

class QuestionSummary(BaseModel):
    id: int
    title: str
    activate_date: datetime.datetime
    deactivate_date: datetime.datetime
    is_active: bool
    is_visible: bool 

    @classmethod
    def createFromOrm(cls, q: models.Question):
        return QuestionSummary(
            id= q.id,
            title = q.title,
            activate_date = q.activate_date,
            deactivate_date = q.activate_date,
            is_active = q.is_active(),
            is_visible = q.is_visible(),
        )

class WritableQuestionDetail(BaseModel):
    title: str
    activate_date: datetime.datetime
    deactivate_date: datetime.datetime
    body: str

class QuestionDetail(WritableQuestionDetail):
    id: int
    is_active: bool
    is_visible: bool 

    @classmethod
    def createFromOrm(cls, q: models.Question):
        return QuestionDetail(
            id= q.id,
            title = q.title,
            activate_date = q.activate_date,
            deactivate_date = q.activate_date,
            is_active = q.is_active(),
            is_visible = q.is_visible(),
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
    user_id: int
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