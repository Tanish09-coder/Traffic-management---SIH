# PHASE 10.2 — MULTI-JUNCTION CORRIDOR ARCHITECTURE DESIGN

## 1. DESIGN OBJECTIVE
Design the minimum safe architecture to evolve the existing MARG-DRISHTI simulation into a **FOUR LIVE MICROSCOPIC JUNCTIONS** corridor model. Each junction will host its own live vehicle queues, physical kinematics, and signal control logic. Vehicles must physically traverse the corridor via explicit links, preserving their identity, accumulating travel metrics, and respecting route assignments. The entire corridor runs under a single synchronized clock tick.

## 2. PRIMARY ARCHITECTURAL PRINCIPLE
**Maintain:**
- ONE `SimulationContext`
- ONE `SimulationClock`
- ONE authoritative simulation tick
- ONE corridor simulation

**Strict Isolation:**
The Dashboard must remain an exact semantic projection of **J3**. No Dashboard components, analytics engines, or benchmarks may accidentally consume or visualize `(J1 + J2 + J3 + J4)` mixed data.

## 3. JUNCTION INSTANCE DESIGN
A single conceptual `Junction` wrapper will encapsulate the required managers:
```javascript
class JunctionSimulation {
  constructor(id, seed, config) {
    this.id = id;
    this.vehicleManager = new VehicleManager(seed);
    this.signalManager = new SignalManager(config.initialStrategy);
    this.config = config; // { demandMultiplier, weatherMode, etc }
  }
  tick(dt, hasActiveCrossing, demandOverrides) { ... }
}
```
**Refactoring required:** None for `VehicleManager` or `SignalManager` class internals. They natively support instantiation. 
**Exposed State:** Each junction exposes its state exactly as the root `SimulationContext` previously did.

## 4. VEHICLE IDENTITY & METADATA DESIGN
To survive transfer, vehicles need persistent routing metadata.
**Mandatory Fields:**
- `id`: (String) UUID or `{prefix}-{counter}`.
- `type`: 'car' | 'truck' | 'bike' | 'bus'
- `isCommercial`: Boolean
- `deliveryStatus`: String
- `destinationHubId`: String (if freight)
- `corridorRoute`: Array of junction IDs, e.g., `['J1', 'J2', 'J3', 'J4']`
- `routeIndex`: Integer (current position in route)
- `accumulatedTravelTime`: Float (seconds)
- `accumulatedWaitTime`: Float (seconds)
- `linkEntryTime`: Float (timestamp when entering a link)

When a vehicle reaches `position >= 100` in J1, its `vehicleId` and metadata survive, and its `accumulatedWaitTime` is updated from J1's memory before transferring to the Link.

## 5. VEHICLE TRANSFER & LINKMANAGER DESIGN
**The LinkManager** handles vehicles in transit between junctions.
```javascript
class LinkManager {
  constructor() {
    this.links = {
      'J1-J2': { distanceKm: 3.4, speedKmph: 40, vehicles: [] },
      'J2-J3': { distanceKm: 4.2, speedKmph: 40, vehicles: [] },
      'J3-J4': { distanceKm: 2.8, speedKmph: 40, vehicles: [] }
    };
  }
  
  // Intercept vehicle exiting upstream junction
  enterLink(linkId, vehicleState, simTime) { ... }
  
  // Advance transit delays, return vehicles ready for downstream injection
  tick(dt, simTime) { ... } 
}
```
**Lifecycle:**
1. J1 `VehicleManager.updateVehicles(dt)` detects vehicle `position >= 100`.
2. Vehicle is placed in J1's `_completedDepartures`.
3. `SimulationContext` intercepts departures. Checks `routeIndex`.
4. If `routeIndex < corridorRoute.length - 1`, vehicle is passed to `LinkManager.enterLink()`.
5. `LinkManager` calculates required transit delay: `(distanceKm / speedKmph) * 3600`.
6. After delay, `LinkManager.tick()` yields the vehicle.
7. `SimulationContext` calls `J2.vehicleManager.injectExternalArrival(approach, vehicle)`.

## 6. ROUTING DESIGN
**Minimum Abstraction:**
Only vehicles traveling along the main arterial corridor need cross-junction routes. Side-street traffic (e.g., crossing East/West) can be treated as junction-local and destroyed upon exit.
- `corridorRoute: ['J1', 'J2', 'J3', 'J4']` for main-line North/South traffic.
- When injecting at J2, the approach direction (e.g., 'N' or 'S') is determined by the corridor orientation relative to the junction.

## 7. SIGNAL ARCHITECTURE
Four independent `SignalManager` instances will be created inside the four `JunctionSimulation` instances. 
- **Demand:** Each receives its own `vehicleManager.getQueuedPCUs()`.
- **State:** Each maintains its own `phase`, `signalTimer`, and `continuousGreenTimeSec`.
- **Weather:** Can be globally broadcast to all four or targeted per junction.

## 8. SIGNAL OPTIMIZER STATIC STATE
**Issue:** `SignalOptimizer.activeDemandOverrides` is a static property used for predictive demand.
**Solution:** `evaluateNextSignal` already accepts `demandOverrides` as an argument. 
- **Write:** `SimulationContext` will calculate predictive overrides *per junction* and pass them explicitly into `junction.tick(..., demandOverrides)`.
- **Read:** `SignalOptimizer` will prefer the passed argument over the static property.
- **Refactor:** `SignalOptimizer.setDemandOverrides()` will be preserved but deprecated. No existing dashboard behavior changes.

## 9. J3 / DASHBOARD COMPATIBILITY
**Strict Compatibility Boundary:**
Inside `SimulationContext.jsx`:
```javascript
// The root state exposed to Dashboard MUST mirror J3 exactly
const mergedState = {
  ...j3State.vehicleManagerState,
  ...j3State.signalManagerState,
  
  // Hidden from legacy dashboard components, read by Logistics UI
  corridor: {
    junctions: { J1: j1State, J2: j2State, J3: j3State, J4: j4State },
    links: linkManager.getState()
  }
};
```
The Dashboard components (`<IntersectionView>`, etc.) will continue to read `state.queues`, `state.signal`, unaware that they belong specifically to J3.

## 10. ANALYTICS ISOLATION
`AnalyticsManager.recordTick(metrics)` will be passed **ONLY J3 metrics**.
```javascript
// Correct: preserves fixed-vs-adaptive benchmark
analyticsManager.recordTick(j3AnalyticsMetrics); 

// New corridor analytics (recorded separately for Logistics)
corridorAnalyticsManager.recordTick(corridorMetrics);
```

## 11. CORRIDOR TELEMETRY
Telemetry exposed to the Logistics UI via `state.corridor`:
- **Junctions:** PCU, average wait, max wait, signal phase.
- **Links:** Vehicles in transit, link congestion (derived from transit density).
- **Aggregate:** Total active corridor freight vehicles, corridor throughput, end-to-end travel time estimates based on live delays.

## 12. SCENARIO ARCHITECTURE
Hierarchical conditions applied during `SimulationContext.tickSimulation`:
1. **Global:** Master `simulationSpeed`, `predictiveStatus`.
2. **Corridor:** `freightDemandMultiplier` (modifies spawn rates at J1 and hub injection).
3. **Junction:** Localized weather modes (e.g., J1='fog', J4='normal').
4. **Link:** Speed limit modifiers.

## 13. FREIGHT ROUTING
Hubs act as origin/destination endpoints outside the physical junction grid.
1. Hub spawns a freight truck.
2. Truck injected into J1 via `injectExternalArrival`.
3. Truck traverses `J1 -> Link -> J2 -> Link -> J3 -> Link -> J4`.
4. Truck exits J4, `routeIndex` completes.
5. Truck delivered to Destination Hub via `logisticsHubManager.processCommercialArrival()`.

## 14. GREEN WAVE BOUNDARY
`FreightGreenWaveCoordinator.js` remains **TELEMETRY ONLY**.
It will be updated to accept the full `state.corridor` object to evaluate multi-junction progression probabilities. It will NOT mutate `SignalManager` phase or durations.

## 15. DETERMINISM DESIGN
**Safe Seed Strategy:**
```javascript
const baseSeed = 12345;
const j1Seed = baseSeed + 1;
const j2Seed = baseSeed + 2;
const j3Seed = baseSeed + 3;
const j4Seed = baseSeed + 4;
```
By statically offsetting seeds, each junction maintains deterministic pseudo-random generation. Resetting the simulation reinitializes the PRNGs with the same offsets, ensuring absolute reproducibility.

## 16. CLOCK AND UPDATE ORDER
**Safest Execution Sequence in `SimulationContext.tickSimulation`:**
1. `SimulationClock.tick()`
2. Update Global/Scenario conditions.
3. Update `J1`, `J2`, `J3`, `J4` independently (vehicles move, signals advance).
4. Gather `_completedDepartures` from all junctions.
5. `LinkManager.tick(dt)` (advances vehicles in transit).
6. Transfer completed transit vehicles to downstream junction backlogs via `injectExternalArrival()`.
7. Record J3 Analytics (`analyticsManager.recordTick`).
8. Record Corridor Analytics.
9. `setState(mergedState)` (J3 root projection + corridor nested).

*Note: Transferring to backlogs (Step 6) ensures vehicles don't teleport and instantly move in the same tick.*

## 17. PAUSE / RESET / RESTART
**Reset Lifecycle:**
- `JunctionSimulation.reset()` resets vehicles and signals.
- `LinkManager.reset()` clears all transit queues.
- `SimulationClock.reset()` resets sim time.
- Random seeds are re-instantiated.
- Freight Hubs and Green Wave telemetry reset.

## 18. PERFORMANCE DESIGN
**Rendering Boundary:**
- `J1`, `J2`, `J4` execute pure headless math and array mutations.
- `J3` state properties map to the root React state.
- **Logistics UI** consumes `state.corridor`, rendering lightweight macro-level indicators (e.g., PCU bars), avoiding rendering 1000 individual DOM nodes for the entire corridor. Performance impact will be entirely CPU-bound physics arrays, which V8 handles in <1ms.

## 19. FILE-LEVEL DESIGN
- **MODIFY:** `SimulationContext.jsx` (Restructure to hold 4 junctions, update loop, isolate J3).
- **MODIFY:** `VehicleManager.js` (Add routing metadata properties to vehicles, preserve identity on `_completedDepartures`).
- **PRESERVE:** `SignalManager.js` (No changes needed).
- **PRESERVE:** `SignalOptimizer.js` (Bypass static state via arguments).
- **CREATE:** `JunctionSimulation.js` (Wrapper for VM + SM).
- **CREATE:** `LinkManager.js` (Handles transit delays).
- **MODIFY:** `LogisticsHubManager.js` (Handle corridor-wide delivery).
- **MODIFY:** `FreightGreenWaveCoordinator.js` (Read corridor state).

## 20. MIGRATION STRATEGY
**Incremental Implementation:**
- **Stage 1:** Create `JunctionSimulation.js` wrapper.
- **Stage 2:** Refactor `SimulationContext.jsx` to use exactly ONE `JunctionSimulation` for J3, proving zero Dashboard breakage.
- **Stage 3:** Create `LinkManager.js`.
- **Stage 4:** Add headless J1, J2, J4 to `SimulationContext` state.
- **Stage 5:** Implement vehicle routing metadata and transfer loop.
- **Stage 6:** Update Logistics UI to consume live corridor telemetry.

## 21. ROLLBACK STRATEGY
If Stage 4/5 introduces catastrophic benchmark failure or Dashboard bleeding:
- **Fallback:** Revert `SimulationContext.jsx` to Stage 2 (Single `JunctionSimulation`).
- The rest of the codebase (`VehicleManager`, `LinkManager`) remains safely decoupled and can be left intact without affecting execution.

## 22. TEST STRATEGY
- **Vehicle Conservation:** Ensure `total_spawned === total_active_junctions + total_in_transit + total_exited`.
- **Dashboard Isolation:** Assert `rootState.queues === rootState.corridor.junctions.J3.queues` AND `rootState.queues !== rootState.corridor.junctions.J1.queues`.
- **Identity Preservation:** Assert UUID remains identical upon exiting J1 and entering J2.
- **Determinism:** Assert 1000-tick final states are identical across three fresh resets.

## 23. ARCHITECTURAL RISKS
1. **SignalOptimizer Static State:** Addressed by explicitly passing `demandOverrides`.
2. **Double Vehicle Updates:** Addressed by the strict update sequence—exiting vehicles are placed in a holding backlog, preventing them from moving twice in one tick.
3. **React Render Flooding:** Mitigated by separating J3 high-frequency positional updates from Logistics low-frequency aggregated telemetry.
4. **Benchmark Corruption:** Addressed by explicitly piping only J3 into the legacy `analyticsManager`.

## 24. FINAL DESIGN GATE
### A. TARGET ARCHITECTURE
```text
                    SimulationContext (State & Tick Engine)
                           │
      ┌────────────────────┼────────────────────┐
      ↓                    ↓                    ↓
 J1 (Headless)        J2 (Headless)        J4 (Headless)
      │                    │                    │
   Link J1-J2           Link J2-J3           Link J3-J4
      │                    │                    │
      └─────────┐          ↓          ┌─────────┘
                │    J3 (Live/UI)     │
                └──────────┼──────────┘
                           ↓
                   root React State
                    (Dashboard J3)
```

### B. CURRENT → TARGET MAPPING
- `VehicleManager` → Instantiated 4x per corridor.
- `SignalManager` → Instantiated 4x per corridor.
- `SimulationContext` → Orchestrates 4 Junctions + 1 LinkManager.

### C. EXACT DATA FLOW
`Spawn(J1) → J1 Physics → J1 Exit → LinkManager Transit Delay → J2 Injection(Backlog) → J2 Physics`

### D. DASHBOARD DATA FLOW
Dashboard `<IntersectionView>` strictly reads `state.queues`, which is statically mapped to `J3.queues`.

### E. LOGISTICS DATA FLOW
Logistics `<CorridorProgressionView>` reads `state.corridor.junctions` and `state.corridor.links`.

### F. SIGNAL DATA FLOW
Four isolated `SignalManager` instances evaluate independent phase heuristics via explicit `JunctionSimulation` calls.

### G. ANALYTICS DATA FLOW
Legacy `AnalyticsManager` receives ONLY `J3.getMetrics()`.

### H. IMPLEMENTATION ORDER
1. Wrapper Abstraction. 2. Single J3 Proof. 3. Four-Junction Instantiation. 4. LinkManager. 5. Routing Loop.

### I. STOP CONDITIONS
DO NOT PROCEED IF:
- J1 state leaks into Dashboard components.
- The `comparisonEngine` (fixed vs adaptive benchmark) deviates from single-junction baseline results.
- Frame rate drops below 30FPS due to deep React state propagation.

## 25. FINAL DECISION
**READY FOR IMPLEMENTATION**
The architecture is fully specified, the isolation boundary is strictly defined, and the migration strategy guarantees safe incremental execution. No rewriting of fundamental physics or heuristics is required.
