import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from '../../context/UserContext';
import type { DashboardSummary } from '../../types';
import { api } from '../../services/api';
import { 
  Dumbbell, 
  Flame, 
  Trophy, 
  Droplets, 
  TrendingUp, 
  Calendar, 
  Plus, 
  ChevronRight, 
  Sparkles, 
  Award, 
  Clock, 
  Scale, 
  Activity 
} from 'lucide-react';

interface DashboardViewProps {
  onStartWorkout: () => void;
  onLogMeal: () => void;
  onRecordMetric: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onStartWorkout,
  onLogMeal,
  onRecordMetric,
  onNavigateTab,
}) => {
  const { currentUser } = useUser();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getDashboardSummary(currentUser.id);
      setData(res);
    } catch (err: any) {
      console.error('Error fetching dashboard summary:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-2xl) 0' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid var(--border-card)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ marginTop: 'var(--space-md)', color: 'var(--text-muted)' }}>Loading athlete dashboard...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fit-card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
        <Activity size={48} color="var(--color-accent-fire)" style={{ margin: '0 auto var(--space-md)' }} />
        <h3 className="card-title">Failed to load dashboard</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>{error}</p>
        <button onClick={fetchDashboard} className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
          Try Again
        </button>
      </div>
    );
  }

  const caloriePct = Math.min(Math.round((data.today_nutrition.calories / data.today_nutrition.target_calories) * 100), 100);
  const waterPct = Math.min(Math.round((data.today_nutrition.water_ml / data.today_nutrition.target_water_ml) * 100), 100);

  return (
    <div>
      {/* Athlete Welcome & Quick Actions Hero */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Welcome back, {currentUser?.full_name}
            </h1>
            <span className="badge badge-lime">{currentUser?.fitness_goal}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: 'var(--font-size-sm)' }}>
            Track progress, set personal bests, and keep your 10-athlete group accountable.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <button onClick={onStartWorkout} className="btn btn-primary">
            <Plus size={16} />
            <span>Log Workout</span>
          </button>
          <button onClick={onLogMeal} className="btn btn-secondary">
            <Flame size={16} color="var(--color-accent-fire)" />
            <span>Log Meal</span>
          </button>
          <button onClick={onRecordMetric} className="btn btn-secondary">
            <Scale size={16} color="var(--color-secondary)" />
            <span>Record Metric</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="stats-grid">
        {/* Weekly Tonnage */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-primary">
            <Dumbbell size={22} />
          </div>
          <div>
            <div className="stat-value">{data.weekly_volume_kg.toLocaleString()} <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--text-dim)' }}>kg</span></div>
            <div className="stat-label">Weekly Volume Tonnage</div>
          </div>
          <div className="stat-footer">
            <span>{data.weekly_workouts_count} workouts this week</span>
            <TrendingUp size={14} color="var(--color-primary)" />
          </div>
        </div>

        {/* Calories Goal */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-fire">
            <Flame size={22} />
          </div>
          <div>
            <div className="stat-value">{data.today_nutrition.calories} <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--text-dim)' }}>/ {data.today_nutrition.target_calories} kcal</span></div>
            <div className="stat-label">Today's Caloric Intake</div>
          </div>
          <div style={{ marginTop: 'var(--space-xs)' }}>
            <div className="progress-bar-track">
              <div className="progress-bar-fill progress-fill-fire" style={{ width: `${caloriePct}%` }} />
            </div>
          </div>
          <div className="stat-footer">
            <span>{caloriePct}% of daily goal</span>
            <span>{data.today_nutrition.protein_g}g Protein</span>
          </div>
        </div>

        {/* Hydration */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-secondary">
            <Droplets size={22} />
          </div>
          <div>
            <div className="stat-value">{data.today_nutrition.water_ml} <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--text-dim)' }}>/ {data.today_nutrition.target_water_ml} ml</span></div>
            <div className="stat-label">Hydration Target</div>
          </div>
          <div style={{ marginTop: 'var(--space-xs)' }}>
            <div className="progress-bar-track">
              <div className="progress-bar-fill progress-fill-cyan" style={{ width: `${waterPct}%` }} />
            </div>
          </div>
          <div className="stat-footer">
            <span>{waterPct}% hydrated</span>
            <span>Goal: {data.today_nutrition.target_water_ml} ml</span>
          </div>
        </div>

        {/* Personal Records & Streak */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-gold">
            <Trophy size={22} />
          </div>
          <div>
            <div className="stat-value">{data.personal_records.length} <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--text-dim)' }}>PRs</span></div>
            <div className="stat-label">Personal Records Set</div>
          </div>
          <div className="stat-footer">
            <span style={{ color: 'var(--color-accent-amber)', fontWeight: 600 }}>🔥 {data.active_streak_days} Day Streak</span>
            <Sparkles size={14} color="var(--color-accent-amber)" />
          </div>
        </div>
      </div>

      {/* Main Grid: Workouts & Analytics */}
      <div className="dashboard-grid">
        {/* Left Col (8 cols): Recent Workouts & PRs */}
        <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* Recent Workouts */}
          <div className="fit-card">
            <div className="fit-card-header">
              <div className="card-title-group">
                <Dumbbell size={20} color="var(--color-primary)" />
                <h2 className="card-title">Recent Workouts</h2>
              </div>
              <button 
                onClick={() => onNavigateTab('workouts')} 
                className="btn btn-secondary btn-sm"
              >
                <span>View All History</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {data.recent_workouts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0', color: 'var(--text-muted)' }}>
                <Dumbbell size={36} color="var(--text-dim)" style={{ margin: '0 auto var(--space-sm)' }} />
                <p>No workouts recorded yet for {currentUser?.full_name}.</p>
                <button onClick={onStartWorkout} className="btn btn-outline-primary btn-sm" style={{ marginTop: 'var(--space-sm)' }}>
                  Log Your First Workout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {data.recent_workouts.map((workout) => (
                  <div 
                    key={workout.id}
                    style={{
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--text-main)' }}>
                          {workout.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', marginTop: '2px' }}>
                          <Calendar size={12} />
                          <span>{new Date(workout.started_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          <span>•</span>
                          <Clock size={12} />
                          <span>{workout.duration_mins} mins</span>
                          <span>•</span>
                          <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                            {workout.total_volume_kg.toLocaleString()} kg lifted
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="badge badge-lime">{workout.status}</span>
                      </div>
                    </div>

                    {workout.notes && (
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                        "{workout.notes}"
                      </p>
                    )}

                    {/* Exercises breakdown */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                      {workout.exercises.map((we, idx) => {
                        const hasPr = we.sets.some((s) => s.is_personal_record);
                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              backgroundColor: 'var(--bg-input)',
                              border: '1px solid var(--border-subtle)',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: 'var(--font-size-xs)',
                            }}
                          >
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                              {we.exercise?.name || `Exercise #${we.exercise_id}`}
                            </span>
                            <span style={{ color: 'var(--text-muted)' }}>
                              ({we.sets.length} {we.sets.length === 1 ? 'set' : 'sets'})
                            </span>
                            {hasPr && (
                              <span className="badge badge-pr" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                                PR!
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Personal Records Showcase */}
          <div className="fit-card">
            <div className="fit-card-header">
              <div className="card-title-group">
                <Trophy size={20} color="var(--color-accent-amber)" />
                <div>
                  <h2 className="card-title">Personal Records (PRs)</h2>
                  <div className="card-subtitle">Estimated 1RM calculated via Epley formula</div>
                </div>
              </div>
            </div>

            {data.personal_records.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-lg) 0', color: 'var(--text-muted)' }}>
                No PRs registered yet. As you push weights, Fitme automatically identifies and flags all-time records.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-md)' }}>
                {data.personal_records.map((pr) => (
                  <div
                    key={pr.exercise_id}
                    style={{
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                          {pr.category}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                          {pr.exercise_name}
                        </div>
                      </div>
                      <span className="badge badge-gold">
                        <Award size={12} />
                        PR
                      </span>
                    </div>

                    <div style={{ marginTop: 'var(--space-md)', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--color-accent-amber)' }}>
                          {pr.max_weight_kg} kg
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          for {pr.reps_at_max} {pr.reps_at_max === 1 ? 'rep' : 'reps'}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          ~{pr.estimated_1rm} kg
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          Est. 1RM
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col (4 cols): Nutrition & Group Leaderboard */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* Today's Nutrition Breakdown */}
          <div className="fit-card">
            <div className="fit-card-header">
              <div className="card-title-group">
                <Flame size={20} color="var(--color-accent-fire)" />
                <h2 className="card-title">Today's Macros</h2>
              </div>
              <button onClick={onLogMeal} className="btn btn-outline-primary btn-sm">
                + Meal
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {/* Protein */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Protein</span>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{data.today_nutrition.protein_g}g</span>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill progress-fill-lime" style={{ width: `${Math.min((data.today_nutrition.protein_g / 180) * 100, 100)}%` }} />
                </div>
              </div>

              {/* Carbs */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Carbohydrates</span>
                  <span style={{ color: 'var(--color-secondary)', fontWeight: 700 }}>{data.today_nutrition.carbs_g}g</span>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill progress-fill-cyan" style={{ width: `${Math.min((data.today_nutrition.carbs_g / 240) * 100, 100)}%` }} />
                </div>
              </div>

              {/* Fat */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Fats</span>
                  <span style={{ color: 'var(--color-accent-amber)', fontWeight: 700 }}>{data.today_nutrition.fat_g}g</span>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill progress-fill-gold" style={{ width: `${Math.min((data.today_nutrition.fat_g / 70) * 100, 100)}%` }} />
                </div>
              </div>
            </div>

            {/* Today's Meals list */}
            <div style={{ marginTop: 'var(--space-md)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-sm)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Logged Today ({data.today_nutrition.logs.length})
              </div>
              {data.today_nutrition.logs.length === 0 ? (
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-dim)' }}>
                  No meals logged today yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {data.today_nutrition.logs.map((log) => (
                    <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', padding: '4px 0' }}>
                      <span style={{ color: 'var(--text-main)', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.food_name}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>{log.calories} kcal</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Group Circle Leaderboard */}
          <div className="fit-card">
            <div className="fit-card-header">
              <div className="card-title-group">
                <Trophy size={20} color="var(--color-accent-amber)" />
                <div>
                  <h2 className="card-title">10-Athlete Leaderboard</h2>
                  <div className="card-subtitle">Friendly group consistency</div>
                </div>
              </div>
              <button onClick={() => onNavigateTab('group')} className="btn btn-secondary btn-sm">
                Hub
              </button>
            </div>

            <div className="leaderboard-list">
              {data.group_leaderboard.slice(0, 5).map((athlete, index) => {
                const isMe = athlete.user_id === currentUser?.id;
                const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'rank-other';
                return (
                  <div 
                    key={athlete.user_id} 
                    className={`leaderboard-row ${isMe ? 'active-user' : ''}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className={`rank-pill ${rankClass}`}>
                        {index + 1}
                      </div>
                      <img 
                        src={athlete.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'} 
                        alt={athlete.full_name}
                        style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isMe ? 'var(--color-primary)' : 'var(--text-main)' }}>
                          {athlete.full_name} {isMe && '(You)'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                          {athlete.workouts_count} workouts • {athlete.favorite_category}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {athlete.total_volume_kg.toLocaleString()} kg
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-accent-amber)', fontWeight: 600 }}>
                        🔥 {athlete.streak_days}d streak
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
