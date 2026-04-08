import { useState } from 'react';
import { Task, Task as TaskType } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from 'react-beautiful-dnd';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Flag,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { TaskForm } from './TaskForm';

interface TaskBoardProps {
  tasks: TaskType[];
  projects: any[];
  onTaskUpdate: (taskId: string, updates: Partial<TaskType>) => void;
}

const statusMap = {
  todo: { label: 'Por Hacer', color: 'bg-gray-100 text-gray-800' },
  in_progress: { label: 'En Progreso', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Completada', color: 'bg-green-100 text-green-800' },
  blocked: { label: 'Bloqueada', color: 'bg-red-100 text-red-800' },
};

const priorityMap = {
  low: { label: 'Baja', icon: Clock },
  medium: { label: 'Media', icon: Flag },
  high: { label: 'Alta', icon: AlertCircle },
  critical: { label: 'Crítica', icon: AlertCircle },
};

export function TaskBoard({ tasks, projects, onTaskUpdate }: TaskBoardProps) {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    if (source.droppableId === destination.droppableId) return;

    const taskId = result.draggableId;
    const newStatus = destination.droppableId as TaskType['status'];

    onTaskUpdate(taskId, { status: newStatus });
  };

  const groupedTasks = {
    todo: tasks.filter(task => task.status === 'todo'),
    in_progress: tasks.filter(task => task.status === 'in_progress'),
    completed: tasks.filter(task => task.status === 'completed'),
    blocked: tasks.filter(task => task.status === 'blocked'),
  };

  const getPriorityIcon = (priority: TaskType['priority']) => {
    const Icon = priorityMap[priority].icon;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Task Form Modal */}
      {(showTaskForm || editingTask) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskForm
                onSubmit={(taskData) => {
                  if (editingTask) {
                    onTaskUpdate(editingTask.id, taskData);
                  } else {
                    // Create new task
                  }
                  setEditingTask(null);
                  setShowTaskForm(false);
                }}
                onCancel={() => {
                  setEditingTask(null);
                  setShowTaskForm(false);
                }}
                projects={projects}
                initialData={editingTask}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Task Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(statusMap).map(([status, config]) => (
            <div key={status}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {config.label}
                </h3>
                <Badge className={config.color}>
                  {groupedTasks[status as keyof typeof groupedTasks].length}
                </Badge>
              </div>

              <Droppable droppableId={status}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-3 min-h-[400px]"
                  >
                    {groupedTasks[status as keyof typeof groupedTasks].map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="cursor-move hover:shadow-md transition-shadow"
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                {/* Task Header */}
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">
                                      {task.title}
                                    </h4>
                                    {task.description && (
                                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                        {task.description}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingTask(task)}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </div>

                                {/* Priority */}
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    {getPriorityIcon(task.priority)}
                                    <span>{priorityMap[task.priority].label}</span>
                                  </div>
                                  {task.dueDate && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <Clock className="h-3 w-3" />
                                      <span>
                                        {new Date(task.dueDate).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Tags */}
                                {task.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {task.tags.map((tag, index) => (
                                      <Badge
                                        key={index}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {/* Project */}
                                {task.project && (
                                  <div className="flex items-center gap-1">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: task.project.color }}
                                    />
                                    <span className="text-xs text-gray-500">
                                      {task.project.name}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}