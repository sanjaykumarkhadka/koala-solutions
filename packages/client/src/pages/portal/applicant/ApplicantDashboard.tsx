import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState, NoDataIcon } from '@/components/common/EmptyState';
import { useToast } from '@/contexts/ToastContext';
import { api, getErrorMessage } from '@/services/api';
import './ApplicantDashboard.css';

interface DashboardData {
  stats: {
    totalApplications: number;
    pendingApplications: number;
    hasVisaCase: boolean;
  };
  visaCase?: {
    id: string;
    caseNumber: string;
    status: string;
    visaType: string;
    assignedTo?: {
      firstName: string;
      lastName: string;
    };
    _count: { documents: number };
  };
  recentApplications: Array<{
    id: string;
    status: string;
    appliedAt: string;
    job: {
      id: string;
      title: string;
      company: {
        name: string;
        logoUrl?: string;
      };
    };
  }>;
  recommendedJobs: Array<{
    id: string;
    title: string;
    location: string;
    company: {
      name: string;
      logoUrl?: string;
    };
  }>;
}

const applicationStatusColors: Record<string, 'info' | 'primary' | 'warning' | 'success' | 'error' | 'default'> = {
  APPLIED: 'info',
  SCREENING: 'primary',
  INTERVIEW: 'warning',
  OFFER: 'primary',
  HIRED: 'success',
  REJECTED: 'error',
  WITHDRAWN: 'default',
};

const caseStatusColors: Record<string, 'info' | 'primary' | 'warning' | 'success' | 'error' | 'default'> = {
  DRAFT: 'default',
  SUBMITTED: 'info',
  IN_REVIEW: 'primary',
  DOCUMENTS_REQUIRED: 'warning',
  PROCESSING: 'primary',
  APPROVED: 'success',
  REJECTED: 'error',
  COMPLETED: 'success',
};

export function ApplicantDashboard() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const { error: showError } = useToast();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    if (!tenantSlug) return;

    setIsLoading(true);
    try {
      const response = await api.get(`/t/${tenantSlug}/portal/applicant/dashboard`);
      setDashboard(response.data.data);
    } catch (err) {
      showError('Failed to load dashboard', getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [tenantSlug, showError]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isLoading) {
    return (
      <div className="portal-loading">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <EmptyState
        icon={<NoDataIcon />}
        title="Unable to load dashboard"
        description="Please try again later"
      />
    );
  }

  return (
    <div className="applicant-dashboard">
      <PageHeader
        title="My Dashboard"
        description="Track your applications and visa case progress"
      />

      {/* Stats */}
      <div className="dashboard-stats">
        <Card className="stat-card">
          <div className="stat-value">{dashboard.stats.totalApplications}</div>
          <div className="stat-label">Total Applications</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value">{dashboard.stats.pendingApplications}</div>
          <div className="stat-label">Pending</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value">{dashboard.stats.hasVisaCase ? 'Active' : 'None'}</div>
          <div className="stat-label">Visa Case</div>
        </Card>
      </div>

      <div className="dashboard-grid">
        {/* Visa Case Status */}
        {dashboard.visaCase && (
          <Card className="dashboard-card visa-case-card">
            <h3>Your Visa Case</h3>
            <div className="visa-case-info">
              <div className="case-header">
                <span className="case-number">{dashboard.visaCase.caseNumber}</span>
                <Badge variant={caseStatusColors[dashboard.visaCase.status] || 'default'} size="sm">
                  {dashboard.visaCase.status.replace(/_/g, ' ')}
                </Badge>
              </div>
              <p className="case-type">{dashboard.visaCase.visaType.replace(/_/g, ' ')} Visa</p>
              {dashboard.visaCase.assignedTo && (
                <p className="case-agent">
                  Agent: {dashboard.visaCase.assignedTo.firstName} {dashboard.visaCase.assignedTo.lastName}
                </p>
              )}
              <p className="case-docs">{dashboard.visaCase._count.documents} documents uploaded</p>
              <Link to={`/t/${tenantSlug}/portal/case`}>
                <Button variant="secondary" size="sm">View Case Details</Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Recent Applications */}
        <Card className="dashboard-card">
          <h3>My Applications</h3>
          {dashboard.recentApplications.length === 0 ? (
            <p className="empty-text">No applications yet</p>
          ) : (
            <ul className="application-list">
              {dashboard.recentApplications.map((app) => (
                <li key={app.id} className="application-item">
                  <Avatar name={app.job.company.name} src={app.job.company.logoUrl} size="sm" />
                  <div className="application-info">
                    <span className="job-title">{app.job.title}</span>
                    <span className="company-name">{app.job.company.name}</span>
                  </div>
                  <Badge variant={applicationStatusColors[app.status] || 'default'} size="sm">
                    {app.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recommended Jobs */}
        <Card className="dashboard-card">
          <h3>Jobs With Visa Sponsorship</h3>
          {dashboard.recommendedJobs.length === 0 ? (
            <p className="empty-text">No recommended jobs at the moment</p>
          ) : (
            <ul className="job-list">
              {dashboard.recommendedJobs.map((job) => (
                <li key={job.id} className="job-item">
                  <Avatar name={job.company.name} src={job.company.logoUrl} size="sm" />
                  <div className="job-info">
                    <span className="job-title">{job.title}</span>
                    <span className="job-location">{job.company.name} - {job.location}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link to={`/t/${tenantSlug}/portal/jobs`}>
            <Button variant="secondary" size="sm" className="view-all-btn">View All Jobs</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
