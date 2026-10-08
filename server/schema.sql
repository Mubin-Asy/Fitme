-- =============================================================================
-- FITME: PostgreSQL Production Schema Definition
-- References: "PostgreSQL: Up and Running: A Practical Guide to the Advanced Open Source Database"
-- Principles applied:
--  - GENERATED ALWAYS AS IDENTITY for high-performance sequences
--  - Foreign Key constraints with explicit ON DELETE CASCADE
--  - CHECK constraints ensuring domain integrity (weights >= 0, reps > 0)
--  - Composite B-Tree indexes for user time-series querying
--  - GIN indexing on JSONB columns for flexible tagging & workout metadata
--  - PostgreSQL Views for analytical aggregation (PRs, Weekly Volume)
--  - Constraint enforcement for max 10 users in private group tier
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. Users Table (Restricted to maximum 10 accounts for the private group)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    bio TEXT,
    fitness_goal VARCHAR(100) DEFAULT 'General Fitness',
    target_calories INT DEFAULT 2200 CHECK (target_calories >= 500 AND target_calories <= 10000),
    target_water_ml INT DEFAULT 3000 CHECK (target_water_ml >= 500 AND target_water_ml <= 10000),
    target_weight_kg NUMERIC(5,2) CHECK (target_weight_kg > 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Trigger to guard max 10 users limit
CREATE OR REPLACE FUNCTION check_max_users_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM users) >= 10 THEN
        RAISE EXCEPTION 'Maximum allowed users (10) for this Fitme installation has been reached.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_user_limit ON users;
CREATE TRIGGER trg_enforce_user_limit
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION check_max_users_limit();

-- -----------------------------------------------------------------------------
-- 2. Exercise Library
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exercises (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL, -- Chest, Back, Legs, Shoulders, Arms, Core, Cardio
    primary_muscle VARCHAR(50) NOT NULL,
    secondary_muscles VARCHAR(100),
    equipment VARCHAR(50) NOT NULL DEFAULT 'Barbell', -- Barbell, Dumbbell, Machine, Cable, Bodyweight
    instructions TEXT,
    is_compound BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises (category);
CREATE INDEX IF NOT EXISTS idx_exercises_primary_muscle ON exercises (primary_muscle);

-- -----------------------------------------------------------------------------
-- 3. Workouts (Sessions)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workouts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    notes TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    duration_mins INT DEFAULT 0 CHECK (duration_mins >= 0),
    total_volume_kg NUMERIC(10,2) DEFAULT 0 CHECK (total_volume_kg >= 0),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'discarded')),
    metadata JSONB DEFAULT '{}'::jsonb, -- Flexible tags, RPE overall, heart rate
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts (user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_metadata_gin ON workouts USING gin (metadata);

-- -----------------------------------------------------------------------------
-- 4. Workout Exercises & Sets
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workout_exercises (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    workout_id BIGINT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id BIGINT NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
    order_index INT NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON workout_exercises (workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise ON workout_exercises (exercise_id);

CREATE TABLE IF NOT EXISTS exercise_sets (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    workout_exercise_id BIGINT NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
    set_number INT NOT NULL CHECK (set_number > 0),
    set_type VARCHAR(20) DEFAULT 'normal' CHECK (set_type IN ('warmup', 'normal', 'drop', 'failure')),
    reps INT NOT NULL CHECK (reps > 0),
    weight_kg NUMERIC(6,2) NOT NULL DEFAULT 0.0 CHECK (weight_kg >= 0),
    rpe NUMERIC(3,1) CHECK (rpe >= 1.0 AND rpe <= 10.0),
    is_personal_record BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exercise_sets_we ON exercise_sets (workout_exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_weight ON exercise_sets (weight_kg DESC);

-- -----------------------------------------------------------------------------
-- 5. Daily Nutrition & Hydration Logs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nutrition_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_type VARCHAR(30) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout')),
    food_name VARCHAR(150) NOT NULL,
    calories INT NOT NULL CHECK (calories >= 0),
    protein_g NUMERIC(5,1) NOT NULL DEFAULT 0 CHECK (protein_g >= 0),
    carbs_g NUMERIC(5,1) NOT NULL DEFAULT 0 CHECK (carbs_g >= 0),
    fat_g NUMERIC(5,1) NOT NULL DEFAULT 0 CHECK (fat_g >= 0),
    water_ml INT DEFAULT 0 CHECK (water_ml >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_nutrition_user_date ON nutrition_logs (user_id, log_date DESC);

-- -----------------------------------------------------------------------------
-- 6. Body Composition & Recovery Metrics
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS body_metrics (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    weight_kg NUMERIC(5,2) NOT NULL CHECK (weight_kg > 0),
    body_fat_pct NUMERIC(4,1) CHECK (body_fat_pct >= 3.0 AND body_fat_pct <= 60.0),
    muscle_mass_kg NUMERIC(5,2) CHECK (muscle_mass_kg > 0),
    resting_heart_rate INT CHECK (resting_heart_rate >= 30 AND resting_heart_rate <= 220),
    sleep_hours NUMERIC(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
    energy_level INT CHECK (energy_level >= 1 AND energy_level <= 10),
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_body_metrics_user_date ON body_metrics (user_id, recorded_at DESC);

-- -----------------------------------------------------------------------------
-- 7. Analytical Views (PostgreSQL: Up and Running Chapters on Views & Aggregation)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_personal_records AS
SELECT 
    w.user_id,
    u.username,
    e.id AS exercise_id,
    e.name AS exercise_name,
    e.category,
    MAX(s.weight_kg) AS max_weight_kg,
    MAX(s.weight_kg * (1 + s.reps::numeric / 30.0)) AS estimated_1rm,
    MAX(w.started_at) AS latest_achieved_at
FROM exercise_sets s
JOIN workout_exercises we ON s.workout_exercise_id = we.id
JOIN workouts w ON we.workout_id = w.id
JOIN exercises e ON we.exercise_id = e.id
JOIN users u ON w.user_id = u.id
WHERE s.set_type != 'warmup'
GROUP BY w.user_id, u.username, e.id, e.name, e.category;

CREATE OR REPLACE VIEW v_weekly_volume AS
SELECT 
    user_id,
    DATE_TRUNC('week', started_at) AS workout_week,
    COUNT(id) AS total_workouts,
    SUM(total_volume_kg) AS total_tonnage_kg,
    SUM(duration_mins) AS total_duration_mins
FROM workouts
WHERE status = 'completed'
GROUP BY user_id, DATE_TRUNC('week', started_at);
