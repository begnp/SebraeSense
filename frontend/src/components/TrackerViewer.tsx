import React, { useEffect, useState } from 'react';
import { Terminal, X } from 'lucide-react';

interface Log {
  id: number;
  message: string;
  type: 'info' | 'warn' | 'error';
  time: string;
}

export const TrackerViewer = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleLog = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newLog: Log = {
        id: Date.now() + Math.random(),
        message: customEvent.detail.message,
        type: customEvent.detail.type,
        time: new Date().toLocaleTimeString()
      };
      setLogs(prev => [newLog, ...prev].slice(0, 5)); // Mantém os últimos 5 logs
      setIsVisible(true);
    };

    window.addEventListener('tracker-event', handleLog);
    return () => window.removeEventListener('tracker-event', handleLog);
  }, []);

  if (logs.length === 0 || !isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 bg-[#1A2530] rounded-lg shadow-2xl border border-gray-700 overflow-hidden font-mono text-sm animate-in slide-in-from-bottom-4">
      <div className="bg-[#111827] px-4 py-3 flex items-center justify-between border-b border-gray-700 text-gray-300">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-[#34B4A6]" />
          <span className="font-semibold text-white">Console do Rastreador</span>
        </div>
        <button onClick={() => setIsVisible(false)} className="hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>
      <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
        {logs.map(log => (
          <div key={log.id} className={`p-2.5 rounded bg-[#1f2937] break-words shadow-sm ${
            log.type === 'warn' ? 'text-yellow-400 border-l-4 border-yellow-400' :
            log.type === 'error' ? 'text-red-400 border-l-4 border-red-400' :
            'text-[#34B4A6] border-l-4 border-[#34B4A6]'
          }`}>
            <div className="text-gray-500 text-xs mb-1">[{log.time}]</div>
            {log.message}
          </div>
        ))}
      </div>
    </div>
  );
};
