# ProjectPulse

A client portal and project dashboard. An admin manages projects and milestones; each client signs in and sees only their own projects, with live progress, deadlines and an activity feed.

Built with **Next.js 16** (App Router, Server Components, Server Actions), **TypeScript**, **Prisma** and **PostgreSQL**.

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Data model](#data-model)
- [Pages](#pages)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [Testing](#testing)
- [Security](#security)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)
- [License](#license)

## Features

- **Authentication.** Email and password sign-in with sessions managed by Auth.js.
- **Two roles.** `admin` manages everything; `client` has read-only access to their own projects.
- **Projects.** Create, edit and archive projects, assign each to a client, and track its status (`planning`, `active`, `on_hold`, `completed`). Archived projects are hidden from clients and from the default admin list.
- **Milestones.** Ordered milestones with optional due dates. Admins can complete, reopen, rename, reorder and delete them. Project progress is calculated automatically from completed milestones.
- **Activity feed.** A timeline of project creation, status changes, completed and reopened milestones, and free-text notes posted by admins.
- **Dashboard.** Active projects with progress bars, upcoming and overdue deadlines, and recently completed milestones, scoped to what the signed-in user may see.
- **Forms with validation.** The same Zod schemas validate input in the browser (instant feedback) and again on the server.
- **Responsive and accessible UI.** Works on phone-sized screens; form errors are linked to their inputs.

## Tech stack

| Concern            | Choice                                                    |
| ------------------ | --------------------------------------------------------- |
| Framework          | Next.js 16: App Router, Server Components, Server Actions |
| Language           | TypeScript (strict)                                       |
| Styling            | Tailwind CSS 4                                            |
| Database           | PostgreSQL 16                                             |
| ORM and migrations | Prisma 6                                                  |
| Authentication     | Auth.js v5 (credentials provider), bcryptjs               |
| Validation         | Zod 4                                                     |
| Unit tests         | Vitest                                                    |
| End-to-end tests   | Playwright                                                |
| Code quality       | ESLint, Prettier                                          |
| Deployment         | Docker, or any Node.js host                               |

## Architecture

```
Browser
   │
   ▼
Next.js
├── proxy.ts            redirects unauthenticated visitors to /login
├── app/                routes, layouts and Server Components
│   ├── (auth)/login    sign-in page
│   ├── (dashboard)/    dashboard, project list, detail and edit pages
│   ├── actions/        Server Actions: every data mutation
│   └── api/auth/       Auth.js route handlers
├── components/         UI building blocks, forms, milestone list, activity feed
├── lib/
│   ├── auth.ts         Auth.js configuration (credentials provider)
│   ├── password.ts     password hashing and verification
│   ├── session.ts      requireUser() and requireAdmin()
│   ├── db.ts           Prisma client
│   ├── validation/     Zod schemas shared by forms and actions
│   └── services/       project, milestone, note and dashboard logic
├── prisma/             schema, migrations and seed script
└── scripts/            create-user command-line tool
   │
   ▼
PostgreSQL
```

Design decisions:

- **Server Components by default.** Data is fetched on the server, close to the database, and read-only pages ship almost no JavaScript.
- **Server Actions for mutations.** Every action calls `requireAdmin()` (or `requireUser()`), validates its input with Zod, and then calls a service function.
- **Authorization lives in the data layer.** Every project query is built with `projectScope(user)`. For a client this adds `clientId = user.id` and excludes archived projects, so a client cannot load another client's project even by guessing its URL. Out-of-scope projects return `404`, not `403`.
- **The session proves identity; the database decides permissions.** The user's role is read from the database on every request, so deleting or demoting a user takes effect immediately.
- **One schema, two checks.** The browser validates with the same Zod schema the server uses, and the server never trusts the browser.
- **Dates are calendar dates in UTC.** Project and milestone dates are stored at UTC midnight and formatted in UTC, which avoids off-by-one-day errors across time zones.

## Data model

| Model       | Fields                                                                                                            |
| ----------- | ----------------------------------------------------------------------------------------------------------------- |
| `User`      | `id`, `email` (unique), `passwordHash`, `name`, `role` (`ADMIN` or `CLIENT`), `createdAt`                         |
| `Project`   | `id`, `name`, `description`, `status`, `clientId`, `startDate`, `dueDate`, `archivedAt`, `createdAt`, `updatedAt` |
| `Milestone` | `id`, `projectId`, `title`, `dueDate`, `completedAt`, `order`                                                     |
| `Activity`  | `id`, `projectId`, `type`, `message`, `createdAt`, `actorId`                                                      |

A project belongs to one client. Milestones and activity entries are deleted with their project. Users who own projects or activity cannot be deleted (`onDelete: Restrict`).

## Pages

| Route                 | Description                                                                                          | Access                      |
| --------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------- |
| `/login`              | Sign in                                                                                              | Public                      |
| `/`                   | Dashboard                                                                                            | Signed-in users             |
| `/projects`           | Project list. Admins see all projects (`?archived=1` includes archived ones); clients see their own. | Signed-in users             |
| `/projects/[id]`      | Project detail: progress, milestones, activity                                                       | Admin, or the owning client |
| `/projects/new`       | Create a project                                                                                     | Admin                       |
| `/projects/[id]/edit` | Edit the project and manage its milestones                                                           | Admin                       |

## Getting started

### Prerequisites

- Node.js 20.9 or newer (CI and the Docker image use Node 22)
- Docker, or any PostgreSQL 14+ database

### Run locally

```bash
npm install
cp .env.example .env          # then set AUTH_SECRET (see Configuration)
docker compose up -d db       # PostgreSQL on localhost:5432; skip if you have your own database
npx prisma migrate deploy     # apply the database migrations
npx prisma db seed            # optional: demo accounts and projects
npm run dev
```

Open <http://localhost:3000>. `npx prisma migrate dev` can be used instead of `migrate deploy` while developing the schema.

### Demo accounts

`npx prisma db seed` creates three accounts, all using the password from `SEED_PASSWORD` (default `demo-password`), plus five sample projects. The seed only ever adds data, so it is safe to run repeatedly.

| Email                 | Role            |
| --------------------- | --------------- |
| `admin@example.com`   | Admin           |
| `client@example.com`  | Client (Casey)  |
| `client2@example.com` | Client (Jordan) |

Do not run the seed against a database that is reachable by real users.

### Create your own users

There is no public sign-up; accounts are created by the operator:

```bash
npm run user:create -- --email you@company.com --name "Your Name" --role ADMIN
npm run user:create -- --email client@company.com --name "A Client" --role CLIENT
```

If `--password` is omitted, a strong random password (at least 12 characters) is generated and printed once.

### Run everything in Docker

```bash
cp .env.example .env          # set AUTH_SECRET; change POSTGRES_PASSWORD for anything but local use
docker compose up --build -d
docker compose run --rm migrate npx prisma db seed    # optional demo data
```

Compose starts PostgreSQL, applies the migrations in a one-off `migrate` service, and then starts the application from a minimal production image. The app is served at <http://localhost:3000>.

## Configuration

Copy `.env.example` to `.env`. Never commit `.env`.

| Variable                                            | Required | Description                                                                                              |
| --------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                      | yes      | PostgreSQL connection string, for example `postgresql://postgres:postgres@localhost:5432/projectpulse`   |
| `AUTH_SECRET`                                       | yes      | Random secret used by Auth.js to sign sessions. Generate one with `openssl rand -base64 32`.             |
| `AUTH_URL`                                          | yes      | Public URL of the app, for example `http://localhost:3000`                                               |
| `SEED_PASSWORD`                                     | no       | Password for the demo accounts created by the seed script (default `demo-password`)                      |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | no       | Database container credentials used by Docker Compose (defaults: `postgres`, `postgres`, `projectpulse`) |

## Scripts

| Command                                   | Description                                         |
| ----------------------------------------- | --------------------------------------------------- |
| `npm run dev`                             | Start the development server                        |
| `npm run build`                           | Generate the Prisma client and build for production |
| `npm start`                               | Start the production server                         |
| `npm run lint`                            | Run ESLint                                          |
| `npm run typecheck`                       | Run the TypeScript compiler without emitting files  |
| `npm run format` / `npm run format:check` | Format with Prettier / verify formatting            |
| `npm test`                                | Run the unit tests (Vitest)                         |
| `npm run test:e2e`                        | Run the end-to-end tests (Playwright)               |
| `npm run user:create`                     | Create a user from the command line                 |

## Testing

**Unit tests** (`npm test`) cover progress calculation, permission scoping, validation schemas, password hashing, and date and redirect helpers.

**End-to-end tests** (`npm run test:e2e`) drive a real browser against a real database. Prepare the database and install the browser once:

```bash
npx prisma migrate deploy
npx prisma db seed
npx playwright install chromium
npm run test:e2e
```

They cover signing in and out, access control (a client sees only their own projects and gets a 404 for anyone else's), creating and assigning projects, the milestone workflow and its effect on progress and the activity feed, archiving, form validation, security headers, session cookie flags, and the layout on a phone-sized screen. Playwright reuses a server that is already running on port 3000; otherwise it starts the development server.

Continuous integration (GitHub Actions) runs Prettier, ESLint, the type checker and the unit tests, and then the end-to-end tests against a PostgreSQL service and a production build.

## Security

- Passwords are hashed with bcrypt. Sessions are Auth.js JWTs stored in an HTTP-only cookie.
- Every Server Action checks the user's role on the server and validates its input with Zod. Server Actions are additionally protected against cross-site requests by Next.js's built-in origin check.
- All project queries are scoped to the signed-in user, so one client can never read another client's data.
- The role is re-read from the database on each request; the session alone does not grant access.
- Signing in with an unknown email costs the same bcrypt work as a wrong password, so response time does not reveal which accounts exist.
- The post-sign-in redirect only accepts paths inside the app, so the login page cannot be used as an open redirect.
- Responses carry `X-Content-Type-Options`, `X-Frame-Options` and `frame-ancestors`, `Referrer-Policy`, `Permissions-Policy` and `Strict-Transport-Security` headers. The `X-Powered-By` header is removed.
- Secrets come from environment variables only. There is no public sign-up.

## Deployment

**Docker.** The included `Dockerfile` builds a minimal production image (a standalone Next.js server running as an unprivileged user), and `docker-compose.yml` wires it to PostgreSQL. Put the app behind HTTPS in production and set `AUTH_URL` to the public URL. The Compose file sets `AUTH_TRUST_HOST` because the container sits behind Docker's port mapping; keep it only when a trusted reverse proxy fronts the app.

**Other hosts.** Provide `DATABASE_URL`, `AUTH_SECRET` and `AUTH_URL`, run `npx prisma migrate deploy` on each release, and run `npm run build` followed by `npm start`.

## Known limitations

- Sign-in attempts are not rate limited by the application; apply a limit at your reverse proxy, gateway or WAF.
- Accounts are created from the command line; there is no user-management interface.
- The project list is not paginated.

## License

Released under the [MIT License](LICENSE).
