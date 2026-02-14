from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas
from database import get_db, engine
from auth import verify_password, get_password_hash, create_access_token, get_current_user
from ai_service import match_tutors_with_request, draft_outreach_message, explain_match
from matching import compute_career_match, compute_tutor_match

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ConnectEd API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AUTHENTICATION ENDPOINTS
@app.post("/api/auth/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = models.User(
        email=user.email,
        password_hash=get_password_hash(user.password),
        name=user.name,
        role=models.RoleEnum[user.role],
        major=user.major,
        year=user.year,
        graduation_year=user.graduation_year,
        company=user.company,
        job_title=user.job_title,
        location=user.location,
        bio=user.bio,
        is_tutor=user.is_tutor,
        gpa=user.gpa,
        avatar_url=f"https://ui-avatars.com/api/?name={user.name.replace(' ', '+')}"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    token = create_access_token({"sub": db_user.id})
    return {"access_token": token, "token_type": "bearer", "user": db_user}

@app.post("/api/auth/login", response_model=schemas.Token)
def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer", "user": user}

@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_me(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# CAREER STREAM ENDPOINTS
@app.get("/api/alumni")
def get_alumni(
    major: Optional[str] = None,
    company: Optional[str] = None,
    location: Optional[str] = None,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.User).filter(models.User.role == models.RoleEnum.alumni)
    
    if major:
        query = query.filter(models.User.major.ilike(f"%{major}%"))
    if company:
        query = query.filter(models.User.company.ilike(f"%{company}%"))
    if location:
        query = query.filter(models.User.location.ilike(f"%{location}%"))
    
    alumni = query.all()
    student = db.query(models.User).filter(models.User.id == user_id).first()
    
    result = []
    for alum in alumni:
        alum_dict = {
            "id": alum.id,
            "name": alum.name,
            "email": alum.email,
            "major": alum.major,
            "company": alum.company,
            "job_title": alum.job_title,
            "location": alum.location,
            "bio": alum.bio,
            "avatar_url": alum.avatar_url,
            "graduation_year": alum.graduation_year,
            "accepting_connections": alum.accepting_connections
        }
        
        if student:
            student_dict = {
                "major": student.major,
                "year": student.year,
                "company_wishlist": student.company_wishlist or []
            }
            match_score = compute_career_match(student_dict, alum_dict)
            alum_dict["match_score"] = match_score
        
        result.append(alum_dict)
    
    return sorted(result, key=lambda x: x.get("match_score", 0), reverse=True)

@app.get("/api/alumni/{alumni_id}")
def get_alumni_by_id(alumni_id: str, db: Session = Depends(get_db)):
    alumni = db.query(models.User).filter(
        models.User.id == alumni_id,
        models.User.role == models.RoleEnum.alumni
    ).first()
    if not alumni:
        raise HTTPException(status_code=404, detail="Alumni not found")
    return alumni

@app.post("/api/connections")
def create_connection(
    connection: schemas.ConnectionCreate,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_connection = models.Connection(
        requester_id=user_id,
        target_id=connection.target_id,
        message=connection.message
    )
    db.add(db_connection)
    db.commit()
    db.refresh(db_connection)
    return db_connection

@app.get("/api/connections/me")
def get_my_connections(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    connections = db.query(models.Connection).filter(
        (models.Connection.requester_id == user_id) | (models.Connection.target_id == user_id)
    ).all()
    return connections

@app.put("/api/connections/{connection_id}/accept")
def accept_connection(
    connection_id: str,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    connection = db.query(models.Connection).filter(models.Connection.id == connection_id).first()
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    if connection.target_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    connection.status = models.ConnectionStatus.accepted
    db.commit()
    return connection

@app.put("/api/connections/{connection_id}/decline")
def decline_connection(
    connection_id: str,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    connection = db.query(models.Connection).filter(models.Connection.id == connection_id).first()
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    if connection.target_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    connection.status = models.ConnectionStatus.declined
    db.commit()
    return connection

# STUDENT STREAM ENDPOINTS
@app.get("/api/tutors")
def get_tutors(
    course: Optional[int] = None,
    subject: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.User).filter(models.User.is_tutor == True)
    tutors = query.all()
    
    result = []
    for tutor in tutors:
        courses = db.query(models.StudentCourse, models.Course).join(
            models.Course
        ).filter(
            models.StudentCourse.user_id == tutor.id,
            models.StudentCourse.can_tutor == True
        ).all()
        
        tutor_courses = [{"course_id": sc.course_id, "code": c.code, "grade": sc.grade, "can_tutor": sc.can_tutor} 
                        for sc, c in courses]
        
        if course and course not in [tc["course_id"] for tc in tutor_courses]:
            continue
        if subject and not any(subject.lower() in c.department.lower() for sc, c in courses):
            continue
        
        result.append({
            "id": tutor.id,
            "name": tutor.name,
            "major": tutor.major,
            "year": tutor.year,
            "gpa": float(tutor.gpa) if tutor.gpa else None,
            "bio": tutor.bio,
            "avatar_url": tutor.avatar_url,
            "tutoring_sessions": tutor.tutoring_sessions,
            "courses": tutor_courses
        })
    
    return result

@app.post("/api/help-requests", response_model=schemas.HelpRequestResponse)
def create_help_request(
    request: schemas.HelpRequestCreate,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_request = models.HelpRequest(
        student_id=user_id,
        course_id=request.course_id,
        title=request.title,
        description=request.description,
        urgent=request.urgent
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

@app.get("/api/help-requests", response_model=List[schemas.HelpRequestResponse])
def get_help_requests(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.HelpRequest)
    if status:
        query = query.filter(models.HelpRequest.status == models.RequestStatus[status])
    return query.order_by(models.HelpRequest.created_at.desc()).all()

@app.post("/api/help-requests/{request_id}/match")
def match_request(request_id: str, db: Session = Depends(get_db)):
    help_request = db.query(models.HelpRequest).filter(models.HelpRequest.id == request_id).first()
    if not help_request:
        raise HTTPException(status_code=404, detail="Help request not found")
    
    tutors = db.query(models.User, models.StudentCourse).join(
        models.StudentCourse, models.User.id == models.StudentCourse.user_id
    ).filter(
        models.User.is_tutor == True,
        models.StudentCourse.course_id == help_request.course_id,
        models.StudentCourse.can_tutor == True
    ).all()
    
    if not tutors:
        return []
    
    course = db.query(models.Course).filter(models.Course.id == help_request.course_id).first()
    tutors_data = [
        {
            "id": user.id,
            "name": user.name,
            "gpa": user.gpa,
            "grade": sc.grade,
            "bio": user.bio or ""
        }
        for user, sc in tutors
    ]
    
    request_data = {
        "title": help_request.title,
        "description": help_request.description,
        "urgent": help_request.urgent
    }
    
    course_data = {"code": course.code, "name": course.name}
    
    matches = match_tutors_with_request(request_data, tutors_data, course_data)
    
    for match in matches:
        existing = db.query(models.TutorMatch).filter(
            models.TutorMatch.request_id == request_id,
            models.TutorMatch.tutor_id == match["tutor_id"]
        ).first()
        
        if not existing:
            db_match = models.TutorMatch(
                request_id=request_id,
                tutor_id=match["tutor_id"],
                match_score=match["match_score"],
                match_reasons={"reasons": match["reasons"]}
            )
            db.add(db_match)
    
    db.commit()
    
    result = []
    for match in matches:
        tutor = db.query(models.User).filter(models.User.id == match["tutor_id"]).first()
        result.append({
            "tutor_id": match["tutor_id"],
            "tutor_name": tutor.name,
            "tutor_gpa": float(tutor.gpa) if tutor.gpa else None,
            "match_score": match["match_score"],
            "match_reasons": match["reasons"]
        })
    
    return result

@app.get("/api/courses", response_model=List[schemas.CourseResponse])
def get_courses(db: Session = Depends(get_db)):
    return db.query(models.Course).all()

# AI-POWERED ENDPOINTS
@app.post("/api/ai/draft-message")
def ai_draft_message(
    data: schemas.DraftMessageRequest,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(models.User).filter(models.User.id == user_id).first()
    target = db.query(models.User).filter(models.User.id == data.target_id).first()
    
    if not student or not target:
        raise HTTPException(status_code=404, detail="User not found")
    
    student_dict = {
        "name": student.name,
        "major": student.major,
        "year": student.year
    }
    
    target_dict = {
        "name": target.name,
        "job_title": target.job_title,
        "company": target.company,
        "major": target.major
    }
    
    message = draft_outreach_message(student_dict, target_dict, data.target_type)
    return {"message": message}

@app.get("/api/ai/match-explanation/{target_id}")
def ai_match_explanation(
    target_id: str,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(models.User).filter(models.User.id == user_id).first()
    target = db.query(models.User).filter(models.User.id == target_id).first()
    
    if not student or not target:
        raise HTTPException(status_code=404, detail="User not found")
    
    student_dict = {"major": student.major, "interests": student.bio}
    target_dict = {"major": target.major, "job_title": target.job_title, "company": target.company}
    
    match_score = compute_career_match(
        {"major": student.major, "year": student.year, "company_wishlist": student.company_wishlist or []},
        {"major": target.major, "company": target.company, "graduation_year": target.graduation_year, "accepting_connections": target.accepting_connections}
    )
    
    reasons = explain_match(student_dict, target_dict, match_score)
    return {"match_score": match_score, "reasons": reasons}

@app.get("/")
def root():
    return {"message": "ConnectEd API - GMU Student Connection Platform"}
