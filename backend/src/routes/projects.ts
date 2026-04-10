import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { createProject, getProjects, getProject, updateProject, deleteProject } from '../controllers/projectController';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /api/projects:
 *   post:
 *     tags:
 *       - Projects
 *     summary: Create a new project
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *                 pattern: "^#[0-9A-F]{6}$"
 *     responses:
 *       201:
 *         description: Project created successfully
 */
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('color').optional().matches(/^#[0-9A-F]{6}$/).withMessage('Color must be a valid hex color'),
  ],
  asyncHandler(createProject)
);

/**
 * @openapi
 * /api/projects:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get user's projects
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 */
router.get('/', asyncHandler(getProjects));

/**
 * @openapi
 * /api/projects/{id}:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get a specific project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *       404:
 *         description: Project not found
 */
router.get('/:id', asyncHandler(getProject));

/**
 * @openapi
 * /api/projects/{id}:
 *   put:
 *     tags:
 *       - Projects
 *     summary: Update a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *                 pattern: "^#[0-9A-F]{6}$"
 *     responses:
 *       200:
 *         description: Project updated successfully
 */
router.put('/:id', asyncHandler(updateProject));

/**
 * @openapi
 * /api/projects/{id}:
 *   delete:
 *     tags:
 *       - Projects
 *     summary: Delete a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted successfully
 */
router.delete('/:id', asyncHandler(deleteProject));

export default router;