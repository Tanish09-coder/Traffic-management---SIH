/**
 * EmergencyAlert.jsx
 *
 * Owner:  Shreya (brand-new file, created from scratch)
 * Role:   Styling, Polish & Feature Prototyping
 *
 * Purpose:
 *   Visual feedback banner for AI Emergency Priority Override events —
 *   shown when an ambulance, fire truck, or other emergency vehicle
 *   enters the intersection and the AI grants it priority.
 *
 * Integration note (for teammates):
 *   — Nishit: drop <EmergencyAlert /> into LiveIntersection.jsx or
 *     Dashboard.jsx wherever the existing emergency alert banner is.
 *     Pass the four props from the `state` object already available there.
 *   — Arnav: no changes needed to existing components.
 *
 * Props:
 *   active      {boolean} – true when emergency override is live
 *   lane        {string}  – direction code, e.g. "N", "S", "E", "W"
 *   vehicleType {string}  – e.g. "Ambulance", "Fire Truck"
 *   eta         {string}  – e.g. "~8s", "Arriving now"
 *
 * Requires:
 *   lucide-react  (already in package.json)
 *   framer-motion (already in package.json)
 *   dashboard/src/index.css  for .emergency-strobe-active and .beacon-flash
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
  Siren,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Navigation,
} from 'lucide-react';

/* ── helpers ────────────────────────────────────────────────── */

/** Full direction name from single-letter code */
const DIRECTION_LABELS = {
  N: 'North',
  S: 'South',
  E: 'East',
  W: 'West',
};

/** Vehicle-type → accent color (Tailwind arbitrary / inline) */
const VEHICLE_COLORS = {
  Ambulance:    { bg: 'rgba(239,68,68,0.12)',  border: '#ef4444', text: '#fca5a5' },
  'Fire Truck': { bg: 'rgba(249,115,22,0.12)', border: '#f97316', text: '#fdba74' },
  Police:       { bg: 'rgba(59,130,246,0.12)', border: '#3b82f6', text: '#93c5fd' },
};
const DEFAULT_COLOR = { bg: 'rgba(239,68,68,0.12)', border: '#ef4444', text: '#fca5a5' };

/* ══════════════════════════════════════════════════════════════
   STANDBY STATE  — compact monitoring pill
   ══════════════════════════════════════════════════════════════ */
function StandbyBadge() {
  return (
    <div
      id="emergency-alert-standby"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
      style={{
        background: 'rgba(100,116,139,0.12)',
        border: '1px solid rgba(100,116,139,0.25)',
        color: '#94a3b8',
      }}
      role="status"
      aria-label="Emergency system monitoring"
    >
      <CheckCircle2 size={12} aria-hidden="true" />
      Emergency System: Monitoring
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ACTIVE OVERRIDE BANNER
   ══════════════════════════════════════════════════════════════ */
function ActiveBanner({ lane, vehicleType, eta }) {
  const colors  = VEHICLE_COLORS[vehicleType] ?? DEFAULT_COLOR;
  const dirFull = DIRECTION_LABELS[lane] ?? lane;

  return (
    <motion.div
      id="emergency-alert-active"
      key="emergency-active"
      initial={{ opacity: 0, y: -16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,   scale: 1 }}
      exit={{    opacity: 0, y: -12,  scale: 0.97 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}

      /* .emergency-strobe-active supplies the cycling border + glow */
      className="emergency-strobe-active rounded-xl overflow-hidden"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{ background: colors.bg }}
    >
      {/* ── top label bar ── */}
      <div
        className="flex items-center justify-between px-4 py-2 text-xs font-bold uppercase tracking-widest"
        style={{
          background: 'rgba(0,0,0,0.30)',
          borderBottom: `1px solid ${colors.border}44`,
          color: colors.text,
          letterSpacing: '0.12em',
        }}
      >
        <div className="flex items-center gap-2">
          {/* Beacon icon — strobe animation */}
          <span className="beacon-flash" aria-hidden="true">
            <Siren size={14} color={colors.text} />
          </span>
          Priority Override Active
        </div>
        <span style={{ color: '#64748b', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
          AI managed
        </span>
      </div>

      {/* ── main body ── */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-3">

        {/* Vehicle type */}
        <div className="flex items-center gap-2">
          <span className="beacon-flash" aria-hidden="true">
            <Siren size={20} color={colors.text} />
          </span>
          <div>
            <div className="text-xs font-medium" style={{ color: '#64748b' }}>Vehicle</div>
            <div className="text-sm font-bold" style={{ color: colors.text }}>
              {vehicleType}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 32, background: `${colors.border}33` }} aria-hidden="true" />

        {/* Affected lane */}
        <div className="flex items-center gap-2">
          <Navigation size={16} color={colors.text} aria-hidden="true" />
          <div>
            <div className="text-xs font-medium" style={{ color: '#64748b' }}>Priority Lane</div>
            <div className="text-sm font-bold" style={{ color: colors.text }}>
              {dirFull} ({lane})
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 32, background: `${colors.border}33` }} aria-hidden="true" />

        {/* ETA badge */}
        <div className="flex items-center gap-2">
          <Clock size={16} color={colors.text} aria-hidden="true" />
          <div>
            <div className="text-xs font-medium" style={{ color: '#64748b' }}>ETA</div>
            <div
              className="text-sm font-extrabold px-2 py-0.5 rounded"
              style={{
                background: `${colors.border}22`,
                border: `1px solid ${colors.border}55`,
                color: colors.text,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {eta}
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Warning badge — right-aligned */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{
            background: 'rgba(239,68,68,0.18)',
            border: '1px solid rgba(239,68,68,0.35)',
            color: '#fca5a5',
          }}
        >
          <ShieldAlert size={12} aria-hidden="true" />
          All other lanes HELD
        </div>
      </div>

      {/* ── auto-disable notice ── */}
      <div
        className="px-4 py-2 text-xs"
        style={{
          background: 'rgba(0,0,0,0.20)',
          borderTop: `1px solid ${colors.border}22`,
          color: '#475569',
        }}
      >
        Override auto-disables after 60 s · Mumbai Traffic Police notified
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN EXPORT
   ══════════════════════════════════════════════════════════════ */

/**
 * EmergencyAlert
 *
 * @param {boolean} active      – true when override is live
 * @param {string}  lane        – direction code ("N" | "S" | "E" | "W")
 * @param {string}  vehicleType – "Ambulance" | "Fire Truck" | "Police" | any string
 * @param {string}  eta         – e.g. "~8s" or "Arriving now"
 */
const EmergencyAlert = ({
  active      = false,
  lane        = 'N',
  vehicleType = 'Ambulance',
  eta         = '~8s',
}) => {
  return (
    <AnimatePresence mode="wait">
      {active ? (
        <ActiveBanner
          key="active"
          lane={lane}
          vehicleType={vehicleType}
          eta={eta}
        />
      ) : (
        <motion.div
          key="standby"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{    opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <StandbyBadge />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmergencyAlert;
