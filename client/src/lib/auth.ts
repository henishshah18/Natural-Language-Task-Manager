import { apiRequest } from './queryClient';

export interface User {
  id: number;
  username: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

class AuthManager {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Initialize from localStorage
    this.token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch {
        this.user = null;
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return this.token !== null && this.user !== null;
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/login', {
      username,
      password,
    });

    const data: AuthResponse = await response.json();
    this.setAuth(data.token, data.user);
    return data;
  }

  async signup(username: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/signup', {
      username,
      password,
    });

    const data: AuthResponse = await response.json();
    this.setAuth(data.token, data.user);
    return data;
  }

  async verifyAuth(): Promise<User | null> {
    if (!this.token) return null;

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      const user = await response.json();
      this.user = user;
      localStorage.setItem('auth_user', JSON.stringify(user));
      return user;
    } catch {
      this.logout();
      return null;
    }
  }

  logout(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  private setAuth(token: string, user: User): void {
    this.token = token;
    this.user = user;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  // Add Authorization header to requests
  getAuthHeaders(): Record<string, string> {
    if (this.token) {
      return {
        Authorization: `Bearer ${this.token}`,
      };
    }
    return {};
  }
}

export const authManager = new AuthManager();
