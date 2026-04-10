import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { updateProfile, getPreferences, updatePreferences } from '../controllers/userController';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /api/users/profile:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', asyncHandler(updateProfile));

/**
 * @openapi
 * /api/users/preferences:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user preferences
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences retrieved successfully
 */
router.get('/preferences', asyncHandler(getPreferences));

/**
 * @openapi
 * /api/users/preferences:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user preferences
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *                 enum: [LIGHT, DARK, SYSTEM]
 *               notifications:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: boolean
 *                   push:
 *                     type: boolean
 *                   taskReminders:
 *                     type: boolean
 *                   dailyDigest:
 *                     type: boolean
 *               productivity:
 *                 type: object
 *                 properties:
 *                   workHours:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                       end:
 *                         type: string
 *                       timezone:
 *                         type: string
 *                   defaultPriority:
 *                     type: string
 *                     enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *                   autoArchive:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 */
router.put('/preferences', asyncHandler(updatePreferences));

export default router;