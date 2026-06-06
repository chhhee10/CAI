import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, AlertCircle } from 'lucide-react';

export default function MemoryCard({ memory, onDelete, clientName }) {
  const valObj     = typeof memory.value === 'string' ? JSON.parse(memory.value) : memory.value;
  const isVerified = valObj?.verified === "form16";
  const confidence = valObj?.confidence || (isVerified ? 95 : 72);
  const isStale    = memory.key.includes("ay2122") || memory.key.includes("ay2223");
  const isHighConf = confidence > 90;

  // Attempt to extract the raw client ID string (e.g. abcri1234d) from the memory key
  const clientIdRaw = memory.key.split(':')[1] || '';
  
  // Create a regex to match "Client [ID]" case-insensitively to replace with the actual name
  const replaceClientRegex = new RegExp(`Client\\s+${clientIdRaw}`, 'gi');
  
  // Helper to format values for display
  const formatValue = (v) => {
    let str = typeof v === 'object' ? JSON.stringify(v) : String(v);
    if (clientIdRaw && clientName) {
      str = str.replace(replaceClientRegex, clientName);
    }
    return str;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={s.card}
    >
      {/* Key */}
      <div style={s.topRow}>
        <span style={s.keyChip}>{memory.key}</span>
      </div>

      {/* Fields */}
      <div style={s.fields}>
        {typeof valObj === 'object' && valObj !== null
          ? Object.entries(valObj)
              .filter(([k]) => k !== 'confidence')
              .map(([k, v]) => (
              <div key={k} style={s.field}>
                <div style={s.fieldKey}>{k.replace(/_/g, ' ')}</div>
                <div style={s.fieldVal}>
                  {formatValue(v)}
                </div>
              </div>
            ))
          : (
            <div style={s.field}>
              <div style={s.fieldVal}>{formatValue(valObj)}</div>
            </div>
          )
        }
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <div style={s.confRow}>
          <div style={s.confTrack}>
            <div style={{
              ...s.confFill,
              width: `${confidence}%`,
              background: isHighConf ? '#16a34a' : '#f59e0b',
            }} />
          </div>
          <span style={{ ...s.confPct, color: isHighConf ? '#16a34a' : '#f59e0b' }}>
            {confidence}%
          </span>
        </div>

        {isStale && (
          <span style={s.staleBadge}>
            <AlertCircle size={9} color="#f59e0b" />
            Stale
          </span>
        )}
      </div>
    </motion.div>
  );
}

const s = {
  card: {
    background: '#fff',
    border: '1px solid #E5E5E5',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
  },
  topRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
  },
  keyChip: {
    fontSize: '11px',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    color: '#000',
    background: '#FDFBF4',
    padding: '6px 12px',
    borderRadius: '99px',
    border: '1px solid #E5E5E5',
    wordBreak: 'break-all',
    flex: 1,
    lineHeight: 1.4,
  },
  deleteBtn: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fff',
    border: '1px solid #E5E5E5',
    borderRadius: '8px',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background 0.15s',
    color: '#000',
  },
  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  fieldKey: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  fieldVal: {
    fontSize: '14px',
    fontWeight: 400,
    color: '#000',
    wordBreak: 'break-word',
    lineHeight: 1.5,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '16px',
    borderTop: '1px solid #E5E5E5',
    marginTop: 'auto',
  },
  confRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  confTrack: {
    width: '80px',
    height: '4px',
    background: '#E5E5E5',
    borderRadius: '99px',
    overflow: 'hidden',
  },
  confFill: {
    height: '100%',
    borderRadius: '99px',
    transition: 'width 0.4s ease',
  },
  confPct: {
    fontSize: '12px',
    fontWeight: 600,
  },
  staleBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: 500,
    color: '#000',
    background: '#FDFBF4',
    border: '1px solid #E5E5E5',
    padding: '4px 10px',
    borderRadius: '99px',
  },
};
