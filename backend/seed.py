from database import SessionLocal
from models import User, Course, StudentCourse, HelpRequest, RoleEnum, RequestStatus
from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_data():
    db = SessionLocal()
    
    # Clear existing data
    db.query(HelpRequest).delete()
    db.query(StudentCourse).delete()
    db.query(User).delete()
    db.query(Course).delete()
    db.commit()
    
    # Create courses
    courses_data = [
        ("CS 112", "Introduction to Computer Programming", "CS"),
        ("CS 211", "Object-Oriented Programming", "CS"),
        ("CS 310", "Data Structures", "CS"),
        ("CS 330", "Formal Methods and Models", "CS"),
        ("CS 367", "Computer Systems and Programming", "CS"),
        ("CS 450", "Database Concepts", "CS"),
        ("CS 465", "Computer Systems Architecture", "CS"),
        ("CS 471", "Operating Systems", "CS"),
        ("CS 483", "Analysis of Algorithms", "CS"),
        ("CS 484", "Data Mining", "CS"),
        ("MATH 113", "Analytic Geometry and Calculus I", "MATH"),
        ("MATH 114", "Analytic Geometry and Calculus II", "MATH"),
        ("MATH 213", "Analytic Geometry and Calculus III", "MATH"),
        ("MATH 125", "Discrete Mathematics", "MATH"),
        ("STAT 344", "Probability and Statistics for Engineers", "MATH"),
        ("ENGR 107", "Introduction to Engineering", "ENGR"),
        ("ECE 301", "Digital Electronics", "ENGR"),
        ("ECE 445", "Senior Design Project", "ENGR"),
        ("SWE 432", "Design and Implementation of Software for the Web", "CS"),
        ("SWE 437", "Software Testing and Maintenance", "CS"),
    ]
    
    courses = []
    for code, name, dept in courses_data:
        course = Course(code=code, name=name, department=dept)
        db.add(course)
        courses.append(course)
    db.commit()
    
    # Create alumni profiles
    alumni_data = [
        ("Sarah Chen", "sarah.chen@gmu.edu", "Computer Science", 2020, "Google", "Software Engineer II", "Former GMU CS grad working on Google Cloud. Happy to help current students with career advice and technical interviews!"),
        ("Michael Rodriguez", "m.rodriguez@gmu.edu", "Computer Science", 2019, "Amazon", "Senior SDE", "AWS engineer passionate about distributed systems. Love mentoring GMU students!"),
        ("Emily Johnson", "emily.j@gmu.edu", "Information Technology", 2021, "Microsoft", "Software Engineer", "Working on Azure at Microsoft. GMU alum always ready to give back to the community."),
        ("David Kim", "david.kim@gmu.edu", "Computer Science", 2018, "Capital One", "Senior Software Engineer", "Tech lead at Capital One. Specialized in full-stack development and cloud architecture."),
        ("Jessica Martinez", "j.martinez@gmu.edu", "Computer Science", 2020, "Accenture", "Technology Consultant", "Helping clients with digital transformation. Open to discussing consulting careers!"),
        ("Ryan Thompson", "ryan.t@gmu.edu", "Software Engineering", 2019, "Deloitte", "Senior Consultant", "Cybersecurity and cloud solutions at Deloitte. GMU pride!"),
        ("Amanda Lee", "amanda.lee@gmu.edu", "Computer Science", 2022, "Google", "Software Engineer", "Android development at Google. Recent grad happy to share my journey!"),
        ("James Wilson", "james.w@gmu.edu", "Information Systems", 2021, "Amazon", "Software Development Engineer", "Working on Alexa. Love connecting with fellow Patriots!"),
        ("Priya Patel", "priya.p@gmu.edu", "Computer Science", 2020, "Microsoft", "Software Engineer II", "Azure DevOps team. Always excited to mentor GMU students."),
        ("Christopher Brown", "chris.b@gmu.edu", "Computer Science", 2018, "Capital One", "Principal Engineer", "Leading mobile engineering teams. GMU CS alum since 2018."),
        ("Nicole Garcia", "nicole.g@gmu.edu", "Cyber Security Engineering", 2021, "Accenture", "Security Consultant", "Penetration testing and security architecture. Go Patriots!"),
        ("Kevin Nguyen", "kevin.n@gmu.edu", "Computer Science", 2019, "Deloitte", "Manager", "Leading cloud migration projects. Proud GMU graduate."),
        ("Olivia Davis", "olivia.d@gmu.edu", "Software Engineering", 2022, "Google", "Software Engineer", "Working on Google Maps. Recent GMU grad!"),
        ("Brandon Miller", "brandon.m@gmu.edu", "Computer Science", 2020, "Amazon", "SDE II", "Prime Video team. Love helping GMU students break into tech."),
        ("Sophia Anderson", "sophia.a@gmu.edu", "Information Technology", 2021, "Microsoft", "Cloud Solution Architect", "Helping enterprises adopt Azure. GMU alum passionate about mentorship."),
    ]
    
    alumni_users = []
    for name, email, major, grad_year, company, title, bio in alumni_data:
        user = User(
            email=email,
            password_hash=pwd_context.hash("password123"),
            name=name,
            role=RoleEnum.alumni,
            major=major,
            graduation_year=grad_year,
            company=company,
            job_title=title,
            bio=bio,
            avatar_url=f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}"
        )
        db.add(user)
        alumni_users.append(user)
    db.commit()
    
    # Create student profiles
    students_data = [
        ("Alex Turner", "aturner@gmu.edu", "Computer Science", "Junior", True, 3.7, "CS major passionate about algorithms and data structures. Looking to help fellow students!"),
        ("Maya Patel", "mpatel@gmu.edu", "Computer Science", "Senior", True, 3.9, "Senior CS student specializing in AI/ML. Love tutoring and helping others succeed."),
        ("Jordan Lee", "jlee@gmu.edu", "Software Engineering", "Sophomore", False, 3.5, "SWE student exploring web development and mobile apps."),
        ("Taylor Smith", "tsmith@gmu.edu", "Computer Science", "Junior", True, 3.8, "Junior interested in cybersecurity and systems programming. Happy to tutor!"),
        ("Casey Johnson", "cjohnson@gmu.edu", "Information Technology", "Freshman", False, 3.4, "First-year IT student learning the ropes. Excited about cloud computing!"),
        ("Morgan Davis", "mdavis@gmu.edu", "Computer Science", "Senior", True, 3.6, "Senior CS student with internship experience. Can help with interview prep!"),
        ("Riley Martinez", "rmartinez@gmu.edu", "Computer Science", "Sophomore", True, 3.7, "Sophomore who loves teaching. Strong in math and programming fundamentals."),
        ("Avery Wilson", "awilson@gmu.edu", "Cyber Security Engineering", "Junior", True, 3.5, "Cybersecurity student passionate about ethical hacking and network security."),
        ("Cameron Brown", "cbrown@gmu.edu", "Computer Science", "Freshman", False, 3.3, "Freshman CS student eager to learn and connect with others."),
        ("Drew Anderson", "danderson@gmu.edu", "Software Engineering", "Senior", True, 3.8, "Senior SWE student. Experienced in full-stack development and agile methodologies."),
    ]
    
    student_users = []
    for name, email, major, year, is_tutor, gpa, bio in students_data:
        user = User(
            email=email,
            password_hash=pwd_context.hash("password123"),
            name=name,
            role=RoleEnum.student,
            major=major,
            year=year,
            is_tutor=is_tutor,
            gpa=gpa,
            bio=bio,
            avatar_url=f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}"
        )
        db.add(user)
        student_users.append(user)
    db.commit()
    
    # Add courses for tutors
    tutor_courses = [
        (student_users[0], [0, 1, 2, 10, 11, 13], ["A", "A-", "A", "A", "B+", "A"]),  # Alex - CS 112, 211, 310, MATH 113, 114, 125
        (student_users[1], [2, 3, 6, 8, 18], ["A", "A", "A-", "A", "A"]),  # Maya - CS 310, 330, 465, 483, SWE 432
        (student_users[3], [1, 2, 4, 6, 7], ["A-", "A", "B+", "A", "A-"]),  # Taylor - CS 211, 310, 367, 465, 471
        (student_users[5], [0, 1, 2, 5, 18, 19], ["A", "A", "A-", "A", "A", "B+"]),  # Morgan - CS 112, 211, 310, 450, SWE 432, 437
        (student_users[6], [0, 1, 10, 11, 13], ["A", "A", "A", "A-", "A"]),  # Riley - CS 112, 211, MATH 113, 114, 125
        (student_users[7], [1, 2, 4, 16], ["B+", "A-", "A", "A"]),  # Avery - CS 211, 310, 367, ECE 301
        (student_users[9], [2, 5, 18, 19], ["A", "A", "A", "A-"]),  # Drew - CS 310, 450, SWE 432, 437
    ]
    
    for student, course_indices, grades in tutor_courses:
        for idx, grade in zip(course_indices, grades):
            sc = StudentCourse(
                user_id=student.id,
                course_id=courses[idx].id,
                grade=grade,
                can_tutor=True
            )
            db.add(sc)
    db.commit()
    
    # Add courses for non-tutor students
    non_tutor_courses = [
        (student_users[2], [0, 1, 10, 15], ["B+", "B", "A-", "A"]),  # Jordan
        (student_users[4], [0, 15], ["B", "B+"]),  # Casey
        (student_users[8], [0, 10, 15], ["B", "B+", "A-"]),  # Cameron
    ]
    
    for student, course_indices, grades in non_tutor_courses:
        for idx, grade in zip(course_indices, grades):
            sc = StudentCourse(
                user_id=student.id,
                course_id=courses[idx].id,
                grade=grade,
                can_tutor=False
            )
            db.add(sc)
    db.commit()
    
    # Create help requests
    help_requests_data = [
        (student_users[2], courses[2].id, "Need help with Binary Search Trees", "I'm struggling to understand BST insertion and deletion. Could really use some guidance before my exam next week.", True),
        (student_users[4], courses[0].id, "Java loops and arrays confusion", "Having trouble with nested loops and 2D arrays. Would appreciate some tutoring help!", False),
        (student_users[8], courses[1].id, "Object-oriented design principles", "Need help understanding inheritance and polymorphism for my project.", False),
        (student_users[2], courses[18].id, "React hooks and state management", "Working on a web project and confused about useEffect and useState hooks.", True),
        (student_users[4], courses[10].id, "Calculus integration techniques", "Struggling with integration by parts and substitution methods.", False),
    ]
    
    for student, course_id, title, desc, urgent in help_requests_data:
        req = HelpRequest(
            student_id=student.id,
            course_id=course_id,
            title=title,
            description=desc,
            urgent=urgent,
            status=RequestStatus.open
        )
        db.add(req)
    db.commit()
    
    print("✅ Database seeded successfully!")
    print(f"   - {len(courses)} courses")
    print(f"   - {len(alumni_users)} alumni")
    print(f"   - {len(student_users)} students")
    print(f"   - 8 tutors with course assignments")
    print(f"   - 5 open help requests")
    
    db.close()

if __name__ == "__main__":
    seed_data()
