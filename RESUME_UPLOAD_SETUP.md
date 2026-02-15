# Resume Upload Feature Setup

## Backend Setup

1. Install new dependencies:
```bash
cd backend
pip install PyPDF2==3.0.1 python-docx==1.1.0
```

2. Add resume columns to database:
```bash
python add_resume_columns.py
```

3. Restart the backend server:
```bash
uvicorn main:app --reload --port 8000
```

## Features

### File Upload
- Users can upload PDF, DOCX, or TXT files
- Files are stored as base64-encoded blobs in SQLite
- Maximum compatibility with all file types

### Resume Parsing
- Automatically extracts text from uploaded files
- Stores parsed text for AI analysis
- Supports:
  - PDF files (using PyPDF2)
  - DOCX files (using python-docx)
  - TXT files (plain text)

### Storage
- `resume`: Base64-encoded file content (blob)
- `resume_filename`: Original filename
- `resume_parsed_text`: Extracted text content

### API Endpoints
- `POST /api/users/upload-resume` - Upload resume file
- `GET /api/users/resume` - Get resume details and parsed text

### Frontend
- File upload section at top of Profile page
- Shows current uploaded file
- View parsed text preview
- Upload button with validation

## Usage

1. Go to Profile page
2. Click "Choose File" and select your resume (PDF/DOCX/TXT)
3. Click "Upload" button
4. File is parsed and stored in database
5. View details to see parsed text preview

## Notes
- Files are stored directly in SQLite as base64 strings
- No external file storage needed
- Parsed text can be used for AI matching and analysis
- Works for both students and alumni
