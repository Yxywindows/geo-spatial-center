import express from 'express';
import { config } from './config.js';
import { pool } from './db/pool.js';
import { resourcesRouter } from './routes/resources.js';
import { adminRouter } from './routes/admin.js';
import { internalRouter } from './routes/internal.js';
import { adminPublicationsRouter } from './routes/adminPublications.js';

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Key, X-API-Key');
  if (req.method === 'OPTIONS') { res.sendStatus(204); return; }
  next();
});

app.use(express.json());

app.get('/health', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (err) { next(err); }
});

app.use('/api/resources', resourcesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin/publications', adminPublicationsRouter);
app.use('/api/internal', internalRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

app.listen(config.port, () => {
  console.log(`geo-spatial backend listening on ${config.port}`);
});
