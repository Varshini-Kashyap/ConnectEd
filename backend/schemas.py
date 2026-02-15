from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str

class UserCreate(UserBase):
    password: str
    
    @validator('email')
    def validate_email(cls, v, values):
        if 'role' in values and values['role'] == 'student':
            if not v.endswith('@gmu.edu'):
                raise ValueError('Students must use @gmu.edu email')
        return v

class StudentQuestionnaireUpdate(BaseModel):
    major: str
    minor: Optional[str] = None
    year: str
    courses_taken: List[str]
    career_goals: str
    target_companies: List[str]
    areas_of_interest: str
    skills: List[str]
    hobbies: str
    looking_for: List[str]
    resume_url: Optional[str] = None

class AlumniQuestionnaireUpdate(BaseModel):
    major: str
    minor: Optional[str] = None
    graduation_year: int
    company: str
    job_title: str
    industry: str
    location: str
    expertise: str
    career_journey: str
    hobbies: str
    help_offered: List[str]
    technical_topics: Optional[str] = None
    accepting_connections: bool = True
    response_time: Optional[str] = None
    interaction_mode: Optional[str] = None
    max_connections: Optional[int] = None

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    avatar_url: Optional[str] = None
    major: Optional[str] = None
    year: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    graduation_year: Optional[int] = None
    gpa: Optional[float] = None
    profile_data: dict = {}
    profile_completed: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True

class CourseResponse(BaseModel):
    id: int
    code: str
    name: str
    department: str
    
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

class MessageCreate(BaseModel):
    connection_id: str
    content: str

class MessageResponse(BaseModel):
    id: str
    connection_id: str
    sender_id: str
    content: str
    created_at: datetime
    read: bool
    
    class Config:
        from_attributes = True
