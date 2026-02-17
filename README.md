# ConnectEd - GMU Student Connection Platform
Demo link : https://youtu.be/_xJn7om-Tv4

A full-stack web application connecting GMU students with alumni and peer tutors, powered by AI-driven matching using Claude API.

## 🎓 Features

- **Alumni Network**: Connect with GMU graduates working at top tech companies (Google, Amazon, Microsoft, etc.)
- **Peer Tutoring**: Find student tutors who excel in specific courses
- **AI-Powered Matching**: Claude AI intelligently matches students with the best tutors based on grades, GPA, and expertise
- **Help Requests**: Students can post help requests and get matched with qualified tutors
- **Smart Profiles**: Detailed profiles for students and alumni with courses, grades, and experience

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **SQLite** - Lightweight database
- **Groq API** - AI-powered tutor matching
- **JWT Authentication** - Secure user authentication

### Frontend
- **React 18** - UI library
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client

## 📁 Project Structure

```
Connected/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── database.py          # Database configuration
│   ├── auth.py              # Authentication utilities
│   ├── ai_service.py        # Claude AI integration
│   ├── init_db.py           # Database initialization
│   ├── seed.py              # Seed data script
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── package.json         # Node dependencies
│   ├── vite.config.js       # Vite configuration
│   └── tailwind.config.js   # Tailwind configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- **Python 3.11 or 3.12** (backend; 3.13 is not supported by pinned dependencies)
- Node.js 16+

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment (use Python 3.11 or 3.12):
```bash
python3.12 -m venv venv   # or python3.11 -m venv venv
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```bash
copy .env.example .env
```

5. Edit `.env` and add your Groq API key:
```
GROQ_API_KEY=your_api_key_here
SECRET_KEY=your_secret_key_here
DATABASE_URL=sqlite:///./connected.db
```

6. Initialize database:
```bash
python init_db.py
```

7. Seed database with sample data:
```bash
python seed.py
```

8. Run the server:
```bash
uvicorn main:app --reload --port 8000
```

Backend will be available at http://localhost:8000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

Frontend will be available at http://localhost:5173

## 📊 Database Schema

### Users Table
- Stores both students and alumni
- Includes profile information, role, GPA, courses
- Supports tutor designation for students

### Courses Table
- GMU courses (CS, MATH, ENGR departments)
- Course codes and names

### Student_Courses Table
- Many-to-many relationship
- Tracks grades and tutoring capability

### Help_Requests Table
- Student help requests for courses
- Urgent flag for priority matching

### Tutor_Matches Table
- AI-generated matches with scores
- Stores match reasons from Claude AI

### Connections Table
- Alumni-student connection requests
- Status tracking (pending/accepted/declined)

## 🎯 Sample Data

The seed script creates:
- **15 Alumni** from companies like Google, Amazon, Microsoft, Capital One, Accenture, Deloitte
- **10 Students** across different years (Freshman to Senior)
- **8 Tutors** with course expertise
- **20 GMU Courses** (CS, MATH, ENGR)
- **5 Open Help Requests**

### Test Credentials
All seeded users have password: `password123`

Sample logins:
- Student: `aturner@gmu.edu` (Alex Turner - Tutor)
- Alumni: `sarah.chen@gmu.edu` (Google Engineer)

## 🤖 AI Features

The application uses Groq's Llama 3.1 70B model for intelligent tutor matching:
- Analyzes help request content
- Evaluates tutor qualifications (grades, GPA, bio)
- Generates match scores (0-100)
- Provides specific reasons for each match
- Ranks tutors by relevance

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/alumni` - Get all alumni
- `GET /api/users/tutors` - Get all tutors
- `GET /api/users/{user_id}` - Get user by ID

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/{course_id}` - Get course by ID

### Help Requests
- `GET /api/help-requests` - Get all help requests
- `POST /api/help-requests` - Create help request
- `GET /api/help-requests/{request_id}/matches` - Get AI-matched tutors

### Connections
- `POST /api/connections` - Create connection request
- `GET /api/connections/{user_id}` - Get user connections

## 🐛 Troubleshooting

### Backend Issues
- Ensure Python virtual environment is activated
- Check that all dependencies are installed
- Verify `.env` file has correct API keys

### Frontend Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check that backend is running on port 8000
- Verify proxy configuration in vite.config.js

### Database Issues
- Delete `connected.db` and run `init_db.py` again
- Re-run `seed.py` to populate data

## 📧 Support

For issues or questions, please open an issue on the repository.

---

Built with ❤️ for GMU Patriots 🟢🟡
