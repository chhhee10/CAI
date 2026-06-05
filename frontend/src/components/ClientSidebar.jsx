import React from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Briefcase, FileText } from 'lucide-react';
import clsx from 'clsx';

const CLIENTS = [
  { id: "abcri1234d", name: "Ramesh Iyer", pan: "ABCRI1234D", entries: 14, years: 3 },
  { id: "bcdps5678e", name: "Priya Sharma", pan: "BCDPS5678E", entries: 4, years: 2 },
  { id: "cdemk9012f", name: "MK Traders", pan: "CDEMK9012F", entries: 2, years: 1 },
  { id: "newclient000", name: "New Client", pan: "ZZZXX0000Z", entries: 0, years: 0 }
];

export default function ClientSidebar({ selectedClient, onSelectClient, activeClientEntriesCount }) {
  return (
    <div className="w-80 h-full bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
          AI CA Agent
        </h1>
        <p className="text-slate-400 text-sm mt-1">Memory-Powered OS</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {CLIENTS.map((client) => (
          <motion.div
            key={client.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectClient(client.id)}
            className={clsx(
              "p-4 rounded-xl cursor-pointer transition-all border",
              selectedClient === client.id
                ? "bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                : "bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800"
            )}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-slate-700 rounded-lg">
                {client.name.includes('Traders') ? <Briefcase size={18} className="text-cyan-400" /> : <UserCircle size={18} className="text-indigo-400" />}
              </div>
              <div>
                <h3 className="text-slate-100 font-semibold">{client.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{client.pan}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <div className={clsx("w-1.5 h-1.5 rounded-full", (client.id === selectedClient ? activeClientEntriesCount : client.entries) > 0 ? "bg-green-400" : "bg-slate-600")} />
                {client.id === selectedClient ? activeClientEntriesCount : client.entries} facts
              </span>
              <span className="flex items-center gap-1">
                <FileText size={12} />
                {client.years} yrs history
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
