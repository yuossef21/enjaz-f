# Enjaz Management System - Setup Guide

## Prerequisites

- Node.js 20+ LTS
- npm 10+
- Supabase account (free tier works)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install dependencies for the root workspace, backend, and frontend.

### 2. Set Up Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration file:
   ```
   apps/backend/migrations/001_initial_schema.sql
   ```
3. Copy your project credentials:
   - Project URL
   - Anon/Public Key
   - Service Role Key (from Settings → API)

### 3. Configure Environment Variables

**Backend:**
```bash
cd apps/backend
cp .env.example .env
```

Edit `apps/backend/.env` and add your Supabase credentials:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here
JWT_SECRET=your_random_secret_here
JWT_REFRESH_SECRET=your_random_refresh_secret_here
```

**Frontend:**
```bash
cd apps/frontend
cp .env.example .env
```

The default values should work for local development.

### 4. Start Development Servers

From the root directory:
```bash
npm run dev
```

This starts both backend (port 5000) and frontend (port 5173) concurrently.

Or start them separately:
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### 6. Default Login Credentials

The database migration creates three test accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@enjaz.com | admin123 |
| Quality | quality@enjaz.com | quality123 |
| Promoter | promoter@enjaz.com | promoter123 |

**⚠️ Important:** Change these passwords in production!

## Project Structure

```
CRM-Project-2/
├── apps/
│   ├── backend/          # Express API
│   │   ├── src/
│   │   │   ├── config/   # Database, env config
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   └── index.ts
│   │   └── migrations/   # SQL schema files
│   └── frontend/         # React app
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── services/
│       │   ├── store/
│       │   └── types/
│       └── index.html
└── package.json
```

## Features

### Phase 1 (Current)
- ✅ JWT Authentication
- ✅ Lead Management (CRM)
- ✅ Attendance Tracking (Check-in/out)
- ✅ User Management (Admin only)
- ✅ Role-based Permissions
- ✅ Dashboard with Statistics
- ✅ Excel Export (Leads & Attendance)
- ✅ RTL Arabic UI
- ✅ Baghdad Timezone Support

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Users (Admin only)
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/reset-password` - Reset password

### Leads
- `GET /api/leads` - List leads (filtered by role)
- `POST /api/leads` - Create lead
- `GET /api/leads/:id` - Get lead details
- `PATCH /api/leads/:id` - Update lead
- `PATCH /api/leads/:id/status` - Update status (Quality only)
- `GET /api/leads/stats` - Get statistics
- `GET /api/leads/export` - Export to Excel

### Attendance
- `POST /api/attendance/check-in` - Clock in
- `POST /api/attendance/check-out` - Clock out
- `GET /api/attendance` - List attendance records
- `GET /api/attendance/my-records` - Current user's records
- `GET /api/attendance/export` - Export to Excel

## Troubleshooting

### Backend won't start
- Check that all environment variables are set in `apps/backend/.env`
- Verify Supabase credentials are correct
- Ensure port 5000 is not in use

### Frontend won't start
- Check that backend is running on port 5000
- Clear browser cache and localStorage
- Verify Node.js version is 20+

### Database connection errors
- Verify Supabase project is active
- Check that migrations have been run
- Confirm service role key (not anon key) is used in backend

### Login fails
- Ensure database migration created default users
- Check browser console for errors
- Verify JWT secrets are set in backend .env

## Production Deployment

### Backend (Render)
1. Create new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `cd apps/backend && npm install && npm run build`
4. Set start command: `cd apps/backend && npm start`
5. Add environment variables from `.env.example`

### Frontend (Vercel)
1. Import project to Vercel
2. Set root directory: `apps/frontend`
3. Framework preset: Vite
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`

### Database (Supabase)
- Already hosted, no additional setup needed
- Enable Row Level Security (RLS) for production
- Set up automated backups in Supabase dashboard

## Next Steps (Phase 2)

- Accounting module (invoices, vouchers)
- HR & Payroll
- Inventory management
- Advanced reporting
- Mobile app

## Support

For issues or questions, contact the development team or refer to the PRD document in `docs/PRD.md`.

---

**Enjaz Management System** © 2026 - Built with ❤️ for Iraqi SMEs
