import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../app/constants';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getAuthToken(): Promise<string | null> {
  return await AsyncStorage.getItem('authToken');
}

async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = await getAuthToken();
  const url = `${API_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new ApiError(response.status, error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  get: (endpoint: string) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint: string, data?: any) =>
    apiRequest(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  patch: (endpoint: string, data?: any) =>
    apiRequest(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: (endpoint: string) => apiRequest(endpoint, { method: 'DELETE' }),
};

