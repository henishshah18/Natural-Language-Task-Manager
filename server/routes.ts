import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTaskSchema, updateTaskSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

      res.status(201).json({
        message: "User created successfully",
        token,
        user: { id: user.id, username: user.username }
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        message: "Login successful",
        token,
        user: { id: user.id, username: user.username }
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ id: user.id, username: user.username });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Task routes
  app.get("/api/tasks", authenticateToken, async (req: any, res) => {
    try {
      const tasks = await storage.getTasksByUserId(req.user.userId);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/tasks", authenticateToken, async (req: any, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask({
        ...validatedData,
        userId: req.user.userId,
      });
      res.status(201).json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/tasks/parse", authenticateToken, async (req: any, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }

      // Call OpenAI to parse the natural language task
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "system",
              content: `You are a task parsing assistant. Parse the natural language task input and extract structured information. 

IMPORTANT: Today's date is ${new Date().toISOString().split('T')[0]} (YYYY-MM-DD format).

When parsing dates and times:
- Due date is MANDATORY for all tasks
- Use the current year for all dates
- For relative dates:
  * "today" = current date
  * "tomorrow" = current date + 1 day
  * Days of the week (e.g., "Monday") = next occurrence of that day
- For times:
  * "3:00pm" = 15:00
  * "3:30pm" = 15:30
  * "3pm" = 15:00
  * "6pm" = 18:00
  * "5pm" = 17:00
  * "10am" = 10:00
  * "2:30pm" = 14:30
  * If no time is specified, use 12:00 (noon)
- Always return dates in ISO format with UTC timezone (e.g., "2024-03-20T15:00:00Z")
- If no time is mentioned, use 12:00 (noon) as default
- IMPORTANT: Do not modify the time - use exactly what is specified in the input

Examples:
- "Call client by 3:00pm tomorrow" -> dueDate: "2024-03-21T15:00:00Z"
- "Meeting at 2:30pm tomorrow" -> dueDate: "2024-03-21T14:30:00Z"
- "Submit report by 10am Monday" -> dueDate: "2024-03-25T10:00:00Z"
- "Review code by 6pm today" -> dueDate: "2024-03-20T18:00:00Z"

Respond with JSON in this exact format: { "title": "string", "assignee": "string or null", "dueDate": "ISO string", "priority": "P1, P2, P3, or P4" }. 

Priority levels: P1 (highest/urgent), P2 (high), P3 (medium/default), P4 (low). Default priority is P3.
If no assignee is mentioned, set to null.`
            },
            {
              role: "user",
              content: `Parse this task: "${text}"`
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return res.status(500).json({ message: `OpenAI API error: ${error}` });
      }

      const aiResponse = await response.json();
      const parsedTask = JSON.parse(aiResponse.choices[0].message.content);

      // Create the task
      const taskData = {
        title: parsedTask.title || text,
        assignee: parsedTask.assignee || null,
        dueDate: new Date(parsedTask.dueDate),
        priority: parsedTask.priority || "P3",
        status: "pending",
      };

      if (!taskData.dueDate || isNaN(taskData.dueDate.getTime())) {
        return res.status(400).json({ message: "Invalid due date" });
      }

      const task = await storage.createTask({
        ...taskData,
        userId: req.user.userId,
      });

      res.status(201).json(task);
    } catch (error: any) {
      console.error('Error parsing task:', error);
      res.status(500).json({ message: "Failed to parse task" });
    }
  });

  app.put("/api/tasks/:id", authenticateToken, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const validatedData = updateTaskSchema.parse(req.body);
      
      const updatedTask = await storage.updateTask(taskId, req.user.userId, validatedData);
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/tasks/:id", authenticateToken, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const success = await storage.deleteTask(taskId, req.user.userId);
      
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json({ message: "Task deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
