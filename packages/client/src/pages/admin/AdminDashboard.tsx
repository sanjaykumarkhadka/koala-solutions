import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Avatar } from '@/components/common/Avatar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/contexts/ToastContext';
import { api, getErrorMessage } from '@/services/api';
import './AdminDashboard.css';

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalLeads: number;
    totalCases: number;
    totalJobs: number;
    leadsThisMonth: number;
    casesThisMonth: number;
  };
  leadsByStatus: Record<string, number>;
  casesByStatus: Record<string, number>;
  jobsByStatus: Record<string, number>;
  recentActivity: Array<{
    id: string;
    title: string;
    type: string;
    createdAt: string;
    createdBy: {
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    };
    case: {
      caseNumber: string;
    };
  }>;
}

export function AdminDashboard() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const { error: showError } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!tenantSlug) return;

    setIsLoading(true);
    try {
      const response = await api.get(`/t/${tenantSlug}/admin/dashboard`);
      setStats(response.data.data);
    } catch (err) {
      showError('Failed to load dashboard', getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [tenantSlug, showError]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="admin-loading">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="admin-dashboard">
      <PageHeader
        title="Admin Dashboard"
        description="Overview of your agency's performance"
      />

      {/* Overview Stats */}
      <div className="stats-grid">
        <Card className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.overview.totalUsers}</div>
            <div className="stat-label">Team Members</div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.overview.totalLeads}</div>
            <div className="stat-label">Total Leads</div>
            <div className="stat-change">+{stats.overview.leadsThisMonth} this month</div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-content">
            <div className="stat-value">{stats.overview.totalCases}</div>
            <div className="stat-label">Active Cases</div>
            <div className="stat-change">+{stats.overview.casesThisMonth} this month</div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <div className="stat-value">{stats.overview.totalJobs}</div>
            <div className="stat-label">Job Listings</div>
          </div>
        </Card>
      </div>

      <div className="dashboard-content">
        {/* Status Breakdown */}
        <div className="status-cards">
          <Card className="status-card">
            <h3>Leads by Status</h3>
            <div className="status-list">
              {Object.entries(stats.leadsByStatus).map(([status, count]) => (
                <div key={status} className="status-item">
                  <span className="status-name">{status.replace(/_/g, ' ')}</span>
                  <Badge variant="default" size="sm">{count}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="status-card">
            <h3>Cases by Status</h3>
            <div className="status-list">
              {Object.entries(stats.casesByStatus).map(([status, count]) => (
                <div key={status} className="status-item">
                  <span className="status-name">{status.replace(/_/g, ' ')}</span>
                  <Badge variant="default" size="sm">{count}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="activity-card">
          <h3>Recent Activity</h3>
          {stats.recentActivity.length === 0 ? (
            <p className="empty-text">No recent activity</p>
          ) : (
            <ul className="activity-list">
              {stats.recentActivity.map((event) => (
                <li key={event.id} className="activity-item">
                  <Avatar
                    name={`${event.createdBy.firstName} ${event.createdBy.lastName}`}
                    src={event.createdBy.avatarUrl}
                    size="sm"
                  />
                  <div className="activity-content">
                    <span className="activity-title">{event.title}</span>
                    <span className="activity-meta">
                      {event.createdBy.firstName} {event.createdBy.lastName} • {event.case.caseNumber}
                    </span>
                  </div>
                  <span className="activity-time">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
