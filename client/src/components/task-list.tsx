import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare } from "lucide-react";
import TaskItem from "./task-item";
import { useState } from "react";
import TaskEditModal from "./task-edit-modal";

interface Task {
  id: number;
  title: string;
  assignee: string | null;
  dueDate: string | null;
  priority: 'P1' | 'P2' | 'P3';
  status: 'pending' | 'completed' | 'overdue';
  createdAt: string;
  updatedAt: string;
}

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: () => void;
  isLoading: boolean;
}

export default function TaskList({ tasks, onTaskUpdate, isLoading }: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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
      <Card className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Your Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => (
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
