import { HTMLAttributes } from 'react';
import './Avatar.css';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    '#0ea5e9', // sky
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f97316', // orange
    '#10b981', // emerald
    '#6366f1', // indigo
    '#14b8a6', // teal
    '#f59e0b', // amber
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  status,
  className = '',
  ...props
}: AvatarProps) {
  const initials = name ? getInitials(name) : '?';
  const bgColor = name ? getColorFromName(name) : '#6b7280';

  return (
    <div className={`avatar avatar-${size} ${className}`} {...props}>
      {src ? (
        <img src={src} alt={alt || name || 'Avatar'} className="avatar-image" />
      ) : (
        <div className="avatar-fallback" style={{ backgroundColor: bgColor }}>
          {initials}
        </div>
      )}
      {status && <span className={`avatar-status avatar-status-${status}`} />}
    </div>
  );
}

// Avatar Group
export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: AvatarProps['size'];
  children: React.ReactNode;
}

export function AvatarGroup({
  max = 5,
  size = 'md',
  className = '',
  children,
  ...props
}: AvatarGroupProps) {
  const childArray = Array.isArray(children) ? children : [children];
  const visibleAvatars = childArray.slice(0, max);
  const remainingCount = childArray.length - max;

  return (
    <div className={`avatar-group ${className}`} {...props}>
      {visibleAvatars}
      {remainingCount > 0 && (
        <div className={`avatar avatar-${size} avatar-overflow`}>
          <div className="avatar-fallback">+{remainingCount}</div>
        </div>
      )}
    </div>
  );
}
