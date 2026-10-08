import type {
  User,
  Exercise,
  Workout,
  WorkoutCreatePayload,
  NutritionLog,
  BodyMetric,
  DashboardSummary,
} from '../types';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || `Request failed with status ${res.status}`);
  }
  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
}

export const api = {
  // Users
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users/`);
    return handleResponse<User[]>(res);
  },

  async getUser(id: number): Promise<User> {
    const res = await fetch(`${API_BASE}/users/${id}`);
    return handleResponse<User>(res);
  },

  async createUser(data: Partial<User> & { password?: string }): Promise<User> {
    const res = await fetch(`${API_BASE}/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<User>(res);
  },

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<User>(res);
  },

  // Dashboard Summary
  async getDashboardSummary(userId: number): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE}/dashboard/summary?user_id=${userId}`);
    return handleResponse<DashboardSummary>(res);
  },

  // Exercises
  async getExercises(category?: string, search?: string): Promise<Exercise[]> {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/exercises/?${params.toString()}`);
    return handleResponse<Exercise[]>(res);
  },

  async createExercise(data: Omit<Exercise, 'id' | 'created_at'>): Promise<Exercise> {
    const res = await fetch(`${API_BASE}/exercises/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Exercise>(res);
  },

  // Workouts
  async getWorkouts(userId?: number): Promise<Workout[]> {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId.toString());
    const res = await fetch(`${API_BASE}/workouts/?${params.toString()}`);
    return handleResponse<Workout[]>(res);
  },

  async createWorkout(payload: WorkoutCreatePayload): Promise<Workout> {
    const res = await fetch(`${API_BASE}/workouts/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Workout>(res);
  },

  async deleteWorkout(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/workouts/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(res);
  },

  // Nutrition
  async getNutritionLogs(userId: number, logDate?: string): Promise<NutritionLog[]> {
    const params = new URLSearchParams({ user_id: userId.toString() });
    if (logDate) params.append('log_date', logDate);
    const res = await fetch(`${API_BASE}/nutrition/?${params.toString()}`);
    return handleResponse<NutritionLog[]>(res);
  },

  async createNutritionLog(data: Omit<NutritionLog, 'id' | 'created_at'>): Promise<NutritionLog> {
    const res = await fetch(`${API_BASE}/nutrition/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<NutritionLog>(res);
  },

  async deleteNutritionLog(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/nutrition/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(res);
  },

  // Metrics
  async getBodyMetrics(userId: number): Promise<BodyMetric[]> {
    const res = await fetch(`${API_BASE}/metrics/?user_id=${userId}`);
    return handleResponse<BodyMetric[]>(res);
  },

  async createBodyMetric(data: Omit<BodyMetric, 'id'>): Promise<BodyMetric> {
    const res = await fetch(`${API_BASE}/metrics/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<BodyMetric>(res);
  },
};
