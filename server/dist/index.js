import express from 'express';
import cors from 'cors';
import { env } from './env.js';
import { errorMiddleware } from './httpErrors.js';
import { healthRouter } from './routes/health.js';
import { tasksRouter } from './routes/tasks.js';
import { categoriesRouter } from './routes/categories.js';
import { workspacesRouter } from './routes/workspaces.js';
import { activitiesRouter } from './routes/activities.js';
const app = express();
app.use(cors({
    origin: env.corsOrigin,
    credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.get('/', (_req, res) => {
    res.json({ name: 'taskflow-pro-server', ok: true });
});
app.use('/api', healthRouter);
app.use('/api', workspacesRouter);
app.use('/api', categoriesRouter);
app.use('/api', tasksRouter);
app.use('/api', activitiesRouter);
app.use(errorMiddleware);
app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
});
