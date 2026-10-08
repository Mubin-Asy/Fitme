import React from 'react';
import { useUser } from '../../context/UserContext';
import { 
  UserPlus, 
  ShieldCheck, 
  Target, 
  Flame, 
  Droplets, 
  Check, 
  ArrowRightCircle 
} from 'lucide-react';

interface GroupViewProps {
  onOpenNewMemberModal: () => void;
  onNavigateTab: (tab: string) => void;
}

export const GroupView: React.FC<GroupViewProps> = ({ onOpenNewMemberModal, onNavigateTab }) => {
  const { users, currentUser, switchUser, maxUsersLimit } = useUser();

  const isFull = users.length >= maxUsersLimit;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Private 10-Athlete Circle
            </h1>
            <span className="badge badge-lime">
              <ShieldCheck size={12} />
              {users.length} / {maxUsersLimit} Athletes Active
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
            High-accountability private fitness group. Switch between athletes in 1 click or add new members up to the 10-person limit.
          </p>
        </div>

        <button
          onClick={onOpenNewMemberModal}
          className="btn btn-primary"
          disabled={isFull}
          title={isFull ? 'Group capacity full (10 max)' : 'Invite member'}
          style={isFull ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
        >
          <UserPlus size={16} />
          <span>{isFull ? 'Group Full (10/10)' : 'Add Athlete'}</span>
        </button>
      </div>

      {/* Quota Banner */}
      {isFull && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', backgroundColor: 'rgba(0, 229, 153, 0.08)', border: '1px solid rgba(0, 229, 153, 0.25)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)' }}>
          <ShieldCheck size={20} color="var(--color-primary)" />
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-main)' }}>
            <strong>Group Roster Complete:</strong> All 10 private athlete spots are currently claimed. Each athlete has independent personal records, workout sessions, and nutritional targets.
          </div>
        </div>
      )}

      {/* Athlete Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-md)' }}>
        {users.map((athlete) => {
          const isSelected = currentUser?.id === athlete.id;
          return (
            <div
              key={athlete.id}
              className="fit-card"
              style={{
                borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-card)',
                boxShadow: isSelected ? '0 0 20px rgba(0, 229, 153, 0.15)' : 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={athlete.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                      alt={athlete.full_name}
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: isSelected ? '2px solid var(--color-primary)' : '2px solid var(--border-card)',
                      }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--text-main)' }}>
                          {athlete.full_name}
                        </h3>
                        {athlete.role === 'admin' && (
                          <span className="badge badge-gold" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                            Admin
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        @{athlete.username}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="badge badge-lime">
                      <Check size={12} /> Active View
                    </span>
                  )}
                </div>

                {/* Bio & Goal */}
                <div style={{ marginTop: 'var(--space-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--color-secondary)', fontWeight: 700 }}>
                    <Target size={13} />
                    <span>{athlete.fitness_goal}</span>
                  </div>

                  {athlete.bio && (
                    <p style={{ marginTop: '6px', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                      "{athlete.bio}"
                    </p>
                  )}
                </div>

                {/* Targets */}
                <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Flame size={12} color="var(--color-accent-fire)" />
                    <span>{athlete.target_calories} kcal</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Droplets size={12} color="var(--color-secondary)" />
                    <span>{athlete.target_water_ml} ml</span>
                  </div>
                  {athlete.target_weight_kg && (
                    <div>
                      🎯 <span>{athlete.target_weight_kg} kg</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div style={{ marginTop: 'var(--space-lg)', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--border-subtle)' }}>
                {isSelected ? (
                  <button
                    onClick={() => onNavigateTab('dashboard')}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span>View Dashboard</span>
                    <ArrowRightCircle size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      switchUser(athlete);
                      onNavigateTab('dashboard');
                    }}
                    className="btn btn-outline-primary btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span>Switch to this Athlete</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
