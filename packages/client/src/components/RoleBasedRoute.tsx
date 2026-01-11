import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingPage } from '@/components/common/LoadingSpinner';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  roles: string[];
  fallbackPath?: string;
}

export function RoleBasedRoute({ children, roles, fallbackPath }: RoleBasedRouteProps) {
  const { user, tenant, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingPage message="Checking permissions..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has one of the allowed roles
  const hasRequiredRole = roles.includes(user.role);

  if (!hasRequiredRole) {
    // Redirect to fallback or default dashboard
    const defaultPath = tenant ? `/t/${tenant.slug}/dashboard` : '/';
    return <Navigate to={fallbackPath || defaultPath} replace />;
  }

  return <>{children}</>;
}
