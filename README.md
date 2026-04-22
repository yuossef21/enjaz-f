# Enjaz Management System

Enterprise-grade business management platform for field promotion teams, quality assurance, accounting, and executive management.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, TailwindCSS 4
- **Backend:** Node.js, Express 5, TypeScript
- **Database:** PostgreSQL (Supabase)
- **Auth:** JWT

## Project Structure

```
CRM-Project-2/
├── apps/
│   ├── frontend/          # React application
│   └── backend/           # Express API server
├── packages/
│   └── shared-types/      # Shared TypeScript types
└── docs/                  # Documentation
```

## Getting Started

### Prerequisites

- Node.js 20+ LTS
- npm 10+
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `apps/backend/.env.example` to `apps/backend/.env`
   - Copy `apps/frontend/.env.example` to `apps/frontend/.env`
   - Fill in your Supabase credentials

4. Run database migrations (see `apps/backend/migrations/`)

5. Start development servers:
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## Features (Phase 1)

- ✅ JWT Authentication
- ✅ Lead Management (CRM)
- ✅ Attendance Tracking (Biometric)
- ✅ User Management
- ✅ Role-based Permissions
- ✅ Dashboard with Analytics
- ✅ Excel Export

## Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Supabase

## License

Proprietary - Enjaz Company © 2026
