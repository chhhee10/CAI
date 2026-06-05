import React, { useState } from 'react';
import MemoryCard from './MemoryCard';
import StatsRow from './StatsRow';
import { api } from '../api/client';
import { motion } from 'framer-motion';

const TABS = ["All", "Tax History", "Deductions", "Income", "Preferences", "Notices"];

export default function MemoryAuditView({ clientId, memoryEntries, setMemoryEntries }) {
  const [activeTab, setActiveTab] = useState("All");

  const handleDelete = async (key) => {
    await api.deleteMemory(key);
    setMemoryEntries(prev => prev.filter(e => e.key !== key));
  };

  const filteredEntries = memoryEntries.filter(entry => {
    if (activeTab === "All") return true;
    const tabKey = activeTab.toLowerCase().replace(" ", "_");
    return entry.key.includes(tabKey);
  });

  const staleCount = memoryEntries.filter(e => e.key.includes("ay2122") || e.key.includes("ay2223")).length;
  const avgConfidence = memoryEntries.length > 0 ? 
    Math.round(memoryEntries.reduce((acc, e) => acc + (typeof e.value === 'string' && e.value.includes("form16") ? 95 : 72), 0) / memoryEntries.length) : 0;

  return (
    <div className="flex-1 h-full bg-slate-950 p-8 overflow-y-auto block">
      <div className="mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-white mb-2">Memory Audit View</h2>
        <p className="text-slate-400">Direct access to the Vectorize Hindsight memory bank for this client.</p>
      </div>

      <StatsRow 
        entriesCount={memoryEntries.length} 
        avgConfidence={avgConfidence} 
        staleCount={staleCount}
        lastSync="Just now" 
      />

      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start pb-4">
        {filteredEntries.map((entry, idx) => (
          <MemoryCard key={entry.key} memory={entry} onDelete={handleDelete} />
        ))}
        {filteredEntries.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-500">No memory entries found for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
