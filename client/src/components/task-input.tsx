import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Lightbulb } from "lucide-react";
import { parseTaskFromNaturalLanguage } from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";

interface TaskInputProps {
  onTaskCreated: () => void;
}

export default function TaskInput({ onTaskCreated }: TaskInputProps) {
  const [taskText, setTaskText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    setIsLoading(true);

    try {
      await parseTaskFromNaturalLanguage(taskText);
      setTaskText("");
      onTaskCreated();
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create task",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Add a new task
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="e.g., Call client Rajeev tomorrow 5pm P2"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors text-base"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !taskText.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Plus size={16} />
              )}
              <span>{isLoading ? "Adding..." : "Add Task"}</span>
            </Button>
          </div>

          <div className="mt-3 text-sm text-gray-500 flex items-center space-x-1">
            <Lightbulb size={14} />
            <span>
              Try: "Submit report to Priya by 10am Monday P1" or "Review code by 6pm today"
            </span>
          </div>
        </form>

        {isLoading && (
          <div className="mt-4 flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Parsing task...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
