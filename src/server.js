import dotenv from 'dotenv';
import app from './app.js';
import { connectDb } from './config/db.js';
import { ensureDefaultAdmin } from './services/bootstrap.service.js';
import { initSearchIndexes } from './services/search.service.js';
import { ensureCmsSettings } from './controllers/cms.controller.js';

dotenv.config();

export const startServer = async () => {
  await connectDb();
  await ensureDefaultAdmin();
  await ensureCmsSettings();
  await initSearchIndexes().catch(() => {});

  const port = Number(process.env.PORT || 5000);
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};
