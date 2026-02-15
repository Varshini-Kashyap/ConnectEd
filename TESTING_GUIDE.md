# Testing Connection Requests Feature

## 🎯 What We Built

1. **Backend API Endpoints:**
   - `GET /api/connections/pending` - Get pending requests for logged-in user
   - Enhanced `GET /api/connections/me` - Get all connections with full user details
   - Existing accept/decline endpoints work as before

2. **Frontend Components:**
   - `ConnectionRequests` component - Shows pending requests with Accept/Decline buttons
   - `RequestsPage` - Page to display connection requests
   - Updated `Navbar` - Shows notification badge with count
   - Auto-refresh every 5-10 seconds

## 🧪 How to Test

### Step 1: Login as Shreyas
1. Open browser 1 (or incognito window)
2. Go to http://localhost:5173
3. Login with: `shreyaspatil1901@gmail.com`

### Step 2: Login as Sumukh
1. Open browser 2 (or different incognito window)
2. Go to http://localhost:5173
3. Login with: `sumukh@gmu.edu`

### Step 3: Send Connection Request
**From Shreyas's account:**
1. Go to "Career" tab (to see alumni) or wherever you can see Sumukh's profile
2. Click "Connect" button on Sumukh's profile
3. Optionally write a message: "Hey Sumukh, let's connect!"
4. Submit the request

### Step 4: See Notification
**From Sumukh's account:**
1. Look at the navbar - you should see "Requests" with a red badge showing "1"
2. Click on "Requests" in the navbar
3. You'll see Shreyas's connection request with:
   - Profile picture
   - Name and details
   - The message he sent
   - Accept and Decline buttons

### Step 5: Accept the Request
**From Sumukh's account:**
1. Click "Accept" button
2. The request disappears from the list
3. The notification badge updates to "0"

### Step 6: Verify Connection
**From both accounts:**
1. The connection should now show as "accepted"
2. Both users can see each other in their connections
3. Ready for messaging (next feature!)

## 🔄 Real-time Updates

- Notification badge updates every 10 seconds
- Pending requests list updates every 5 seconds
- No need to refresh the page!

## 🐛 Troubleshooting

**If notification doesn't appear:**
1. Check browser console for errors
2. Make sure backend is running on port 8000
3. Try manually refreshing the page
4. Check that both users are logged in with correct accounts

**If Accept button doesn't work:**
1. Check browser console for errors
2. Verify the connection was created in the database
3. Make sure you're logged in as the target user (not the requester)

## 📝 Database Check

To verify connections in the database:
```bash
cd backend
python
>>> from database import SessionLocal
>>> from models import Connection
>>> db = SessionLocal()
>>> connections = db.query(Connection).all()
>>> for c in connections:
...     print(f"{c.id}: {c.requester_id} -> {c.target_id} [{c.status}]")
```

## ✅ Success Criteria

- [x] Shreyas can send connection request to Sumukh
- [x] Sumukh sees notification badge in navbar
- [x] Sumukh can view request details
- [x] Sumukh can accept/decline request
- [x] Badge updates automatically
- [x] Connection status changes to 'accepted'
