import { api } from './api';

export interface TimelineEvent {
  id: string;
  caseId: string;
  type: string;
  title: string;
  description?: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export interface Case {
  id: string;
  tenantId: string;
  caseNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  visaType: string;
  status: string;
  nationality?: string;
  destinationCountry?: string;
  notes?: string;
  expectedDate?: string;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    avatarUrl?: string;
  };
  applicant?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  lead?: {
    id: string;
    source: string;
  };
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    createdAt: string;
  }>;
  timeline?: TimelineEvent[];
  _count?: {
    documents: number;
    timeline?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CaseListResponse {
  status: string;
  data: Case[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CaseFilters {
  page?: number;
  limit?: number;
  status?: string;
  visaType?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  assignedToId?: string;
}

export interface CreateCaseInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  visaType: string;
  nationality?: string;
  destinationCountry?: string;
  notes?: string;
  leadId?: string;
}

export interface UpdateCaseInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  visaType?: string;
  nationality?: string;
  destinationCountry?: string;
  notes?: string;
  expectedDate?: string;
}

export interface UpdateCaseStatusInput {
  status: string;
  notes?: string;
}

export interface CreateTimelineEventInput {
  type: string;
  title: string;
  description?: string;
}

export const caseService = {
  async list(tenantSlug: string, filters: CaseFilters = {}): Promise<CaseListResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    const response = await api.get(`/t/${tenantSlug}/cases?${params.toString()}`);
    return response.data;
  },

  async getById(tenantSlug: string, id: string): Promise<{ data: Case }> {
    const response = await api.get(`/t/${tenantSlug}/cases/${id}`);
    return response.data;
  },

  async create(tenantSlug: string, data: CreateCaseInput): Promise<{ data: Case }> {
    const response = await api.post(`/t/${tenantSlug}/cases`, data);
    return response.data;
  },

  async update(tenantSlug: string, id: string, data: UpdateCaseInput): Promise<{ data: Case }> {
    const response = await api.patch(`/t/${tenantSlug}/cases/${id}`, data);
    return response.data;
  },

  async updateStatus(tenantSlug: string, id: string, data: UpdateCaseStatusInput): Promise<{ data: Case }> {
    const response = await api.patch(`/t/${tenantSlug}/cases/${id}/status`, data);
    return response.data;
  },

  async assign(tenantSlug: string, id: string, agentId: string): Promise<{ data: Case }> {
    const response = await api.post(`/t/${tenantSlug}/cases/${id}/assign`, { agentId });
    return response.data;
  },

  async delete(tenantSlug: string, id: string): Promise<void> {
    await api.delete(`/t/${tenantSlug}/cases/${id}`);
  },

  async getTimeline(tenantSlug: string, id: string): Promise<{ data: TimelineEvent[] }> {
    const response = await api.get(`/t/${tenantSlug}/cases/${id}/timeline`);
    return response.data;
  },

  async addTimelineEvent(tenantSlug: string, id: string, data: CreateTimelineEventInput): Promise<{ data: TimelineEvent }> {
    const response = await api.post(`/t/${tenantSlug}/cases/${id}/timeline`, data);
    return response.data;
  },

  async getStats(tenantSlug: string): Promise<{
    data: {
      total: number;
      thisMonth: number;
      byStatus: Record<string, number>;
      byVisaType: Record<string, number>;
    };
  }> {
    const response = await api.get(`/t/${tenantSlug}/cases/stats`);
    return response.data;
  },
};
