from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Enum, Numeric, JSON, Text
from sqlalchemy.orm import relationship
from database import Base
import uuid
from datetime import datetime
import enum

class RoleEnum(enum.Enum):
    student = "student"
    alumni = "alumni"

class ConnectionStatus(enum.Enum):
    pending = "pending"
    accepted = "accepted"
    declined = "declined"

class RequestStatus(enum.Enum):
    open = "open"
    matched = "matched"
    closed = "closed"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    major = Column(String)
    year = Column(String)
    graduation_year = Column(Integer)
    company = Column(String)
    job_title = Column(String)
    location = Column(String)
    bio = Column(Text)
    avatar_url = Column(String)
    is_tutor = Column(Boolean, default=False)
    gpa = Column(Numeric(3, 2))
    accepting_connections = Column(Boolean, default=True)
    company_wishlist = Column(JSON)
    tutoring_sessions = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    student_courses = relationship("StudentCourse", back_populates="user", foreign_keys="StudentCourse.user_id")
    help_requests = relationship("HelpRequest", back_populates="student", foreign_keys="HelpRequest.student_id")

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    subject = Column(String)
    
    student_courses = relationship("StudentCourse", back_populates="course")
    help_requests = relationship("HelpRequest", back_populates="course")

class StudentCourse(Base):
    __tablename__ = "student_courses"
    
    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    course_id = Column(Integer, ForeignKey("courses.id"), primary_key=True)
    grade = Column(String)
    can_tutor = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="student_courses")
    course = relationship("Course", back_populates="student_courses")

class Connection(Base):
    __tablename__ = "connections"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    requester_id = Column(String, ForeignKey("users.id"), nullable=False)
    target_id = Column(String, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(ConnectionStatus), default=ConnectionStatus.pending)
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class HelpRequest(Base):
    __tablename__ = "help_requests"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    urgent = Column(Boolean, default=False)
    status = Column(Enum(RequestStatus), default=RequestStatus.open)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    student = relationship("User", back_populates="help_requests")
    course = relationship("Course", back_populates="help_requests")
    matches = relationship("TutorMatch", back_populates="request")

class TutorMatch(Base):
    __tablename__ = "tutor_matches"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    request_id = Column(String, ForeignKey("help_requests.id"), nullable=False)
    tutor_id = Column(String, ForeignKey("users.id"), nullable=False)
    match_score = Column(Integer, nullable=False)
    match_reasons = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    request = relationship("HelpRequest", back_populates="matches")
