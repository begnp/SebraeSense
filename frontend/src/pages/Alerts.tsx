import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Loader2, Info, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

interface ActiveAlert {
  id: number;
  customer_id: number;
  customer_name: string;
  company: string;
  reason: string;
  category?: string;
  created_at: string;
}

export function Alerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<ActiveAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = [
    'Todos',
    'Inatividade prolongada',
    'Erro em tarefa crítica',
    'Suporte sem resolução',
    'Queda de engajamento',
    'Eventos',
    'Cursos'
  ];

  const fetchActiveAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://sebraesense-api.onrender.com');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (err) {
      console.error('Erro ao buscar alertas ativos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveAlerts();
  }, []);

  const handleResolveAlert = async (alertId: number, status: 'resolved' | 'false_positive') => {
    try {
      const response = await fetch(`https://sebraesense-api.onrender.com/api/customers/alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        // Refresh alerts list
        fetchActiveAlerts();
      } else {
        alert('Erro ao atualizar status do alerta.');
      }
    } catch (err) {
      console.error('Erro ao atualizar alerta:', err);
    }
  };

  const categoryCounts = categories.reduce((acc, cat) => {
    if (cat === 'Todos') {
      acc[cat] = alerts.length;
    } else {
      acc[cat] = alerts.filter(a => a.category === cat).length;
    }
    return acc;
  }, {} as Record<string, number>);

  const filteredAlerts = selectedCategory === 'Todos'
    ? alerts
    : alerts.filter(a => a.category === selectedCategory);

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 font-sans">
        
        {/* Header section with refresh button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-[24px] p-6 border border-gray-100/50 shadow-[0_4px_24px_rgba(52,180,166,0.02)]">
          <div>
            <h2 className="text-xl font-extrabold text-[#0E1B2B]">Painel de Alertas Operacionais</h2>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Gerenciamento e tratativa de desvios comportamentais em tempo real</p>
          </div>
          <button 
            onClick={fetchActiveAlerts}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Atualizar</span>
          </button>
        </div>

        {/* Category filtering pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 flex-shrink-0 bg-white/40 p-2.5 rounded-2xl border border-gray-100/40">
          {categories.map((cat) => {
            const count = categoryCounts[cat] || 0;
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#0E1B2B] text-white border-[#0E1B2B] shadow-sm'
                    : 'bg-white text-gray-400 border-gray-200/50 hover:bg-gray-50 hover:text-gray-600'
                }`}
              >
                {cat} 
                <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-200/60 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Alerts Grid / List */}
        {loading ? (
          <div className="flex items-center justify-center py-24 bg-white rounded-[24px] border border-gray-100/50 shadow-sm">
            <Loader2 className="animate-spin text-[#6B4C9A]" size={48} />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-semibold text-sm bg-white rounded-[24px] border border-gray-100/50 shadow-sm flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
              <Info size={32} />
            </div>
            <div>
              <p className="text-gray-700 font-extrabold text-base">Tudo sob controle!</p>
              <p className="text-gray-400 text-xs mt-1">Nenhum alerta ativo encontrado na categoria selecionada.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAlerts.map((alert) => {
              const parts = alert.customer_name.split(' ');
              const initials = parts[0][0] + (parts[parts.length - 1][0] || '');
              
              return (
                <div 
                  key={alert.id} 
                  className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_4px_24px_rgba(52,180,166,0.01)] hover:shadow-[0_4px_24px_rgba(52,180,166,0.03)] transition-all flex flex-col justify-between gap-5 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500" />
                  
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-full bg-[#E5EFEA] text-[#0E1B2B] font-black flex items-center justify-center text-sm shadow-inner flex-shrink-0">
                      {initials.toUpperCase()}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-[#0E1B2B]">{alert.customer_name}</span>
                        <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2.5 py-0.5 rounded-full">{alert.company}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase bg-red-50 text-red-500 border border-red-100/50 px-2 py-0.5 rounded w-fit mt-0.5">
                        {alert.category || 'Queda de engajamento'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/30 flex items-start gap-3 flex-1">
                    <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-gray-650 font-semibold leading-relaxed">{alert.reason}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2 border-t border-gray-50">
                    <span className="text-[10px] text-gray-400 font-semibold">
                      {alert.created_at ? new Date(alert.created_at).toLocaleDateString('pt-BR') + ' às ' + new Date(alert.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Recente'}
                    </span>
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <button
                        onClick={() => handleResolveAlert(alert.id, 'resolved')}
                        className="flex-1 sm:flex-none px-3.5 py-2 bg-[#3CDAB6] hover:bg-[#2cb898] text-white text-[11px] font-black rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-sm shadow-green-100"
                      >
                        <CheckCircle2 size={13} />
                        <span>Resolvido</span>
                      </button>
                      <button
                        onClick={() => handleResolveAlert(alert.id, 'false_positive')}
                        className="flex-1 sm:flex-none px-3.5 py-2 bg-gray-400 hover:bg-gray-500 text-white text-[11px] font-black rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                      >
                        <span>Falso Positivo</span>
                      </button>
                      <button
                        onClick={() => navigate(`/clientes/${alert.customer_id}`)}
                        className="flex-1 sm:flex-none px-3.5 py-2 bg-[#0E1B2B] hover:bg-[#1c3552] text-white text-[11px] font-black rounded-xl transition-colors cursor-pointer text-center whitespace-nowrap"
                      >
                        Perfil →
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </MainLayout>
  );
}
