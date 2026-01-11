export enum CaseStatus {
  DRAFT = 'DRAFT',
  DOCUMENT_COLLECTION = 'DOCUMENT_COLLECTION',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SUBMITTED = 'SUBMITTED',
  PROCESSING = 'PROCESSING',
  ADDITIONAL_INFO = 'ADDITIONAL_INFO',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

export enum VisaType {
  WORK = 'WORK',
  STUDENT = 'STUDENT',
  TOURIST = 'TOURIST',
  BUSINESS = 'BUSINESS',
  FAMILY = 'FAMILY',
  PERMANENT_RESIDENCE = 'PERMANENT_RESIDENCE',
  CITIZENSHIP = 'CITIZENSHIP',
  OTHER = 'OTHER',
}

export interface Case {
  id: string;
  tenantId: string;
  caseNumber: string;
  applicantId: string;
  visaType: VisaType;
  status: CaseStatus;
  destinationCountry: string;
  startDate: string | null;
  expectedEndDate: string | null;
  actualEndDate: string | null;
  assignedToId: string | null;
  leadId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCaseInput {
  applicantId: string;
  visaType: VisaType;
  destinationCountry: string;
  startDate?: string;
  expectedEndDate?: string;
  assignedToId?: string;
  leadId?: string;
  notes?: string;
}

export interface UpdateCaseInput {
  visaType?: VisaType;
  status?: CaseStatus;
  destinationCountry?: string;
  startDate?: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  assignedToId?: string;
  notes?: string;
}

export enum TimelineEventType {
  STATUS_CHANGE = 'STATUS_CHANGE',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_APPROVED = 'DOCUMENT_APPROVED',
  DOCUMENT_REJECTED = 'DOCUMENT_REJECTED',
  NOTE_ADDED = 'NOTE_ADDED',
  ASSIGNMENT_CHANGED = 'ASSIGNMENT_CHANGED',
  APPLICATION_SUBMITTED = 'APPLICATION_SUBMITTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  DECISION_MADE = 'DECISION_MADE',
  CUSTOM = 'CUSTOM',
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  type: TimelineEventType;
  title: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdById: string;
  createdAt: string;
}

export interface CreateTimelineEventInput {
  type: TimelineEventType;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}
