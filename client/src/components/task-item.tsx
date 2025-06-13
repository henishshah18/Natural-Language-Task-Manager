import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Check, Trash2, User, Calendar, Clock, CheckCircle, Undo } from "lucide-react";
import { authManager } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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

interface TaskItemProps {
  task: Task;
  onEdit: () => void;
  onUpdate: () => void;
}

export default function TaskItem({ task, onEdit, onUpdate }: TaskItemProps) {
  const { toast } = useToast();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'bg-red-100 text-red-800';
      case 'P2': return 'bg-amber-100 text-amber-800';
      case 'P3': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null;
    
    try {
      const date = new Date(dueDate);
      const now = new Date();
      const diffInHours = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      let timeText = '';
      if (diffInHours < 0) {
        timeText = `${Math.abs(diffInHours)} hours ago`;
      } else if (diffInHours < 24) {
        timeText = `in ${diffInHours} hours`;
      } else {
        const diffInDays = Math.ceil(diffInHours / 24);
        timeText = `in ${diffInDays} days`;
      }
      
      return {
        formatted: format(date, 'EEEE, h:mm a'),
        relative: timeText,
      };
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

  const dueDateInfo = formatDueDate(task.dueDate);
  const isCompleted = task.status === 'completed';

  return (
    <div className={`p-6 hover:bg-gray-50 transition-colors group ${isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <Badge className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </Badge>
            
            <h4 className={`text-base font-medium text-gray-900 truncate ${isCompleted ? 'line-through' : ''}`}>
              {task.title}
            </h4>
            
            {isCompleted && (
              <CheckCircle className="text-green-500" size={16} />
            )}
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <User size={14} />
              <span>{task.assignee || 'Self'}</span>
            </div>
            
            {dueDateInfo && (
              <>
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>{dueDateInfo.formatted}</span>
                </div>
                
                <div className={`flex items-center space-x-1 ${isCompleted ? 'text-green-600' : ''}`}>
                  <Clock size={14} />
                  <span>{isCompleted ? 'Completed' : dueDateInfo.relative}</span>
                </div>
              </>
            )}
          </div>
        </div>
        
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
            onClick={toggleComplete}
            className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCompleted ? <Undo size={14} /> : <Check size={14} />}
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
  );
}
