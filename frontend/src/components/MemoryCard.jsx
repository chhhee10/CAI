import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, ChevronDown, ChevronUp, AlertCircle, Calendar } from 'lucide-react';
import clsx from 'clsx';

const categoryConfig = {
  tax_history:  { color: "bg-blue-500/10 text-blue-400 border-blue-500/20",     dot: "bg-blue-500",     label: "Tax History"  },
  deductions:   { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-500", label: "Deductions"   },
  income:       { color: "bg-purple-500/10 text-purple-400 border-purple-500/20",  dot: "bg-purple-500",  label: "Income"       },
  notices:      { color: "bg-red-500/10 text-red-400 border-red-500/20",         dot: "bg-red-500",     label: "Notice"       },
  preferences:  { color: "bg-amber-500/10 text-amber-400 border-amber-500/20",   dot: "bg-amber-500",   label: "Preference"   },
  fact:         { color: "bg-slate-500/10 text-slate-400 border-slate-500/20",   dot: "bg-slate-500",   label: "General"      },
};

// Truncate text to a word boundary
function truncate(text, maxChars = 140) {
  if (!text || text.length <= maxChars) return text;
  const cut = text.lastIndexOf(' ', maxChars);
  return text.slice(0, cut > 0 ? cut : maxChars) + '…';
}

export default function MemoryCard({ memory, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const valObj = typeof memory.value === 'string' ? JSON.parse(memory.value) : memory.value;

  // Prefer the plain "fact" string; fall back to JSON dump
  const factText = valObj?.fact
    ? valObj.fact
    : typeof valObj === 'object'
      ? JSON.stringify(valObj, null, 2)
      : String(valObj);

  const keyParts  = memory.key.split(':');
  const category  = keyParts.length > 2 ? keyParts[2] : "fact";
  const cfg       = categoryConfig[category] || categoryConfig.fact;

  // AY comes from the backend enrichment; fall back to scanning the text
  const ay = memory.ay || (() => {
    const m = factText.match(/AY\s*(\d{4}-\d{2,4})/i);
    return m ? m[1] : "";
  })();

  // Confidence heuristic (no real value in Hindsight recall response)
  const confidence = memory.confidence ?? (factText.length > 200 ? 88 : 74);
  const isStale    = memory.ay_sort > 0 && memory.ay_sort < 202223;
  const needsExpand = factText.length > 140;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-800/40 border border-slate-700 hover:border-slate-600 rounded-xl p-5 relative group transition-all"
    >
      {/* Header row */}
      <div className="flex justify-between items-start mb-3 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category badge */}
          <span className={clsx("px-2.5 py-1 text-[10px] font-bold tracking-wider rounded border", cfg.color)}>
            {cfg.label.toUpperCase()}
          </span>
          {/* AY badge */}
          {ay && (
            <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-slate-900/70 text-slate-400 border border-slate-700">
              <Calendar size={9} />
              AY {ay}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onDelete(memory.key)}
            className="p-1.5 text-red-400 hover:text-red-300 bg-red-400/10 rounded-lg hover:bg-red-400/20 transition-colors"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Fact text */}
      <div className="mb-4">
        <p className="text-sm text-slate-300 leading-relaxed">
          {expanded || !needsExpand ? factText : truncate(factText)}
        </p>
        {needsExpand && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="mt-1.5 flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read more</>}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        {/* Confidence bar */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Confidence</span>
          <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={clsx("h-full rounded-full", confidence > 85 ? "bg-emerald-400" : confidence > 70 ? "bg-amber-400" : "bg-red-400")}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <span className={clsx("font-bold", confidence > 85 ? "text-emerald-400" : confidence > 70 ? "text-amber-400" : "text-red-400")}>
            {confidence}%
          </span>
        </div>

        {/* Stale badge */}
        {isStale && (
          <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
            <AlertCircle size={11} />
            <span>Stale (&gt;9m)</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
