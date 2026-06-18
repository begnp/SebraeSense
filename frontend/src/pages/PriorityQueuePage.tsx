import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Search, Loader2, User, Building, AlertTriangle, RefreshCw, Clock } from 'lucide-react';

interface PrioritizedCustomer {
  id: number;
  name: string;
  company: string;
  current_chs: number;
  status: string;
  alerts_count: number;
  last_contact_str: string;
  priority_group: number;
}

export function PriorityQueuePage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<PrioritizedCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPrioritizedCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://sebraesense-api.onrender.com/api/customers/prioritized');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error('Erro ao buscar fila priorizada:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrioritizedCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 font-sans">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white rounded-[24px] p-6 border border-gray-100/50 shadow-[0_4px_24px_rgba(52,180,166,0.02)]">
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-[#0E1B2B]">Fila Priorizada de Atendimento</h2>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Ordenação automática por gravidade de CHS, alertas ativos e recência de contato</p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar por cliente ou empresa..."
                className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-450 focus:outline-none focus:bg-white focus:border-[#3CDAB6] focus:ring-1 focus:ring-[#3CDAB6]/20 text-xs font-semibold transition-all"
              />
            </div>
            
            <button 
              onClick={fetchPrioritizedCustomers}
              disabled={loading}
              className="flex items-center justify-center p-2.5 bg-gray-100 hover:bg-gray-250 text-gray-650 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="Atualizar"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Priority List Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24 bg-white rounded-[24px] border border-gray-100/50 shadow-sm">
            <Loader2 className="animate-spin text-[#6B4C9A]" size={48} />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-semibold text-sm bg-white rounded-[24px] border border-gray-100/50 shadow-sm flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
              <User size={32} />
            </div>
            <div>
              <p className="text-gray-700 font-extrabold text-base">Fila vazia ou nenhum cliente filtrado</p>
              <p className="text-gray-400 text-xs mt-1">Todos os clientes monitorados estão saudáveis e sem pendências no momento.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCustomers.map((c, index) => {
              const parts = c.name.split(' ');
              const initials = parts[0][0] + (parts[parts.length - 1][0] || '');
              
              // Color schemes based on priority group
              let colorScheme = {
                bg: 'bg-green-50 text-green-700 border-green-200/50',
                border: 'border-l-green-500 shadow-[inset_4px_0_0_0_#22c55e]',
                badge: 'bg-green-100 text-green-700'
              };
              
              if (c.priority_group === 1) {
                colorScheme = {
                  bg: 'bg-red-50 text-red-700 border-red-200/50',
                  border: 'border-l-red-500 shadow-[inset_4px_0_0_0_#ef4444]',
                  badge: 'bg-red-100 text-red-700'
                };
              } else if (c.priority_group === 2) {
                colorScheme = {
                  bg: 'bg-yellow-50 text-yellow-800 border-yellow-250/50',
                  border: 'border-l-yellow-500 shadow-[inset_4px_0_0_0_#eab308]',
                  badge: 'bg-yellow-100 text-yellow-850'
                };
              }

              return (
                <div 
                  key={c.id} 
                  className={`bg-white rounded-[24px] p-5 border border-gray-100 border-l-4 hover:border-gray-200 transition-all flex flex-col justify-between gap-4 shadow-[0_4px_16px_rgba(0,0,0,0.01)] hover:shadow-md ${colorScheme.border}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    {/* Priority rank indicator */}
                    <span className={`px-2.5 py-1 text-xs font-black rounded-lg ${colorScheme.badge}`}>
                      #{index + 1} na Fila
                    </span>

                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">CHS Score</span>
                      <span className={`text-xs font-black ${c.priority_group === 1 ? 'text-red-500' : c.priority_group === 2 ? 'text-yellow-600' : 'text-green-500'}`}>
                        {c.current_chs}
                      </span>
                    </div>
                  </div>

                  {/* Customer details */}
                  <div className="flex gap-4 items-center flex-1">
                    <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200/50 flex items-center justify-center font-bold text-xs text-gray-600 flex-shrink-0">
                      {initials.toUpperCase()}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <h3 className="font-extrabold text-sm text-[#0E1B2B] truncate">{c.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold truncate">
                        <Building size={12} className="text-[#3CDAB6] flex-shrink-0" />
                        <span className="truncate">{c.company}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges and last interaction date */}
                  <div className="flex flex-wrap justify-between items-center gap-3 border-t border-gray-50 pt-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${colorScheme.bg}`}>
                        {c.status}
                      </span>
                      {c.alerts_count > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-red-50 text-red-500 border border-red-150 uppercase tracking-wider flex items-center gap-1">
                          <AlertTriangle size={10} />
                          {c.alerts_count}
                        </span>
                      )}
                    </div>
                    
                    <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                      <Clock size={11} className="text-gray-300" />
                      {c.last_contact_str}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/clientes/${c.id}`)}
                    className="w-full py-2 bg-[#E5EFEA] hover:bg-[#d8e7e1] text-[#0E1B2B] text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                  >
                    Acessar Perfil →
                  </button>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </MainLayout>
  );
}
