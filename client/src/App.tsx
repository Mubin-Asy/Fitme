import { useState } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { Header } from './components/Layout/Header';
import { DashboardView } from './components/Dashboard/DashboardView';
import { WorkoutView } from './components/Workouts/WorkoutView';
import { ExerciseView } from './components/Exercises/ExerciseView';
import { NutritionView } from './components/Nutrition/NutritionView';
import { MetricsView } from './components/Metrics/MetricsView';
import { GroupView } from './components/Group/GroupView';
import { AddMemberModal } from './components/Group/AddMemberModal';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Global Modal Open States
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState<boolean>(false);
  const [isNutritionModalOpen, setIsNutritionModalOpen] = useState<boolean>(false);
  const [isMetricModalOpen, setIsMetricModalOpen] = useState<boolean>(false);
  const [isNewMemberModalOpen, setIsNewMemberModalOpen] = useState<boolean>(false);

  const { isLoading } = useUser();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid var(--border-card)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
          Connecting to Fitme API & Loading 10-Athlete Circle...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Navigation & Athlete Profile Switcher */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewMemberModal={() => setIsNewMemberModalOpen(true)}
      />

      {/* Main Content View Container */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <DashboardView
            onStartWorkout={() => {
              setActiveTab('workouts');
              setIsWorkoutModalOpen(true);
            }}
            onLogMeal={() => {
              setActiveTab('nutrition');
              setIsNutritionModalOpen(true);
            }}
            onRecordMetric={() => {
              setActiveTab('metrics');
              setIsMetricModalOpen(true);
            }}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'workouts' && (
          <WorkoutView
            isModalOpen={isWorkoutModalOpen}
            setIsModalOpen={setIsWorkoutModalOpen}
          />
        )}

        {activeTab === 'exercises' && <ExerciseView />}

        {activeTab === 'nutrition' && (
          <NutritionView
            isModalOpen={isNutritionModalOpen}
            setIsModalOpen={setIsNutritionModalOpen}
          />
        )}

        {activeTab === 'metrics' && (
          <MetricsView
            isModalOpen={isMetricModalOpen}
            setIsModalOpen={setIsMetricModalOpen}
          />
        )}

        {activeTab === 'group' && (
          <GroupView
            onOpenNewMemberModal={() => setIsNewMemberModalOpen(true)}
            onNavigateTab={setActiveTab}
          />
        )}
      </main>

      {/* Add Athlete Modal */}
      <AddMemberModal
        isOpen={isNewMemberModalOpen}
        onClose={() => setIsNewMemberModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <MainAppContent />
    </UserProvider>
  );
}
