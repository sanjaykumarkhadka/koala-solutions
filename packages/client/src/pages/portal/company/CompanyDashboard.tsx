import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Avatar } from '@/components/common/Avatar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState, NoDataIcon } from '@/components/common/EmptyState';
import { useToast } from '@/contexts/ToastContext';
import { api, getErrorMessage } from '@/services/api';
import './CompanyDashboard.css';

interface DashboardData {
  stats: {
    totalJobs: number;
    openJobs: number;
    totalApplications: number;
  };
  recentJobs: Array<{
    id: string;
    title: string;
    status: string;
    _count: { applications: number };
    createdAt: string;
  }>;
  recentApplications: Array<{
    id: string;
    status: string;
    appliedAt: string;
    job: { id: string; title: string };
    candidate: {
      user: {
        firstName: string;
        lastName: string;
        email: string;
        avatarUrl?: string;
      };
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

export function CompanyDashboard() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const { error: showError } = useToast();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    if (!tenantSlug) return;

    setIsLoading(true);
    try {
      const response = await api.get(`/t/${tenantSlug}/portal/company/dashboard`);
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
    <div className="company-dashboard">
      <PageHeader
        title="Company Dashboard"
        description="Manage your job listings and view applications"
      />

      {/* Stats */}
      <div className="dashboard-stats">
        <Card className="stat-card">
          <div className="stat-value">{dashboard.stats.totalJobs}</div>
          <div className="stat-label">Total Jobs</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value">{dashboard.stats.openJobs}</div>
          <div className="stat-label">Open Positions</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value">{dashboard.stats.totalApplications}</div>
          <div className="stat-label">Total Applications</div>
        </Card>
      </div>

      <div className="dashboard-grid">
        {/* Recent Jobs */}
        <Card className="dashboard-card">
          <h3>Your Job Listings</h3>
          {dashboard.recentJobs.length === 0 ? (
            <p className="empty-text">No jobs posted yet</p>
          ) : (
            <ul className="job-list">
              {dashboard.recentJobs.map((job) => (
                <li key={job.id} className="job-item">
                  <div className="job-info">
                    <span className="job-title">{job.title}</span>
                    <Badge variant={job.status === 'OPEN' ? 'success' : 'default'} size="sm">
                      {job.status}
                    </Badge>
                  </div>
                  <span className="job-applications">{job._count.applications} applications</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent Applications */}
        <Card className="dashboard-card">
          <h3>Recent Applications</h3>
          {dashboard.recentApplications.length === 0 ? (
            <p className="empty-text">No applications yet</p>
          ) : (
            <ul className="application-list">
              {dashboard.recentApplications.map((app) => (
                <li key={app.id} className="application-item">
                  <Avatar
                    name={`${app.candidate.user.firstName} ${app.candidate.user.lastName}`}
                    src={app.candidate.user.avatarUrl}
                    size="sm"
                  />
                  <div className="application-info">
                    <span className="applicant-name">
                      {app.candidate.user.firstName} {app.candidate.user.lastName}
                    </span>
                    <span className="application-job">Applied for {app.job.title}</span>
                  </div>
                  <Badge variant={applicationStatusColors[app.status] || 'default'} size="sm">
                    {app.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
