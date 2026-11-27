# Industrial IoT (IIoT) Machine Monitoring Dashboard — System Architecture

## 1. Tech Stack

### Backend (Node.js + Express)
* **Runtime & Framework:** Node.js (v20+ LTS), Express.js
* **Language:** TypeScript (strict mode enabled for strong typing of Domain Entities, Value Objects, and Interfaces)
* **Architecture:** Domain-Driven Design (DDD) + Clean Architecture + SOLID Principles
* **Data Persistence:** In-memory JSON repository (`machines.json`) abstracted via Repository Interfaces (swappable with MongoDB/PostgreSQL without touching business logic)
* **Validation:** Zod or Joi (strict DTO validation at the presentation boundary)
* **Middleware:** `cors`, `helmet`, `express.json()`

### Frontend (React + Redux Toolkit)
* **Core Library:** React 18+ (Vite build tool)
* **Language:** TypeScript
* **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) with `createAsyncThunk`
* **Routing:** React Router DOM (`react-router-dom` v6+)
* **Styling:** Tailwind CSS (utility-first responsive design)
* **HTTP Client:** Axios (centralized instance with interceptors)

---

## 2. Complete Project Folder Structure

```text
iiot-machine-dashboard/
├── backend/
│   ├── src/
│   │   ├── machine/                          # Domain Module (No 'modules/' wrapper)
│   │   │   ├── domain/                       # Enterprise Business Rules (Innermost Layer)
│   │   │   │   ├── entities/                 # Machine Aggregate Root & Entities
│   │   │   │   ├── value-objects/            # MachineStatus, Temperature, Vibration
│   │   │   │   ├── repositories/             # IMachineRepository (Interface)
│   │   │   │   └── errors/                   # Domain-specific exceptions (e.g., InvalidStatusTransitionError)
│   │   │   ├── application/                  # Application Business Rules (Use Cases)
│   │   │   │   ├── use-cases/                # GetAllMachines, GetMachineById, AcknowledgeMachineFault
│   │   │   │   └── dtos/                     # Input/Output Data Transfer Objects & Mappers
│   │   │   ├── infrastructure/               # Frameworks & Drivers (Outermost Layer)
│   │   │   │   ├── persistence/              # JsonMachineRepository (implements IMachineRepository)
│   │   │   │   └── data/                     # machines.json (Seed data)
│   │   │   └── presentation/                 # Interface Adapters (HTTP/REST)
│   │   │       ├── controllers/              # MachineController
│   │   │       ├── routes/                   # machine.routes.ts
│   │   │       ├── validators/               # Request payload validation schemas
│   │   │       └── middlewares/              # Domain error-to-HTTP mapper middleware
│   │   ├── app.ts                            # Express app configuration & dependency wiring
│   │   └── server.ts                         # HTTP server entry point
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── api/                              # Centralized HTTP client & endpoint service functions
    │   ├── auth/                             # Authentication state, guards, and role/permission helpers
    │   ├── components/                       # Pure, atomic, reusable UI components (Button, Badge, Modal, Input)
    │   ├── features/                         # Domain-grouped composite components & Redux state logic
    │   │   └── machines/                     # Machine domain feature group
    │   │       ├── components/               # Composite feature UI (MachineCard, MachineDetailPanel, FilterBar)
    │   │       ├── machineSlice.ts           # Redux Toolkit slice (reducers & state)
    │   │       ├── machineThunks.ts          # Async thunks calling src/api/
    │   │       └── machineSelectors.ts       # Memoized Redux selectors (filtering/searching)
    │   ├── pages/                            # Top-level route views composing features & components
    │   ├── routes/                           # Application routing configuration & protected route wrappers
    │   ├── store.ts                          # Root Redux store configuration
    │   ├── App.tsx                           # Root application shell
    │   └── main.tsx                          # React DOM entry point & Redux Provider
    ├── index.html
    ├── tailwind.config.js
    ├── package.json
    └── tsconfig.json
```

---

## 3. Architectural Breakdown

### Backend: Module-Based Clean Architecture + DDD
Instead of grouping files by technical role globally or hiding domains inside a `modules/` or `shared/` directory, the backend organizes directly by business domain (e.g., `src/machine/`). Each domain module strictly enforces the **Dependency Rule** (dependencies only point inward):

1. **Domain Layer (`machine/domain/`):**
   * Contains pure TypeScript classes with zero external library dependencies.
   * **Entities (`Machine`):** Encapsulates identity (`id`), telemetry (`temperature`, `vibration`), and state transition behavior (e.g., `machine.acknowledgeFault()`).
   * **Value Objects (`MachineStatus`, `Temperature`):** Enforces domain invariants (e.g., ensuring status is strictly `'running' | 'idle' | 'fault'`).
   * **Repository Interfaces (`IMachineRepository`):** Defines contracts for data retrieval and persistence without knowing *how* data is stored.

2. **Application Layer (`machine/application/`):**
   * Orchestrates domain objects to fulfill specific user stories (`GetAllMachinesUseCase`, `GetMachineByIdUseCase`, `UpdateMachineStatusUseCase`).
   * Depends *only* on the `domain/` layer.
   * Uses DTOs to prevent leaking domain entities directly to external layers.

3. **Infrastructure Layer (`machine/infrastructure/`):**
   * Implements interfaces defined in `domain/`.
   * `JsonMachineRepository` reads/writes to `machines.json` (in-memory array) and maps raw JSON records into `Machine` domain entities.

4. **Presentation Layer (`machine/presentation/`):**
   * Express controllers receive HTTP requests, validate payloads, invoke Application Use Cases, and translate Domain Errors into standard HTTP status codes (`200`, `400`, `404`, `500`).

---

### Frontend: Reusable Component & Feature-Driven Architecture
The frontend enforces a strict separation between atomic UI primitives, domain-specific feature groups, data fetching, and page layout:

1. **`api/`:** Houses the configured Axios instance and raw API calls (e.g., `fetchMachinesApi`, `patchMachineStatusApi`). Zero UI or Redux logic lives here.
2. **`auth/`:** Contains session management, supervisor role verification, and authorization checks (e.g., verifying if the logged-in supervisor has permission to acknowledge machine faults).
3. **`components/`:** Contains dumb, stateless, highly reusable UI primitives styled with Tailwind CSS (e.g., `StatusBadge`, `Card`, `SearchInput`, `Spinner`, `Modal`). They receive all data and callbacks via `props`.
4. **`features/`:** Groups domain-specific composite components alongside their Redux Toolkit state management:
   * Combines atomic components from `components/` into functional blocks (e.g., `MachineList`, `MachineDetailModal`, `MachineFilterBar`).
   * Houses Redux slices, thunks, and selectors (`machineSlice.ts`, `machineThunks.ts`, `machineSelectors.ts`) to manage asynchronous API states (`loading`, `error`, `data`) and optimistic/response-driven fault acknowledgment updates.
5. **`pages/`:** Thin layout containers mapped to routes (e.g., `DashboardPage`). Pages assemble feature groups from `features/` and handle high-level page layout via Tailwind grid/flex utilities.
6. **`routes/`:** Centralizes React Router definitions, mapping URL paths to `pages/` and wrapping restricted views with guards from `auth/`.

---

## 4. SOLID Principles Enforcement

* **S — Single Responsibility Principle (SRP):**
  * *Backend:* Controllers only handle HTTP request/response parsing; Use Cases only execute a single business action; Repositories only handle data persistence.
  * *Frontend:* API functions only fetch data; Redux slices only manage state transitions; Components only render UI.
* **O — Open/Closed Principle (OCP):**
  * *Backend:* New telemetry metrics or status rules are added by extending Domain Value Objects or adding new Use Cases without modifying existing controller or repository code.
  * *Frontend:* Atomic components in `components/` use composition (`children`) and Tailwind variant props so their behavior can be extended without altering their core implementation.
* **L — Liskov Substitution Principle (LSP):**
  * *Backend:* `JsonMachineRepository` can be seamlessly replaced by a `MongoMachineRepository` or `InMemoryTestRepository` at runtime because both strictly adhere to the `IMachineRepository` contract.
* **I — Interface Segregation Principle (ISP):**
  * *Backend:* Read and write repository contracts can be segregated (`IMachineReadRepository` vs `IMachineWriteRepository`) so read-only use cases do not depend on mutation methods.
  * *Frontend:* Components accept lean, specific TypeScript prop interfaces rather than monolithic global state objects.
* **D — Dependency Inversion Principle (DIP):**
  * *Backend:* High-level Application Use Cases depend on the abstract `IMachineRepository` interface, never on the concrete `JsonMachineRepository` implementation. Concrete dependencies are injected via constructors in `app.ts` (Composition Root).
  * *Frontend:* UI features dispatch abstract Redux thunks rather than directly coupling to Axios or backend URLs.

---

## 5. Architectural Rules & Constraints

1. **Shared Cross-Cutting Layer (`shared/`) vs Business Domains:** Domain-specific business logic resides strictly inside its respective domain module (e.g. `backend/src/machine/`). Cross-cutting infrastructure and presentation utilities (such as centralized `ApiResponse` envelopes, generic `Pagination` contracts, and global error handling) reside under `backend/src/shared/`. Neither domain nor application layers may import from framework-specific presentation code.
2. **Strict Layer Isolation (Backend):** `domain/` must never import from `application/`, `infrastructure/`, or `presentation/`. `application/` must never import from `infrastructure/` or `presentation/`.
3. **Strict Folder Boundaries (Frontend):**
   * `pages/` may import from `features/`, `components/`, and `auth/`.
   * `features/` may import from `components/`, `api/`, and `auth/`, but **never** from `pages/`.
   * `components/` must remain pure and **never** import from `features/`, `pages/`, or `api/`.
4. **Redux Toolkit Mandate:** All server state (machine list, active machine details, loading flags, error messages) and UI filter state (search query, status filter) must reside in the Redux store under `features/`.
5. **Tailwind CSS Only:** All styling must be implemented using Tailwind CSS utility classes; custom `.css` files (other than the base Tailwind entry directive) are prohibited.