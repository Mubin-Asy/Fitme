# FITME — High-Performance Fitness Tracker for Private 10-Athlete Circles

Fitme is an athletic fitness tracking application architected for a private circle of **up to 10 athletes**. It embodies the software design principles, concurrency patterns, and data modeling techniques detailed across four foundational reference books:

1. **React in Depth**
2. **CSS in Depth**
3. **FastAPI: Modern Python Web Development** (*O'Reilly Media*)
4. **PostgreSQL: Up and Running: A Practical Guide to the Advanced Open Source Database** (*O'Reilly Media*)

---

## 📚 Book Architecture & Design Principles

### 1. React in Depth
- **Declarative State Machines & Context:** Implemented in `client/src/context/UserContext.tsx`, managing the active athlete amongst the 10 member profiles with 1-click quick-switching, quota validation (`maxUsersLimit = 10`), and persistence.
- **Custom React Hooks & Unidirectional Data Flow:** Data retrieval and optimistic updates are modularized through typed API boundaries (`client/src/services/api.ts`).
- **Compound Component Pattern:** Modularized layout, set tables with interactive badges, and workout logging modals with live volume tonnage accumulation.
- **Strict TypeScript Typing:** Complete interfaces for domain models (`User`, `Exercise`, `Workout`, `ExerciseSet`, `NutritionLog`, `BodyMetric`, `DashboardSummary`).

### 2. CSS in Depth
- **Design Tokens & Fluid Scales:** Defined in `client/src/styles/variables.css` using modern CSS custom properties (`--color-primary: #00e599`, `--color-secondary: #00d2ff`, `--bg-deep: #080b11`, `--bg-surface: #0e131f`).
- **Fluid clamp() Sizing:** Typography and spacing dynamically scale across viewports without breakpoint jumps.
- **Modular Architecture:** Split into `reset.css`, `variables.css`, `layout.css`, and `components.css` with low-specificity selectors and zero `!important`.
- **Athletic Dark Theme:** Glassmorphism (`backdrop-filter: blur(16px)`), glowing accents, micro-animations (`@keyframes pulsePr`, `scaleIn`), and responsive CSS Grid / Flexbox layouts.

### 3. FastAPI: Modern Python Web Development (O'Reilly)
- **Modular Directory Architecture:**
  ```
  server/
    app/
      core/config.py        # Pydantic-settings BaseSettings
      core/security.py      # Password hashing & JWT token management
      db/session.py         # SQLAlchemy 2.0 engine, SessionLocal, get_db dependency
      db/init_db.py         # Seed engine for 10 athletes, exercises, and workout sets
      models/               # SQLAlchemy ORM declarative models
      schemas/              # Pydantic v2 schemas for requests & responses
      api/v1/endpoints/     # Users, Exercises, Workouts, Nutrition, Metrics, Dashboard
      main.py               # Lifespan context manager, CORS middleware
  ```
- **Lifespan Context Manager:** Modern `@asynccontextmanager` pattern initializing DB tables and seeding data on startup.
- **Dependency Injection:** `Depends(get_db)` injected transactional session per request.
- **Strict Validation & OpenAPI:** Automatic Swagger UI (`/docs`) and ReDoc (`/redoc`) documentation.

### 4. PostgreSQL: Up and Running (O'Reilly)
- **Production DDL (`server/schema.sql`):**
  - High-performance sequence generation with `GENERATED ALWAYS AS IDENTITY`.
  - Foreign key integrity with explicit `ON DELETE CASCADE`.
  - Domain constraints via `CHECK (reps > 0)`, `CHECK (weight_kg >= 0)`, `CHECK (calories >= 0)`.
  - Composite B-Tree indexes on `(user_id, started_at DESC)` and `(user_id, log_date DESC)`.
  - JSONB metadata column with GIN indexing for flexible workout tags.
  - Analytical Views: `v_personal_records` (calculating estimated 1RM using the Epley formula) and `v_weekly_volume`.
  - Enforced 10-User Quota via database trigger / constraint logic and FastAPI layer validation.
  - Zero-config auto-fallback to SQLite WAL mode if external PostgreSQL is not configured, with native PostgreSQL connection support via `DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/fitme`.

---

## 👥 The 10-Athlete Private Circle

The system comes pre-populated with 10 athletes representing diverse athletic disciplines:

| # | Athlete | Username | Primary Goal | Discipline |
|---|---------|----------|--------------|------------|
| 1 | Marcus Vance *(Admin)* | `marcus_iron` | Powerlifting Totals (SBD) | Heavy Squats, Bench & Deadlifts |
| 2 | Elena Rostova | `elena_lift` | Hypertrophy & Clean/Jerk | Olympic Weightlifting & Strength |
| 3 | Jordan Lee | `jordan_cali` | Gymnastics Rings & Levers | Calisthenics & Bodyweight |
| 4 | Sofia Mendes | `sofia_hiit` | Metabolic Conditioning & WODs | CrossFit & Barbell Cycling |
| 5 | Liam O'Connor | `liam_runner` | Sub-3h Marathon & Hyrox Pro | Distance Running & Hybrid Fitness |
| 6 | Maya Patel | `maya_flow` | Mobility & Joint Longevity | Yoga & Functional Movement |
| 7 | David Kim | `david_aesthetic`| Classic Bodybuilding Symmetry | Hypertrophy & V-Taper |
| 8 | Chloe Dubois | `chloe_bell` | Grip Strength & Functional Power | Hardstyle Kettlebells & Climbing |
| 9 | Alex Rivera | `alex_journey` | Fat Loss & Metabolic Health | Progressive Overload & Weight Loss |
| 10| Sam Taylor | `sam_coach` | Explosive Speed & Vertical Jump | Sprinting & Plyometrics |

---

## 🚀 Running the Application Locally

### 1. Start the Backend API (FastAPI)
```bash
cd server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Base: `http://127.0.0.1:8000`
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

### 2. Start the Frontend (Vite + React)
```bash
cd client
npm run dev
```
- Client URL: `http://127.0.0.1:5173`

---

## 🛠 Features Overview
- **Interactive Workout Logger:** Add exercises, log sets (warmup, normal, drop, failure), weights, reps, and RPE with real-time volume tonnage accumulation.
- **Built-in Rest Timer:** 60s, 90s, 120s or custom countdown timer with play/pause and reset controls.
- **Automated PR Detection:** System automatically detects when a set beats all previous weights for that exercise and user, awarding the pulsing PR badge!
- **Estimated 1RM Showcase:** Calculates estimated 1 Rep Max based on the Epley formula: `Weight × (1 + Reps / 30)`.
- **Nutrition & Hydration Tracking:** Visual water tracker with quick add buttons (+250ml, +500ml, +1000ml) and daily macro breakdown (Protein, Carbs, Fats).
- **Body Composition & Recovery:** Weigh-ins, body fat %, resting heart rate, sleep hours, and energy ratings.
- **1-Click Athlete Profile Switcher:** Seamlessly switch between all 10 athletes from the top navigation bar or the Group Hub.
