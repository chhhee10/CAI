import React, { useState } from 'react';
import MemoryCard from './MemoryCard';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Sparkles, Box, Activity, ShieldAlert, Clock } from 'lucide-react';

const TABS = ["All", "Tax History", "Deductions", "Income", "Preferences", "Notices"];

export default function MemoryAuditView({ clientId, clientName, memoryEntries, setMemoryEntries, activeView, setActiveView }) {
  const [activeTab, setActiveTab] = useState("All");

  const handleDelete = async (key) => {
    await api.deleteMemory(key);
    setMemoryEntries(prev => prev.filter(e => e.key !== key));
  };

  const filteredEntries = memoryEntries.filter(entry => {
    if (activeTab === "All") return true;
    return entry.key.includes(activeTab.toLowerCase().replace(" ", "_"));
  }).sort((a, b) => {
    const aSort = a.ay_sort || 0;
    const bSort = b.ay_sort || 0;
    return bSort - aSort;
  });

  const groupedEntries = {};
  filteredEntries.forEach(entry => {
    const ayGroup = entry.ay && entry.ay !== "—" ? `AY ${entry.ay}` : 'General / Ongoing';
    if (!groupedEntries[ayGroup]) groupedEntries[ayGroup] = [];
    groupedEntries[ayGroup].push(entry);
  });

  const groupKeys = Object.keys(groupedEntries).sort((a, b) => {
    if (a === 'General / Ongoing') return 1;
    if (b === 'General / Ongoing') return -1;
    return b.localeCompare(a);
  });

  // Dynamically calculate stats
  const totalEntries = memoryEntries.length;
  let totalConfidence = 0;
  let staleCount = 0;

  memoryEntries.forEach(entry => {
    const valObj = typeof entry.value === 'string' ? JSON.parse(entry.value) : entry.value;
    const isVerified = valObj?.verified === "form16";
    const conf = valObj?.confidence || (isVerified ? 95 : 72);
    totalConfidence += conf;
    
    if (entry.key.includes("ay2122") || entry.key.includes("ay2223")) {
      staleCount++;
    }
  });

  const avgConfidence = totalEntries > 0 ? Math.round(totalConfidence / totalEntries) : 0;
  const staleText = staleCount === 0 ? "All fresh" : `${staleCount} need review`;

  return (
    <div style={s.root}>
      {/* Top Nav */}
      <div style={s.topNav}>
        <div style={s.navGroup}>
          <button
            style={{
              ...s.navBtn,
              background: activeView === 'audit' ? '#FF5722' : '#fff',
              color: activeView === 'audit' ? '#fff' : '#111',
              border: '1px solid #E5E5E5',
            }}
            onClick={() => setActiveView('audit')}
          >
            <Database size={16} /> Memory Audit
          </button>
          <button
            style={{
              ...s.navBtn,
              background: activeView === 'chat' ? '#FF5722' : '#fff',
              color: activeView === 'chat' ? '#fff' : '#111',
              border: '1px solid #E5E5E5',
            }}
            onClick={() => setActiveView('chat')}
          >
            <Sparkles size={16} /> Advisory Agent
          </button>
        </div>
      </div>

      {/* Page Header */}
      <div style={s.pageHeader}>
        <h2 style={s.heading}>Memory Audit</h2>
        <p style={s.subheading}>
          Direct access to the Vectorize Hindsight memory bank for this client.
        </p>
      </div>

      {/* Stat Cards Row */}
      <div style={s.statRow}>
        <div style={s.statCardVertical}>
          <div style={s.statLabelVertical}>MEMORY<br />ENTRIES</div>
          <div style={s.statValueHugeBlack}>{totalEntries}</div>
          <div style={s.statFooterText}>indexed<br />docs</div>
        </div>
        <div style={s.statCardVertical}>
          <div style={s.statLabelVertical}>AVG<br />CONFIDENCE</div>
          <div style={s.statValueHugeOrange}>{avgConfidence}%</div>
          <div style={s.progressBarContainer}>
            <div style={{...s.progressBarFill, width: `${avgConfidence}%`}}></div>
          </div>
        </div>
        <div style={s.statCardVertical}>
          <div style={s.statLabelVertical}>STALE<br />ENTRIES</div>
          <div style={s.statValueHugeBlack}>{staleCount}</div>
          <div style={s.statFooterText}>{staleText}</div>
        </div>
      </div>

      {/* Tab Pills */}
      <div style={s.tabRow}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...s.tabLight,
              background: activeTab === tab ? '#111' : '#fff',
              color: activeTab === tab ? '#fff' : '#111',
              border: '1px solid #E5E5E5',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={s.contentArea}>
        {filteredEntries.length > 0 ? (
          <div style={s.groupedArea}>
            {groupKeys.map(group => (
              <div key={group} style={s.ayGroupSection}>
                <h3 style={s.ayGroupHeader}>{group}</h3>
                <div style={s.cardsGrid}>
                  <AnimatePresence>
                    {groupedEntries[group].map((entry) => (
                      <MemoryCard key={entry.key} memory={entry} onDelete={handleDelete} clientName={clientName} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={s.emptyStateBox}>
            <div style={s.emptyIcon}>
              <Box size={24} color="#888" />
            </div>
            <h3 style={s.emptyTitle}>Nothing here yet</h3>
            <p style={s.emptyText}>Upload files and Hindsight will start<br />building memory for this client.</p>
          </div>
        )}
      </div>

    </div>
  );
}

const s = {
  root: {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    padding: '32px 32px 0',
    minWidth: 0,
  },
  topNav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '48px',
  },
  navGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navBtn: {
    padding: '12px 24px',
    borderRadius: '99px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '-0.01em',
    transition: 'all 0.15s',
    fontFamily: "'Inter', sans-serif",
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    background: '#fff',
    border: '1px solid #E5E5E5',
    borderRadius: '99px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#0D9488',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#0D9488',
  },
  pageHeader: {
    marginBottom: '32px',
    flexShrink: 0,
  },
  heading: {
    fontSize: '72px',
    fontWeight: 400,
    color: '#111',
    margin: '0 0 12px',
    fontFamily: "'Bebas Neue', sans-serif",
    letterSpacing: '0.02em',
    lineHeight: 1,
    textTransform: 'uppercase',
  },
  subheading: {
    fontSize: '16px',
    color: '#888',
    margin: 0,
    fontFamily: "'Inter', sans-serif",
  },
  statRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '32px',
    flexShrink: 0,
  },
  statCardVertical: {
    background: '#fff',
    borderRadius: '16px',
    padding: '16px 20px',
    width: '160px',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #E5E5E5',
    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
    flexShrink: 0,
  },
  statLabelVertical: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '16px',
    lineHeight: 1.4,
  },
  statValueHugeBlack: {
    fontSize: '64px',
    fontWeight: 400,
    color: '#111',
    lineHeight: 1,
    fontFamily: "'Bebas Neue', sans-serif",
    letterSpacing: '0.02em',
  },
  statValueHugeOrange: {
    fontSize: '64px',
    fontWeight: 400,
    color: '#FF5722',
    lineHeight: 1,
    fontFamily: "'Bebas Neue', sans-serif",
    letterSpacing: '0.02em',
  },
  statFooterText: {
    fontSize: '12px',
    color: '#888',
    marginTop: '12px',
    lineHeight: 1.4,
  },
  progressBarContainer: {
    width: '100%',
    height: '4px',
    background: '#E5E5E5',
    marginTop: '12px',
    borderRadius: '2px',
  },
  progressBarFill: {
    height: '100%',
    background: '#FF5722',
    borderRadius: '2px',
    transition: 'width 0.4s ease',
  },
  tabLight: {
    padding: '10px 20px',
    borderRadius: '99px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.15s',
  },
  tabRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    flexWrap: 'wrap',
    flexShrink: 0,
  },
  tab: {
    padding: '10px 20px',
    borderRadius: '99px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.15s',
  },
  contentArea: {
    paddingBottom: '32px',
  },
  groupedArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  ayGroupSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  ayGroupHeader: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: 0,
    paddingBottom: '8px',
    borderBottom: '1px solid #E5E5E5',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
    alignItems: 'start',
  },
  emptyStateBox: {
    background: '#fff',
    borderRadius: '24px',
    padding: '64px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
  },
  emptyIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: '#F4F2E9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: 900,
    color: '#111',
    margin: '0 0 12px',
    fontFamily: "'Arial Black', system-ui, sans-serif",
    letterSpacing: '-0.02em',
  },
  emptyText: {
    fontSize: '15px',
    color: '#888',
    margin: 0,
    lineHeight: 1.5,
  },
};
