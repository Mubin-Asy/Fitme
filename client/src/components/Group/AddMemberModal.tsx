import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { UserPlus, ShieldAlert, Check, X } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose }) => {
  const { users, maxUsersLimit, addUser } = useUser();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [goal, setGoal] = useState('Strength & Muscle Hypertrophy');
  const [calories, setCalories] = useState(2500);
  const [waterMl, setWaterMl] = useState(3200);
  const [weightKg, setWeightKg] = useState(75.0);
  const [bio, setBio] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isFull = users.length >= maxUsersLimit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFull) {
      setError(`Cannot add athlete. This private group tier is capped at ${maxUsersLimit} members.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await addUser({
        full_name: fullName,
        username: username.toLowerCase().replace(/\s+/g, '_'),
        email,
        fitness_goal: goal,
        target_calories: Number(calories),
        target_water_ml: Number(waterMl),
        target_weight_kg: Number(weightKg),
        bio: bio || undefined,
        avatar_url: `https://images.unsplash.com/photo-${1534528741775 + users.length}?w=150`,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add athlete');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={20} color="var(--color-primary)" />
            <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
              Add Athlete to Private Circle
            </h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {isFull ? (
          <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-2xl) var(--space-lg)' }}>
            <ShieldAlert size={48} color="var(--color-accent-amber)" style={{ margin: '0 auto var(--space-md)' }} />
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-main)' }}>
              Group Limit Reached ({maxUsersLimit}/{maxUsersLimit})
            </h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px', maxWidth: '420px', margin: '8px auto 0' }}>
              This private Fitme installation is strictly designed for a maximum of 10 athletes. All 10 athlete accounts are currently in use. You can switch between active profiles from the top navigation.
            </p>
            <button onClick={onClose} className="btn btn-secondary" style={{ marginTop: 'var(--space-lg)' }}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {error && (
                <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255, 77, 109, 0.15)', border: '1px solid var(--color-accent-fire)', borderRadius: 'var(--radius-sm)', color: 'var(--color-accent-fire)', fontSize: 'var(--font-size-xs)' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rachel Adams"
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. rachel_lift"
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rachel@fitme.club"
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Primary Fitness Goal</label>
                <input
                  type="text"
                  className="form-input"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Olympic Weightlifting, Marathon Training"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-sm)' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Target Calories</label>
                  <input
                    type="number"
                    className="form-input"
                    value={calories}
                    onChange={(e) => setCalories(Number(e.target.value))}
                    min="1000"
                    max="8000"
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Target Water (ml)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={waterMl}
                    onChange={(e) => setWaterMl(Number(e.target.value))}
                    min="1000"
                    max="10000"
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Target Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    min="30"
                    max="300"
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Athlete Bio (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Short description of athletic background or interests..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                <Check size={16} />
                <span>{isSubmitting ? 'Registering...' : 'Register Athlete'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
