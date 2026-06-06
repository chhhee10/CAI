import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, History } from 'lucide-react';

export default function NoticePanel({ clientId }) {
  const [notices, setNotices] = useState({ open: [], closed: [] });

  useEffect(() => {
    if (clientId) {
      api.getNotices(clientId).then(data => setNotices(data));
    }
  }, [clientId]);

  const renderNotice = (notice, idx) => {
    const val = typeof notice.value === 'string' ? JSON.parse(notice.value) : notice.value;
    return (
      <div key={idx} style={s.noticeCard}>
        <span style={s.noticeText}>{val.type}</span>
      </div>
    );
  };

  return (
    <div style={s.root}>
      <h2 style={s.title}>Compliance &<br/>Notices</h2>
      <p style={s.subtitle}>
        Automated tracking of tax notices<br/>and deadlines.
      </p>

      <div style={s.section}>
        <div style={s.sectionHeader}>
          <h3 style={s.sectionLabel}>OPEN ITEMS</h3>
        </div>
        <AnimatePresence>
          {notices.open.length > 0 ? (
            notices.open.map((n, i) => renderNotice(n, i))
          ) : (
            <div style={s.emptyOpenBox}>
              <Check size={20} color="#0D9488" style={{ marginBottom: '8px' }} />
              <span style={s.emptyText}>No open notices</span>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div style={s.section}>
        <div style={s.sectionHeader}>
          <h3 style={s.sectionLabel}>CLOSED NOTICES</h3>
        </div>
        {notices.closed.length > 0 ? (
          notices.closed.map((n, i) => renderNotice(n, i))
        ) : (
          <div style={s.emptyClosedBox}>
            <History size={20} color="#bbb" style={{ marginBottom: '8px' }} />
            <span style={s.emptyText}>No history yet</span>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  root: {
    width: '320px',
    height: '100%',
    background: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    padding: '32px 32px 32px 0',
    flexShrink: 0,
    fontFamily: "'Inter', sans-serif",
    color: '#111',
  },
  title: {
    fontSize: '32px',
    fontWeight: 900,
    margin: '0 0 12px',
    letterSpacing: '-0.02em',
    color: '#111',
    fontFamily: "'Arial Black', system-ui, sans-serif",
    lineHeight: 1.1,
  },
  subtitle: {
    fontSize: '14px',
    color: '#888',
    lineHeight: '1.5',
    margin: '0 0 48px',
  },
  section: {
    marginBottom: '32px',
  },
  sectionHeader: {
    marginBottom: '16px',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: 0,
  },
  noticeCard: {
    width: '100%',
    background: '#FDFBF4',
    border: '1px solid #E5E5E5',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  noticeText: {
    fontSize: '14px',
    color: '#111',
    fontWeight: 500,
  },
  emptyOpenBox: {
    width: '100%',
    background: '#FDFBF4',
    border: '1px solid #E5E5E5',
    borderRadius: '16px',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyClosedBox: {
    width: '100%',
    background: '#EAE6DB',
    borderRadius: '16px',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: '14px',
    color: '#888',
    fontWeight: 500,
  },
};
