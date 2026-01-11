export enum DocumentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum DocumentCategory {
  IDENTITY = 'IDENTITY',
  EDUCATION = 'EDUCATION',
  EMPLOYMENT = 'EMPLOYMENT',
  FINANCIAL = 'FINANCIAL',
  MEDICAL = 'MEDICAL',
  LEGAL = 'LEGAL',
  TRAVEL = 'TRAVEL',
  OTHER = 'OTHER',
}

export interface Document {
  id: string;
  tenantId: string;
  caseId: string;
  name: string;
  filename: string;
  mimeType: string;
  size: number;
  category: DocumentCategory;
  status: DocumentStatus;
  storagePath: string;
  uploadedById: string;
  reviewedById: string | null;
  reviewNotes: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentInput {
  name: string;
  category: DocumentCategory;
  expiresAt?: string;
}

export interface UpdateDocumentInput {
  name?: string;
  category?: DocumentCategory;
  status?: DocumentStatus;
  reviewNotes?: string;
  expiresAt?: string;
}
