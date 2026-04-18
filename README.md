# GymSpace

A web application for gym enthusiasts to browse gyms, view weekly workout schedules, and book time slots. Includes an AI-powered workout assistant powered by Google Gemini.

## Live Demo

- **Application:** https://gymspace-4sfc.onrender.com
- **Backend API:** https://gymspace-4sfc.onrender.com/api

> The frontend is served via Express static files from the same Render deployment.

## Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript (vanilla)
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Supabase)
- **AI Integration:** Google Gemini API (`@google/genai`)
- **Deployment:** Render (backend + static frontend)

## Features

- Browse and select between multiple gyms
- Weekly booking timetable with real-time date tracking
- User registration and login
- Book, view, and cancel time slots (max 3 per gym)
- Light/dark theme toggle with persistent preference
- AI Workout Assistant for fitness and workout questions

## Project Structure

```
project-gymspace/
├── frontend/
│   ├── index.html      # Main booking page
│   ├── ai.html         # AI Workout Assistant page
│   ├── style.css        # Shared stylesheet
│   ├── main.js          # Booking logic, auth, theme toggle
│   └── ai.js            # AI chat logic, theme toggle
├── backend/
│   ├── server.js        # Express API server
│   ├── db.js            # Database connection (Supabase/PostgreSQL)
│   ├── package.json     # Backend dependencies
│   └── .env             # Environment variables (not committed)
├── .gitignore
└── README.md
```

## AI Tool Usage

- **Google Gemini API** is integrated into the application as the AI Workout Assistant feature. It provides fitness and workout advice to users through the `/api/chat` endpoint.
- **AI coding assistants** were used during development to help with debugging, code structuring, and learning Express.js patterns. All AI-generated code was reviewed, understood, and adapted to fit the project.
