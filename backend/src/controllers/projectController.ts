import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const createProject = async (req: AuthRequest, res: Response) => {
  const { name, description, color } = req.body;
  const userId = req.userId!;

  const project = await prisma.project.create({
    data: {
      name,
      description,
      color: color || '#8B5CF6', // Default purple color
      userId
    },
    include: {
      _count: {
        select: {
          tasks: true
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project
  });
};

export const getProjects = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      _count: {
        select: {
          tasks: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json({
    success: true,
    data: projects
  });
};

export const getProject = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId!;

  const project = await prisma.project.findFirst({
    where: {
      id,
      userId
    },
    include: {
      tasks: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  if (!project) {
    throw createError('Project not found', 404);
  }

  res.json({
    success: true,
    data: project
  });
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId!;
  const { name, description, color } = req.body;

  // Check if project exists and belongs to user
  const existingProject = await prisma.project.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existingProject) {
    throw createError('Project not found', 404);
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      name,
      description,
      color
    }
  });

  res.json({
    success: true,
    message: 'Project updated successfully',
    data: project
  });
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId!;

  // Check if project exists and belongs to user
  const existingProject = await prisma.project.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existingProject) {
    throw createError('Project not found', 404);
  }

  await prisma.project.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Project deleted successfully'
  });
};