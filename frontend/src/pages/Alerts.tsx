import { useState, useEffect } from 'react';

import { MainLayout } from '../components/layout/MainLayout';
import { Loader2, Info, User } from 'lucide-react';

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

  const [alerts, setAlerts] = useState<ActiveAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ativos' | 'inativos'>('ativos');

  const fetchActiveAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/customers/alerts/active');
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/customers/alerts/${alertId}`, {
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

  return (
    <MainLayout>
      <div className="flex flex-col font-sans">
        
        {/* Header Title & Subtitle */}
        <div className="mb-6">
          <h2 className="text-[28px] font-extrabold text-[#0E1B2B] leading-none tracking-tight">Alertas</h2>
          <p className="text-[15px] font-semibold text-[#0E1B2B] mt-1.5">Alertas proativos de risco</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-4 font-extrabold text-sm">
          <button 
            onClick={() => setActiveTab('ativos')}
            className={`px-6 py-2 rounded-full cursor-pointer transition-colors ${
              activeTab === 'ativos' ? 'bg-[#8B6EBB] text-white' : 'text-[#0E1B2B] hover:bg-white/50'
            }`}
          >
            Ativos ({alerts.length})
          </button>
          <button 
            onClick={() => setActiveTab('inativos')}
            className={`px-6 py-2 rounded-full cursor-pointer transition-colors ${
              activeTab === 'inativos' ? 'bg-[#8B6EBB] text-white' : 'text-[#0E1B2B] hover:bg-white/50'
            }`}
          >
            Inativos (0)
          </button>
        </div>

        {/* Alerts List */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-[#6B4C9A]" size={48} />
          </div>
        ) : alerts.length === 0 && activeTab === 'ativos' ? (
          <div className="text-center py-20 text-gray-500 font-semibold text-sm bg-white rounded-[24px] border border-gray-100/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
              <Info size={32} />
            </div>
            <div>
              <p className="text-gray-700 font-extrabold text-base">Tudo sob controle!</p>
              <p className="text-gray-400 text-xs mt-1">Nenhum alerta ativo encontrado no momento.</p>
            </div>
          </div>
        ) : activeTab === 'inativos' ? (
          <div className="text-center py-20 text-gray-500 font-semibold text-sm bg-white rounded-[24px] border border-gray-100/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            Nenhum alerta inativo no momento.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className="bg-[#F4FBFA] rounded-[24px] p-6 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col gap-5"
              >
                {/* Top row: Avatar, Name, Risco, Circle, and Buttons */}
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-[50px] h-[50px] rounded-full bg-[#EAE5F3] text-[#8B6EBB] flex items-center justify-center flex-shrink-0">
                       <User size={26} strokeWidth={2} />
                    </div>
                    {/* Name and Company */}
                    <div className="flex flex-col">
                      <span className="font-extrabold text-[16px] text-[#0E1B2B] leading-tight">{alert.customer_name}</span>
                      <span className="text-[11px] font-semibold text-gray-500 mt-0.5">{alert.company}</span>
                    </div>
                    {/* RISCO pill */}
                    <div className="bg-[#FCD8D4] text-[#D34135] px-4 py-1 rounded-lg text-[11px] font-extrabold ml-2 uppercase tracking-wider">
                      Risco
                    </div>
                    {/* Red Circular Icon - approximating with an SVG */}
                    <div className="ml-1">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D34135" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" stroke="#e5e7eb" strokeWidth="2.5" />
                        <circle cx="12" cy="12" r="10" stroke="#D34135" strokeWidth="2.5" strokeDasharray="25 100" strokeDashoffset="25" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex gap-3">
                     <button
                       onClick={() => handleResolveAlert(alert.id, 'resolved')}
                       className="bg-[#3CDAB6] text-[#0E1B2B] font-extrabold text-xs px-6 py-2.5 rounded-lg hover:bg-[#2cb898] transition-colors cursor-pointer"
                     >
                       Resolver
                     </button>
                     <button
                       onClick={() => handleResolveAlert(alert.id, 'false_positive')}
                       className="bg-[#EAE5F3] text-[#0E1B2B] font-extrabold text-xs px-6 py-2.5 rounded-lg hover:bg-[#d8d0e5] transition-colors cursor-pointer"
                     >
                       Falso
                     </button>
                  </div>
                </div>

                {/* Reason summary */}
                <div className="mt-1 text-[13px] font-semibold text-[#0E1B2B]">
                  {alert.category || 'Inatividade de 30 dias detectada'}
                </div>

                <div className="h-px bg-gray-200/50 w-full" />

                {/* Full description */}
                <div className="text-[12px] font-semibold text-gray-600 leading-relaxed">
                  {alert.reason || 'Cliente não realiza login nem executa tarefas há 30 dias. Última sessão registrada em 08/03 com saída abrupta durante o cadastro da empresa.'}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </MainLayout>
  );
}
