# HireStream - Job Portal & Recruitment Management System

HireStream is a fully functional Job Portal and Recruitment Management Web Application that handles job postings, candidate applications, candidate profiles, recruitment workflows, role-based dashboards, and analytics reports.

## Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Lucide Icons, Recharts (for analytics graphs)
- **Backend**: Node.js, Express.js, JWT (JSON Web Tokens), bcryptjs
- **Database**: SQLite3 (stored in a single local file `database.sqlite` for direct local execution)

---

## Folder Structure

The project is divided into two main folders: `frontend` and `backend`.

```text
job-portal/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # SQLite Connection & Auto Seed Data
│   │   ├── controllers/
│   │   │   ├── authController.js     # User registration, login, profile check
│   │   │   ├── jobController.js      # Job postings CRUD & filter search
│   │   │   ├── applicationController.js # Candidate applying & status updates
│   │   │   ├── interviewController.js   # Interview scheduling & status updates
│   │   │   └── userController.js     # User profiles & dashboard stats queries
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT & role authorization check
│   │   │   └── uploadMiddleware.js   # Multer file validation (Resume PDF)
│   │   └── routes/
│   │       ├── authRoutes.js         # /api/auth
│   │       ├── jobRoutes.js          # /api/jobs
│   │       ├── applicationRoutes.js  # /api/applications
│   │       ├── interviewRoutes.js    # /api/interviews
│   │       └── userRoutes.js         # /api/users
│   │   └── app.js                    # Express Application Entry
│   ├── uploads/                      # Local storage for Resume PDFs
│   ├── .env                          # Backend Environment configs
│   └── package.json                  # Backend packages list
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx            # Main app framework (Navbar + Sidebar)
│   │   │   ├── ProtectedRoute.jsx    # Route guard by authentication status
│   │   │   ├── JobCard.jsx           # Premium job details summary card
│   │   │   ├── Navbar.jsx            # Notification check & profile settings
│   │   │   └── Sidebar.jsx           # Left sidebar navigation links
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Authentication state provider
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Auth sign in screen
│   │   │   ├── Register.jsx          # Dual-role signup (Candidate or Recruiter)
│   │   │   ├── Home.jsx              # Candidate Job Board or Recruiter Listings
│   │   │   ├── JobDetails.jsx        # Job description details & apply action
│   │   │   ├── CreateJob.jsx         # Add or edit a job listing
│   │   │   ├── Profile.jsx           # Skills details & resume PDF upload
│   │   │   ├── Applications.jsx      # Recruiter applications inbox & schedule modal
│   │   │   └── Dashboard/
│   │   │       ├── AdminDashboard.jsx # Admin metrics & system growth charts
│   │   │       ├── RecruiterDashboard.jsx # Recruiter pipeline status & bar graphs
│   │   │       └── CandidateDashboard.jsx # Applied jobs list & interview tracker
│   │   ├── services/
│   │   │   └── api.js                # Axios API calls wrapper
│   │   ├── App.jsx                   # React Router configurations
│   │   ├── main.jsx                  # Main entry point
│   │   └── index.css                 # Tailwind layers
│   ├── vite.config.js                # Vite configs & local api proxy
│   ├── tailwind.config.js            # Tailwind custom colors
│   └── package.json                  # Frontend packages list
└── README.md                         # Project documentation
```

---

## Database Schema (SQLite)

- **users**: Stores authentication credentials, name, email, and role (`admin`, `recruiter`, or `candidate`).
- **recruiters**: Holds recruiter-specific metadata (Company Name, Website, Logo).
- **candidates**: Holds candidate profile information (Phone, Skills tag list, Education history JSON string, Experience history JSON string, and resume local file path).
- **jobs**: Stores job details, skills required, experience required, and posting status (`open` or `closed`).
- **applications**: Links candidate and job listings, tracks current pipeline status (`applied`, `under_review`, `shortlisted`, `interview_scheduled`, `selected`, `rejected`).
- **interviews**: Holds scheduled technical assessments, notes, meeting times, and status (`scheduled`, `completed`, `passed`, `failed`).
- **notifications**: Stores system events and user notifications.

---

## API Documentation

### Auth Endpoints
- `POST /api/auth/register` - Register a new candidate or recruiter
- `POST /api/auth/login` - User sign in and return JWT token
- `GET /api/auth/me` - Fetch logged-in user profile details

### Job Listing Endpoints
- `GET /api/jobs` - List jobs (with search, location, skills, status query parameters)
- `GET /api/jobs/:id` - Retrieve single job listing details
- `POST /api/jobs` - Post a job listing (Recruiter/Admin only)
- `PUT /api/jobs/:id` - Edit a job listing (Recruiter owner/Admin only)
- `DELETE /api/jobs/:id` - Delete a job listing (Recruiter owner/Admin only)
- `PATCH /api/jobs/:id/status` - Close/Open a job listing (Recruiter owner/Admin only)

### Application Endpoints
- `POST /api/applications` - Apply to a job listing (Candidate only)
- `GET /api/applications` - List applications (Admin: all, Recruiter: jobs posted, Candidate: their applications)
- `GET /api/applications/:id` - View application details (Candidate/Recruiter/Admin)
- `PATCH /api/applications/:id/status` - Update application status (Recruiter/Admin only)

### Interview Endpoints
- `POST /api/interviews` - Schedule an interview (Recruiter/Admin only)
- `GET /api/interviews` - Get user interview listings
- `PATCH /api/interviews/:id` - Update interview status / details (Recruiter/Admin only)

### Profile & Stats
- `PUT /api/users/profile` - Update candidate or recruiter profile metadata
- `POST /api/users/profile/resume` - Upload resume file (Candidate only)
- `GET /api/users/notifications` - Get user notifications list
- `GET /api/users/admin/stats` - Platform growth reports (Admin only)
- `GET /api/users/recruiter/stats` - Job response metrics (Recruiter only)

---

## Installation & Running Guide

### Prerequisites
- Node.js installed on your machine.

### Step 1: Install Dependencies
Dependencies are already pre-installed. If you need to re-install:
```bash
# In backend/ folder
npm install

# In frontend/ folder
npm install
```

### Step 2: Start the Backend Server
```bash
cd backend
npm run dev
```
The server will start on port `5000` and automatically initialize and seed the SQLite database file (`database.sqlite`).

### Step 3: Start the Frontend App
Open a separate terminal window:
```bash
cd frontend
npm run dev
```
The Vite development server will boot on port `3000`. Open `http://localhost:3000` in your web browser.

---

## Seed Accounts for Demo (Password: `password123`)

- **Admin Account**: `admin@jobportal.com`
- **Recruiter Account**: `recruiter@jobportal.com`
- **Candidate Account**: `candidate@jobportal.com`
