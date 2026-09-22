# PHASE 9B.3 — GREEN WAVE TELEMETRY CORRECTION

## 1. Files Modified
- `dashboard/src/context/SimulationContext.jsx`

## 2. Starvation Bug
**Before:**
```javascript
maxPassengerWaitSec: oldestWaitTimes[app] || 0
```

**After:**
```javascript
maxPassengerWaitSec: Math.max(0, ...Object.entries(oldestWaitTimes).filter(([dir]) => dir !== app).map(([, time]) => time))
```

**Implementation Details:**
The bug incorrectly passed the host approach's wait time to the starvation guardrail. The implemented fix cleanly extracts the maximum wait time from all *other* approaches (i.e., the non-freight approaches) by filtering out the current freight `app` direction from the `oldestWaitTimes` object and extracting the maximum of the remaining values.

## 3. Downstream Saturation
`KEPT CONFIGURABLE ASSUMPTION`

**Explanation:** 
The `CorridorCoordinator.js` processes macroscopic flow predictions but does not output a `downstreamSaturation` ratio (e.g. `0.0 - 1.0`) that maps directly to the required parameter. Furthermore, `SimulationContext.jsx` runs independently on its own tick and does not currently have access to the `corridorData` output (which is derived inside the `LogisticsSimulationPage.jsx` React component). Without writing entirely new simulation telemetry bridges, there is no verified live saturation value accessible inside `SimulationContext`. Thus, `0.38` is legitimately preserved as a Configurable Simulation Assumption.

## 4. Dashboard Isolation
The modification to `SimulationContext.jsx` explicitly only alters the `corridorContext` object passed into `freightCoordinator.evaluateProgressionRecommendation()`. The result of this evaluation is pushed strictly to the `activeFreightDecisions` array. 
- `SignalManager` remains unchanged.
- `SignalOptimizer` remains unchanged.
- Vehicle kinematics remain unchanged.
- No new simulation instances or clocks were created.

Green Wave remains 100% telemetry-only, preserving complete Dashboard Isolation.

## 5. Verification
- **Static Analysis:** Verified that `activeFreightDecisions` is not fed back into the traffic controller logic.
- **Build Verification:** Production Vite build (`node .\node_modules\vite\bin\vite.js build`) executed successfully.
  - Result: `✓ 2944 modules transformed. built in 10.89s`.

## 6. Remaining Limitations
- Green Wave does not change signals.
- No causal freight delay reduction can be claimed by the system.
- No Green Wave ON/OFF effectiveness benchmark exists yet.
- Freight/passenger segmented outcome metrics remain unavailable unless confirmed otherwise.

## 7. FINAL STATUS
### PASS — TELEMETRY CORRECTION VERIFIED
