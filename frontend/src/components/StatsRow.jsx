import React from 'react';
import { Database, ShieldAlert, Clock, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatsRow({ entriesCount, avgConfidence, staleCount, lastSync }) {
  const stats = [
    { label: "Memory Entries", value: entriesCount, icon: Database, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Avg Confidence", value: `${avgConfidence}%`, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Stale Entries (>9m)", value: staleCount, icon: ShieldAlert, color: staleCount > 0 ? "text-amber-400" : "text-slate-400", bg: staleCount > 0 ? "bg-amber-400/10" : "bg-slate-800" },
    { label: "Last Write", value: lastSync, icon: Clock, color: "text-purple-400", bg: "bg-purple-400/10" }
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {stats.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-md rounded-2xl p-4 flex items-center space-x-4"
        >
          <div className={`p-3 rounded-xl ${s.bg}`}>
            <s.icon size={20} className={s.color} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{s.label}</p>
            <p className="text-slate-100 font-bold text-lg">{s.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
