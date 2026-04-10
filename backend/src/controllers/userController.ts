import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { name, avatar, bio } = req.body;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      avatar,
      bio
    },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      avatar: true,
      bio: true,
      updatedAt: true
    }
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
};

export const getPreferences = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const preferences = await prisma.userPreferences.findUnique({
    where: { userId }
  });

  res.json({
    success: true,
    data: preferences || {
      theme: 'SYSTEM',
      notifications: {
        email: true,
        push: true,
        taskReminders: true,
        dailyDigest: true
      },
      productivity: {
        workHours: {
          start: '09:00',
          end: '18:00',
          timezone: 'UTC'
        },
        defaultPriority: 'MEDIUM',
        autoArchive: true
      }
    }
  });
};

export const updatePreferences = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { theme, notifications, productivity } = req.body;

  const preferences = await prisma.userPreferences.upsert({
    where: { userId },
    update: {
      theme,
      notifications,
      productivity
    },
    create: {
      userId,
      theme,
      notifications,
      productivity
    }
  });

  res.json({
    success: true,
    message: 'Preferences updated successfully',
    data: preferences
  });
};