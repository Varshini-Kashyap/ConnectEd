from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
import models, schemas
from database import get_db, engine
from auth import verify_password, get_password_hash, create_access_token, get_current_user
from ai_service import (
    match_tutors_with_request,
    draft_outreach_message,
    explain_match,
    search_alumni_strict,
    search_alumni_closest_match,
    search_students_keyword_only,
    _query_to_keywords,
)
from matching import compute_career_match, compute_tutor_match
from resume_service import parse_resume, encode_file_to_base64


def _student_alum_dicts(student, alum):
    """Build dicts for compute_career_match and explain_match. Resume from profile_data or user.resume_parsed_text."""
    sp = student.profile_data or {}
    ap = alum.profile_data or {}
    resume_text = sp.get("resume_text", "") or getattr(student, "resume_parsed_text", None) or ""
    student_dict = {
        "major": student.major,
        "year": student.year,
        "company_wishlist": sp.get("target_companies", []),
        "resume_text": resume_text,
    }
    alum_dict = {
        "major": alum.major,
        "company": alum.company,
        "graduation_year": alum.graduation_year,
        "accepting_connections": ap.get("accepting_requests", True),
    }
    return student_dict, alum_dict


def get_cached_career_match_score(db: Session, student_id: str, target_id: str):
    """Return cached match_score or None."""
    row = db.query(models.CareerMatchCache).filter(
        models.CareerMatchCache.student_id == student_id,
        models.CareerMatchCache.target_id == target_id,
    ).first()
    return row.match_score if row else None


def get_or_compute_career_match_score(db: Session, student, alum):
    """Return match_score for (student, alum), from cache or compute once and cache."""
    if not student or not student.profile_data:
        return 50
    cached = get_cached_career_match_score(db, student.id, alum.id)
    if cached is not None:
        return cached
    student_dict, alum_dict = _student_alum_dicts(student, alum)
    score = compute_career_match(student_dict, alum_dict)
    db.add(models.CareerMatchCache(student_id=student.id, target_id=alum.id, match_score=score, reasons=None))
    db.commit()
    return score


def get_or_compute_match_explanation(db: Session, student, target):
    """Return (match_score, reasons) for (student, target), from cache or compute once and cache."""
    student_dict = {
        "major": student.major,
        "interests": (student.profile_data or {}).get("areas_of_interest", ""),
        "resume_text": (student.profile_data or {}).get("resume_text", ""),
    }
    target_dict = {"major": target.major, "job_title": target.job_title, "company": target.company}
    row = db.query(models.CareerMatchCache).filter(
        models.CareerMatchCache.student_id == student.id,
        models.CareerMatchCache.target_id == target.id,
    ).first()
    if row and row.reasons is not None:
        return row.match_score, row.reasons
    # Compute score (use cached if we have it)
    score = get_cached_career_match_score(db, student.id, target.id)
    if score is None:
        s_dict, t_dict = _student_alum_dicts(student, target)
        score = compute_career_match(s_dict, t_dict)
    reasons = explain_match(student_dict, target_dict, score)
    if row:
        row.match_score = score
        row.reasons = reasons
    else:
        db.add(models.CareerMatchCache(student_id=student.id, target_id=target.id, match_score=score, reasons=reasons))
    db.commit()
    return score, reasons


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
        
        if student:
            alum_dict["match_score"] = get_or_compute_career_match_score(db, student, alum)
        else:
            alum_dict["match_score"] = 50
        
        result.append(alum_dict)

    # Optional keyword filter when q provided (no LLM); then always sort by match_score descending
    if q and q.strip():
        keywords = _query_to_keywords(q.strip())
        if keywords:
            combined = lambda r: " ".join([
                str(r.get("name") or ""),
                str(r.get("company") or ""),
                str(r.get("job_title") or ""),
                str(r.get("major") or ""),
                str(r.get("bio") or ""),
            ]).lower()
            result = [r for r in result if any(kw.lower() in combined(r) for kw in keywords)]
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
    """Connection requests (pending where current user is target) and new-message notifications."""
    pending = db.query(models.Connection).filter(
        models.Connection.target_id == user_id,
        models.Connection.status == 'pending'
    ).order_by(models.Connection.created_at.desc()).all()
    connection_requests = []
    for c in pending:
        requester = db.query(models.User).filter(models.User.id == c.requester_id).first()
        if not requester:
            continue
        connection_requests.append({
            "id": c.id,
            "type": "connection_request",
            "requester": {
                "id": requester.id,
                "name": requester.name,
                "email": requester.email,
                "role": requester.role,
                "avatar_url": requester.avatar_url,
                "company": requester.company,
                "job_title": requester.job_title,
                "major": requester.major,
                "year": requester.year,
            },
            "message": c.message,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })

    message_notifs = db.query(models.Notification).filter(
        models.Notification.user_id == user_id,
        models.Notification.type == "new_message"
    ).order_by(models.Notification.created_at.desc()).limit(50).all()
    message_requests = []
    for n in message_notifs:
        sender = db.query(models.User).filter(models.User.id == n.sender_id).first()
        message_requests.append({
            "id": n.id,
            "type": "new_message",
            "preview": n.body or n.title,
            "title": n.title,
            "link": n.link,
            "sender": {"id": sender.id, "name": sender.name, "avatar_url": sender.avatar_url} if sender else None,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        })
    return {"connection_requests": connection_requests, "message_requests": message_requests}


def _query_students_by_keywords_sqlite(db: Session, user_id: str, keywords: List[str]) -> List[models.User]:
    """
    Student search only: query SQLite for students whose hobbies, areas_of_interest,
    looking_for, or courses_taken (in profile_data JSON) match any keyword (LIKE / regex-style).
    """
    if not keywords:
        return db.query(models.User).filter(
            models.User.role == "student",
            models.User.id != user_id,
        ).all()
    like_patterns = ["%" + str(k).strip().lower() + "%" for k in keywords if k and str(k).strip()]
    if not like_patterns:
        return db.query(models.User).filter(
            models.User.role == "student",
            models.User.id != user_id,
        ).all()

    # Build: (json hobbies LIKE p0 OR json areas LIKE p0 OR json looking_for LIKE p0 OR json courses_taken LIKE p0) OR (same for p1) OR ...
    # SQLite json_extract returns text; COALESCE for nulls
    conditions = []
    params = {"uid": user_id}
    for i, pat in enumerate(like_patterns):
        key = f"p{i}"
        params[key] = pat
        conditions.append(
            f"(LOWER(COALESCE(json_extract(profile_data,'$.hobbies'),'')) LIKE :{key} "
            f"OR LOWER(COALESCE(json_extract(profile_data,'$.areas_of_interest'),'')) LIKE :{key} "
            f"OR LOWER(COALESCE(json_extract(profile_data,'$.looking_for'),'')) LIKE :{key} "
            f"OR LOWER(COALESCE(json_extract(profile_data,'$.courses_taken'),'')) LIKE :{key})"
        )
    where_sql = " OR ".join(conditions)
    stmt = text(
        "SELECT id FROM users WHERE role = 'student' AND id != :uid AND (" + where_sql + ")"
    )
    rows = db.execute(stmt, params).fetchall()
    ids = [r[0] for r in rows]
    if not ids:
        return []
    return db.query(models.User).filter(models.User.id.in_(ids)).all()


# UNIFIED NATURAL-LANGUAGE SEARCH (role-based)
@app.get("/api/search")
def natural_language_search(
    q: Optional[str] = None,
    role: str = Query("student", regex="^(student|alumni)$"),
    top_n: int = Query(10, ge=1, le=100),
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Student: Step 1 Extract intent (Ollama/Groq) → Step 2 Search SQLite by keywords (hobbies, interests, courses) → Step 3 Rank → Top N.
    Alumni: unchanged (Groq three-step).
    """
    if role == "student":
        q_clean = (q or "").strip()
        # Empty query: return all students (default dashboard view)
        if not q_clean:
            users = db.query(models.User).filter(
                models.User.role == "student",
                models.User.id != user_id,
            ).order_by(models.User.name).limit(100).all()
            students_list = []
            for u in users:
                profile = u.profile_data or {}
                looking_for = profile.get("looking_for", [])
                looking_for_str = ", ".join(looking_for) if isinstance(looking_for, list) else str(looking_for)
                courses_taken = profile.get("courses_taken", [])
                courses_str = ", ".join(courses_taken) if isinstance(courses_taken, list) else str(courses_taken)
                students_list.append({
                    "id": u.id,
                    "name": u.name,
                    "major": u.major or "",
                    "year": u.year or "",
                    "avatar_url": u.avatar_url,
                    "hobbies": profile.get("hobbies", ""),
                    "areas_of_interest": profile.get("areas_of_interest", ""),
                    "looking_for_str": looking_for_str,
                    "courses_str": courses_str,
                    "gpa": float(u.gpa) if u.gpa else None,
                })
            return students_list

    if not q or not q.strip():
        return []

    if role == "student":
        q_clean = q.strip()
        # Fast path: keyword-only (no LLM). Instant filter + rank by regex match.
        keywords = _query_to_keywords(q_clean)
        if not keywords and q_clean:
            keywords = [q_clean]
        users = _query_students_by_keywords_sqlite(db, user_id, keywords)
        students_list = []
        for u in users:
            profile = u.profile_data or {}
            looking_for = profile.get("looking_for", [])
            looking_for_str = ", ".join(looking_for) if isinstance(looking_for, list) else str(looking_for)
            courses_taken = profile.get("courses_taken", [])
            courses_str = ", ".join(courses_taken) if isinstance(courses_taken, list) else str(courses_taken)
            students_list.append({
                "id": u.id,
                "name": u.name,
                "major": u.major or "",
                "year": u.year or "",
                "avatar_url": u.avatar_url,
                "hobbies": profile.get("hobbies", ""),
                "areas_of_interest": profile.get("areas_of_interest", ""),
                "looking_for_str": looking_for_str,
                "courses_str": courses_str,
                "gpa": float(u.gpa) if u.gpa else None,
            })
        return search_students_keyword_only(q_clean, students_list, top_n=top_n)

    # role == "alumni"
    alumni = db.query(models.User).filter(models.User.role == "alumni").all()
    alumni_list = []
    for alum in alumni:
        profile = alum.profile_data or {}
        bio = profile.get("expertise_areas", "") or profile.get("career_journey", "") or ""
        alumni_list.append({
            "id": alum.id,
            "name": alum.name,
            "company": alum.company or "",
            "job_title": alum.job_title or "",
            "major": alum.major or "",
            "bio": bio,
            "avatar_url": alum.avatar_url,
            "graduation_year": alum.graduation_year,
        })
    result = search_alumni_three_step(q.strip(), alumni_list, top_n=top_n)
    return result


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
def get_help_requests(
    status: Optional[str] = None,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.HelpRequest).filter(models.HelpRequest.student_id == user_id)
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


@app.get("/api/help-requests/{request_id}/matches")
def get_request_matches(
    request_id: str,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return stored tutor matches for a help request. Only the request owner can view."""
    help_request = db.query(models.HelpRequest).filter(
        models.HelpRequest.id == request_id,
        models.HelpRequest.student_id == user_id,
    ).first()
    if not help_request:
        raise HTTPException(status_code=404, detail="Help request not found")
    rows = db.query(models.TutorMatch).filter(
        models.TutorMatch.request_id == request_id
    ).order_by(models.TutorMatch.match_score.desc()).all()
    out = []
    for row in rows:
        tutor = db.query(models.User).filter(models.User.id == row.tutor_id).first()
        if not tutor:
            continue
        reasons = (row.match_reasons or {}).get("reasons") if isinstance(row.match_reasons, dict) else row.match_reasons
        if not isinstance(reasons, list):
            reasons = [str(reasons)] if reasons else []
        out.append({
            "tutor_id": tutor.id,
            "tutor_name": tutor.name,
            "tutor_gpa": float(tutor.gpa) if tutor.gpa else None,
            "avatar_url": tutor.avatar_url,
            "match_score": row.match_score,
            "match_reasons": reasons,
        })
    return out


@app.delete("/api/help-requests/{request_id}")
def delete_help_request(
    request_id: str,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a help request. Only the request owner can delete. Cascades to tutor_matches."""
    help_request = db.query(models.HelpRequest).filter(
        models.HelpRequest.id == request_id,
        models.HelpRequest.student_id == user_id,
    ).first()
    if not help_request:
        raise HTTPException(status_code=404, detail="Help request not found")
    db.delete(help_request)
    db.commit()
    return {"message": "Help request deleted"}


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
    
    requester_dict = {
        "name": student.name,
        "major": student.major or "",
        "year": student.year or "",
    }
    target_dict = {
        "name": target.name,
        "job_title": target.job_title or "",
        "company": target.company or "",
        "major": target.major or "",
        "year": target.year or "",
    }
    message = draft_outreach_message(
        requester_dict, target_dict, data.target_type, requester_role=student.role
    )
    if len(message) > 300:
        message = message[:300]
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
    match_score, reasons = get_or_compute_match_explanation(db, student, target)
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
    connection = db.query(models.Connection).filter(models.Connection.id == message.connection_id).first()
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    if connection.requester_id != user_id and connection.target_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    recipient_id = connection.target_id if connection.requester_id == user_id else connection.requester_id
    sender = db.query(models.User).filter(models.User.id == user_id).first()

    db_message = models.Message(
        connection_id=message.connection_id,
        sender_id=user_id,
        content=message.content
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)

    notif = models.Notification(
        user_id=recipient_id,
        type="new_message",
        title=f"New message from {sender.name if sender else 'Someone'}",
        body=(message.content[:100] + "…") if len(message.content) > 100 else message.content,
        link=message.connection_id,
        sender_id=user_id,
        read=False,
    )
    db.add(notif)
    db.commit()
    return db_message


@app.get("/api/messages/unread-count")
def get_unread_message_count(
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Count messages received by current user that are unread."""
    count = db.query(models.Message).join(
        models.Connection,
        models.Message.connection_id == models.Connection.id
    ).filter(
        (models.Connection.requester_id == user_id) | (models.Connection.target_id == user_id),
        models.Message.sender_id != user_id,
        models.Message.read == False
    ).count()
    return {"count": count}


@app.get("/api/messages/{connection_id}", response_model=List[schemas.MessageResponse])
def get_messages(
    connection_id: str,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    connection = db.query(models.Connection).filter(models.Connection.id == connection_id).first()
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    if connection.requester_id != user_id and connection.target_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    messages = db.query(models.Message).filter(
        models.Message.connection_id == connection_id
    ).order_by(models.Message.created_at).all()

    for m in messages:
        if m.sender_id != user_id and not m.read:
            m.read = True
    db.commit()
    return [schemas.MessageResponse.from_orm(m) for m in messages]

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