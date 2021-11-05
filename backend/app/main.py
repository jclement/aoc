
from fastapi import FastAPI, Depends, Request
from fastapi.exceptions import HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import jwt
import datetime
import secrets
from mailgun3 import Mailgun
from validate_email import validate_email
from . import models, schemas, util
from .database import engine, get_db, SessionLocal
from .settings import settings

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# ================== HELPERS ==================


def calculate_score(q, a):
    return 0 if not a else (1 if q.answer == a.response else 0) + a.bonus_points

# ================== AUTHENTICATION HELPERS ==================


oauth2_scheme = OAuth2PasswordBearer("login")


def authenticated_user(token=Depends(oauth2_scheme), db=Depends(get_db)):
    """
    Verify JWT and return authenticated user
    """
    try:
        data = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
    except jwt.InvalidSignatureError:
        raise HTTPException(401)
    user = db.query(models.User).filter(models.User.id == data['id']).first()
    if not user:
        raise HTTPException(401)
    return user


# ================== BOOTSTRAP ADMIN USER ==================

db = SessionLocal()
if db.query(models.User).count() == 0:
    u = models.User()
    u.username = "admin"
    u.email = settings.admin_email
    u.password = util.hash_password(settings.admin_password)
    u.is_admin = True
    db.add(u)
    db.commit()
db.close()

# ================== LOGIN APIS ==================


@app.post("/email_authenicate/initiate", tags=["Login"], response_model=schemas.Status)
async def email_authentication_initiate(request: schemas.InitiateEmailLoginRequest, db=Depends(get_db)):
    """
    Initiate an email-based account creation/signin.  Emails the provided address an activation code/link that they can use to authenticate a browser session.
    """
    if not validate_email(request.email, check_smtp=False):
        return schemas.Status(result=False, message="not a valid email address")
    if settings.restrict_domain:
        if not request.email.endswith(settings.restrict_domain):
            return schemas.Status(result=False, message="not a valid email domain")

    token = secrets.token_hex(32)
    ch = models.Challenge()
    ch.email = request.email
    ch.secret = token
    db.add(ch)
    db.commit()

    if settings.mailgun_apikey:
        mailer = Mailgun(settings.mailgun_domain, settings.mailgun_apikey, settigs.mailgun_pubkey)
        mailer.send_message(
        settings.mail_from,
        [request.email],
        subject='Yo! Authenticate yourself!',
        html=f"Your magic token is <b>{token}</b>",
        )
    return schemas.Status(result=True, message="email sent")


@app.post("/email_authenicate/activate", tags=["Login"])
def email_authentication_activate(request: schemas.ActiveateEmailLoginRequest, db=Depends(get_db)):
    """
    Activate / verify an email-based account creation/signin.  Upon successful validation, will create a new account if one doesn't already exist for that email address.
    """
    tmp = db.query(models.Challenge).filter(
        datetime.datetime.utcnow() < models.Challenge.expires,
        models.Challenge.email == request.email,
        models.Challenge.secret == request.secret,
    ).first()

    if tmp:  # if this record exists, we've got a valid challenge
        user = db.query(models.User).filter(
            models.User.email == request.email).first()

        # create the user if this is the first time seeing them
        if not user:
            user = models.User()
            user.username = request.email
            user.email = request.email
            db.add(user)
            db.commit()

        # generate a token for this new user
        token = jwt.encode({'id': user.id, 'exp': datetime.datetime.utcnow(
        ) + datetime.timedelta(days=30)}, settings.secret_key, "HS256")

        # delete the challenge after use so that it can't be reused
        db.delete(tmp)
        db.commit()
        return {"access_token": token, "token_type": "bearer"}

    raise HTTPException(401)


@app.post("/login", tags=["Login"])
def login(req: Request, form_data: OAuth2PasswordRequestForm = Depends(), db=Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.email == form_data.username).first()
    if user:
        if util.verify_password(user.password, form_data.password):
            token = jwt.encode({'id': user.id, 'exp': datetime.datetime.utcnow(
            ) + datetime.timedelta(days=30)}, settings.secret_key, "HS256")
            return {"access_token": token, "token_type": "bearer"}
    raise HTTPException(401)

@app.post("/fakelogin", tags=["Login"])
def for_the_love_of_god_delete_this_fake_login(req: Request, db=Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.id == 1).first()
    if user:
        token = jwt.encode({'id': user.id, 'exp': datetime.datetime.utcnow(
        ) + datetime.timedelta(days=30)}, settings.secret_key, "HS256")
        return {"access_token": token, "token_type": "bearer"}
    raise HTTPException(401)

@app.get("/login", response_model=schemas.Status, tags=["Login"])
def validate_login_token(token=Depends(oauth2_scheme), db=Depends(get_db)):
    """
    Really quick check to ensure the user's authentication token is valid
    """
    user = None
    try:
        data = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        user = db.query(models.User).filter(
            models.User.id == data['id']).first()
    except:
        pass
    return schemas.Status(
        result=not user is None,
        message="Not logged in" if user is None else "Logged in"
    )

# =================== ME APIS =========================


@app.get("/me", response_model=schemas.User, tags=["Current User"])
def get_current_user_info(user=Depends(authenticated_user)):
    """
    Profile information for the current user
    """
    return schemas.User(
        id=user.id,
        username=user.username,
        is_admin=user.is_admin,
        email=user.email,
    )


@app.get("/me/score", response_model=schemas.Score, tags=["Current User"])
def get_current_user_calculate_score(user=Depends(authenticated_user)):
    """
    Get the current user's score
    """
    tmp = 0
    for r, q in db.query(models.Response, models.Question)\
        .filter(models.Response.user_id == models.User.id)\
        .join(models.Question, models.Question.id == models.Response.question_id)\
            .all():
        tmp += calculate_score(q, r)
    return schemas.Score(score=tmp)


@app.put("/me", response_model=schemas.Status, tags=['Current User'])
def update_current_user_into(info: schemas.WriteableUser, user=Depends(authenticated_user), db=Depends(get_db)):
    '''
    Update the profile for the current user
    '''
    user.username = info.username
    db.commit()
    return schemas.Status(result=True)


@app.put("/me/password", response_model=schemas.Status, tags=['Current User'])
def change_current_user_password(password: str, user=Depends(authenticated_user), db=Depends(get_db)):
    """
    Set a password for the current user
    """
    user.password = util.hash_password(password)
    db.commit()
    return schemas.Status(result=True)

# =================== QUESTION APIS =========================


@app.get("/questions", tags=["Questions"], response_model=List[schemas.QuestionSummary])
def list_all_questions(current_user=Depends(authenticated_user), db=Depends(get_db)):
    """
    Only lists questions the user is allowed to see.
    """
    questions = db.query(models.Question).filter(
        current_user.is_admin or datetime.datetime.utcnow() >= models.Question.activate_date,
    ).order_by(models.Question.activate_date)
    return [schemas.QuestionSummary.createFromOrm(q) for q in questions]


@app.post("/questions", tags=["Questions"], response_model=schemas.QuestionDetail)
def create_new_question(detail: schemas.WritableQuestionDetail, current_user=Depends(authenticated_user), db=Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(400)
    question = models.Question()
    question.title = detail.title
    question.body = detail.body
    question.activate_date = detail.activate_date
    question.deactivate_date = detail.deactivate_date
    db.add(question)
    db.commit()
    return schemas.QuestionDetail.createFromOrm(question)


@app.get("/questions/{question_id:int}", tags=["Questions"], response_model=schemas.QuestionDetail)
def retrieve_question_detail(question_id, current_user=Depends(authenticated_user), db=Depends(get_db)):
    question = db.query(models.Question).filter(
        models.Question.id == question_id,
        current_user.is_admin or datetime.datetime.utcnow() >= models.Question.activate_date,
    ).first()
    if not question:
        raise HTTPException(404)
    return schemas.QuestionDetail.createFromOrm(question)

@app.delete("/questions/{question_id:int}", tags=["Questions"], response_model=schemas.Status)
def delete_question(question_id, current_user=Depends(authenticated_user), db=Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(400)
    question = db.query(models.Question).filter(
        models.Question.id == question_id,
        current_user.is_admin or datetime.datetime.utcnow() >= models.Question.activate_date,
    ).first()
    if not question:
        raise HTTPException(404)
    db.delete(question)
    db.commit()
    return schemas.Status(result=True)


@app.get("/questions/{question_id:int}/answer", tags=["Questions"], response_model=schemas.Answer)
def retrieve_answer(question_id, current_user=Depends(authenticated_user), db=Depends(get_db)):
    """
    Retrieve the answer for a question.  Note that non-admin users may only retrieve answers for completed question
    """
    question = db.query(models.Question).filter(
        models.Question.id == question_id,
        current_user.is_admin or datetime.datetime.utcnow() >= models.Question.activate_date,
    ).first()
    if not (current_user.is_admin or datetime.datetime.utcnow() > question.deactivate_date):
        raise HTTPException(400)
    if not question:
        raise HTTPException(404)
    return schemas.Answer(answer=question.answer)

@app.get("/questions/{question_id:int}/tags", tags=["Questions"], response_model=List[schemas.Tag])
def retrieve_tags_for_question(question_id, current_user=Depends(authenticated_user), db=Depends(get_db)):
    responses = db.query(models.Response).filter(
        models.Response.question_id == question_id,
    ).all()
    counts = {}
    for r in responses:
        for t in r.tags:
            if not t.tag in counts:
                counts[t.tag] = 0
            counts[t.tag]+=1
    return [schemas.Tag(tag=tag, count=count) for tag, count in counts.items()]

@app.put("/questions/{question_id:int}", tags=["Questions"], response_model=schemas.QuestionDetail)
def update_question_detail(question_id, detail: schemas.WritableQuestionDetail, current_user=Depends(authenticated_user), db=Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(400)
    question = db.query(models.Question).filter(
        models.Question.id == question_id,
    ).first()
    if not question:
        raise HTTPException(404)
    question.title = detail.title
    question.body = detail.body
    question.activate_date = detail.activate_date
    question.deactivate_date = detail.deactivate_date
    db.commit()
    return schemas.QuestionDetail.createFromOrm(question)


@app.put("/questions/{question_id:int}/answer", tags=["Questions"], response_model=schemas.Status)
def update_answer(question_id, answer: schemas.Answer, current_user=Depends(authenticated_user), db=Depends(get_db)):
    """
    Set/update the correct answer for a question.  Obviously this is only available to admins.  Not that we don't trust you...
    """
    if not current_user.is_admin:
        raise HTTPException(400)
    question = db.query(models.Question).filter(
        models.Question.id == question_id).first()
    if not question:
        raise HTTPException(404)
    question.answer = answer.answer
    db.commit()
    return schemas.Status(result=True)

# =================== RESPONSE APIS =========================


@app.get("/questions/{question_id:int}/responses", tags=["Response"], response_model=List[schemas.UserResponse])
def retrieve_responses(question_id, current_user=Depends(authenticated_user), db=Depends(get_db)):
    responses = db.query(models.Response, models.User).filter(
        models.Response.question_id == question_id,
    ).join(models.User, models.User.id == models.Response.user_id).all()
    return [schemas.UserResponse(
        user_id = u.id,
        username = u.username,
        email = u.email,
        response = r.response,
        response_date = r.response_date,
        tags = [x.tag for x in r.tags],
    ) for r,u in responses]

@app.get("/questions/{question_id:int}/response", tags=["Response"], response_model=Optional[schemas.Response])
def retrieve_response(question_id, current_user=Depends(authenticated_user), db=Depends(get_db)):
    question = db.query(models.Question).filter(
        models.Question.id == question_id).first()
    if not question:
        raise HTTPException(404)
    resp = db.query(models.Response).filter(
        models.Response.question_id == question_id,
        models.Response.user_id == current_user.id,
    ).first()
    if not resp:
        return None
    return schemas.Response(
        response=resp.response,
        tags=[x.tag for x in resp.tags],
    )


@app.post("/questions/{question_id:int}/response", tags=["Response"], response_model=schemas.Status)
def post_response(question_id, response: schemas.Response, current_user=Depends(authenticated_user), db=Depends(get_db)):
    """
    Post a response to a question

    Requires the question:
    * Exists
    * Is Active
    * Hasn't already been responded to by this user
    """
    question = db.query(models.Question).filter(
        models.Question.id == question_id).first()
    if not question:
        raise HTTPException(404)
    if not question.is_active():
        return schemas.Status(result=False, message="question is not active")
    resp = db.query(models.Response).filter(
        models.Response.question_id == question_id,
        models.Response.user_id == current_user.id,
    ).first()
    if resp:
        return schemas.Status(result=False, message="question has already been responded to")
    resp = models.Response()
    resp.question_id = question_id
    resp.user_id = current_user.id
    resp.response = response.response
    resp.tags = [models.Tag(tag=x) for x in list(dict.fromkeys(response.tags))]
    db.add(resp)
    db.commit()
    return schemas.Status(result=True)


# =================== LEADERBOARD =========================


@app.get("/leaderboard", tags=["Leaderboard"], response_model=List[schemas.LeaderboardEntry])
def retrieve_leaderboard(db=Depends(get_db)):
    """
    Remember the scoreboard on PACMAN?  This is like that.  Only with longer high-score names.
    """
    users = {}
    for u, q, r in db.query(models.User, models.Question, models.Response)\
        .outerjoin(models.Response, models.Response.user_id == models.User.id)\
        .outerjoin(models.Question, models.Question.id == models.Response.question_id)\
            .all():
        if not u.is_admin:
            if not u in users:
                users[u] = 0
            users[u] += calculate_score(q, r)
        else:
            users[u] = 999999
    leader = sorted(users.items(), key=lambda x: x[1])
    leader.reverse()
    return [schemas.LeaderboardEntry(
        user_id=x[0].id,
        username=x[0].username,
        score=x[1],
    ) for x in leader]