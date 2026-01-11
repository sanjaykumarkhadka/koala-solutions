import { useState, useRef, useEffect, HTMLAttributes } from 'react';
import './Dropdown.css';

export interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

export interface DropdownProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  trigger: React.ReactNode;
  items: DropdownItem[];
  onChange?: (value: string) => void;
  align?: 'left' | 'right';
}

export function Dropdown({
  trigger,
  items,
  onChange,
  align = 'left',
  className = '',
  ...props
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    onChange?.(item.value);
    setIsOpen(false);
  };

  return (
    <div className={`dropdown ${className}`} ref={dropdownRef} {...props}>
      <div className="dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className={`dropdown-menu dropdown-${align}`}>
          {items.map((item, index) =>
            item.divider ? (
              <div key={`divider-${index}`} className="dropdown-divider" />
            ) : (
              <button
                key={item.value}
                className={`dropdown-item ${item.disabled ? 'disabled' : ''} ${item.danger ? 'danger' : ''}`}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
              >
                {item.icon && <span className="dropdown-item-icon">{item.icon}</span>}
                <span className="dropdown-item-label">{item.label}</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// Simple action menu trigger
export function MoreButton({ onClick }: { onClick?: () => void }) {
  return (
    <button className="more-button" onClick={onClick} aria-label="More options">
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
      </svg>
    </button>
  );
}
