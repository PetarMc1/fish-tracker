const API_BASE = process.env.API_URL || 'https://api.tracker.petarmc.com';

export interface AdminStats {
  totalUsers: number;
  recentUsers: number;
  totalFish: number;
  totalCrabs: number;
  avgFishPerUser: number;
  avgCrabsPerUser: number;
  fishByGamemode: Record<string, number>;
  crabsByGamemode: Record<string, number>;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  count: number;
}

export interface LeaderboardResponse {
  type: 'fish' | 'crab';
  gamemode: string;
  leaderboard: LeaderboardEntry[];
}

export interface User {
  id: string;
  name: string;
  createdAt: string;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FishEntry {
  id: string;
  name: string;
  rarity: string;
  timestamp: string;
}

export interface CrabEntry {
  id: string;
  fish: string;
  timestamp: string;
}

export interface UserDataResponse {
  userId: string;
  userName: string;
  gamemode: string;
  fish?: FishEntry[];
  crabs?: CrabEntry[];
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('adminToken');
  }
  return null;
}

function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('adminToken', token);
  }
}

async function getCsrfToken(): Promise<string> {
  const response = await fetch(`${API_BASE}/admin/auth/csrf-token`, {
    headers: {
      'x-api-key': process.env.API_KEY || '',
    },
  });
  const data = await response.json();
  return data.csrfToken;
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': process.env.API_KEY || '',
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (endpoint.startsWith('/admin') && options.method && options.method !== 'GET') {
    try {
      const csrfToken = await getCsrfToken();
      headers['x-csrf-token'] = csrfToken;
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
    }
  }

  const response = await fetch(url, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(response.status, `API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

export const adminApi = {
  login: async (username: string, password: string): Promise<{ token: string; admin: { username: string; role: string } }> => {
    const response = await apiRequest<{ token: string; admin: { username: string; role: string } }>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setAuthToken(response.token);
    return response;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
    }
  },

  getMe: (): Promise<{ username: string; role: string }> =>
    apiRequest('/admin/auth/me'),

  createAdmin: (username: string, password: string): Promise<{ username: string; role: string }> =>
    apiRequest('/admin/auth/create-admin', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getStats: (): Promise<AdminStats> =>
    apiRequest('/admin/stats'),

  getLeaderboard: (type: 'fish' | 'crab', gamemode: string): Promise<LeaderboardResponse> =>
    apiRequest(`/admin/leaderboard?type=${type}&gamemode=${gamemode}`),

  getUsers: (page = 1, limit = 10, search?: string): Promise<UsersResponse> => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    return apiRequest(`/admin/users?${params}`);
  },

  getUserById: (id: string): Promise<User> =>
    apiRequest(`/admin/users/${id}`),

  createUser: (name: string, password?: string): Promise<{ name: string; id: string; userPassword: string; fernetKey: string }> =>
    apiRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify({ name, password }),
    }),

  resetUser: (id: string, type: 'password' | 'fernet'): Promise<{ message: string; userId: string; newPassword?: string; newFernetKey?: string }> =>
    apiRequest(`/admin/users/${id}/reset`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    }),

  deleteUser: (id: string): Promise<{ message: string }> =>
    apiRequest(`/admin/users/${id}`, {
      method: 'DELETE',
    }),

  getUserFish: (userId: string, gamemode: string): Promise<UserDataResponse> =>
    apiRequest(`/admin/users/${userId}/fish?gamemode=${gamemode}`),

  getUserCrabs: (userId: string, gamemode: string): Promise<UserDataResponse> =>
    apiRequest(`/admin/users/${userId}/crabs?gamemode=${gamemode}`),

  createFish: (userId: string, gamemode: string, fish: { name: string; rarity: number }[]): Promise<{ message: string }> =>
    apiRequest('/admin/fish', {
      method: 'POST',
      body: JSON.stringify({ userId, gamemode, fish }),
    }),

  createCrab: (userId: string, gamemode: string, count: number): Promise<{ message: string }> =>
    apiRequest('/admin/crab', {
      method: 'POST',
      body: JSON.stringify({ userId, gamemode, count }),
    }),

  deleteFish: (fishId: string, userId: string, gamemode: string): Promise<{ message: string }> =>
    apiRequest(`/admin/fish/${fishId}`, {
      method: 'DELETE',
      body: JSON.stringify({ userId, gamemode }),
    }),

  deleteCrab: (crabId: string, userId: string, gamemode: string): Promise<{ message: string }> =>
    apiRequest(`/admin/crab/${crabId}`, {
      method: 'DELETE',
      body: JSON.stringify({ userId, gamemode }),
    }),
};
