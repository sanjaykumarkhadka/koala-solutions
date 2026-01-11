import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
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
import { companyService, Company, CompanyFilters, CreateCompanyInput } from '@/services/company.service';
import { getErrorMessage } from '@/services/api';
import './CompaniesPage.css';

export function CompaniesPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState<CompanyFilters>({
    page: 1,
    limit: 20,
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCompany, setNewCompany] = useState<CreateCompanyInput>({
    name: '',
    contactEmail: '',
    country: '',
    industry: '',
    website: '',
    contactPhone: '',
    address: '',
  });

  const fetchCompanies = useCallback(async () => {
    if (!tenantSlug) return;

    setIsLoading(true);
    try {
      const response = await companyService.list(tenantSlug, filters);
      setCompanies(response.data);
      setMeta({
        page: response.meta.page,
        totalPages: response.meta.totalPages,
        total: response.meta.total,
      });
    } catch (err) {
      showError('Failed to load companies', getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [tenantSlug, filters, showError]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleFilterChange = (key: keyof CompanyFilters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleCreateCompany = async () => {
    if (!tenantSlug) return;

    setIsCreating(true);
    try {
      await companyService.create(tenantSlug, newCompany);
      success('Company created', 'New company has been added successfully');
      setIsCreateModalOpen(false);
      setNewCompany({
        name: '',
        contactEmail: '',
        country: '',
        industry: '',
        website: '',
        contactPhone: '',
        address: '',
      });
      fetchCompanies();
    } catch (err) {
      showError('Failed to create company', getErrorMessage(err));
    } finally {
      setIsCreating(false);
    }
  };

  const handleRowClick = (company: Company) => {
    navigate(`/t/${tenantSlug}/companies/${company.id}`);
  };

  return (
    <div className="companies-page">
      <PageHeader
        title="Companies"
        description="Manage employer partners and their job listings"
        actions={
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            + Add Company
          </Button>
        }
      />

      {/* Stats */}
      <div className="companies-stats">
        <Card className="stat-card">
          <div className="stat-value">{meta.total}</div>
          <div className="stat-label">Total Companies</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value">
            {companies.reduce((sum, c) => sum + (c._count?.jobs || 0), 0)}
          </div>
          <div className="stat-label">Active Jobs</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="companies-filters">
        <div className="filters-row">
          <div className="filter-search">
            <Input
              placeholder="Search companies..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Companies Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="companies-loading">
            <LoadingSpinner size="lg" />
          </div>
        ) : companies.length === 0 ? (
          <EmptyState
            icon={<NoDataIcon />}
            title="No companies found"
            description="Add your first employer partner"
            action={{
              label: 'Add Company',
              onClick: () => setIsCreateModalOpen(true),
            }}
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Jobs</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow
                    key={company.id}
                    clickable
                    onClick={() => handleRowClick(company)}
                  >
                    <TableCell>
                      <div className="company-info">
                        <Avatar name={company.name} src={company.logoUrl} size="sm" />
                        <div>
                          <span className="company-name">{company.name}</span>
                          {company.website && (
                            <span className="company-website">{company.website}</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="company-industry">{company.industry || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" size="sm">{company.country}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="company-contact">{company.contactEmail}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="info" size="sm">
                        {company._count?.jobs || 0} jobs
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(company.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="companies-pagination">
              <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </Card>

      {/* Create Company Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Company"
        description="Enter the company details"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateCompany} isLoading={isCreating}>
              Add Company
            </Button>
          </>
        }
      >
        <div className="create-company-form">
          <Input
            label="Company Name"
            value={newCompany.name}
            onChange={(e) => setNewCompany((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <div className="form-row">
            <Input
              label="Industry"
              value={newCompany.industry || ''}
              onChange={(e) => setNewCompany((prev) => ({ ...prev, industry: e.target.value }))}
            />
            <Input
              label="Country"
              value={newCompany.country}
              onChange={(e) => setNewCompany((prev) => ({ ...prev, country: e.target.value }))}
              required
            />
          </div>
          <Input
            label="Contact Email"
            type="email"
            value={newCompany.contactEmail}
            onChange={(e) => setNewCompany((prev) => ({ ...prev, contactEmail: e.target.value }))}
            required
          />
          <Input
            label="Contact Phone"
            value={newCompany.contactPhone || ''}
            onChange={(e) => setNewCompany((prev) => ({ ...prev, contactPhone: e.target.value }))}
          />
          <Input
            label="Website"
            value={newCompany.website || ''}
            onChange={(e) => setNewCompany((prev) => ({ ...prev, website: e.target.value }))}
          />
          <Input
            label="Address"
            value={newCompany.address || ''}
            onChange={(e) => setNewCompany((prev) => ({ ...prev, address: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
}
