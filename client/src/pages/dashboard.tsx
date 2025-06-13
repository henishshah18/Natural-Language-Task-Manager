import { useQuery } from "@tanstack/react-query";
import { Brain, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authManager } from "@/lib/auth";
import { useLocation } from "wouter";
import TaskInput from "@/components/task-input";
import TaskList from "@/components/task-list";
import { useState } from "react";
import type { ClientTask } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState({ priority: '', status: '' });

  const { data: tasks = [], refetch, isLoading } = useQuery<ClientTask[]>({
    queryKey: ['/api/tasks'],
    queryFn: async () => {
      const response = await fetch('/api/tasks', {
        headers: authManager.getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      return response.json();
    },
  });

  const handleLogout = () => {
    authManager.logout();
    setLocation('/login');
  };

  const filteredTasks = tasks.filter(task => {
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.status && task.status !== filters.status) return false;
    return true;
  });

  const user = authManager.getUser();

  return (
    <div className="min-h-screen font-inter">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="text-white text-sm" size={16} />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">NLTM</h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.username}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <LogOut size={16} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TaskInput onTaskCreated={() => refetch()} />

        {/* Task Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <i className="fas fa-filter text-gray-400"></i>
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
              </div>

              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="">All Priorities</option>
                <option value="P1">P1 - Urgent</option>
                <option value="P2">P2 - High</option>
                <option value="P3">P3 - Medium</option>
                <option value="P4">P4 - Low</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{filteredTasks.length}</span>
              <span>tasks total</span>
            </div>
          </div>
        </div>

        <TaskList 
          tasks={filteredTasks} 
          onTaskUpdate={() => refetch()} 
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
