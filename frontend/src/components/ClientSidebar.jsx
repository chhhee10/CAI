import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { api } from '../api/client';

const s = {
  root: {
    width: '280px',
    height: '100%',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    overflow: 'hidden',
  },
  header: {
    padding: '48px 32px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  logoText: {
    fontSize: '160px',
    fontWeight: 400, // Bebas Neue is naturally bold but doesn't have a 900 weight
    color: '#111',
    letterSpacing: '0.02em',
    lineHeight: 0.8,
    fontFamily: "'Bebas Neue', sans-serif",
    margin: 0,
    textTransform: 'uppercase',
  },
  logoUnderline: {
    width: '48px',
    height: '4px',
    background: '#FF5722',
    marginTop: '12px',
  },
  section: {
    flex: 1,
    overflowY: 'auto',
    minHeight: 0,
    padding: '0 32px',
    display: 'flex',
    flexDirection: 'column',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#888',
    marginBottom: '16px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  clientBtn: {
    width: '100%',
    padding: '0',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: "'Inter', sans-serif",
  },
  activeCard: {
    background: '#111',
    borderRadius: '12px',
    padding: '16px',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  inactiveText: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#111',
    padding: '8px 16px',
  },
  activeName: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '4px',
  },
  activeSub: {
    fontSize: '12px',
    color: '#888',
    marginBottom: '12px',
  },
  pillRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  orangePill: {
    background: '#FF5722',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 600,
    padding: '4px 8px',
    borderRadius: '6px',
  },
  greyText: {
    fontSize: '12px',
    color: '#888',
  },
  newClientBtn: {
    marginTop: '0',
    padding: '32px',
    background: 'transparent',
    border: 'none',
    color: '#FF5722',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: "'Inter', sans-serif",
  },
};

export default function ClientSidebar({ selectedClient, onSelectClient }) {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    async function fetchClients() {
      try {
        const data = await api.getClients();
        setClients(data);
      } catch (err) {
        console.error("Failed to fetch clients", err);
      }
    }
    fetchClients();
  }, []);

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.logoText}>CAI</h1>
        <div style={s.logoUnderline}></div>
      </div>

      <div style={s.section}>
        <div style={s.sectionLabel}>CLIENTS</div>

        <div style={s.list}>
          {clients.map((client) => {
            const isActive = selectedClient === client.id;
            
            return (
              <button
                key={client.id}
                onClick={() => onSelectClient(client.id)}
                style={s.clientBtn}
              >
                {isActive ? (
                  <motion.div layoutId="activeClient" style={s.activeCard}>
                    <div style={s.activeName}>{client.name}</div>
                    <div style={s.activeSub}>{client.pan}</div>
                    <div style={s.pillRow}>
                      <span style={s.orangePill}>{client.entries} entries</span>
                      <span style={s.greyText}>{client.years} yrs</span>
                    </div>
                  </motion.div>
                ) : (
                  <div style={s.inactiveText}>{client.name}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <button style={s.newClientBtn} onClick={() => onSelectClient('newclient000')}>
        <span>+</span> New client
      </button>
    </div>
  );
}
