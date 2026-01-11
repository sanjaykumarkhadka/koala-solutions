import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/common/Avatar';
import { Dropdown, DropdownItem } from '@/components/common/Dropdown';
import './Header.css';

interface HeaderProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    role: string;
  };
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const userMenuItems: DropdownItem[] = [
    { label: 'Profile', value: 'profile', icon: <ProfileIcon /> },
    { label: 'Settings', value: 'settings', icon: <SettingsIcon /> },
    { label: '', value: 'divider', divider: true },
    { label: 'Sign out', value: 'logout', icon: <LogoutIcon />, danger: true },
  ];

  const handleUserMenuChange = (value: string) => {
    switch (value) {
      case 'profile':
        navigate('profile');
        break;
      case 'settings':
        navigate('admin/settings');
        break;
      case 'logout':
        onLogout();
        break;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement global search
      console.log('Search:', searchQuery);
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <form className="header-search" onSubmit={handleSearch}>
          <SearchIcon />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="header-search-input"
          />
        </form>
      </div>

      <div className="header-right">
        <button className="header-notification-btn" aria-label="Notifications">
          <BellIcon />
          <span className="header-notification-badge">3</span>
        </button>

        <Dropdown
          trigger={
            <button className="header-user-btn">
              <Avatar
                name={`${user.firstName} ${user.lastName}`}
                src={user.avatarUrl}
                size="sm"
              />
              <div className="header-user-info">
                <span className="header-user-name">
                  {user.firstName} {user.lastName}
                </span>
                <span className="header-user-role">{formatRole(user.role)}</span>
              </div>
              <ChevronDownIcon />
            </button>
          }
          items={userMenuItems}
          onChange={handleUserMenuChange}
          align="right"
        />
      </div>
    </header>
  );
}

function formatRole(role: string): string {
  return role.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

// Icons
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="header-search-icon">
      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="header-chevron">
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
