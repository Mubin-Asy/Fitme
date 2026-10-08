import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { 
  Dumbbell, 
  LayoutDashboard, 
  BookOpen, 
  Utensils, 
  LineChart, 
  Users, 
  ChevronDown, 
  Check, 
  UserPlus, 
  ShieldCheck 
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewMemberModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenNewMemberModal }) => {
  const { users, currentUser, switchUser, maxUsersLimit } = useUser();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'exercises', label: 'Exercise Library', icon: BookOpen },
    { id: 'nutrition', label: 'Nutrition & Water', icon: Utensils },
    { id: 'metrics', label: 'Body Metrics', icon: LineChart },
    { id: 'group', label: 'Group Circle', icon: Users },
  ];

  return (
    <header className="app-header">
      <div className="header-brand" onClick={() => setActiveTab('dashboard')}>
        <div className="brand-icon-wrapper">
          <Dumbbell size={24} strokeWidth={2.5} />
        </div>
        <div>
          <div className="brand-title">
            FITME
            <span className="brand-badge">PRO GROUP</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', letterSpacing: '0.02em' }}>
            Private 10-Athlete Club
          </div>
        </div>
      </div>

      <nav className="nav-tabs" aria-label="Main Navigation">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="header-actions">
        {/* Group Capacity Indicator */}
        <div 
          className="group-status-pill" 
          title={`This private installation is capped at ${maxUsersLimit} members`}
        >
          <span className="indicator-dot" />
          <span>{users.length}/{maxUsersLimit} Athletes</span>
        </div>

        {/* User Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="user-quick-switcher"
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            aria-expanded={isUserDropdownOpen}
          >
            {currentUser?.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.full_name}
                className="user-avatar-tiny"
              />
            ) : (
              <div className="user-avatar-tiny" style={{ background: 'var(--color-primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 700 }}>
                {currentUser?.full_name.charAt(0) || 'U'}
              </div>
            )}
            <span className="user-quick-name">{currentUser?.full_name.split(' ')[0]}</span>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {isUserDropdownOpen && (
            <>
              <div 
                style={{ position: 'fixed', inset: 0, zIndex: 60 }} 
                onClick={() => setIsUserDropdownOpen(false)} 
              />
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '280px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 70,
                  padding: '8px',
                  animation: 'scaleIn 0.15s ease-out',
                }}
              >
                <div style={{ padding: '6px 10px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '6px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Switch Active Athlete
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Viewing data as <strong style={{ color: 'var(--color-primary)' }}>{currentUser?.full_name}</strong>
                  </div>
                </div>

                <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                  {users.map((u) => {
                    const isSelected = currentUser?.id === u.id;
                    return (
                      <div
                        key={u.id}
                        onClick={() => {
                          switchUser(u);
                          setIsUserDropdownOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'var(--color-primary-dim)' : 'transparent',
                          transition: 'background-color var(--transition-fast)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img
                            src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                            alt={u.full_name}
                            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isSelected ? 'var(--color-primary)' : 'var(--text-main)' }}>
                              {u.full_name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {u.fitness_goal || 'Athlete'}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check size={16} color="var(--color-primary)" />}
                      </div>
                    );
                  })}
                </div>

                {users.length < maxUsersLimit ? (
                  <button
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      onOpenNewMemberModal();
                    }}
                    className="btn btn-outline-primary btn-sm"
                    style={{ width: '100%', marginTop: '8px', justifyContent: 'center' }}
                  >
                    <UserPlus size={14} />
                    <span>Add Member ({users.length}/{maxUsersLimit})</span>
                  </button>
                ) : (
                  <div style={{ padding: '8px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-subtle)', marginTop: '6px' }}>
                    <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', color: 'var(--color-primary)' }} />
                    Group Tier at Maximum (10/10)
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
