from database import SessionLocal, Base, engine
from models import User, Course, StudentCourse, HelpRequest
from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_data():
    # Create all tables first
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Clear existing data
    try:
        db.query(HelpRequest).delete()
        db.query(StudentCourse).delete()
        db.query(User).delete()
        db.query(Course).delete()
        db.commit()
    except:
        db.rollback()
    
    # Create courses
    courses_data = [
        ("CS 110", "Essentials of Computer Science", "CS"),
        ("CS 112", "Introduction to Computer Programming", "CS"),
        ("CS 211", "Object Oriented Programming", "CS"),
        ("CS 262", "Introduction to Low-level Programming", "CS"),
        ("CS 310", "Data Structures", "CS"),
        ("CS 321", "Software Engineering", "CS"),
        ("CS 330", "Formal Methods and Models", "CS"),
        ("CS 367", "Computer Systems and Programming", "CS"),
        ("CS 471", "Operating Systems", "CS"),
        ("CS 483", "Analysis of Algorithms", "CS"),
        ("CS 465", "Computer Systems Architecture", "CS"),
        ("CS 584", "Theory of Computation", "CS"),
        ("MATH 113", "Analytic Geometry and Calculus I", "MATH"),
        ("MATH 114", "Analytic Geometry and Calculus II", "MATH"),
        ("MATH 203", "Linear Algebra", "MATH"),
        ("STAT 344", "Probability and Statistics", "STAT"),
        ("IT 341", "IT Project Management", "IT"),
        ("SYST 460", "Systems Integration", "SYST"),
        ("CYSE 200", "Introduction to Cybersecurity", "CYSE"),
        ("CYSE 330", "Security Fundamentals", "CYSE"),
    ]
    
    courses = []
    for code, name, dept in courses_data:
        course = Course(code=code, name=name, department=dept)
        db.add(course)
        courses.append(course)
    db.commit()
    
    # Create 12 ALUMNI
    alumni_data = [
        {
            "name": "Priya Sharma",
            "email": "priya.sharma@gmail.com",
            "major": "Computer Science",
            "graduation_year": 2019,
            "company": "Google",
            "job_title": "Senior Software Engineer",
            "profile_data": {
                "industry": "Technology",
                "location": "Mountain View, CA",
                "expertise_areas": "Backend systems, Kubernetes, Go, distributed systems, microservices architecture",
                "career_journey": "Started as SWE at startup, moved to Google in 2021. Now lead backend infrastructure for Google Cloud",
                "hobbies": "Rock climbing, cooking Indian food, volunteering at Code.org",
                "help_offered": ["Career guidance and industry insights", "Technical interview preparation", "System design mentorship"],
                "specific_topics": "Kubernetes, Go programming, distributed systems, cloud architecture",
                "accepting_requests": True,
                "preferred_response_time": "Within 24 hours",
                "preferred_interaction": "Virtual calls",
                "max_connections_per_month": 10
            }
        },
        {
            "name": "Marcus Johnson",
            "email": "marcus.j@amazon.com",
            "major": "Computer Science",
            "graduation_year": 2016,
            "company": "Amazon",
            "job_title": "Principal Engineer",
            "profile_data": {
                "industry": "Technology",
                "location": "Seattle, WA",
                "expertise_areas": "Machine learning infrastructure, Python, AWS, TensorFlow, MLOps",
                "career_journey": "Built ML platforms at 2 startups before joining AWS AI Labs. Focus on scalable ML systems",
                "hobbies": "Basketball, chess, mentoring at local bootcamps",
                "help_offered": ["Career guidance and industry insights", "Technical interview preparation", "Specific technical mentorship"],
                "specific_topics": "AWS ML services, TensorFlow, Python best practices, ML system design",
                "accepting_requests": True,
                "preferred_response_time": "2-3 days",
                "preferred_interaction": "Any",
                "max_connections_per_month": 15
            }
        },
        {
            "name": "Elena Rodriguez",
            "email": "elena.r@microsoft.com",
            "major": "Information Systems",
            "graduation_year": 2018,
            "company": "Microsoft",
            "job_title": "Product Manager",
            "profile_data": {
                "industry": "Technology",
                "location": "Redmond, WA",
                "expertise_areas": "Product strategy, Azure, agile methodologies, stakeholder management, roadmap planning",
                "career_journey": "Started as BA, transitioned to PM. Led 3 major Azure features",
                "hobbies": "Salsa dancing, hiking, reading sci-fi novels",
                "help_offered": ["Career guidance and industry insights", "Resume and cover letter reviews", "Behavioral interview preparation"],
                "specific_topics": "Product management transition, Azure ecosystem, agile practices",
                "accepting_requests": True,
                "preferred_response_time": "Within 24 hours",
                "preferred_interaction": "Coffee chats",
                "max_connections_per_month": 8
            }
        },
        {
            "name": "David Chen",
            "email": "david.chen@meta.com",
            "major": "Computer Science",
            "graduation_year": 2020,
            "company": "Meta",
            "job_title": "Software Engineer",
            "profile_data": {
                "industry": "Technology",
                "location": "Menlo Park, CA",
                "expertise_areas": "React, GraphQL, mobile development, frontend architecture, performance optimization",
                "career_journey": "Joined Meta as new grad. Built features for Instagram with 2B users",
                "hobbies": "Photography, guitar, travel blogging",
                "help_offered": ["Career guidance and industry insights", "Technical interview preparation", "Specific technical mentorship"],
                "specific_topics": "React best practices, GraphQL, mobile web, frontend performance",
                "accepting_requests": True,
                "preferred_response_time": "Within 24 hours",
                "preferred_interaction": "Virtual calls",
                "max_connections_per_month": 12
            }
        },
        {
            "name": "Sarah Williams",
            "email": "sarah.w@capitalone.com",
            "major": "Data Science",
            "graduation_year": 2017,
            "company": "Capital One",
            "job_title": "Lead Data Scientist",
            "profile_data": {
                "industry": "Finance",
                "location": "McLean, VA",
                "expertise_areas": "Machine learning, fraud detection, Python, SQL, model deployment, A/B testing",
                "career_journey": "Started in banking analytics, now lead ML team of 5 at Capital One",
                "hobbies": "Yoga, pottery, board games",
                "help_offered": ["Career guidance and industry insights", "Technical interview preparation", "Specific technical mentorship"],
                "specific_topics": "Data science in finance, ML model deployment, Python for data science",
                "accepting_requests": True,
                "preferred_response_time": "2-3 days",
                "preferred_interaction": "Email advice",
                "max_connections_per_month": 10
            }
        },
        {
            "name": "Raj Patel",
            "email": "raj.patel@deloitte.com",
            "major": "Information Systems",
            "graduation_year": 2019,
            "company": "Deloitte",
            "job_title": "Senior Consultant",
            "profile_data": {
                "industry": "Consulting",
                "location": "Arlington, VA",
                "expertise_areas": "Cloud migration, SAP, digital transformation, client management, project leadership",
                "career_journey": "Helped 15+ Fortune 500 companies migrate to cloud. Promoted to senior in 3 years",
                "hobbies": "Cricket, cooking, traveling",
                "help_offered": ["Career guidance and industry insights", "Resume and cover letter reviews", "Networking strategies and tips"],
                "specific_topics": "Consulting career path, cloud migration strategies, client management",
                "accepting_requests": True,
                "preferred_response_time": "Within 24 hours",
                "preferred_interaction": "Coffee chats",
                "max_connections_per_month": 5
            }
        },
        {
            "name": "Amy Liu",
            "email": "amy.liu@apple.com",
            "major": "Computer Science",
            "graduation_year": 2018,
            "company": "Apple",
            "job_title": "iOS Engineer",
            "profile_data": {
                "industry": "Technology",
                "location": "Cupertino, CA",
                "expertise_areas": "Swift, UIKit, SwiftUI, iOS performance optimization, mobile architecture",
                "career_journey": "Worked on 3 indie apps before Apple. Now on core iOS team",
                "hobbies": "Painting, running marathons, coffee enthusiast",
                "help_offered": ["Career guidance and industry insights", "Technical interview preparation", "Specific technical mentorship"],
                "specific_topics": "iOS development, Swift, mobile app architecture, App Store optimization",
                "accepting_requests": True,
                "preferred_response_time": "2-3 days",
                "preferred_interaction": "Virtual calls",
                "max_connections_per_month": 8
            }
        },
        {
            "name": "James Miller",
            "email": "james.miller@accenture.com",
            "major": "Cyber Security Engineering",
            "graduation_year": 2016,
            "company": "Accenture",
            "job_title": "Technology Architect",
            "profile_data": {
                "industry": "Consulting",
                "location": "Washington, DC",
                "expertise_areas": "Security architecture, cloud security, compliance, penetration testing, zero trust",
                "career_journey": "Started in cybersecurity consulting, now design secure systems for Fortune 100",
                "hobbies": "Mountain biking, woodworking, homebrewing",
                "help_offered": ["Career guidance and industry insights", "Technical interview preparation", "Specific technical mentorship"],
                "specific_topics": "Cybersecurity certifications, cloud security, security architecture",
                "accepting_requests": True,
                "preferred_response_time": "Within 24 hours",
                "preferred_interaction": "Any",
                "max_connections_per_month": 10
            }
        },
        {
            "name": "Natasha Kumar",
            "email": "natasha.k@stripe.com",
            "major": "Computer Science",
            "graduation_year": 2021,
            "company": "Stripe",
            "job_title": "Backend Engineer",
            "profile_data": {
                "industry": "Technology",
                "location": "San Francisco, CA",
                "expertise_areas": "Payments infrastructure, Ruby, distributed systems, APIs, database design",
                "career_journey": "Joined Stripe as new grad. Built features processing $50B annually",
                "hobbies": "Stand-up comedy, baking, playing piano",
                "help_offered": ["Career guidance and industry insights", "Resume and cover letter reviews", "Technical interview preparation"],
                "specific_topics": "Backend engineering, API design, distributed systems, Ruby",
                "accepting_requests": True,
                "preferred_response_time": "Within 24 hours",
                "preferred_interaction": "Virtual calls",
                "max_connections_per_month": 15
            }
        },
        {
            "name": "Carlos Mendez",
            "email": "carlos.m@boozallen.com",
            "major": "Data Science",
            "graduation_year": 2019,
            "company": "Booz Allen Hamilton",
            "job_title": "Data Engineer",
            "profile_data": {
                "industry": "Government",
                "location": "McLean, VA",
                "expertise_areas": "Data pipelines, Spark, Airflow, AWS, ETL, analytics, data warehousing",
                "career_journey": "Built data infrastructure for government clients. Specialize in large-scale data processing",
                "hobbies": "Soccer, guitar, volunteering at animal shelter",
                "help_offered": ["Career guidance and industry insights", "Technical interview preparation", "Specific technical mentorship"],
                "specific_topics": "Data engineering, Spark, Airflow, AWS data services, government contracting",
                "accepting_requests": True,
                "preferred_response_time": "2-3 days",
                "preferred_interaction": "Email advice",
                "max_connections_per_month": 10
            }
        },
        {
            "name": "Jessica Park",
            "email": "jessica.park@ngc.com",
            "major": "Systems Engineering",
            "graduation_year": 2017,
            "company": "Northrop Grumman",
            "job_title": "Systems Engineer",
            "profile_data": {
                "industry": "Aerospace",
                "location": "Falls Church, VA",
                "expertise_areas": "Aerospace systems, requirements engineering, MATLAB, testing, systems integration",
                "career_journey": "Work on defense systems. Secret clearance. Led 2 major satellite projects",
                "hobbies": "Tennis, reading thriller novels, learning Korean",
                "help_offered": ["Career guidance and industry insights", "Resume and cover letter reviews", "Company/industry-specific questions"],
                "specific_topics": "Defense contracting, systems engineering, security clearances",
                "accepting_requests": True,
                "preferred_response_time": "2-3 days",
                "preferred_interaction": "Email advice",
                "max_connections_per_month": 5
            }
        },
        {
            "name": "Ahmed Hassan",
            "email": "ahmed@fintech-startup.com",
            "major": "Computer Science",
            "graduation_year": 2020,
            "company": "Startup (Venture-backed)",
            "job_title": "Founding Engineer",
            "profile_data": {
                "industry": "Startups",
                "location": "San Francisco, CA",
                "expertise_areas": "Full-stack, React, Node.js, MongoDB, startup operations, product development",
                "career_journey": "Employee #3 at fintech startup. Built entire platform from scratch. Series A raised",
                "hobbies": "Gaming, entrepreneurship podcasts, fitness",
                "help_offered": ["Career guidance and industry insights", "Specific technical mentorship", "Work-life balance and career growth"],
                "specific_topics": "Startup life, full-stack development, React, Node.js, MongoDB",
                "accepting_requests": True,
                "preferred_response_time": "When available",
                "preferred_interaction": "Any",
                "max_connections_per_month": 20
            }
        }
    ]
    
    alumni_users = []
    for data in alumni_data:
        user = User(
            email=data["email"],
            password_hash=pwd_context.hash("password123"),
            name=data["name"],
            role="alumni",
            major=data["major"],
            graduation_year=data["graduation_year"],
            company=data["company"],
            job_title=data["job_title"],
            profile_data=data["profile_data"],
            avatar_url=f"https://ui-avatars.com/api/?name={data['name'].replace(' ', '+')}"
        )
        db.add(user)
        alumni_users.append(user)
    db.commit()
    
    # Create 8 STUDENTS
    students_data = [
        {
            "name": "Sarah Chen",
            "email": "schen@gmu.edu",
            "major": "Computer Science",
            "year": "Junior",
            "gpa": 3.7,
            "profile_data": {
                "career_goals": "Backend engineer at Google focusing on distributed systems",
                "target_companies": ["Google", "Amazon", "Meta"],
                "areas_of_interest": "Distributed systems, cloud computing, backend architecture",
                "skills": ["Python", "Java", "AWS", "Docker"],
                "hobbies": "Guitar, hiking, photography",
                "looking_for": ["Career mentorship from alumni", "Resume and interview help", "Technical interview preparation"],
                "resume_url": None,
                "courses_taken": ["CS 310", "CS 367", "CS 471"],
                "is_tutor": False
            },
            "courses": [(4, "B+", False), (7, "A-", False), (8, "B+", False)]  # CS 310, CS 367, CS 471
        },
        {
            "name": "Michael Torres",
            "email": "mtorres@gmu.edu",
            "major": "Information Systems",
            "year": "Senior",
            "gpa": 3.5,
            "profile_data": {
                "career_goals": "Product manager at tech company, interested in fintech",
                "target_companies": ["Stripe", "Square", "Capital One"],
                "areas_of_interest": "Product management, fintech, agile methodologies",
                "skills": ["SQL", "Python", "Tableau", "Agile"],
                "hobbies": "Basketball, reading business books, volunteering",
                "looking_for": ["Career mentorship from alumni", "Networking strategies and tips"],
                "resume_url": None,
                "courses_taken": ["IT 341", "SYST 460"],
                "is_tutor": False
            },
            "courses": [(16, "A", False), (17, "A-", False)]  # IT 341, SYST 460
        },
        {
            "name": "Emily Johnson",
            "email": "ejohnson@gmu.edu",
            "major": "Data Science",
            "year": "Sophomore",
            "gpa": 3.9,
            "profile_data": {
                "career_goals": "Data scientist working on ML applications in healthcare",
                "target_companies": ["Google", "Amazon", "Healthcare startups"],
                "areas_of_interest": "Machine learning, healthcare analytics, data visualization",
                "skills": ["Python", "R", "TensorFlow", "SQL"],
                "hobbies": "Yoga, cooking, podcasts",
                "looking_for": ["Career mentorship from alumni", "Project collaboration partners"],
                "resume_url": None,
                "courses_taken": ["CS 112", "STAT 344", "MATH 113"],
                "is_tutor": True
            },
            "courses": [(1, "A", True), (15, "A", True), (12, "A-", True)]  # CS 112, STAT 344, MATH 113
        },
        {
            "name": "Alex Kim",
            "email": "akim@gmu.edu",
            "major": "Computer Science",
            "year": "Freshman",
            "gpa": 3.3,
            "profile_data": {
                "career_goals": "Frontend developer, love building user interfaces",
                "target_companies": ["Meta", "Apple", "Startups"],
                "areas_of_interest": "Frontend development, UI/UX design, web technologies",
                "skills": ["JavaScript", "React", "HTML/CSS", "Git"],
                "hobbies": "Gaming, anime, graphic design",
                "looking_for": ["Tutoring (I need help)", "Study partners for specific courses"],
                "resume_url": None,
                "courses_taken": ["CS 112", "MATH 113"],
                "is_tutor": False
            },
            "courses": [(1, "B", False), (12, "B+", False)]  # CS 112, MATH 113
        },
        {
            "name": "Jasmine Washington",
            "email": "jwashington@gmu.edu",
            "major": "Cyber Security Engineering",
            "year": "Junior",
            "gpa": 3.6,
            "profile_data": {
                "career_goals": "Security engineer at defense contractor or government",
                "target_companies": ["Northrop Grumman", "Booz Allen Hamilton", "Government"],
                "areas_of_interest": "Cybersecurity, penetration testing, network security",
                "skills": ["Python", "Linux", "Networking", "Penetration testing"],
                "hobbies": "CTF competitions, mystery novels, swimming",
                "looking_for": ["Career mentorship from alumni", "Resume and interview help"],
                "resume_url": None,
                "courses_taken": ["CYSE 200", "CYSE 330", "CS 310"],
                "is_tutor": False
            },
            "courses": [(18, "A", False), (19, "A-", False), (4, "B+", False)]  # CYSE 200, CYSE 330, CS 310
        },
        {
            "name": "Ryan Martinez",
            "email": "rmartinez@gmu.edu",
            "major": "Computer Science",
            "year": "Junior",
            "gpa": 3.4,
            "profile_data": {
                "career_goals": "Mobile app developer, want to build consumer apps",
                "target_companies": ["Apple", "Meta", "Startups"],
                "areas_of_interest": "Mobile development, iOS, React Native",
                "skills": ["Swift", "React Native", "JavaScript", "Firebase"],
                "hobbies": "Skateboarding, music production, coffee",
                "looking_for": ["Career mentorship from alumni", "Project collaboration partners"],
                "resume_url": None,
                "courses_taken": ["CS 310", "CS 321", "CS 465"],
                "is_tutor": True
            },
            "courses": [(4, "A", True), (5, "A-", False), (10, "B+", False)]  # CS 310, CS 321, CS 465
        },
        {
            "name": "Aisha Patel",
            "email": "apatel@gmu.edu",
            "major": "Data Science",
            "year": "Senior",
            "gpa": 3.8,
            "profile_data": {
                "career_goals": "ML engineer working on recommendation systems",
                "target_companies": ["Netflix", "Spotify", "Amazon"],
                "areas_of_interest": "Machine learning, recommendation systems, data engineering",
                "skills": ["Python", "PyTorch", "SQL", "Spark"],
                "hobbies": "Bollywood dancing, traveling, cooking",
                "looking_for": ["Career mentorship from alumni", "Technical interview preparation"],
                "resume_url": None,
                "courses_taken": ["CS 483", "STAT 344", "CS 310"],
                "is_tutor": True
            },
            "courses": [(9, "A", False), (15, "A", True), (4, "A", True)]  # CS 483, STAT 344, CS 310
        },
        {
            "name": "Connor O'Brien",
            "email": "cobrien@gmu.edu",
            "major": "Computer Science",
            "year": "Sophomore",
            "gpa": 3.1,
            "profile_data": {
                "career_goals": "Game developer or graphics programming",
                "target_companies": ["Epic Games", "Unity", "Game studios"],
                "areas_of_interest": "Game development, graphics programming, 3D modeling",
                "skills": ["C++", "Unity", "Blender", "OpenGL"],
                "hobbies": "Gaming, 3D modeling, streaming",
                "looking_for": ["Tutoring (I need help)", "Project collaboration partners"],
                "resume_url": None,
                "courses_taken": ["CS 112", "CS 262", "MATH 203"],
                "is_tutor": False
            },
            "courses": [(1, "B", False), (3, "B-", False), (14, "B+", False)]  # CS 112, CS 262, MATH 203
        }
    ]
    
    student_users = []
    for data in students_data:
        user = User(
            email=data["email"],
            password_hash=pwd_context.hash("password123"),
            name=data["name"],
            role="student",
            major=data["major"],
            year=data["year"],
            gpa=data["gpa"],
            profile_data=data["profile_data"],
            avatar_url=f"https://ui-avatars.com/api/?name={data['name'].replace(' ', '+')}"
        )
        db.add(user)
        student_users.append(user)
    db.commit()
    
    # Link students to courses
    for idx, data in enumerate(students_data):
        for course_idx, grade, can_tutor in data["courses"]:
            sc = StudentCourse(
                user_id=student_users[idx].id,
                course_id=courses[course_idx].id,
                grade=grade,
                can_tutor=can_tutor
            )
            db.add(sc)
    db.commit()
    
    print("✅ Database seeded successfully!")
    print(f"   - {len(courses)} courses")
    print(f"   - {len(alumni_users)} alumni")
    print(f"   - {len(student_users)} students")
    print(f"   - 3 tutors (Emily, Ryan, Aisha)")
    
    db.close()

if __name__ == "__main__":
    seed_data()
