import { authManager } from './auth';

export interface ParsedTask {
  title: string;
  assignee: string | null;
  dueDate: string | null;
  priority: 'P1' | 'P2' | 'P3';
}

export async function parseTaskFromNaturalLanguage(text: string): Promise<any> {
  const response = await fetch('/api/tasks/parse', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authManager.getAuthHeaders(),
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to parse task: ${error}`);
  }

  return await response.json();
}
