import { Routes, Route, Link } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { OnboardingWizard } from '@/pages/onboarding/OnboardingWizard';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { LeadsPage } from '@/pages/leads/LeadsPage';
import { CasesPage } from '@/pages/cases/CasesPage';
import { JobsPage } from '@/pages/jobs/JobsPage';
import { CandidatesPage } from '@/pages/candidates/CandidatesPage';
import { CompaniesPage } from '@/pages/companies/CompaniesPage';
import { CompanyDashboard } from '@/pages/portal/company/CompanyDashboard';
import { ApplicantDashboard } from '@/pages/portal/applicant/ApplicantDashboard';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { TeamManagement } from '@/pages/admin/TeamManagement';

// Landing Page
function LandingPage() {
  return (
    <div className="landing">
      <h1>Koala Migration Platform</h1>
      <p>Multi-tenant SaaS for migration agencies</p>
      <div className="actions">
        <Link to="/login" className="btn btn-primary">Login</Link>
        <Link to="/onboarding" className="btn btn-secondary">Create Agency</Link>
      </div>
    </div>
  );
}

// 404 Page
function NotFoundPage() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>Page not found</p>
      <Link to="/">Go home</Link>
    </div>
  );
}

// Placeholder pages for modules (to be implemented)

function MessagesPage() {
  return <div className="page-placeholder"><h1>Messages</h1><p>Messaging coming soon...</p></div>;
}

function AdminSettingsPage() {
  return <div className="page-placeholder"><h1>Settings</h1><p>Settings coming soon...</p></div>;
}


export function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding" element={<OnboardingWizard />} />

      {/* Tenant-scoped routes (protected) */}
      <Route
        path="/t/:tenantSlug"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Staff Dashboard */}
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Core Modules */}
        <Route path="leads" element={<LeadsPage />} />
        <Route path="cases" element={<CasesPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="candidates" element={<CandidatesPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="messages" element={<MessagesPage />} />

        {/* Admin Routes */}
        <Route path="admin/dashboard" element={<AdminDashboard />} />
        <Route path="admin/team" element={<TeamManagement />} />
        <Route path="admin/settings" element={<AdminSettingsPage />} />

        {/* Company Portal */}
        <Route path="company/dashboard" element={<CompanyDashboard />} />

        {/* Applicant Portal */}
        <Route path="portal/dashboard" element={<ApplicantDashboard />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
