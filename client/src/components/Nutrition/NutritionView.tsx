import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import type { NutritionLog } from '../../types';
import { api } from '../../services/api';
import { 
  Flame, 
  Droplets, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Apple, 
  Coffee 
} from 'lucide-react';

interface NutritionViewProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const NutritionView: React.FC<NutritionViewProps> = ({ isModalOpen, setIsModalOpen }) => {
  const { currentUser } = useUser();
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form State
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout'>('breakfast');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState<number>(450);
  const [protein, setProtein] = useState<number>(35);
  const [carbs, setCarbs] = useState<number>(45);
  const [fat, setFat] = useState<number>(12);
  const [waterMl, setWaterMl] = useState<number>(300);

  const loadLogs = async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      const data = await api.getNutritionLogs(currentUser.id, selectedDate);
      setLogs(data);
    } catch (err) {
      console.error('Error fetching nutrition logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [currentUser, selectedDate]);

  const totalCalories = logs.reduce((acc, l) => acc + l.calories, 0);
  const totalProtein = Math.round(logs.reduce((acc, l) => acc + l.protein_g, 0));
  const totalCarbs = Math.round(logs.reduce((acc, l) => acc + l.carbs_g, 0));
  const totalFat = Math.round(logs.reduce((acc, l) => acc + l.fat_g, 0));
  const totalWater = logs.reduce((acc, l) => acc + l.water_ml, 0);

  const targetCalories = currentUser?.target_calories || 2400;
  const targetWater = currentUser?.target_water_ml || 3200;

  const handleAddQuickWater = async (amount: number) => {
    if (!currentUser) return;
    try {
      await api.createNutritionLog({
        user_id: currentUser.id,
        log_date: selectedDate,
        meal_type: 'snack',
        food_name: amount >= 1000 ? 'Hydration Jug' : amount >= 500 ? 'Hydration Shaker' : 'Glass of Water',
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        water_ml: amount,
      });
      await loadLogs();
    } catch (err: any) {
      alert(err.message || 'Failed to log water');
    }
  };

  const handleCreateMealLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await api.createNutritionLog({
        user_id: currentUser.id,
        log_date: selectedDate,
        meal_type: mealType,
        food_name: foodName,
        calories: Number(calories),
        protein_g: Number(protein),
        carbs_g: Number(carbs),
        fat_g: Number(fat),
        water_ml: Number(waterMl),
      });
      setIsModalOpen(false);
      setFoodName('');
      await loadLogs();
    } catch (err: any) {
      alert(err.message || 'Failed to create nutrition log');
    }
  };

  const handleDeleteLog = async (id: number) => {
    try {
      await api.deleteNutritionLog(id);
      setLogs(logs.filter((l) => l.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete log entry');
    }
  };

  const waterLevelPct = Math.min(Math.round((totalWater / targetWater) * 100), 100);
  const calLevelPct = Math.min(Math.round((totalCalories / targetCalories) * 100), 100);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Nutrition & Hydration Tracking
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
            Fuel your recovery. Track macros and ensure optimal daily hydration.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <input
            type="date"
            className="form-input"
            style={{ width: 'auto' }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Log Meal</span>
          </button>
        </div>
      </div>

      {/* Overview Cards: Calories, Macros, and Water */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
        {/* Caloric Intake Card */}
        <div className="fit-card">
          <div className="fit-card-header">
            <div className="card-title-group">
              <Flame size={20} color="var(--color-accent-fire)" />
              <h2 className="card-title">Daily Energy Balance</h2>
            </div>
            <span className="badge badge-gold">{calLevelPct}% Target</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: 'var(--font-size-hero)', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
              {totalCalories}
            </span>
            <span style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-dim)', fontWeight: 600 }}>
              / {targetCalories} kcal
            </span>
          </div>

          <div style={{ marginTop: 'var(--space-md)' }}>
            <div className="progress-bar-track" style={{ height: '12px' }}>
              <div className="progress-bar-fill progress-fill-fire" style={{ width: `${calLevelPct}%` }} />
            </div>
          </div>

          {/* Macros breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
            <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--color-primary)' }}>{totalProtein}g</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Protein</div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--color-secondary)' }}>{totalCarbs}g</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Carbs</div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--color-accent-amber)' }}>{totalFat}g</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fats</div>
            </div>
          </div>
        </div>

        {/* Hydration Tracker Card */}
        <div className="fit-card">
          <div className="fit-card-header">
            <div className="card-title-group">
              <Droplets size={20} color="var(--color-secondary)" />
              <h2 className="card-title">Hydration Intake</h2>
            </div>
            <span className="badge badge-cyan">{waterLevelPct}% Hydrated</span>
          </div>

          <div className="water-tracker-container">
            <div className="water-glass-graphic">
              <div className="water-fill-level" style={{ height: `${waterLevelPct}%` }} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-secondary)' }}>
                {totalWater} <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-dim)', fontWeight: 500 }}>ml</span>
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                Daily Target: {targetWater} ml
              </div>

              {/* Quick Add Water Buttons */}
              <div style={{ display: 'flex', gap: '6px', marginTop: 'var(--space-md)', flexWrap: 'wrap' }}>
                <button onClick={() => handleAddQuickWater(250)} className="btn btn-secondary btn-sm">
                  +250 ml (Glass)
                </button>
                <button onClick={() => handleAddQuickWater(500)} className="btn btn-secondary btn-sm">
                  +500 ml (Shaker)
                </button>
                <button onClick={() => handleAddQuickWater(1000)} className="btn btn-secondary btn-sm">
                  +1000 ml (Jug)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logged Meals List */}
      <div className="fit-card">
        <div className="fit-card-header">
          <div className="card-title-group">
            <Apple size={20} color="var(--color-primary)" />
            <h2 className="card-title">Meals & Snacks Logged for {selectedDate}</h2>
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-lg) 0', color: 'var(--text-muted)' }}>
            Loading nutrition items...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0', color: 'var(--text-muted)' }}>
            <Coffee size={36} color="var(--text-dim)" style={{ margin: '0 auto var(--space-sm)' }} />
            <p>No meals or snacks recorded for this date yet.</p>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-outline-primary btn-sm" style={{ marginTop: 'var(--space-sm)' }}>
              Log Your First Meal
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-sm) var(--space-md)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <span className="badge badge-lime" style={{ textTransform: 'capitalize' }}>
                    {log.meal_type.replace('_', ' ')}
                  </span>
                  <div>
                    <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--text-main)' }}>
                      {log.food_name}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'flex', gap: '10px', marginTop: '2px' }}>
                      <span>P: {log.protein_g}g</span>
                      <span>C: {log.carbs_g}g</span>
                      <span>F: {log.fat_g}g</span>
                      {log.water_ml > 0 && <span>💧 {log.water_ml}ml</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--text-main)' }}>
                    {log.calories} kcal
                  </span>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="btn btn-danger btn-sm"
                    title="Remove item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: Log Meal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={20} color="var(--color-accent-fire)" />
                <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
                  Log Food / Meal
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateMealLog}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Meal Timing</label>
                    <select
                      className="form-select"
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value as any)}
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                      <option value="pre_workout">Pre-Workout</option>
                      <option value="post_workout">Post-Workout</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Total Calories (kcal)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={calories}
                      onChange={(e) => setCalories(Number(e.target.value))}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Food Description</label>
                  <input
                    type="text"
                    className="form-input"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="e.g. Grilled Chicken Breast with Brown Rice"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-sm)' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Protein (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={protein}
                      onChange={(e) => setProtein(Number(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Carbs (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={carbs}
                      onChange={(e) => setCarbs(Number(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Fat (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={fat}
                      onChange={(e) => setFat(Number(e.target.value))}
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Water with Meal (ml)</label>
                  <input
                    type="number"
                    step="50"
                    className="form-input"
                    value={waterMl}
                    onChange={(e) => setWaterMl(Number(e.target.value))}
                    min="0"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>Save Meal Entry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
