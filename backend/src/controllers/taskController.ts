import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const createTask = async (req: AuthRequest, res: Response) => {
  const { title, description, priority, projectId, dueDate } = req.body;
  const userId = req.userId!;

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority,
      projectId,
      dueDate: dueDate ? new Date(dueDate) : null,
      userId
    },
    include: {
      project: true,
      category: true
    }
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task
  });
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { projectId, status, priority, page = 1, limit = 10 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {
    userId
  };

  if (projectId) where.projectId = projectId;
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        project: true,
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.task.count({ where })
  ]);

  res.json({
    success: true,
    data: {
      tasks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
};

export const getTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId!;

  const task = await prisma.task.findFirst({
    where: {
      id,
      userId
    },
    include: {
      project: true,
      category: true,
      timeEntries: true,
      aiInsights: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  if (!task) {
    throw createError('Task not found', 404);
  }

  res.json({
    success: true,
    data: task
  });
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId!;
  const { title, description, status, priority, projectId, dueDate } = req.body;

  // Check if task exists and belongs to user
  const existingTask = await prisma.task.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existingTask) {
    throw createError('Task not found', 404);
  }

  const updateData: any = {
    title,
    description,
    status,
    priority,
    projectId,
    dueDate: dueDate ? new Date(dueDate) : existingTask.dueDate
  };

  // Set completedAt timestamp if status changed to COMPLETED
  if (status === 'COMPLETED' && existingTask.status !== 'COMPLETED') {
    updateData.completedAt = new Date();
  }

  const task = await prisma.task.update({
    where: { id },
    data: updateData,
    include: {
      project: true,
      category: true
    }
  });

  res.json({
    success: true,
    message: 'Task updated successfully',
    data: task
  });
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId!;

  // Check if task exists and belongs to user
  const existingTask = await prisma.task.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existingTask) {
    throw createError('Task not found', 404);
  }

  await prisma.task.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Task deleted successfully'
  });
};