import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NoticePanel({ clientId }) {
  const [notices, setNotices] = useState({ open: [], closed: [] });

  useEffect(() => {
    if (clientId) {
      api.getNotices(clientId).then(data => setNotices(data));
    }
  }, [clientId]);

  const renderNoticeCard = (notice, idx) => {
    const val = typeof notice.value === 'string' ? JSON.parse(notice.value) : notice.value;
    const isHighUrgency = val.urgency === 'high';
    const isNormalUrgency = val.urgency === 'normal';

    return (
      <motion.div 
        key={idx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-xl border mb-3 ${
          val.status === 'closed' 
            ? 'bg-slate-800/30 border-slate-700' 
            : isHighUrgency 
              ? 'bg-red-500/10 border-red-500/30' 
              : isNormalUrgency
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-indigo-500/10 border-indigo-500/30'
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            {val.status === 'closed' ? (
              <CheckCircle2 size={18} className="text-emerald-500" />
            ) : isHighUrgency ? (
              <AlertTriangle size={18} className="text-red-500" />
            ) : (
              <Clock size={18} className="text-amber-500" />
            )}
            <h4 className="font-bold text-slate-200">{val.type}</h4>
          </div>
          <span className="text-xs font-mono bg-slate-900/50 px-2 py-1 rounded text-slate-400 border border-slate-800">AY {val.ay}</span>
        </div>
        
        <p className="text-sm text-slate-400 mb-3">Issued: {val.date}</p>
        
        {val.status === 'open' && (
          <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg">
            <span className="text-xs text-slate-400">Deadline: {val.deadline}</span>
            <span className={`text-xs font-bold px-2 py-1 rounded ${
              isHighUrgency ? 'bg-red-500/20 text-red-400' : 
              isNormalUrgency ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-300'
            }`}>
              {val.days_left} days left
            </span>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-8 overflow-y-auto border-l border-slate-800/50">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Compliance & Notices</h2>
        <p className="text-slate-400">Automated tracking of tax notices and deadlines.</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Open Action Items</h3>
          {notices.open.length > 0 ? (
            notices.open.map((n, i) => renderNoticeCard(n, i))
          ) : (
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-center text-slate-500">
              No open notices.
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Closed Notices</h3>
          {notices.closed.length > 0 ? (
            notices.closed.map((n, i) => renderNoticeCard(n, i))
          ) : (
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-center text-slate-500">
              No history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
