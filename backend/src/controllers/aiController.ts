import { Request, Response } from 'express';
import { OpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const generateTaskSummary = async (req: AuthRequest, res: Response) => {
  const { taskId } = req.body;
  const userId = req.userId!;

  // Get task details
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId
    },
    include: {
      timeEntries: true,
      aiInsights: {
        where: {
          type: 'SUMMARY'
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      }
    }
  });

  if (!task) {
    throw createError('Task not found', 404);
  }

  // Check if we have a recent summary
  if (task.aiInsights.length > 0) {
    const lastSummary = task.aiInsights[0];
    const lastUpdate = new Date(lastSummary.createdAt);
    const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);

    if (hoursSinceUpdate < 24) {
      return res.json({
        success: true,
        data: {
          summary: lastSummary.content,
          cached: true
        }
      });
    }
  }

  // Generate summary using OpenAI
  const prompt = `
    Genera un resumen conciso de esta tarea:

    Título: ${task.title}
    Descripción: ${task.description || 'Sin descripción'}
    Prioridad: ${task.priority}
    Estado: ${task.status}

    Tiempo registrado: ${task.timeEntries.reduce((total, entry) => total + (entry.duration || 0), 0)} minutos

    Proporciona un resumen claro y conciso en español.
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "Eres un asistente de productividad que ayuda a los usuarios a resumir sus tareas."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 150
  });

  const summary = completion.choices[0].message.content;

  // Save the AI insight
  await prisma.aIInsight.create({
    data: {
      type: 'SUMMARY',
      content: summary!,
      taskId,
      userId,
      confidence: 0.9
    }
  });

  res.json({
    success: true,
    data: {
      summary,
      cached: false
    }
  });
};

export const generateTaskSuggestions = async (req: AuthRequest, res: Response) => {
  const { taskId } = req.body;
  const userId = req.userId!;

  // Get task details
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId
    },
    include: {
      user: {
        select: {
          name: true
        }
      }
    }
  });

  if (!task) {
    throw createError('Task not found', 404);
  }

  // Generate suggestions using OpenAI
  const prompt = `
    Basado en esta tarea, sugiere mejoras y próximos pasos:

    Título: ${task.title}
    Descripción: ${task.description || 'Sin descripción'}
    Prioridad: ${task.priority}
    Estado actual: ${task.status}

    El usuario es ${task.user.name}.

    Proporciona 3-5 sugerencias específicas y accionables en español para mejorar esta tarea.
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "Eres un experto en productividad que ayuda a los usuarios a mejorar sus tareas."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 200
  });

  const suggestions = completion.choices[0].message.content;

  // Save the AI insight
  await prisma.aIInsight.create({
    data: {
      type: 'SUGGESTION',
      content: suggestions!,
      taskId,
      userId,
      confidence: 0.8
    }
  });

  res.json({
    success: true,
    data: {
      suggestions
    }
  });
};

export const prioritizeTasks = async (req: AuthRequest, res: Response) => {
  const { projectId } = req.body;
  const userId = req.userId!;

  // Get tasks
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      ...(projectId ? { projectId } : {})
    },
    include: {
      project: true,
      timeEntries: true
    }
  });

  if (tasks.length === 0) {
    throw createError('No tasks found', 404);
  }

  // Prepare data for AI
  const tasksData = tasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate,
    timeSpent: task.timeEntries.reduce((total, entry) => total + (entry.duration || 0), 0),
    project: task.project?.name
  }));

  // Generate prioritization using OpenAI
  const prompt = `
    Prioriza estas tareas basándote en urgencia, importancia y tiempo dedicado:

    ${JSON.stringify(tasksData, null, 2)}

    Proporciona una lista reordenada con justificación para cada cambio de prioridad.
    Responde solo en español.
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "Eres un experto en gestión de proyectos que ayuda a priorizar tareas."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 300
  });

  const prioritization = completion.choices[0].message.content;

  res.json({
    success: true,
    data: {
      prioritization,
      tasks: tasksData
    }
  });
};

export const estimateTaskTime = async (req: AuthRequest, res: Response) => {
  const { taskId } = req.body;
  const userId = req.userId!;

  // Get task details
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId
    },
    include: {
      project: true,
      timeEntries: true
    }
  });

  if (!task) {
    throw createError('Task not found', 404);
  }

  // Generate time estimation using OpenAI
  const prompt = `
    Estima el tiempo requerido para completar esta tarea:

    Título: ${task.title}
    Descripción: ${task.description || 'Sin descripción'}
    Prioridad: ${task.priority}
    Estado: ${task.status}
    Tiempo ya registrado: ${task.timeEntries.reduce((total, entry) => total + (entry.duration || 0), 0)} minutos

    Proporciona una estimación en horas y minutos, con un rango de confianza (mínimo - máximo).
    Responde solo en español.
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "Eres un experto en estimación de tiempo para tareas de software y proyectos."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 150
  });

  const estimation = completion.choices[0].message.content;

  // Save the AI insight
  await prisma.aIInsight.create({
    data: {
      type: 'PREDICTION',
      content: estimation!,
      taskId,
      userId,
      confidence: 0.7
    }
  });

  res.json({
    success: true,
    data: {
      estimation
    }
  });
};