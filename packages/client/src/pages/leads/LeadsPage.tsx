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
import { leadService, Lead, LeadFilters, CreateLeadInput } from '@/services/lead.service';
import { getErrorMessage } from '@/services/api';
import './LeadsPage.css';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'PROPOSAL', label: 'Proposal' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' },
];

const SOURCE_OPTIONS = [
  { value: '', label: 'All Sources' },
  { value: 'WEBSITE', label: 'Website' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'SOCIAL_MEDIA', label: 'Social Media' },
  { value: 'WALK_IN', label: 'Walk In' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'OTHER', label: 'Other' },
];

const statusColors: Record<string, 'info' | 'primary' | 'warning' | 'success' | 'error' | 'default'> = {
  NEW: 'info',
  CONTACTED: 'primary',
  QUALIFIED: 'primary',
  PROPOSAL: 'warning',
  NEGOTIATION: 'warning',
  WON: 'success',
  LOST: 'error',
};

export function LeadsPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState<LeadFilters>({
    page: 1,
    limit: 20,
    status: '',
    source: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newLead, setNewLead] = useState<CreateLeadInput>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    source: 'OTHER',
    notes: '',
  });

  const fetchLeads = useCallback(async () => {
    if (!tenantSlug) return;

    setIsLoading(true);
    try {
      const response = await leadService.list(tenantSlug, filters);
      setLeads(response.data);
      setMeta({
        page: response.meta.page,
        totalPages: response.meta.totalPages,
        total: response.meta.total,
      });
    } catch (err) {
      showError('Failed to load leads', getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [tenantSlug, filters, showError]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleFilterChange = (key: keyof LeadFilters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleCreateLead = async () => {
    if (!tenantSlug) return;

    setIsCreating(true);
    try {
      await leadService.create(tenantSlug, newLead);
      success('Lead created', 'New lead has been added successfully');
      setIsCreateModalOpen(false);
      setNewLead({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        source: 'OTHER',
        notes: '',
      });
      fetchLeads();
    } catch (err) {
      showError('Failed to create lead', getErrorMessage(err));
    } finally {
      setIsCreating(false);
    }
  };

  const handleRowClick = (lead: Lead) => {
    navigate(`/t/${tenantSlug}/leads/${lead.id}`);
  };

  return (
    <div className="leads-page">
      <PageHeader
        title="Leads"
        description="Manage your sales pipeline and track potential clients"
        actions={
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            + Add Lead
          </Button>
        }
      />

      {/* Filters */}
      <Card className="leads-filters">
        <div className="filters-row">
          <div className="filter-search">
            <Input
              placeholder="Search leads..."
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
              options={SOURCE_OPTIONS}
              value={filters.source || ''}
              onChange={(e) => handleFilterChange('source', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Leads Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="leads-loading">
            <LoadingSpinner size="lg" />
          </div>
        ) : leads.length === 0 ? (
          <EmptyState
            icon={<NoDataIcon />}
            title="No leads found"
            description="Get started by adding your first lead"
            action={{
              label: 'Add Lead',
              onClick: () => setIsCreateModalOpen(true),
            }}
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    clickable
                    onClick={() => handleRowClick(lead)}
                  >
                    <TableCell>
                      <div className="lead-name">
                        {lead.firstName} {lead.lastName}
                      </div>
                    </TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>
                      <span className="lead-source">{lead.source.replace(/_/g, ' ')}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[lead.status] || 'default'} size="sm">
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lead.assignedTo ? (
                        <div className="lead-assigned">
                          <Avatar
                            name={`${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`}
                            src={lead.assignedTo.avatarUrl}
                            size="xs"
                          />
                          <span>
                            {lead.assignedTo.firstName} {lead.assignedTo.lastName}
                          </span>
                        </div>
                      ) : (
                        <span className="lead-unassigned">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="leads-pagination">
              <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </Card>

      {/* Create Lead Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Lead"
        description="Enter the details for the new lead"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateLead} isLoading={isCreating}>
              Create Lead
            </Button>
          </>
        }
      >
        <div className="create-lead-form">
          <div className="form-row">
            <Input
              label="First Name"
              value={newLead.firstName}
              onChange={(e) => setNewLead((prev) => ({ ...prev, firstName: e.target.value }))}
              required
            />
            <Input
              label="Last Name"
              value={newLead.lastName}
              onChange={(e) => setNewLead((prev) => ({ ...prev, lastName: e.target.value }))}
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={newLead.email}
            onChange={(e) => setNewLead((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <Input
            label="Phone"
            value={newLead.phone || ''}
            onChange={(e) => setNewLead((prev) => ({ ...prev, phone: e.target.value }))}
          />
          <Select
            label="Source"
            options={SOURCE_OPTIONS.slice(1)}
            value={newLead.source || 'OTHER'}
            onChange={(e) => setNewLead((prev) => ({ ...prev, source: e.target.value }))}
          />
          <Input
            label="Notes"
            value={newLead.notes || ''}
            onChange={(e) => setNewLead((prev) => ({ ...prev, notes: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
}
