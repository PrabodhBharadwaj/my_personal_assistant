import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Settings } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setShowDropdown(false);
    }
  };

  const getUserDisplayName = (): string => {
    if (!user?.email) return 'User';
    return user.email.split('@')[0];
  };

  return (
    <div className="user-profile-container">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="user-profile-button"
        aria-label="User profile menu"
      >
        <User className="user-profile-icon" />
        <span className="user-profile-name">
          {getUserDisplayName()}
        </span>
      </button>

      {showDropdown && (
        <>
          <div className="user-profile-dropdown">
            <div className="dropdown-header">
              <p className="dropdown-email">{user?.email}</p>
              <p className="dropdown-subtitle">Personal Assistant</p>
            </div>
            
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="logout-dropdown-button"
            >
              <LogOut className="logout-icon" />
              <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
            </button>
          </div>

          {/* Click outside to close dropdown */}
          <div
            className="dropdown-overlay"
            onClick={() => setShowDropdown(false)}
          />
        </>
      )}
    </div>
  );
};

export default UserProfile;
