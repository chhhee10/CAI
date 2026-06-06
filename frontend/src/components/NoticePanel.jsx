import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, History, Clock } from 'lucide-react';

export default function NoticePanel({ clientId }) {
  const [notices, setNotices] = useState({ open: [], closed: [] });

  useEffect(() => {
    if (clientId) {
      api.getNotices(clientId).then(data => setNotices(data));
    }
  }, [clientId]);

  const renderNotice = (notice, idx, isClosed = false) => {
    const val = typeof notice.value === 'string' ? JSON.parse(notice.value) : notice.value;
    
    // Determine dot color
    let dotColor = '#10B981'; // Green for low
    if (val.urgency === 'high') dotColor = '#EF4444'; // Red
    else if (val.urgency === 'normal') dotColor = '#F59E0B'; // Orange
    if (isClosed) dotColor = '#888'; // Grey for closed

    return (
      <div key={idx} style={s.noticeCard}>
        <div style={s.cardHeader}>
          <div style={s.cardTitleRow}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: dotColor, marginRight: 8 }} />
            <Clock size={14} color="#888" style={{ marginRight: 6 }} />
            <span style={s.noticeTitle}>{val.type}</span>
          </div>
          {val.ay && val.ay !== "—" && (
            <div style={s.ayBadge}>{val.ay}</div>
          )}
        </div>
        
        <p style={s.noticeDesc}>
          {val.raw}
        </p>

        <div style={s.cardFooter}>
          <span style={s.footerText}>{isClosed ? 'Resolved' : 'Action required'}</span>
          <button style={s.actionBtn}>{isClosed ? 'View' : 'Open'}</button>
        </div>
      </div>
    );
  };

  return (
    <div style={s.root}>
      <h2 style={s.title}>Compliance &<br/>Notices</h2>
      <p style={s.subtitle}>
        Automated tracking of tax notices<br/>and deadlines.
      </p>

      <div style={s.statsRow}>
        <div style={s.statBadgeOpen}>{notices.open.length} open</div>
        <div style={s.statBadgeClosed}>{notices.closed.length} resolved</div>
      </div>

      <div style={s.section}>
        <div style={s.sectionHeader}>
          <h3 style={s.sectionLabel}>OPEN ITEMS</h3>
        </div>
        <AnimatePresence>
          {notices.open.length > 0 ? (
            notices.open.map((n, i) => renderNotice(n, i, false))
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
          notices.closed.map((n, i) => renderNotice(n, i, true))
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
    overflowY: 'auto',
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
    margin: '0 0 24px',
  },
  statsRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '32px',
  },
  statBadgeOpen: {
    background: '#FEE2E2',
    color: '#EF4444',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: 600,
  },
  statBadgeClosed: {
    background: '#EAE6DB',
    color: '#666',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: 600,
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
    flexDirection: 'column',
    marginBottom: '12px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  cardTitleRow: {
    display: 'flex',
    alignItems: 'center',
  },
  noticeTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#111',
  },
  ayBadge: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#888',
    background: '#EAE6DB',
    padding: '4px 8px',
    borderRadius: '6px',
  },
  noticeDesc: {
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.5',
    margin: '0 0 16px 0',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid #EAE6DB',
  },
  footerText: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#888',
  },
  actionBtn: {
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
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
