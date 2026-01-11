import { api } from './api';

export interface Company {
  id: string;
  tenantId: string;
  name: string;
  industry?: string;
  website?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  country: string;
  logoUrl?: string;
  _count?: {
    jobs: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CompanyListResponse {
  status: string;
  data: Company[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CompanyFilters {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  industry?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCompanyInput {
  name: string;
  industry?: string;
  website?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  country: string;
}

export interface UpdateCompanyInput {
  name?: string;
  industry?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  country?: string;
  logoUrl?: string;
}

export const companyService = {
  async list(tenantSlug: string, filters: CompanyFilters = {}): Promise<CompanyListResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    const response = await api.get(`/t/${tenantSlug}/companies?${params.toString()}`);
    return response.data;
  },

  async getById(tenantSlug: string, id: string): Promise<{ data: Company }> {
    const response = await api.get(`/t/${tenantSlug}/companies/${id}`);
    return response.data;
  },

  async create(tenantSlug: string, data: CreateCompanyInput): Promise<{ data: Company }> {
    const response = await api.post(`/t/${tenantSlug}/companies`, data);
    return response.data;
  },

  async update(tenantSlug: string, id: string, data: UpdateCompanyInput): Promise<{ data: Company }> {
    const response = await api.patch(`/t/${tenantSlug}/companies/${id}`, data);
    return response.data;
  },

  async delete(tenantSlug: string, id: string): Promise<void> {
    await api.delete(`/t/${tenantSlug}/companies/${id}`);
  },

  async getStats(tenantSlug: string): Promise<{
    data: {
      total: number;
      byCountry: Record<string, number>;
      byIndustry: Record<string, number>;
    };
  }> {
    const response = await api.get(`/t/${tenantSlug}/companies/stats`);
    return response.data;
  },
};
