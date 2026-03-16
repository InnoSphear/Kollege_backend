import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import mongoose from 'mongoose';

import authRoutes from './src/routes/v1/auth.routes.js';
import catalogRoutes from './src/routes/v1/catalog.routes.js';
import applicationRoutes from './src/routes/v1/application.routes.js';
import recommendationRoutes from './src/routes/v1/recommendation.routes.js';
import referralRoutes from './src/routes/v1/referral.routes.js';
import counselingRoutes from './src/routes/v1/counseling.routes.js';
import notificationRoutes from './src/routes/v1/notification.routes.js';
import adminRoutes from './src/routes/v1/admin.routes.js';
import compareRoutes from './src/routes/v1/compare.routes.js';
import integrationRoutes from './src/routes/v1/integration.routes.js';
import collegeAdminRoutes from './src/routes/v1/collegeAdmin.routes.js';
import cmsRoutes from './src/routes/v1/cms.routes.js';
import crmRoutes from './src/routes/v1/crm.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'kollege-backend' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/catalog', catalogRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);
app.use('/api/v1/referrals', referralRoutes);
app.use('/api/v1/counseling', counselingRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/compare-colleges', compareRoutes);
app.use('/api/v1/integrations', integrationRoutes);
app.use('/api/v1/college-admin', collegeAdminRoutes);
app.use('/api/v1/cms', cmsRoutes);
app.use('/api/v1/crm', crmRoutes);

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, _req, res, _next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
});

const start = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
