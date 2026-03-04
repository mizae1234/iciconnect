# ICI Connect — Company Intranet Portal

Internal company intranet system for **icare insurance**, built with Next.js, TypeScript, TailwindCSS, PostgreSQL, and Prisma ORM.

## Features

- 🔐 **Authentication** — Email/password login with JWT-based sessions
- 👤 **Role-Based Access** — 6 roles: SUPER_ADMIN, ADMIN, HR, IT, MANAGER, EMPLOYEE
- 📱 **Application Directory** — Manage & display internal tools filtered by role
- 📢 **Announcement System** — Create, pin, schedule, and target announcements by role
- 🛠️ **Admin Panel** — Full CRUD for users, applications, and announcements
- 🎨 **Corporate Green Theme** — shadcn/ui components, responsive, dark mode ready

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS + shadcn/ui |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Auth | JWT (jose) + HttpOnly Cookies |
| Validation | Zod + React Hook Form |

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Update `.env` with your database connection:

```env
DATABASE_URL="postgresql://user:password@host:5432/companyhub?schema=public"
AUTH_SECRET="your-random-secret-min-32-chars"
```

### 3. Set Up Database

```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:seed        # Seed demo data
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Credentials

All users use password: `Password123`

| Email | Role |
|-------|------|
| superadmin@icare.com | SUPER_ADMIN |
| admin@icare.com | ADMIN |
| hr@icare.com | HR |
| it@icare.com | IT |
| manager@icare.com | MANAGER |
| john@icare.com | EMPLOYEE |
| jane@icare.com | EMPLOYEE |

## Project Structure

```
src/
├── app/
│   ├── (main)/           # Authenticated pages (home)
│   ├── admin/            # Admin panel pages
│   └── login/            # Login page
├── components/
│   ├── admin/            # Admin CRUD client components
│   ├── auth/             # Login form
│   ├── layout/           # Navbar, Sidebar
│   ├── shared/           # AnnouncementCard, AppCard
│   └── ui/               # shadcn/ui base components
├── generated/prisma/     # Prisma client (auto-generated)
└── lib/
    ├── actions/          # Server actions (CRUD)
    ├── auth.ts           # JWT auth helpers
    ├── constants.ts      # Types, Zod schemas, constants
    ├── prisma.ts         # Prisma client singleton
    └── utils.ts          # Utility functions
prisma/
├── schema.prisma         # Database schema
└── seed.ts               # Demo data seed script
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |

## Production Build

```bash
npm run build
npm start
```
