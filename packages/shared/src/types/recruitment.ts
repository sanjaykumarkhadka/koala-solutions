export enum JobStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED',
  FILLED = 'FILLED',
}

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  TEMPORARY = 'TEMPORARY',
  INTERNSHIP = 'INTERNSHIP',
}

export interface Job {
  id: string;
  tenantId: string;
  companyId: string;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  country: string;
  salary: string | null;
  jobType: JobType;
  status: JobStatus;
  visaSponsorship: boolean;
  openPositions: number;
  filledPositions: number;
  deadline: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobInput {
  companyId: string;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  country: string;
  salary?: string;
  jobType: JobType;
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
  jobType?: JobType;
  status?: JobStatus;
  visaSponsorship?: boolean;
  openPositions?: number;
  filledPositions?: number;
  deadline?: string;
}

export enum CandidateStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PLACED = 'PLACED',
  BLACKLISTED = 'BLACKLISTED',
}

export interface Candidate {
  id: string;
  tenantId: string;
  userId: string;
  resumeUrl: string | null;
  skills: string[];
  experience: number;
  education: string | null;
  currentLocation: string | null;
  preferredLocations: string[];
  expectedSalary: string | null;
  availableFrom: string | null;
  status: CandidateStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCandidateInput {
  userId: string;
  skills: string[];
  experience: number;
  education?: string;
  currentLocation?: string;
  preferredLocations?: string[];
  expectedSalary?: string;
  availableFrom?: string;
}

export interface UpdateCandidateInput {
  skills?: string[];
  experience?: number;
  education?: string;
  currentLocation?: string;
  preferredLocations?: string[];
  expectedSalary?: string;
  availableFrom?: string;
  status?: CandidateStatus;
  resumeUrl?: string;
}

export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  SCREENING = 'SCREENING',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export interface JobApplication {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  matchScore: number | null;
  notes: string | null;
  appliedAt: string;
  updatedAt: string;
}
