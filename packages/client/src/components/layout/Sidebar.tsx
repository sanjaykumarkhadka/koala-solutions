import { NavLink, useParams } from 'react-router-dom';
import './Sidebar.css';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

interface SidebarProps {
  userRole: string;
  tenantName?: string;
  tenantLogo?: string;
}

// Icons as components
const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const LeadsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const CasesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const JobsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const CandidatesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const CompaniesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const MessagesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const TeamIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

// Navigation items for staff (Agent, Manager, Admin)
const staffNavItems: NavItem[] = [
  { label: 'Dashboard', path: 'dashboard', icon: <DashboardIcon /> },
  { label: 'Leads', path: 'leads', icon: <LeadsIcon /> },
  { label: 'Cases', path: 'cases', icon: <CasesIcon /> },
  { label: 'Jobs', path: 'jobs', icon: <JobsIcon /> },
  { label: 'Candidates', path: 'candidates', icon: <CandidatesIcon /> },
  { label: 'Companies', path: 'companies', icon: <CompaniesIcon /> },
  { label: 'Messages', path: 'messages', icon: <MessagesIcon /> },
];

const adminNavItems: NavItem[] = [
  { label: 'Team', path: 'admin/team', icon: <TeamIcon />, roles: ['ADMIN'] },
  { label: 'Settings', path: 'admin/settings', icon: <SettingsIcon />, roles: ['ADMIN'] },
];

// Navigation items for company portal
const companyNavItems: NavItem[] = [
  { label: 'Dashboard', path: 'company/dashboard', icon: <DashboardIcon /> },
  { label: 'Jobs', path: 'company/jobs', icon: <JobsIcon /> },
  { label: 'Applications', path: 'company/applications', icon: <CandidatesIcon /> },
  { label: 'Messages', path: 'company/messages', icon: <MessagesIcon /> },
  { label: 'Profile', path: 'company/profile', icon: <SettingsIcon /> },
];

// Navigation items for applicant portal
const applicantNavItems: NavItem[] = [
  { label: 'Dashboard', path: 'portal/dashboard', icon: <DashboardIcon /> },
  { label: 'My Case', path: 'portal/case', icon: <CasesIcon /> },
  { label: 'My Documents', path: 'portal/documents', icon: <CasesIcon /> },
  { label: 'Job Search', path: 'portal/jobs', icon: <JobsIcon /> },
  { label: 'Applications', path: 'portal/applications', icon: <CandidatesIcon /> },
  { label: 'Messages', path: 'portal/messages', icon: <MessagesIcon /> },
];

function getNavItems(role: string): NavItem[] {
  switch (role) {
    case 'COMPANY':
      return companyNavItems;
    case 'APPLICANT':
      return applicantNavItems;
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return [...staffNavItems, ...adminNavItems];
    default:
      return staffNavItems;
  }
}

export function Sidebar({ userRole, tenantName, tenantLogo }: SidebarProps) {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const basePath = `/t/${tenantSlug}`;
  const navItems = getNavItems(userRole);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        {tenantLogo ? (
          <img src={tenantLogo} alt={tenantName} className="sidebar-logo" />
        ) : (
          <div className="sidebar-logo-placeholder">
            {tenantName?.charAt(0) || 'K'}
          </div>
        )}
        <span className="sidebar-title">{tenantName || 'Koala'}</span>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-nav-list">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={`${basePath}/${item.path}`}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                <span className="sidebar-nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-version">v1.0.0</div>
      </div>
    </aside>
  );
}
