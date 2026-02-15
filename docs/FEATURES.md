# ConnectEd — Feature Summary (Detailed)

ConnectEd is a full-stack GMU student connection platform that connects students with alumni (career networking) and with peer tutors (academic help and activity partners). The app uses role-based flows, JWT auth, and multiple AI providers for natural-language search and matching.

---

## 1. Overview

- **Purpose:** Bridge GMU students with alumni for career mentorship and with peers for tutoring and activity partners (e.g. study buddies, swimming partners).
- **Roles:** **Student** and **Alumni** (separate onboarding and feature sets).
- **Entry:** Login/Signup → role-specific questionnaire (if profile incomplete) → Stream Selector (home) → Career and/or Student streams.

---

## 2. Authentication & Onboarding

### 2.1 Registration & Login

- **Register** (`/signup`): Email, password, name, role (student or alumni). Avatar from UI Avatars. JWT returned with user payload.
- **Login** (`/login`): Email + password. Returns JWT and user; `profile_completed` drives redirect to questionnaire when needed.
- **Session:** Token in `localStorage`; axios interceptor sends `Authorization: Bearer <token>`; 401 clears storage and redirects to login.
- **Help text:** Login shows “Need help? Contact your administrator” (no dead Forgot password).

### 2.2 Post-Login Flow

- If **profile not completed:** redirect to `/questionnaire`.
- If **profile completed:** redirect to `/stream-selector` (home).

### 2.3 Questionnaire (Profile Completion)

- **Route:** `/questionnaire` — role-specific component (Student vs Alumni).
- **Student questionnaire:** 3 steps with progress bar (“Step X of 3”).
  - Step 1: Major, minor, year.
  - Step 2: Career goals, target companies, areas of interest, skills, hobbies, “looking for” (e.g. career mentorship, study partners, tutoring).
  - Step 3: Review/submit.
- **Alumni questionnaire:** 3 steps with progress bar.
  - Step 1: Major, minor, graduation year.
  - Step 2: Company, job title, expertise, career journey, hobbies, help offered, technical topics, mentorship availability, response time, interaction mode.
  - Step 3: Review/submit.
- **API:** `PUT /api/auth/complete-profile` — updates user fields (major, company, job_title, year, etc.) and full `profile_data` JSON.
- **Toasts:** Success/error on submit.

---

## 3. Home (Stream Selector)

- **Route:** `/stream-selector` (protected).
- **Content:** Welcome by first name; “Connect with heart” accent; two streams as cards.
- **Streams:**
  - **Connect for Career** — for everyone. Describes: browse alumni by company & major, AI match scores, send connection requests. CTA → `/career`.
  - **Find Tutors & Partners** — students only. Describes: find tutors by course, natural-language partner search (e.g. swimming partner), post help requests. CTAs → `/student`.
- **Footer:** “Made with ❤ for Patriots” + app footer (ConnectEd · GMU, links to Career, Profile).

---

## 4. Career Stream (Alumni Networking)

### 4.1 Career Page (`/career`)

- **Audience:** Students and alumni (alumni browse other alumni).
- **Layout:** Gradient hero “Career Networking” → search bar → filter pills (Major, Company) → view toggle (grid/list) → alumni cards.
- **Search:** Free-text query; when `q` is present, backend runs **three-step search:** extract intent (alumni-specific) → filter by keywords + semantic match → rank by relevance (Groq). Combines regex keyword scoring with LLM ranking; returns top 15.
- **Filters:** Major and Company pills; “All” ignored so search works with default filters.
- **Alumni cards (AlumniCard):**
  - Header: gradient strip, avatar, **match score badge** (e.g. “92% match”) — prominent number + “match” label; hover shows “Why this match?” tooltip (portal-rendered, not clipped).
  - Body: Name, job title, company; AI suggestion line (first match reason); connection status (Request Pending / Connected / Connect + Message).
  - **Connect:** Opens MessageModal for optional message; sends connection request. Toast on success.
  - **Message (when connected):** Opens chat with that connection.
- **Loading:** Skeleton alumni cards (6) in same grid/list layout.
- **Empty state:** “No alumni found…” + “Try a different search or broaden your filters” + Clear filters button.
- **Error:** Inline panel with message + **Retry** button that refetches with current filters.

### 4.2 Backend (Career)

- **GET /api/alumni:** Query params `q`, `major`, `company`. Returns alumni with `match_score` (cached or computed via `compute_career_match`). If `q` provided, runs `search_alumni_three_step` (intent → filter → rank) and returns ordered list.
- **GET /api/alumni/{id}:** Single alumnus.
- **POST /api/connections:** Create connection request (requester_id, target_id, message).
- **GET /api/connections/me:** All connections for current user (with other_user).
- **GET /api/connections/pending:** Pending requests where current user is target.
- **PUT /api/connections/{id}/accept | decline:** Accept or decline.
- **GET /api/ai/match-explanation/{target_id}:** Returns cached or computed match score + reasons (Groq) for student–alumni pair; used by AlumniCard tooltip.

---

## 5. Student Stream (Tutors, Partners, Help Requests)

### 5.1 Student Page (`/student`)

- **Tabs:** Find Tutors | Find Partners | Post Request | My Requests.
- **Find Tutors:**
  - Course filter (dropdown); search by name/interest; grid/list view.
  - **TutorCard:** Name, year, GPA, course tags, hobbies (with emoji), “Shared interest summary,” Request Session / Message.
  - Loading: skeleton tutor cards. Empty: “No tutors found” / “Try selecting a different course.”
- **Find Partners:**
  - Natural-language search (e.g. “I need a swimming partner”). **Search** calls `GET /api/search?q=...&role=student&top_n=10`.
  - Backend: **Ollama (local, free) → Claude → Groq** for intent extraction; regex + semantic scoring; ranking; returns top 10. Combines regex keyword match with LLM ranking.
  - Results as **PartnerCard** list (name, major, year, avatar, etc.).
  - Empty: “Try different words (e.g. swimming, study partner, gym).”
- **Post Request:** HelpRequestForm — course, title, description, urgent; submit creates help request and can trigger AI matching (tutor match).
- **My Requests:** List of current user’s help requests; empty state with “Post a help request” CTA. “View Matched Tutors” (placeholder toast for now).
- **Error:** Banner with message + **Retry** that refetches tutors, requests, and courses.

### 5.2 Backend (Student)

- **GET /api/tutors:** Optional `course`, `subject`. Returns students with `is_tutor` and course links (can_tutor); includes courses, GPA, bio, hobbies.
- **GET /api/courses:** List of GMU courses.
- **POST /api/help-requests:** Create help request (student_id, course_id, title, description, urgent).
- **GET /api/help-requests:** List; optional `status`.
- **POST /api/help-requests/{id}/match:** AI tutor matching (Groq): match_tutors_with_request returns match_score + reasons; stored in TutorMatch; returns list of tutor_id, tutor_name, tutor_gpa, match_score, match_reasons.
- **GET /api/search:** Natural-language search. Params: `q`, `role` (student | alumni), `top_n`. For **student:** builds student list (hobbies, areas_of_interest, looking_for_str, courses_str); runs **search_students_natural_language** (intent via Ollama/Claude/Groq → filter by hobbies/courses/looking_for + keyword fallback → rank → combine regex + semantic → top N). For **alumni:** search_alumni_three_step.

---

## 6. Messaging & Notifications

### 6.1 Messaging

- **Floating button:** MessagingButton (bottom-right) opens list of accepted connections; user can open a chat.
- **Chat popups:** First chat full-screen on mobile; on desktop 380×520 bottom-right. Multiple chats stacked; minimize/close per chat. Warm-theme bubbles, timestamps, empty state.
- **Messages page:** `/messages` — list of accepted connections (skeleton while loading); click opens chat. Error state with **Retry**.
- **API:** `GET /api/connections/accepted` (for list); `POST /api/messages` (send); `GET /api/messages/{connection_id}` (thread). Messages only within accepted connections.

### 6.2 Notifications

- **Route:** `/notifications` (nav link with badge count).
- **Content:** Pending connection requests: requester avatar, name, message, time; **Accept** / **Decline**.
- **Toasts:** Success/error on Accept and Decline.
- **Loading:** Skeleton notification rows (4).
- **Empty state:** Copy + primary CTA: “Go to Career” (alumni) or “Browse alumni” (students).
- **Error:** Message + **Retry** to refetch.
- **Polling:** Pending count and list refreshed periodically (e.g. 10s).

### 6.3 Backend

- **GET /api/notifications:** Pending connection requests where current user is target (with requester info).
- **GET /api/connections/accepted:** Accepted connections for current user (for messaging list).
- **POST /api/messages:** Send message (connection_id, content).
- **GET /api/messages/{connection_id}:** Messages for that connection (ordered by time).

---

## 7. Profile & Resume

### 7.1 Profile Page (`/profile`)

- **View mode:** Sections: Basic Information (major, minor, year), Career/Goals or Career/Details, Hobbies & Interests (if present). Read-only until Edit.
- **Edit mode:** Single long form; **section progress line** (“Sections: Basic info · Career & goals” for students; “Sections: Basic info · Career & details · Availability” for alumni). Same fields as questionnaire plus mentorship availability (alumni). Save / Cancel.
- **Toasts:** “Profile updated successfully!” on save.
- **Footer:** App footer.

### 7.2 Resume Upload

- **Backend:** `POST /api/users/upload-resume` (PDF, DOCX, TXT). Parses text (resume_service), stores base64 blob + filename + parsed text; also writes into `profile_data.resume_text` for AI use.
- **GET /api/users/resume:** Returns filename and parsed_text (no blob in response).

---

## 8. AI Features (Detail)

### 8.1 LLM Stack

- **Groq:** Used for tutor matching, alumni search (intent + ranking), match explanation (career), draft message. Also fallback for student search (intent + ranking) when Ollama is unavailable. **Do not change these to Ollama.**
- **Ollama (local):** Used **only** for the **student/partner search** (Find Partners): Step 1 intent extraction, Step 3 ranking. No API key; unlimited. Env: `OLLAMA_BASE_URL`, `OLLAMA_MODEL`. Fallback: Groq if Ollama unavailable.

### 8.2 Student/Partner Search Pipeline

1. **Intent extraction:** From natural-language query (e.g. “I need a swimming partner”) → hobbies_or_activities, courses_or_subjects, looking_for_terms, keywords. **LLM:** Ollama first, then Groq fallback.
2. **Step 2 — Search database (SQLite):** Query students where hobbies, areas_of_interest, looking_for, or courses_taken (in profile_data JSON) match any extracted keyword using LIKE (regex-style). Students only.
3. **Step 3 — Rank:** LLM ranks the filtered list (Ollama first, then Groq). Return top 10.

### 8.3 Alumni Search Pipeline

- **Intent** (Groq): companies, job_titles_or_roles, majors, keywords.
- **Filter** by intent (AND/OR logic; relaxed if over-filtered).
- **Rank** (Groq); then **combine** regex + semantic (50/50) → top N.

### 8.4 Other AI

- **Tutor matching:** Groq analyzes help request + tutors (grades, GPA, bio); returns match_score and reasons; stored in TutorMatch.
- **Match explanation (career):** Groq generates “why this match” for student–alumni pair; cached in CareerMatchCache.
- **Draft message:** Groq generates short outreach message (student → alumni) for connection request.

---

## 9. UI/UX Features

### 9.1 Theming & Layout

- **Theme:** Light/dark via CSS variables (`data-theme`); ThemeSync reads preference; toggle in nav (and mobile drawer). Coral/cream palette; gradient CTAs; DM Sans + Inter.
- **Navbar:** Desktop horizontal links (Home, Student if not alumni, Career, Notifications with badge); mobile hamburger + right drawer (links, profile, theme, logout). Messages link removed (chat via floating button).
- **App footer:** ConnectEd · GMU + links (Career, Profile) on main app pages (Stream Selector, Career, Student, Profile, Messages, Notifications). Sticky bottom with flex layout.

### 9.2 Feedback & Loading

- **Toasts:** Success/error/info for profile save, questionnaire, connection send, Accept/Decline, partner search, etc. No blocking alerts in main flows.
- **Error boundary:** Global React error boundary with “Something went wrong” + Go home / Retry.
- **Skeletons:** Career (alumni cards), Student (tutor cards), Messages (connection rows), Notifications (notification rows). Spinners for auth, chat, notifications where appropriate.
- **Empty states:** Copy + primary CTA where applicable (Career: Clear filters; Notifications: Go to Career / Browse alumni; Messages: hint; Student: Post request, try different search).

### 9.3 Forms & Motion

- **Questionnaires:** Step 1–3 with progress bar and “Step X of 3”; Profile edit has section progress text.
- **Motion:** Staggered grid animations (Career, Student); card hover lift; `prefers-reduced-motion` respected.

### 9.4 Accessibility

- Focus rings; aria-label / aria-expanded / role where used; sr-only for theme toggle; keyboard support on Stream Selector cards; progress bar aria-* on questionnaires; tooltip role and portal so it’s not clipped.

---

## 10. Data & API Summary

### 10.1 Main Models (Backend)

- **User:** id, email, password_hash, name, role (student|alumni), avatar_url, major, minor, company, job_title, graduation_year, year, gpa, profile_data (JSON), resume (base64), resume_filename, resume_parsed_text.
- **Course, StudentCourse:** Courses and student–course links (grade, can_tutor).
- **Connection:** requester_id, target_id, status (pending|accepted|declined), message.
- **Message:** connection_id, sender_id, content, created_at.
- **HelpRequest:** student_id, course_id, title, description, urgent, status.
- **TutorMatch:** request_id, tutor_id, match_score, match_reasons.
- **CareerMatchCache:** student_id, target_id, match_score, reasons.

### 10.2 Key API Endpoints (Concise)

| Area        | Method | Endpoint                          | Description                    |
|------------|--------|-----------------------------------|--------------------------------|
| Auth       | POST   | /api/auth/register, /auth/login   | Register, login                |
| Auth       | GET    | /api/auth/me                      | Current user                   |
| Auth       | PUT    | /api/auth/complete-profile        | Questionnaire completion       |
| Career     | GET    | /api/alumni                       | Alumni list + optional search  |
| Career     | GET    | /api/alumni/{id}                  | Single alumnus                 |
| Career     | POST   | /api/connections                  | Send connection request        |
| Career     | GET    | /api/connections/me, /pending    | My connections, pending         |
| Career     | PUT    | /api/connections/{id}/accept, decline | Accept/decline            |
| Search     | GET    | /api/search                       | NL search (student or alumni)  |
| AI         | GET    | /api/ai/match-explanation/{id}    | Match score + reasons          |
| AI         | POST   | /api/ai/draft-message             | Draft outreach message         |
| Student    | GET    | /api/tutors, /api/courses         | Tutors, courses                |
| Student    | POST   | /api/help-requests                | Create help request            |
| Student    | GET    | /api/help-requests                | List help requests             |
| Student    | POST   | /api/help-requests/{id}/match     | AI tutor match                  |
| Messages   | GET    | /api/connections/accepted        | Accepted connections           |
| Messages   | POST   | /api/messages                     | Send message                   |
| Messages   | GET    | /api/messages/{connection_id}     | Thread                          |
| Notifications | GET  | /api/notifications                | Pending connection requests    |
| Profile    | POST   | /api/users/upload-resume          | Upload resume                  |
| Profile    | GET    | /api/users/resume                 | Resume metadata + parsed text  |

---

## 11. Tech Stack (Summary)

- **Backend:** FastAPI, SQLAlchemy, SQLite, JWT (auth), Groq, Ollama (HTTP, student search only), PyPDF2/python-docx (resume).
- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Axios; Zustand (auth, career, student, chat, toast).
- **Deployment:** Backend (e.g. uvicorn port 8000); frontend dev (Vite proxy to /api).

---

This document reflects the current ConnectEd feature set and is intended as a single detailed reference for all product and technical features.
