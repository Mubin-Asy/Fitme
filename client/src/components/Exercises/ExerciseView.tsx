import React, { useState, useEffect } from 'react';
import type { Exercise } from '../../types';
import { api } from '../../services/api';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Check,
  X,
  Sparkles 
} from 'lucide-react';

export const ExerciseView: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // New Exercise Form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Chest');
  const [primaryMuscle, setPrimaryMuscle] = useState('');
  const [secondaryMuscles, setSecondaryMuscles] = useState('');
  const [equipment, setEquipment] = useState('Barbell');
  const [instructions, setInstructions] = useState('');
  const [isCompound, setIsCompound] = useState(false);

  const categories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];
  const equipments = ['All', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight'];

  const loadExercises = async () => {
    try {
      setIsLoading(true);
      const data = await api.getExercises(
        selectedCategory === 'All' ? undefined : selectedCategory,
        searchQuery || undefined
      );
      setExercises(data);
    } catch (err) {
      console.error('Error fetching exercises:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, [selectedCategory, searchQuery]);

  const filteredExercises = exercises.filter((ex) => {
    if (selectedEquipment !== 'All' && ex.equipment.toLowerCase() !== selectedEquipment.toLowerCase()) {
      return false;
    }
    return true;
  });

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createExercise({
        name,
        category,
        primary_muscle: primaryMuscle,
        secondary_muscles: secondaryMuscles || undefined,
        equipment,
        instructions: instructions || undefined,
        is_compound: isCompound,
      });
      setIsModalOpen(false);
      setName('');
      setPrimaryMuscle('');
      setSecondaryMuscles('');
      setInstructions('');
      await loadExercises();
    } catch (err: any) {
      alert(err.message || 'Failed to create exercise');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Exercise Movement Library
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
            Curated database of biomechanically verified strength and conditioning movements.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Custom Movement</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search exercise by name or target muscle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Equipment selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>Equipment:</span>
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
            >
              {equipments.map((eq) => (
                <option key={eq} value={eq}>{eq}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Cards Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-2xl) 0', color: 'var(--text-muted)' }}>
          Loading exercises...
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="fit-card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <BookOpen size={48} color="var(--text-dim)" style={{ margin: '0 auto var(--space-md)' }} />
          <h3 className="card-title">No exercises match your filter</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Try adjusting your search terms or category filter.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-md)' }}>
          {filteredExercises.map((ex) => (
            <div key={ex.id} className="fit-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: 'var(--space-xs)' }}>
                  <div>
                    <span className="badge badge-cyan">{ex.category}</span>
                    {ex.is_compound && (
                      <span className="badge badge-lime" style={{ marginLeft: '6px' }}>
                        <Sparkles size={11} /> Compound
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-dim)', fontWeight: 600 }}>
                    {ex.equipment}
                  </span>
                </div>

                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--text-main)', marginTop: '8px' }}>
                  {ex.name}
                </h3>

                <div style={{ marginTop: '8px', fontSize: 'var(--font-size-xs)' }}>
                  <div>
                    <strong style={{ color: 'var(--text-muted)' }}>Primary Muscle:</strong>{' '}
                    <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{ex.primary_muscle}</span>
                  </div>
                  {ex.secondary_muscles && (
                    <div style={{ marginTop: '2px' }}>
                      <strong style={{ color: 'var(--text-dim)' }}>Secondary:</strong>{' '}
                      <span style={{ color: 'var(--text-muted)' }}>{ex.secondary_muscles}</span>
                    </div>
                  )}
                </div>

                {ex.instructions && (
                  <p style={{ marginTop: 'var(--space-sm)', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45, borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-xs)' }}>
                    {ex.instructions}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Create New Exercise */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} color="var(--color-primary)" />
                <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
                  Add Custom Movement
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateExercise}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Exercise Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Pendlay Row"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Category</label>
                    <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="Chest">Chest</option>
                      <option value="Back">Back</option>
                      <option value="Legs">Legs</option>
                      <option value="Shoulders">Shoulders</option>
                      <option value="Arms">Arms</option>
                      <option value="Core">Core</option>
                      <option value="Cardio">Cardio</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Equipment</label>
                    <select className="form-select" value={equipment} onChange={(e) => setEquipment(e.target.value)}>
                      <option value="Barbell">Barbell</option>
                      <option value="Dumbbell">Dumbbell</option>
                      <option value="Cable">Cable</option>
                      <option value="Machine">Machine</option>
                      <option value="Bodyweight">Bodyweight</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Primary Target Muscle</label>
                    <input
                      type="text"
                      className="form-input"
                      value={primaryMuscle}
                      onChange={(e) => setPrimaryMuscle(e.target.value)}
                      placeholder="e.g. Latissimus Dorsi"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Secondary Muscles (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={secondaryMuscles}
                      onChange={(e) => setSecondaryMuscles(e.target.value)}
                      placeholder="e.g. Rhomboids, Biceps"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Execution Instructions & Form Cues</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Key technical checkpoints, tempo, breathing..."
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="compound-check"
                    checked={isCompound}
                    onChange={(e) => setIsCompound(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                  />
                  <label htmlFor="compound-check" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-main)', cursor: 'pointer' }}>
                    Multi-joint compound movement
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>Save Exercise</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
