import PyPDF2
import io
import base64
from docx import Document

def parse_resume(file_content: bytes, filename: str) -> str:
    """Extract text from PDF or DOCX resume"""
    try:
        if filename.lower().endswith('.pdf'):
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        
        elif filename.lower().endswith('.docx'):
            doc = Document(io.BytesIO(file_content))
            text = "\n".join([para.text for para in doc.paragraphs])
            return text.strip()
        
        elif filename.lower().endswith('.txt'):
            return file_content.decode('utf-8')
        
        return ""
    except Exception as e:
        print(f"Error parsing resume: {e}")
        return ""

def encode_file_to_base64(file_content: bytes) -> str:
    """Encode file content to base64 string"""
    return base64.b64encode(file_content).decode('utf-8')

def decode_base64_to_file(base64_str: str) -> bytes:
    """Decode base64 string to file content"""
    return base64.b64decode(base64_str)
