import React, { useState, useMemo } from 'react';
import MemoryCard from './MemoryCard';
import StatsRow from './StatsRow';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, ArrowDownUp, LayoutGrid, List } from 'lucide-react';

const TABS = ["All", "Tax History", "Deductions", "Income", "Preferences", "Notices"];

const clientSummaries = {
  "abcri1234d": {
    name: "Ramesh Iyer",
    profile: "Salaried IT professional at Infosys in the 30% bracket. Conservative investor. Active home loan (Mar 2025). Old Tax Regime preferred.",
    historyYears: 3,
  },
  "bcdps5678e": {
    name: "Priya Sharma",
    profile: "Salaried professional at Wipro. Freelance content writing on the side. New Tax Regime since AY2023-24. Form 16 pending.",
    historyYears: 2,
  },
  "cdemk9012f": {
    name: "MK Traders",
    profile: "Sole proprietorship trading firm. GST registered. Presumptive taxation under Sec 44AD. Active notice pending.",
    historyYears: 1,
  },
  "dghsk3456g": {
    name: "Suresh Karthik",
    profile: "Senior software engineer at TCS. Switched to New Tax Regime for AY2024-25 (₹28K savings). Has LTCG & rental income.",
    historyYears: 2,
  },
  "efgna7890h": {
    name: "Nalini Anand",
    profile: "Self-employed gynaecologist. Presumptive Sec 44ADA (below ₹50L). Expecting to cross threshold in FY2025-26.",
    historyYears: 3,
  },
};

export default function MemoryAuditView({ clientId, memoryEntries, setMemoryEntries }) {
  const [activeTab, setActiveTab]   = useState("All");
  const [sortOrder, setSortOrder]   = useState("newest"); // "newest" | "oldest"
  const [viewMode, setViewMode]     = useState("timeline"); // "timeline" | "grid"

  const handleDelete = async (key) => {
    await api.deleteMemory(key);
    setMemoryEntries(prev => prev.filter(e => e.key !== key));
  };

  // Filter by tab
  const tabFiltered = useMemo(() => {
    if (activeTab === "All") return memoryEntries;
    const tabKey = activeTab.toLowerCase().replace(" ", "_");
    return memoryEntries.filter(e => e.key.includes(tabKey));
  }, [memoryEntries, activeTab]);

  // Sort by AY (using ay_sort field from backend) then by order index as tiebreaker
  const sortedEntries = useMemo(() => {
    return [...tabFiltered].sort((a, b) => {
      const aAY = a.ay_sort ?? 0;
      const bAY = b.ay_sort ?? 0;
      if (aAY !== bAY) {
        return sortOrder === "newest" ? bAY - aAY : aAY - bAY;
      }
      // Tiebreak: use original recall order
      return sortOrder === "newest"
        ? (b.order ?? 0) - (a.order ?? 0)
        : (a.order ?? 0) - (b.order ?? 0);
    });
  }, [tabFiltered, sortOrder]);

  // Group by AY for timeline view
  const groupedByAY = useMemo(() => {
    const groups = {};
    sortedEntries.forEach(entry => {
      const label = entry.ay ? `AY ${entry.ay}` : "General / Cross-AY";
      if (!groups[label]) groups[label] = [];
      groups[label].push(entry);
    });
    // Preserve sorted order of groups
    const orderedKeys = [];
    sortedEntries.forEach(entry => {
      const label = entry.ay ? `AY ${entry.ay}` : "General / Cross-AY";
      if (!orderedKeys.includes(label)) orderedKeys.push(label);
    });
    return orderedKeys.map(k => ({ label: k, entries: groups[k] }));
  }, [sortedEntries]);

  const staleCount = memoryEntries.filter(e =>
    e.ay_sort > 0 && e.ay_sort < 202223
  ).length;

  const avgConfidence = memoryEntries.length > 0
    ? Math.round(memoryEntries.reduce((acc, e) => {
        const text = e.value?.fact ?? "";
        // Simple heuristic: longer, more specific facts = higher confidence
        return acc + (text.length > 200 ? 88 : 74);
      }, 0) / memoryEntries.length)
    : 0;

  const summary = clientSummaries[clientId] || {
    name: "New Client",
    profile: "No historical data found in memory bank.",
    historyYears: 0,
  };

  const ayGroupColors = [
    "border-l-indigo-500",
    "border-l-violet-500",
    "border-l-blue-500",
    "border-l-cyan-500",
    "border-l-emerald-500",
  ];

  return (
    <div className="flex-1 h-full bg-slate-950 p-8 overflow-y-auto block">
      {/* Header */}
      <div className="mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-white mb-1">Memory Audit View</h2>
        <p className="text-slate-400 text-sm">
          Vectorize Hindsight memory bank · sorted by Assessment Year
        </p>
      </div>

      {/* Client Mental Model */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 flex items-start gap-4">
        <div className="bg-indigo-500/20 text-indigo-400 p-3 rounded-xl border border-indigo-500/30 mt-0.5 shrink-0">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h3 className="text-white font-bold">{summary.name}</h3>
            {summary.historyYears > 0 && (
              <span className="text-xs bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">
                {summary.historyYears} yr history
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">{summary.profile}</p>
        </div>
      </div>

      <StatsRow
        entriesCount={memoryEntries.length}
        avgConfidence={avgConfidence}
        staleCount={staleCount}
        lastSync="Just now"
      />

      {/* Controls row */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        {/* Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sort + View controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSortOrder(o => o === "newest" ? "oldest" : "newest")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all text-sm font-medium"
            title={sortOrder === "newest" ? "Newest AY first" : "Oldest AY first"}
          >
            {sortOrder === "newest"
              ? <ArrowDownUp size={14} className="text-indigo-400" />
              : <ArrowUpDown size={14} className="text-indigo-400" />
            }
            {sortOrder === "newest" ? "Newest first" : "Oldest first"}
          </button>
          <button
            onClick={() => setViewMode(v => v === "timeline" ? "grid" : "timeline")}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all"
            title={viewMode === "timeline" ? "Switch to grid" : "Switch to timeline"}
          >
            {viewMode === "timeline" ? <LayoutGrid size={16} /> : <List size={16} />}
          </button>
        </div>
      </div>

      {/* Content */}
      {sortedEntries.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl">
          <p className="text-slate-500">No memory entries found for this category.</p>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid view */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start pb-4">
          <AnimatePresence>
            {sortedEntries.map((entry, idx) => (
              <MemoryCard key={entry.key} memory={entry} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Timeline view — grouped by AY */
        <div className="space-y-8 pb-4">
          {groupedByAY.map((group, gIdx) => (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gIdx * 0.05 }}
            >
              {/* AY group header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-1 h-8 rounded-full ${['bg-indigo-500','bg-violet-500','bg-blue-500','bg-cyan-500','bg-emerald-500'][gIdx % 5]}`} />
                <div>
                  <h3 className="text-sm font-bold text-slate-200 tracking-wide">{group.label}</h3>
                  <p className="text-xs text-slate-600">{group.entries.length} {group.entries.length === 1 ? 'record' : 'records'}</p>
                </div>
                <div className="flex-1 h-px bg-slate-800 ml-1" />
              </div>

              {/* Cards in this AY group */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 items-start pl-4 border-l-2 ${['border-l-indigo-500/30','border-l-violet-500/30','border-l-blue-500/30','border-l-cyan-500/30','border-l-emerald-500/30'][gIdx % 5]}`}>
                {group.entries.map((entry, idx) => (
                  <MemoryCard key={entry.key} memory={entry} onDelete={handleDelete} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
