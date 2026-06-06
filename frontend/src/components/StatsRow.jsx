import React from 'react';
import { Database, ShieldAlert, Clock, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatsRow({ entriesCount, avgConfidence, staleCount, lastSync }) {
  const stats = [
    { label: "Memory Entries",   value: entriesCount,       icon: Database,    accent: '#E8641E' },
    { label: "Avg Confidence",   value: `${avgConfidence}%`,icon: Activity,    accent: '#16a34a' },
    { label: "Stale Entries",    value: staleCount,          icon: ShieldAlert, accent: staleCount > 0 ? '#f59e0b' : '#ccc' },
    { label: "Last Write",       value: lastSync,            icon: Clock,       accent: '#6366f1' },
  ];

  return (
    <div style={s.grid}>
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          style={s.card}
        >
          <div style={{ ...s.iconWrap, background: `${stat.accent}18` }}>
            <stat.icon size={16} color={stat.accent} />
          </div>
          <div>
            <p style={s.label}>{stat.label}</p>
            <p style={s.value}>{stat.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

const s = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
    marginBottom: '24px',
  },
  card: {
    background: '#fff',
    border: '1px solid #E8E4DA',
    borderRadius: '12px',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconWrap: {
    width: '34px',
    height: '34px',
    borderRadius: '9px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  label: {
    fontSize: '10px',
    color: '#bbb',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    margin: '0 0 2px',
  },
  value: {
    fontSize: '18px',
    fontWeight: 800,
    color: '#111',
    letterSpacing: '-0.03em',
    margin: 0,
    fontFamily: "'Inter', sans-serif",
  },
};
