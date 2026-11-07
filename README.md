# Career Ease – AI-Powered Career Guidance Platform

A full-stack web application designed to help users advance their careers through AI-driven tools for resume analysis, mock interviews, and personalized career insights.

![Career Ease Banner](./frontend/src/assets/hero.png)

---

## 📋 Project Overview

**Career Ease** is a comprehensive career development platform that leverages artificial intelligence to provide:

- **Intelligent Resume Analysis** – Automated feedback on resume quality, structure, and content
- **AI-Powered Mock Interviews** – Real-time interactive interview simulations with audio support
- **Career Tracking Dashboard** – Personalized metrics, activity logs, and career milestones
- **Secure Authentication** – Email/password and OAuth-based user authentication
- **Professional User Profiles** – Manage personal career information and preferences

The application is built with a modern tech stack combining React for the frontend, Express.js for the backend, and Supabase for authentication and data persistence.

---

## ✨ Key Features

### 🔐 User Authentication
- Email/password registration and login
- Google OAuth integration for seamless sign-up
- Secure password reset functionality
- Role-based access control with protected routes
- Automatic profile creation on user registration

### 📊 Interactive Dashboard
- Personalized welcome banner with time-based greetings
- Real-time metrics cards (Resume Score, Interview Performance)
- Activity chart tracking user engagement over time
- Skills panel for displaying user competencies
- Notifications and milestone tracking
- Quick-access links to main features

### 📄 AI Resume Analysis
- Upload and analyze resumes in PDF and DOCX formats
- Automatic text extraction from documents
- AI-generated analysis using Google Gemini API
- Comprehensive feedback on:
  - Overall resume score and rating
  - Strengths and areas for improvement
  - Keywords and skill relevance
  - Formatting and structure recommendations
  - ATS (Applicant Tracking System) optimization
- Resume history with version tracking
- Persistent storage of analysis results

### 🎤 AI Mock Interviews
- Interactive conversational AI interview assistant
- Real-time voice input and audio output
- Text-to-speech synthesis for interview responses
- Speech-to-text transcription for user answers
- Conversation history management
- Context-aware interview guidance
- Support for various interview topics and technical questions
- Session persistence and history

### 🎯 Career Insights (Foundation Ready)
- Activity and engagement tracking
- Milestone progress monitoring
- Skills assessment and development tracking
- Career metrics visualization
- Performance analytics

### ⚙️ User Settings
- Profile customization
- Theme preferences (Light/Dark mode)
- Application preferences
- Help and support documentation

---

## 🛠 Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.3.1 | UI framework |
| **Vite** | 8.3.5 | Build tool and dev server |
| **React Router** | 7.6 | Client-side routing |
| **Tailwind CSS** | 4.2 | Utility-first styling |
| **Recharts** | 2.15 | Data visualization |
| **Supabase JS** | 2.49 | Authentication & real-time DB |
| **Lucide React** | 0.511.0 | Icon library |
| **ESLint** | 10.13.0 | Code linting |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express.js** | 4.21.2 | Web framework |
| **Google Gemini API** | 0.24.1 | AI analysis and chat |
| **Supabase** | 2.49.0 | Authentication & database |
| **Multer** | 1.4.5 | File upload handling |
| **PDF-Parse** | 1.1.1 | PDF text extraction |
| **Mammoth** | 1.9.0 | DOCX text extraction |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **dotenv** | 16.4.7 | Environment configuration |

### Database & Services
| Service | Purpose |
|---------|---------|
| **Supabase (PostgreSQL)** | User authentication, profiles, and data persistence |
| **Google Gemini API** | AI-powered resume analysis and interview conversations |
| **Web Speech API** | Browser-based speech recognition and synthesis |

---

## 📁 Project Folder Structure

```
career-ease/
├── README.md                          # This file
├── .gitignore                         # Git ignore rules
│
├── frontend/                          # React + Vite frontend application
│   ├── public/                        # Static assets (favicon, icons)
│   ├── src/
│   │   ├── assets/                    # Images and media
│   │   ├── components/                # Reusable React components
│   │   │   ├── auth/                  # Authentication components (ProtectedRoute)
│   │   │   ├── charts/                # Data visualization (ActivityChart)
│   │   │   ├── layout/                # Layout components (Header, Sidebar, AppLayout)
│   │   │   └── ui/                    # Shared UI components (Button, Card, Badge, etc.)
│   │   ├── context/                   # React Context (Auth, Theme)
│   │   ├── lib/                       # Utilities and API clients
│   │   │   ├── supabase.js            # Supabase client setup
│   │   │   ├── resumeApi.js           # Resume API endpoints
│   │   │   ├── interviewApi.js        # Interview API endpoints
│   │   │   └── constants.js           # App constants
│   │   ├── pages/                     # Page components
│   │   │   ├── Auth/                  # Authentication pages (Login, Register, Reset)
│   │   │   ├── Dashboard/             # Main dashboard with metrics and activity
│   │   │   ├── Resume/                # Resume upload and analysis
│   │   │   ├── Interview/             # Mock interview interface
│   │   │   ├── Settings/              # User settings
│   │   │   ├── Help/                  # Help and documentation
│   │   │   ├── JobMatcher/            # Job matching (future feature)
│   │   │   └── Roadmap/               # Career roadmap (future feature)
│   │   ├── styles/                    # Global CSS
│   │   ├── App.jsx                    # Main App component with routing
│   │   └── main.jsx                   # Application entry point
│   ├── package.json                   # Frontend dependencies
│   ├── vite.config.js                 # Vite configuration
│   └── eslint.config.js               # ESLint configuration
│
├── backend/                           # Express.js backend application
│   ├── src/
│   │   ├── index.js                   # Express server setup and entry point
│   │   ├── middleware/
│   │   │   └── requireAuth.js         # JWT authentication middleware
│   │   ├── routes/
│   │   │   ├── resume.js              # Resume upload and analysis endpoints
│   │   │   └── interview.js           # Interview chat endpoints
│   │   ├── services/
│   │   │   ├── gemini.js              # Resume analysis with Gemini API
│   │   │   ├── geminiClient.js        # Gemini API client setup
│   │   │   ├── interview.js           # Interview conversation logic
│   │   │   └── extractText.js         # PDF and DOCX text extraction
│   │   └── lib/
│   │       └── supabaseAdmin.js       # Supabase admin client
│   ├── database/
│   │   └── resume_schema.sql          # Database schema
│   ├── package.json                   # Backend dependencies
│   └── .env.example                   # Example environment variables
│
├── supabase/                          # Database migrations and setup
│   ├── setup.sql                      # Supabase table and trigger setup
│   └── resume_migration.sql           # Resume-related schema migration
│
└── .gitignore                         # Root-level Git ignore rules
```

---

## 🚀 Installation & Setup

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or higher) – [Download](https://nodejs.org/)
- **npm** or **yarn** – Included with Node.js
- **Git** – [Download](https://git-scm.com/)
- **Supabase Account** – [Create free account](https://supabase.com/)
- **Google Gemini API Key** – [Get API key](https://aistudio.google.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/career-ease.git
cd career-ease
```

### Step 2: Set Up Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project or use an existing one
3. Go to **SQL Editor** → **New Query**
4. Copy and paste the contents of `supabase/setup.sql`
5. Execute the query to set up tables, policies, and triggers
6. Retrieve your credentials:
   - **Project URL**: Settings → API → URL
   - **Anon Key**: Settings → API → Anon public key
   - **Service Role Key**: Settings → API → Service role key (keep this secret!)

### Step 3: Set Up Google Gemini API

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Click "Get API Key" and create a new project
3. Generate an API key and copy it securely

### Step 4: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 5: Configure Backend Environment

```bash
# In the backend directory, copy .env.example to .env
cp .env.example .env
```

Edit `backend/.env` with your actual credentials:

```env
PORT=4000
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
GEMINI_API_KEY=your-gemini-api-key-here
CORS_ORIGIN=http://localhost:5173
```

### Step 6: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### Step 7: Configure Frontend Environment

```bash
# In the frontend directory, copy .env.example to .env
cp .env.example .env
```

Edit `frontend/.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
VITE_API_URL=http://localhost:4000
```

---

## 🌍 Environment Variables

### Frontend Environment Variables (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://project-ref.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key | `eyJhbGc...` |
| `VITE_API_URL` | Backend API base URL | `http://localhost:4000` |

> 📌 **Never commit `.env` files!** They are listed in `.gitignore`. Use `.env.example` to document required variables.

### Backend Environment Variables (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Express server port | `4000` |
| `SUPABASE_URL` | Supabase project URL | `https://project-ref.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | `eyJhbGc...` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |
| `CORS_ORIGIN` | Allowed frontend origin(s) | `http://localhost:5173` |

> ⚠️ **SECURITY WARNING**: Service role keys and API keys are sensitive. Never expose them publicly or commit them to version control. Always use environment variables.

---

## ▶️ Running the Application

### Start the Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
[Lumino backend] listening on http://localhost:4000
```

The backend provides a health check endpoint at `http://localhost:4000/health`.

### Start the Frontend Development Server

In a new terminal:

```bash
cd frontend
npm run dev
```

You should see:
```
  Local:   http://localhost:5173/
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### Build for Production

**Frontend:**
```bash
cd frontend
npm run build
```
Output: `frontend/dist/` (ready for deployment)

**Backend:**
The backend is production-ready as-is. Deploy to a platform like Vercel, Railway, or Heroku.

### Linting & Code Quality

```bash
cd frontend
npm run lint
```

---

## 🗄️ Supabase Database Setup

### Overview

Career Ease uses Supabase (PostgreSQL) for:
- User authentication (managed by Supabase Auth)
- User profiles storage
- Resume data and analysis history
- Interview history (optional expansion)

### Schema Overview

**`profiles` table**
- `id` (UUID, primary key) – Links to auth.users
- `full_name` (text)
- `email` (text, not null)
- `avatar_url` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Row Level Security (RLS)**
- Users can only view/update their own profile
- Policies prevent unauthorized access

**Auto-Triggers**
- `handle_new_user()` – Creates a profile whenever a new user signs up
- `set_updated_at()` – Auto-updates the `updated_at` timestamp on changes

### Running Database Setup

1. Open [Supabase Dashboard](https://app.supabase.com/) → Your Project
2. Navigate to **SQL Editor** → **New Query**
3. Copy and paste the script from `supabase/setup.sql`
4. Click **Run** to execute
5. Verify tables exist by checking the **Table Editor**

The script is **idempotent** — it's safe to run multiple times without errors.

### Testing the Setup

After setup, test a sign-up:
1. Register a new user on the app
2. In Supabase Dashboard → **Table Editor** → `profiles`
3. A new row should appear automatically with the user's info

---

## 📸 Screenshots

> 🎨 Screenshots will be added as the project develops. Placeholder sections below describe key screens:

### Login & Registration
![Placeholder: Login Page](https://via.placeholder.com/600x400?text=Login+Page)
- Email and password authentication
- Google OAuth integration
- Password recovery and reset flows

### Dashboard
![Placeholder: Dashboard](https://via.placeholder.com/600x400?text=Dashboard)
- Welcome banner with personalized greeting
- Metric cards showing Resume Score and Interview Performance
- Activity chart tracking engagement
- Quick navigation to main features

### Resume Analysis
![Placeholder: Resume Upload](https://via.placeholder.com/600x400?text=Resume+Upload)
- Drag-and-drop file upload
- Support for PDF and DOCX formats
- AI-generated analysis with detailed feedback
- Resume version history

### Mock Interview
![Placeholder: Interview Chat](https://via.placeholder.com/600x400?text=Interview+Chat)
- Real-time conversational interface
- Voice input and audio output
- Interview guidance and tips
- Conversation history

---

## 🎯 Future Enhancements

### Planned Features
- 🎯 **Job Matcher** – Find jobs matching your profile and skills
- 🗺️ **Career Roadmap** – AI-generated career development path
- 📚 **Learning Resources** – Curated courses and tutorials
- 💼 **Portfolio Builder** – Showcase projects and achievements
- 🔔 **Job Alerts** – Notifications for matching opportunities
- 📊 **Advanced Analytics** – Detailed career progress insights
- 🌐 **Multi-language Support** – Support for multiple languages
- 📱 **Mobile App** – Native iOS and Android applications
- 🤝 **Mentor Matching** – Connect with career mentors
- 📝 **Cover Letter Generator** – AI-powered cover letter creation

### Known Limitations
- Job Matcher and Career Roadmap pages are currently hidden (scaffolding exists)
- Interview history is stored client-side only (can be persisted to DB in future)
- Resume storage is limited to 5MB per file
- Maximum 20 turns per interview session (to manage API costs)

---

## 📚 API Documentation

### Resume Endpoints

**POST `/api/resume/analyse`**
- Upload and analyze a resume
- Requires authentication
- Accepts: PDF, DOCX (max 5MB)
- Returns: Analysis results with scores and recommendations

**GET `/api/resume/list`**
- Retrieve user's resume history
- Requires authentication
- Returns: Array of resume metadata

**GET `/api/resume/:id`**
- Fetch analysis for a specific resume
- Requires authentication
- Returns: Detailed analysis object

**DELETE `/api/resume/:id`**
- Delete a resume record
- Requires authentication
- Returns: Success confirmation

### Interview Endpoints

**POST `/api/interview/chat`**
- Send a message in interview conversation
- Requires authentication
- Body: `{ history: Array<{ role: 'user'|'model', text: string }> }`
- Returns: `{ reply: string }`

**GET `/api/health`**
- Health check endpoint (no auth required)
- Returns: `{ status: 'ok', ts: '2024-...' }`

---

## 🐛 Troubleshooting

### Backend won't start
```
Error: Cannot find module '@google/generative-ai'
```
**Solution**: Run `npm install` in the backend directory

### Frontend won't load
```
[vite] Failed to resolve dependency
```
**Solution**: Run `npm install` in the frontend directory

### API errors (401, CORS issues)
- Ensure backend is running on `http://localhost:4000`
- Check `CORS_ORIGIN` in `backend/.env` matches frontend URL
- Verify Supabase credentials are correct in both `.env` files

### Resume upload fails
- Check file size (max 5MB)
- Verify file format is PDF or DOCX
- Ensure `GEMINI_API_KEY` is configured and valid

### Interview chat not working
- Verify `GEMINI_API_KEY` is set and has quota
- Check conversation history format (last entry must have `role: 'user'`)
- Ensure authentication token is valid

### Database connection errors
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check Supabase project is active and not paused
- Run `supabase/setup.sql` to ensure tables exist

---

## 🤝 Contributing

This is a college project showcasing full-stack development capabilities. Contributions and improvements are welcome!

### How to Contribute
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add new feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

### Code Standards
- Follow existing code style and naming conventions
- Write meaningful commit messages
- Test changes locally before submitting
- Keep code comments clear and concise

---

## 📄 License

This project is open source and available under the **MIT License**. See the LICENSE file for details.

---

## 📞 Support & Contact

For questions, issues, or suggestions:
- Open an [issue on GitHub](https://github.com/YOUR_USERNAME/career-ease/issues)
- Check the **Help** section in the application
- Review existing documentation in this README

---

## 🙏 Acknowledgments

- **Supabase** – Backend infrastructure and authentication
- **Google Gemini** – AI-powered analysis and conversations
- **React & Vite** – Frontend framework and build tooling
- **Tailwind CSS** – Utility-first styling framework
- **Open source community** – For amazing libraries and tools

---

**Built with ❤️ for career development and growth**

Last Updated: November 2026
