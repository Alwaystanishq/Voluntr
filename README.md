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
* Delete events
* Enroll in events
* Prevent duplicate enrollments

### NGO Dashboard

* View created events
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

```text
app/
 ├── api/                 # Auth, accounts, events, bookmarks, verification
 ├── admin/organizations/ # NGO verification reviews
 ├── create-event/
 ├── dashboard/           # NGO dashboard
 ├── explore/
 ├── ngo/
 ├── organizations/[id]/  # Public NGO trust profiles
 ├── profile/
 ├── user/
 ├── volunteer/dashboard/
 └── page.tsx
components/              # Shared navigation, event and profile controls
lib/                     # Database, validation, enrollment and access helpers
models/                  # User, NGO and event schemas
providers/               # Session provider
types/                   # Shared TypeScript types
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

## Configure the environment

Copy `.env.example` to `.env` and fill in your MongoDB connection string, a long random `NEXTAUTH_SECRET`, and the app URL. Optionally set `ADMIN_USER_IDS` to enable NGO verification reviewers. Keep `.env` out of Git.

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
/api/users/[id]
```

`POST /api/users` is public signup. User listing is unavailable (`GET /api/users` returns 405).
Reading, updating or deleting `/api/users/[id]` requires a signed-in volunteer accessing their own account.
Updates accept only `name`; password, email, roles, saved events and MongoDB operators cannot be changed through this endpoint.
Account responses never include password hashes.

## Organizations

```bash
/api/organizations
/api/organizations/[id]
```

## Events

Events support creation, discovery, enrollment management and deletion. Event editing is unavailable; `PUT /api/events/[id]` returns 405.

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
* NGO public profile (`/organizations/[id]`)

## Protected Pages

* Explore Events
* Event Details
* Create Event
* NGO Dashboard
* Volunteer Dashboard
* My Profile
* NGO verification review queue (configured admins only)

---

# Future Improvements

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


## Volunteer dashboard

Volunteers land on `/volunteer/dashboard` after login and can access it through **Dashboard** in the navigation.
The dashboard shows upcoming/ongoing commitments, past enrollments, and saved opportunities.
Past enrollments do not imply verified attendance or volunteer hours.

Use **Save opportunity** on an event page to bookmark it, and remove bookmarks from the dashboard.
Bookmarks persist in the volunteer's account and do not reserve a place.
Use **Add to calendar** on an upcoming commitment to download an `.ics` file for your calendar app.

The session-protected `/api/volunteer/dashboard` endpoint returns the current volunteer's events.
`GET`, `PUT`, and `DELETE /api/events/[id]/save` read, save, and remove a bookmark for the signed-in volunteer.

## Enrollment management

- Volunteers enroll or join a full event's waitlist from the event page.
- Enrollments can be cancelled until the event starts; a waitlist entry can be removed at any time.
- Vacancies go to the first people on the waitlist while registration is open.
- No new enrollment or promotion happens after the registration deadline (or event start if no deadline is set).
- The volunteer dashboard includes a Waitlist view and cancellation controls; use Refresh dashboard to see promotions.
- NGO event cards show enrollment, capacity, and waitlist counts.
- `GET /api/events/[id]/enroll` returns the current volunteer's status and queue position, `POST` enrolls or queues them, and `DELETE` cancels their registration.

## NGO trust profiles and verification

- Public profiles at `/organizations/[id]` show the NGO's logo, mission, description, location, website, verification status, and upcoming/past events.
- NGOs use **Edit trust profile** on their dashboard (or **Profile**) to update these details. Logos use HTTPS image URLs.
- Event pages link to the organizer's profile; event listings show verification badges.
- Owners can submit a verification request after saving a mission, website, registration number, and supporting document URL. Supporting details are returned only to the owner and authorized reviewers; account emails are not shown publicly.
- Only an administrator can approve a verification badge. Updating the name, website, registration number, or supporting document resets verification and requires a fresh request.

To enable administrative reviews, set `ADMIN_USER_IDS` in the server environment to a comma-separated list of trusted, existing account MongoDB IDs, then restart the server. Sign in with one of those accounts and visit `/admin/organizations` to review pending requests. Reviewers can approve or reject with a reason; rejection notes are visible to the NGO. No accounts receive administrative access by default.

```env
ADMIN_USER_IDS=trusted_account_mongodb_id
```

Reviewers should confirm registration evidence and the organization's website before approving. A verified badge records this review; past event counts reflect event history, not independently verified impact.
