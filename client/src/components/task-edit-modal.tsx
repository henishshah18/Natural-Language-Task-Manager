import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authManager } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { format, parse } from "date-fns";
import type { ClientTask } from "@shared/schema";

interface TaskEditModalProps {
  task: ClientTask;
  onClose: () => void;
  onUpdate: () => void;
}

export default function TaskEditModal({ task, onClose, onUpdate }: TaskEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title,
    assignee: task.assignee || '',
    dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
    dueTime: task.dueDate ? format(new Date(task.dueDate), 'hh:mm a') : '12:00 PM',
    priority: task.priority,
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.dueDate) {
        throw new Error('Due date is required');
      }

      const dateTimeString = `${formData.dueDate}T${format(parse(formData.dueTime, 'hh:mm a', new Date()), 'HH:mm')}:00`;
      const dueDate = new Date(dateTimeString);

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authManager.getAuthHeaders(),
        },
        body: JSON.stringify({
          title: formData.title,
          assignee: formData.assignee || null,
          dueDate: dueDate.toISOString(),
          priority: formData.priority,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      onUpdate();
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update task",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Edit Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title
            </Label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              required
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Assignee
            </Label>
            <Input
              type="text"
              value={formData.assignee}
              onChange={(e) => handleInputChange('assignee', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Leave empty for self"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Due Time
              </Label>
              <Input
                type="time"
                value={formData.dueTime}
                onChange={(e) => handleInputChange('dueTime', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </Label>
            <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
              <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="P1">P1 - Urgent Priority</SelectItem>
                <SelectItem value="P2">P2 - High Priority</SelectItem>
                <SelectItem value="P3">P3 - Medium Priority</SelectItem>
                <SelectItem value="P4">P4 - Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
