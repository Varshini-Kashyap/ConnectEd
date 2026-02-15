# Why APIs Are Called So Often

## Summary

Several parts of the app call the backend **on a schedule** (polling) or **per item** (e.g. one call per alumni card). That’s why you see many API calls.

---

## 1. **Per-card AI calls (biggest cost)**

| Where | What | Why it’s “many” |
|-------|------|------------------|
| **AlumniCard** | `GET /api/ai/match-explanation/{target_id}` | **Every alumni card** on the Career page calls this once when it mounts. So 15 cards ⇒ 15 requests, each one using the **LLM** (Groq). |

**What it’s for:** Filling the “Why this match?” tooltip (AI-generated reasons for the match score).

**Change made:** The app now fetches match explanation **only when the user hovers** over the match score, so we don’t call the API for every card on load.

---

## 2. **Polling (repeated on a timer)**

| Where | API | Interval | What it’s for |
|-------|-----|----------|----------------|
| **Navbar** | `GET /api/connections/pending` | Every **10 s** | Badge count for “Requests” (pending connection requests). |
| **ConnectionRequests** (Requests page) | `GET /api/connections/pending` | Every **5 s** | Same data: list of pending requests. |
| **ChatPopup** (each open chat) | `GET /api/messages/{connectionId}` | Every **2 s** | Refreshing messages in that conversation. |

So:

- Pending requests are fetched from **two places** (Navbar + Requests page), each on its own timer.
- Each open chat window polls messages every 2 seconds.

---

## 3. **One-time or on-action**

| Where | API | When |
|-------|-----|------|
| **Student page** | `GET /api/tutors`, `GET /api/help-requests`, `GET /api/courses` | Once on mount. |
| **Student “Find Partners”** | `GET /api/search?q=...&role=student` | When user clicks Search. |
| **Career page** | `GET /api/alumni`, `GET /api/connections/me` | On load; alumni again when filters/search change (debounced). |
| **MessageModal** | `POST /api/ai/draft-message` | Once when the Connect modal opens (AI draft for the message). |
| **Notifications** | `GET /api/notifications` | Once when the Notifications page opens. |

These are expected and not on a short timer.

---

## 4. **Optional tweaks**

- **Pending requests:** Use one source (e.g. Navbar or a shared store) and one interval (e.g. 15–30 s) instead of both Navbar (10 s) and ConnectionRequests (5 s).
- **Chat messages:** Increase poll interval (e.g. 5–10 s) or later switch to WebSockets.
- **Match explanation:** Already reduced by loading only on hover instead of for every card on load.
