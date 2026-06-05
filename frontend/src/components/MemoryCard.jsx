import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Edit2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export default function MemoryCard({ memory, onDelete }) {
  // Try to parse JSON safely since mock might return dict directly or a string
  const valObj = typeof memory.value === 'string' ? JSON.parse(memory.value) : memory.value;
  
  // Extract confidence if available or mock it based on content
  const isVerified = valObj?.verified === "form16";
  const confidence = isVerified ? 95 : 72;
  const isStale = memory.key.includes("ay2122") || memory.key.includes("ay2223"); // Mock stale flag

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-800/40 border border-slate-700 hover:border-slate-600 rounded-xl p-5 relative group transition-all"
    >
      <div className="flex justify-between items-start mb-4 gap-3">
        <h4 className="text-indigo-300 font-mono text-xs break-words whitespace-pre-wrap bg-slate-900/50 px-2.5 py-1.5 rounded-lg border border-slate-800/50 flex-1">
          {memory.key}
        </h4>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button className="p-1.5 text-slate-400 hover:text-white bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
            <Edit2 size={14} />
          </button>
          <button onClick={() => onDelete(memory.key)} className="p-1.5 text-red-400 hover:text-red-300 bg-red-400/10 rounded-lg hover:bg-red-400/20 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mb-5">
        {typeof valObj === 'object' && valObj !== null ? (
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(valObj).map(([k, v]) => (
              <div key={k} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">{k.replace(/_/g, ' ')}</p>
                <p className="text-sm text-slate-200 font-medium break-words">
                  {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <p className="text-sm text-slate-200 font-medium break-words">{String(valObj)}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Confidence:</span>
            <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={clsx("h-full", confidence > 90 ? "bg-emerald-400" : "bg-amber-400")} 
                style={{ width: `${confidence}%` }} 
              />
            </div>
            <span className={clsx("font-bold", confidence > 90 ? "text-emerald-400" : "text-amber-400")}>
              {confidence}%
            </span>
          </div>
        </div>

        {isStale && (
          <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-1 rounded border border-amber-400/20">
            <AlertCircle size={12} />
            <span>Stale (&gt;9m)</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
