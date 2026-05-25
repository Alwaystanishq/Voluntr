# Voluntr

A full-stack volunteer event platform built with Next.js, MongoDB, NextAuth, and Tailwind CSS.

## Features

### Authentication

* User signup and login
* NGO signup and login
* Secure password hashing with bcrypt
* Session management using NextAuth
* Protected routes with middleware

### Event Management

* Create events
* Explore all events
* View event details
* Edit events
* Delete events
* Enroll in events
* Prevent duplicate enrollments

### NGO Dashboard

* View created events
* Edit events
* Delete events
* View enrolled users count

---

# Tech Stack

## Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Axios

## Backend

* Next.js API Routes
* MongoDB
* Mongoose
* NextAuth
* bcryptjs

---

# Folder Structure

```bash
app/
 ├── api/
 ├── dashboard/
 ├── explore/
 ├── create-event/
 ├── edit-event/
 ├── ngo/
 ├── user/
 └── page.tsx

components/
 └── Navbar.tsx

lib/
 └── mongodb.ts

models/
 ├── user.ts
 ├── organization.ts
 └── event.ts

providers/
 └── SessionProvider.tsx
```

---

# Installation

## Clone the repository

```bash
git clone <your-repo-url>
```

## Install dependencies

```bash
npm install
```

## Create `.env` file

```env
MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

## Run development server

```bash
npm run dev
```

---

# API Routes

## Auth

```bash
/api/auth/[...nextauth]
```

## Users

```bash
/api/users
```

## Organizations

```bash
/api/organizations
/api/organizations/[id]
```

## Events

```bash
/api/events
/api/events/[id]
/api/events/[id]/enroll
```

---

# Pages

## Public Pages

* Landing Page
* User Signup
* User Login
* NGO Signup
* NGO Login

## Protected Pages

* Explore Events
* Event Details
* Create Event
* Edit Event
* NGO Dashboard

---

# Future Improvements

* Role-based UI
* Event images
* Search and filtering
* Better responsive design
* Toast notifications
* Deployment

---

# Author

Built by Tanishq using Next.js and MongoDB.
