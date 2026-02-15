from groq import Groq
import os
import re
import urllib.request
from typing import Optional
from dotenv import load_dotenv
import json

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Ollama: used ONLY for the natural-language partner/student search (Find Partners). All other
# AI (tutor matching, match explanation, draft message, alumni search) remains Groq — do not change.
OLLAMA_BASE_URL = (os.getenv("OLLAMA_BASE_URL") or "http://localhost:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
OLLAMA_EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")

# Model choice: 70b is better quality but uses more tokens (100k TPD on free tier).
# Use GROQ_MODEL=llama-3.1-8b-instant for 5x token headroom (500k TPD) when hitting rate limits.
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_MODEL_FALLBACK = "llama-3.1-8b-instant"  # smaller model, higher rate limits

def _ollama_create(prompt: str, model: str = None) -> Optional[str]:
    """Call local Ollama (free, unlimited). Returns response text or None if Ollama not running / error."""
    model = model or OLLAMA_MODEL
    url = f"{OLLAMA_BASE_URL}/api/chat"
    body = json.dumps({
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
    }).encode("utf-8")
    try:
        req = urllib.request.Request(url, data=body, method="POST")
        req.add_header("Content-Type", "application/json")
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode())
            msg = data.get("message") or {}
            return (msg.get("content") or "").strip() or None
    except Exception as e:
        print(f"Ollama API error: {e}")
        return None


def _ollama_embed(text: str, model: str = None) -> Optional[list]:
    """Get embedding vector for one string via Ollama /api/embed. Student search only. Returns list of floats or None."""
    if not text or not str(text).strip():
        return None
    model = model or OLLAMA_EMBED_MODEL
    url = f"{OLLAMA_BASE_URL}/api/embed"
    body = json.dumps({"model": model, "input": text.strip()}).encode("utf-8")
    try:
        req = urllib.request.Request(url, data=body, method="POST")
        req.add_header("Content-Type", "application/json")
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
            embs = data.get("embeddings")
            if embs and len(embs) > 0:
                return embs[0]
        return None
    except Exception as e:
        print(f"Ollama embed error: {e}")
        return None


def _ollama_embed_batch(texts: list, model: str = None) -> Optional[list]:
    """Get embeddings for multiple strings in one call. Returns list of vectors or None."""
    if not texts:
        return []
    model = model or OLLAMA_EMBED_MODEL
    url = f"{OLLAMA_BASE_URL}/api/embed"
    inputs = [str(t).strip() if t else "" for t in texts]
    inputs = [s or " " for s in inputs]
    body = json.dumps({"model": model, "input": inputs}).encode("utf-8")
    try:
        req = urllib.request.Request(url, data=body, method="POST")
        req.add_header("Content-Type", "application/json")
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode())
            return data.get("embeddings")
    except Exception as e:
        print(f"Ollama embed batch error: {e}")
        return None


def _cosine_similarity(a: list, b: list) -> float:
    """Cosine similarity for L2-normalized vectors (Ollama returns normalized)."""
    if not a or not b or len(a) != len(b):
        return 0.0
    return sum(x * y for x, y in zip(a, b))


def _student_profile_searchable_text(s: dict) -> str:
    """Build one searchable text from DB-backed student columns for semantic match."""
    parts = [
        str(s.get("hobbies") or ""),
        str(s.get("areas_of_interest") or ""),
        str(s.get("looking_for_str") or ""),
        str(s.get("courses_str") or ""),
        str(s.get("major") or ""),
        str(s.get("year") or ""),
    ]
    return " ".join(p for p in parts if p).strip() or " "


def search_students_semantic(query: str, students_list: list, top_n: int = 10) -> Optional[list]:
    """
    Student search only: rank by semantic similarity (Ollama embeddings) over DB-backed columns.
    Fetches students from DB in main.py; this receives that list and ranks by embedding similarity.
    Returns list of student dicts in relevance order, or None if Ollama embed unavailable (caller can fall back).
    """
    if not query or not query.strip() or not students_list:
        return students_list[:top_n] if students_list else []
    q_clean = query.strip()
    query_emb = _ollama_embed(q_clean)
    if not query_emb:
        return None
    profile_texts = [_student_profile_searchable_text(s) for s in students_list]
    profile_embs = _ollama_embed_batch(profile_texts)
    if not profile_embs or len(profile_embs) != len(students_list):
        return None
    scored = [(students_list[i], _cosine_similarity(query_emb, profile_embs[i])) for i in range(len(students_list))]
    scored.sort(key=lambda x: x[1], reverse=True)
    return [s for s, _ in scored[:top_n]]


def _student_search_llm(prompt: str) -> Optional[str]:
    """Only for partner/student search. Ollama first, then Groq fallback. All other features stay on Groq."""
    text = _ollama_create(prompt)
    if text:
        return text
    try:
        r = _groq_create(GROQ_MODEL, [{"role": "user", "content": prompt}], temperature=0.1, max_tokens=512)
        if r and r.choices:
            return (r.choices[0].message.content or "").strip() or None
    except Exception as e:
        print(f"Groq fallback error: {e}")
    return None


def _is_rate_limit(err):
    """Check if exception is Groq 429 rate limit."""
    msg = str(err).lower()
    return "429" in msg or "rate limit" in msg or "rate_limit" in msg


def _groq_create(model: str, messages: list, temperature: float = 0.2, max_tokens: int = 512):
    """Call Groq API; returns response or None. Tries fallback model on 429."""
    try:
        return client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
    except Exception as e:
        if _is_rate_limit(e) and model == GROQ_MODEL and model != GROQ_MODEL_FALLBACK:
            try:
                return client.chat.completions.create(
                    model=GROQ_MODEL_FALLBACK,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
            except Exception:
                raise e
        raise

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

def draft_outreach_message(requester, target, target_type, requester_role="student"):
    """Generate personalized outreach message using AI. Max 300 characters.
    Student→student: focus on common interests and coursework.
    Alumni↔student or alumni→alumni: focus on career and company."""
    max_len = 300
    requester_name = requester.get("name", "I")
    target_name = target.get("name", "you")
    is_student_to_student = (requester_role == "student" and target_type == "student")

    if is_student_to_student:
        prompt = f"""Write a short, friendly connection message from one GMU student to another. Focus on COMMON INTERESTS and COURSEWORK (e.g. same major, courses, study groups, clubs). Keep it casual and peer-to-peer.

Requester: {requester_name}, {requester.get('major', '')} {requester.get('year', '')}
Target: {target_name}, {target.get('major', '')} {target.get('year', '')}

Rules: Maximum 300 characters. No subject line. One short paragraph. End with a simple call to action (e.g. want to connect?). Return only the message text."""
        fallback = f"Hi {target_name}, I'm {requester_name}. We're both in {requester.get('major', 'GMU')} — would love to connect and maybe study or share notes!"
    else:
        prompt = f"""Write a short, professional connection message. Focus on CAREER and COMPANY (e.g. their role, company, industry, or mentorship). Polite and concise.

Requester: {requester_name}, {requester.get('major', '')} {requester.get('year', '')} ({requester_role})
Target: {target_name}, {target.get('job_title', '')} at {target.get('company', 'GMU')}

Rules: Maximum 300 characters. No subject line. One short paragraph. End with a brief call to action. Return only the message text."""
        fallback = f"Hi {target_name}, I'm {requester_name}. I'd love to connect and learn about your experience at {target.get('company', 'GMU')}. Would you have time for a quick chat?"

    try:
        response = _groq_create(
            GROQ_MODEL,
            [{"role": "user", "content": prompt}],
            temperature=0.6,
            max_tokens=120,
        )
        text = (response.choices[0].message.content or "").strip() or fallback
        return text[:max_len] if len(text) > max_len else text
    except Exception as e:
        print(f"AI draft error: {e}")
        return (fallback[:max_len]) if len(fallback) > max_len else fallback

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
        text = _strip_json_text(response.choices[0].message.content)
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
        text = _strip_json_text(response.choices[0].message.content)
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


TOP_STUDENT_SEARCH_RESULTS = 10


def _strip_json_text(text: str) -> str:
    """Remove markdown code blocks and trim."""
    if not text:
        return ""
    t = text.strip()
    if "```" in t:
        t = t.split("```")[1]
        if t.lower().startswith("json"):
            t = t[4:]
        t = t.strip()
    return t


# Stop words to exclude when deriving keywords from raw query (fallback when LLM fails)
_STOP_WORDS = frozenset({
    "i", "me", "my", "we", "our", "you", "your", "he", "she", "it", "they", "them",
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
    "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "need", "want", "find", "looking", "someone", "who", "like", "likes", "people", "person",
    "can", "could", "would", "will", "that", "this", "from",
})


def _query_to_keywords(query: str) -> list:
    """Derive searchable keywords from raw query when LLM intent is empty or fails. Removes stop words."""
    if not query or not query.strip():
        return []
    words = re.findall(r"[a-zA-Z0-9]+", query.strip().lower())
    return [w for w in words if len(w) >= 2 and w not in _STOP_WORDS]


def _regex_keyword_score(text: str, terms: list) -> float:
    """
    Accurate regex + keyword matching. Normalizes text, tries word-boundary then substring.
    Multi-word terms supported; score = proportion of terms that matched, in [0, 1].
    """
    if not terms:
        return 0.0
    if not text or not str(text).strip():
        return 0.0
    text_norm = " " + re.sub(r"\s+", " ", str(text).lower()) + " "
    matched = 0
    for term in terms:
        if not term or not str(term).strip():
            continue
        t = str(term).strip().lower()
        if not t:
            continue
        try:
            escaped = re.escape(t)
            word_boundary = r"(?<!\w)" + escaped + r"(?!\w)"
            if re.search(word_boundary, text_norm):
                matched += 1
            elif t in text_norm:
                matched += 0.85
        except Exception:
            if t in text_norm:
                matched += 0.85
    return min(1.0, matched / max(1, len([x for x in terms if x and str(x).strip()])))


def _all_regex_terms_alumni(intent: dict, query: str) -> list:
    """All terms used for regex scoring (alumni). Ensures query-derived keywords if intent empty."""
    terms = []
    terms.extend(intent.get("keywords") or [])
    terms.extend(intent.get("companies") or [])
    terms.extend(intent.get("job_titles_or_roles") or [])
    terms.extend(intent.get("majors") or [])
    if not terms and query:
        terms.extend(_query_to_keywords(query))
    return terms


def _all_regex_terms_student(intent: dict, query: str) -> list:
    """All terms used for regex scoring (student). Ensures query-derived keywords if intent empty."""
    terms = []
    terms.extend(intent.get("keywords") or [])
    terms.extend(intent.get("hobbies_or_activities") or [])
    terms.extend(intent.get("courses_or_subjects") or [])
    terms.extend(intent.get("looking_for_terms") or [])
    if not terms and query:
        terms.extend(_query_to_keywords(query))
    return terms


def _regex_score_alumni(profile: dict, intent: dict, query: str = "") -> float:
    """Regex score for alumni profile. Uses intent + query-derived keywords."""
    terms = _all_regex_terms_alumni(intent, query)
    text = " ".join([
        str(profile.get("company") or ""),
        str(profile.get("job_title") or ""),
        str(profile.get("major") or ""),
        str(profile.get("bio") or ""),
    ])
    return _regex_keyword_score(text, terms)


def _regex_score_student(profile: dict, intent: dict, query: str = "") -> float:
    """Regex score for student profile. Uses intent + query-derived keywords."""
    terms = _all_regex_terms_student(intent, query)
    text = " ".join([
        str(profile.get("hobbies") or ""),
        str(profile.get("areas_of_interest") or ""),
        str(profile.get("looking_for_str") or ""),
        str(profile.get("courses_str") or ""),
    ])
    return _regex_keyword_score(text, terms)


def search_students_keyword_only(query: str, students_list: list, top_n: int = 10) -> list:
    """
    Fast path: no LLM. Extract keywords from query, rank by regex match score only.
    Use this for the student search bar so results return instantly.
    """
    if not students_list:
        return []
    q = (query or "").strip()
    keywords = _query_to_keywords(q)
    if not keywords and q:
        keywords = [q]
    intent = {
        "hobbies_or_activities": keywords or [],
        "courses_or_subjects": [],
        "looking_for_terms": [],
        "keywords": keywords or [],
    }
    scored = [(s, _regex_score_student(s, intent, q)) for s in students_list]
    scored.sort(key=lambda x: x[1], reverse=True)
    return [s for s, _ in scored[:top_n]]


def _combine_regex_semantic_ranking(
    id_list: list,
    id_to_profile: dict,
    intent: dict,
    role: str,
    top_n: int,
    query: str = "",
) -> list:
    """
    Combine regex (keyword) score with semantic (LLM) rank.
    semantic_score = 1 - rank_index/len (top = 1). regex_score from intent + query fallback.
    combined = 0.5 * semantic + 0.5 * regex. Sort by combined desc. When regex dominates (no LLM),
    results are still accurate by keyword match.
    """
    if not id_list:
        return []
    n = len(id_list)
    score_regex = (
        _regex_score_alumni if role == "alumni" else _regex_score_student
    )
    scored = []
    for i, pid in enumerate(id_list):
        profile = id_to_profile.get(pid)
        if not profile:
            continue
        semantic_score = 1.0 - (i / max(1, n))
        regex_s = score_regex(profile, intent, query)
        combined = 0.5 * semantic_score + 0.5 * regex_s
        scored.append((pid, combined))
    scored.sort(key=lambda x: x[1], reverse=True)
    return [pid for pid, _ in scored[:top_n]]


def extract_search_intent(query: str, role: str = "alumni") -> dict:
    """
    Step 1: Extract intent & keywords from natural-language search using LLM.
    Role-aware: 'alumni' → companies, job_titles, majors; 'student' → hobbies, activities, looking_for.
    Returns structured filters for DB/keyword search + keywords for semantic ranking.
    """
    if not query or not query.strip():
        if role == "student":
            return {"hobbies_or_activities": [], "courses_or_subjects": [], "looking_for_terms": [], "keywords": []}
        return {"companies": [], "job_titles_or_roles": [], "majors": [], "keywords": []}

    if role == "student":
        return extract_search_intent_student(query.strip())
    return extract_search_intent_alumni(query.strip())


def extract_search_intent_alumni(query: str) -> dict:
    """Extract intent for alumni directory search (companies, roles, majors, keywords)."""

    prompt = f"""You are a search intent extractor for a university alumni directory. The user typed a natural-language search. Extract structured filters and keywords.

User query: "{query}"

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
        response = _groq_create(
            GROQ_MODEL,
            [{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=512,
        )
        text = _strip_json_text(response.choices[0].message.content)
        out = json.loads(text)
        return {
            "companies": out.get("companies") or [],
            "job_titles_or_roles": out.get("job_titles_or_roles") or [],
            "majors": out.get("majors") or [],
            "keywords": out.get("keywords") or [],
        }
    except Exception as e:
        print(f"Extract search intent (alumni) error: {e}")
        return {"companies": [], "job_titles_or_roles": [], "majors": [], "keywords": []}


def _student_intent_prompt(query: str) -> str:
    """Shared prompt for student search intent (Ollama or Groq)."""
    return f"""You are a search intent extractor for a university STUDENT directory. Students search for study partners, activity partners (e.g. swimming, gym), or people with similar interests. The user typed a natural-language search. Extract structured filters and keywords.

User query: "{query}"

Extract and return ONLY a valid JSON object with exactly these keys (use empty arrays if not mentioned):

1. "hobbies_or_activities": list of hobbies, sports, or activities the user wants to match on (e.g. "swimming", "gym", "running", "guitar", "reading", "coding"). Include common variants. Empty array [] if not specified.

2. "courses_or_subjects": list of courses or subjects (e.g. "CS 310", "Math", "Biology"). Empty array [] if not specified.

3. "looking_for_terms": what kind of connection they want (e.g. "study partner", "workout partner", "swimming partner", "someone to practice with"). Use lowercase. Empty array [] if not specified.

4. "keywords": list of important words from the query for semantic matching (e.g. "swimming", "partner", "gym"). Empty array [] if generic.

Rules:
- "I need a swimming partner" → hobbies_or_activities: ["swimming"], looking_for_terms: ["partner", "swimming partner"], keywords: ["swimming", "partner"]
- "find someone to study CS with" → courses_or_subjects: ["CS", "Computer Science"], looking_for_terms: ["study partner"], keywords: ["study", "CS"]
- "gym buddy" or "workout partner" → hobbies_or_activities: ["gym", "workout"], looking_for_terms: ["buddy", "partner"], keywords: ["gym", "workout", "partner"]
- "people who like hiking" → hobbies_or_activities: ["hiking"], keywords: ["hiking"]

Return ONLY the JSON object, no other text."""


def extract_search_intent_student(query: str) -> dict:
    """Extract intent for student/partner search. Uses Ollama first, then Groq fallback."""
    prompt = _student_intent_prompt(query.strip())
    text = _student_search_llm(prompt)
    if not text:
        return {"hobbies_or_activities": [], "courses_or_subjects": [], "looking_for_terms": [], "keywords": []}
    try:
        out = json.loads(_strip_json_text(text))
        return {
            "hobbies_or_activities": out.get("hobbies_or_activities") or [],
            "courses_or_subjects": out.get("courses_or_subjects") or [],
            "looking_for_terms": out.get("looking_for_terms") or [],
            "keywords": out.get("keywords") or [],
        }
    except Exception as e:
        print(f"Extract search intent (student) error: {e}")
        return {"hobbies_or_activities": [], "courses_or_subjects": [], "looking_for_terms": [], "keywords": []}


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


def _student_matches_intent(student: dict, intent: dict) -> bool:
    """Step 2 helper: does this student match extracted hobbies, courses, looking_for (OR within category, AND across if any specified)."""
    hobbies = (student.get("hobbies") or "").lower()
    areas = (student.get("areas_of_interest") or "").lower()
    looking_for = (student.get("looking_for_str") or "").lower()
    courses_str = (student.get("courses_str") or "").lower()
    bio = f"{hobbies} {areas} {looking_for} {courses_str}"

    if intent.get("hobbies_or_activities"):
        if not any(term.lower() in bio for term in intent["hobbies_or_activities"]):
            return False
    if intent.get("courses_or_subjects"):
        if not any(term.lower() in courses_str or term.lower() in areas for term in intent["courses_or_subjects"]):
            return False
    if intent.get("looking_for_terms"):
        if not any(term in looking_for or term in hobbies or term in areas for term in intent["looking_for_terms"]):
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
        response = _groq_create(
            GROQ_MODEL,
            [{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=512,
        )
        text = _strip_json_text(response.choices[0].message.content)
        ids = json.loads(text)
        if not isinstance(ids, list):
            ids = [ids] if ids else []
        id_set = {a["id"] for a in alumni_list}
        ordered = [i for i in ids if i in id_set][:top_n]
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

    # Step 1: Extract intent & keywords (alumni-specific); fallback to query-derived keywords if LLM fails/empty
    q_clean = query.strip()
    intent = extract_search_intent(q_clean, role="alumni")
    if not (intent.get("keywords") or intent.get("companies") or intent.get("job_titles_or_roles") or intent.get("majors")):
        intent["keywords"] = _query_to_keywords(q_clean)

    # Step 2: Filter by extracted keywords (AND logic when multiple; relax if over-filtered)
    filtered = [a for a in alumni_list if _alumni_matches_intent(a, intent)]

    # If filter too strict, relax: company OR role match, or any keyword in profile text
    if not filtered and (intent.get("companies") or intent.get("job_titles_or_roles")):
        seen_ids = set()
        for a in alumni_list:
            company = (a.get("company") or "").lower()
            job_title = (a.get("job_title") or "").lower()
            bio = (a.get("bio") or "").lower()
            combined = f"{company} {job_title} {bio}"
            if intent.get("companies") and any(c.lower() in company for c in intent["companies"]):
                if a["id"] not in seen_ids:
                    seen_ids.add(a["id"])
                    filtered.append(a)
            elif intent.get("job_titles_or_roles") and any(role in combined for role in intent["job_titles_or_roles"]):
                if a["id"] not in seen_ids:
                    seen_ids.add(a["id"])
                    filtered.append(a)
        if not filtered:
            filtered = list(alumni_list)
    if not filtered and intent.get("keywords"):
        for a in alumni_list:
            combined = " ".join([
                str(a.get("company") or ""),
                str(a.get("job_title") or ""),
                str(a.get("major") or ""),
                str(a.get("bio") or ""),
            ]).lower()
            if any(kw.lower() in combined for kw in intent["keywords"]):
                filtered.append(a)
    if not filtered:
        filtered = list(alumni_list)

    # Step 3: Semantic rank (LLM), then combine with regex keyword score
    ordered_ids = rank_alumni_by_relevance(q_clean, intent, filtered, top_n=top_n)
    id_to_alum = {a["id"]: a for a in filtered}
    combined_ids = _combine_regex_semantic_ranking(
        ordered_ids, id_to_alum, intent, "alumni", top_n, query=q_clean
    )
    return [id_to_alum[aid] for aid in combined_ids if aid in id_to_alum]


def _rank_students_prompt(query: str, intent: dict, summaries: list, top_n: int) -> str:
    """Shared prompt for ranking students (Ollama or Groq)."""
    return f"""You are a relevance ranker for a university STUDENT directory (finding study partners, activity partners, etc.). The user searched: "{query}"

Extracted intent: hobbies/activities={intent.get('hobbies_or_activities')}, courses={intent.get('courses_or_subjects')}, looking_for={intent.get('looking_for_terms')}, keywords={intent.get('keywords')}

Student profiles (already pre-filtered; now rank by relevance):
{json.dumps(summaries, indent=2)}

Task: Rank these profiles by relevance to the user's search (best match first). Return exactly the top {top_n} profile ids in order of relevance. If there are fewer than {top_n}, return all in ranked order.

Return ONLY a JSON array of ids, e.g. ["id1", "id2", "id3"]. No other text."""


def rank_students_by_relevance(query: str, intent: dict, students_list: list, top_n: int = TOP_STUDENT_SEARCH_RESULTS) -> list:
    """
    Step 3 (students): Rank filtered students by relevance. Uses Ollama first, then Groq.
    Returns list of student ids in order of relevance (best first), max top_n.
    """
    if not students_list:
        return []
    if len(students_list) <= top_n and not intent.get("keywords"):
        return [s["id"] for s in students_list]
    summaries = []
    for s in students_list:
        summaries.append({
            "id": s["id"],
            "name": s.get("name") or "",
            "major": s.get("major") or "",
            "year": s.get("year") or "",
            "hobbies": (s.get("hobbies") or "")[:200],
            "areas_of_interest": (s.get("areas_of_interest") or "")[:200],
            "looking_for": (s.get("looking_for_str") or "")[:200],
        })
    text = _student_search_llm(_rank_students_prompt(query, intent, summaries, top_n))
    if not text:
        return [s["id"] for s in students_list][:top_n]
    try:
        ids = json.loads(_strip_json_text(text))
        if not isinstance(ids, list):
            ids = [ids] if ids else []
        id_set = {s["id"] for s in students_list}
        ordered = [i for i in ids if i in id_set][:top_n]
        for s in students_list:
            if s["id"] not in ordered and len(ordered) < top_n:
                ordered.append(s["id"])
        return ordered
    except Exception as e:
        print(f"Rank students error: {e}")
        return [s["id"] for s in students_list][:top_n]


def search_students_natural_language(query: str, students_list: list, top_n: int = TOP_STUDENT_SEARCH_RESULTS) -> list:
    """
    Full pipeline for students: Extract intent (Ollama/Groq) → Filter by hobbies/courses/looking_for → Rank by relevance.
    Returns list of student dicts in relevance order, max top_n. Use for "I need a swimming partner" style queries.
    """
    if not query or not query.strip():
        return students_list[:top_n] if students_list else []
    if not students_list:
        return []

    # Step 1: Extract intent (student-specific); fallback to query-derived keywords if LLM fails/empty
    q_clean = query.strip()
    intent = extract_search_intent(q_clean, role="student")
    if not (intent.get("keywords") or intent.get("hobbies_or_activities") or intent.get("courses_or_subjects") or intent.get("looking_for_terms")):
        intent["keywords"] = _query_to_keywords(q_clean)

    # Step 2: Filter by hobbies, courses, looking_for; if only keywords (e.g. fallback), match any keyword in text
    filtered = [s for s in students_list if _student_matches_intent(s, intent)]
    if not filtered and intent.get("keywords"):
        for s in students_list:
            combined = " ".join([
                str(s.get("hobbies") or ""),
                str(s.get("areas_of_interest") or ""),
                str(s.get("looking_for_str") or ""),
                str(s.get("courses_str") or ""),
            ]).lower()
            if any(kw.lower() in combined for kw in intent["keywords"]):
                filtered.append(s)
    if not filtered:
        filtered = list(students_list)

    # Step 3: Semantic rank (LLM), then combine with regex keyword score
    ordered_ids = rank_students_by_relevance(q_clean, intent, filtered, top_n=top_n)
    id_to_student = {s["id"]: s for s in filtered}
    combined_ids = _combine_regex_semantic_ranking(
        ordered_ids, id_to_student, intent, "student", top_n, query=q_clean
    )
    return [id_to_student[sid] for sid in combined_ids if sid in id_to_student]


def explain_match(student, target, match_score):
    """Generate AI explanation for match score. Uses fallback model on 429; returns safe fallback on any error."""
    fallback_reasons = [
        "Shared major or field of study",
        "Relevant experience in target company",
        "Strong profile match",
    ]
    student_resume = student.get("resume_text", "")
    resume_snippet = student_resume[:500] if student_resume else ""

    prompt = f"""Explain why this is a {match_score}% match between a student and target.

Student: {student.get('major', 'GMU student')}, interested in {student.get('interests', 'career growth')}
{f'Resume snippet: {resume_snippet}...' if resume_snippet else ''}

Target: {target.get('major', '')} graduate, {target.get('job_title', '')} at {target.get('company', '')}

Provide 2-3 bullet points explaining the match. Be specific and concise. If resume content is provided, use it to find connections.
Return as JSON array: ["reason 1", "reason 2", "reason 3"]"""

    try:
        response = _groq_create(
            GROQ_MODEL,
            [{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=256,
        )
        text = (response.choices[0].message.content or "").strip()
        if not text:
            return fallback_reasons
        parsed = json.loads(_strip_json_text(text))
        return parsed if isinstance(parsed, list) and parsed else fallback_reasons
    except Exception as e:
        print(f"AI explanation error: {e}")
        return fallback_reasons