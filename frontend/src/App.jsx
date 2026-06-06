import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import ClientSidebar from './components/ClientSidebar';
import MemoryAuditView from './components/MemoryAuditView';
import NoticePanel from './components/NoticePanel';
import ChatPanel from './components/ChatPanel';
import SplashScreen from './components/SplashScreen';
import { api } from './api/client';

export default function App() {
  const [clients, setClients]               = useState([]);
  const [selectedClient, setSelectedClient] = useState('abcri1234d');
  const [activeView, setActiveView]         = useState('audit');
  const [memoryEntries, setMemoryEntries]   = useState([]);
  const [showSplash, setShowSplash]         = useState(true);

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

  const loadMemory = async (clientId) => {
    try {
      const res = await api.getMemory(clientId);
      setMemoryEntries(res.entries || []);
    } catch {
      setMemoryEntries([]);
    }
  };

  useEffect(() => { loadMemory(selectedClient); }, [selectedClient]);

  const activeClientObj = clients.find(c => c.id === selectedClient);
  const clientName = activeClientObj ? activeClientObj.name : "Unknown Client";

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>
      <div style={s.shell}>
      {/* ── Left sidebar ───────────────────────────── */}
      <ClientSidebar
        clients={clients}
        selectedClient={selectedClient}
        onSelectClient={setSelectedClient}
        activeClientEntriesCount={memoryEntries.length}
      />

      {/* ── Main column ────────────────────────────── */}
      <div style={s.main}>
        {/* Content views */}
        <div style={s.views}>
          <div style={{ display: activeView === 'audit' ? 'flex' : 'none', flex: 1, overflow: 'hidden' }}>
            <MemoryAuditView
              clientId={selectedClient}
              clientName={clientName}
              memoryEntries={memoryEntries}
              setMemoryEntries={setMemoryEntries}
              activeView={activeView}
              setActiveView={setActiveView}
            />
            <NoticePanel clientId={selectedClient} clientName={clientName} />
          </div>

          <div style={{ display: activeView === 'chat' ? 'flex' : 'none', flex: 1, overflow: 'hidden' }}>
            <ChatPanel
              clientId={selectedClient}
              onUploadComplete={() => loadMemory(selectedClient)}
              activeView={activeView}
              setActiveView={setActiveView}
            />
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

const s = {
  shell: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    background: '#F4F2E9',
    fontFamily: "'Inter', -apple-system, sans-serif",
    overflow: 'hidden',
    color: '#111',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
    background: '#F4F2E9',
  },
  views: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
};
