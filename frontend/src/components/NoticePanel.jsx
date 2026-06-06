import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { AlertTriangle, CheckCircle2, Clock, RefreshCw, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NoticePanel({ clientId }) {
  const [notices, setNotices] = useState({ open: [], closed: [] });
  const [loading, setLoading] = useState(false);

  const fetchNotices = async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const data = await api.getNotices(clientId);
      setNotices(data);
    } catch (e) {
      console.error('Failed to load notices:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [clientId]);

  const urgencyConfig = {
    high:   { bg: 'bg-red-500/10',    border: 'border-red-500/40',    badge: 'bg-red-500/20 text-red-400',    dot: 'bg-red-500',    icon: <AlertTriangle size={16} className="text-red-400" /> },
    normal: { bg: 'bg-amber-500/10',  border: 'border-amber-500/40',  badge: 'bg-amber-500/20 text-amber-400',  dot: 'bg-amber-500',  icon: <Clock size={16} className="text-amber-400" /> },
    low:    { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', badge: 'bg-indigo-500/20 text-indigo-400', dot: 'bg-indigo-500', icon: <Clock size={16} className="text-indigo-400" /> },
  };

  const renderOpenCard = (notice, idx) => {
    const val = typeof notice.value === 'string' ? JSON.parse(notice.value) : notice.value;
    const cfg = urgencyConfig[val.urgency] || urgencyConfig.low;

    return (
      <motion.div
        key={notice.key || idx}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.06 }}
        className={`p-4 rounded-xl border mb-3 ${cfg.bg} ${cfg.border}`}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0 mt-0.5`} />
            {cfg.icon}
            <h4 className="font-semibold text-slate-200 text-sm leading-tight">{val.type}</h4>
          </div>
          {val.ay && val.ay !== '—' && (
            <span className="text-xs font-mono bg-slate-900/60 px-2 py-0.5 rounded text-slate-400 border border-slate-800 shrink-0 ml-2">
              AY {val.ay}
            </span>
          )}
        </div>

        {/* Notice description */}
        {val.raw && (
          <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-3" title={val.raw}>
            {val.raw}
          </p>
        )}

        {/* Deadline row */}
        <div className="flex justify-between items-center bg-slate-900/50 px-3 py-2 rounded-lg">
          <span className="text-xs text-slate-400">
            {val.deadline ? `Deadline: ${val.deadline}` : 'Action required'}
          </span>
          {val.days_left !== null && val.days_left !== undefined ? (
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${cfg.badge}`}>
              {val.days_left >= 0 ? `${val.days_left}d left` : `${Math.abs(val.days_left)}d overdue`}
            </span>
          ) : (
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300">Open</span>
          )}
        </div>
      </motion.div>
    );
  };

  const renderClosedCard = (notice, idx) => {
    const val = typeof notice.value === 'string' ? JSON.parse(notice.value) : notice.value;

    return (
      <motion.div
        key={notice.key || idx}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.06 }}
        className="p-4 rounded-xl border mb-3 bg-slate-800/20 border-slate-700/50"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            <h4 className="font-semibold text-slate-400 text-sm">{val.type}</h4>
          </div>
          {val.ay && val.ay !== '—' && (
            <span className="text-xs font-mono bg-slate-900/40 px-2 py-0.5 rounded text-slate-600 border border-slate-800 shrink-0 ml-2">
              AY {val.ay}
            </span>
          )}
        </div>
        {val.raw && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2" title={val.raw}>
            {val.raw}
          </p>
        )}
        <div className="mt-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
            ✓ Resolved
          </span>
        </div>
      </motion.div>
    );
  };

  const EmptyState = ({ label }) => (
    <div className="py-6 flex flex-col items-center gap-2 text-center">
      <Shield size={28} className="text-slate-700" />
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden border-l border-slate-800/50">
      {/* Panel Header */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-800 shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white">Compliance & Notices</h2>
            <p className="text-xs text-slate-500 mt-0.5">Automated deadline tracking</p>
          </div>
          <button
            onClick={fetchNotices}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Summary badges */}
        {!loading && (
          <div className="flex gap-2 mt-3">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              notices.open.length > 0 ? 'bg-red-500/15 text-red-400' : 'bg-slate-800 text-slate-500'
            }`}>
              {notices.open.length} open
            </span>
            <span className="text-xs px-2 py-1 rounded-full font-medium bg-slate-800 text-slate-500">
              {notices.closed.length} resolved
            </span>
          </div>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map(i => (
              <div key={i} className="h-24 rounded-xl bg-slate-800/40 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Open action items */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${notices.open.length > 0 ? 'bg-red-500' : 'bg-slate-700'}`} />
                Open Action Items
              </h3>
              <AnimatePresence>
                {notices.open.length > 0
                  ? notices.open.map((n, i) => renderOpenCard(n, i))
                  : <EmptyState label="No open notices for this client." />
                }
              </AnimatePresence>
            </div>

            {/* Closed notices */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                Resolved Notices
              </h3>
              <AnimatePresence>
                {notices.closed.length > 0
                  ? notices.closed.map((n, i) => renderClosedCard(n, i))
                  : <EmptyState label="No resolved notice history." />
                }
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
