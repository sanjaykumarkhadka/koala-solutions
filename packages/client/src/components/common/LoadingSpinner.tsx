import { HTMLAttributes } from 'react';
import './LoadingSpinner.css';

export interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
}

export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  className = '',
  ...props
}: LoadingSpinnerProps) {
  return (
    <div className={`spinner spinner-${size} spinner-${color} ${className}`} {...props}>
      <svg viewBox="0 0 50 50">
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// Full page loading
export interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ message = 'Loading...' }: LoadingPageProps) {
  return (
    <div className="loading-page">
      <LoadingSpinner size="lg" />
      <p className="loading-message">{message}</p>
    </div>
  );
}

// Inline loading
export interface LoadingInlineProps extends HTMLAttributes<HTMLDivElement> {
  message?: string;
}

export function LoadingInline({ message, className = '', ...props }: LoadingInlineProps) {
  return (
    <div className={`loading-inline ${className}`} {...props}>
      <LoadingSpinner size="sm" />
      {message && <span className="loading-inline-message">{message}</span>}
    </div>
  );
}
