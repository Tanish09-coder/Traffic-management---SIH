# PHASE 10.4.1 MOVEMENT BLOCKER VALIDATION

## 1. Executive Summary
This read-only validation audit investigated the movement physics of `VehicleManager` to confirm the corridor traversal blocker identified in Phase 10.4. The audit unequivocally confirms the blocker: the simulation utilizes a strictly 1-dimensional array-bucket model for vehicle positioning. Vehicles cannot turn, change axes, or swap approaches during a junction traversal. Consequently, any intermediate junction transfer (such as entering West to depart North) is mathematically impossible under the current equations. The system requires a minimal discrete movement abstraction to support routing, but full 2D physics are not necessary.

## 2. Actual Vehicle Movement Model
* **Position representation**: A 1D scalar (`car.position`) ranging from 0 to 100.
* **Direction representation**: Vehicles are physically stored in buckets: `this.cars['N']`, `this.cars['W']`, etc. There is no intrinsic 2D vector for heading.
* **Velocity/Acceleration**: A 1D scalar increment: `car.position += moveSpeed * deltaSec`.
* **Stop-line position**: Abstract scalar threshold (`STOP_LINE_POSITION`).
* **Departure condition**: `car.position >= 100`.
* **Turning/Changing Axes**: **PROVABLY IMPOSSIBLE**. The update loop iterates over `Object.keys(this.cars)` and simply advances position. A vehicle in the `W` bucket can never migrate to the `N` bucket or declare itself an `N` departure.
* **Status**: `SOURCE VERIFIED`.

## 3. Direction Semantics
`N`, `S`, `E`, `W` act simultaneously as the entry spawn point and the isolated 1D travel lane. They are **NOT** 2D movement headings. A vehicle in `cars.W` is not moving "Westward" in a 2D space; it is simply advancing along the 1D timeline of the "West approach lane."
* **Status**: `SOURCE VERIFIED`.

## 4. J1→J2 Transfer Trace
1. J1 vehicle reaches `position >= 100` in the `N` bucket.
2. `SimulationContext` captures `dep.direction === 'N'` and passes it to `LinkManager`.
3. `LinkManager` completes transit and calls `J2.vehicleManager.injectExternalArrival('W', ...)`.
4. The vehicle is pushed into `J2.vehicleManager.cars['W']`.
5. The vehicle iterates `position` from 0 to 100 inside J2's `W` bucket.
6. The vehicle departs J2 with `direction: 'W'`.
7. `SimulationContext` ignores `W` departures for the `J2-J3` link. The vehicle exits the network.
* **Status**: `SOURCE VERIFIED`.

## 5. J2 W→N Feasibility
**PROVABLY IMPOSSIBLE**.
A vehicle entering `W` resides permanently in `this.cars['W']`. When `position >= 100`, the physics engine hardcodes the departure direction to match the bucket name (`direction`). It cannot depart `N`.
* **Status**: `SOURCE VERIFIED`.

## 6. J3 S→N Feasibility
**PROVABLY IMPOSSIBLE**.
A vehicle entering `S` resides in `this.cars['S']` and must depart `S`. It cannot transition to an `N` departure.
* **Status**: `SOURCE VERIFIED`.

## 7. J4 Exit Behavior
Entering `S` and exiting the network is **POSSIBLE**, because network exit is the default behavior for any lane not captured by `SimulationContext` link mappings.
* **Status**: `SOURCE VERIFIED`.

## 8. Turning Capability
* **Is there 2D physics?** No. There are no `x`, `y`, `angle`, `sin`, `cos`, or steering equations.
* **Is it a 1D approach simulation?** Yes.
* **Status**: `SOURCE VERIFIED`.

## 9. Route vs Movement Separation
* **Route Assignment**: The semantic itinerary (`J1` → `J2` → `J3` → `J4`).
* **Movement Maneuver**: The localized physics execution of fulfilling that itinerary at a single junction (e.g., instructing the `W` bucket to emit an `N` departure). These must remain separate concepts.
* **Status**: `STATIC SOURCE INFERENCE`.

## 10. `targetLane` Assessment
`targetLane` is conceptually flawed because it implies a literal lane change within the physical arrays. A more appropriate abstraction is `exitApproach` or `movementIntent` (e.g., straight, left, right), which simply overrides the `direction` field on the final departure object at `position >= 100` without requiring 2D steering physics.
* **Status**: `STATIC SOURCE INFERENCE`.

## 11. Hub Lifecycle Assessment
`LogisticsHubManager` currently monitors only J3 because it was built as a localized demo abstraction. The correct architectural trigger for a hub docking event should be: `vehicle reaches destination junction AND destinationHubId matches that junction/hub`.
* **Status**: `STATIC SOURCE INFERENCE`.

## 12. Corridor Distance Verification
* **Configured Geometry**: 3.4 + 4.2 + 5.8 = **13.4 km**. 
* **11.2 km Discrepancy**: The string `"Vital 11.2 km transit artery..."` found in `CorridorCoordinator.js` is merely stale UI description text and does not influence the mathematical geometry.
* **Status**: `SOURCE VERIFIED`.

## 13. Conservation Terminology Correction
The previously reported "vehicle conservation loss" is technically inaccurate. It is a **premature network exit**. The vehicle is not randomly deleted, lost to a memory leak, or duplicated; it successfully completes its designated 1D lane traversal in J2 and correctly exits the modeled simulation space due to the lack of turning semantics.
* **Status**: `SOURCE VERIFIED`.

## 14. Minimum Required Architectural Capability
The physics engine does **NOT** require a full 2D refactor. It requires a **Minimal Movement Abstraction**: Vehicles should be able to possess an `exitApproach` metadata field. Upon reaching `position >= 100`, the `VehicleManager` can emit the departure using `exitApproach` instead of defaulting to the lane's entry bucket name.
* **Status**: `STATIC SOURCE INFERENCE`.

## 15. Performance Implications
A minimal movement abstraction (e.g., a simple property lookup at departure time) preserves the current `O(vehicles)` efficiency per tick. It avoids the catastrophic performance degradation of introducing continuous 2D collision detection and rotational trigonometry.
* **Status**: `STATIC SOURCE INFERENCE`.

---

# 16. FINAL DECISION

**MOVEMENT BLOCKER CONFIRMED**

**MINIMAL MOVEMENT ABSTRACTION REQUIRED**

The 1D lane physics mathematically trap vehicles in their entry approach, forcing premature network exits and breaking corridor traversals. However, a full 2D physics overhaul is unnecessary. A discrete `exitApproach` abstraction applied at the moment of departure (`position >= 100`) will satisfy the PS 26205 logistics requirements while preserving existing architectural performance.
