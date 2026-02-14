from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str
    major: Optional[str] = None
    year: Optional[str] = None
    graduation_year: Optional[int] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    is_tutor: Optional[bool] = False
    gpa: Optional[float] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    avatar_url: Optional[str]
    accepting_connections: Optional[bool]
    tutoring_sessions: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

class CourseResponse(BaseModel):
    id: int
    code: str
    name: str
    department: str
    subject: Optional[str]
    
    class Config:
        from_attributes = True

class HelpRequestCreate(BaseModel):
    course_id: int
    title: str
    description: str
    urgent: bool = False

class HelpRequestResponse(BaseModel):
    id: str
    student_id: str
    course_id: int
    title: str
    description: str
    urgent: bool
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ConnectionCreate(BaseModel):
    target_id: str
    message: Optional[str] = None

class TutorMatchResponse(BaseModel):
    id: str
    tutor_id: str
    match_score: int
    match_reasons: dict
    tutor_name: str
    tutor_gpa: Optional[float]
    
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class DraftMessageRequest(BaseModel):
    target_id: str
    target_type: str
