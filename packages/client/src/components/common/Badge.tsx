import { HTMLAttributes } from 'react';
import './Badge.css';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  children,
  ...props
}: BadgeProps) {
  const classes = [
    'badge',
    `badge-${variant}`,
    `badge-${size}`,
    dot ? 'badge-dot' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} {...props}>
      {dot && <span className="badge-dot-indicator" />}
      {children}
    </span>
  );
}

// Status-specific badges for convenience
export function StatusBadge({ status, ...props }: { status: string } & Omit<BadgeProps, 'variant'>) {
  const statusVariants: Record<string, BadgeProps['variant']> = {
    // Lead statuses
    NEW: 'info',
    CONTACTED: 'primary',
    QUALIFIED: 'primary',
    PROPOSAL: 'warning',
    NEGOTIATION: 'warning',
    WON: 'success',
    LOST: 'error',
    // Case statuses
    DRAFT: 'default',
    SUBMITTED: 'info',
    UNDER_REVIEW: 'primary',
    DOCUMENTS_REQUIRED: 'warning',
    INTERVIEW_SCHEDULED: 'warning',
    APPROVED: 'success',
    REJECTED: 'error',
    COMPLETED: 'success',
    CANCELLED: 'error',
    // Document statuses
    PENDING: 'warning',
    EXPIRED: 'error',
    // Job statuses
    OPEN: 'success',
    PAUSED: 'warning',
    CLOSED: 'default',
    FILLED: 'info',
    // User statuses
    ACTIVE: 'success',
    INACTIVE: 'default',
  };

  const variant = statusVariants[status] || 'default';
  const label = status.replace(/_/g, ' ');

  return (
    <Badge variant={variant} {...props}>
      {label}
    </Badge>
  );
}
