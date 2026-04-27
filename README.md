# Enterprise Work Management System

A full-stack, production-ready work management platform built with React and Node.js. Supports role-based authentication, project and task management, real-time notifications, a Kanban board, and analytics reporting.

Built as part of a React internship at **Incture**.

🔗 **Live Demo:** [https://enterprise-work-management-beta.vercel.app](https://enterprise-work-management-beta.vercel.app)

📦 **GitHub:** [https://github.com/Kunal-8759/enterprise-work-management](https://github.com/Kunal-8759/enterprise-work-management)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Clone the Repository](#clone-the-repository)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [Known Limitations](#known-limitations)
- [Libraries Used](#libraries-used)

---

## Features

- **Authentication & Authorization** — JWT-based login/signup with role-based access control (Admin, Manager, Employee)
- **Protected Routes** — Each role sees only what it is allowed to access
- **Dashboard** — Live metrics for total projects, tasks, completed and pending counts with recent activity feed
- **Project Management** — Create, edit, delete projects; add and remove members by email search
- **Task Management** — Create, assign, edit, delete tasks with types (Bug, Feature, Improvement), priorities, due dates, comments, and file attachments
- **Kanban Board** — Drag-and-drop task management across Todo, In Progress, and Done columns using `@dnd-kit`
- **User Management** — Admin-only panel to view, update roles, and toggle user status
- **Analytics & Reporting** — Charts for task status distribution, priority breakdown, project completion trends, and team workload; CSV export
- **Real-time Notifications** — Socket.IO-powered notifications with mark-as-read and delete support
- **Theme Toggle** — Dark and light mode, persisted to localStorage
- **Settings** — Profile edit and password change

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TailwindCSS |
| State Management | Redux Toolkit |
| Routing | React Router v7 |
| Forms | React Hook Form + Yup |
| HTTP Client | Axios |
| Charts | Recharts |
| Drag and Drop | @dnd-kit |
| Real-time | Socket.IO |
| Backend | Node.js, Express 5 |
| Database | MongoDB (Mongoose) |
| File Storage | Cloudinary |
| Auth | JSON Web Tokens (JWT) |

---

## Project Structure

```
enterprise-work-management/
├── frontend/          # React app (Vite)
│   ├── src/
│   │   ├── features/  # Dashboard, Projects, Tasks, Users, Analytics, Notifications
│   │   ├── store/     # Redux slices
│   │   ├── routes/    # ProtectedRoute, RoleRoute
│   │   ├── hooks/     # useAuth
│   │   ├── services/  # Axios instance, analytics service
│   │   ├── socket/    # Socket.IO client
│   │   └── utils/     # Validators, constants
│   └── tests/         # Jest + React Testing Library test suites
│
└── backend/           # Node/Express API
    └── src/
        ├── controllers/
        ├── models/
        ├── routes/
        ├── middleware/
        └── seeders/
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account or a local MongoDB instance
- A [Cloudinary](https://cloudinary.com/) account (for file attachments)

---

### Clone the Repository

```bash
git clone https://github.com/Kunal-8759/enterprise-work-management.git
cd enterprise-work-management
```

---

### Backend Setup

```bash
# Navigate to the backend folder
cd backend

# Install dependencies
npm install

# Create the environment file
touch .env
# Then open .env and fill in your values (see Environment Variables section below)

# Start the development server
npm run dev
```

The backend will start on **http://localhost:5000**

> **Optional:** Seed the database with sample data
> ```bash
> npm run seed
> ```

---

### Frontend Setup

Open a **new terminal tab**, then:

```bash
# Navigate to the frontend folder
cd frontend

# Install dependencies
npm install

# Create the environment file
touch .env
# Then open .env and fill in your values (see Environment Variables section below)

# Start the development server
npm run dev
```

The frontend will start on **http://localhost:5173**

Open your browser and go to **http://localhost:5173** to use the app.

---

## Environment Variables

### Backend — `backend/.env`

```env
PORT=5000
NODE_ENV=development

# MongoDB connection string
MONGODB_URI=your_mongodb_connection_string

# JWT
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=7d

# Cloudinary (for file attachments)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### Frontend — `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> When connecting to the hosted backend instead of local, replace the value with:
> ```env
> VITE_API_BASE_URL=your_backend_hosted_url
> ```

---

## Running Tests

Tests are written using **Jest** and **React Testing Library**. All test files live in `frontend/src/tests/`.

```bash
# Navigate to the frontend folder
cd frontend

# Run all tests once
npm test

# Run a specific test file
npm test -- --testPathPatterns="authSlice"

# Run with coverage report
npm run test:coverage

# Watch mode (reruns on file save)
npm run test:watch
```

### Test Coverage

| File | Type | Tests |
|---|---|---|
| `authSlice.test.js` | Redux Slice | Login, register, logout, fetchCurrentUser, updateProfile |
| `notificationSlice.test.js` | Redux Slice | Fetch, markAsRead, markAllAsRead, delete, addNotification |
| `projectSlice.test.js` | Redux Slice | CRUD, member add/remove, selectedProject sync |
| `taskSlice.test.js` | Redux Slice | CRUD, comments, attachments, status update |
| `userSlice.test.js` | Redux Slice | Search, fetchAll, updateRole, updateStatus |
| `analyticsSlice.test.js` | Redux Slice | fetchAnalytics, exportAnalytics, setDateRange |
| `analyticsService.test.js` | Service | fetchAnalyticsOverview, exportAnalyticsCSV |
| `validators.test.js` | Yup Schemas | loginSchema, registerSchema |
| `MetricCard.test.jsx` | Component | Renders, color props, edge cases |
| `RouteGuards.test.jsx` | Routing | ProtectedRoute, RoleRoute allow/deny |
| `ThemeContext.test.jsx` | Context | Toggle, localStorage persist, body class |
| `NotificationDropdown.test.jsx` | Component | Render, interactions, API calls |
| `ProjectModal.test.jsx` | Component | Create/edit modes, validation, member search |
| `loginCreateProjectAssignTask.test.jsx` | Integration | Full user flow end-to-end |

---

## Known Limitations

- **File attachments** — Cloudinary upload is configured but not fully functional in the current deployment. The UI for attachments is in place.

---

## Libraries Used

### Frontend

| Library | Purpose |
|---|---|
| `react` + `react-dom` | UI framework |
| `react-router-dom` | Client-side routing |
| `@reduxjs/toolkit` + `react-redux` | State management |
| `react-hook-form` + `yup` | Form handling and validation |
| `axios` | HTTP requests |
| `tailwindcss` | Utility-first CSS |
| `recharts` | Analytics charts |
| `@dnd-kit/core` + `@dnd-kit/sortable` | Kanban drag and drop |
| `socket.io-client` | Real-time notifications |
| `react-toastify` | Toast notifications |
| `lucide-react` | Icons |
| `date-fns` | Date formatting |
| `use-debounce` | Debounced member email search |

### Backend

| Library | Purpose |
|---|---|
| `express` | Web framework |
| `mongoose` | MongoDB ODM |
| `jsonwebtoken` | JWT authentication |
| `bcryptjs` | Password hashing |
| `socket.io` | Real-time communication |
| `cloudinary` + `multer` | File upload handling |
| `cors` | Cross-origin requests |
| `dotenv` | Environment variables |
| `express-validator` | Request validation |
| `nodemon` | Development auto-restart |

### Testing

| Library | Purpose |
|---|---|
| `jest` | Test runner |
| `@testing-library/react` | Component rendering |
| `@testing-library/jest-dom` | DOM matchers |
| `@testing-library/user-event` | User interaction simulation |
| `babel-jest` | JSX transpilation for Jest |

---

## Author

**Kunal** — [GitHub](https://github.com/Kunal-8759)

Built as part of a React internship at **Incture**
