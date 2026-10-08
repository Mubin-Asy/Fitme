export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  role: 'admin' | 'member';
  bio?: string;
  fitness_goal?: string;
  target_calories: number;
  target_water_ml: number;
  target_weight_kg?: number;
  is_active: boolean;
  created_at: string;
}

export interface Exercise {
  id: number;
  name: string;
  category: string;
  primary_muscle: string;
  secondary_muscles?: string;
  equipment: string;
  instructions?: string;
  is_compound: boolean;
  created_at: string;
}

export interface ExerciseSet {
  id?: number;
  set_number: number;
  set_type: 'warmup' | 'normal' | 'drop' | 'failure';
  reps: number;
  weight_kg: number;
  rpe?: number;
  is_personal_record?: boolean;
}

export interface WorkoutExercise {
  id?: number;
  exercise_id: number;
  order_index: number;
  notes?: string;
  exercise?: Exercise;
  sets: ExerciseSet[];
}

export interface Workout {
  id: number;
  user_id: number;
  title: string;
  notes?: string;
  started_at: string;
  completed_at?: string;
  duration_mins: number;
  total_volume_kg: number;
  status: 'in_progress' | 'completed' | 'discarded';
  metadata_json?: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutCreatePayload {
  user_id: number;
  title: string;
  notes?: string;
  started_at?: string;
  duration_mins: number;
  status: string;
  exercises: {
    exercise_id: number;
    order_index: number;
    notes?: string;
    sets: {
      set_number: number;
      set_type: string;
      reps: number;
      weight_kg: number;
      rpe?: number;
      is_personal_record?: boolean;
    }[];
  }[];
}

export interface NutritionLog {
  id: number;
  user_id: number;
  log_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  water_ml: number;
  created_at: string;
}

export interface BodyMetric {
  id: number;
  user_id: number;
  recorded_at: string;
  weight_kg: number;
  body_fat_pct?: number;
  muscle_mass_kg?: number;
  resting_heart_rate?: number;
  sleep_hours?: number;
  energy_level?: number;
  notes?: string;
}

export interface PersonalRecordItem {
  exercise_id: number;
  exercise_name: string;
  category: string;
  max_weight_kg: number;
  reps_at_max: number;
  estimated_1rm: number;
  achieved_date: string;
}

export interface GroupLeaderboardItem {
  user_id: number;
  username: string;
  full_name: string;
  avatar_url?: string;
  workouts_count: number;
  total_volume_kg: number;
  total_duration_mins: number;
  streak_days: number;
  favorite_category: string;
}

export interface DashboardSummary {
  user: User;
  recent_workouts: Workout[];
  today_nutrition: {
    calories: number;
    target_calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    water_ml: number;
    target_water_ml: number;
    logs: NutritionLog[];
  };
  latest_metric?: BodyMetric;
  personal_records: PersonalRecordItem[];
  weekly_volume_kg: number;
  weekly_workouts_count: number;
  active_streak_days: number;
  group_leaderboard: GroupLeaderboardItem[];
}
