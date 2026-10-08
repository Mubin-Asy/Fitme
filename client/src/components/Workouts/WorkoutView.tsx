import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import type { Workout, Exercise, WorkoutCreatePayload } from '../../types';
import { api } from '../../services/api';
import { 
  Dumbbell, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  Trophy, 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

interface WorkoutViewProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const WorkoutView: React.FC<WorkoutViewProps> = ({ isModalOpen, setIsModalOpen }) => {
  const { currentUser } = useUser();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<number | null>(null);

  // Rest Timer State
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerInitial, setTimerInitial] = useState<number>(90);

  // New Workout Form State
  const [workoutTitle, setWorkoutTitle] = useState<string>('Heavy Compound Push');
  const [workoutNotes, setWorkoutNotes] = useState<string>('');
  const [durationMins, setDurationMins] = useState<number>(60);
  const [workoutExercises, setWorkoutExercises] = useState<
    {
      exercise_id: number;
      order_index: number;
      notes?: string;
      sets: {
        set_number: number;
        set_type: 'warmup' | 'normal' | 'drop' | 'failure';
        reps: number;
        weight_kg: number;
        rpe?: number;
      }[];
    }[]
  >([]);

  const loadData = async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      const [wList, exList] = await Promise.all([
        api.getWorkouts(currentUser.id),
        api.getExercises(),
      ]);
      setWorkouts(wList);
      setExercises(exList);
      if (wList.length > 0) {
        setExpandedWorkoutId(wList[0].id);
      }
    } catch (err) {
      console.error('Error loading workouts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Timer countdown hook
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const startTimer = (seconds: number) => {
    setTimerInitial(seconds);
    setTimerSeconds(seconds);
    setIsTimerRunning(true);
  };

  const handleOpenModal = () => {
    if (exercises.length > 0) {
      // Default to 1 exercise with 3 sets
      const firstEx = exercises[0];
      setWorkoutExercises([
        {
          exercise_id: firstEx.id,
          order_index: 1,
          sets: [
            { set_number: 1, set_type: 'warmup', reps: 10, weight_kg: 50, rpe: 6.0 },
            { set_number: 2, set_type: 'normal', reps: 8, weight_kg: 80, rpe: 7.5 },
            { set_number: 3, set_type: 'normal', reps: 6, weight_kg: 95, rpe: 8.5 },
          ],
        },
      ]);
    }
    setIsModalOpen(true);
  };

  const handleAddExerciseToWorkout = (exerciseId: number) => {
    setWorkoutExercises([
      ...workoutExercises,
      {
        exercise_id: exerciseId,
        order_index: workoutExercises.length + 1,
        sets: [
          { set_number: 1, set_type: 'normal', reps: 10, weight_kg: 60, rpe: 7.0 },
          { set_number: 2, set_type: 'normal', reps: 10, weight_kg: 60, rpe: 7.5 },
          { set_number: 3, set_type: 'normal', reps: 8, weight_kg: 65, rpe: 8.5 },
        ],
      },
    ]);
  };

  const handleRemoveExercise = (index: number) => {
    setWorkoutExercises(workoutExercises.filter((_, i) => i !== index));
  };

  const handleAddSet = (exerciseIndex: number) => {
    const updated = [...workoutExercises];
    const currentSets = updated[exerciseIndex].sets;
    const lastSet = currentSets[currentSets.length - 1];
    currentSets.push({
      set_number: currentSets.length + 1,
      set_type: 'normal',
      reps: lastSet ? lastSet.reps : 10,
      weight_kg: lastSet ? lastSet.weight_kg : 60,
      rpe: 8.0,
    });
    setWorkoutExercises(updated);
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...workoutExercises];
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, i) => i !== setIndex);
    // Re-index set numbers
    updated[exerciseIndex].sets.forEach((s, idx) => {
      s.set_number = idx + 1;
    });
    setWorkoutExercises(updated);
  };

  const handleSetChange = (exerciseIndex: number, setIndex: number, field: string, val: any) => {
    const updated = [...workoutExercises];
    (updated[exerciseIndex].sets[setIndex] as any)[field] = val;
    setWorkoutExercises(updated);
  };

  // Live total volume calculation
  const liveVolume = workoutExercises.reduce((total, ex) => {
    return total + ex.sets.reduce((exTotal, s) => {
      if (s.set_type !== 'warmup') {
        return exTotal + (s.weight_kg * s.reps);
      }
      return exTotal;
    }, 0);
  }, 0);

  const handleSubmitWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (workoutExercises.length === 0) {
      alert('Please add at least one exercise to your workout');
      return;
    }

    try {
      const payload: WorkoutCreatePayload = {
        user_id: currentUser.id,
        title: workoutTitle,
        notes: workoutNotes,
        duration_mins: durationMins,
        status: 'completed',
        exercises: workoutExercises.map((we) => ({
          exercise_id: we.exercise_id,
          order_index: we.order_index,
          notes: we.notes,
          sets: we.sets.map((s) => ({
            set_number: s.set_number,
            set_type: s.set_type,
            reps: Number(s.reps),
            weight_kg: Number(s.weight_kg),
            rpe: s.rpe ? Number(s.rpe) : undefined,
          })),
        })),
      };

      await api.createWorkout(payload);
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to record workout session');
    }
  };

  const handleDeleteWorkout = async (id: number) => {
    if (confirm('Delete this workout session and all associated sets?')) {
      try {
        await api.deleteWorkout(id);
        setWorkouts(workouts.filter((w) => w.id !== id));
      } catch (err: any) {
        alert(err.message || 'Failed to delete workout');
      }
    }
  };

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Workout Logging & History
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
            Detailed set-by-set tracker with automatic volume tonnage calculation and PR detection.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          {/* Quick Rest Timer bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-surface)', padding: '6px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-card)' }}>
            <Timer size={16} color="var(--color-secondary)" />
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, fontFamily: 'var(--font-family-mono)', color: isTimerRunning ? 'var(--color-primary)' : 'var(--text-main)' }}>
              {Math.floor(timerSeconds / 60)}:{timerSeconds % 60 < 10 ? `0${timerSeconds % 60}` : timerSeconds % 60}
            </span>
            {isTimerRunning ? (
              <button onClick={() => setIsTimerRunning(false)} style={{ color: 'var(--color-accent-amber)' }}>
                <Pause size={14} />
              </button>
            ) : (
              <button onClick={() => startTimer(timerInitial)} style={{ color: 'var(--color-primary)' }}>
                <Play size={14} />
              </button>
            )}
            <button onClick={() => { setIsTimerRunning(false); setTimerSeconds(0); }} style={{ color: 'var(--text-dim)' }}>
              <RotateCcw size={14} />
            </button>
            <div style={{ display: 'flex', gap: '4px', marginLeft: '4px' }}>
              <button onClick={() => startTimer(60)} className="btn btn-secondary btn-sm" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>60s</button>
              <button onClick={() => startTimer(90)} className="btn btn-secondary btn-sm" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>90s</button>
              <button onClick={() => startTimer(120)} className="btn btn-secondary btn-sm" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>2m</button>
            </div>
          </div>

          <button onClick={handleOpenModal} className="btn btn-primary">
            <Plus size={16} />
            <span>Record Workout</span>
          </button>
        </div>
      </div>

      {/* Workout History List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-2xl) 0', color: 'var(--text-muted)' }}>
          Loading workout sessions...
        </div>
      ) : workouts.length === 0 ? (
        <div className="fit-card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <Dumbbell size={48} color="var(--text-dim)" style={{ margin: '0 auto var(--space-md)' }} />
          <h3 className="card-title">No workout sessions logged yet</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Click "Record Workout" above to log your first session with exercises, weights, and reps.
          </p>
          <button onClick={handleOpenModal} className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
            Start Logging
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {workouts.map((workout) => {
            const isExpanded = expandedWorkoutId === workout.id;
            return (
              <div key={workout.id} className="fit-card" style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <button
                      onClick={() => setExpandedWorkoutId(isExpanded ? null : workout.id)}
                      style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }}
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    <div>
                      <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-main)' }}>
                        {workout.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', marginTop: '2px' }}>
                        <Calendar size={13} />
                        <span>{new Date(workout.started_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <Clock size={13} />
                        <span>{workout.duration_mins} mins</span>
                        <span>•</span>
                        <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                          {workout.total_volume_kg.toLocaleString()} kg total volume
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <span className="badge badge-lime">{workout.status}</span>
                    <button
                      onClick={() => handleDeleteWorkout(workout.id)}
                      className="btn btn-danger btn-sm"
                      title="Delete workout"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Collapsible Exercises & Sets Details */}
                {isExpanded && (
                  <div style={{ marginTop: 'var(--space-lg)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-md)' }}>
                    {workout.notes && (
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-dim)', fontStyle: 'italic', marginBottom: 'var(--space-md)' }}>
                        Notes: "{workout.notes}"
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                      {workout.exercises.map((we, exIdx) => (
                        <div
                          key={we.id || exIdx}
                          style={{
                            backgroundColor: 'var(--bg-surface-elevated)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-md)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-secondary)' }}>
                                #{exIdx + 1}
                              </span>
                              <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--text-main)' }}>
                                {we.exercise?.name || `Exercise ID: ${we.exercise_id}`}
                              </span>
                              <span className="badge badge-cyan">{we.exercise?.category || 'Exercise'}</span>
                            </div>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-dim)' }}>
                              Equipment: {we.exercise?.equipment || 'Barbell'}
                            </span>
                          </div>

                          <table className="set-table">
                            <thead>
                              <tr>
                                <th style={{ width: '60px' }}>Set</th>
                                <th>Type</th>
                                <th>Weight (kg)</th>
                                <th>Reps</th>
                                <th>RPE</th>
                                <th>Tonnage</th>
                                <th>Record</th>
                              </tr>
                            </thead>
                            <tbody>
                              {we.sets.map((set, sIdx) => {
                                const tonnage = set.set_type === 'warmup' ? 0 : set.weight_kg * set.reps;
                                return (
                                  <tr key={set.id || sIdx} className={set.is_personal_record ? 'set-row-highlight' : ''}>
                                    <td>
                                      <div className="set-number-chip">{set.set_number}</div>
                                    </td>
                                    <td>
                                      <span style={{ 
                                        textTransform: 'capitalize', 
                                        fontWeight: 600, 
                                        fontSize: '0.75rem',
                                        color: set.set_type === 'warmup' ? 'var(--text-dim)' : set.set_type === 'failure' ? 'var(--color-accent-fire)' : 'var(--text-main)' 
                                      }}>
                                        {set.set_type}
                                      </span>
                                    </td>
                                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                                      {set.weight_kg} kg
                                    </td>
                                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                                      {set.reps}
                                    </td>
                                    <td style={{ color: 'var(--text-muted)' }}>
                                      {set.rpe ? `@ ${set.rpe}` : '-'}
                                    </td>
                                    <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                                      {tonnage > 0 ? `${tonnage.toLocaleString()} kg` : '-'}
                                    </td>
                                    <td>
                                      {set.is_personal_record && (
                                        <span className="badge badge-pr">
                                          <Trophy size={11} /> PR
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Record Workout Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog modal-dialog-large">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Dumbbell size={22} color="var(--color-primary)" />
                <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-main)' }}>
                  Record Workout Session
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitWorkout}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {/* Session Meta */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Workout Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={workoutTitle}
                      onChange={(e) => setWorkoutTitle(e.target.value)}
                      placeholder="e.g. Chest & Tricep Hypertrophy"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Duration (Mins)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={durationMins}
                      onChange={(e) => setDurationMins(Number(e.target.value))}
                      min="1"
                      max="300"
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Workout Notes / Focus</label>
                  <input
                    type="text"
                    className="form-input"
                    value={workoutNotes}
                    onChange={(e) => setWorkoutNotes(e.target.value)}
                    placeholder="e.g. Felt great energy, pushed RPE 9 on last set"
                  />
                </div>

                {/* Live Volume Tonnage Counter */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Calculated Session Volume Tonnage:
                  </div>
                  <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--color-primary)' }}>
                    {liveVolume.toLocaleString()} kg
                  </div>
                </div>

                {/* Exercises Builder */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                      Exercises & Working Sets ({workoutExercises.length})
                    </div>
                  </div>

                  {workoutExercises.map((we, exIdx) => {
                    return (
                      <div
                        key={exIdx}
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-card)',
                          borderRadius: 'var(--radius-md)',
                          padding: 'var(--space-md)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: 'var(--space-sm)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
                            <span style={{ fontWeight: 800, color: 'var(--color-secondary)' }}>#{exIdx + 1}</span>
                            <select
                              className="form-select"
                              value={we.exercise_id}
                              onChange={(e) => {
                                const updated = [...workoutExercises];
                                updated[exIdx].exercise_id = Number(e.target.value);
                                setWorkoutExercises(updated);
                              }}
                            >
                              {exercises.map((ex) => (
                                <option key={ex.id} value={ex.id}>
                                  {ex.name} ({ex.category} • {ex.equipment})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleAddSet(exIdx)}
                              className="btn btn-secondary btn-sm"
                            >
                              + Add Set
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveExercise(exIdx)}
                              className="btn btn-danger btn-sm"
                              title="Remove exercise"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Sets Table */}
                        <table className="set-table">
                          <thead>
                            <tr>
                              <th style={{ width: '50px' }}>Set</th>
                              <th style={{ width: '120px' }}>Type</th>
                              <th>Weight (kg)</th>
                              <th>Reps</th>
                              <th style={{ width: '90px' }}>RPE</th>
                              <th style={{ width: '50px' }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {we.sets.map((set, sIdx) => (
                              <tr key={sIdx}>
                                <td>
                                  <div className="set-number-chip">{set.set_number}</div>
                                </td>
                                <td>
                                  <select
                                    className="form-select"
                                    style={{ padding: '6px 8px', fontSize: '0.75rem' }}
                                    value={set.set_type}
                                    onChange={(e) => handleSetChange(exIdx, sIdx, 'set_type', e.target.value)}
                                  >
                                    <option value="warmup">Warmup</option>
                                    <option value="normal">Normal</option>
                                    <option value="drop">Drop Set</option>
                                    <option value="failure">To Failure</option>
                                  </select>
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    className="form-input"
                                    style={{ padding: '6px 8px' }}
                                    value={set.weight_kg}
                                    onChange={(e) => handleSetChange(exIdx, sIdx, 'weight_kg', e.target.value)}
                                    required
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    min="1"
                                    className="form-input"
                                    style={{ padding: '6px 8px' }}
                                    value={set.reps}
                                    onChange={(e) => handleSetChange(exIdx, sIdx, 'reps', e.target.value)}
                                    required
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="1"
                                    max="10"
                                    className="form-input"
                                    style={{ padding: '6px 8px' }}
                                    value={set.rpe || ''}
                                    onChange={(e) => handleSetChange(exIdx, sIdx, 'rpe', e.target.value)}
                                    placeholder="e.g. 8.5"
                                  />
                                </td>
                                <td>
                                  {we.sets.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSet(exIdx, sIdx)}
                                      style={{ color: 'var(--color-accent-fire)' }}
                                    >
                                      <X size={16} />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}

                  {/* Add another exercise picker */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select
                      id="select-add-exercise"
                      className="form-select"
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddExerciseToWorkout(Number(e.target.value));
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="" disabled>+ Select an exercise to append...</option>
                      {exercises.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name} ({ex.category} • {ex.equipment})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>Save Workout Session</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
