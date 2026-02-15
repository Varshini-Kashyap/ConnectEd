# LinkedIn-Style Messaging Setup

## 🚀 Setup Steps

### 1. Update Database
```bash
cd backend
python update_db.py
```
This creates the `messages` table.

### 2. Restart Backend
```bash
uvicorn main:app --reload
```

### 3. Test the Feature

**From Shreyas's account:**
1. Go to Career tab
2. Find Sumukh's card
3. Should see blue "Message" button (since connection is accepted)
4. Click "Message" → Chat popup appears in bottom-right corner

**From Sumukh's account:**
1. Go to Career tab  
2. Find Shreyas's card
3. Click "Message" button
4. Chat popup opens

## ✨ Features

### LinkedIn-Style Chat Popup
- ✅ Appears in bottom-right corner
- ✅ Can minimize/maximize
- ✅ Can close
- ✅ Multiple chat windows (stacked)
- ✅ Real-time updates (polls every 3 seconds)
- ✅ Shows sender/receiver messages differently
- ✅ Timestamps on messages
- ✅ Smooth scrolling to latest message

### Message Flow
1. Click "Message" button on connected alumni
2. Chat popup opens
3. Type message and press Enter or click Send
4. Message appears instantly
5. Other person sees it within 3 seconds
6. Can minimize chat to keep it open but out of the way

## 🎨 UI Details

**Chat Popup:**
- Width: 384px (96 in Tailwind)
- Height: 500px
- Position: Fixed bottom-right
- Header: GMU green with user info
- Messages: Gray background, white bubbles
- Your messages: Green background (right side)
- Their messages: White background (left side)
- Input: Bottom with Send button

**Multiple Chats:**
- Stack horizontally from right to left
- Each offset by 20px
- Can have multiple open at once

## 🔄 Real-time Updates

- Messages poll every 3 seconds
- No page refresh needed
- Automatic scroll to latest message
- Works across multiple tabs/windows

## 🐛 Troubleshooting

**Chat button not showing:**
- Make sure connection status is 'accepted'
- Check browser console for errors
- Verify backend is running

**Messages not sending:**
- Check network tab for API errors
- Verify you're logged in
- Check backend logs

**Messages not updating:**
- Wait 3 seconds for poll
- Check browser console
- Verify connection ID is correct
