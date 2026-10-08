from datetime import datetime, date, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.exercise import Exercise
from app.models.workout import Workout
from app.models.set_log import WorkoutExercise, ExerciseSet
from app.models.nutrition import NutritionLog
from app.models.metric import BodyMetric
from app.core.security import get_password_hash

INITIAL_EXERCISES = [
    # Chest
    {"name": "Barbell Bench Press", "category": "Chest", "primary_muscle": "Pectorals", "secondary_muscles": "Triceps, Front Deltoids", "equipment": "Barbell", "is_compound": True, "instructions": "Lie on bench, lower bar with control to mid-chest, drive upward with full lockout."},
    {"name": "Incline Dumbbell Press", "category": "Chest", "primary_muscle": "Upper Chest", "secondary_muscles": "Triceps, Deltoids", "equipment": "Dumbbell", "is_compound": True, "instructions": "Set bench to 30 degrees, press dumbbells overhead in a smooth arc."},
    {"name": "Cable Chest Flyes", "category": "Chest", "primary_muscle": "Pectorals", "secondary_muscles": "Serratus", "equipment": "Cable", "is_compound": False, "instructions": "Position pulleys at chest height, squeeze handles together with slight elbow bend."},
    
    # Back
    {"name": "Barbell Deadlift", "category": "Back", "primary_muscle": "Erector Spinae", "secondary_muscles": "Hamstrings, Glutes, Lats, Traps", "equipment": "Barbell", "is_compound": True, "instructions": "Hinge at hips, keep flat back, drive heels into floor and lock hips at the top."},
    {"name": "Weighted Pull-Up", "category": "Back", "primary_muscle": "Latissimus Dorsi", "secondary_muscles": "Biceps, Upper Back", "equipment": "Bodyweight", "is_compound": True, "instructions": "Grip bar with palms away, pull chest to bar, lower under steady control."},
    {"name": "Chest-Supported T-Bar Row", "category": "Back", "primary_muscle": "Rhomboids", "secondary_muscles": "Lats, Rear Deltoids, Biceps", "equipment": "Machine", "is_compound": True, "instructions": "Rest torso on pad, pull handles back retracting shoulder blades aggressively."},
    {"name": "Lat Pulldown", "category": "Back", "primary_muscle": "Latissimus Dorsi", "secondary_muscles": "Biceps", "equipment": "Cable", "is_compound": True, "instructions": "Pull bar downward toward clavicle, engaging lats without excessive backward swing."},

    # Legs
    {"name": "Barbell Back Squat", "category": "Legs", "primary_muscle": "Quadriceps", "secondary_muscles": "Glutes, Hamstrings, Core", "equipment": "Barbell", "is_compound": True, "instructions": "Rest bar on upper traps, break at hips and knees, hit below parallel and explode up."},
    {"name": "Romanian Deadlift", "category": "Legs", "primary_muscle": "Hamstrings", "secondary_muscles": "Glutes, Lower Back", "equipment": "Barbell", "is_compound": True, "instructions": "Keep slight knee bend, push hips backward until deep hamstring stretch, thrust forward."},
    {"name": "Bulgarian Split Squat", "category": "Legs", "primary_muscle": "Quadriceps", "secondary_muscles": "Glutes, Adductors", "equipment": "Dumbbell", "is_compound": True, "instructions": "Elevate rear foot on bench, descend front thigh to parallel, push up through heel."},
    {"name": "Standing Calf Raise", "category": "Legs", "primary_muscle": "Gastrocnemius", "secondary_muscles": "Soleus", "equipment": "Machine", "is_compound": False, "instructions": "Full stretch at bottom, explosive rise onto balls of feet, hold 1s at peak contraction."},

    # Shoulders
    {"name": "Overhead Press (OHP)", "category": "Shoulders", "primary_muscle": "Anterior Deltoids", "secondary_muscles": "Lateral Deltoids, Triceps, Upper Chest", "equipment": "Barbell", "is_compound": True, "instructions": "Stand tall with braced core, press bar vertically clearing chin until overhead lockout."},
    {"name": "Dumbbell Lateral Raise", "category": "Shoulders", "primary_muscle": "Lateral Deltoids", "secondary_muscles": "Traps", "equipment": "Dumbbell", "is_compound": False, "instructions": "Raise dumbbells out to sides leading with elbows until parallel to ground."},
    {"name": "Face Pulls", "category": "Shoulders", "primary_muscle": "Rear Deltoids", "secondary_muscles": "Rotator Cuff, Rhomboids", "equipment": "Cable", "is_compound": False, "instructions": "Pull rope to forehead level while pulling hands apart to activate external rotators."},

    # Arms
    {"name": "Incline Dumbbell Curl", "category": "Arms", "primary_muscle": "Biceps Brachii", "secondary_muscles": "Brachialis", "equipment": "Dumbbell", "is_compound": False, "instructions": "Lie back on 45 deg incline, supinate forearms and curl upward for deep stretch."},
    {"name": "Dips (Triceps/Chest)", "category": "Arms", "primary_muscle": "Triceps", "secondary_muscles": "Lower Chest, Anterior Delts", "equipment": "Bodyweight", "is_compound": True, "instructions": "Lower body until arms reach 90 degrees, press upward locking triceps firmly."},
    {"name": "Cable Tricep Pushdown", "category": "Arms", "primary_muscle": "Triceps Lateral Head", "secondary_muscles": "Anconeus", "equipment": "Cable", "is_compound": False, "instructions": "Pin elbows to torso, push bar down with forceful tricep contraction."},
    {"name": "Hammer Curls", "category": "Arms", "primary_muscle": "Brachioradialis", "secondary_muscles": "Biceps", "equipment": "Dumbbell", "is_compound": False, "instructions": "Neutral grip palms facing inward, curl dumbbells maintaining rigid elbow position."},

    # Core & Cardio
    {"name": "Hanging Leg Raise", "category": "Core", "primary_muscle": "Rectus Abdominis", "secondary_muscles": "Hip Flexors", "equipment": "Bodyweight", "is_compound": False, "instructions": "Hang from bar, tilt pelvis up and raise legs without swinging momentum."},
    {"name": "Ab Wheel Rollout", "category": "Core", "primary_muscle": "Core Anti-Extension", "secondary_muscles": "Lats, Shoulders", "equipment": "Bodyweight", "is_compound": False, "instructions": "Kneel and roll wheel forward maintaining hollow body posture, pull back with abs."},
    {"name": "Rowing Machine Intervals", "category": "Cardio", "primary_muscle": "Full Body Cardio", "secondary_muscles": "Legs, Lats, Heart", "equipment": "Machine", "is_compound": True, "instructions": "Drive legs, hinge back, pull handle to lower ribs; return in reverse sequence."}
]

INITIAL_USERS = [
    {
        "email": "marcus@fitme.club", "username": "marcus_iron", "full_name": "Marcus Vance",
        "role": "admin", "bio": "Competitive powerlifter chasing 700kg total. Heavy squats and steak.",
        "fitness_goal": "Powerlifting Totals (SBD)", "target_calories": 3100, "target_water_ml": 4000,
        "target_weight_kg": 93.0, "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    },
    {
        "email": "elena@fitme.club", "username": "elena_lift", "full_name": "Elena Rostova",
        "role": "member", "bio": "Olympic weightlifter & hypertrophy enthusiast. Technique over ego.",
        "fitness_goal": "Hypertrophy & Clean/Jerk", "target_calories": 2400, "target_water_ml": 3500,
        "target_weight_kg": 64.0, "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
    },
    {
        "email": "jordan@fitme.club", "username": "jordan_cali", "full_name": "Jordan Lee",
        "role": "member", "bio": "Calisthenics & gymnastics ring master. Mastering human bodyweight leverage.",
        "fitness_goal": "Gymnastics Rings & Levers", "target_calories": 2600, "target_water_ml": 3200,
        "target_weight_kg": 72.0, "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    {
        "email": "sofia@fitme.club", "username": "sofia_hiit", "full_name": "Sofia Mendes",
        "role": "member", "bio": "CrossFit athlete. High intensity engine, kettlebells, and barbell cycling.",
        "fitness_goal": "Metabolic Conditioning & WODs", "target_calories": 2500, "target_water_ml": 3800,
        "target_weight_kg": 61.5, "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150"
    },
    {
        "email": "liam@fitme.club", "username": "liam_runner", "full_name": "Liam O'Connor",
        "role": "member", "bio": "Marathoner & Hyrox racer. Zone 2 training and hybrid strength.",
        "fitness_goal": "Sub-3h Marathon & Hyrox Pro", "target_calories": 3300, "target_water_ml": 4200,
        "target_weight_kg": 76.0, "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
    },
    {
        "email": "maya@fitme.club", "username": "maya_flow", "full_name": "Maya Patel",
        "role": "member", "bio": "Mobility specialist and yogi. Balance, joint resilience, and core stability.",
        "fitness_goal": "Mobility & Joint Longevity", "target_calories": 2000, "target_water_ml": 3000,
        "target_weight_kg": 55.0, "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    },
    {
        "email": "david@fitme.club", "username": "david_aesthetic", "full_name": "David Kim",
        "role": "member", "bio": "Classic physique competitor. Mind-muscle connection, symmetry and V-taper.",
        "fitness_goal": "Classic Bodybuilding Symmetry", "target_calories": 2800, "target_water_ml": 3600,
        "target_weight_kg": 84.0, "avatar_url": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150"
    },
    {
        "email": "chloe@fitme.club", "username": "chloe_bell", "full_name": "Chloe Dubois",
        "role": "member", "bio": "Hardstyle kettlebell trainer and rock climber. Grip strength obsessed.",
        "fitness_goal": "Grip Strength & Functional Power", "target_calories": 2250, "target_water_ml": 3100,
        "target_weight_kg": 59.0, "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    },
    {
        "email": "alex@fitme.club", "username": "alex_journey", "full_name": "Alex Rivera",
        "role": "member", "bio": "On a transformative weight loss journey. 15kg down, consistent everyday!",
        "fitness_goal": "Fat Loss & Metabolic Health", "target_calories": 2100, "target_water_ml": 3500,
        "target_weight_kg": 80.0, "avatar_url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
    },
    {
        "email": "sam@fitme.club", "username": "sam_coach", "full_name": "Sam Taylor",
        "role": "member", "bio": "Sprinting coach and track athlete. Explosive plyometrics and nervous system priming.",
        "fitness_goal": "Explosive Speed & Vertical Jump", "target_calories": 2900, "target_water_ml": 3900,
        "target_weight_kg": 78.5, "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150"
    }
]


def init_db(db: Session) -> None:
    # 1. Seed Exercises
    exercise_map = {}
    for ex_data in INITIAL_EXERCISES:
        existing = db.query(Exercise).filter(Exercise.name == ex_data["name"]).first()
        if not existing:
            ex = Exercise(**ex_data)
            db.add(ex)
            db.flush()
            exercise_map[ex.name] = ex
        else:
            exercise_map[existing.name] = existing

    # 2. Seed 10 Users
    user_map = {}
    for u_data in INITIAL_USERS:
        existing = db.query(User).filter(User.username == u_data["username"]).first()
        if not existing:
            u_dict = u_data.copy()
            u_dict["hashed_password"] = get_password_hash("fitme123")
            user = User(**u_dict)
            db.add(user)
            db.flush()
            user_map[user.username] = user
        else:
            user_map[existing.username] = existing

    # 3. Seed Realistic Workouts, Sets, Nutrition and Metrics for Marcus and Elena
    marcus = user_map.get("marcus_iron")
    if marcus and not db.query(Workout).filter(Workout.user_id == marcus.id).first():
        # Marcus Workout 1: Heavy Squat & Leg Day
        w1 = Workout(
            user_id=marcus.id,
            title="Heavy Squat & Lower Body Power",
            notes="Hit a new PR on Back Squat! Felt explosive out of the hole.",
            started_at=datetime.now(timezone.utc) - timedelta(days=2, hours=3),
            completed_at=datetime.now(timezone.utc) - timedelta(days=2, hours=1, minutes=45),
            duration_mins=75,
            total_volume_kg=8450.0,
            status="completed"
        )
        db.add(w1)
        db.flush()

        squat_ex = exercise_map.get("Barbell Back Squat")
        if squat_ex:
            we1 = WorkoutExercise(workout_id=w1.id, exercise_id=squat_ex.id, order_index=1, notes="Working sets @ RPE 8.5")
            db.add(we1)
            db.flush()
            db.add(ExerciseSet(workout_exercise_id=we1.id, set_number=1, set_type="warmup", reps=10, weight_kg=70.0, rpe=5.0))
            db.add(ExerciseSet(workout_exercise_id=we1.id, set_number=2, set_type="normal", reps=5, weight_kg=140.0, rpe=7.5))
            db.add(ExerciseSet(workout_exercise_id=we1.id, set_number=3, set_type="normal", reps=5, weight_kg=160.0, rpe=8.0))
            db.add(ExerciseSet(workout_exercise_id=we1.id, set_number=4, set_type="normal", reps=3, weight_kg=185.0, rpe=9.0, is_personal_record=True))

        rdl_ex = exercise_map.get("Romanian Deadlift")
        if rdl_ex:
            we2 = WorkoutExercise(workout_id=w1.id, exercise_id=rdl_ex.id, order_index=2, notes="Strict hip hinge, slow eccentric")
            db.add(we2)
            db.flush()
            db.add(ExerciseSet(workout_exercise_id=we2.id, set_number=1, set_type="normal", reps=8, weight_kg=120.0, rpe=7.0))
            db.add(ExerciseSet(workout_exercise_id=we2.id, set_number=2, set_type="normal", reps=8, weight_kg=130.0, rpe=8.0))
            db.add(ExerciseSet(workout_exercise_id=we2.id, set_number=3, set_type="normal", reps=8, weight_kg=130.0, rpe=8.5))

        # Marcus Workout 2: Heavy Bench & Chest Press
        w2 = Workout(
            user_id=marcus.id,
            title="Bench Press Mastery & Upper Body Volume",
            notes="Bar path was crisp. Triceps felt fresh.",
            started_at=datetime.now(timezone.utc) - timedelta(days=1, hours=2),
            completed_at=datetime.now(timezone.utc) - timedelta(days=1, hours=1),
            duration_mins=60,
            total_volume_kg=6200.0,
            status="completed"
        )
        db.add(w2)
        db.flush()

        bench_ex = exercise_map.get("Barbell Bench Press")
        if bench_ex:
            we3 = WorkoutExercise(workout_id=w2.id, exercise_id=bench_ex.id, order_index=1)
            db.add(we3)
            db.flush()
            db.add(ExerciseSet(workout_exercise_id=we3.id, set_number=1, set_type="warmup", reps=10, weight_kg=60.0, rpe=5.0))
            db.add(ExerciseSet(workout_exercise_id=we3.id, set_number=2, set_type="normal", reps=6, weight_kg=110.0, rpe=7.0))
            db.add(ExerciseSet(workout_exercise_id=we3.id, set_number=3, set_type="normal", reps=5, weight_kg=125.0, rpe=8.5))
            db.add(ExerciseSet(workout_exercise_id=we3.id, set_number=4, set_type="normal", reps=3, weight_kg=135.0, rpe=9.0, is_personal_record=True))

        # Nutrition logs for Marcus
        today = date.today()
        db.add(NutritionLog(user_id=marcus.id, log_date=today, meal_type="breakfast", food_name="Oatmeal with Whey, Blueberries & Peanut Butter", calories=720, protein_g=48.0, carbs_g=82.0, fat_g=22.0, water_ml=800))
        db.add(NutritionLog(user_id=marcus.id, log_date=today, meal_type="lunch", food_name="Grilled Flank Steak with Jasmine Rice & Broccoli", calories=890, protein_g=65.0, carbs_g=95.0, fat_g=26.0, water_ml=1000))
        db.add(NutritionLog(user_id=marcus.id, log_date=today, meal_type="snack", food_name="Greek Yogurt Parfait & Honey", calories=380, protein_g=32.0, carbs_g=40.0, fat_g=8.0, water_ml=600))

        # Metrics for Marcus
        db.add(BodyMetric(user_id=marcus.id, recorded_at=datetime.now(timezone.utc) - timedelta(days=3), weight_kg=93.6, body_fat_pct=14.8, resting_heart_rate=58, sleep_hours=7.5, energy_level=8, notes="Well rested."))
        db.add(BodyMetric(user_id=marcus.id, recorded_at=datetime.now(timezone.utc), weight_kg=93.2, body_fat_pct=14.5, resting_heart_rate=56, sleep_hours=8.0, energy_level=9, notes="Feeling strong for squat day."))

    # Elena seeded workouts
    elena = user_map.get("elena_lift")
    if elena and not db.query(Workout).filter(Workout.user_id == elena.id).first():
        w_elena = Workout(
            user_id=elena.id,
            title="Snatch Priming & Overhead Strength",
            notes="Focused on speed under the bar and overhead stability.",
            started_at=datetime.now(timezone.utc) - timedelta(days=1, hours=4),
            completed_at=datetime.now(timezone.utc) - timedelta(days=1, hours=2, minutes=40),
            duration_mins=80,
            total_volume_kg=4800.0,
            status="completed"
        )
        db.add(w_elena)
        db.flush()

        ohp_ex = exercise_map.get("Overhead Press (OHP)")
        if ohp_ex:
            we_ohp = WorkoutExercise(workout_id=w_elena.id, exercise_id=ohp_ex.id, order_index=1)
            db.add(we_ohp)
            db.flush()
            db.add(ExerciseSet(workout_exercise_id=we_ohp.id, set_number=1, set_type="normal", reps=5, weight_kg=45.0, rpe=7.0))
            db.add(ExerciseSet(workout_exercise_id=we_ohp.id, set_number=2, set_type="normal", reps=5, weight_kg=52.5, rpe=8.0))
            db.add(ExerciseSet(workout_exercise_id=we_ohp.id, set_number=3, set_type="normal", reps=3, weight_kg=57.5, rpe=9.0, is_personal_record=True))

        today = date.today()
        db.add(NutritionLog(user_id=elena.id, log_date=today, meal_type="breakfast", food_name="Scrambled Eggs, Avocado Toast & Matcha", calories=580, protein_g=34.0, carbs_g=45.0, fat_g=28.0, water_ml=750))
        db.add(NutritionLog(user_id=elena.id, log_date=today, meal_type="lunch", food_name="Salmon Quinoa Bowl with Edamame", calories=720, protein_g=50.0, carbs_g=65.0, fat_g=24.0, water_ml=900))
        db.add(BodyMetric(user_id=elena.id, recorded_at=datetime.now(timezone.utc), weight_kg=64.2, body_fat_pct=17.2, resting_heart_rate=52, sleep_hours=8.2, energy_level=9))

    # Seed workouts for Jordan, Sofia, and David to enrich community leaderboard
    jordan = user_map.get("jordan_cali")
    if jordan and not db.query(Workout).filter(Workout.user_id == jordan.id).first():
        w_j = Workout(user_id=jordan.id, title="Weighted Calisthenics & Ring Flow", started_at=datetime.now(timezone.utc) - timedelta(days=2), duration_mins=65, total_volume_kg=3400.0, status="completed")
        db.add(w_j)
        db.flush()
        pull_ex = exercise_map.get("Weighted Pull-Up")
        if pull_ex:
            wep = WorkoutExercise(workout_id=w_j.id, exercise_id=pull_ex.id, order_index=1)
            db.add(wep)
            db.flush()
            db.add(ExerciseSet(workout_exercise_id=wep.id, set_number=1, set_type="normal", reps=6, weight_kg=30.0, rpe=8.0, is_personal_record=True))

    sofia = user_map.get("sofia_hiit")
    if sofia and not db.query(Workout).filter(Workout.user_id == sofia.id).first():
        w_s = Workout(user_id=sofia.id, title="Rowing & Deadlift Conditioning Circuit", started_at=datetime.now(timezone.utc) - timedelta(days=1), duration_mins=55, total_volume_kg=5100.0, status="completed")
        db.add(w_s)

    david = user_map.get("david_aesthetic")
    if david and not db.query(Workout).filter(Workout.user_id == david.id).first():
        w_d = Workout(user_id=david.id, title="Hypertrophy Chest & Delt Focus", started_at=datetime.now(timezone.utc) - timedelta(hours=14), duration_mins=70, total_volume_kg=6900.0, status="completed")
        db.add(w_d)

    db.commit()
