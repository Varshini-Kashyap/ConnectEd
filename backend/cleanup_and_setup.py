from database import SessionLocal
from models import User, Connection
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def cleanup_and_setup():
    db = SessionLocal()
    
    print("=" * 60)
    print("STEP 1: Cleaning up orphaned connections")
    print("=" * 60)
    
    # Delete all connections with deleted users
    all_connections = db.query(Connection).all()
    deleted_count = 0
    
    for conn in all_connections:
        requester = db.query(User).filter(User.id == conn.requester_id).first()
        target = db.query(User).filter(User.id == conn.target_id).first()
        
        if not requester or not target:
            print(f"Deleting orphaned connection: {conn.id}")
            db.delete(conn)
            deleted_count += 1
    
    db.commit()
    print(f"✅ Deleted {deleted_count} orphaned connections")
    
    print("\n" + "=" * 60)
    print("STEP 2: Creating/Updating Shreyas account")
    print("=" * 60)
    
    # Check if Shreyas exists
    shreyas = db.query(User).filter(User.email == 'shreyaspatil1901@gmail.com').first()
    
    if shreyas:
        print(f"✅ Shreyas already exists: {shreyas.id}")
    else:
        # Create Shreyas
        shreyas = User(
            email='shreyaspatil1901@gmail.com',
            password_hash=pwd_context.hash('password123'),
            name='Shreyas',
            role='alumni',
            major='Computer Science',
            graduation_year=2024,
            company='Amazon',
            job_title='Software Engineer 1',
            profile_data={
                'location': 'Virginia',
                'expertise_areas': 'Full stack',
                'career_journey': 'Started as an intern, then joined Google',
                'help_offered': ['Career guidance and industry insights', 'Resume and cover letter reviews', 'Networking strategies and tips'],
                'hobbies': 'Swimming',
                'accepting_requests': True
            },
            avatar_url='https://ui-avatars.com/api/?name=Shreyas&background=006633&color=fff'
        )
        db.add(shreyas)
        db.commit()
        db.refresh(shreyas)
        print(f"✅ Created Shreyas: {shreyas.id}")
    
    print("\n" + "=" * 60)
    print("STEP 3: Verifying Sumukh account")
    print("=" * 60)
    
    sumukh = db.query(User).filter(User.email == 'sumukh@gmu.edu').first()
    if sumukh:
        print(f"✅ Sumukh exists: {sumukh.id}")
        print(f"   Name: {sumukh.name}")
        print(f"   Role: {sumukh.role}")
    else:
        print("❌ Sumukh not found - please create account via signup")
    
    print("\n" + "=" * 60)
    print("SETUP COMPLETE!")
    print("=" * 60)
    print("\nYou can now:")
    print("1. Login as Shreyas: shreyaspatil1901@gmail.com / password123")
    print("2. Login as Sumukh: sumukh@gmu.edu / (your password)")
    print("3. Send connection requests between them")
    
    db.close()

if __name__ == "__main__":
    cleanup_and_setup()
