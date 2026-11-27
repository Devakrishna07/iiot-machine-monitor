# Industrial IoT (IIoT) Machine Monitoring Dashboard

An enterprise-grade Industrial IoT (IIoT) Machine Monitoring Dashboard built with the **MERN** stack (Node.js/Express, React, TypeScript). The system provides shop-floor supervisors and reliability engineers with real-time telemetry tracking, fault alerting, state transition controls, and event-driven updates via Server-Sent Events (SSE).

---

## 1. Quick Start & Steps to Run the Project

### Prerequisites
- **Node.js**: v18+ (tested on Node v22+)
- **npm**: v9+
- A modern web browser (Chrome, Edge, Firefox)

---

### Step 1: Install Dependencies

From the repository root, install dependencies for both the backend and frontend:

```bash
# 1. Install Backend Dependencies
cd backend
npm install

# 2. Install Frontend Dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

---

### Step 2: Start the Backend Service

Open a terminal and run:

```bash
cd backend
npm run dev
```

- **Backend URL**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`
- **SSE Stream**: `http://localhost:5000/api/machines/stream`

---

### Step 3: Start the Frontend Application

Open a second terminal and run:

```bash
cd frontend
npm run dev
```

- **Frontend URL**: `http://localhost:3000`
- The application automatically proxies or connects directly to the backend at `http://localhost:5000`.

---

### Step 4: Run Postman / Newman Automated Tests

The repository contains an automated Postman collection covering all API routes, status envelopes, validation constraints, and fault workflows.

To run the automated tests against the running backend:

```bash
npx newman run test/iiot_machine_monitoring.postman_collection.json
```

Or import `test/iiot_machine_monitoring.postman_collection.json` into the Postman Desktop App.

---

## 2. Project Stack, Architecture & Data Model

### Technology Stack

| Layer | Technologies & Libraries |
| :--- | :--- |
| **Backend** | Node.js (v22), Express 5, TypeScript (strict), Zod v3, Helmet, CORS |
| **Frontend** | React 19, Vite, Redux Toolkit, TypeScript, Tailwind CSS v4, Lucide React |
| **Real-Time** | Server-Sent Events (SSE) with `fs.watch` file-system listener & push broadcasts |
| **Testing** | Newman, Postman Collection v2.1 |

---

### Clean Architecture & SOLID Principles

The project strictly adheres to **Clean Architecture** and **Domain-Driven Design (DDD)**:

```
iiot-machine-monitor/
├── backend/
│   ├── src/
│   │   ├── machine/
│   │   │   ├── domain/               # Enterprise Business Rules (Entities, Errors, Interfaces)
│   │   │   │   ├── entities/         # Machine Aggregate Root & Invariants
│   │   │   │   ├── errors/           # Domain-specific errors (e.g. InvalidStatusTransitionError)
│   │   │   │   └── repositories/     # IMachineRepository contract
│   │   │   ├── application/          # Application Business Rules (Use Cases)
│   │   │   │   └── use-cases/        # GetAllMachines, GetMachineById, AcknowledgeFault
│   │   │   ├── infrastructure/       # Frameworks & Drivers (Data Access, File Watchers)
│   │   │   │   ├── persistence/      # JsonMachineRepository (in-memory + disk cache)
│   │   │   │   └── data/             # machines.json persistence store
│   │   │   └── presentation/         # Interface Adapters (Controllers, Routes, Validators)
│   │   │       ├── controllers/      # MachineController
│   │   │       ├── routes/           # machine.routes (Express Router)
│   │   │       └── validators/       # Zod schemas (request validation)
│   │   ├── shared/                   # Cross-cutting primitives (Pagination, ApiResponse, SSE EventStream)
│   │   ├── app.ts                    # Express app & Dependency Injection Composition Root
│   │   └── server.ts                 # HTTP server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                      # Axios client & centralized ApiResponse envelope types
│   │   ├── components/               # Reusable UI (StatusBadge, PaginationControls, ThemeToggle, etc.)
│   │   ├── features/machines/        # Redux slice, thunks, selectors, and domain components
│   │   │   ├── components/           # MachineCard, MachineGrid, MachineDetailModal, FilterBar
│   │   │   ├── machineSlice.ts       # Synchronous state reducers
│   │   │   ├── machineThunks.ts      # Async operations (fetchMachines, acknowledgeFault)
│   │   │   └── machineSelectors.ts   # Memoized selectors
│   │   ├── pages/                    # DashboardPage
│   │   ├── App.tsx                   # Top-level shell & theme manager
│   │   └── main.tsx                  # React entry point
│   └── package.json
│
├── test/
│   └── iiot_machine_monitoring.postman_collection.json # Automated API test suite
└── README.md
```

#### Key Architecture Highlights:
1. **Separation of Concerns**: Domain logic (e.g., fault acknowledgment rules and state transitions) resides exclusively inside the `Machine` aggregate root and cannot be bypassed.
2. **Standardized Response Envelope**: All API endpoints return a standardized envelope containing an explicit HTTP status code description:
   - Success: `{ "success": true, "status": "200 OK", "data": ... }`
   - Paginated: `{ "success": true, "status": "200 OK", "data": [...], "pagination": { ... } }`
   - Client/Server Errors: `{ "success": false, "status": "400 BAD_REQUEST", "error": { "message": "..." } }`
3. **Event-Driven Real-Time Push**: Replaces polling with Server-Sent Events (`GET /api/machines/stream`). The backend monitors `machines.json` via native file-system events and automatically pushes updates to connected clients without reloading.
4. **Theme Customization**: Responsive dark and light mode toggle integrated via Tailwind CSS v4 CSS variables and Redux state.

---

### Required Data Model (`machines.json`)

Data is persisted in `backend/src/machine/infrastructure/data/machines.json` containing 18 balanced machine records (6 Running, 6 Idle, 6 Fault):

```json
{
  "id": "MCH-002",
  "name": "Hydraulic Stamping Press 500T",
  "status": "fault",
  "statusColor": "red",
  "temperature": 84.1,
  "vibration": 4.82,
  "lastUpdated": "2026-11-27T08:01:15.000Z",
  "type": "Heavy Hydraulic Press",
  "location": "Shop Floor A - Bay 2",
  "operatingHours": 5340,
  "fault": {
    "code": "ERR_THERMAL_OVERLOAD",
    "reason": "Hydraulic cylinder fluid temperature exceeded critical threshold (84.1°C > 75.0°C). Safety interlock triggered.",
    "triggeredAt": "2026-11-27T07:55:00.000Z",
    "isAcknowledged": false,
    "acknowledgedBy": null,
    "acknowledgedAt": null,
    "notes": null
  },
  "telemetryHistory": [
    { "timestamp": "2026-11-27T07:45:00Z", "temperature": 68.0, "vibration": 2.20 },
    { "timestamp": "2026-11-27T07:55:00Z", "temperature": 79.5, "vibration": 4.15 },
    { "timestamp": "2026-11-27T08:01:15Z", "temperature": 84.1, "vibration": 4.82 }
  ]
}
```

#### Field Specifications:
- `id` *(string)*: Unique identifier (e.g. `MCH-001`).
- `name` *(string)*: Descriptive equipment name.
- `status` *(enum)*: `'running' | 'idle' | 'fault'`.
- `statusColor` *(enum)*: `'green' | 'yellow' | 'red'`.
- `temperature` *(number)*: Temperature in °C.
- `vibration` *(number)*: Vibration in mm/s RMS.
- `lastUpdated` *(ISO string)*: Timestamp of the last telemetry recording.
- `type` & `location` *(string)*: Equipment metadata and plant floor location.
- `operatingHours` *(number)*: Cumulative runtime hours.
- `fault` *(object | null)*: Fault metadata including error code, reason, timestamp, and supervisor acknowledgment details.
- `telemetryHistory` *(array)*: Historical sensor readings used for trends and diagnostics.

---

### Core API Endpoints

| HTTP Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint |
| `GET` | `/api/machines/stream` | Real-time Server-Sent Events (SSE) stream |
| `GET` | `/api/machines` | Get paginated list of machines (`page`, `limit`, `status`, `search`) |
| `GET` | `/api/machines/:id` | Get full machine details and telemetry history |
| `PATCH` | `/api/machines/:id/acknowledge` | Acknowledge a fault (`supervisorId`, `notes`) |
