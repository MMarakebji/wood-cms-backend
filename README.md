# Wood Products CMS — Backend

## Project Overview

This repository contains the NestJS REST API for the Wood Products CMS technical assessment. It provides public website content, administrator authentication, protected CMS operations, PostgreSQL persistence, and image storage integration for the separate Next.js frontend.

## Features

- JWT administrator authentication with access and refresh tokens
- Short-lived access tokens and persisted refresh sessions
- Argon2 administrator password hashing
- Protected administration endpoints
- Homepage settings and section content management
- Banner creation, editing, deletion, and ordering
- Service creation, editing, deletion, and ordering
- Product and wood-type/material content management
- Product feature management and ordering
- Product image upload, metadata management, primary-image selection, and ordering
- Price-list management and ordering
- Public contact-message submission and administrator message management
- Public endpoints for homepage, service, product, and price-list content
- Supabase Storage image and video uploads
- Swagger/OpenAPI documentation with bearer authentication support
- Global DTO validation and request transformation
- PostgreSQL persistence through Prisma ORM
- Versioned Prisma migrations and repeatable administrator seeding
- Database health endpoint

## Technology Stack

- NestJS 11
- TypeScript 5
- Node.js and npm
- PostgreSQL
- Prisma ORM and Prisma Client 7
- Swagger/OpenAPI through `@nestjs/swagger` 11
- Argon2
- JWT and Passport
- `class-validator` and `class-transformer`
- Supabase Storage
- Railway application hosting and Railway PostgreSQL

## Architecture

Application requests follow this path:

```text
Next.js frontend
       │
       ▼
NestJS REST API
       │
       ▼
Prisma ORM
       │
       ▼
Railway PostgreSQL
```

Image and video uploads follow this path:

```text
Next.js frontend
       │
       ▼
NestJS backend
       │
       ▼
Supabase Storage
```

The backend stores public media URLs and related content metadata in PostgreSQL while the files themselves are stored in Supabase Storage.

## Repository Structure

```text
src/
├── auth/                Administrator login, tokens, guards, and JWT strategy
├── homepage/            Homepage settings and editable content sections
├── banners/             Banner administration
├── services/            Service administration
├── products/            Products, features, and product images
├── price-lists/         Price-list administration
├── contact-messages/    Public submissions and administrator message handling
├── media/               Supabase Storage uploads
├── public-content/      Aggregated public content endpoints
└── prisma/              PrismaModule and PrismaService
prisma/
├── migrations/          Versioned PostgreSQL migration history
├── schema.prisma        Database schema
└── seed.ts              Repeatable administrator seed
test/                    End-to-end tests
```

Prisma CLI configuration is defined in `prisma.config.ts`. Prisma Client is generated into `src/generated/prisma` during installation and is not committed.

## Prerequisites

- A supported Node.js installation
- npm
- PostgreSQL for local development
- A Supabase project with a public storage bucket

## Installation

```bash
npm install
```

The `postinstall` script automatically generates Prisma Client.

## Environment Variables

Copy `.env.example` to `.env` and replace every placeholder with a local or deployment-specific value. Never commit `.env`.

| Variable | Purpose | Secret |
| --- | --- | --- |
| `NODE_ENV` | Runtime environment, such as `development` or `production` | No |
| `PORT` | HTTP server port; the application falls back to `4000` | No |
| `FRONTEND_URL` | Allowed frontend origin for CORS | No |
| `DATABASE_URL` | PostgreSQL connection URL used by Prisma | Yes |
| `SEED_ADMIN_EMAIL` | Email address for the seeded administrator | Treat as private configuration |
| `SEED_ADMIN_PASSWORD` | Initial administrator password used only by the seed | Yes |
| `SEED_ADMIN_FULL_NAME` | Display name for the seeded administrator | Treat as private configuration |
| `JWT_ACCESS_SECRET` | Signing secret for access tokens | Yes |
| `JWT_REFRESH_SECRET` | Signing secret for refresh tokens | Yes |
| `JWT_ACCESS_EXPIRES_IN` | Access-token lifetime | No |
| `JWT_REFRESH_EXPIRES_IN` | Refresh-token lifetime | No |
| `SUPABASE_URL` | Supabase project URL | No |
| `SUPABASE_SECRET_KEY` | Server-side Supabase key used for storage operations | Yes |
| `SUPABASE_STORAGE_BUCKET` | Supabase bucket name | No |

Keep `DATABASE_URL`, both JWT secrets, `SEED_ADMIN_PASSWORD`, and `SUPABASE_SECRET_KEY` in secure environment-variable storage in production.

## Database Setup

1. Create an empty local PostgreSQL database.
2. Set `DATABASE_URL` in `.env` to the local database connection URL.
3. Generate Prisma Client:

   ```bash
   npm run prisma:generate
   ```

4. Apply the existing migrations:

   ```bash
   npm run prisma:migrate:deploy
   ```

5. Set the `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, and `SEED_ADMIN_FULL_NAME` values, then seed the administrator:

   ```bash
   npm run prisma:seed
   ```

## Prisma Migrations

The existing migration history is stored in `prisma/migrations`, including the initial schema migration.

When intentionally changing the schema during development, create and apply a reviewed migration with:

```bash
npx prisma migrate dev --name <migration-name>
```

Apply committed migrations in production with:

```bash
npm run prisma:migrate:deploy
```

Do not use `prisma db push` for production deployment. Production databases should be updated from reviewed, committed migrations.

## Database Seeding

The seed creates or updates the administrator account and inserts the initial
homepage settings and section content required by the public website.

It reads `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, and
`SEED_ADMIN_FULL_NAME` from the environment. The administrator password is
hashed with Argon2 before persistence, and Prisma `upsert` operations make the
seed safe to run repeatedly.

Run the seed only after configuring the administrator environment variables:

```bash
npm run prisma:seed
```

Reviewer credentials are provided separately and must never be committed publicly.

## Running Locally

Start the API with automatic reload:

```bash
npm run start:dev
```

Local URLs:

- API base: <http://localhost:4000/api/v1>
- Swagger documentation: <http://localhost:4000/api/docs>

Build and run the compiled application with:

```bash
npm run build
npm run start:prod
```

## Swagger Documentation

Production Swagger documentation is available at:

<https://wood-cms-backend-production.up.railway.app/api/docs>

Authenticate through Swagger by calling the login endpoint, copying the returned access token, selecting **Authorize**, and entering the bearer token. Do not include reviewer or production credentials in API documentation or source control.

## Authentication

Authentication endpoints are grouped under `/api/v1/auth`:

- `POST /login` validates administrator credentials and returns an access token.
- `POST /refresh` uses the refresh-token cookie to rotate/renew authentication.
- `GET /me` returns the currently authenticated administrator.
- `POST /logout` invalidates the refresh session and clears authentication state.

The access token authorizes protected administrator endpoints. Refresh tokens are handled through a cookie, while refresh-session state is persisted in PostgreSQL. Administrator routes use the JWT guard and are not public.

## API Structure

All API routes use the `/api/v1` prefix.

| Group | Route prefix | Responsibility |
| --- | --- | --- |
| Health | `/` and `/health/database` | API and PostgreSQL health checks |
| Authentication | `/auth` | Login, refresh, logout, and current administrator |
| Public content | `/public` | Homepage, services, products, and price lists |
| Public homepage | `/homepage` | Public settings, sections, and contact-form content |
| Contact submission | `/contact-messages` | Public contact-message creation |
| Homepage administration | `/admin/homepage` | Settings and editable homepage sections |
| Banners | `/admin/banners` | Banner CRUD and ordering |
| Services | `/admin/services` | Service CRUD and ordering |
| Products | `/admin/products` | Product CRUD, ordering, features, and images |
| Price lists | `/admin/price-lists` | Price-list CRUD and ordering |
| Contact administration | `/admin/contact-messages` | Message listing, detail, and status updates |
| Media | `/admin/media` | Image and video uploads |

The Swagger UI is the authoritative interactive reference for request DTOs, response shapes, and individual operations.

## Image Storage

The backend uploads production image and video files to the configured Supabase Storage bucket. PostgreSQL stores the resulting public URLs and the CMS metadata used for banners, products, homepage content, and other records. Supabase credentials remain server-side and must not be exposed to the frontend.

## Testing

```bash
# Unit tests
npm test

# End-to-end tests
npm run test:e2e

# ESLint
npm run lint

# Production build and TypeScript compilation
npm run build
```

## Deployment

- Backend hosting: Railway
- Database hosting: Railway PostgreSQL
- Image storage: Supabase Storage
- Production migration command: `npm run prisma:migrate:deploy`
- Production start command: `npm run start:prod`

Railway must provide all required environment variables before installation and startup. The server reads `PORT`, falls back to `4000` locally, and listens on `0.0.0.0`.

Deployed backend base URL:

<https://wood-cms-backend-production.up.railway.app>

## AI Tools Used

ChatGPT and Codex were used to assist with requirements analysis, architecture planning, database design, implementation guidance, debugging, code review, testing, documentation, and deployment preparation. All generated suggestions were reviewed, tested, modified where necessary, and understood before being included.

## Time Spent

## Time Spent

**Approximate total: 26 hours**

| Area | Hours |
| --- | ---: |
| Planning and database design | 4 hours |
| Backend and API | 6 hours |
| Authentication | 4 hours |
| CMS features | 6 hours |
| Testing and debugging | 3 hours |
| Deployment and documentation | 3 hours |
| **Total** | **26 hours** |
## Technical Decisions

- **Separate frontend and backend repositories:** keeps deployment configuration, dependencies, and release lifecycles independent.
- **Prisma migrations:** provides a reviewable, repeatable history for local and production database changes.
- **Railway PostgreSQL:** keeps the deployed relational database close to the Railway-hosted API.
- **Supabase Storage for media:** keeps binary files out of PostgreSQL while the database retains public URLs and metadata.
- **Short-lived access tokens and refresh sessions:** limits access-token lifetime while supporting persistent authenticated sessions and logout invalidation.
- **Environment-based configuration:** keeps database credentials, JWT secrets, administrator seed data, CORS origin, and storage credentials outside source control.
- **Generated Prisma Client excluded from Git:** `postinstall` reproduces the client from the committed Prisma schema during installation.

## Known Limitations

- Automated unit and end-to-end coverage is currently limited to basic application smoke tests; the individual CMS modules do not yet have comprehensive automated coverage.
- The API depends on external PostgreSQL and Supabase services being configured and available for database and media operations.
- The CMS supports a single administrator-oriented authentication model rather than multiple roles and granular permissions.

## Production Links

- Backend API: <https://wood-cms-backend-production.up.railway.app/api/v1>
- Swagger documentation: <https://wood-cms-backend-production.up.railway.app/api/docs>
- Frontend website: <https://wood-cms-frontend.vercel.app>

Reviewer credentials are provided separately and are not committed publicly.
