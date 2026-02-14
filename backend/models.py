from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, JSON, Float, CheckConstraint
from sqlalchemy.orm import relationship
from database import Base
import uuid
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    # Core Identity
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    avatar_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Searchable Fields (for fast SQL queries)
    major = Column(String, nullable=False)
    minor = Column(String)
    
    # Alumni-specific searchable
    company = Column(String)
    job_title = Column(String)
    graduation_year = Column(Integer)
    
    # Student-specific searchable
    year = Column(String)
    gpa = Column(Float)
    
    # ALL QUESTIONNAIRE DATA as JSON (LLM-ready)
    profile_data = Column(JSON, nullable=False, default=dict)
    
    # AI-Generated (cached)
    profile_summary = Column(Text)
    last_ai_update = Column(DateTime)
    
    # Relationships
    student_courses = relationship("StudentCourse", back_populates="user", cascade="all, delete-orphan")
    help_requests = relationship("HelpRequest", back_populates="student", cascade="all, delete-orphan")
    
    __table_args__ = (
        CheckConstraint("role IN ('student', 'alumni')", name='check_role'),
    )

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    
    student_courses = relationship("StudentCourse", back_populates="course")
    help_requests = relationship("HelpRequest", back_populates="course")

class StudentCourse(Base):
    __tablename__ = "student_courses"
    
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    course_id = Column(Integer, ForeignKey("courses.id"), primary_key=True)
    grade = Column(String)
    can_tutor = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="student_courses")
    course = relationship("Course", back_populates="student_courses")

class Connection(Base):
    __tablename__ = "connections"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    requester_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, default='pending')
    message = Column(Text)
    ai_drafted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        CheckConstraint("status IN ('pending', 'accepted', 'declined')", name='check_status'),
    )

class HelpRequest(Base):
    __tablename__ = "help_requests"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    urgent = Column(Boolean, default=False)
    status = Column(String, default='open')
    created_at = Column(DateTime, default=datetime.utcnow)
    
    student = relationship("User", back_populates="help_requests")
    course = relationship("Course", back_populates="help_requests")
    matches = relationship("TutorMatch", back_populates="request", cascade="all, delete-orphan")
    
    __table_args__ = (
        CheckConstraint("status IN ('open', 'matched', 'closed')", name='check_request_status'),
    )

class TutorMatch(Base):
    __tablename__ = "tutor_matches"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    request_id = Column(String, ForeignKey("help_requests.id", ondelete="CASCADE"), nullable=False)
    tutor_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    match_score = Column(Integer, nullable=False)
    match_reasons = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    request = relationship("HelpRequest", back_populates="matches")
