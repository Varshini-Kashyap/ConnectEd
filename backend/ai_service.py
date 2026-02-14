from groq import Groq
import os
from dotenv import load_dotenv
import json

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def match_tutors_with_request(help_request, available_tutors, course_info):
    """Use Groq AI to intelligently match tutors with help requests"""
    
    tutors_info = []
    for tutor in available_tutors:
        tutors_info.append({
            "id": tutor["id"],
            "name": tutor["name"],
            "gpa": float(tutor["gpa"]) if tutor["gpa"] else 0,
            "grade": tutor["grade"],
            "bio": tutor["bio"]
        })
    
    prompt = f"""You are an AI tutor matching system for GMU students. Analyze this help request and rank the available tutors.

Help Request:
- Course: {course_info['code']} - {course_info['name']}
- Title: {help_request['title']}
- Description: {help_request['description']}
- Urgent: {help_request['urgent']}

Available Tutors:
{json.dumps(tutors_info, indent=2)}

For each tutor, provide:
1. A match score (0-100) based on their grade, GPA, and bio relevance
2. 2-3 specific reasons why they're a good match

Return ONLY a valid JSON array with this structure:
[
  {{
    "tutor_id": "uuid",
    "match_score": 95,
    "reasons": ["Earned an A in this course", "High GPA of 3.9", "Bio mentions expertise in this topic"]
  }}
]

Sort by match_score descending. Return only the JSON, no other text."""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=1024
        )
        
        response_text = response.choices[0].message.content.strip()
        matches = json.loads(response_text)
        return matches
    except Exception as e:
        print(f"AI matching error: {e}")
        return [
            {
                "tutor_id": t["id"],
                "match_score": int(float(t["gpa"]) * 25) if t["gpa"] else 50,
                "reasons": [f"Grade: {t['grade']}", f"GPA: {t['gpa']}", "Available to help"]
            }
            for t in tutors_info
        ]

def draft_outreach_message(student, target, target_type):
    """Generate personalized outreach message using AI"""
    prompt = f"""Generate a professional, friendly outreach message from a GMU student to a {target_type}.

Student: {student['name']}, {student.get('major', 'GMU student')}, {student.get('year', '')}
Target: {target['name']}, {target.get('job_title', '')} at {target.get('company', 'GMU')}

Write a 3-4 sentence message that:
1. Introduces the student briefly
2. Mentions a specific connection point (major, company, etc.)
3. States clear purpose (career advice, tutoring help, etc.)
4. Ends with a polite call to action

Return only the message text, no subject line or extra formatting."""
    
    try:
        response = client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=256
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"AI draft error: {e}")
        return f"Hi {target['name']}, I'm {student['name']}, a {student.get('year', '')} {student.get('major', '')} student at GMU. I'd love to connect and learn from your experience. Would you be open to a brief conversation?"

def explain_match(student, target, match_score):
    """Generate AI explanation for match score"""
    prompt = f"""Explain why this is a {match_score}% match between a student and target.

Student: {student.get('major', 'GMU student')}, interested in {student.get('interests', 'career growth')}
Target: {target.get('major', '')} graduate, {target.get('job_title', '')} at {target.get('company', '')}

Provide 2-3 bullet points explaining the match. Be specific and concise.
Return as JSON array: ["reason 1", "reason 2", "reason 3"]"""
    
    try:
        response = client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=256
        )
        text = response.choices[0].message.content.strip()
        return json.loads(text)
    except Exception as e:
        print(f"AI explanation error: {e}")
        return ["Shared major or field of study", "Relevant experience in target company", "Strong profile match"]
