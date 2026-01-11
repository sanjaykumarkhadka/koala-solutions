import { api } from './api';

export interface Lead {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source: string;
  status: string;
  notes?: string;
  interestedVisa?: string;
  nationality?: string;
  destinationCountry?: string;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LeadListResponse {
  status: string;
  data: Lead[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface LeadFilters {
  page?: number;
  limit?: number;
  status?: string;
  source?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  assignedToId?: string;
}

export interface CreateLeadInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source?: string;
  notes?: string;
  interestedVisa?: string;
  nationality?: string;
  destinationCountry?: string;
}

export interface UpdateLeadInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  source?: string;
  status?: string;
  notes?: string;
  interestedVisa?: string;
  nationality?: string;
  destinationCountry?: string;
}

export const leadService = {
  async list(tenantSlug: string, filters: LeadFilters = {}): Promise<LeadListResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    const response = await api.get(`/t/${tenantSlug}/leads?${params.toString()}`);
    return response.data;
  },

  async getById(tenantSlug: string, id: string): Promise<{ data: Lead }> {
    const response = await api.get(`/t/${tenantSlug}/leads/${id}`);
    return response.data;
  },

  async create(tenantSlug: string, data: CreateLeadInput): Promise<{ data: Lead }> {
    const response = await api.post(`/t/${tenantSlug}/leads`, data);
    return response.data;
  },

  async update(tenantSlug: string, id: string, data: UpdateLeadInput): Promise<{ data: Lead }> {
    const response = await api.patch(`/t/${tenantSlug}/leads/${id}`, data);
    return response.data;
  },

  async delete(tenantSlug: string, id: string): Promise<void> {
    await api.delete(`/t/${tenantSlug}/leads/${id}`);
  },

  async assign(tenantSlug: string, id: string, agentId: string): Promise<{ data: Lead }> {
    const response = await api.post(`/t/${tenantSlug}/leads/${id}/assign`, { agentId });
    return response.data;
  },

  async convertToCase(tenantSlug: string, id: string): Promise<{ data: unknown }> {
    const response = await api.post(`/t/${tenantSlug}/leads/${id}/convert`);
    return response.data;
  },

  async getStats(tenantSlug: string): Promise<{
    data: {
      total: number;
      thisMonth: number;
      byStatus: Record<string, number>;
      bySource: Record<string, number>;
    };
  }> {
    const response = await api.get(`/t/${tenantSlug}/leads/stats`);
    return response.data;
  },
};
