import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { useToast } from '@/contexts/ToastContext';
import './AuthPages.css';

interface TenantOption {
  id: string;
  name: string;
  slug: string;
}

export function LoginPage() {
  const { login, getTenantsForEmail } = useAuth();
  const { error: showError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingTenants, setIsCheckingTenants] = useState(false);
  const [showTenantSelector, setShowTenantSelector] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Check for tenants when email is entered
  useEffect(() => {
    const checkTenants = async () => {
      if (!email || !email.includes('@')) {
        setTenants([]);
        setShowTenantSelector(false);
        return;
      }

      setIsCheckingTenants(true);
      try {
        const result = await getTenantsForEmail(email);
        setTenants(result);
        setShowTenantSelector(result.length > 1);
        if (result.length === 1) {
          setTenantSlug(result[0].slug);
        } else if (result.length > 1) {
          setTenantSlug('');
        }
      } catch {
        setTenants([]);
      } finally {
        setIsCheckingTenants(false);
      }
    };

    const debounceTimer = setTimeout(checkTenants, 500);
    return () => clearTimeout(debounceTimer);
  }, [email, getTenantsForEmail]);

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!email.includes('@')) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    try {
      await login({
        email,
        password,
        tenantSlug: tenantSlug || undefined,
      });
    } catch (err) {
      showError('Login failed', err instanceof Error ? err.message : 'Please check your credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-logo-text">K</span>
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <Input
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
              autoFocus
            />
          </div>

          {showTenantSelector && tenants.length > 1 && (
            <div className="form-group">
              <Select
                label="Organization"
                placeholder="Select your organization"
                value={tenantSlug}
                onChange={(e) => setTenantSlug(e.target.value)}
                options={tenants.map((t) => ({ value: t.slug, label: t.name }))}
              />
            </div>
          )}

          <div className="form-group">
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="current-password"
            />
          </div>

          <div className="auth-forgot">
            <Link to="/forgot-password" className="auth-link">
              Forgot your password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading || isCheckingTenants}
            className="auth-submit"
          >
            Sign in
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/onboarding" className="auth-link">
              Create your agency
            </Link>
          </p>
        </div>
      </div>

      <div className="auth-bg">
        <div className="auth-bg-gradient" />
        <div className="auth-bg-content">
          <h2>Koala Migration Platform</h2>
          <p>Streamline your migration agency operations with our all-in-one SaaS solution.</p>
        </div>
      </div>
    </div>
  );
}
