// Demo mode data and utilities
// This allows the frontend to work without a backend for demonstration purposes

export const DEMO_MODE_KEY = 'demo_mode';

export const isDemoMode = (): boolean => {
  return localStorage.getItem(DEMO_MODE_KEY) === 'true';
};

export const enableDemoMode = (): void => {
  localStorage.setItem(DEMO_MODE_KEY, 'true');
};

export const disableDemoMode = (): void => {
  localStorage.removeItem(DEMO_MODE_KEY);
};

// Demo Tenant
export const demoTenant = {
  id: 'demo-tenant-001',
  name: 'Demo Migration Agency',
  slug: 'demo',
  domain: undefined,
  plan: 'PROFESSIONAL',
  status: 'ACTIVE',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  settings: {
    logoUrl: undefined,
    primaryColor: '#3b82f6',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
  },
};

// Demo Users
export const demoUsers = {
  admin: {
    id: 'demo-user-001',
    tenantId: demoTenant.id,
    email: 'admin@demo.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'ADMIN',
    status: 'ACTIVE',
    avatarUrl: undefined,
    lastLoginAt: new Date().toISOString(),
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  manager: {
    id: 'demo-user-002',
    tenantId: demoTenant.id,
    email: 'manager@demo.com',
    firstName: 'Michael',
    lastName: 'Chen',
    role: 'MANAGER',
    status: 'ACTIVE',
    avatarUrl: undefined,
    lastLoginAt: new Date().toISOString(),
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  agent: {
    id: 'demo-user-003',
    tenantId: demoTenant.id,
    email: 'agent@demo.com',
    firstName: 'Emily',
    lastName: 'Davis',
    role: 'AGENT',
    status: 'ACTIVE',
    avatarUrl: undefined,
    lastLoginAt: new Date().toISOString(),
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
};

// Demo Leads
export const demoLeads = [
  {
    id: 'demo-lead-001',
    tenantId: demoTenant.id,
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    status: 'NEW',
    source: 'WEBSITE',
    nationality: 'United Kingdom',
    interestedVisa: 'WORK',
    notes: 'Interested in skilled worker visa for Australia',
    assignedToId: null,
    convertedToCaseId: null,
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-01-15T10:30:00.000Z',
  },
  {
    id: 'demo-lead-002',
    tenantId: demoTenant.id,
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@email.com',
    phone: '+1 (555) 234-5678',
    status: 'CONTACTED',
    source: 'REFERRAL',
    nationality: 'Spain',
    interestedVisa: 'STUDENT',
    notes: 'Looking for student visa options in Canada',
    assignedToId: demoUsers.agent.id,
    convertedToCaseId: null,
    createdAt: '2024-01-14T09:15:00.000Z',
    updatedAt: '2024-01-16T14:20:00.000Z',
  },
  {
    id: 'demo-lead-003',
    tenantId: demoTenant.id,
    firstName: 'Ahmed',
    lastName: 'Hassan',
    email: 'ahmed.hassan@email.com',
    phone: '+1 (555) 345-6789',
    status: 'QUALIFIED',
    source: 'SOCIAL_MEDIA',
    nationality: 'Egypt',
    interestedVisa: 'FAMILY',
    notes: 'Family reunification case - spouse already in USA',
    assignedToId: demoUsers.manager.id,
    convertedToCaseId: null,
    createdAt: '2024-01-10T11:45:00.000Z',
    updatedAt: '2024-01-18T16:30:00.000Z',
  },
  {
    id: 'demo-lead-004',
    tenantId: demoTenant.id,
    firstName: 'Yuki',
    lastName: 'Tanaka',
    email: 'yuki.tanaka@email.com',
    phone: '+1 (555) 456-7890',
    status: 'PROPOSAL',
    source: 'WALK_IN',
    nationality: 'Japan',
    interestedVisa: 'BUSINESS',
    notes: 'Entrepreneur visa - tech startup founder',
    assignedToId: demoUsers.admin.id,
    convertedToCaseId: null,
    createdAt: '2024-01-08T08:00:00.000Z',
    updatedAt: '2024-01-19T10:15:00.000Z',
  },
  {
    id: 'demo-lead-005',
    tenantId: demoTenant.id,
    firstName: 'Olga',
    lastName: 'Petrova',
    email: 'olga.petrova@email.com',
    phone: '+1 (555) 567-8901',
    status: 'WON',
    source: 'EMAIL',
    nationality: 'Russia',
    interestedVisa: 'PERMANENT_RESIDENCE',
    notes: 'Converted to case - PR application',
    assignedToId: demoUsers.agent.id,
    convertedToCaseId: 'demo-case-001',
    createdAt: '2024-01-05T13:20:00.000Z',
    updatedAt: '2024-01-20T09:00:00.000Z',
  },
];

// Demo Cases
export const demoCases = [
  {
    id: 'demo-case-001',
    tenantId: demoTenant.id,
    caseNumber: 'KM-2024-001',
    applicantId: demoUsers.agent.id,
    visaType: 'PERMANENT_RESIDENCE',
    status: 'DOCUMENT_COLLECTION',
    destinationCountry: 'Canada',
    startDate: '2024-01-20T00:00:00.000Z',
    expectedEndDate: '2024-06-20T00:00:00.000Z',
    actualEndDate: null,
    assignedToId: demoUsers.agent.id,
    leadId: 'demo-lead-005',
    notes: 'Express Entry application - CRS score 470',
    createdAt: '2024-01-20T09:00:00.000Z',
    updatedAt: '2024-01-22T14:30:00.000Z',
  },
  {
    id: 'demo-case-002',
    tenantId: demoTenant.id,
    caseNumber: 'KM-2024-002',
    applicantId: demoUsers.manager.id,
    visaType: 'WORK',
    status: 'SUBMITTED',
    destinationCountry: 'Australia',
    startDate: '2024-01-10T00:00:00.000Z',
    expectedEndDate: '2024-04-10T00:00:00.000Z',
    actualEndDate: null,
    assignedToId: demoUsers.manager.id,
    leadId: null,
    notes: 'Skilled worker visa - Software Engineer',
    createdAt: '2024-01-10T10:00:00.000Z',
    updatedAt: '2024-01-25T11:45:00.000Z',
  },
  {
    id: 'demo-case-003',
    tenantId: demoTenant.id,
    caseNumber: 'KM-2024-003',
    applicantId: demoUsers.admin.id,
    visaType: 'STUDENT',
    status: 'PROCESSING',
    destinationCountry: 'United Kingdom',
    startDate: '2024-01-05T00:00:00.000Z',
    expectedEndDate: '2024-03-05T00:00:00.000Z',
    actualEndDate: null,
    assignedToId: demoUsers.admin.id,
    leadId: null,
    notes: 'Tier 4 Student Visa - MBA Program',
    createdAt: '2024-01-05T08:30:00.000Z',
    updatedAt: '2024-01-28T16:00:00.000Z',
  },
  {
    id: 'demo-case-004',
    tenantId: demoTenant.id,
    caseNumber: 'KM-2024-004',
    applicantId: demoUsers.agent.id,
    visaType: 'FAMILY',
    status: 'APPROVED',
    destinationCountry: 'United States',
    startDate: '2023-12-01T00:00:00.000Z',
    expectedEndDate: '2024-02-01T00:00:00.000Z',
    actualEndDate: '2024-01-28T00:00:00.000Z',
    assignedToId: demoUsers.agent.id,
    leadId: null,
    notes: 'Spouse visa approved - awaiting document issuance',
    createdAt: '2023-12-01T09:00:00.000Z',
    updatedAt: '2024-01-28T10:30:00.000Z',
  },
];

// Demo Companies
export const demoCompanies = [
  {
    id: 'demo-company-001',
    tenantId: demoTenant.id,
    name: 'TechCorp International',
    email: 'hr@techcorp.com',
    phone: '+1 (555) 100-2000',
    website: 'https://techcorp.com',
    industry: 'Technology',
    address: '123 Silicon Valley Blvd, San Francisco, CA 94102',
    contactPerson: 'Jennifer Lee',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: 'demo-company-002',
    tenantId: demoTenant.id,
    name: 'Global Healthcare Inc',
    email: 'recruiting@globalhc.com',
    phone: '+1 (555) 200-3000',
    website: 'https://globalhealthcare.com',
    industry: 'Healthcare',
    address: '456 Medical Center Dr, Boston, MA 02101',
    contactPerson: 'Dr. Robert Williams',
    status: 'ACTIVE',
    createdAt: '2024-01-05T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z',
  },
];

// Demo Jobs
export const demoJobs = [
  {
    id: 'demo-job-001',
    tenantId: demoTenant.id,
    companyId: 'demo-company-001',
    title: 'Senior Software Engineer',
    description: 'We are looking for an experienced software engineer to join our team...',
    requirements: '5+ years experience, React, Node.js, AWS',
    location: 'San Francisco, CA',
    salary: '$150,000 - $200,000',
    visaSponsorship: true,
    status: 'OPEN',
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2024-01-10T00:00:00.000Z',
  },
  {
    id: 'demo-job-002',
    tenantId: demoTenant.id,
    companyId: 'demo-company-002',
    title: 'Registered Nurse',
    description: 'Join our team of healthcare professionals...',
    requirements: 'RN License, 2+ years experience, BSN preferred',
    location: 'Boston, MA',
    salary: '$70,000 - $90,000',
    visaSponsorship: true,
    status: 'OPEN',
    createdAt: '2024-01-12T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z',
  },
];

// Demo Candidates
export const demoCandidates = [
  {
    id: 'demo-candidate-001',
    tenantId: demoTenant.id,
    firstName: 'Alex',
    lastName: 'Kumar',
    email: 'alex.kumar@email.com',
    phone: '+1 (555) 111-2222',
    nationality: 'India',
    currentLocation: 'Mumbai, India',
    skills: ['JavaScript', 'React', 'Node.js', 'Python'],
    experience: '7 years',
    education: 'B.Tech Computer Science',
    status: 'AVAILABLE',
    createdAt: '2024-01-08T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: 'demo-candidate-002',
    tenantId: demoTenant.id,
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@email.com',
    phone: '+1 (555) 222-3333',
    nationality: 'India',
    currentLocation: 'Delhi, India',
    skills: ['Nursing', 'Patient Care', 'ICU', 'Emergency Medicine'],
    experience: '5 years',
    education: 'BSN Nursing',
    status: 'INTERVIEWING',
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2024-01-18T00:00:00.000Z',
  },
];

// Dashboard stats
export const demoDashboardStats = {
  totalLeads: demoLeads.length,
  newLeadsThisMonth: demoLeads.filter(l => l.status === 'NEW').length,
  activeCases: demoCases.filter(c => !['APPROVED', 'REJECTED', 'COMPLETED'].includes(c.status)).length,
  casesThisMonth: demoCases.length,
  conversionRate: 68,
  avgProcessingDays: 45,
  pendingTasks: 12,
  upcomingDeadlines: 5,
};

// Demo auth tokens
export const DEMO_ACCESS_TOKEN = 'demo-access-token-12345';
export const DEMO_REFRESH_TOKEN = 'demo-refresh-token-67890';
