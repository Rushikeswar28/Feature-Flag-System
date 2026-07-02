# Multi-Tenant Feature Flag Management System

A small SaaS-style feature flag platform with three roles — **Super Admin**, **Organization Admin**, and **End User** — built for the Byepo Technologies SDE assignment.

## ⚠️ Tech stack note

The assignment's **Tech Constraints** section states the backend must be **Node.js** (e.g. Express). This project is built in **Spring Boot (Java) + MySQL** instead, per an explicit choice made during development. If the evaluator's tooling or grading criteria strictly require Node.js, this submission will not meet that constraint as written — worth confirming before submitting. Everything else (roles, API design, data model, JWT auth) follows the assignment's requirements.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Backend | Java 21, Spring Boot 3.2, Spring Security, Spring Data JPA |
| Database | MySQL 8 |
| Auth | Custom JWT (io.jsonwebtoken) + BCrypt password hashing — **no third-party auth provider** |
| Frontend | React 18 + Vite, React Router, Axios — single app, three role-scoped sections |

---

## Architecture

```
                    ┌─────────────────────────────┐
                    │   React SPA (Vite)           │
                    │  /super-admin  /admin  /user │
                    └───────────────┬───────────────┘
                                    │ REST + JWT (Authorization: Bearer)
                    ┌───────────────▼───────────────┐
                    │      Spring Boot Backend       │
                    │  Controller → Service → Repo   │
                    │  JwtAuthFilter validates every  │
                    │  request and injects an        │
                    │  AuthenticatedUser principal    │
                    │  (role, organizationId, userId) │
                    └───────────────┬───────────────┘
                                    │ JPA / Hibernate
                    ┌───────────────▼───────────────┐
                    │            MySQL               │
                    │  organizations / users / flags │
                    └─────────────────────────────────┘
```

**Multi-tenancy enforcement**: every Org Admin and End User endpoint derives `organizationId` from the JWT claims, never from a client-supplied parameter. This means one organization can never read or mutate another organization's data, even by guessing IDs — the isolation is enforced server-side on every request, not just in the UI.

---

## Data Model

```
Organization
 ├── id, name, createdAt

User  (Org Admins and End Users; Super Admin is NOT a row here)
 ├── id, name, email (unique), password (bcrypt), role [ORG_ADMIN|END_USER]
 └── organization_id (FK)

FeatureFlag
 ├── id, featureKey, enabled, createdAt, updatedAt
 └── organization_id (FK)
     unique(organization_id, featureKey)  -- same key can exist in different orgs
```

Super Admin credentials are **static and config-based** (`application.properties`), per the assignment spec — there's intentionally no `role=SUPER_ADMIN` row in the `users` table.

---

## Auth & Security Model

- **Super Admin**: username/password checked against `app.super-admin.*` config values → issues a JWT with `role=SUPER_ADMIN`, no `organizationId`.
- **Org Admin / End User**: signup hashes the password with BCrypt and stores a `User` row scoped to the chosen organization; login verifies the hash and issues a JWT containing `role`, `organizationId`, `userId`.
- Every protected endpoint is locked down by role in `SecurityConfig` (`hasRole(...)`), and `JwtAuthFilter` parses the token on each request into a Spring Security principal.
- No sessions, no cookies — fully stateless, so the API can be called directly (see Postman collection) independent of the frontend.

---

## API Reference

All endpoints are prefixed with `/api`. Protected endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/super-admin/login` | public | Super Admin login |
| POST | `/organizations` | SUPER_ADMIN | Create an organization |
| GET | `/organizations` | SUPER_ADMIN | List all organizations |
| GET | `/organizations/public` | public | Lightweight org list for signup dropdowns |
| POST | `/admin/signup` | public | Org Admin signup (choose org) |
| POST | `/admin/login` | public | Org Admin login |
| POST | `/flags` | ORG_ADMIN | Create a feature flag (own org) |
| GET | `/flags` | ORG_ADMIN | List feature flags (own org) |
| PUT | `/flags/{id}` | ORG_ADMIN | Update key and/or enabled status |
| DELETE | `/flags/{id}` | ORG_ADMIN | Delete a feature flag |
| POST | `/user/signup` | public | End User signup (choose org) |
| POST | `/user/login` | public | End User login |
| POST | `/user/check-feature` | END_USER | Check if `featureKey` is enabled for own org |

A ready-to-import Postman collection is included: `postman_collection.json`.

---

## Setup & Run Instructions

### Prerequisites
- Java 21+ and Maven
- MySQL 8 running locally
- Node.js 18+ and npm

### 1. Database
No manual setup needed — `spring.datasource.url` includes `createDatabaseIfNotExist=true`, and `ddl-auto=update` lets Hibernate create the tables on first run. Just make sure a MySQL server is running and the credentials in `backend/src/main/resources/application.properties` match your local setup (defaults: `root` / `root`).

### 2. Backend
```bash
cd backend
mvn spring-boot:run
```
Runs on `http://localhost:8080`.

Default Super Admin credentials (in `application.properties`):
```
username: admin
password: admin123
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`.

### 4. Try it out
1. Go to `http://localhost:5173` → **Super Admin** → log in with `admin` / `admin123` → create an organization.
2. Go to **Organization Admin** → sign up (pick the org you just made) → create a feature flag, e.g. `dark_mode`, enabled.
3. Go to **End User** → sign up (same org) → check `dark_mode` → see it report **Enabled**.

### Testing with Postman
Import `postman_collection.json`. After each login call, copy the returned `token` into the corresponding collection variable (`superAdminToken`, `adminToken`, `userToken`) to authenticate subsequent requests.

---

## Design Decisions & Trade-offs

- **Single React app instead of three separate apps.** The assignment describes three front-ends; I implemented them as three route-scoped sections of one Vite app (`/super-admin`, `/admin`, `/user`) instead of three separate deployable projects. This keeps shared code (API client, styling tokens) in one place and is faster to set up and run, at the cost of not being three independently deployable artifacts. Functionally each role only ever sees its own routes and its own JWT.
- **End Users self-signup rather than being provisioned by an Org Admin.** The assignment's minimum requirement for the End User frontend doesn't mention login at all, but the sample screens show a login page — and the system needs *some* way to associate a user with an organization to answer "is this feature enabled for my org." I resolved this by giving End Users the same self-signup pattern as Org Admins (pick org from a dropdown), rather than adding an admin-side user-provisioning flow. This keeps the auth pattern consistent across roles and avoids scope creep, at the cost of the "contact your admin" idea implied by the sample image.
- **Missing feature flags return `found: false` instead of 404.** For the End User check, a flag that doesn't exist and a flag that exists-but-is-disabled are both meaningful, distinct answers — the API models that explicitly (`{ enabled, found }`) rather than collapsing "not found" into a generic error.
- **`ddl-auto=update` instead of migrations.** Flyway/Liquibase would be the production-grade choice, but for a 6-10 hour assignment with a fixed, small schema, letting Hibernate manage the schema directly is a reasonable and much faster trade-off.
- **Partial updates on `PUT /flags/{id}`.** The request body allows either `featureKey`, `enabled`, or both — this lets the UI's inline toggle switch flip just the `enabled` bit without re-sending the key, while still allowing a full edit from the modal.

## Known Limitations / What I'd Do With More Time

- No refresh tokens — JWTs are long-lived (24h) and there's no revocation/logout-everywhere mechanism.
- No pagination on the organizations/flags lists — fine at assignment scale, would matter at real scale.
- No automated test suite (unit/integration tests) — validated manually via the included Postman collection instead, given the time budget.
- Org Admin can't rename an organization or manage End Users directly; Super Admin can't deactivate an organization.
