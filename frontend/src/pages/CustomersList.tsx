import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Search, Loader2, User, Building, AlertTriangle, RefreshCw } from 'lucide-react';

interface CustomerSummary {
  id: number;
  name: string;
  company: string;
  current_chs: number;
  status: string;
  alerts_count: number;
}

export function CustomersList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://sebraesense-api.onrender.com/api/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error('Erro ao buscar lista de clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 font-sans">
        
        {/* Header section with search bar and refresh */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white rounded-[24px] p-6 border border-gray-100/50 shadow-[0_4px_24px_rgba(52,180,166,0.02)]">
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-[#0E1B2B]">Diretório de Clientes</h2>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Visão geral do índice de saúde e alertas de toda a base monitorada</p>
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
              onClick={fetchCustomers}
              disabled={loading}
              className="flex items-center justify-center p-2.5 bg-gray-100 hover:bg-gray-250 text-gray-650 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="Atualizar"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Directory Grid */}
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
              <p className="text-gray-700 font-extrabold text-base">Nenhum cliente encontrado</p>
              <p className="text-gray-400 text-xs mt-1">Nenhum registro corresponde aos critérios de pesquisa informados.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCustomers.map((c) => {
              const parts = c.name.split(' ');
              const initials = parts[0][0] + (parts[parts.length - 1][0] || '');
              
              // Color schemes based on CHS value
              let colorScheme = {
                bg: 'bg-green-50 text-green-700 border-green-200/50',
                chsBg: 'bg-green-500 text-white',
                dot: 'bg-green-500',
                border: 'border-green-100'
              };
              
              if (c.current_chs <= 40) {
                colorScheme = {
                  bg: 'bg-red-50 text-red-700 border-red-200/50',
                  chsBg: 'bg-red-500 text-white',
                  dot: 'bg-red-500',
                  border: 'border-red-100'
                };
              } else if (c.current_chs <= 70) {
                colorScheme = {
                  bg: 'bg-yellow-50 text-yellow-800 border-yellow-200/50',
                  chsBg: 'bg-yellow-500 text-[#0E1B2B]',
                  dot: 'bg-yellow-500',
                  border: 'border-yellow-100'
                };
              }

              return (
                <div 
                  key={c.id} 
                  className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-[0_4px_24px_rgba(52,180,166,0.01)] hover:shadow-[0_4px_24px_rgba(52,180,166,0.04)] transition-all flex flex-col justify-between gap-5 relative overflow-hidden"
                >
                  {/* Top Header Card */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-sm flex-shrink-0 border border-gray-200/30">
                      {initials.toUpperCase()}
                    </div>
                    
                    {/* Health Score Badge */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">CHS Score</span>
                      <div className={`px-3 py-1 text-xs font-black rounded-lg ${colorScheme.chsBg}`}>
                        {c.current_chs}
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-col gap-2 min-w-0 flex-1">
                    <h3 className="font-extrabold text-base text-[#0E1B2B] truncate">{c.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold truncate">
                      <Building size={14} className="text-[#3CDAB6] flex-shrink-0" />
                      <span className="truncate">{c.company}</span>
                    </div>
                  </div>

                  {/* Badges footer */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider flex items-center gap-1 ${colorScheme.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${colorScheme.dot}`} />
                      {c.status}
                    </span>
                    
                    {c.alerts_count > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-red-50 text-red-500 border border-red-150 uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle size={10} />
                        {c.alerts_count} {c.alerts_count === 1 ? 'alerta' : 'alertas'}
                      </span>
                    )}
                  </div>

                  {/* Action Link Footer */}
                  <button
                    onClick={() => navigate(`/clientes/${c.id}`)}
                    className="w-full py-2.5 bg-[#E5EFEA] hover:bg-[#d8e7e1] text-[#0E1B2B] text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
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
