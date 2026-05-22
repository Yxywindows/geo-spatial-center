import express from 'express';
import {
  listResources,
  getResourceById,
  getStats,
  getSubjects,
  getTopKeywords,
  getResourceTypes,
} from '../repositories/resourcesRepository.js';

export const resourcesRouter = express.Router();

resourcesRouter.get('/', async (req, res, next) => {
  try {
    res.json(await listResources(req.query));
  } catch (err) { next(err); }
});

resourcesRouter.get('/stats', async (_req, res, next) => {
  try {
    res.json(await getStats());
  } catch (err) { next(err); }
});

resourcesRouter.get('/subjects', async (_req, res, next) => {
  try {
    res.json(await getSubjects());
  } catch (err) { next(err); }
});

resourcesRouter.get('/keywords', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit || 50), 100);
    res.json(await getTopKeywords(limit));
  } catch (err) { next(err); }
});

resourcesRouter.get('/types', async (_req, res, next) => {
  try {
    res.json(await getResourceTypes());
  } catch (err) { next(err); }
});

resourcesRouter.get('/:sourceId', async (req, res, next) => {
  try {
    const resource = await getResourceById(req.params.sourceId);
    if (!resource) { res.status(404).json({ error: 'not found' }); return; }
    res.json({ data: resource });
  } catch (err) { next(err); }
});
