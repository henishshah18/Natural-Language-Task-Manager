import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, ArrowUpDown, Calendar, AlertTriangle } from "lucide-react";
import TaskItem from "./task-item";
import { useState } from "react";
import TaskEditModal from "./task-edit-modal";

interface Task {
  id: number;
  title: string;
  assignee: string | null;
  dueDate: string | null;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'pending' | 'completed' | 'overdue';
  createdAt: string;
  updatedAt: string;
}

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: () => void;
  isLoading: boolean;
}

type SortOption = 'dueDate' | 'priority' | 'created';

export default function TaskList({ tasks, onTaskUpdate, isLoading }: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');

  const sortTasks = (tasks: Task[], sortBy: SortOption) => {
    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { P1: 1, P2: 2, P3: 3, P4: 4 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  };

  const pendingTasks = sortTasks(tasks.filter(task => task.status === 'pending'), sortBy);
  const completedTasks = sortTasks(tasks.filter(task => task.status === 'completed'), sortBy);

  if (isLoading) {
    return (
      <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading tasks...</p>
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="text-gray-400 text-xl" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
          <p className="text-gray-500">Add your first task using natural language above.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Sort Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Sort by:</span>
        <Button
          variant={sortBy === 'dueDate' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('dueDate')}
          className="text-xs"
        >
          <Calendar size={14} className="mr-1" />
          Due Date
        </Button>
        <Button
          variant={sortBy === 'priority' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('priority')}
          className="text-xs"
        >
          <AlertTriangle size={14} className="mr-1" />
          Priority
        </Button>
        <Button
          variant={sortBy === 'created' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('created')}
          className="text-xs"
        >
          <ArrowUpDown size={14} className="mr-1" />
          Created
        </Button>
      </div>

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <CardHeader className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Pending Tasks ({pendingTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div>
              {pendingTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onEdit={() => setEditingTask(task)}
                  onUpdate={onTaskUpdate}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-gray-200 bg-green-50">
            <CardTitle className="text-lg font-semibold text-green-800">
              Completed Tasks ({completedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div>
              {completedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onEdit={() => setEditingTask(task)}
                  onUpdate={onTaskUpdate}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onUpdate={() => {
            setEditingTask(null);
            onTaskUpdate();
          }}
        />
      )}
    </>
  );
}
