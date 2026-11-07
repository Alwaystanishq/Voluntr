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

* Create events with location, start/end time, cause category, required skills, capacity, registration deadline, and an HTTPS cover image URL
* Display event details in exploration cards, event pages, and the NGO dashboard
* Enforce registration deadlines and volunteer capacity during enrollment
* Explore events with title/NGO search, location/cause/date filters, available spots, sorting, and pagination
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
* Better responsive design
* Toast notifications
* Deployment

---

# Author

Built by Tanishq using Next.js and MongoDB.

## Event search

Explore defaults to upcoming events, sorted by start time, with 12 events per page.
Filters combine when you select **Search events**; **Reset filters** restores defaults.
Date ranges include the entire selected end date in the browser’s local timezone.
Available spots means the event has not started, registration is open, and capacity is not full.

`GET /api/events` accepts `q`, `location`, `category`, `scope` (`upcoming`, `all`, `past`),
`from` and `to` (ISO timestamps; `to` is exclusive), `available` (`true` or `false`),
`sort` (`soonest` or `newest`), and `page`. Responses include `pagination` metadata.

Run search/filter validation tests with `node tests/event-filters.test.mjs`.

## Volunteer dashboard

Volunteers land on `/volunteer/dashboard` after login and can access it through **Dashboard** in the navigation.
The dashboard shows upcoming/ongoing commitments, past enrollments, and saved opportunities.
Past enrollments do not imply verified attendance or volunteer hours.

Use **Save opportunity** on an event page to bookmark it, and remove bookmarks from the dashboard.
Bookmarks persist in the volunteer's account and do not reserve a place.
Use **Add to calendar** on an upcoming commitment to download an `.ics` file for your calendar app.

The session-protected `/api/volunteer/dashboard` endpoint returns the current volunteer's events.
`GET`, `PUT`, and `DELETE /api/events/[id]/save` read, save, and remove a bookmark for the signed-in volunteer.
