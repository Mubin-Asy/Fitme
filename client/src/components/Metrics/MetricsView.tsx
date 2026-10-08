import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import type { BodyMetric } from '../../types';
import { api } from '../../services/api';
import { 
  LineChart, 
  Scale, 
  Heart, 
  Moon, 
  Zap, 
  Plus, 
  Check, 
  X, 
  Calendar 
} from 'lucide-react';

interface MetricsViewProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const MetricsView: React.FC<MetricsViewProps> = ({ isModalOpen, setIsModalOpen }) => {
  const { currentUser } = useUser();
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form State
  const [weightKg, setWeightKg] = useState<number>(85.0);
  const [bodyFatPct, setBodyFatPct] = useState<number>(15.0);
  const [muscleMassKg, setMuscleMassKg] = useState<number>(40.0);
  const [restingHr, setRestingHr] = useState<number>(58);
  const [sleepHours, setSleepHours] = useState<number>(8.0);
  const [energyLevel, setEnergyLevel] = useState<number>(8);
  const [notes, setNotes] = useState<string>('');

  const loadMetrics = async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      const data = await api.getBodyMetrics(currentUser.id);
      setMetrics(data);
      if (data.length > 0) {
        setWeightKg(data[0].weight_kg);
        if (data[0].body_fat_pct) setBodyFatPct(data[0].body_fat_pct);
      }
    } catch (err) {
      console.error('Error fetching body metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [currentUser]);

  const handleCreateMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await api.createBodyMetric({
        user_id: currentUser.id,
        recorded_at: new Date().toISOString(),
        weight_kg: Number(weightKg),
        body_fat_pct: bodyFatPct ? Number(bodyFatPct) : undefined,
        muscle_mass_kg: muscleMassKg ? Number(muscleMassKg) : undefined,
        resting_heart_rate: restingHr ? Number(restingHr) : undefined,
        sleep_hours: sleepHours ? Number(sleepHours) : undefined,
        energy_level: Number(energyLevel),
        notes: notes || undefined,
      });
      setIsModalOpen(false);
      setNotes('');
      await loadMetrics();
    } catch (err: any) {
      alert(err.message || 'Failed to record metric');
    }
  };

  const latest = metrics[0];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Body Composition & Recovery Metrics
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
            Monitor body weight trends, physiological recovery, resting heart rate, and sleep quality.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Record Weigh-In & Recovery</span>
        </button>
      </div>

      {/* Snapshot Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-secondary">
            <Scale size={22} />
          </div>
          <div>
            <div className="stat-value">{latest ? latest.weight_kg : '--'} <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-dim)' }}>kg</span></div>
            <div className="stat-label">Current Scale Weight</div>
          </div>
          <div className="stat-footer">
            <span>Target: {currentUser?.target_weight_kg || 'Maintained'} kg</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-primary">
            <Heart size={22} />
          </div>
          <div>
            <div className="stat-value">{latest?.resting_heart_rate ? latest.resting_heart_rate : '--'} <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-dim)' }}>bpm</span></div>
            <div className="stat-label">Resting Heart Rate</div>
          </div>
          <div className="stat-footer">
            <span>Cardiovascular recovery</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-gold">
            <Moon size={22} />
          </div>
          <div>
            <div className="stat-value">{latest?.sleep_hours ? latest.sleep_hours : '--'} <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-dim)' }}>hrs</span></div>
            <div className="stat-label">Sleep Duration</div>
          </div>
          <div className="stat-footer">
            <span>Restorative recovery</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-fire">
            <Zap size={22} />
          </div>
          <div>
            <div className="stat-value">{latest?.energy_level ? `${latest.energy_level}/10` : '--'}</div>
            <div className="stat-label">Subjective Energy Score</div>
          </div>
          <div className="stat-footer">
            <span>CNS Readiness</span>
          </div>
        </div>
      </div>

      {/* Metric History List */}
      <div className="fit-card">
        <div className="fit-card-header">
          <div className="card-title-group">
            <LineChart size={20} color="var(--color-primary)" />
            <h2 className="card-title">Recorded Check-In History</h2>
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-lg) 0', color: 'var(--text-muted)' }}>
            Loading metrics history...
          </div>
        ) : metrics.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0', color: 'var(--text-muted)' }}>
            <Scale size={36} color="var(--text-dim)" style={{ margin: '0 auto var(--space-sm)' }} />
            <p>No weigh-ins recorded for {currentUser?.full_name} yet.</p>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-outline-primary btn-sm" style={{ marginTop: 'var(--space-sm)' }}>
              Log First Check-In
            </button>
          </div>
        ) : (
          <table className="set-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Weight</th>
                <th>Body Fat %</th>
                <th>Resting HR</th>
                <th>Sleep</th>
                <th>Energy</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m.id}>
                  <td style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} color="var(--text-dim)" />
                      {new Date(m.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    {m.weight_kg} kg
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {m.body_fat_pct ? `${m.body_fat_pct}%` : '-'}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {m.resting_heart_rate ? `${m.resting_heart_rate} bpm` : '-'}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {m.sleep_hours ? `${m.sleep_hours} hrs` : '-'}
                  </td>
                  <td>
                    {m.energy_level ? (
                      <span className="badge badge-lime">⚡ {m.energy_level}/10</span>
                    ) : '-'}
                  </td>
                  <td style={{ color: 'var(--text-dim)', fontStyle: 'italic', maxWidth: '200px' }}>
                    {m.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL: Log Body Metric */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Scale size={20} color="var(--color-secondary)" />
                <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
                  Record Weigh-In & Recovery
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateMetric}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Body Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Body Fat % (Optional)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={bodyFatPct}
                      onChange={(e) => setBodyFatPct(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Muscle Mass (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={muscleMassKg}
                      onChange={(e) => setMuscleMassKg(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-sm)' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Resting HR (bpm)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={restingHr}
                      onChange={(e) => setRestingHr(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Sleep (hours)</label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-input"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Energy (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="form-input"
                      value={energyLevel}
                      onChange={(e) => setEnergyLevel(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Recovery Notes / Sensation</label>
                  <input
                    type="text"
                    className="form-input"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Squeezed in 8 hours sleep, hamstrings slightly sore from RDLs"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>Save Metric Check-In</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
