from database import SessionLocal
from models import User, Connection

def check_users():
    db = SessionLocal()
    
    print("=" * 50)
    print("CHECKING USER ACCOUNTS")
    print("=" * 50)
    
    # Check Shreyas
    shreyas = db.query(User).filter(User.email == 'shreyaspatil1901@gmail.com').first()
    if shreyas:
        print(f"✅ Shreyas found:")
        print(f"   ID: {shreyas.id}")
        print(f"   Name: {shreyas.name}")
        print(f"   Role: {shreyas.role}")
    else:
        print("❌ Shreyas NOT found")
    
    print()
    
    # Check Sumukh
    sumukh = db.query(User).filter(User.email == 'sumukh@gmu.edu').first()
    if sumukh:
        print(f"✅ Sumukh found:")
        print(f"   ID: {sumukh.id}")
        print(f"   Name: {sumukh.name}")
        print(f"   Role: {sumukh.role}")
    else:
        print("❌ Sumukh NOT found")
    
    print()
    print("=" * 50)
    print("CHECKING CONNECTIONS")
    print("=" * 50)
    
    if shreyas and sumukh:
        # Check connections between them
        connections = db.query(Connection).filter(
            ((Connection.requester_id == shreyas.id) & (Connection.target_id == sumukh.id)) |
            ((Connection.requester_id == sumukh.id) & (Connection.target_id == shreyas.id))
        ).all()
        
        if connections:
            for conn in connections:
                requester = db.query(User).filter(User.id == conn.requester_id).first()
                target = db.query(User).filter(User.id == conn.target_id).first()
                print(f"Connection found:")
                print(f"   From: {requester.name} ({requester.email})")
                print(f"   To: {target.name} ({target.email})")
                print(f"   Status: {conn.status}")
                print(f"   Message: {conn.message}")
                print()
        else:
            print("No connections found between Shreyas and Sumukh")
    
    db.close()

if __name__ == "__main__":
    check_users()
