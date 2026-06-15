# AI Interview Simulator Platform

This is a modern, production-level Full Stack AI-powered Interview Simulator Platform. 

## Current Status (End of Day 1)
✅ **Milestone 1 Complete**
- Monorepo structure initialized (`frontend/` and `backend/`).
- Express backend setup with MongoDB connection and User models.
- JWT Authentication APIs created (Login, Register).
- React + Parcel frontend setup with Tailwind CSS, Framer Motion, and Redux Toolkit.
- Premium UI built for the Landing Page and Auth Pages (Login/Signup).

## Next Steps (Milestone 2)
- Implement protected routes and Redux auth slice on the frontend.
- Build the User Dashboard UI with Recharts.
- Create the Interview Setup Page.
- Implement backend APIs to save/fetch interview configurations.
- Add basic resume parsing (`multer`, `pdf-parse`).

## How to Run the App Locally
1. **Backend:**
   - Navigate to the `backend/` folder.
   - Open the `.env` file and add your MongoDB Atlas URI, Groq API key, etc.
   - Run `npx nodemon server.js` to start the backend.
2. **Frontend:**
   - Navigate to the `frontend/` folder.
   - Run `npx parcel index.html` to start the development server.

> Note: Detailed progress is tracked in the `task.md` artifact which will be automatically restored when you resume our conversation.
