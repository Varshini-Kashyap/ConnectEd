from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas
from database import get_db, engine
from auth import verify_password, get_password_hash, create_access_token, get_current_user
from ai_service import match_tutors_with_request, draft_outreach_message, explain_match, search_alumni_strict, search_alumni_closest_match
from matching import compute_career_match, compute_tutor_match
from resume_service import parse_resume, encode_file_to_base64

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
        role=user.role,
        major="",
        profile_data={},
        avatar_url=f"https://ui-avatars.com/api/?name={user.name.replace(' ', '+')}"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    user_response = schemas.UserResponse.from_orm(db_user)
    user_response.profile_completed = bool(db_user.profile_data)
    
    token = create_access_token({"sub": db_user.id})
    return {"access_token": token, "token_type": "bearer", "user": user_response}

@app.put("/api/auth/complete-profile", response_model=schemas.UserResponse)
def complete_profile(
    questionnaire: dict,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update searchable fields
    if 'major' in questionnaire:
        user.major = questionnaire['major']
    if 'minor' in questionnaire:
        user.minor = questionnaire['minor']
    if 'graduation_year' in questionnaire:
        user.graduation_year = questionnaire['graduation_year']
    if 'company' in questionnaire:
        user.company = questionnaire['company']
    if 'job_title' in questionnaire:
        user.job_title = questionnaire['job_title']
    if 'year' in questionnaire:
        user.year = questionnaire['year']
    
    # Store all data in profile_data JSON
    user.profile_data = questionnaire
    
    db.commit()
    db.refresh(user)
    
    user_response = schemas.UserResponse.from_orm(user)
    user_response.profile_completed = True
    return user_response

@app.post("/api/auth/login", response_model=schemas.Token)
def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_response = schemas.UserResponse.from_orm(user)
    user_response.profile_completed = bool(user.profile_data)
    
    token = create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer", "user": user_response}

@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_me(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_response = schemas.UserResponse.from_orm(user)
    user_response.profile_completed = bool(user.profile_data)
    return user_response

# CAREER STREAM ENDPOINTS
@app.get("/api/alumni")
def get_alumni(
    q: Optional[str] = None,
    major: Optional[str] = None,
    company: Optional[str] = None,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.User).filter(models.User.role == 'alumni')
    # Ignore "All" / empty so search bar works when filters are at default
    if major and str(major).strip().lower() not in ("", "all"):
        query = query.filter(models.User.major.ilike(f"%{major}%"))
    if company and str(company).strip().lower() not in ("", "all"):
        query = query.filter(models.User.company.ilike(f"%{company}%"))
    
    alumni = query.all()
    student = db.query(models.User).filter(models.User.id == user_id).first()
    
    result = []
    for alum in alumni:
        profile = alum.profile_data or {}
        alum_dict = {
            "id": alum.id,
            "name": alum.name,
            "email": alum.email,
            "major": alum.major,
            "company": alum.company,
            "job_title": alum.job_title,
            "location": profile.get("location", ""),
            "bio": profile.get("expertise_areas", ""),
            "avatar_url": alum.avatar_url,
            "graduation_year": alum.graduation_year,
            "accepting_connections": profile.get("accepting_requests", True)
        }
        
        if student and student.profile_data:
            student_dict = {
                "major": student.major,
                "year": student.year,
                "company_wishlist": student.profile_data.get("target_companies", []),
                "resume_text": student.profile_data.get("resume_text", "")
            }
            match_score = compute_career_match(student_dict, alum_dict)
            alum_dict["match_score"] = match_score
        else:
            alum_dict["match_score"] = 50
        
        result.append(alum_dict)
    
    # When q is provided: single-word = keyword + semantic; multi-word = analyze full DB for closest match (ignore profile match %)
    if q and q.strip():
        q_clean = q.strip()
        words = [w for w in q_clean.split() if len(w) >= 2]
        if not words:
            words = [q_clean]

        # Multi-word: analyze full database, return closest matches only (no keyword filter, no match_score)
        if len(words) > 1:
            alumni_for_search = [
                {"id": r["id"], "name": r["name"], "company": r["company"], "job_title": r["job_title"], "major": r["major"], "bio": r["bio"]}
                for r in result
            ]
            search_result = search_alumni_closest_match(q_clean, alumni_for_search, top_n=15)
            id_to_full = {r["id"]: r for r in result}
            result = [id_to_full[s["id"]] for s in search_result if s["id"] in id_to_full]
        else:
            # Single-word: keyword/regex filter then semantic rank
            def text_contains(record: dict, term: str) -> bool:
                term_lower = term.lower()
                for field in ("name", "company", "job_title", "major", "bio"):
                    val = record.get(field) or ""
                    if term_lower in str(val).lower():
                        return True
                return False

            keyword_matches = [r for r in result if text_contains(r, words[0])]
            candidates = keyword_matches if keyword_matches else result
            alumni_for_search = [
                {"id": r["id"], "name": r["name"], "company": r["company"], "job_title": r["job_title"], "major": r["major"], "bio": r["bio"]}
                for r in candidates
            ]
            search_result = search_alumni_strict(q_clean, alumni_for_search, top_n=20)
            id_to_full = {r["id"]: r for r in result}
            semantic_ids = {s["id"] for s in search_result}
            ordered = [id_to_full[s["id"]] for s in search_result if s["id"] in id_to_full]
            for r in keyword_matches:
                if r["id"] not in semantic_ids:
                    ordered.append(r)
            result = ordered
    else:
        result = sorted(result, key=lambda x: x.get("match_score", 0), reverse=True)

    return result

@app.get("/api/alumni/{alumni_id}")
def get_alumni_by_id(alumni_id: str, db: Session = Depends(get_db)):
    alumni = db.query(models.User).filter(
        models.User.id == alumni_id,
        models.User.role == 'alumni'
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
    
    result = []
    for conn in connections:
        other_user_id = conn.target_id if conn.requester_id == user_id else conn.requester_id
        other_user = db.query(models.User).filter(models.User.id == other_user_id).first()
        
        # Skip if user was deleted
        if not other_user:
            continue
            
        result.append({
            "id": conn.id,
            "status": conn.status,
            "message": conn.message,
            "created_at": conn.created_at,
            "is_requester": conn.requester_id == user_id,
            "other_user": {
                "id": other_user.id,
                "name": other_user.name,
                "email": other_user.email,
                "role": other_user.role,
                "avatar_url": other_user.avatar_url,
                "company": other_user.company,
                "job_title": other_user.job_title,
                "major": other_user.major,
                "year": other_user.year
            }
        })
    return result

@app.get("/api/connections/pending")
def get_pending_requests(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    pending = db.query(models.Connection).filter(
        models.Connection.target_id == user_id,
        models.Connection.status == 'pending'
    ).all()
    
    result = []
    for conn in pending:
        requester = db.query(models.User).filter(models.User.id == conn.requester_id).first()
        
        # Skip if requester was deleted
        if not requester:
            continue
            
        result.append({
            "id": conn.id,
            "message": conn.message,
            "created_at": conn.created_at,
            "requester": {
                "id": requester.id,
                "name": requester.name,
                "email": requester.email,
                "role": requester.role,
                "avatar_url": requester.avatar_url,
                "company": requester.company,
                "job_title": requester.job_title,
                "major": requester.major,
                "year": requester.year
            }
        })
    return result

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
    
    connection.status = 'accepted'
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
    
    connection.status = 'declined'
    db.commit()
    return connection

@app.get("/api/notifications")
def get_notifications(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Connection requests (pending where current user is target) and other notifications."""
    pending = db.query(models.Connection).filter(
        models.Connection.target_id == user_id,
        models.Connection.status == 'pending'
    ).order_by(models.Connection.created_at.desc()).all()
    connection_requests = []
    for c in pending:
        requester = db.query(models.User).filter(models.User.id == c.requester_id).first()
        connection_requests.append({
            "id": c.id,
            "type": "connection_request",
            "requester": {"id": requester.id, "name": requester.name, "avatar_url": requester.avatar_url} if requester else None,
            "message": c.message,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })
    return {"connection_requests": connection_requests, "message_requests": []}

# STUDENT STREAM ENDPOINTS
@app.get("/api/tutors")
def get_tutors(
    course: Optional[int] = None,
    subject: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.User).filter(models.User.role == 'student')
    tutors = query.all()
    
    result = []
    for tutor in tutors:
        if not (tutor.profile_data or {}).get('is_tutor'):
            continue
            
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
        
        profile = tutor.profile_data or {}
        result.append({
            "id": tutor.id,
            "name": tutor.name,
            "major": tutor.major,
            "year": tutor.year,
            "gpa": float(tutor.gpa) if tutor.gpa else None,
            "bio": profile.get("areas_of_interest", ""),
            "hobbies": profile.get("hobbies", ""),
            "avatar_url": tutor.avatar_url,
            "tutoring_sessions": 0,
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
        query = query.filter(models.HelpRequest.status == status)
    return query.order_by(models.HelpRequest.created_at.desc()).all()

@app.post("/api/help-requests/{request_id}/match")
def match_request(request_id: str, db: Session = Depends(get_db)):
    help_request = db.query(models.HelpRequest).filter(models.HelpRequest.id == request_id).first()
    if not help_request:
        raise HTTPException(status_code=404, detail="Help request not found")
    
    tutors = db.query(models.User, models.StudentCourse).join(
        models.StudentCourse, models.User.id == models.StudentCourse.user_id
    ).filter(
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
            "bio": user.profile_data.get("areas_of_interest", "") if user.profile_data else ""
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
    
    student_profile = student.profile_data or {}
    target_profile = target.profile_data or {}
    
    student_dict = {
        "major": student.major, 
        "interests": student_profile.get("areas_of_interest", ""),
        "resume_text": student_profile.get("resume_text", "")
    }
    target_dict = {"major": target.major, "job_title": target.job_title, "company": target.company}
    
    match_score = compute_career_match(
        {
            "major": student.major, 
            "year": student.year, 
            "company_wishlist": student_profile.get("target_companies", []),
            "resume_text": student_profile.get("resume_text", "")
        },
        {"major": target.major, "company": target.company, "graduation_year": target.graduation_year, "accepting_connections": target_profile.get("accepting_requests", True)}
    )
    
    reasons = explain_match(student_dict, target_dict, match_score)
    return {"match_score": match_score, "reasons": reasons}

@app.get("/")
def root():
    return {"message": "ConnectEd API - GMU Student Connection Platform"}

# MESSAGE ENDPOINTS
@app.get("/api/connections/accepted")
def get_accepted_connections(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    connections = db.query(models.Connection).filter(
        ((models.Connection.requester_id == user_id) | (models.Connection.target_id == user_id)),
        models.Connection.status == 'accepted'
    ).all()
    
    result = []
    for conn in connections:
        other_user_id = conn.target_id if conn.requester_id == user_id else conn.requester_id
        other_user = db.query(models.User).filter(models.User.id == other_user_id).first()
        
        if not other_user:
            continue
        
        result.append({
            "id": conn.id,
            "other_user": {
                "id": other_user.id,
                "name": other_user.name,
                "avatar_url": other_user.avatar_url,
                "company": other_user.company,
                "job_title": other_user.job_title
            }
        })
    return result

@app.post("/api/messages")
def send_message(
    message: schemas.MessageCreate,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify connection exists and user is part of it
    connection = db.query(models.Connection).filter(models.Connection.id == message.connection_id).first()
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    if connection.requester_id != user_id and connection.target_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_message = models.Message(
        connection_id=message.connection_id,
        sender_id=user_id,
        content=message.content
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@app.get("/api/messages/{connection_id}")
def get_messages(
    connection_id: str,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify connection exists and user is part of it
    connection = db.query(models.Connection).filter(models.Connection.id == connection_id).first()
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    if connection.requester_id != user_id and connection.target_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    messages = db.query(models.Message).filter(
        models.Message.connection_id == connection_id
    ).order_by(models.Message.created_at).all()
    
    return messages

# RESUME UPLOAD ENDPOINT
@app.post("/api/users/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validate file type
    allowed_types = ['.pdf', '.docx', '.txt']
    if not any(file.filename.lower().endswith(ext) for ext in allowed_types):
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and TXT files are allowed")
    
    # Read file content
    content = await file.read()
    
    # Parse resume text
    parsed_text = parse_resume(content, file.filename)
    
    # Encode to base64 for blob storage
    encoded_content = encode_file_to_base64(content)
    
    # Store in database
    user.resume = encoded_content
    user.resume_filename = file.filename
    user.resume_parsed_text = parsed_text
    
    # Also store in profile_data JSON
    profile_data = user.profile_data or {}
    profile_data['resume_filename'] = file.filename
    profile_data['resume_text'] = parsed_text
    user.profile_data = profile_data
    
    db.commit()
    
    return {
        "message": "Resume uploaded successfully",
        "filename": file.filename,
        "parsed_length": len(parsed_text)
    }

@app.get("/api/users/resume")
def get_resume(
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.resume:
        raise HTTPException(status_code=404, detail="No resume uploaded")
    
    return {
        "filename": user.resume_filename,
        "parsed_text": user.resume_parsed_text
    }