import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/hooks/useAuth';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import './AppLayout.css';

export function AppLayout() {
  const { user, tenant, isLoading, logout } = useAuth();

  if (isLoading) {
    return <LoadingPage message="Loading..." />;
  }

  if (!user || !tenant) {
    return <LoadingPage message="Redirecting..." />;
  }

  return (
    <div className="app-layout">
      <Sidebar
        userRole={user.role}
        tenantName={tenant.name}
        tenantLogo={tenant.settings?.logoUrl}
      />
      <div className="app-main">
        <Header
          user={{
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatarUrl: user.avatarUrl,
            role: user.role,
          }}
          onLogout={logout}
        />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
