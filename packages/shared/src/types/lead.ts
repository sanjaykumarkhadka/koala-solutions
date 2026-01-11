export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST',
}

export enum LeadSource {
  WEBSITE = 'WEBSITE',
  REFERRAL = 'REFERRAL',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  WALK_IN = 'WALK_IN',
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  OTHER = 'OTHER',
}

export interface Lead {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: LeadStatus;
  source: LeadSource;
  nationality: string | null;
  interestedVisa: string | null;
  notes: string | null;
  assignedToId: string | null;
  convertedToCaseId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source?: LeadSource;
  nationality?: string;
  interestedVisa?: string;
  notes?: string;
  assignedToId?: string;
}

export interface UpdateLeadInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: LeadStatus;
  source?: LeadSource;
  nationality?: string;
  interestedVisa?: string;
  notes?: string;
  assignedToId?: string;
}
