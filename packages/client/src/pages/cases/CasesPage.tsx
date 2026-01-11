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
import { caseService, Case, CaseFilters, CreateCaseInput } from '@/services/case.service';
import { getErrorMessage } from '@/services/api';
import './CasesPage.css';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'DOCUMENTS_REQUIRED', label: 'Documents Required' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'COMPLETED', label: 'Completed' },
];

const VISA_TYPE_OPTIONS = [
  { value: '', label: 'All Visa Types' },
  { value: 'WORK', label: 'Work Visa' },
  { value: 'STUDENT', label: 'Student Visa' },
  { value: 'FAMILY', label: 'Family Visa' },
  { value: 'TOURIST', label: 'Tourist Visa' },
  { value: 'BUSINESS', label: 'Business Visa' },
  { value: 'PERMANENT_RESIDENCE', label: 'Permanent Residence' },
  { value: 'CITIZENSHIP', label: 'Citizenship' },
  { value: 'OTHER', label: 'Other' },
];

const statusColors: Record<string, 'info' | 'primary' | 'warning' | 'success' | 'error' | 'default'> = {
  DRAFT: 'default',
  SUBMITTED: 'info',
  IN_REVIEW: 'primary',
  DOCUMENTS_REQUIRED: 'warning',
  PROCESSING: 'primary',
  APPROVED: 'success',
  REJECTED: 'error',
  COMPLETED: 'success',
};

export function CasesPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState<CaseFilters>({
    page: 1,
    limit: 20,
    status: '',
    visaType: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCase, setNewCase] = useState<CreateCaseInput>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    visaType: 'WORK',
    nationality: '',
    destinationCountry: '',
    notes: '',
  });

  const fetchCases = useCallback(async () => {
    if (!tenantSlug) return;

    setIsLoading(true);
    try {
      const response = await caseService.list(tenantSlug, filters);
      setCases(response.data);
      setMeta({
        page: response.meta.page,
        totalPages: response.meta.totalPages,
        total: response.meta.total,
      });
    } catch (err) {
      showError('Failed to load cases', getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [tenantSlug, filters, showError]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleFilterChange = (key: keyof CaseFilters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleCreateCase = async () => {
    if (!tenantSlug) return;

    setIsCreating(true);
    try {
      await caseService.create(tenantSlug, newCase);
      success('Case created', 'New case has been added successfully');
      setIsCreateModalOpen(false);
      setNewCase({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        visaType: 'WORK',
        nationality: '',
        destinationCountry: '',
        notes: '',
      });
      fetchCases();
    } catch (err) {
      showError('Failed to create case', getErrorMessage(err));
    } finally {
      setIsCreating(false);
    }
  };

  const handleRowClick = (caseData: Case) => {
    navigate(`/t/${tenantSlug}/cases/${caseData.id}`);
  };

  const formatVisaType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="cases-page">
      <PageHeader
        title="Cases"
        description="Manage visa applications and track case progress"
        actions={
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            + New Case
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="cases-stats">
        <Card className="stat-card">
          <div className="stat-value">{meta.total}</div>
          <div className="stat-label">Total Cases</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value">
            {cases.filter((c) => c.status === 'IN_REVIEW' || c.status === 'PROCESSING').length}
          </div>
          <div className="stat-label">In Progress</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value">
            {cases.filter((c) => c.status === 'DOCUMENTS_REQUIRED').length}
          </div>
          <div className="stat-label">Needs Documents</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value">
            {cases.filter((c) => c.status === 'APPROVED' || c.status === 'COMPLETED').length}
          </div>
          <div className="stat-label">Completed</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="cases-filters">
        <div className="filters-row">
          <div className="filter-search">
            <Input
              placeholder="Search cases..."
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
              options={VISA_TYPE_OPTIONS}
              value={filters.visaType || ''}
              onChange={(e) => handleFilterChange('visaType', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Cases Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="cases-loading">
            <LoadingSpinner size="lg" />
          </div>
        ) : cases.length === 0 ? (
          <EmptyState
            icon={<NoDataIcon />}
            title="No cases found"
            description="Get started by creating your first case"
            action={{
              label: 'New Case',
              onClick: () => setIsCreateModalOpen(true),
            }}
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case #</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Visa Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((caseData) => (
                  <TableRow
                    key={caseData.id}
                    clickable
                    onClick={() => handleRowClick(caseData)}
                  >
                    <TableCell>
                      <span className="case-number">{caseData.caseNumber}</span>
                    </TableCell>
                    <TableCell>
                      <div className="case-applicant">
                        <Avatar
                          name={`${caseData.firstName} ${caseData.lastName}`}
                          size="sm"
                        />
                        <div className="applicant-info">
                          <span className="applicant-name">
                            {caseData.firstName} {caseData.lastName}
                          </span>
                          <span className="applicant-email">{caseData.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="visa-type">{formatVisaType(caseData.visaType)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[caseData.status] || 'default'} size="sm">
                        {caseData.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {caseData.assignedTo ? (
                        <div className="case-assigned">
                          <Avatar
                            name={`${caseData.assignedTo.firstName} ${caseData.assignedTo.lastName}`}
                            src={caseData.assignedTo.avatarUrl}
                            size="xs"
                          />
                          <span>
                            {caseData.assignedTo.firstName} {caseData.assignedTo.lastName}
                          </span>
                        </div>
                      ) : (
                        <span className="case-unassigned">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="document-count">
                        {caseData._count?.documents || 0} docs
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(caseData.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="cases-pagination">
              <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </Card>

      {/* Create Case Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Case"
        description="Enter the applicant details and visa information"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateCase} isLoading={isCreating}>
              Create Case
            </Button>
          </>
        }
      >
        <div className="create-case-form">
          <div className="form-row">
            <Input
              label="First Name"
              value={newCase.firstName}
              onChange={(e) => setNewCase((prev) => ({ ...prev, firstName: e.target.value }))}
              required
            />
            <Input
              label="Last Name"
              value={newCase.lastName}
              onChange={(e) => setNewCase((prev) => ({ ...prev, lastName: e.target.value }))}
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={newCase.email}
            onChange={(e) => setNewCase((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <Input
            label="Phone"
            value={newCase.phone || ''}
            onChange={(e) => setNewCase((prev) => ({ ...prev, phone: e.target.value }))}
          />
          <Select
            label="Visa Type"
            options={VISA_TYPE_OPTIONS.slice(1)}
            value={newCase.visaType}
            onChange={(e) => setNewCase((prev) => ({ ...prev, visaType: e.target.value }))}
            required
          />
          <div className="form-row">
            <Input
              label="Nationality"
              value={newCase.nationality || ''}
              onChange={(e) => setNewCase((prev) => ({ ...prev, nationality: e.target.value }))}
            />
            <Input
              label="Destination Country"
              value={newCase.destinationCountry || ''}
              onChange={(e) => setNewCase((prev) => ({ ...prev, destinationCountry: e.target.value }))}
            />
          </div>
          <Input
            label="Notes"
            value={newCase.notes || ''}
            onChange={(e) => setNewCase((prev) => ({ ...prev, notes: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
}
