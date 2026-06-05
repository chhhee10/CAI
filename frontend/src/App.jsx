import React, { useState, useEffect } from 'react';
import ClientSidebar from './components/ClientSidebar';
import MemoryAuditView from './components/MemoryAuditView';
import NoticePanel from './components/NoticePanel';
import ChatPanel from './components/ChatPanel';
import { api } from './api/client';
import { Activity, Bell, MessageSquare, LayoutDashboard } from 'lucide-react';

export default function App() {
  const [selectedClient, setSelectedClient] = useState('abcri1234d');
  const [activeView, setActiveView] = useState('audit'); // 'audit', 'chat'
  const [memoryEntries, setMemoryEntries] = useState([]);

  const loadMemory = async (clientId) => {
    try {
      const res = await api.getMemory(clientId);
      setMemoryEntries(res.entries || []);
    } catch (e) {
      console.error(e);
      setMemoryEntries([]);
    }
  };

  useEffect(() => {
    loadMemory(selectedClient);
  }, [selectedClient]);

  const handleUploadComplete = () => {
    // Reload memory after document upload
    loadMemory(selectedClient);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <ClientSidebar 
        selectedClient={selectedClient} 
        onSelectClient={setSelectedClient}
        activeClientEntriesCount={memoryEntries.length}
      />
      
      <div className="flex-1 flex flex-col h-full relative">
        {/* Top Navigation */}
        <div className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex items-center px-6 gap-6">
          <button 
            onClick={() => setActiveView('audit')}
            className={`flex items-center gap-2 h-full px-2 border-b-2 transition-colors ${
              activeView === 'audit' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DatabaseIcon size={18} />
            Memory Audit
          </button>
          <button 
            onClick={() => setActiveView('chat')}
            className={`flex items-center gap-2 h-full px-2 border-b-2 transition-colors ${
              activeView === 'chat' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare size={18} />
            Advisory Agent
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Audit View */}
          <div className={`flex-1 flex overflow-hidden ${activeView === 'audit' ? 'flex' : 'hidden'}`}>
            <MemoryAuditView 
              clientId={selectedClient} 
              memoryEntries={memoryEntries} 
              setMemoryEntries={setMemoryEntries} 
            />
            <div className="w-96 hidden lg:block border-l border-slate-800">
              <NoticePanel clientId={selectedClient} />
            </div>
          </div>

          {/* Chat View */}
          <div className={`flex-1 flex overflow-hidden ${activeView === 'chat' ? 'flex' : 'hidden'}`}>
            <ChatPanel clientId={selectedClient} onUploadComplete={handleUploadComplete} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DatabaseIcon({ size }) {
  return <LayoutDashboard size={size} />;
}
