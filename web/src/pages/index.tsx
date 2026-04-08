import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskStats } from '@/components/analytics/TaskStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, BarChart3, Clock, Target } from 'lucide-react';
import { Task, Project, PriorityDistribution } from '@/types';

interface DashboardProps {
  tasks: Task[];
  projects: Project[];
  priorityDistribution: PriorityDistribution;
}

export default function Dashboard({ tasks, projects, priorityDistribution }: DashboardProps) {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('all');

  const filteredTasks = selectedProject === 'all'
    ? tasks
    : tasks.filter(task => task.projectId === selectedProject);

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
  const overdueTasks = tasks.filter(task =>
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
  ).length;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Gestiona tus tareas y proyectos</p>
          </div>
          <Button onClick={() => setShowTaskForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nueva Tarea
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tareas</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{inProgressTasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
            </CardContent>
          </Card>
        </div>

        {/* Task Form Modal */}
        {showTaskForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Crear Nueva Tarea</CardTitle>
                <CardDescription>
                  Agrega una nueva tarea a tu proyecto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskForm
                  onSubmit={(task) => {
                    // Handle task creation
                    setShowTaskForm(false);
                  }}
                  onCancel={() => setShowTaskForm(false)}
                  projects={projects}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Task Board */}
        <TaskBoard
          tasks={filteredTasks}
          projects={projects}
          onTaskUpdate={(taskId, updates) => {
            // Handle task updates
          }}
        />
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  // Mock data - In a real app, fetch from your API
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Implementar autenticación',
      description: 'Configurar NextAuth.js con email y proveedores OAuth',
      priority: 'high',
      status: 'in_progress',
      estimatedHours: 8,
      projectId: '1',
      userId: session.user.id,
      tags: ['auth', 'security'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Diseño del dashboard',
      description: 'Crear mockup del dashboard principal',
      priority: 'medium',
      status: 'todo',
      estimatedHours: 4,
      projectId: '1',
      userId: session.user.id,
      tags: ['design', 'ui'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockProjects: Project[] = [
    {
      id: '1',
      name: 'TaskFlow AI',
      description: 'Proyecto principal de la aplicación',
      color: '#3b82f6',
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const priorityDistribution: PriorityDistribution = {
    low: 1,
    medium: 3,
    high: 2,
    critical: 1,
  };

  return {
    props: {
      tasks: mockTasks,
      projects: mockProjects,
      priorityDistribution,
    },
  };
};