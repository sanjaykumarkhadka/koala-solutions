import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import {
  isDemoMode,
  demoTenant,
  demoUsers,
  demoLeads,
  demoCases,
  demoCompanies,
  demoJobs,
  demoCandidates,
  demoDashboardStats,
  DEMO_ACCESS_TOKEN,
  DEMO_REFRESH_TOKEN,
} from './demo';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Demo mode response handler
function handleDemoRequest(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const url = config.url || '';
  const method = config.method?.toLowerCase() || 'get';

  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: getDemoResponse(url, method, config.data),
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    }, 300);
  });
}

function getDemoResponse(url: string, method: string, requestData?: string): unknown {
  const data = requestData ? JSON.parse(requestData) : {};

  // Auth endpoints
  if (url.includes('/auth/login')) {
    return {
      status: 'success',
      data: {
        accessToken: DEMO_ACCESS_TOKEN,
        refreshToken: DEMO_REFRESH_TOKEN,
        user: demoUsers.admin,
        tenant: demoTenant,
      },
    };
  }

  if (url.includes('/auth/me')) {
    return {
      status: 'success',
      data: {
        user: demoUsers.admin,
        tenant: demoTenant,
      },
    };
  }

  if (url.includes('/auth/tenants')) {
    return {
      status: 'success',
      data: [{ id: demoTenant.id, name: demoTenant.name, slug: demoTenant.slug }],
    };
  }

  if (url.includes('/auth/refresh')) {
    return {
      status: 'success',
      data: { accessToken: DEMO_ACCESS_TOKEN },
    };
  }

  // Leads endpoints
  if (url.includes('/leads')) {
    if (method === 'get') {
      if (url.match(/\/leads\/[^/]+$/)) {
        const id = url.split('/').pop();
        const lead = demoLeads.find(l => l.id === id) || demoLeads[0];
        return { status: 'success', data: lead };
      }
      return {
        status: 'success',
        data: demoLeads,
        meta: {
          total: demoLeads.length,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
    if (method === 'post') {
      const newLead = {
        id: `demo-lead-${Date.now()}`,
        tenantId: demoTenant.id,
        ...data,
        status: 'NEW',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { status: 'success', data: newLead };
    }
  }

  // Cases endpoints
  if (url.includes('/cases')) {
    if (method === 'get') {
      if (url.match(/\/cases\/[^/]+$/)) {
        const id = url.split('/').pop();
        const caseItem = demoCases.find(c => c.id === id) || demoCases[0];
        return { status: 'success', data: caseItem };
      }
      return {
        status: 'success',
        data: demoCases,
        meta: {
          total: demoCases.length,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
  }

  // Companies endpoints
  if (url.includes('/companies')) {
    if (method === 'get') {
      return {
        status: 'success',
        data: demoCompanies,
        meta: {
          total: demoCompanies.length,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
  }

  // Jobs endpoints
  if (url.includes('/jobs')) {
    if (method === 'get') {
      return {
        status: 'success',
        data: demoJobs,
        meta: {
          total: demoJobs.length,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
  }

  // Candidates endpoints
  if (url.includes('/candidates')) {
    if (method === 'get') {
      return {
        status: 'success',
        data: demoCandidates,
        meta: {
          total: demoCandidates.length,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
  }

  // Dashboard stats
  if (url.includes('/dashboard') || url.includes('/stats')) {
    return {
      status: 'success',
      data: demoDashboardStats,
    };
  }

  // Admin endpoints
  if (url.includes('/admin')) {
    if (url.includes('/team') || url.includes('/users')) {
      return {
        status: 'success',
        data: Object.values(demoUsers),
        meta: {
          total: Object.values(demoUsers).length,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
  }

  // Default response
  return { status: 'success', data: {} };
}

// Request interceptor for adding auth token and handling demo mode
api.interceptors.request.use(
  (config) => {
    // Handle demo mode - intercept and return mock data
    if (isDemoMode()) {
      // Return a custom adapter that provides mock responses
      config.adapter = () => handleDemoRequest(config);
    }

    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Don't handle errors in demo mode
    if (isDemoMode()) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // Handle 401 - try to refresh token
    if (error.response?.status === 401 && originalRequest) {
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export interface ApiError {
  status: string;
  message: string;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    return data?.message ?? error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
