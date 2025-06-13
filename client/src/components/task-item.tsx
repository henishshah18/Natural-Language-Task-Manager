import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, User, Calendar } from "lucide-react";
import { authManager } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { ClientTask } from "@shared/schema";

interface TaskItemProps {
  task: ClientTask;
  onEdit: () => void;
  onUpdate: () => void;
}

export default function TaskItem({ task, onEdit, onUpdate }: TaskItemProps) {
  const { toast } = useToast();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'bg-red-500 text-white'; // Urgent - Red
      case 'P2': return 'bg-orange-500 text-white'; // High - Orange  
      case 'P3': return 'bg-yellow-500 text-white'; // Medium - Yellow
      case 'P4': return 'bg-green-500 text-white'; // Low - Green
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null;
    
    try {
      const date = new Date(dueDate);
      return format(date, 'dd-MM-yyyy, HH:mm');
    } catch {
      return null;
    }
  };

  const toggleComplete = async () => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authManager.getAuthHeaders(),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      onUpdate();
      toast({
        title: "Success",
        description: `Task ${newStatus === 'completed' ? 'completed' : 'reopened'}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update task",
      });
    }
  };

  const deleteTask = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
        headers: authManager.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      onUpdate();
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete task",
      });
    }
  };

  const dueDateFormatted = formatDueDate(task.dueDate);
  const isCompleted = task.status === 'completed';

  return (
    <div className={`p-4 hover:bg-gray-50 transition-colors group border-b border-gray-100 last:border-b-0 ${isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between">
        {/* Left Side: Checkbox + Title + Assignee */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* Checkbox */}
          <div>
            <Checkbox
              checked={isCompleted}
              onCheckedChange={toggleComplete}
              className="h-5 w-5"
            />
          </div>
          
          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <h4 className={`text-base font-medium text-gray-900 mb-1 ${isCompleted ? 'line-through' : ''}`}>
              {task.title}
            </h4>
            
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <User size={14} />
              <span>Assignee: {task.assignee || 'Self'}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Due Date, Time & Priority */}
        <div className="flex items-center space-x-4 ml-4">
          {dueDateFormatted && (
            <div className="text-right">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Calendar size={14} />
                <span>{dueDateFormatted}</span>
              </div>
            </div>
          )}
          
          <Badge className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </Badge>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Edit size={14} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteTask}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
