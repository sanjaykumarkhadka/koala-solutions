import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, getErrorMessage } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useToast } from '@/contexts/ToastContext';
import './OnboardingWizard.css';

interface FormData {
  agencyName: string;
  slug: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const STEPS = [
  { id: 'agency', title: 'Agency Details', description: 'Tell us about your agency' },
  { id: 'account', title: 'Your Account', description: 'Create your admin account' },
  { id: 'confirm', title: 'Confirm', description: 'Review and create' },
];

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { fetchUser } = useAuth();
  const { success, error: showError } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [formData, setFormData] = useState<FormData>({
    agencyName: '',
    slug: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));

    // Auto-generate slug from agency name
    if (field === 'agencyName') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      setFormData((prev) => ({ ...prev, slug }));
      setSlugAvailable(null);
    }

    if (field === 'slug') {
      setSlugAvailable(null);
    }
  };

  const checkSlugAvailability = async () => {
    if (!formData.slug || formData.slug.length < 3) return;

    setIsCheckingSlug(true);
    try {
      const response = await api.post('/onboarding/check-slug', { slug: formData.slug });
      setSlugAvailable(response.data.data.available);
      if (!response.data.data.available && response.data.data.suggestion) {
        setErrors((prev) => ({
          ...prev,
          slug: `Not available. Try: ${response.data.data.suggestion}`,
        }));
      }
    } catch {
      setSlugAvailable(null);
    } finally {
      setIsCheckingSlug(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 0) {
      if (!formData.agencyName || formData.agencyName.length < 2) {
        newErrors.agencyName = 'Agency name must be at least 2 characters';
      }
      if (!formData.slug || formData.slug.length < 3) {
        newErrors.slug = 'URL slug must be at least 3 characters';
      } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
        newErrors.slug = 'Only lowercase letters, numbers, and hyphens allowed';
      } else if (slugAvailable === false) {
        newErrors.slug = 'This URL is already taken';
      }
    }

    if (step === 1) {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.email || !formData.email.includes('@')) {
        newErrors.email = 'Valid email is required';
      }
      if (!formData.password || formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    if (currentStep === 0 && slugAvailable !== true) {
      await checkSlugAvailability();
      if (slugAvailable === false) return;
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/onboarding/create-agency', {
        agencyName: formData.agencyName,
        slug: formData.slug,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });

      const { accessToken, refreshToken, tenant } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      await fetchUser();
      success('Agency created!', 'Welcome to Koala Migration Platform');
      navigate(`/t/${tenant.slug}/dashboard`);
    } catch (err) {
      showError('Failed to create agency', getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-sidebar">
        <div className="onboarding-logo">
          <span className="onboarding-logo-text">K</span>
        </div>
        <h2 className="onboarding-sidebar-title">Create Your Agency</h2>
        <p className="onboarding-sidebar-subtitle">
          Set up your migration agency on our platform in just a few steps.
        </p>

        <div className="onboarding-steps">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`onboarding-step ${
                index === currentStep
                  ? 'active'
                  : index < currentStep
                  ? 'completed'
                  : ''
              }`}
            >
              <div className="onboarding-step-number">
                {index < currentStep ? (
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <div className="onboarding-step-content">
                <div className="onboarding-step-title">{step.title}</div>
                <div className="onboarding-step-description">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="onboarding-main">
        <div className="onboarding-form-container">
          {currentStep === 0 && (
            <div className="onboarding-form-step">
              <h3 className="onboarding-form-title">Agency Details</h3>
              <p className="onboarding-form-subtitle">
                Enter your agency name and choose a unique URL for your dashboard.
              </p>

              <div className="form-group">
                <Input
                  label="Agency Name"
                  placeholder="e.g., Global Migration Services"
                  value={formData.agencyName}
                  onChange={(e) => updateFormData('agencyName', e.target.value)}
                  error={errors.agencyName}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <Input
                  label="Dashboard URL"
                  placeholder="your-agency"
                  value={formData.slug}
                  onChange={(e) => updateFormData('slug', e.target.value.toLowerCase())}
                  onBlur={checkSlugAvailability}
                  error={errors.slug}
                  hint={
                    slugAvailable === true
                      ? 'This URL is available!'
                      : `Your dashboard will be at koala.app/t/${formData.slug || 'your-agency'}`
                  }
                  leftIcon={<span className="input-prefix">koala.app/t/</span>}
                />
                {isCheckingSlug && (
                  <div className="slug-checking">Checking availability...</div>
                )}
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="onboarding-form-step">
              <h3 className="onboarding-form-title">Create Your Account</h3>
              <p className="onboarding-form-subtitle">
                This will be the admin account for your agency.
              </p>

              <div className="form-row">
                <div className="form-group">
                  <Input
                    label="First Name"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    error={errors.firstName}
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    error={errors.lastName}
                  />
                </div>
              </div>

              <div className="form-group">
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  error={errors.email}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <Input
                  type="password"
                  label="Password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  error={errors.password}
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <Input
                  type="password"
                  label="Confirm Password"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  error={errors.confirmPassword}
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="onboarding-form-step">
              <h3 className="onboarding-form-title">Review & Confirm</h3>
              <p className="onboarding-form-subtitle">
                Please review your details before creating your agency.
              </p>

              <div className="onboarding-review">
                <div className="review-section">
                  <h4>Agency Details</h4>
                  <div className="review-item">
                    <span className="review-label">Agency Name</span>
                    <span className="review-value">{formData.agencyName}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Dashboard URL</span>
                    <span className="review-value">koala.app/t/{formData.slug}</span>
                  </div>
                </div>

                <div className="review-section">
                  <h4>Admin Account</h4>
                  <div className="review-item">
                    <span className="review-label">Name</span>
                    <span className="review-value">
                      {formData.firstName} {formData.lastName}
                    </span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Email</span>
                    <span className="review-value">{formData.email}</span>
                  </div>
                </div>

                <div className="review-terms">
                  <p>
                    By creating an agency, you agree to our{' '}
                    <a href="/terms" target="_blank">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" target="_blank">
                      Privacy Policy
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="onboarding-actions">
            {currentStep > 0 && (
              <Button variant="secondary" onClick={handleBack} disabled={isLoading}>
                Back
              </Button>
            )}
            {currentStep === 0 && (
              <Link to="/login" className="onboarding-back-link">
                Already have an account? Sign in
              </Link>
            )}
            <div className="onboarding-actions-right">
              {currentStep < STEPS.length - 1 ? (
                <Button variant="primary" onClick={handleNext} isLoading={isCheckingSlug}>
                  Continue
                </Button>
              ) : (
                <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
                  Create Agency
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
