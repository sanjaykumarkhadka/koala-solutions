import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardBody } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import './DashboardPage.css';

export function DashboardPage() {
  const { user, tenant } = useAuth();

  const stats = [
    { label: 'Total Leads', value: '124', change: '+12%', changeType: 'positive' },
    { label: 'Active Cases', value: '45', change: '+5%', changeType: 'positive' },
    { label: 'Open Jobs', value: '28', change: '-2%', changeType: 'negative' },
    { label: 'Team Members', value: '12', change: '0%', changeType: 'neutral' },
  ];

  const recentLeads = [
    { id: 1, name: 'John Smith', email: 'john@example.com', status: 'NEW', source: 'Website' },
    { id: 2, name: 'Maria Garcia', email: 'maria@example.com', status: 'CONTACTED', source: 'Referral' },
    { id: 3, name: 'David Kim', email: 'david@example.com', status: 'QUALIFIED', source: 'Social Media' },
  ];

  const recentCases = [
    { id: 1, applicant: 'Sarah Johnson', visaType: 'Work Visa', status: 'UNDER_REVIEW' },
    { id: 2, applicant: 'Michael Brown', visaType: 'Student Visa', status: 'DOCUMENTS_REQUIRED' },
    { id: 3, applicant: 'Emily Davis', visaType: 'Family Visa', status: 'SUBMITTED' },
  ];

  return (
    <div className="dashboard">
      <PageHeader
        title={`Welcome back, ${user?.firstName}!`}
        description={`Here's what's happening at ${tenant?.name} today.`}
      />

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <Card key={stat.label} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            <div className={`stat-change stat-change-${stat.changeType}`}>
              {stat.change} from last month
            </div>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Leads */}
        <Card>
          <CardHeader
            title="Recent Leads"
            description="Latest inquiries from potential clients"
            action={
              <a href="leads" className="card-link">
                View all
              </a>
            }
          />
          <CardBody>
            <div className="dashboard-list">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="dashboard-list-item">
                  <div className="list-item-info">
                    <div className="list-item-name">{lead.name}</div>
                    <div className="list-item-meta">{lead.email}</div>
                  </div>
                  <div className="list-item-right">
                    <Badge
                      variant={
                        lead.status === 'NEW'
                          ? 'info'
                          : lead.status === 'CONTACTED'
                          ? 'primary'
                          : 'success'
                      }
                      size="sm"
                    >
                      {lead.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Recent Cases */}
        <Card>
          <CardHeader
            title="Active Cases"
            description="Cases requiring attention"
            action={
              <a href="cases" className="card-link">
                View all
              </a>
            }
          />
          <CardBody>
            <div className="dashboard-list">
              {recentCases.map((caseItem) => (
                <div key={caseItem.id} className="dashboard-list-item">
                  <div className="list-item-info">
                    <div className="list-item-name">{caseItem.applicant}</div>
                    <div className="list-item-meta">{caseItem.visaType}</div>
                  </div>
                  <div className="list-item-right">
                    <Badge
                      variant={
                        caseItem.status === 'UNDER_REVIEW'
                          ? 'primary'
                          : caseItem.status === 'DOCUMENTS_REQUIRED'
                          ? 'warning'
                          : 'info'
                      }
                      size="sm"
                    >
                      {caseItem.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
