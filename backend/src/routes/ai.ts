import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { generateTaskSummary, generateTaskSuggestions, prioritizeTasks, estimateTaskTime } from '../controllers/aiController';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /api/ai/summarize:
 *   post:
 *     tags:
 *       - AI
 *     summary: Generate task summary using AI
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *             properties:
 *               taskId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task summary generated successfully
 */
router.post('/summarize', asyncHandler(generateTaskSummary));

/**
 * @openapi
 * /api/ai/suggestions:
 *   post:
 *     tags:
 *       - AI
 *     summary: Get task suggestions using AI
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *             properties:
 *               taskId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task suggestions generated successfully
 */
router.post('/suggestions', asyncHandler(generateTaskSuggestions));

/**
 * @openapi
 * /api/ai/prioritize:
 *   post:
 *     tags:
 *       - AI
 *     summary: Prioritize tasks using AI
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tasks prioritized successfully
 */
router.post('/prioritize', asyncHandler(prioritizeTasks));

/**
 * @openapi
 * /api/ai/estimate:
 *   post:
 *     tags:
 *       - AI
 *     summary: Estimate task time using AI
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *             properties:
 *               taskId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task time estimated successfully
 */
router.post('/estimate', asyncHandler(estimateTaskTime));

export default router;