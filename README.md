# Pulse Chat - Real-Time Web-Based Messaging Application

A modern, responsive, real-time one-to-one web messaging application built with Vanilla HTML5, CSS3, JavaScript, Python FastAPI, and Supabase (PostgreSQL, Authentication, Realtime, Storage).

---

## 🚀 Features

- **Authentication**: User registration, email & password login, secure session persistence, and protected routes via Supabase Auth.
- **Real-Time 1-to-1 Messaging**: Instant incoming message updates powered by Supabase Realtime WebSocket subscriptions (`postgres_changes`).
- **User Discovery**: Instant search for registered users with debounce and duplicate conversation prevention.
- **Profile Management**: Customizable username and avatar picture upload stored in Supabase Storage (`avatars` bucket).
- **Responsive UI/UX**: Modern Discord/WhatsApp-inspired design with Dark/Light theme switching, mobile drawer navigation, unread message badges, and smooth animations.
- **Enterprise Security**: PostgreSQL Row-Level Security (RLS) enforcing strict tenant isolation (users can only access conversations and messages they participate in).

---

## 🛠 Tech Stack

### Frontend
- **HTML5 & CSS3**: Custom CSS variables, responsive grid & flexbox layouts, light/dark mode.
- **Vanilla JavaScript**: ES6+ modules, Fetch API, Supabase JS SDK v2 for Realtime subscriptions.

### Backend
- **Python 3.11+**
- **FastAPI**: Async ASGI web framework.
- **Uvicorn**: Production ASGI web server.
- **Pydantic v2**: Strict data validation & schemas.
- **Supabase Python SDK**: Direct interaction with Supabase Auth, PostgreSQL, and Storage.

### Cloud & Database
- **Supabase PostgreSQL**: Relational schema with foreign keys, indexes, and triggers.
- **Supabase Auth**: Secure password hashing and JWT token issuance.
- **Supabase Realtime**: Live database event broadcasting.
- **Supabase Storage**: S3-compatible image hosting for user avatars.

---

## 📂 Project Structure

```text
Chatapp/
│
├── frontend/
│   ├── index.html            # Main real-time chat interface & modals
│   ├── login.html            # Login screen
│   ├── register.html         # User sign-up screen
│   ├── css/
│   │   ├── style.css         # Main theme tokens and layout styling
│   │   ├── auth.css          # Authentication screen styling
│   │   └── responsive.css    # Mobile and tablet breakpoints
│   ├── js/
│   │   ├── config.js         # Frontend config & API endpoints
│   │   ├── supabase.js       # Supabase JS SDK client & session helpers
│   │   ├── api.js            # Fetch wrapper for authenticated backend calls
│   │   ├── auth.js           # Auth handlers, route guard, theme switcher
│   │   ├── profile.js        # Profile management & avatar upload
│   │   └── chat.js           # Realtime subscriptions, conversation & message logic
│   └── assets/
│
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI entrypoint & static file serving
│   │   ├── api/              # REST API route handlers
│   │   ├── core/             # Configuration, security dependencies, Supabase clients
│   │   ├── models/           # Database entity models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   └── services/         # Business logic layer
│   ├── requirements.txt
│   └── .env.example
│
├── supabase/
│   └── schema.sql            # Complete PostgreSQL schema, RLS policies & triggers
│
├── .gitignore
├── render.yaml               # Render Blueprint deployment specification
├── requirements.txt          # Root requirements for Render deployment
└── README.md
```

---

## 🗄️ Database Setup (Supabase)

1. Log into your [Supabase Dashboard](https://app.supabase.com/).
2. Open your project, navigate to the **SQL Editor** tab.
3. Open `supabase/schema.sql` from this repository, copy its contents, and execute them in the SQL Editor.
4. This will set up:
   - `profiles`, `conversations`, `conversation_participants`, and `messages` tables.
   - Profile creation trigger on user registration (`on_auth_user_created`).
   - Row Level Security (RLS) policies for complete privacy.
   - Realtime publication on `messages` and `conversations`.
   - `avatars` public storage bucket.

---

## 💻 Local Setup & Development

### 1. Prerequisites
- Python 3.10+
- A modern web browser

### 2. Environment Configuration
Create a `.env` file in the project root (or inside `backend/`):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-or-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
PORT=8000
ENVIRONMENT=development
CORS_ORIGINS=*
```

Also, update `frontend/js/config.js` with your `SUPABASE_URL` and `SUPABASE_ANON_KEY`:
```javascript
const CONFIG = {
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'your-supabase-anon-key',
  ...
};
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application
```bash
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
Open your browser at `http://127.0.0.1:8000`. The FastAPI backend serves both the REST API at `/api` and the frontend interface at `/`.

---

## ☁️ Deployment to Render

This application is ready for instant deployment as a **Render Web Service**.

### Option A: Automatic Blueprint Deployment
1. Push this repository to GitHub.
2. In the Render Dashboard, click **New +** > **Blueprint**.
3. Select your GitHub repository. Render will automatically detect `render.yaml`.
4. Fill in the environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Click **Apply**.

### Option B: Manual Web Service Setup
1. In Render Dashboard, click **New +** > **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/health`
4. In **Environment Variables**, add:
   - `SUPABASE_URL`: Your Supabase Project URL
   - `SUPABASE_KEY`: Your Supabase Anon/Publishable Key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key
   - `ENVIRONMENT`: `production`
5. Click **Create Web Service**.

---

## 🧪 End-to-End Testing Checklist

- [x] **Registration**: Register User A and User B.
- [x] **Login & Session**: Authenticate with email/password; session persists across browser refreshes.
- [x] **User Search**: Search for registered users by username/email.
- [x] **Start Conversation**: Start a 1-to-1 conversation without duplicate rooms.
- [x] **Real-Time Messaging**: Send a message from User A; appears instantly on User B's screen via Supabase Realtime.
- [x] **Reply**: User B replies, User A receives it immediately with timestamps.
- [x] **Profile & Avatar Upload**: Upload avatar to Supabase Storage; profile reflects updates.
- [x] **RLS Privacy Protection**: Verify that unauthorized users cannot read another user's messages or conversations.
