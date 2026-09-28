# AI StudyBuddy — AI-Powered Learning Assistant

AI StudyBuddy is a full-stack learning assistant for students. It enables students to upload lecture notes, textbooks, and study materials and leverages Artificial Intelligence to automatically generate concise summaries, interactive 3D flashcards, multiple-choice quizzes, personalized study plans, grounded document Q&A through RAG (Retrieval-Augmented Generation), and semantic vector search.

---

## 1. System Architecture

The application follows a modular **Model-View-Controller (MVC)** design pattern with strict separation of concerns and an isolated AI Service Layer:

```
                      ┌───────────────────────────────────────────────┐
                      │    Client Presentation Layer (Plain HTML/JS)  │
                      │  Dashboard • Summaries • Flashcards • Quizzes │
                      └──────────────────────┬────────────────────────┘
                                             │ HTTP / Fetch (JWT Bearer)
                                             ▼
                      ┌───────────────────────────────────────────────┐
                      │          Express.js Routing & Middleware       │
                      │   Auth (JWT) • Role (RBAC) • Multer (Upload)  │
                      └──────────────────────┬────────────────────────┘
                                             │
                      ┌──────────────────────┴────────────────────────┐
                      │                                               │
                      ▼                                               ▼
     ┌─────────────────────────────────┐             ┌─────────────────────────────────┐
     │           Controllers           │             │        AI Service Layer         │
     │ Auth • Material • AI • Admin    │◄───────────►│       src/services/aiService    │
     └────────────────┬────────────────┘             └────────────────┬────────────────┘
                      │                                               │
                      ▼                                               ▼
     ┌─────────────────────────────────┐             ┌─────────────────────────────────┐
     │       Data / Model Layer        │             │        Google Gemini SDK        │
     │ MongoDB Atlas (or Memory Store) │             │     Gemini 2.5 Flash / Embed    │
     └─────────────────────────────────┘             └─────────────────────────────────┘
```

### Key Architectural Decisions:
1. **Isolated AI Service Layer**: Controllers never invoke the Google Gemini SDK directly. All prompts, schemas, embedding generation, and cosine similarity calculations flow through `src/services/aiService.ts` and `src/utils/gemini.ts`.
2. **Dual-Mode Persistence Strategy**: Seamlessly connects to MongoDB Atlas using Mongoose when `MONGO_URI` is supplied, and falls back gracefully to a robust in-memory database store if MongoDB is not yet configured. This guarantees immediate zero-friction demo-readiness.
3. **Vanilla Frontend**: Built purely with semantic HTML5, clean CSS, and modular JavaScript without heavy frontend frameworks, adhering strictly to the StudyBuddy reference specification.

---

## 2. Technology Stack

- **Runtime**: Node.js (ES Modules)
- **Backend Framework**: Express.js
- **Database**: MongoDB & Mongoose ORM (with in-memory fallback for instant prototyping)
- **AI & LLM**: Google Gemini API (`@google/genai` SDK)
  - Text & Summarization: `gemini-2.5-flash`
  - Embeddings & Vector Search: `text-embedding-004`
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & password hashing with `bcryptjs`
- **File Uploads**: `multer` with memory storage and MIME/extension filtering
- **Frontend**: Plain HTML5, CSS3, JavaScript (Fetch API, LocalStorage JWT)

---

## 3. Environment Variables

Create or configure `.env` based on `.env.example`:

```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/studybuddy?retryWrites=true&w=majority
JWT_SECRET=studybuddy_super_secure_jwt_secret_key_2026
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
APP_URL=http://localhost:3000
```

---

## 4. Quick Start & Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start in Development Mode
```bash
npm run dev
```

### 3. Build & Run for Production
```bash
npm run build
npm start
```

The application will be accessible at:
- **Web Interface**: `http://localhost:3000/`
- **API Health Check**: `http://localhost:3000/api/health`

---

## 5. Default Demo Credentials

For immediate testing, two pre-configured accounts are seeded:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `yyuvashree24916bscai@gmail.com` | `yuvashree@@2006` |
| **Student** | `student@studybuddy.com` | `student123` |

*You can also register any new student or administrator account directly through the registration page.*

---

## 6. API Reference

All protected endpoints require the `Authorization: Bearer <token>` header.

### Authentication
- `POST /api/auth/register` — Register student or admin account
- `POST /api/auth/login` — Authenticate and receive JWT token
- `POST /api/auth/logout` — Invalidate client session
- `GET  /api/auth/me` — Retrieve current authenticated user profile

### Study Materials
- `POST   /api/material/upload` — Upload text or file (multipart/form-data with `file` or JSON `{ title, subject, content }`)
- `GET    /api/material` — List all materials belonging to the authenticated user
- `GET    /api/material/:id` — Retrieve single material along with generated summaries, flashcards, and quizzes
- `DELETE /api/material/:id` — Delete material and associated resources

### AI Learning Features
- `POST /api/materials/:id/summarize` — Generate structured summary using Gemini 2.5 Flash
- `POST /api/ai/flashcards` — Generate question-answer flashcard deck
- `POST /api/ai/quiz` — Generate 4-option multiple-choice practice quiz
- `POST /api/ai/study-plan` — Formulate personalized study roadmap and daily timeline
- `POST /api/ai/chat` — RAG-augmented chatbot grounded in student's notes
- `POST /api/ai/search` — Dense semantic vector search with cosine similarity scoring

### Administrator Console (Admin Role Required)
- `GET /api/admin/users` — Audit user accounts, uploaded materials count, and registration dates
- `GET /api/admin/activity` — Retrieve system telemetry, AI generation count, and audit event logs

---

## 7. Role-Based Access Control (RBAC)

The application enforces strict authorization:
- Any authenticated user with `role: "student"` can access all study material tools, AI generation endpoints, and their own documents.
- If a student user attempts to call `/api/admin/users` or `/api/admin/activity`, the `requireRole('admin')` middleware immediately intercepts the request and responds with **`HTTP 403 Forbidden`**.
- Administrators have access to the dedicated Admin Panel for system monitoring and user audits.

---

## 8. Testing with Postman

A pre-configured Postman collection is included in the project root:
- File: `postman_collection.json`
- Import into Postman or Insomnia.
- Run `Login (Student)` — it automatically captures and sets the `{{jwtToken}}` collection variable for all subsequent requests.
