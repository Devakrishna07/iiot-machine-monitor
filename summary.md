# Industrial IoT (IIoT) Machine Monitoring Dashboard — Project Summary & Architecture Guide

---

## 1. Executive Summary

The **Industrial IoT (IIoT) Machine Monitoring Dashboard** is a mission-critical, enterprise-grade full-stack system built using modern TypeScript across both the backend (Node.js/Express) and frontend (React/Redux Toolkit/Vite/Tailwind CSS).

The platform monitors industrial shop-floor machinery (such as 5-Axis CNC Milling Centers, Hydraulic Stamping Presses, Injection Molding Units, Robotic Welding Cells, and Plasma Cutters) in real-time. It enables plant supervisors and operators to track operational states, monitor live sensor telemetry (temperature and vibration), analyze historical telemetry trends, and manage machine state transitions through a strict fault acknowledgment workflow.

---

## 2. Architecture & Design Principles

The application strictly implements **Domain-Driven Design (DDD)**, **Clean Architecture (Hexagonal/Ports & Adapters)**, and **SOLID Principles**:

```
[ Client / Frontend ]
         │
         ▼  (HTTP / JSON)
┌────────────────────────────────────────────────────────┐
│ Presentation Layer (Controllers, Routes, Validators)  │
└───────────────────────┬────────────────────────────────┘
                        │  (invokes)
┌───────────────────────▼────────────────────────────────┐
│ Application Layer (Use Cases, DTOs, Mappers)           │
└───────────────────────┬────────────────────────────────┘
                        │  (depends on abstractions)
┌───────────────────────▼────────────────────────────────┐
│ Domain Layer (Entities, Invariants, Repo Interfaces)  │  ◄── Core Enterprise Rules
└───────────────────────▲────────────────────────────────┘
                        │  (implements contracts)
┌───────────────────────┴────────────────────────────────┐
│ Infrastructure Layer (Json Repository, File System)    │
└────────────────────────────────────────────────────────┘
```

### SOLID Principles in Practice:
- **S (Single Responsibility):** Controllers only parse HTTP; Use Cases only orchestrate application workflows; Domain Entities only enforce business invariants; Repositories only handle persistence; Components only render UI.
- **O (Open/Closed):** Telemetry attributes and new use cases are extended without modifying existing controllers or repository access logic.
- **L (Liskov Substitution):** `JsonMachineRepository` implements `IMachineRepository` and can be substituted with a `MongoMachineRepository` or `PostgreSqlMachineRepository` at runtime without altering any use case or entity.
- **I (Interface Segregation):** Repository and DTO interfaces are lean and segregated, preventing consumers from depending on methods they do not need.
- **D (Dependency Inversion):** High-level use cases depend strictly on domain repository interfaces (`IMachineRepository`), never on concrete storage implementations. Concrete repositories are injected from the composition root (`app.ts`).

---

## 3. Tech Stack Breakdown

### Backend
- **Runtime:** Node.js (v20+ LTS)
- **Framework:** Express.js (v5)
- **Language:** TypeScript with strict mode enabled
- **Validation:** Zod (strict presentation payload validation)
- **Security & Utilities:** `helmet`, `cors`, `dotenv`, `tsx`
- **Data Persistence:** In-memory repository with JSON persistence (`machines.json`) abstracted via `IMachineRepository`

### Frontend
- **Build Tool & Core:** Vite (v8) + React 18/19
- **Language:** TypeScript with strict type checking
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) with `createAsyncThunk` and memoized `createSelector`
- **Styling:** Tailwind CSS (utility-first, responsive dark/light mode)
- **HTTP Client:** Axios (centralized client with interceptors)
- **Icons:** Lucide React

---

## 4. End-to-End Workflow & Core APIs

The system revolves around three core APIs working through standardized response envelopes:

```
Standard Envelope (Success):
{
  "success": true,
  "data": { ... },
  "message": "Optional confirmation"
}

Standard Envelope (Paginated):
{
  "success": true,
  "data": [ ... ],
  "pagination": { "page": 1, "limit": 8, "totalItems": 18, "totalPages": 3, "hasNextPage": true, "hasPrevPage": false }
}

Standard Envelope (Error):
{
  "success": false,
  "error": { "message": "...", "code": "...", "details": ... }
}
```

### Workflow 1: Plant Overview & Telemetry Monitoring
1. **API:** `GET /api/machines?page=1&limit=8&status=all&search=`
2. **Backend Flow:**
   - Query parsed: `page` (default 1), `limit` (default 8), `status`, `search`.
   - `GetAllMachinesUseCase` invokes `IMachineRepository.findPaginated()`.
   - Returns paginated slice of machines with complete pagination metadata.
3. **Frontend Flow:**
   - Dispatched via `fetchMachines` Redux thunk on mount and every 8 seconds (auto-polling).
   - Rendered by `SummaryStats` (Total, Running, Idle, Fault, Avg Temp).
   - Filtered via `FilterBar` tabs (All, Running, Idle, Fault) and live search input.
   - Paged through `PaginationControls` with customizable page sizes (4, 8, 12, 16).

---

### Workflow 2: Deep Diagnostic & Sensor History Inspection
1. **API:** `GET /api/machines/:id`
2. **Backend Flow:**
   - `GetMachineByIdUseCase` looks up machine via `IMachineRepository.getById(id)`.
   - If not found, throws `MachineNotFoundError` (returns HTTP 404 with `MACHINE_NOT_FOUND`).
   - If found, returns enriched telemetry: physical location, equipment category, runtime operating hours, fault diagnostics, and time-series telemetry history points.
3. **Frontend Flow:**
   - Clicking any machine card dispatches `fetchMachineById(id)`.
   - Opens `MachineDetailModal` showing live gauges, physical equipment specifications, critical fault banners, and chronological sensor tables.

---

### Workflow 3: Supervisor Fault Acknowledgment
1. **API:** `PATCH /api/machines/:id/acknowledge`
2. **Payload:** `{ "supervisorId": "SUP-JONES-01", "notes": "Cooling lines flushed." }`
3. **Backend Flow:**
   - **Validation:** Zod schema validates that `supervisorId` is provided.
   - **Domain Invariant Enforcement:** `machine.acknowledgeFault(supervisorId, notes)` verifies `status === 'fault'`.
     - *If already Running or Idle:* Throws `InvalidStatusTransitionError` (HTTP 400 with `INVALID_STATUS_TRANSITION`).
     - *If in Fault:* Transitions status to `'idle'`, records `acknowledgedBy`, `acknowledgedAt`, and `notes`, normalizes telemetry for standby, and updates `lastUpdated`.
   - **Persistence:** `JsonMachineRepository.update(machine)` saves changes to disk.
   - **Response:** Returns updated machine via `ApiResponse.success()`.
4. **Frontend Flow:**
   - Inside `MachineDetailModal`, plant supervisor enters their ID and clicks "Confirm Acknowledgment".
   - Redux store updates both `selectedMachine` and the corresponding item in the dashboard list optimistically.
   - Status badge turns to `IDLE` (amber) with a verified shield indicator, and the dashboard counters update immediately.

---

## 5. Complete Project File Structure

```text
iiot-machine-monitor/
├── .gitignore
├── README.md
├── summary.md
│
├── backend/
│   ├── src/
│   │   ├── shared/                               # Centralized Cross-Cutting Layer
│   │   │   ├── domain/
│   │   │   │   └── Pagination.ts                 # Generic PaginationQuery, PaginationMeta, PaginatedResult<T>
│   │   │   └── presentation/
│   │   │       └── ApiResponse.ts                # Standardized response builder (.success, .paginated, .error)
│   │   │
│   │   ├── machine/                              # Machine Business Domain Module
│   │   │   ├── domain/                           # Enterprise Business Rules (Innermost Layer)
│   │   │   │   ├── entities/
│   │   │   │   │   └── Machine.ts                # Machine Aggregate Root & domain invariants
│   │   │   │   ├── errors/
│   │   │   │   │   └── InvalidStatusTransitionError.ts
│   │   │   │   └── repositories/
│   │   │   │       └── IMachineRepository.ts     # Core repository contract
│   │   │   │
│   │   │   ├── application/                      # Application Business Rules (Use Cases)
│   │   │   │   └── use-cases/
│   │   │   │       ├── GetAllMachinesUseCase.ts  # Paginated list use case & DTO
│   │   │   │       ├── GetMachineByIdUseCase.ts  # Machine detail lookup use case & DTO
│   │   │   │       └── AcknowledgeMachineFaultUseCase.ts # Fault acknowledgment workflow
│   │   │   │
│   │   │   ├── infrastructure/                   # Frameworks & Persistence
│   │   │   │   ├── persistence/
│   │   │   │   │   └── JsonMachineRepository.ts  # In-memory + JSON persistence implementation
│   │   │   │   └── data/
│   │   │   │       └── machines.json             # 18 seeded industrial machine records
│   │   │   │
│   │   │   └── presentation/                     # Interface Adapters
│   │   │       ├── controllers/
│   │   │       │   └── MachineController.ts      # Express controller (getAll, getById, acknowledge)
│   │   │       ├── routes/
│   │   │       │   └── machine.routes.ts         # Route declarations
│   │   │       └── validators/
│   │   │           └── machine.validators.ts     # Zod payload validation schemas
│   │   │
│   │   ├── app.ts                                # Express app configuration & composition root (DI wiring)
│   │   └── server.ts                             # HTTP server entry point (Port 5000)
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── api/                                  # Centralized HTTP Client & Contracts
    │   │   ├── client.ts                         # Axios client configuration
    │   │   ├── types.ts                          # Generic ApiResponse, PaginationMeta types
    │   │   └── machineApi.ts                     # Machine endpoint service functions
    │   │
    │   ├── components/                           # Pure, Atomic UI Primitives (Zero Feature Logic)
    │   │   ├── Button.tsx
    │   │   ├── StatusBadge.tsx                   # Running/Idle/Fault badges with animated pulse
    │   │   ├── StatCard.tsx                      # KPI metric card
    │   │   ├── SearchInput.tsx                   # Search field with clear button
    │   │   ├── PaginationControls.tsx            # Reusable page navigation & page size selector
    │   │   ├── ThemeToggle.tsx                   # Dark/Light mode switch
    │   │   ├── LoadingSpinner.tsx
    │   │   └── ErrorMessage.tsx
    │   │
    │   ├── features/                             # Domain-Grouped Feature Slices & Composite UI
    │   │   └── machines/
    │   │       ├── components/
    │   │       │   ├── SummaryStats.tsx          # 5 top-level KPI cards
    │   │       │   ├── FilterBar.tsx             # Status tabs with badge counts + search
    │   │       │   ├── MachineCard.tsx           # Unit card with threshold-based color coding
    │   │       │   ├── MachineGrid.tsx           # Responsive 3-col grid with empty states
    │   │       │   └── MachineDetailModal.tsx    # Diagnostic inspection & supervisor action dialog
    │   │       ├── machineSlice.ts               # Redux Toolkit slice
    │   │       ├── machineThunks.ts              # Async thunks (fetchMachines, fetchMachineById, acknowledgeFault)
    │   │       └── machineSelectors.ts           # Memoized selectors (stats, filtering, active machine)
    │   │
    │   ├── pages/
    │   │   └── DashboardPage.tsx                 # Main layout assembling features, polling & modal
    │   │
    │   ├── store.ts                              # Root Redux store configuration
    │   ├── App.tsx                               # Root theme wrapper
    │   ├── main.tsx                              # React DOM entry point & Redux Provider
    │   └── index.css                             # Tailwind CSS entry directives
    ├── index.html
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    └── tsconfig.json
```

---

## 6. How to Run & Verify the System

### 1. Start the Backend:
```powershell
cd backend
npm run dev
```
- Server starts at: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`
- Paginated machines: `http://localhost:5000/api/machines?page=1&limit=8`

### 2. Start the Frontend:
```powershell
cd frontend
npm run dev
```
- Dashboard runs at: `http://localhost:3000`

### 3. Automated Verification Commands:
- **Backend Type Sanity:** `cd backend; npx tsc --noEmit`
- **Frontend Production Build:** `cd frontend; npm run build`
