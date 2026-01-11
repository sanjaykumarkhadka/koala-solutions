import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api, getErrorMessage } from '@/services/api';

// Types
export interface User {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  avatarUrl?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  settings?: {
    logoUrl?: string;
    primaryColor?: string;
    timezone?: string;
    dateFormat?: string;
  };
}

export interface LoginInput {
  email: string;
  password: string;
  tenantSlug?: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantSlug: string;
}

export interface AuthContextValue {
  user: User | null;
  tenant: Tenant | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  getTenantsForEmail: (email: string) => Promise<{ id: string; name: string; slug: string }[]>;
}

// Context
export const AuthContext = createContext<AuthContextValue | null>(null);

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = Boolean(user);

  // Fetch current user on mount
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      const { user: userData, tenant: tenantData } = response.data.data;
      setUser(userData);
      setTenant(tenantData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setTenant(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Get tenants for email (for multi-tenant login)
  const getTenantsForEmail = useCallback(async (email: string) => {
    try {
      const response = await api.get('/auth/tenants', { params: { email } });
      return response.data.data || [];
    } catch {
      return [];
    }
  }, []);

  // Login
  const login = useCallback(
    async (credentials: LoginInput) => {
      try {
        const response = await api.post('/auth/login', credentials);
        const { accessToken, refreshToken, user: userData, tenant: tenantData } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        setUser(userData);
        setTenant(tenantData);

        // Redirect based on role
        const redirectPath = getDefaultRoute(userData.role, tenantData.slug);
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
        navigate(from || redirectPath);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    [navigate, location.state]
  );

  // Register
  const register = useCallback(
    async (data: RegisterInput) => {
      try {
        const response = await api.post('/auth/register', data);
        const { accessToken, refreshToken, user: userData, tenant: tenantData } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        setUser(userData);
        setTenant(tenantData);

        // Redirect to dashboard
        const redirectPath = getDefaultRoute(userData.role, tenantData.slug);
        navigate(redirectPath);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    [navigate]
  );

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setTenant(null);
    navigate('/login');
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        fetchUser,
        getTenantsForEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Helper function to get default route based on role
function getDefaultRoute(role: string, tenantSlug: string): string {
  const basePath = `/t/${tenantSlug}`;

  switch (role) {
    case 'SUPER_ADMIN':
      return '/admin/dashboard';
    case 'ADMIN':
    case 'MANAGER':
    case 'AGENT':
      return `${basePath}/dashboard`;
    case 'COMPANY':
      return `${basePath}/company/dashboard`;
    case 'APPLICANT':
      return `${basePath}/portal/dashboard`;
    default:
      return `${basePath}/dashboard`;
  }
}
