import { api } from './api';

export interface Job {
  id: string;
  tenantId: string;
  companyId: string;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  country: string;
  salary?: string;
  jobType: string;
  status: string;
  visaSponsorship: boolean;
  openPositions: number;
  filledPositions: number;
  deadline?: string;
  company?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  _count?: {
    applications: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  candidateId: string;
  status: string;
  matchScore?: number;
  notes?: string;
  appliedAt: string;
  candidate?: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatarUrl?: string;
    };
  };
}

export interface JobListResponse {
  status: string;
  data: Job[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface JobFilters {
  page?: number;
  limit?: number;
  status?: string;
  jobType?: string;
  companyId?: string;
  country?: string;
  visaSponsorship?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateJobInput {
  companyId: string;
  title: string;
  description: string;
  requirements?: string[];
  location: string;
  country: string;
  salary?: string;
  jobType: string;
  visaSponsorship?: boolean;
  openPositions?: number;
  deadline?: string;
}

export interface UpdateJobInput {
  title?: string;
  description?: string;
  requirements?: string[];
  location?: string;
  country?: string;
  salary?: string;
  jobType?: string;
  status?: string;
  visaSponsorship?: boolean;
  openPositions?: number;
  deadline?: string;
}

export const jobService = {
  async list(tenantSlug: string, filters: JobFilters = {}): Promise<JobListResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    const response = await api.get(`/t/${tenantSlug}/jobs?${params.toString()}`);
    return response.data;
  },

  async getById(tenantSlug: string, id: string): Promise<{ data: Job & { applications?: JobApplication[] } }> {
    const response = await api.get(`/t/${tenantSlug}/jobs/${id}`);
    return response.data;
  },

  async create(tenantSlug: string, data: CreateJobInput): Promise<{ data: Job }> {
    const response = await api.post(`/t/${tenantSlug}/jobs`, data);
    return response.data;
  },

  async update(tenantSlug: string, id: string, data: UpdateJobInput): Promise<{ data: Job }> {
    const response = await api.patch(`/t/${tenantSlug}/jobs/${id}`, data);
    return response.data;
  },

  async updateStatus(tenantSlug: string, id: string, status: string): Promise<{ data: Job }> {
    const response = await api.patch(`/t/${tenantSlug}/jobs/${id}/status`, { status });
    return response.data;
  },

  async delete(tenantSlug: string, id: string): Promise<void> {
    await api.delete(`/t/${tenantSlug}/jobs/${id}`);
  },

  async getApplications(tenantSlug: string, id: string): Promise<{ data: JobApplication[] }> {
    const response = await api.get(`/t/${tenantSlug}/jobs/${id}/applications`);
    return response.data;
  },

  async getStats(tenantSlug: string): Promise<{
    data: {
      total: number;
      openPositions: number;
      byStatus: Record<string, number>;
      byType: Record<string, number>;
    };
  }> {
    const response = await api.get(`/t/${tenantSlug}/jobs/stats`);
    return response.data;
  },
};
