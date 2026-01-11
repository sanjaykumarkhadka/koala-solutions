import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
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
import { useToast } from '@/contexts/ToastContext';
import { api, getErrorMessage } from '@/services/api';
import './CandidatesPage.css';

interface Candidate {
  id: string;
  userId: string;
  skills: string[];
  experience: number;
  education?: string;
  currentLocation?: string;
  preferredLocations: string[];
  expectedSalary?: string;
  status: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
  _count?: {
    applications: number;
  };
  createdAt: string;
}

interface CandidateFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'PLACED', label: 'Placed' },
  { value: 'BLACKLISTED', label: 'Blacklisted' },
];

const statusColors: Record<string, 'info' | 'primary' | 'warning' | 'success' | 'error' | 'default'> = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  PLACED: 'info',
  BLACKLISTED: 'error',
};

export function CandidatesPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const { error: showError } = useToast();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState<CandidateFilters>({
    page: 1,
    limit: 20,
    status: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const fetchCandidates = useCallback(async () => {
    if (!tenantSlug) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
      const response = await api.get(`/t/${tenantSlug}/candidates?${params.toString()}`);
      setCandidates(response.data.data);
      setMeta({
        page: response.data.meta.page,
        totalPages: response.data.meta.totalPages,
        total: response.data.meta.total,
      });
    } catch (err) {
      showError('Failed to load candidates', getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [tenantSlug, filters, showError]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleFilterChange = (key: keyof CandidateFilters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div className="candidates-page">
      <PageHeader
        title="Candidates"
        description="View and manage job candidates"
      />

      {/* Stats */}
      <div className="candidates-stats">
        <Card className="stat-card">
          <div className="stat-value">{meta.total}</div>
          <div className="stat-label">Total Candidates</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value">
            {candidates.filter((c) => c.status === 'ACTIVE').length}
          </div>
          <div className="stat-label">Active</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value">
            {candidates.filter((c) => c.status === 'PLACED').length}
          </div>
          <div className="stat-label">Placed</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="candidates-filters">
        <div className="filters-row">
          <div className="filter-search">
            <Input
              placeholder="Search candidates..."
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
        </div>
      </Card>

      {/* Candidates Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="candidates-loading">
            <LoadingSpinner size="lg" />
          </div>
        ) : candidates.length === 0 ? (
          <EmptyState
            icon={<NoDataIcon />}
            title="No candidates found"
            description="Candidates will appear here when users apply for jobs"
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div className="candidate-info">
                        <Avatar
                          name={`${candidate.user.firstName} ${candidate.user.lastName}`}
                          src={candidate.user.avatarUrl}
                          size="sm"
                        />
                        <div>
                          <span className="candidate-name">
                            {candidate.user.firstName} {candidate.user.lastName}
                          </span>
                          <span className="candidate-email">{candidate.user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="candidate-skills">
                        {candidate.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="default" size="sm">
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills.length > 3 && (
                          <span className="more-skills">+{candidate.skills.length - 3}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="candidate-experience">
                        {candidate.experience} years
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="candidate-location">
                        {candidate.currentLocation || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[candidate.status] || 'default'} size="sm">
                        {candidate.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="application-count">
                        {candidate._count?.applications || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(candidate.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="candidates-pagination">
              <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
