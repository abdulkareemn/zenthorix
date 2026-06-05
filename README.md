# 🛡️ ProctorAI — AI-Powered Proctored Exam Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=for-the-badge" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=for-the-badge" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white&style=for-the-badge" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white&style=for-the-badge" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white&style=for-the-badge" />
</p>

> **ProctorAI** (codenamed *Zenthorix*) is a secure, scalable, full-stack proctored examination platform that automates remote exam administration through real-time AI-based face detection, eye-gaze tracking, audio monitoring, and behaviour analysis — all without any third-party proctoring SDK.

---

## 📸 Screenshots

| Admin Dashboard | Live Proctoring | Exam Interface |
|---|---|---|
| Admin stats, candidate list, alert overview | Real-time session grid with recording playback | Code editor, timer, AI proctor panel |

---

## ✨ Features

### 🔐 Security & Identity
- **JWT session authentication** stored in HTTP-only cookies
- **Role-based access control** — separate Admin and Student portals
- **Registered-photo face verification** using pixel-level colour-signature matching
- Passwords hashed with **bcrypt (cost 12)**
- Input sanitisation and object-ID validation on every API route

### 🤖 AI Proctoring (client-side, zero third-party SDK)
| Signal | How it works |
|---|---|
| **Face detection** | Native `FaceDetector` API with skin-tone pixel estimation fallback |
| **Eye-gaze tracking** | Dark-pixel centroid analysis relative to face bounding box |
| **Mouth-open detection** | Dark pixel ratio in the lower-face region |
| **Extra-person detection** | Multi-face region counting; auto-submits after 4 frames |
| **Head-movement** | Visual-centre delta with exponential smoothing baseline |
| **Audio monitoring** | Web Audio API frequency analysis; flags speech above threshold |
| **Tab-switch & blur** | `visibilitychange` + `blur`; 3 violations → auto-submit |
| **Fullscreen enforcement** | `fullscreenchange` listener; re-enters automatically |
| **Keyboard blocking** | F12, Ctrl+Shift+I, Ctrl+U, Copy/Cut/Paste/Print all blocked |
| **Screen recording** | `MediaRecorder` captures webcam + audio throughout the exam |

### 👨‍💼 Admin Portal
- Dashboard with candidate, exam, alert, and shortlist statistics
- **Candidate management** — create/import (CSV), approve/block, assign exams
- **Exam builder** — title, description, duration, language, multi-question editor with per-question test-case sets
- **Live proctoring grid** — real-time submission list, recording playback, warn-candidate button
- **System alerts** — filterable list of all proctoring events across all submissions
- **Results & review** — answer code review, risk score, tab-switch count, publish/verify workflow
- **Settings** — webcam enforcement, audio monitoring, max tab switches, randomise questions

### 🎓 Student Portal
- Dashboard with upcoming/completed exam cards
- Exam instructions page with proctoring agreement
- Full-screen code editor (Java / Python / C++ / JavaScript / TypeScript / React / Node.js)
- In-browser code runner via `/api/code/run` with multi-test-case support
- Auto-save every 5 s; progress persisted to `sessionStorage`
- Results page with published-score view

### 🗄️ Backend (Express + MongoDB)
- RESTful API with modular route/controller/model architecture
- `Exam`, `User`, `Submission` Mongoose models
- Auto-seeds the admin user on startup from environment variables
- Proctoring events streamed to MongoDB in real time
- `/api/health` endpoint for uptime monitoring

---

## 🏗️ Project Structure

```
zenthorix/
├── src/
│   ├── main.tsx          # Entire React SPA (Auth, Admin shell, Student shell, Exam Interface)
│   └── styles.css        # Design system — dark theme, glassmorphism, responsive grid
├── server/
│   ├── server.js         # Express app entry point, CORS, static serving
│   ├── config/
│   │   └── db.js         # Mongoose connection
│   ├── models/
│   │   ├── User.js       # Student & Admin schema (bcrypt pre-save hook)
│   │   ├── Exam.js       # Exam schema with embedded questions & test cases
│   │   └── Submission.js # Submission schema (answers, proctor events, recording)
│   ├── controllers/
│   │   ├── authController.js           # Login, logout, /me
│   │   ├── adminExamController.js      # CRUD exams, submissions, warn, publish
│   │   ├── adminStudentController.js   # CRUD students, status, photo
│   │   ├── examController.js           # Student exam flow, autosave, events, submit
│   │   └── codeRunnerController.js     # Sandboxed multi-language code execution
│   ├── middleware/
│   │   └── auth.js       # JWT verify + role guard middleware
│   ├── routes/           # Express routers (thin — delegate to controllers)
│   ├── scripts/
│   │   └── createAdmin.js # One-shot seed script
│   └── utils/
│       └── validators.js  # ObjectId validation helpers
├── index.html            # Vite entry point
├── vite.config.mjs       # Vite + React plugin + API proxy
├── tsconfig.json
├── vercel.json           # Vercel serverless deployment config
├── .env.example          # Environment variable template
└── package.json
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js ≥ 18**
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) **or** a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string

### 1 — Clone & install

```bash
git clone https://github.com/abdulkareemn/zenthorix.git
cd zenthorix
npm install
```

### 2 — Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/proctorai
JWT_SECRET=replace-with-a-long-random-secret-min-32-chars
CLIENT_ORIGIN=http://127.0.0.1:5173
NODE_ENV=development
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=YourSecurePassword123!
```

### 3 — Start the API server

```bash
npm run server
# ✅ API server running on port 5000
# ✅ MongoDB connected
# ✅ Auto-seeded admin: admin@example.com
```

### 4 — Start the frontend (separate terminal)

```bash
npm run dev
# ➜ http://127.0.0.1:5173
```

### 5 — Log in

| Portal | URL | Default credentials |
|---|---|---|
| **Student** | `http://127.0.0.1:5173/#/login` | Created by admin |
| **Admin** | `http://127.0.0.1:5173/#/admin/login` | `admin@example.com` / value from `.env` |

---

## 🌐 Deployment (Vercel + MongoDB Atlas)

1. Push this repo to GitHub (already done ✅)
2. Import the repo into [Vercel](https://vercel.com)
3. Set the following **Environment Variables** in Vercel project settings:

| Variable | Value |
|---|---|
| `MONGO_URI` | Your Atlas connection string |
| `JWT_SECRET` | A long random secret (32+ chars) |
| `CLIENT_ORIGIN` | Your Vercel deployment URL |
| `NODE_ENV` | `production` |
| `ADMIN_EMAIL` | Your admin email |
| `ADMIN_PASSWORD` | Your admin password |

4. Vercel will build with `npm run build` and serve the Express API via `vercel.json`.

---

## 🔌 API Reference

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Login (admin or student) |
| `POST` | `/api/auth/logout` | Clear session cookie |
| `GET` | `/api/auth/me` | Get current user |

### Admin — Exams

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/exams` | List all exams |
| `POST` | `/api/admin/exams/create` | Create & publish exam |
| `PUT` | `/api/admin/exams/:id` | Update exam |
| `GET` | `/api/admin/exams/submissions` | List all submissions |
| `POST` | `/api/admin/exams/submissions/:id/warn` | Send warning to candidate |
| `POST` | `/api/admin/exams/submissions/:id/publish` | Publish result |

### Admin — Students

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/students` | List all students |
| `POST` | `/api/admin/students/create` | Create student login |
| `PUT` | `/api/admin/students/:id` | Update student (status, exam assignment) |
| `DELETE` | `/api/admin/students/:id` | Delete student |

### Student — Exams

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/exams/assigned` | Get assigned exams |
| `GET` | `/api/exams/validate/:id` | Check exam access |
| `POST` | `/api/exams/:id/start` | Mark exam as started |
| `POST` | `/api/exams/:id/events` | Stream proctoring event |
| `POST` | `/api/exams/:id/autosave` | Auto-save answers |
| `POST` | `/api/exams/:id/submit` | Final submission with recording |
| `GET` | `/api/exams/:id/results` | Get published result |

### Code Runner

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/code/run` | Execute code against test cases |

**Supported languages:** Java, Python, C++, JavaScript, TypeScript, React, Node.js

---

## 🛡️ Security Checklist

- [x] All passwords hashed with bcrypt (cost 12)
- [x] JWT stored in `HttpOnly; SameSite=Strict` cookies
- [x] Admin and student routes protected by role-guard middleware
- [x] MongoDB ObjectId validated before every DB query
- [x] Request body size capped at 80 MB (recording upload limit)
- [x] CORS restricted to explicit `CLIENT_ORIGIN` whitelist
- [x] No sensitive data in client-side state or localStorage
- [x] `.env` excluded from Git via `.gitignore`
- [x] Code runner isolated per request (no persistent processes)

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite 5 |
| UI Icons | Lucide React |
| Styling | Vanilla CSS (dark theme, CSS Grid, Glassmorphism) |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose ODM |
| Auth | JSON Web Tokens (JWT) + bcrypt |
| AI Proctoring | Web APIs: FaceDetector, MediaRecorder, Web Audio API |
| Deployment | Vercel (full-stack serverless) |

---

## 📋 Supported Exam Languages

| Language | Runner |
|---|---|
| Java | `javac` + `java` |
| Python | `python3` |
| C++ | `g++` |
| JavaScript | `node` |
| TypeScript | `ts-node` |
| React | node (JSX-free evaluation) |
| Node.js | `node` |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📜 License

This project is released under the **MIT License**.

---

## 👤 Author

**Abdul Kareem N**  
GitHub: [@abdulkareemn](https://github.com/abdulkareemn)

---

<p align="center">Built with ❤️ for secure, scalable online assessment</p>
