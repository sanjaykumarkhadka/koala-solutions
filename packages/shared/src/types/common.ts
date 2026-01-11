export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export interface ApiError {
  status: 'error';
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

export interface FilterParams {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DashboardStats {
  leads: {
    total: number;
    new: number;
    qualified: number;
    converted: number;
  };
  cases: {
    total: number;
    active: number;
    pending: number;
    completed: number;
  };
  jobs: {
    total: number;
    open: number;
    filled: number;
  };
  revenue: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
}
