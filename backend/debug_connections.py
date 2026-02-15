from database import SessionLocal
from models import User, Connection

def debug_connections():
    db = SessionLocal()
    
    print("\n" + "=" * 60)
    print("ALL USERS IN DATABASE")
    print("=" * 60)
    users = db.query(User).all()
    for user in users:
        print(f"ID: {user.id}")
        print(f"Name: {user.name}")
        print(f"Email: {user.email}")
        print(f"Role: {user.role}")
        print("-" * 60)
    
    print("\n" + "=" * 60)
    print("ALL CONNECTIONS IN DATABASE")
    print("=" * 60)
    connections = db.query(Connection).all()
    
    if not connections:
        print("❌ NO CONNECTIONS FOUND IN DATABASE")
    else:
        for conn in connections:
            requester = db.query(User).filter(User.id == conn.requester_id).first()
            target = db.query(User).filter(User.id == conn.target_id).first()
            
            print(f"\nConnection ID: {conn.id}")
            print(f"Status: {conn.status}")
            print(f"Created: {conn.created_at}")
            
            if requester:
                print(f"From: {requester.name} ({requester.email})")
            else:
                print(f"From: DELETED USER (ID: {conn.requester_id})")
            
            if target:
                print(f"To: {target.name} ({target.email})")
            else:
                print(f"To: DELETED USER (ID: {conn.target_id})")
            
            print(f"Message: {conn.message}")
            print("-" * 60)
    
    print("\n" + "=" * 60)
    print("CHECKING SPECIFIC USERS")
    print("=" * 60)
    
    shreyas = db.query(User).filter(User.email == 'shreyaspatil1901@gmail.com').first()
    sumukh = db.query(User).filter(User.email == 'sumukh@gmu.edu').first()
    
    if shreyas:
        print(f"\n✅ Shreyas: {shreyas.id}")
        # Check connections where Shreyas is involved
        shreyas_conns = db.query(Connection).filter(
            (Connection.requester_id == shreyas.id) | (Connection.target_id == shreyas.id)
        ).all()
        print(f"   Connections: {len(shreyas_conns)}")
        for c in shreyas_conns:
            print(f"   - {c.status} (ID: {c.id})")
    else:
        print("\n❌ Shreyas not found")
    
    if sumukh:
        print(f"\n✅ Sumukh: {sumukh.id}")
        # Check connections where Sumukh is involved
        sumukh_conns = db.query(Connection).filter(
            (Connection.requester_id == sumukh.id) | (Connection.target_id == sumukh.id)
        ).all()
        print(f"   Connections: {len(sumukh_conns)}")
        for c in sumukh_conns:
            print(f"   - {c.status} (ID: {c.id})")
        
        # Check pending requests TO Sumukh
        pending_to_sumukh = db.query(Connection).filter(
            Connection.target_id == sumukh.id,
            Connection.status == 'pending'
        ).all()
        print(f"\n   Pending requests TO Sumukh: {len(pending_to_sumukh)}")
        for c in pending_to_sumukh:
            req = db.query(User).filter(User.id == c.requester_id).first()
            if req:
                print(f"   - From {req.name} ({req.email})")
    else:
        print("\n❌ Sumukh not found")
    
    db.close()

if __name__ == "__main__":
    debug_connections()
