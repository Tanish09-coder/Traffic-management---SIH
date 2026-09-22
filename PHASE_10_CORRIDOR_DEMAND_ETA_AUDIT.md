# PHASE 10 — CORRIDOR DEMAND & ETA MODEL FORENSIC AUDIT

## 1. TRACE J1/J2/J3/J4 DATA SOURCES

| Junction | PCU Source | Live/Modeled | Formula | Provenance |
| -------- | ---------- | ------------ | ------- | ---------- |
| **J1** | `LogisticsSimulationPage.jsx` (`MODELED_CORRIDOR_BASELINE.totalPcu`) | Modeled | `20 + 20 + 20 + 20` | Hardcoded / Configured Assumption |
| **J2** | `LogisticsSimulationPage.jsx` (`MODELED_CORRIDOR_BASELINE.totalPcu`) | Modeled | `20 + 20 + 20 + 20` | Hardcoded / Configured Assumption |
| **J3** | `LogisticsSimulationPage.jsx` (`state.queues`) | Live | `liveN + liveS + liveE + liveW` | Derived from `SimulationContext` (live queue length) |
| **J4** | `LogisticsSimulationPage.jsx` (`MODELED_CORRIDOR_BASELINE.totalPcu`) | Modeled | `20 + 20 + 20 + 20` | Hardcoded / Configured Assumption |

## 2. EXPLAIN THE 80 PCU
**Classification:** `CONFIGURED MODEL PARAMETER` (Project Assumption)

The `80 PCU` value explicitly comes from `MODELED_CORRIDOR_BASELINE` in `LogisticsSimulationPage.jsx`. It is manually configured as `20 PCU` per approach (`N`, `S`, `E`, `W`). It does NOT represent live traffic, historical traffic, or external data. It is a configured baseline assumption used to visually populate the macroscopic corridor model.

## 3. INVESTIGATE EXISTING TRAFFIC DATA
The repository contains an empirical traffic dataset:
- **Source File:** `backend/prediction/historicalTrafficLoader.js` & `backend/prediction/trafficPredictor.js`
- **Data Meaning:** Vehicle counts categorized by direction (UP, DOWN, LEFT, RIGHT).
- **Units:** Vehicle count per 5-minute interval.
- **Geographic Location:** Pune.
- **Suitability for J1/J2/J3/J4:** **NOT SUITABLE.** The corridor explicitly models the BKC-Western Express Arterial in Mumbai. The Pune dataset represents a single isolated intersection in a different city.
- **Geographic Mismatch:** Connecting this data to the BKC corridor would create a severe geographic and semantic mismatch. The repository contains NO corridor-level demand data.

## 4. AUDIT CORRIDOR GEOGRAPHY
**Architecture Classification:** `B. single-junction microscopic simulation + macro corridor model`

The corridor configuration in `CorridorCoordinator.js` defines:
- **J1 (Worli Interchange) → J2 (Dadar TT):** 3.4 km
- **J2 (Dadar TT) → J3 (BKC Central):** 4.2 km
- **J3 (BKC Central) → J4 (Andheri WEH):** 5.8 km

These distances accurately reflect approximate real-world road-network distances in Mumbai. However, they are strictly configured values used for mathematical calculation in the macro model. Simulated vehicles do NOT physically traverse these distances in the engine. The engine simulates only ONE microscopic intersection (J3).

## 5. AUDIT ETA CALCULATION
In `CorridorCoordinator.js`, the ETA (Travel Time) is calculated strictly as a kinematic link transit time:
```javascript
const travelTimeSec = Math.round((link.distanceKm / currentSpeed) * 3600);
```
- **Distance input:** Configured link distance (e.g., 3.4 km).
- **Speed input:** Configured speed (35 km/h from `MODELED_CORRIDOR_BASELINE` or `state`).
- **Adjustments:** NONE. There is no traffic multiplier, no queue delay, no signal delay, and no weather effect applied to the travel time.

**Example Calculation (J1 → J2):**
- Distance = `3.4 km`
- Speed = `35 km/h`
- Formula: `(3.4 / 35) * 3600 = 350 seconds`
- Displayed UI (`travelTimeSec / 60`): `Math.round(350 / 60) = 6 minutes`. (Matches UI exactly).

## 6. CRITICAL QUESTION — WHAT DOES "ETA" MEAN?
**Semantic Meaning:** `1. Estimated travel time through that modeled junction/link`

The UI label `6m ETA` is semantically incorrect in the context of an "arrival time". It mathematically represents the **ideal free-flow travel time** strictly for that single inter-junction link, not a cumulative ETA from an origin hub, nor a delay-adjusted true arrival estimate. 

## 7. AUDIT J3 LIVE STATE
In `LogisticsSimulationPage.jsx`, J3 is uniquely hydrated using live simulation state:
- **PCU Calculation:** `liveN + liveS + liveE + liveW` where `liveN = state?.queues?.N`.
- **Live Status:** Yes, it updates every tick.
- **Signal/Position Effect:** Yes, the signal phase dictates whether vehicles stop and form a queue (increasing PCU) or move out (decreasing PCU).
- **J3 Speed/ETA:** The speed is **hardcoded to 35 km/h** (`speedKmph: 35`), meaning the PCU affects the junction's congestion classification color, but does NOT affect the downstream ETA calculation to J4.

## 8. AUDIT J1/J2/J4 BASELINE SPEED
- **Exact value:** `35`
- **File:** `LogisticsSimulationPage.jsx`
- **Variable:** `MODELED_CORRIDOR_BASELINE.approachData.[DIR].speedKmph`
- **Origin:** Configured Project Assumption. There is no evidence in the repository linking this to real road telematics or official traffic engineering standards.

## 9. AUDIT THE 3.4 / 4.2 / 5.8 KM DISTANCES
- **Definition:** `CorridorCoordinator.js` inside the `CORRIDORS` array.
- **Representation:** Link distances between the specified Mumbai landmarks.
- **Usage:** Yes, mathematically used in the `travelTimeSec` calculation.
- **Consistency:** Yes, the link segments are internally consistent with the geographic macro-model.

## 10. CHECK WHETHER THE CORRIDOR IS ACTUALLY CONNECTED
**Status:** `MACRO MODEL ONLY`

A single freight vehicle CANNOT physically traverse from J1 to J4. The `VehicleManager` spawns vehicles directly into the J3 intersection and deletes them when they clear the bounds. The corridor is a mathematical macro model visually layered on top of a single-junction microscopic simulation.

## 11. AUDIT SCENARIO EFFECTS
Scenarios (e.g., "Peak Freight Corridor Flow"):
- **Do they change PCU/Speed/ETA?** They dynamically change the J3 PCU by mutating `freightDemandMultiplier`, spawning more trucks into the micro-simulation. This changes J3's congestion classification.
- **Do they change J1/J2/J4?** NO. The baseline junctions remain completely static.
- **Do they change ETA?** NO. Speed remains hardcoded at 35 km/h.

## 12. DETERMINE WHAT IS ACTUALLY WRONG

- **80 PCU at J1/J2/J4:** `MODELING ASSUMPTION` (Defensible as a baseline, but lacks real-world provenance).
- **3.4 / 4.2 / 5.8 km distances:** `CORRECT` (Valid configured geographic distances).
- **35 km/h speed:** `MODELING ASSUMPTION`
- **J3 PCU derived from queues:** `MODELING ASSUMPTION` (Queue length is a valid, though simplified, proxy for localized PCU).
- **6m / 7m / 10m ETA:** `UI SEMANTIC ISSUE` (The math is a correct link-transit calculation, but calling it "ETA" implies a dynamic, cumulative arrival time).

## 13. FUTURE OPTIONS — NO IMPLEMENTATION

### OPTION A: Improve Provenance and UI Wording
- **Required Changes:** Rename "ETA" to "Link Transit Time". Add disclaimers clarifying J1/J2/J4 are static baselines.
- **Risk:** Zero. Preserves current architecture perfectly.

### OPTION B: Derive from Existing Dataset
- **Architectural Impact:** High risk. Merging single-junction Pune CSV data into a Mumbai corridor model creates a fraudulent geographic and mathematical mismatch.

### OPTION C: Synthetic Demand Model
- **Required Changes:** Build a procedural flow generator that dynamically fluctuates J1/J2/J4 PCU using sine waves or temporal profiles.
- **Realism Improvement:** High visual realism, but mathematically synthetic.

### OPTION D: True Multi-Junction Corridor Simulation
- **Required Changes:** Complete rewrite of `VehicleManager` and `SimulationContext` to support a massive physics grid encompassing all four intersections.
- **Risk:** Extreme. Violates the existing single-junction performance envelope.

## 14. FINAL DECISION GATE

### CURRENT MODEL STATUS
`DEFENSIBLE WITH UI/PROVENANCE CHANGES`

**Supporting Evidence:**
1. The mathematical formulas are correctly executed (Distance / Speed).
2. The geographic distances (3.4 km, 4.2 km) are logically mapped to Mumbai coordinates.
3. The codebase accurately maintains a firewall between the live J3 micro-simulation and the J1/J2/J4 macro-model baselines.
4. The primary flaw is UI semantics: mislabeling static "Link Transit Time" as dynamic "ETA". No fundamental rewrite is required if the UI accurately describes the mathematical reality.
