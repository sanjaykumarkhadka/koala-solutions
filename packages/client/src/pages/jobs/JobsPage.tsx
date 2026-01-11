import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Card } from '@/components/common/Card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/common/Table';
import { Badge } from '@/components/common/Badge';
import { Avatar } from '@/components/common/Avatar';
import { Pagination } from '@/components/common/Pagination';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState, NoDataIcon } from '@/components/common/EmptyState';
import { Modal } from '@/components/common/Modal';
import { useToast } from '@/contexts/ToastContext';
import { jobService, Job, JobFilters, CreateJobInput } from '@/services/job.service';
import { companyService, Company } from '@/services/company.service';
import { getErrorMessage } from '@/services/api';
import './JobsPage.css';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'OPEN', label: 'Open' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'FILLED', label: 'Filled' },
];

const JOB_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'TEMPORARY', label: 'Temporary' },
  { value: 'INTERNSHIP', label: 'Internship' },
];

const statusColors: Record<string, 'info' | 'primary' | 'warning' | 'success' | 'error' | 'default'> = {
  DRAFT: 'default',
  OPEN: 'success',
  PAUSED: 'warning',
  CLOSED: 'error',
  FILLED: 'info',
};

export function JobsPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState<JobFilters>({
    page: 1,
    limit: 20,
    status: '',
    jobType: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newJob, setNewJob] = useState<CreateJobInput>({
    companyId: '',
    title: '',
    description: '',
    location: '',
    country: '',
    jobType: 'FULL_TIME',
    requirements: [],
    salary: '',
    visaSponsorship: false,
    openPositions: 1,
  });

  const fetchJobs = useCallback(async () => {
    if (!tenantSlug) return;

    setIsLoading(true);
    try {
      const response = await jobService.list(tenantSlug, filters);
      setJobs(response.data);
      setMeta({
        page: response.meta.page,
        totalPages: response.meta.totalPages,
        total: response.meta.total,
      });
    } catch (err) {
      showError('Failed to load jobs', getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [tenantSlug, filters, showError]);

  const fetchCompanies = useCallback(async () => {
    if (!tenantSlug) return;
    try {
      const response = await companyService.list(tenantSlug, { limit: 100 });
      setCompanies(response.data);
    } catch (err) {
      console.error('Failed to load companies:', err);
    }
  }, [tenantSlug]);

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
  }, [fetchJobs, fetchCompanies]);

  const handleFilterChange = (key: keyof JobFilters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleCreateJob = async () => {
    if (!tenantSlug) return;

    setIsCreating(true);
    try {
      await jobService.create(tenantSlug, newJob);
      success('Job created', 'New job listing has been added successfully');
      setIsCreateModalOpen(false);
      setNewJob({
        companyId: '',
        title: '',
        description: '',
        location: '',
        country: '',
        jobType: 'FULL_TIME',
        requirements: [],
        salary: '',
        visaSponsorship: false,
        openPositions: 1,
      });
      fetchJobs();
    } catch (err) {
      showError('Failed to create job', getErrorMessage(err));
    } finally {
      setIsCreating(false);
    }
  };

  const handleRowClick = (job: Job) => {
    navigate(`/t/${tenantSlug}/jobs/${job.id}`);
  };

  const formatJobType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="jobs-page">
      <PageHeader
        title="Jobs"
        description="Manage job listings and track applications"
        actions={
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            + Post Job
          </Button>
        }
      />

      {/* Stats */}
      <div className="jobs-stats">
        <Card className="stat-card">
          <div className="stat-value">{meta.total}</div>
          <div className="stat-label">Total Jobs</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value">
            {jobs.filter((j) => j.status === 'OPEN').length}
          </div>
          <div className="stat-label">Open Positions</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value">
            {jobs.reduce((sum, j) => sum + (j._count?.applications || 0), 0)}
          </div>
          <div className="stat-label">Applications</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value">
            {jobs.filter((j) => j.visaSponsorship).length}
          </div>
          <div className="stat-label">Visa Sponsorship</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="jobs-filters">
        <div className="filters-row">
          <div className="filter-search">
            <Input
              placeholder="Search jobs..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <div className="filter-select">
            <Select
              options={STATUS_OPTIONS}
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            />
          </div>
          <div className="filter-select">
            <Select
              options={JOB_TYPE_OPTIONS}
              value={filters.jobType || ''}
              onChange={(e) => handleFilterChange('jobType', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Jobs Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="jobs-loading">
            <LoadingSpinner size="lg" />
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={<NoDataIcon />}
            title="No jobs found"
            description="Post your first job listing"
            action={{
              label: 'Post Job',
              onClick: () => setIsCreateModalOpen(true),
            }}
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Posted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow
                    key={job.id}
                    clickable
                    onClick={() => handleRowClick(job)}
                  >
                    <TableCell>
                      <div className="job-title-cell">
                        <span className="job-title">{job.title}</span>
                        {job.visaSponsorship && (
                          <Badge variant="primary" size="sm">Visa</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="job-company">
                        <Avatar name={job.company?.name || ''} src={job.company?.logoUrl} size="xs" />
                        <span>{job.company?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="job-location">{job.location}, {job.country}</span>
                    </TableCell>
                    <TableCell>
                      <span className="job-type">{formatJobType(job.jobType)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[job.status] || 'default'} size="sm">
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="application-count">
                        {job._count?.applications || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(job.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="jobs-pagination">
              <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </Card>

      {/* Create Job Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Post New Job"
        description="Create a new job listing"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateJob} isLoading={isCreating}>
              Post Job
            </Button>
          </>
        }
      >
        <div className="create-job-form">
          <Select
            label="Company"
            options={[
              { value: '', label: 'Select a company' },
              ...companies.map((c) => ({ value: c.id, label: c.name })),
            ]}
            value={newJob.companyId}
            onChange={(e) => setNewJob((prev) => ({ ...prev, companyId: e.target.value }))}
            required
          />
          <Input
            label="Job Title"
            value={newJob.title}
            onChange={(e) => setNewJob((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
          <div className="form-row">
            <Input
              label="Location"
              value={newJob.location}
              onChange={(e) => setNewJob((prev) => ({ ...prev, location: e.target.value }))}
              required
            />
            <Input
              label="Country"
              value={newJob.country}
              onChange={(e) => setNewJob((prev) => ({ ...prev, country: e.target.value }))}
              required
            />
          </div>
          <div className="form-row">
            <Select
              label="Job Type"
              options={JOB_TYPE_OPTIONS.slice(1)}
              value={newJob.jobType}
              onChange={(e) => setNewJob((prev) => ({ ...prev, jobType: e.target.value }))}
              required
            />
            <Input
              label="Salary Range"
              value={newJob.salary || ''}
              onChange={(e) => setNewJob((prev) => ({ ...prev, salary: e.target.value }))}
              placeholder="e.g., $50,000 - $70,000"
            />
          </div>
          <Input
            label="Description"
            value={newJob.description}
            onChange={(e) => setNewJob((prev) => ({ ...prev, description: e.target.value }))}
            required
          />
          <div className="form-checkbox">
            <label>
              <input
                type="checkbox"
                checked={newJob.visaSponsorship}
                onChange={(e) => setNewJob((prev) => ({ ...prev, visaSponsorship: e.target.checked }))}
              />
              <span>Visa Sponsorship Available</span>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
