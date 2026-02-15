import sqlite3

def add_resume_columns():
    conn = sqlite3.connect('connected.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN resume TEXT")
        print("Added resume column")
    except sqlite3.OperationalError:
        print("resume column already exists")
    
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN resume_filename TEXT")
        print("Added resume_filename column")
    except sqlite3.OperationalError:
        print("resume_filename column already exists")
    
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN resume_parsed_text TEXT")
        print("Added resume_parsed_text column")
    except sqlite3.OperationalError:
        print("resume_parsed_text column already exists")
    
    conn.commit()
    conn.close()
    print("Database updated successfully!")

if __name__ == "__main__":
    add_resume_columns()
