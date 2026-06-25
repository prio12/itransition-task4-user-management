# User Management App

A full-stack user management dashboard built with React, TypeScript, Express, and PostgreSQL (via Supabase). Users can register, log in, and manage other users — block, unblock, or delete them — from a clean admin table.

## Live Demo

- Frontend: https://userbase-client.vercel.app
- Backend: https://userbase-api.vercel.app

---

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, Bootstrap 5, Axios

**Backend:** Node.js, Express, PostgreSQL (Supabase), JWT, Nodemailer

---

## Features

- User registration with async email verification
- JWT-based authentication
- Admin table with bulk select (checkboxes) and toolbar actions: Block, Unblock, Delete, Delete Unverified
- No per-row buttons — all actions go through the toolbar
- Email uniqueness enforced via a database-level unique index (not app-level checks)
- Middleware checks user status on every protected request — blocked or deleted users get redirected to login immediately
- Blocked users can't log in; deleted users can re-register

---

## Project Structure

├── client/ # React + Vite frontend

│ └── src/

│ ├── components/

│ ├── context/ # Auth context

│ └── App.tsx

│

└── server/ # Express backend

├── config/ # DB connection

├── controllers/

├── middleware/ # Auth + status check

├── routes/

└── server.js

---

## Local Setup

### Prerequisites

- Node.js v18+
- PostgreSQL database (or Supabase)
- Gmail account with App Password for email sending

### 1. Clone

```bash
git clone https://github.com/prio12/itransition-task4-user-management.git
cd itransition-task4-user-management
```

### 2. Backend

```bash
cd server
npm install
```

Create a `.env` file:

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
NODE_ENV=development
```

```bash
npm run dev
```

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`.

---

## Deployment

Both frontend and backend are deployed on Vercel. The backend runs as a serverless function configured via `vercel.json`.
