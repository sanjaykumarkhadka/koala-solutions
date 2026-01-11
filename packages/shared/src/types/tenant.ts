export enum Plan {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  plan: Plan;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSettings {
  id: string;
  tenantId: string;
  logoUrl: string | null;
  primaryColor: string;
  timezone: string;
  dateFormat: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantInput {
  name: string;
  slug: string;
  plan?: Plan;
}

export interface UpdateTenantInput {
  name?: string;
  domain?: string;
  plan?: Plan;
  status?: TenantStatus;
}
