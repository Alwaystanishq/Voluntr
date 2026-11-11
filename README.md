# Voluntr

Voluntr connects volunteers with NGOs and community events. Volunteers can find opportunities, enroll, join waitlists, and track their commitments. Organizations can publish events, maintain a public profile, and submit registration evidence for administrator review.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Environment variables](#environment-variables)
- [Docker setup](#docker-setup)
- [Using the app](#using-the-app)
- [Pages and access](#pages-and-access)
- [Project structure](#project-structure)
- [Data models](#data-models)
- [API reference](#api-reference)
- [Authentication and authorization](#authentication-and-authorization)
- [Redis caching](#redis-caching)

## Features

### For volunteers

- Create an account and sign in with email and password.
- Search events by title or organization name.
- Filter by location, cause category, date range, upcoming or past events, and available places.
- Sort by event date or newest listing, with 12 results per page.
- View event descriptions, dates, locations, required skills, capacity, registration deadlines, and cover images.
- Enroll in events or join a waitlist when capacity is reached.
- View waitlist position and cancel registration within the supported rules.
- Save opportunities independently of enrollment.
- Use a dashboard with upcoming and ongoing commitments, past enrollments, saved opportunities, and waitlisted events.
- Download upcoming commitments as `.ics` calendar files.
- View a personal profile and enrolled events.

### For organizations

- Register and sign in with an NGO account.
- Create events and delete events owned by the organization.
- See event enrollment and waitlist counts in the NGO dashboard.
- Edit the organization name, description, mission, website, logo, and location.
- Maintain a public profile with upcoming, ongoing, and past events.
- Submit a registration number and supporting document URL for verification.
- See verification status and reviewer feedback.

### For administrators

- Access an NGO verification queue through an account ID allowlist.
- Review pending applications and approve or reject them.
- Provide a review note; rejection requires a reason.
- Show verified status on organization profiles and event listings.

Supported causes: Environment, Education, Health, Animal Welfare, Community, Food & Relief, and Other.

## Technology

| Area | Implementation |
| --- | --- |
| Framework | Next.js 16 App Router |
| Interface | React 19 and TypeScript 5 |
| Styling | Tailwind CSS 4 and global CSS |
| Database | MongoDB with Mongoose 9 |
| Authentication | NextAuth.js 4 Credentials provider and JWT sessions |
| Password hashing | bcryptjs |
| Browser HTTP requests | Axios |
| Optional search cache | Redis with the `redis` client |
| Code checks | ESLint 9 with Next.js configuration |
| Containers | Docker and Docker Compose |

The frontend and API run in the same Next.js application. API route handlers use Mongoose to access MongoDB. Redis only caches event search results; MongoDB remains the source of truth.

## Environment variables

Use [.env.example](.env.example) as the template. Keep actual credentials in `.env` or your hosting provider's environment settings. Environment files containing secrets are excluded from Git and the Docker build context.

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string. Local default: `mongodb://localhost:27017/voluntr`. |
| `NEXTAUTH_SECRET` | Yes | Long random secret used by NextAuth for session handling. Replace the example value. |
| `NEXTAUTH_URL` | Yes | App origin, such as `http://localhost:3000` locally or your HTTPS origin in production. |
| `ADMIN_USER_IDS` | No | Comma-separated MongoDB account IDs allowed to review NGO verification requests. Empty disables administrator access. |
| `REDIS_URL` | No | Redis connection URL. Empty disables search caching. Use `redis://` locally or `rediss://` for a TLS connection. |

The MongoDB helper explicitly selects the database named `voluntr`, even if the connection string specifies another database name.

Restart the app after changing server environment variables.

## Docker setup

The included Compose configuration starts the app, MongoDB 8, and Redis 8.

1. Copy `.env.example` to `.env` and set a random `NEXTAUTH_SECRET`.
2. Keep `NEXTAUTH_URL=http://localhost:3000` for local use.
3. Start the stack:

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000). Compose overrides the database and cache URLs inside the app container:

```dotenv
MONGODB_URI=mongodb://mongo:27017/voluntr
REDIS_URL=redis://redis:6379
```

The app port is bound to `127.0.0.1:3000`. MongoDB and Redis are reachable within the Compose network and do not publish host ports. MongoDB data persists in the `mongo-data` named volume; Redis has no persistent volume.

Useful commands:

```bash
docker compose up -d --build
docker compose logs -f app
docker compose down
```

`docker compose down` retains the MongoDB volume. Adding `--volumes` deletes that stored database data.

## Using the app

### Volunteer workflow

1. Register at `/user/signup` and sign in at `/user/login`.
2. Open `/explore` to search and filter opportunities.
3. Open an event to save it, enroll, or join its waitlist.
4. Use `/volunteer/dashboard` to manage commitments and download calendar files.
5. View account information and enrollments at `/profile`.

Saving an event is a bookmark and does not reserve a place. Past events represent previous enrollments; the app does not verify attendance or volunteer hours.

### NGO workflow

1. Register at `/ngo/signup` and sign in at `/ngo/login`.
2. Open `/profile` to complete the organization profile.
3. Create an opportunity at `/create-event`.
4. Manage published events at `/dashboard`.
5. Add a mission, HTTPS website, registration number, and HTTPS supporting document URL, then request verification from the profile editor.

Verification is a review of submitted registration evidence. It is not required to create an event. Changing the organization name, website, registration number, or supporting document URL resets verification to `unverified`.

### Administrator setup

1. Create an account and obtain its MongoDB `_id` from the database or the authenticated `/api/auth/session` response (`user.id`).
2. Add that ID to `ADMIN_USER_IDS`. Separate multiple IDs with commas.
3. Restart the app and sign in with the allowlisted account.
4. Open `/admin/organizations` to review pending requests.

Administrator access is an account ID allowlist, not a separate signup role. Review notes are shared with the organization.

### Enrollment rules

- Events without a capacity limit can accept unlimited enrollments.
- When a limited event is full, new registrations enter a first-in, first-out waitlist.
- Available places are assigned from the waitlist during enrollment changes while registration remains open.
- Registration closes at the deadline, if supplied, or when the event starts.
- Confirmed enrollment cannot be cancelled after the event starts.
- Concurrent enrollment changes retry against the stored snapshot; unresolved conflicts return HTTP `409` so the client can retry.

## Pages and access

| Route | Purpose | Access |
| --- | --- | --- |
| `/` | Home page | Public |
| `/user/signup`, `/user/login` | Volunteer registration and login | Public |
| `/ngo/signup`, `/ngo/login` | NGO registration and login | Public |
| `/organizations/[id]` | Organization profile and events | Public |
| `/explore` | Event search | Signed in |
| `/explore/[id]` | Event details | Signed in |
| `/profile` | Current account profile | Signed in |
| `/volunteer/dashboard` | Volunteer commitments and saved events | Volunteer |
| `/dashboard` | Organization events dashboard | NGO |
| `/create-event` | Event creation | NGO |
| `/admin/organizations` | NGO verification queue | Allowlisted administrator |

`proxy.ts` protects matched pages with NextAuth. Role-specific pages and API handlers apply further checks. API access is defined separately below; public event APIs do not require signing in even though the explore pages do.

## Project structure

```text
voluntr/
├── app/
│   ├── api/
│   │   ├── admin/organizations/       # Verification queue and review decisions
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts # NextAuth credentials and session callbacks
│   │   │   └── login/route.ts         # Standalone volunteer credential check
│   │   ├── events/
│   │   │   ├── route.ts               # Search and create events
│   │   │   └── [id]/
│   │   │       ├── route.ts           # Read or delete an event
│   │   │       ├── enroll/route.ts    # Enrollment and waitlist operations
│   │   │       └── save/route.ts      # Saved-event operations
│   │   ├── organizations/            # Signup, profiles, verification requests
│   │   ├── users/                    # Volunteer signup and account operations
│   │   └── volunteer/dashboard/      # Volunteer event groups
│   ├── admin/organizations/page.tsx
│   ├── create-event/page.tsx
│   ├── dashboard/page.tsx
│   ├── explore/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── ngo/                          # NGO login and signup pages
│   ├── organizations/[id]/page.tsx
│   ├── profile/page.tsx
│   ├── user/                         # Volunteer login and signup pages
│   ├── volunteer/dashboard/page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx                    # Fonts, metadata, and session provider
│   ├── not-found.tsx
│   └── page.tsx                      # Home page
├── components/
│   ├── EnrollmentControls.tsx
│   ├── EventInformation.tsx
│   ├── Navbar.tsx
│   ├── OrganizationIdentity.tsx
│   ├── OrganizationProfileEditor.tsx
│   ├── OrganizationReviewQueue.tsx
│   ├── SaveEventButton.tsx
│   └── TaglineReveal.tsx
├── lib/
│   ├── admin.ts                      # Administrator allowlist checks
│   ├── enrollment.ts                 # Capacity, waitlist, and concurrency rules
│   ├── event-cache.ts                # Search caching and invalidation
│   ├── event-filters.ts               # Search parameter validation and filters
│   ├── event-validation.ts            # Event input validation
│   ├── mongodb.ts                    # Cached Mongoose connection
│   ├── organization-profile.ts        # Profile validation and field selection
│   ├── redis.ts                      # Optional Redis connection
│   ├── user-profile.ts                # Volunteer profile validation
│   └── volunteer-events.ts            # Event grouping and calendar generation
├── models/
│   ├── event.ts
│   ├── organiztion.ts                # Organization model; filename as committed
│   └── user.ts
├── providers/SessionProvider.tsx
├── public/                           # Static SVG assets
├── types/
│   ├── event.ts
│   ├── next-auth.d.ts                 # Session and JWT ID/role types
│   └── organization.ts
├── .dockerignore
├── .env.example
├── .gitignore
├── AGENTS.md                         # Repository instructions for coding agents
├── CLAUDE.md
├── compose.yaml
├── Dockerfile
├── eslint.config.mjs
├── next.config.js
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── proxy.ts                          # Page authentication
├── README.md
└── tsconfig.json
```

Generated files and directories such as `node_modules/`, `.next/`, `next-env.d.ts`, and TypeScript build metadata are omitted. The `@/*` TypeScript alias resolves from the repository root.

## Data models

All three models include Mongoose `createdAt` and `updatedAt` timestamps.

| Model | Main fields and relationships |
| --- | --- |
| User | Name, unique email, hashed password, saved event references. Enrollment relationships are stored on events. |
| Organization | Name, unique email, hashed password, description, mission, website, logo, location, registration number, supporting document URL, verification status, review note, and verification dates. |
| Event | Title, description, start and optional end date, location, category, required skills, optional capacity and deadline, cover image URL, organization reference, enrolled user references, and waitlisted user references. |

Organization verification states are `unverified`, `pending`, `verified`, and `rejected`. Passwords are hashed in model save hooks. The organization profile API exposes registration evidence and reviewer feedback to the owner; administrator review endpoints also expose the fields needed for review.

## API reference

`[id]` represents a MongoDB document ID. Protected endpoints use the NextAuth session cookie. JSON request bodies use `Content-Type: application/json`.

### Authentication and accounts

| Method | Endpoint | Purpose | Access |
| --- | --- | --- | --- |
| GET, POST | `/api/auth/[...nextauth]` | NextAuth authentication and session endpoints | Depends on operation |
| POST | `/api/auth/login` | Check volunteer credentials and return basic account data; does not create a NextAuth session | Public |
| POST | `/api/users` | Register a volunteer with `name`, `email`, and `password` | Public |
| GET | `/api/users/[id]` | Read own account and enrolled events | Account owner, volunteer |
| PUT | `/api/users/[id]` | Update own name with `{ "name": "..." }` | Account owner, volunteer |
| DELETE | `/api/users/[id]` | Delete own account | Account owner, volunteer |

There is no `GET /api/users` endpoint for listing accounts. The login pages use NextAuth's credentials sign-in flow.

### Organizations and verification

| Method | Endpoint | Purpose | Access |
| --- | --- | --- | --- |
| GET | `/api/organizations` | List public organization fields | Public |
| POST | `/api/organizations` | Register an NGO with `name`, `email`, `password`, and optional profile fields | Public |
| GET | `/api/organizations/[id]` | Read profile and events; owners receive additional private fields | Public, with owner-specific response |
| PUT | `/api/organizations/[id]` | Update profile fields | Organization owner |
| DELETE | `/api/organizations/[id]` | Delete organization account | Organization owner |
| POST | `/api/organizations/[id]/verification` | Submit completed profile for verification | Organization owner |
| GET | `/api/admin/organizations` | List pending verification requests | Administrator |
| PUT | `/api/admin/organizations/[id]` | Approve or reject a pending request | Administrator |

Review decisions accept `status` (`verified` or `rejected`), `note`, and `version`. `version` is the organization's `updatedAt` timestamp from the queue response. A changed or already reviewed request returns `409`.

### Events and volunteer activity

| Method | Endpoint | Purpose | Access |
| --- | --- | --- | --- |
| GET | `/api/events` | Search events and return pagination metadata | Public |
| POST | `/api/events` | Create an event for the signed-in organization | NGO |
| GET | `/api/events/[id]` | Read event details | Public |
| DELETE | `/api/events/[id]` | Delete an event | Organization that owns the event |
| GET | `/api/events/[id]/enroll` | Read current enrollment status, counts, and waitlist position | Volunteer |
| POST | `/api/events/[id]/enroll` | Enroll or join the waitlist | Volunteer |
| DELETE | `/api/events/[id]/enroll` | Cancel enrollment or leave the waitlist | Volunteer |
| GET | `/api/events/[id]/save` | Read saved state | Volunteer |
| PUT | `/api/events/[id]/save` | Save an event | Volunteer |
| DELETE | `/api/events/[id]/save` | Remove a saved event | Volunteer |
| GET | `/api/volunteer/dashboard` | Return `upcoming`, `past`, `saved`, and `waitlisted` event lists | Volunteer |

### Event search parameters

| Parameter | Values or behavior | Default |
| --- | --- | --- |
| `q` | Case-insensitive literal match on title or organization name; up to 200 characters | Empty |
| `location` | Case-insensitive literal match; up to 200 characters | Empty |
| `category` | One of the supported causes | Any |
| `scope` | `upcoming`, `past`, or `all` | `upcoming` |
| `from` | Inclusive start-date lower bound | None |
| `to` | Exclusive start-date upper bound; must be later than `from` | None |
| `available` | `true` limits results to future events with open registration and free capacity; `false` disables this filter | `false` |
| `sort` | `soonest` or `newest` | `soonest` |
| `page` | Integer from 1 to 10000; page size is fixed at 12 | `1` |

For example, against a local server:

```bash
curl 'http://localhost:3000/api/events?category=Environment&available=true&sort=soonest&page=1'
```

The response contains `success`, `events`, and `pagination` with `page`, `pageSize`, `total`, and `totalPages`.

Event creation requires `title` and `date`. Optional fields are `description`, `endDate`, `location`, `category`, `requiredSkills`, `capacity`, `registrationDeadline`, and `coverImage`. The server derives the organization from the session. Image URLs must use HTTPS; end dates must follow the start date, deadlines must be on or before the start, and capacity must be a positive integer or `null`.

## Authentication and authorization

- NextAuth checks credentials against volunteer and organization records and stores account ID and role in JWT sessions.
- The session role is `user` for volunteers or `ngo` for organizations.
- Both models hash passwords with bcrypt using a cost factor of 10.
- Page authentication lives in `proxy.ts`; protected API handlers perform session, role, and ownership checks separately.
- Administrator endpoints check `ADMIN_USER_IDS` against the signed-in account ID.
- Volunteer account APIs are restricted to the owner. Public organization responses select public profile fields.
- Cover images, organization logos, websites, and verification documents use URLs. The app does not upload files.

## Redis caching

Set `REDIS_URL` to enable caching for `GET /api/events`.

- Search results have a 15-second TTL.
- Keys include the search parameters and a cache generation identifier.
- Event creation, deletion, enrollment changes, organization profile changes, and verification decisions invalidate event search results.
- Missing configuration or a cache failure falls back to MongoDB.
- The `X-Event-Cache` response header reports `HIT`, `MISS`, or `BYPASS`.
- Event search responses use `Cache-Control: no-store`; the Redis cache is server-side.

Redis is optional for local development and production. Cache invalidation failures can leave results stale until their 15-second TTL expires.
