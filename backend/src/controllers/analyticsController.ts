import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getProductivityStats = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { period = 'week' } = req.query;

  const dateRanges = {
    day: { start: new Date(new Date().setHours(0, 0, 0, 0)) },
    week: { start: new Date(new Date().setDate(new Date().getDate() - 7)) },
    month: { start: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
    year: { start: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) }
  };

  const range = dateRanges[period as keyof typeof dateRanges];

  // Get task statistics
  const [totalTasks, completedTasks, inProgressTasks, overdueTasks] = await Promise.all([
    prisma.task.count({
      where: {
        userId,
        createdAt: { gte: range.start }
      }
    }),
    prisma.task.count({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: { gte: range.start }
      }
    }),
    prisma.task.count({
      where: {
        userId,
        status: 'IN_PROGRESS',
        createdAt: { gte: range.start }
      }
    }),
    prisma.task.count({
      where: {
        userId,
        dueDate: { lt: new Date() },
        status: { not: 'COMPLETED' },
        createdAt: { gte: range.start }
      }
    })
  ]);

  // Calculate completion rate
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Get productivity trends (last 7 days)
  const productivityTrend = await prisma.task.groupBy({
    by: ['createdAt'],
    where: {
      userId,
      createdAt: { gte: range.start }
    },
    _count: {
      id: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  // Group by day
  const dailyStats = productivityTrend.reduce((acc: any[], item) => {
    const date = new Date(item.createdAt).toISOString().split('T')[0];
    const existing = acc.find(a => a.date === date);
    if (existing) {
      existing.count += item._count.id;
    } else {
      acc.push({ date, count: item._count.id });
    }
    return acc;
  }, []);

  res.json({
    success: true,
    data: {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      completionRate: Math.round(completionRate),
      productivityTrend: dailyStats,
      period
    }
  });
};

export const getTaskDistribution = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  // Get tasks by status
  const statusDistribution = await prisma.task.groupBy({
    by: ['status'],
    where: { userId },
    _count: {
      id: true
    }
  });

  // Get tasks by priority
  const priorityDistribution = await prisma.task.groupBy({
    by: ['priority'],
    where: { userId },
    _count: {
      id: true
    }
  });

  // Get tasks by project
  const projectDistribution = await prisma.task.groupBy({
    by: ['projectId'],
    where: { userId, projectId: { not: null } },
    _count: {
      id: true
    },
    include: {
      project: {
        select: {
          name: true,
          color: true
        }
      }
    }
  });

  res.json({
    success: true,
    data: {
      byStatus: statusDistribution,
      byPriority: priorityDistribution,
      byProject: projectDistribution.map(item => ({
        ...item,
        project: item.project || null
      }))
    }
  });
};

export const getTimeTracking = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { period = 'week' } = req.query;

  const dateRanges = {
    day: { start: new Date(new Date().setHours(0, 0, 0, 0)) },
    week: { start: new Date(new Date().setDate(new Date().getDate() - 7)) },
    month: { start: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
    year: { start: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) }
  };

  const range = dateRanges[period as keyof typeof dateRanges];

  // Get total time tracked
  const totalTimeEntries = await prisma.timeEntry.findMany({
    where: {
      task: {
        userId
      },
      startTime: { gte: range.start }
    }
  });

  const totalMinutes = totalTimeEntries.reduce((total, entry) => {
    if (entry.duration) {
      return total + entry.duration;
    }
    // Calculate duration if not set
    const endTime = entry.endTime || new Date();
    const duration = Math.round((endTime.getTime() - entry.startTime.getTime()) / (1000 * 60));
    return total + duration;
  }, 0);

  // Get time by project
  const timeByProject = await prisma.timeEntry.groupBy({
    by: ['taskId'],
    where: {
      task: {
        userId,
        project: {
          createdAt: { gte: range.start }
        }
      },
      startTime: { gte: range.start }
    },
    _sum: {
      duration: true
    },
    include: {
      task: {
        select: {
          project: {
            select: {
              name: true,
              color: true
            }
          }
        }
      }
    }
  });

  // Group by project
  const projectTime = timeByProject.reduce((acc: any[], item) => {
    const project = item.task?.project;
    if (project) {
      const existing = acc.find(a => a.project.name === project.name);
      if (existing) {
        existing.minutes += item._sum.duration || 0;
      } else {
        acc.push({
          project: {
            name: project.name,
            color: project.color
          },
          minutes: item._sum.duration || 0
        });
      }
    }
    return acc;
  }, []);

  // Daily time tracking
  const dailyTime = await prisma.timeEntry.groupBy({
    by: ['startTime'],
    where: {
      task: { userId },
      startTime: { gte: range.start }
    },
    _sum: {
      duration: true
    }
  });

  const dailyStats = dailyTime.reduce((acc: any[], item) => {
    const date = new Date(item.startTime).toISOString().split('T')[0];
    const existing = acc.find(a => a.date === date);
    if (existing) {
      existing.minutes += item._sum.duration || 0;
    } else {
      acc.push({ date, minutes: item._sum.duration || 0 });
    }
    return acc;
  }, []);

  res.json({
    success: true,
    data: {
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60 * 100) / 100,
      byProject: projectTime,
      daily: dailyStats,
      period
    }
  });
};