# 🍽️ DigiMess

A comprehensive web-based Mess Management System for students and administrators. DigiMess streamlines mess operations including meal attendance tracking, opt-out requests, rebate calculations, and review management with ML-powered sentiment analysis.

---

## 🏗️ Tech Stack

| Layer      | Technology                                      |
| ---------- | ----------------------------------------------- |
| Frontend   | React 19, TypeScript, Tailwind CSS 4, Vite 7    |
| Backend    | Node.js, Express 5, JWT Authentication           |
| Database   | MongoDB / Mongoose                               |
| ML         | Keyword-based sentiment analysis (custom)        |
| Email      | Nodemailer (Gmail SMTP)                          |

---

## 📁 Project Structure

```
DigiMess/
├── Backend/
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verification & role-based access
│   ├── ml/
│   │   └── summarizer.js          # Review sentiment analysis engine
│   ├── models/
│   │   ├── MealAttendance.js      # Daily meal attendance records
│   │   ├── OptOut.js              # Meal opt-out requests
│   │   ├── PasswordResetToken.js  # Secure password reset tokens
│   │   ├── Rebate.js              # Monthly rebate calculations
│   │   ├── RefreshToken.js        # JWT refresh token storage
│   │   ├── Review.js              # Meal reviews & ratings
│   │   └── User.js                # User accounts (student/admin)
│   ├── routes/
│   │   ├── admin.js               # Admin dashboard, stats & management
│   │   ├── auth.js                # Login, register, password reset, tokens
│   │   ├── meals.js               # Meal attendance logging & history
│   │   ├── optout.js              # Opt-out request & approval
│   │   ├── rebate.js              # Rebate calculation & approval
│   │   └── reviews.js             # Review submission & approval
│   ├── .env.example               # Environment variable template
│   ├── Procfile                   # Deployment process file
│   ├── package.json
│   ├── seed.js                    # Database seeder with sample data
│   └── server.js                  # Express server entry point
│
├── Frontend/
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.tsx      # Admin panel with stats & management
│   │   │   ├── EditProfile.tsx         # User profile editor
│   │   │   ├── ForgotPasswordPage.tsx  # Password reset request
│   │   │   ├── LoginPage.tsx           # Admin login page
│   │   │   ├── ResetPasswordPage.tsx   # Password reset form
│   │   │   ├── StudentDashboard.tsx    # Student panel with all features
│   │   │   ├── StudentLoginPage.tsx    # Student login page
│   │   │   └── StudentSignupPage.tsx   # Student registration
│   │   ├── services/
│   │   │   ├── adminService.ts    # Admin API calls
│   │   │   ├── apiService.ts      # Generic API helper
│   │   │   ├── authService.ts     # Auth, tokens & interceptors
│   │   │   ├── mealService.ts     # Meal attendance API
│   │   │   ├── optoutService.ts   # Opt-out request API
│   │   │   ├── rebateService.ts   # Rebate calculation API
│   │   │   └── reviewService.ts   # Review submission API
│   │   ├── types/
│   │   │   └── User.ts           # TypeScript interfaces
│   │   ├── App.tsx               # Root component with routing
│   │   ├── App.css               # Application styles
│   │   ├── index.css             # Global styles & Tailwind
│   │   └── main.tsx              # React entry point
│   ├── .env.example              # Frontend env template
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── UML Diagrams/                 # PlantUML architecture diagrams
│   ├── Activity.puml
│   ├── Class.puml
│   ├── Sequence.puml
│   └── UseCase.puml
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher ([download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **MongoDB** — local installation or [MongoDB Atlas](https://www.mongodb.com/atlas) account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd DigiMess
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
MONGO_URI=mongodb://localhost:27017/digimess
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-digit-app-password
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id_here
```

> **Note:** For `EMAIL_PASS`, generate a [Google App Password](https://support.google.com/accounts/answer/185833) if using Gmail with 2FA enabled.
> **Note:** For `GOOGLE_CLIENT_ID`, generate a Client ID from the Google Cloud Console (APIs & Services -> Credentials).

### 3. Frontend Setup

```bash
cd ../Frontend
npm install
```

Optionally create a `.env` file:

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 4. Database Seeding (Automatic)

Seeding is fully automated! There is no separate `npm run seed` script or step required.
When you start the Backend server for the first time, it automatically checks if an admin user exists. If not, it will seed sample data (users, attendance records, opt-outs, rebates, and reviews) automatically. Subsequent server startups will silently skip seeding.

### 5. Start the Application

**Terminal 1 — Backend:**

```bash
cd Backend
npm run dev
```

The API server will start on `http://localhost:5000`.

**Terminal 2 — Frontend:**

```bash
cd Frontend
npm run dev
```

The app will open at `http://localhost:5173`.

---

## 🔑 Demo Credentials

After running the seed script:

| Role    | Email                        | Password     |
| ------- | ---------------------------- | ------------ |
| Admin   | `admin@digimess.com`         | `admin123`   |
| Student | `student1@digimess.com`      | `student123` |
| Student | `student2@digimess.com`      | `student123` |
| Student | `student3@digimess.com`      | `student123` |
| Student | `student4@digimess.com`      | `student123` |
| Student | `student5@digimess.com`      | `student123` |

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Protected routes require a `Bearer` token in the `Authorization` header.

### Authentication (`/api/auth`)

| Method | Endpoint            | Auth     | Description                     |
| ------ | ------------------- | -------- | ------------------------------- |
| POST   | `/login`            | Public   | Login with email & password     |
| POST   | `/google`           | Public   | Google OAuth Login/Registration |
| POST   | `/register`         | Public   | Register a new user             |
| POST   | `/forgot-password`  | Public   | Request password reset email    |
| POST   | `/reset-password`   | Public   | Reset password with token       |
| GET    | `/me`               | Required | Get current user profile        |
| PUT    | `/update-profile`   | Required | Update name, email, or password |
| POST   | `/refresh`          | Public   | Refresh access token            |
| POST   | `/logout`           | Required | Invalidate refresh token        |

### Meals (`/api/meals`) — Requires Auth

| Method | Endpoint              | Role    | Description                |
| ------ | --------------------- | ------- | -------------------------- |
| POST   | `/attendance`         | Student | Log daily meal attendance  |
| GET    | `/:userId/history`    | Any     | Get attendance history     |

### Opt-Outs (`/api/optout`) — Requires Auth

| Method | Endpoint          | Role    | Description              |
| ------ | ----------------- | ------- | ------------------------ |
| POST   | `/request`        | Student | Submit opt-out request   |
| PUT    | `/:id/approve`    | Admin   | Approve/reject opt-out   |
| GET    | `/:userId`        | Any     | Get user's opt-outs      |

### Rebates (`/api/rebate`) — Requires Auth

| Method | Endpoint               | Role    | Description              |
| ------ | ---------------------- | ------- | ------------------------ |
| GET    | `/:userId/calculate`   | Any     | Calculate monthly rebate |
| PUT    | `/:id/approve`         | Admin   | Approve/reject rebate    |
| GET    | `/:userId`             | Any     | Get rebate history       |

### Reviews (`/api/reviews`) — Requires Auth

| Method | Endpoint          | Role    | Description              |
| ------ | ----------------- | ------- | ------------------------ |
| POST   | `/submit`         | Student | Submit a meal review     |
| PUT    | `/:id/approve`    | Admin   | Approve/reject review    |
| GET    | `/:userId`        | Any     | Get user's reviews       |

### Admin (`/api/admin`) — Requires Admin Role

| Method | Endpoint            | Description                     |
| ------ | ------------------- | ------------------------------- |
| GET    | `/stats`            | Dashboard statistics            |
| GET    | `/optouts`          | All opt-out requests            |
| GET    | `/rebates`          | All rebate records              |
| GET    | `/reviews`          | All reviews                     |
| GET    | `/reviews/summary`  | ML-powered review summary       |
| GET    | `/attendance`       | Recent attendance records       |

---

## 🧠 ML — Review Summarization

The backend includes a keyword-based sentiment analysis engine (`Backend/ml/summarizer.js`) that:

1. Analyzes review comments for positive, negative, and neutral keywords
2. Determines dominant sentiment with emoji indicators (🟢 🟡 🔴)
3. Extracts top frequent words for dynamic summaries
4. Computes average ratings across reviews

Admins can view the AI-generated summary via the dashboard or the `/api/admin/reviews/summary` endpoint.

---

## 🏛️ Architecture

```
┌──────────────┐     HTTP/REST     ┌──────────────────┐     Mongoose     ┌──────────┐
│   React SPA  │ ◄──────────────►  │  Express API     │ ◄─────────────►  │ MongoDB  │
│  (Vite + TS) │                   │  (Node.js)       │                  │          │
│              │                   │                  │                  │          │
│  • Auth UI   │                   │  • JWT Auth      │                  │  Users   │
│  • Dashboard │                   │  • Role Guards   │                  │  Meals   │
│  • Forms     │                   │  • ML Summarizer │                  │  OptOuts │
│  • Charts    │                   │  • Email (SMTP)  │                  │  Rebates │
└──────────────┘                   └──────────────────┘                  │  Reviews │
                                                                        └──────────┘
```

---

## 👥 Team

| Role                   | Members                                |
| ---------------------- | -------------------------------------- |
| Frontend Developer     | Devansh Rai, Krish Dhaked, Amar Singh  |
| Backend Developer      | Himanshu Vitthalani, Mayank Jha        |
| Database Designer      | Devansh Rai, Aryan Shrivastava         |
| Tester                 | Himanshu Vitthalani, Krish Dhaked       |
| Model Training (ML)    | Mayank Jha, Himanshu Vitthalani        |
| Documentation          | Aryan Shrivastava, Amar Singh          |

---

## 📄 License

ISC
