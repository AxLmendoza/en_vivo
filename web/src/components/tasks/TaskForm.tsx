import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Task, Project } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

const taskSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  estimatedHours: z.number().min(0).optional(),
  dueDate: z.string().optional(),
  projectId: z.string().min(1, 'Selecciona un proyecto'),
  tags: z.array(z.string()),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onSubmit: (data: Partial<Task>) => void;
  onCancel: () => void;
  projects: Project[];
  initialData?: Task | null;
}

export function TaskForm({ onSubmit, onCancel, projects, initialData }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'medium',
      estimatedHours: initialData?.estimatedHours,
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
      projectId: initialData?.projectId || '',
      tags: initialData?.tags || [],
    },
  });

  const selectedProject = watch('projectId');

  const handleFormSubmit = (data: TaskFormData) => {
    const formattedData = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      tags: data.tags.filter(tag => tag.trim() !== ''),
    };

    onSubmit({
      ...formattedData,
      id: initialData?.id,
      status: initialData?.status || 'todo',
      userId: initialData?.userId,
      createdAt: initialData?.createdAt,
      updatedAt: new Date(),
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Ej: Implementar autenticación"
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <textarea
          id="description"
          {...register('description')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          rows={3}
          placeholder="Descripción detallada de la tarea..."
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Prioridad</Label>
          <Select onValueChange={(value) => setValue('priority', value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baja</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
            </SelectContent>
          </Select>
          {errors.priority && (
            <p className="text-sm text-red-600">{errors.priority.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="projectId">Proyecto</Label>
          <Select onValueChange={(value) => setValue('projectId', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona proyecto" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span>{project.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.projectId && (
            <p className="text-sm text-red-600">{errors.projectId.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="estimatedHours">Tiempo estimado (horas)</Label>
          <Input
            id="estimatedHours"
            type="number"
            min="0"
            step="0.5"
            {...register('estimatedHours', { valueAsNumber: true })}
            placeholder="Ej: 2.5"
          />
          {errors.estimatedHours && (
            <p className="text-sm text-red-600">{errors.estimatedHours.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Fecha de vencimiento</Label>
          <Input
            id="dueDate"
            type="date"
            {...register('dueDate')}
          />
          {errors.dueDate && (
            <p className="text-sm text-red-600">{errors.dueDate.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Etiquetas</Label>
        <Input
          id="tags"
          {...register('tags')}
          placeholder="Etiqueta1, Etiqueta2, Etiqueta3"
        />
        <p className="text-sm text-gray-500">
          Separar etiquativas con comas
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}