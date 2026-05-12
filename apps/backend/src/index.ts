import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import leadsRoutes from './routes/leads.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import customersRoutes from './routes/customers.routes.js';
import customerIssuesRoutes from './routes/customer-issues.routes.js';
import invoicesRoutes from './routes/invoices.routes.js';
import expenseClaimsRoutes from './routes/expense-claims.routes.js';
import paymentVouchersRoutes from './routes/payment-vouchers.routes.js';
import receiptVouchersRoutes from './routes/receipt-vouchers.routes.js';
import employeesRoutes from './routes/employees.routes.js';
import leaveRequestsRoutes from './routes/leave-requests.routes.js';
import payrollRoutes from './routes/payroll.routes.js';
import productsRoutes from './routes/products.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const app = express();

// Middleware
app.use(helmet());

// CORS configuration - whitelist specific origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://enjaz-f.vercel.app'
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Additional CORS headers for preflight requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Set UTF-8 encoding for all responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/customer-issues', customerIssuesRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/expense-claims', expenseClaimsRoutes);
app.use('/api/payment-vouchers', paymentVouchersRoutes);
app.use('/api/receipt-vouchers', receiptVouchersRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/leave-requests', leaveRequestsRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${config.nodeEnv}`);
  logger.info(`🌐 CORS enabled for: ${config.cors.origin}`);
});

export default app;
