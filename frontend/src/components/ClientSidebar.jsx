import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Briefcase, FileText, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { api } from '../api/client';

// Ground-truth client list — matches hindsight_kb.json exactly
const CLIENTS = [
  { id: "abcri1234d",  name: "Ramesh Iyer",    pan: "ABCRI1234D", years: 3, facts: 15, type: "individual" },
  { id: "bcdps5678e",  name: "Priya Sharma",   pan: "BCDPS5678E", years: 2, facts: 15, type: "individual" },
  { id: "cdemk9012f",  name: "MK Traders",     pan: "CDEMK9012F", years: 1, facts: 10, type: "business"   },
  { id: "dghsk3456g",  name: "Suresh Karthik", pan: "DGHSK3456G", years: 2, facts: 10, type: "individual" },
  { id: "efgna7890h",  name: "Nalini Anand",   pan: "EFGNA7890H", years: 3, facts: 10, type: "individual" },
  { id: "newclient000", name: "New Client",    pan: "ZZZXX0000Z", years: 0, facts: 0,  type: "individual" },
];

export default function ClientSidebar({ selectedClient, onSelectClient }) {
  // Map of clientId → live recall count (fetched once per session)
  const [liveCounts, setLiveCounts] = useState({});
  const [loadingId, setLoadingId]   = useState(null);

  // Fetch live memory counts for all real clients on mount
  useEffect(() => {
    const fetchCounts = async () => {
      const results = await Promise.allSettled(
        CLIENTS.filter(c => c.facts > 0).map(async (client) => {
          try {
            const res = await api.getMemory(client.id);
            return { id: client.id, count: (res.entries || []).length };
          } catch {
            return { id: client.id, count: client.facts }; // fallback to KB-defined count
          }
        })
      );
      const counts = {};
      results.forEach(r => {
        if (r.status === 'fulfilled' && r.value) {
          counts[r.value.id] = r.value.count;
        }
      });
      setLiveCounts(counts);
    };
    fetchCounts();
  }, []);

  const handleSelect = (clientId) => {
    setLoadingId(clientId);
    onSelectClient(clientId);
    // Clear loading indicator after a moment
    setTimeout(() => setLoadingId(null), 800);
  };

  return (
    <div className="w-72 h-full bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden shrink-0">
      {/* Brand header */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
          AI CA Agent
        </h1>
        <p className="text-slate-400 text-sm mt-1">Memory-Powered OS</p>
      </div>

      {/* Client list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-1 mb-3">
          Clients · {CLIENTS.filter(c => c.facts > 0).length} active
        </p>

        {CLIENTS.map((client) => {
          const isSelected   = selectedClient === client.id;
          const isLoading    = loadingId === client.id;
          // Prefer live recall count; fall back to KB-defined fact count
          const displayCount = liveCounts[client.id] ?? client.facts;
          const hasMemory    = displayCount > 0;

          return (
            <motion.div
              key={client.id}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => handleSelect(client.id)}
              className={clsx(
                "p-4 rounded-xl cursor-pointer transition-all border",
                isSelected
                  ? "bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                  : "bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800"
              )}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className={clsx(
                  "p-2 rounded-lg transition-colors",
                  isSelected ? "bg-indigo-500/20" : "bg-slate-700"
                )}>
                  {client.type === "business"
                    ? <Briefcase size={17} className={isSelected ? "text-indigo-300" : "text-cyan-400"} />
                    : <UserCircle size={17} className={isSelected ? "text-indigo-300" : "text-indigo-400"} />
                  }
                </div>
                <div className="min-w-0">
                  <h3 className={clsx(
                    "font-semibold text-sm truncate",
                    isSelected ? "text-indigo-200" : "text-slate-100"
                  )}>
                    {client.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">{client.pan}</p>
                </div>
                {isLoading && <Loader2 size={14} className="text-indigo-400 animate-spin ml-auto shrink-0" />}
              </div>

              <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className={clsx(
                    "w-1.5 h-1.5 rounded-full",
                    hasMemory ? "bg-emerald-400" : "bg-slate-600"
                  )} />
                  {hasMemory
                    ? <>{displayCount} fact{displayCount !== 1 ? 's' : ''}</>
                    : <span className="text-slate-600">No history</span>
                  }
                </span>
                {client.years > 0 && (
                  <span className="flex items-center gap-1 text-slate-500">
                    <FileText size={11} />
                    {client.years} yr{client.years !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <p className="text-[10px] text-slate-700 text-center">
          Powered by Vectorize Hindsight
        </p>
      </div>
    </div>
  );
}
