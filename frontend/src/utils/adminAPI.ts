const API_BASE = process.env.API_URL || 'http://localhost:10000';

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
  const response = await fetch(`${API_BASE}/v1/admin/auth/csrf-token`, {
  });
  const data = await response.json();
  return data.csrfToken;
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if ((/^\/(v\d+\/)?admin/).test(endpoint) && options.method && options.method !== 'GET') {
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
    const response = await apiRequest<{ token: string; admin: { username: string; role: string } }>('/v1/admin/auth/login', {
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

  getMe: async (): Promise<{ username: string; role: string }> => {
    const res: any = await apiRequest('/v1/admin/auth/me');
    return res && res.admin ? res.admin : res;
  },

  createAdmin: (username: string, password: string, role: 'admin' | 'superadmin' = 'admin'):
    Promise<{ message?: string; username?: string; role?: string }> =>
    apiRequest(`/v2/admin/admins/create?role=${encodeURIComponent(role)}`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getAdmins: (): Promise<{ admins: { id: string; name: string; role: string }[] }> =>
    apiRequest('/v2/admin/admins'),

  deleteAdmin: (id: string) =>
    apiRequest(`/v2/admin/admins/delete/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  getStats: (): Promise<AdminStats> =>
    apiRequest('/v1/admin/stats'),

  getLeaderboard: (type: 'fish' | 'crab', gamemode: string): Promise<LeaderboardResponse> =>
    apiRequest(`/v1/admin/leaderboard?type=${type}&gamemode=${gamemode}`),

  getUsers: (page = 1, limit = 10, search?: string): Promise<UsersResponse> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    const qs = params.toString();
    return apiRequest<{ users: User[] }>(`/v2/admin/users${qs ? `?${qs}` : ''}`).then((data) => ({
      users: data.users,
      pagination: {
        page: 1,
        limit: data.users.length,
        total: data.users.length,
        pages: 1,
      },
    }));
  },

  getUserById: (id: string): Promise<User> =>
    apiRequest(`/v2/admin/user/get/${encodeURIComponent(id)}`),


  createUser: (name: string, password?: string): Promise<{ name: string; id: string; userPassword: string; fernetKey: string }> =>
    apiRequest('/v2/admin/user/create', {
      method: 'POST',
      body: JSON.stringify({ name, password }),
    }),


  resetUser: (id: string, type: 'password' | 'fernet' | 'api-key'): Promise<{ message: string; userId: string; newPassword?: string; newFernetKey?: string }> =>
    apiRequest(`/v2/admin/user/${encodeURIComponent(id)}/reset?type=${encodeURIComponent(type)}`, {
      method: 'POST',
    }),


  deleteUser: (id: string): Promise<{ message: string }> =>
    apiRequest(`/v2/admin/user/${encodeURIComponent(id)}/delete`, {
      method: 'DELETE',
    }),

  getUserFish: (userId: string, gamemode: string): Promise<UserDataResponse> =>
    apiRequest(`/v2/admin/user/${encodeURIComponent(userId)}/fish?gamemode=${encodeURIComponent(gamemode)}`),

  getUserCrabs: (userId: string, gamemode: string): Promise<UserDataResponse> =>
    apiRequest(`/v2/admin/user/${encodeURIComponent(userId)}/crab?gamemode=${encodeURIComponent(gamemode)}`),


  createFish: (userId: string, gamemode: string, fish: { name: string; rarity: number }[]): Promise<{ message: string }> =>
    apiRequest(`/v2/admin/user/${encodeURIComponent(userId)}/fish/create?gamemode=${encodeURIComponent(gamemode)}`, {
      method: 'POST',
      body: JSON.stringify(fish.length === 1 ? fish[0] : fish),
    }),

  createCrab: (userId: string, gamemode: string, count: number): Promise<{ message: string }> =>
    apiRequest(`/v2/admin/user/${encodeURIComponent(userId)}/crab/create?gamemode=${encodeURIComponent(gamemode)}&count=${encodeURIComponent(String(count))}`, {
      method: 'POST',
    }),

  deleteFish: (fishId: string, userId: string, gamemode: string): Promise<{ message: string }> =>
    apiRequest(`/v2/admin/user/${encodeURIComponent(userId)}/fish/delete/${encodeURIComponent(fishId)}?gamemode=${encodeURIComponent(gamemode)}`, {
      method: 'DELETE',
    }),


  deleteCrab: (crabId: string, userId: string, gamemode: string): Promise<{ message: string }> =>
    apiRequest(`/v2/admin/user/${encodeURIComponent(userId)}/crab/delete?gamemode=${encodeURIComponent(gamemode)}&count=1`, {
      method: 'DELETE',
    }),

};
