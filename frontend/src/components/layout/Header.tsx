import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, PanelLeft, AlertTriangle } from 'lucide-react';

interface ActiveAlert {
  id: number;
  customer_id: number;
  customer_name: string;
  company: string;
  reason: string;
  category?: string;
  created_at: string;
}

export const Header = ({ onToggleSidebar }: { onToggleSidebar: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [alerts, setAlerts] = useState<ActiveAlert[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fetchActiveAlerts = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (err) {
      console.error('Erro ao buscar alertas ativos no header:', err);
    }
  };

  useEffect(() => {
    fetchActiveAlerts();
    const interval = setInterval(fetchActiveAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const isAlertsPage = location.pathname === '/alertas';

  const formatTime = (isoString: string) => {
    if (!isoString) return 'Agora';
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <header className="h-16 px-6 flex items-center justify-between sticky top-0 z-30 bg-white border-b border-gray-200/80 shadow-sm">
      {/* Search Bar container with panel toggle */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="text-[#0E1B2B] hover:text-[#3CDAB6] p-2 hover:bg-gray-100 active:bg-gray-200/50 rounded-lg transition-colors cursor-pointer"
        >
          <PanelLeft size={20} />
        </button>
        <div className="relative w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar cliente, empresa..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-[#F0F4F2] text-gray-900 placeholder-gray-455 focus:outline-none focus:bg-white focus:border-[#3CDAB6] focus:ring-1 focus:ring-[#3CDAB6]/20 sm:text-sm transition-all"
          />
        </div>
      </div>

      <div className="flex items-center relative">
        {!isAlertsPage && (
          <>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="relative p-2 text-[#0E1B2B] hover:text-[#3CDAB6] transition-colors cursor-pointer"
            >
              <Bell size={24} />
              {alerts.length > 0 && (
                <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-[#6B4C9A] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white animate-pulse">
                  {alerts.length}
                </span>
              )}
            </button>

            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setDropdownOpen(false)}
                />
                
                <div className="absolute right-0 top-11 w-80 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col gap-3 font-sans">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-[11px] font-black text-[#0E1B2B] uppercase tracking-wider">Alertas Recentes</span>
                    <span className="text-[10px] font-bold text-gray-400">{alerts.length} ativos</span>
                  </div>

                  {alerts.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-400 font-semibold italic">
                      Nenhum alerta pendente
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
                      {alerts.slice(0, 4).map((a) => (
                        <div 
                          key={a.id}
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate(`/clientes/${a.customer_id}`);
                          }}
                          className="bg-gray-50 hover:bg-gray-100/70 border border-gray-100 p-2.5 rounded-xl flex items-start gap-2.5 cursor-pointer transition-all"
                        >
                          <div className="w-7 h-7 rounded-full bg-red-100 text-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <AlertTriangle size={14} />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                            <div className="flex justify-between items-baseline gap-2">
                              <span className="text-[11px] font-extrabold text-[#0E1B2B] truncate">{a.customer_name}</span>
                              <span className="text-[9px] text-gray-400 font-bold whitespace-nowrap">{formatTime(a.created_at)}</span>
                            </div>
                            <span className="text-[9px] text-gray-450 font-semibold leading-none truncate">{a.company}</span>
                            <p className="text-[10px] text-gray-650 font-semibold leading-normal truncate mt-1">{a.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/alertas');
                    }}
                    className="w-full py-2 mt-1 bg-[#0E1B2B] hover:bg-[#152a42] text-white text-[10px] font-extrabold rounded-lg transition-colors text-center cursor-pointer"
                  >
                    Ver todos os alertas →
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </header>
  );
};
