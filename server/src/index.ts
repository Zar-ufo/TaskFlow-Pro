import express from 'express';
import cors from 'cors';
import { env } from './env.js';
import { errorMiddleware } from './httpErrors.js';
import { healthRouter } from './routes/health.js';
import { tasksRouter } from './routes/tasks.js';
import { categoriesRouter } from './routes/categories.js';
import { workspacesRouter } from './routes/workspaces.js';
import { activitiesRouter } from './routes/activities.js';
import { authRouter } from './routes/auth.js';
import { adminRouter } from './routes/admin.js';
import { requireAuth } from './auth.js';
import { bootstrapAdmin } from './bootstrap.js';

const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.json({ name: 'taskflow-pro-server', ok: true });
});

app.use('/api', healthRouter);
app.use('/api', authRouter);
app.use('/api', adminRouter);
app.use('/api', requireAuth, workspacesRouter);
app.use('/api', requireAuth, categoriesRouter);
app.use('/api', requireAuth, tasksRouter);
app.use('/api', requireAuth, activitiesRouter);

app.use(errorMiddleware);

bootstrapAdmin()
  .catch((e) => {
    console.error('Failed to bootstrap admin:', e);
  })
  .finally(() => {
    app.listen(env.port, () => {
      console.log(`API listening on http://localhost:${env.port}`);
    });
  });
