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
            model="llama-3.3-70b-versatile",
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
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=256
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"AI draft error: {e}")
        return f"Hi {target['name']}, I'm {student['name']}, a {student.get('year', '')} {student.get('major', '')} student at GMU. I'd love to connect and learn from your experience. Would you be open to a brief conversation?"

# --- Alumni search: strict (single-word) and closest-match (multi-word) ---

TOP_ALUMNI_SEARCH_RESULTS = 10


def search_alumni_closest_match(query: str, alumni_list: list, top_n: int = 15) -> list:
    """
    For multi-word queries: analyze the full alumni list and return the CLOSEST matches
    in order of relevance. Ignores any profile match percentage; only uses profile data.
    """
    if not query or not query.strip():
        return alumni_list[:top_n] if alumni_list else []
    if not alumni_list:
        return []

    profiles = []
    for a in alumni_list:
        profiles.append({
            "id": a["id"],
            "name": a.get("name") or "",
            "company": a.get("company") or "",
            "job_title": a.get("job_title") or "",
            "major": a.get("major") or "",
            "bio": (a.get("bio") or "")[:500],
        })

    prompt = f"""You are analyzing an alumni directory. The user searched (multiple words):

"{query.strip()}"

Full alumni database (analyze ALL profiles below):
{json.dumps(profiles, indent=2)}

TASK: Find the CLOSEST matches to what the user is looking for. Consider company, job_title, major, and bio. Do NOT use any match percentage or score on the profiles — only analyze the raw data (company, job_title, major, bio).

1. Interpret the query: e.g. "people from Microsoft who are data analysts" = someone at Microsoft with a data/analytics role (Data Scientist, Data Analyst, Analyst, etc.).
2. Return profile ids in order of relevance: closest match first, then next closest, up to {top_n} ids.
3. Include only people who reasonably match. If the query has multiple criteria (company AND role), prefer those who match both; then partial matches.
4. Return at most {top_n} ids. If fewer match well, return fewer.

Return ONLY a JSON array of profile ids, e.g. ["id1", "id2", "id3"]. No other text."""

    system = "You analyze the full database and return the closest matching profile ids in order of relevance. Ignore any match percentage; use only company, job_title, major, and bio."

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
            max_tokens=1024,
        )
        text = response.choices[0].message.content.strip()
        if "" in text:
            text = text.split("")[1].replace("json", "").strip()
        ids = json.loads(text)
        if not isinstance(ids, list):
            ids = [ids] if ids else []
        id_set = {a["id"] for a in alumni_list}
        ordered = [i for i in ids if i in id_set][:top_n]
        id_to_alum = {a["id"]: a for a in alumni_list}
        return [id_to_alum[aid] for aid in ordered if aid in id_to_alum]
    except Exception as e:
        print(f"Closest match search error: {e}")
        return alumni_list[:top_n]


def search_alumni_strict(query: str, alumni_list: list, top_n: int = TOP_ALUMNI_SEARCH_RESULTS) -> list:
    """
    Single LLM call: given the user's exact query and full alumni list, return ONLY alumni who
    accurately match the search, in order of relevance (best first), max top_n.
    Strict matching: e.g. "people from Microsoft who are data analysts" = Microsoft AND data/analytics role.
    """
    if not query or not query.strip():
        return alumni_list[:top_n] if alumni_list else []
    if not alumni_list:
        return []

    profiles = []
    for a in alumni_list:
        profiles.append({
            "id": a["id"],
            "name": a.get("name") or "",
            "company": a.get("company") or "",
            "job_title": a.get("job_title") or "",
            "major": a.get("major") or "",
            "bio": (a.get("bio") or "")[:500],
        })

    prompt = f"""You are a precise search engine for an alumni directory. The user searched:

"{query.strip()}"

Alumni profiles (id, name, company, job_title, major, bio):
{json.dumps(profiles, indent=2)}

STRICT RULES FOR ACCURACY:
1. Only include alumni who TRULY match the search. When the user specifies multiple things (e.g. "from Microsoft who are data analysts"), the person must match ALL criteria: e.g. work at Microsoft AND have a data/analytics role (Data Scientist, Data Analyst, Analyst, etc.). Do NOT include someone who only matches one part (e.g. at Microsoft but Product Manager, or Data Scientist but at another company).
2. "Data analyst" / "data analysts" means job title or expertise in data analysis, analytics, data science, business intelligence — match "Data Scientist", "Lead Data Scientist", "Data Analyst", "Analyst", "Analytics", etc. It does NOT mean "Product Manager" or "Software Engineer" unless they work clearly in data/analytics.
3. Company names: match exactly or common variants (e.g. "Microsoft", "Google"). Case does not matter.
4. Return at most {top_n} profile ids in order of relevance (best match first). If no one matches well enough, return fewer or an empty array. Do not pad with poor matches.
5. Order by how well they match: perfect match first, then strong partial matches only if the user's query is broad.

Return ONLY a JSON array of profile ids, e.g. ["id1", "id2"]. No other text, no explanation."""

    system = "You are a strict search engine. Only return alumni who accurately match the user's query. When multiple criteria are given (company AND role), require BOTH. Prefer returning fewer results over including poor matches."

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            temperature=0,
            max_tokens=1024,
        )
        text = response.choices[0].message.content.strip()
        if "" in text:
            text = text.split("")[1].replace("json", "").strip()
        ids = json.loads(text)
        if not isinstance(ids, list):
            ids = [ids] if ids else []
        id_set = {a["id"] for a in alumni_list}
        ordered = [i for i in ids if i in id_set][:top_n]
        id_to_alum = {a["id"]: a for a in alumni_list}
        return [id_to_alum[aid] for aid in ordered if aid in id_to_alum]
    except Exception as e:
        print(f"Strict alumni search error: {e}")
        return alumni_list[:top_n]


def extract_search_intent(query: str) -> dict:
    """
    Step 1: Extract intent & keywords from natural-language search using LLM.
    Returns structured filters for DB/keyword search + keywords for semantic ranking.
    """
    if not query or not query.strip():
        return {"companies": [], "job_titles_or_roles": [], "majors": [], "keywords": []}

    prompt = f"""You are a search intent extractor for a university alumni directory. The user typed a natural-language search. Extract structured filters and keywords.

User query: "{query.strip()}"

Extract and return ONLY a valid JSON object with exactly these keys (use empty arrays if not mentioned):

1. "companies": list of company names the user wants (e.g. "Microsoft", "Google"). Include common variants (e.g. "Microsoft" not "MSFT"). Empty array [] if not specified.

2. "job_titles_or_roles": list of job roles/titles the user wants. Use lowercase. Expand to synonyms and related roles so DB matching works (e.g. job_title "Lead Data Scientist" should match "data analyst" intent). Examples:
   - "data analyst" or "data analysts" → ["data analyst", "data scientist", "analyst", "analytics", "business analyst"]
   - "engineer" → ["engineer", "software engineer", "developer"]
   - "PM" or "product manager" → ["product manager", "program manager"]
   Empty array [] if not specified.

3. "majors": list of majors/fields (e.g. "Computer Science", "Biology"). Empty array [] if not specified.

4. "keywords": list of important words/phrases from the query for semantic matching (e.g. "Microsoft", "data", "analyst"). Empty array [] if query is generic.

Rules:
- "people from Microsoft who are data analysts" → companies: ["Microsoft"], job_titles_or_roles: ["data analyst", "data scientist", "analyst", "analytics"], keywords: ["Microsoft", "data", "analyst"]
- "engineers at Google" → companies: ["Google"], job_titles_or_roles: ["engineer", "software engineer", "developer"], keywords: ["Google", "engineer"]
- Be inclusive with job_titles_or_roles so we don't miss relevant profiles (e.g. "Lead Data Scientist" matches "data analyst" intent).

Return ONLY the JSON object, no other text."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=512,
        )
        text = response.choices[0].message.content.strip()
        if "" in text:
            text = text.split("")[1].replace("json", "").strip()
        out = json.loads(text)
        return {
            "companies": out.get("companies") or [],
            "job_titles_or_roles": out.get("job_titles_or_roles") or [],
            "majors": out.get("majors") or [],
            "keywords": out.get("keywords") or [],
        }
    except Exception as e:
        print(f"Extract search intent error: {e}")
        return {"companies": [], "job_titles_or_roles": [], "majors": [], "keywords": []}


def _alumni_matches_intent(alum: dict, intent: dict) -> bool:
    """Step 2 helper: does this alum match extracted companies, job_titles_or_roles, majors (AND logic)."""
    company = (alum.get("company") or "").lower()
    job_title = (alum.get("job_title") or "").lower()
    bio = (alum.get("bio") or "").lower()
    major = (alum.get("major") or "").lower()

    if intent.get("companies"):
        if not any(c.lower() in company for c in intent["companies"]):
            return False
    if intent.get("job_titles_or_roles"):
        combined = f"{job_title} {bio}"
        if not any(role in combined for role in intent["job_titles_or_roles"]):
            return False
    if intent.get("majors"):
        if not any(m.lower() in major for m in intent["majors"]):
            return False
    return True


def rank_alumni_by_relevance(query: str, intent: dict, alumni_list: list, top_n: int = TOP_ALUMNI_SEARCH_RESULTS) -> list:
    """
    Step 3: Rank filtered alumni by relevance to the query and intent.
    Returns list of alumni ids in order of relevance (best first), max top_n.
    """
    if not alumni_list:
        return []
    if len(alumni_list) <= top_n and not intent.get("keywords"):
        return [a["id"] for a in alumni_list]

    summaries = []
    for a in alumni_list:
        summaries.append({
            "id": a["id"],
            "name": a["name"],
            "company": a.get("company") or "",
            "job_title": a.get("job_title") or "",
            "major": a.get("major") or "",
            "bio": (a.get("bio") or "")[:400],
        })

    prompt = f"""You are a relevance ranker for an alumni directory. The user searched: "{query.strip()}"

Extracted intent: companies={intent.get('companies')}, roles={intent.get('job_titles_or_roles')}, majors={intent.get('majors')}, keywords={intent.get('keywords')}

Alumni profiles (already pre-filtered by intent; now rank by relevance):
{json.dumps(summaries, indent=2)}

Task: Rank these profiles by relevance to the user's search (best match first). Return exactly the top {top_n} profile ids in order of relevance. If there are fewer than {top_n} profiles, return all of them in ranked order.

Return ONLY a JSON array of ids, e.g. ["id1", "id2", "id3"]. No other text."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=512,
        )
        text = response.choices[0].message.content.strip()
        if "" in text:
            text = text.split("")[1].replace("json", "").strip()
        ids = json.loads(text)
        if not isinstance(ids, list):
            ids = [ids] if ids else []
        id_set = {a["id"] for a in alumni_list}
        ordered = [i for i in ids if i in id_set][:top_n]
        # Append any not in response so we don't drop anyone
        for a in alumni_list:
            if a["id"] not in ordered and len(ordered) < top_n:
                ordered.append(a["id"])
        return ordered
    except Exception as e:
        print(f"Rank alumni error: {e}")
        return [a["id"] for a in alumni_list][:top_n]


def search_alumni_three_step(query: str, alumni_list: list, top_n: int = TOP_ALUMNI_SEARCH_RESULTS) -> list:
    """
    Full pipeline: Extract intent → Filter by keywords → Rank by relevance.
    Returns list of alumni dicts (with id, name, company, job_title, major, bio) in relevance order, max top_n.
    """
    if not query or not query.strip():
        return alumni_list[:top_n] if alumni_list else []
    if not alumni_list:
        return []

    # Step 1: Extract intent & keywords
    intent = extract_search_intent(query.strip())

    # Step 2: Filter by extracted keywords (AND logic: company AND role AND major when specified)
    filtered = [a for a in alumni_list if _alumni_matches_intent(a, intent)]

    # If filter too strict, relax: require only company OR role match (no AND)
    if not filtered and (intent.get("companies") or intent.get("job_titles_or_roles")):
        seen_ids = set()
        for a in alumni_list:
            company = (a.get("company") or "").lower()
            job_title = (a.get("job_title") or "").lower()
            bio = (a.get("bio") or "").lower()
            combined = f"{job_title} {bio}"
            if intent.get("companies") and any(c.lower() in company for c in intent["companies"]):
                if a["id"] not in seen_ids:
                    seen_ids.add(a["id"])
                    filtered.append(a)
            elif intent.get("job_titles_or_roles") and any(role in combined for role in intent["job_titles_or_roles"]):
                if a["id"] not in seen_ids:
                    seen_ids.add(a["id"])
                    filtered.append(a)
        if not filtered:
            filtered = list(alumni_list)  # fallback: show all, let ranking decide

    if not filtered:
        filtered = list(alumni_list)

    # Step 3: Rank by relevance, return top N
    ordered_ids = rank_alumni_by_relevance(query.strip(), intent, filtered, top_n=top_n)
    id_to_alum = {a["id"]: a for a in filtered}
    return [id_to_alum[aid] for aid in ordered_ids if aid in id_to_alum]


def explain_match(student, target, match_score):
    """Generate AI explanation for match score"""
    student_resume = student.get('resume_text', '')
    resume_snippet = student_resume[:500] if student_resume else ''
    
    prompt = f"""Explain why this is a {match_score}% match between a student and target.

Student: {student.get('major', 'GMU student')}, interested in {student.get('interests', 'career growth')}
{f'Resume snippet: {resume_snippet}...' if resume_snippet else ''}

Target: {target.get('major', '')} graduate, {target.get('job_title', '')} at {target.get('company', '')}

Provide 2-3 bullet points explaining the match. Be specific and concise. If resume content is provided, use it to find connections.
Return as JSON array: ["reason 1", "reason 2", "reason 3"]"""
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=256
        )
        text = response.choices[0].message.content.strip()
        return json.loads(text)
    except Exception as e:
        print(f"AI explanation error: {e}")
        return ["Shared major or field of study", "Relevant experience in target company", "Strong profile match"]