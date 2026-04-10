import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { getProductivityStats, getTaskDistribution, getTimeTracking } from '../controllers/analyticsController';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /api/analytics/productivity:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get productivity statistics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: week
 *     responses:
 *       200:
 *         description: Productivity statistics retrieved successfully
 */
router.get('/productivity', asyncHandler(getProductivityStats));

/**
 * @openapi
 * /api/analytics/tasks:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get task distribution
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task distribution retrieved successfully
 */
router.get('/tasks', asyncHandler(getTaskDistribution));

/**
 * @openapi
 * /api/analytics/time:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get time tracking data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: week
 *     responses:
 *       200:
 *         description: Time tracking data retrieved successfully
 */
router.get('/time', asyncHandler(getTimeTracking));

export default router;