/**
 * Legend.jsx
 *
 * Owner: Shreya (new file, created from scratch)
 * Role:  Styling, Polish & Feature Prototyping
 *
 * Purpose:
 *   Self-contained legend panel explaining the visual language of the
 *   Traffic Management dashboard — car colors, signal states, and key
 *   metric terms (Queue, Throughput, etc.).
 *
 * Integration note:
 *   This is a prototype. Hand off to:
 *     - Nishit  → if you want it inserted into a page (Dashboard / LiveIntersection)
 *     - Arnav   → if you want it promoted to a reusable component alongside the others
 *
 * Usage:
 *   import Legend from '../components/Legend';
 *   <Legend />                        // default: collapsed, bottom-right
 *   <Legend defaultOpen position="inline" />   // always open, inline layout
 *
 * Props:
 *   defaultOpen  {boolean}  – start expanded (default: false)
 *   position     {string}   – 'floating' | 'inline'  (default: 'floating')
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Siren,
  TrafficCone,
  CircleDot,
  TrendingUp,
  AlarmClock,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';

/* ── Data definitions ────────────────────────────────────── */

const CAR_TYPES = [
  {
    swatch: '#3b82f6',          // blue-500
    label: 'Standard vehicle',
    desc: 'Regular car or motorbike in the queue.',
  },
  {
    swatch: '#ef4444',          // red-500
    label: 'Emergency vehicle',
    desc: 'Ambulance / fire truck — triggers priority override for its lane.',
    pulse: true,
  },
];

const SIGNAL_STATES = [
  {
    dot: '#22c55e',             // green-500
    label: 'GREEN — Active lane',
    desc: 'Vehicles in this direction are cleared to move.',
  },
  {
    dot: '#ef4444',             // red-500
    label: 'RED — Held lane',
    desc: 'Vehicles must wait; signal not granted to this direction.',
  },
  {
    dot: '#f59e0b',             // amber-500
    label: 'YELLOW — Emergency',
    desc: 'Emergency vehicle detected; light flashes amber for caution.',
    pulse: true,
  },
];

const TERMS = [
  {
    icon: Layers,
    term: 'Queue',
    def: 'Number of vehicles waiting at a lane entrance right now.',
  },
  {
    icon: TrendingUp,
    term: 'Throughput',
    def: 'Vehicles cleared through the intersection per minute.',
  },
  {
    icon: AlarmClock,
    term: 'Avg Wait Time',
    def: 'Mean time a vehicle spends waiting before the signal turns green.',
  },
  {
    icon: TrafficCone,
    term: 'Signal Duration',
    def: 'How long (seconds) the current green phase lasts — set adaptively by the AI.',
  },
  {
    icon: CircleDot,
    term: 'Priority Override',
    def: 'AI or operator forces one lane green, ignoring the normal rotation.',
  },
];

/* ── Sub-components ──────────────────────────────────────── */

function Section({ title }) {
  return (
    <div className="legend-divider" role="separator">
      <span
        style={{
          display: 'inline-block',
          marginTop: '-9px',
          background: 'var(--clr-surface)',
          padding: '0 6px',
          fontSize: '0.6rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--clr-text-muted)',
        }}
      >
        {title}
      </span>
    </div>
  );
}

function CarRow({ swatch, label, desc, pulse }) {
  return (
    <div className="legend-row">
      <span
        className="legend-swatch"
        style={{
          background: swatch,
          boxShadow: pulse ? `0 0 6px ${swatch}` : undefined,
        }}
        aria-hidden="true"
      />
      <div>
        <span className="legend-term">{label}</span>
        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--clr-text-muted)', marginTop: 1 }}>
          {desc}
        </span>
      </div>
    </div>
  );
}

function SignalRow({ dot, label, desc, pulse }) {
  return (
    <div className="legend-row">
      <span
        className="legend-dot"
        style={{
          background: dot,
          boxShadow: pulse ? `0 0 8px ${dot}` : undefined,
          animation: pulse ? 'pulse-glow 1.8s ease-in-out infinite' : undefined,
        }}
        aria-hidden="true"
      />
      <div>
        <span className="legend-term" style={{ minWidth: 'unset' }}>{label}</span>
        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--clr-text-muted)', marginTop: 1 }}>
          {desc}
        </span>
      </div>
    </div>
  );
}

function TermRow({ icon: Icon, term, def }) {
  return (
    <div className="legend-row">
      <Icon size={13} color="var(--clr-text-muted)" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
      <div>
        <span className="legend-term">{term}</span>
        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--clr-text-muted)', marginTop: 1 }}>
          {def}
        </span>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */

const Legend = ({ defaultOpen = false, position = 'floating' }) => {
  const [open, setOpen] = useState(defaultOpen);

  const panelContent = (
    <div className="legend-panel" style={{ minWidth: 260, maxWidth: 320 }}>
      {/* ── Car colours ── */}
      <h4>Vehicle colours</h4>
      {CAR_TYPES.map((c) => (
        <CarRow key={c.label} {...c} />
      ))}

      {/* ── Signal states ── */}
      <div className="legend-divider" />
      <h4>Signal states</h4>
      {SIGNAL_STATES.map((s) => (
        <SignalRow key={s.label} {...s} />
      ))}

      {/* ── Terms ── */}
      <div className="legend-divider" />
      <h4>Key terms</h4>
      {TERMS.map((t) => (
        <TermRow key={t.term} {...t} />
      ))}

      {/* ── Source note ── */}
      <div
        style={{
          marginTop: 12,
          padding: '8px 10px',
          background: 'rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.18)',
          borderRadius: 8,
          display: 'flex',
          gap: 6,
          alignItems: 'flex-start',
        }}
      >
        <Info size={12} color="var(--clr-primary)" style={{ flexShrink: 0, marginTop: 1 }} />
        <span style={{ fontSize: '0.68rem', color: 'var(--clr-text-muted)', lineHeight: 1.4 }}>
          Signal timing is set dynamically by the AI based on real-time queue lengths.
          Manual overrides are logged and auto-expire after&nbsp;60&nbsp;s.
        </span>
      </div>
    </div>
  );

  /* ── Inline layout (Nishit can drop this directly into a grid) ── */
  if (position === 'inline') {
    return panelContent;
  }

  /* ── Floating toggle (default) ── */
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 8,
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            key="legend-body"
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{ transformOrigin: 'bottom right' }}
          >
            {panelContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        id="legend-toggle-btn"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-expanded={open}
        aria-label={open ? 'Close legend' : 'Open legend'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 14px',
          borderRadius: 99,
          border: '1px solid var(--clr-border)',
          background: 'var(--clr-surface)',
          color: 'var(--clr-text-secondary)',
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
          letterSpacing: '0.02em',
          transition: 'background var(--t-fast), color var(--t-fast)',
        }}
      >
        <Info size={14} aria-hidden="true" />
        Legend
        {open ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
      </motion.button>
    </div>
  );
};

export default Legend;
