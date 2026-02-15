def compute_career_match(student, alumni):
    """Compute match score between student and alumni (0-100)"""
    score = 0
    
    # Major similarity (40 points)
    if student.get('major') and alumni.get('major'):
        if student['major'].lower() == alumni['major'].lower():
            score += 40
        elif any(word in alumni['major'].lower() for word in student['major'].lower().split()):
            score += 20
    
    # Company match if in wishlist (30 points)
    wishlist = student.get('company_wishlist', [])
    if alumni.get('company') and alumni['company'] in wishlist:
        score += 30
    
    # Resume content boost (check if alumni company/role mentioned in student resume)
    student_resume = student.get('resume_text', '')
    if student_resume and alumni.get('company'):
        if alumni['company'].lower() in student_resume.lower():
            score += 10
    
    # Graduation year proximity (10 points)
    if student.get('year') and alumni.get('graduation_year'):
        year_map = {'Freshman': 2027, 'Sophomore': 2026, 'Junior': 2025, 'Senior': 2024}
        student_grad = year_map.get(student['year'], 2024)
        years_diff = abs(student_grad - alumni['graduation_year'])
        if years_diff <= 2:
            score += 10
        elif years_diff <= 5:
            score += 5
    
    # Currently accepting connections (10 points)
    if alumni.get('accepting_connections', True):
        score += 10
    
    return min(score, 100)

def compute_tutor_match(request, tutor):
    """Compute match score between help request and tutor (0-100)"""
    score = 0
    
    # Exact course match (50 points)
    tutor_courses = [c['course_id'] for c in tutor.get('courses', [])]
    if request.get('course_id') in tutor_courses:
        score += 50
        # Check grade in that course
        for course in tutor.get('courses', []):
            if course['course_id'] == request['course_id']:
                grade = course.get('grade', '')
                if grade in ['A', 'A+']:
                    score += 10
                elif grade in ['A-', 'B+']:
                    score += 5
    
    # GPA (20 points if >= 3.5)
    gpa = tutor.get('gpa', 0)
    if gpa >= 3.8:
        score += 20
    elif gpa >= 3.5:
        score += 15
    elif gpa >= 3.0:
        score += 10
    
    # Number of courses can tutor (15 points)
    num_courses = len([c for c in tutor.get('courses', []) if c.get('can_tutor')])
    score += min(num_courses * 3, 15)
    
    # Previous tutoring sessions (15 points)
    sessions = tutor.get('tutoring_sessions', 0)
    score += min(sessions * 2, 15)
    
    return min(score, 100)
