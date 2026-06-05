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

  const clientSummaries = {
    "abcri1234d": {
      name: "Ramesh Iyer",
      profile: "Salaried IT Professional in the 30% bracket. Low risk tolerance. Focuses on Section 24(b) home loan deductions."
    },
    "bcdps5678e": {
      name: "Priya Sharma",
      profile: "Salaried professional at TCS. Consistently prefers the New Tax Regime due to simpler filing and lack of major investments."
    },
    "cdemk9012f": {
      name: "MK Traders",
      profile: "Registered business filing GST. Currently under scrutiny for Assessment Year 2024-25."
    }
  };
  
  const summary = clientSummaries[clientId] || { name: "New Client", profile: "No data available." };

  return (
    <div className="flex-1 h-full bg-slate-950 p-8 overflow-y-auto block">
      <div className="mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-white mb-2">Memory Audit View</h2>
        <p className="text-slate-400">Direct access to the Vectorize Hindsight memory bank for this client.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 flex items-start gap-4">
        <div className="bg-indigo-500/20 text-indigo-400 p-3 rounded-xl border border-indigo-500/30 mt-0.5">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-bold mb-1">Mental Model: {summary.name}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            {summary.profile}
          </p>
        </div>
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
