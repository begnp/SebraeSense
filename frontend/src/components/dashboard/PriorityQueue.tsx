import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Eye, List, ShieldCheck } from 'lucide-react';

export interface QueueUser {
  id: number | string;
  name: string;
  company: string;
  reason: string;
  date: string;
  scheme: 'red' | 'yellow' | 'green' | string;
}

interface PriorityQueueProps {
  users?: QueueUser[];
}

export const PriorityQueue: React.FC<PriorityQueueProps> = ({ users }) => {
  const navigate = useNavigate();

  // Precise mock data matching the screenshot as fallback
  const fallbackQueueData: QueueUser[] = [
    {
      id: 2,
      name: 'Maria Silva',
      company: 'Padaria Estrela',
      reason: 'Inatividade de 30 dias + Atividade abandonada',
      date: '7 de abril',
      scheme: 'red'
    },
    {
      id: 1,
      name: 'Ricardo Mendes',
      company: 'RM Transportes',
      reason: 'Inatividade de 30 dias',
      date: '3 de abril',
      scheme: 'red'
    },
    {
      id: 3,
      name: 'João Santos',
      company: 'Tech Norte LTDA',
      reason: '3 erros consecutivos no cadastro',
      date: '6 de abril',
      scheme: 'yellow'
    },
    {
      id: 4,
      name: 'Ana Costa',
      company: 'Doces da Ana',
      reason: 'Abandono em tarefa crítica',
      date: '4 de abril',
      scheme: 'yellow'
    },
    {
      id: 5,
      name: 'Ana Costa',
      company: 'Doces da Ana',
      reason: 'Retorno pós consultoria',
      date: '4 de abril',
      scheme: 'green'
    }
  ];

  const queueData = (users && users.length > 0) ? users : fallbackQueueData;

  const getSchemeStyles = (scheme: string) => {
    switch (scheme) {
      case 'red':
        return {
          iconBg: 'bg-[#FEE2E2] text-[#DC2626]',
          icon: <AlertTriangle size={18} />
        };
      case 'green':
        return {
          iconBg: 'bg-[#D1FAE5] text-[#059669]',
          icon: <ShieldCheck size={18} />
        };
      case 'yellow':
      default:
        return {
          iconBg: 'bg-[#FEF3C7] text-[#D97706]',
          icon: <Eye size={18} />
        };
    }
  };

  return (
    <div className="bg-[#F4FBFA] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col h-full relative">
      <div className="flex items-center gap-2 mb-6">
        <List size={22} className="text-[#0E1B2B]" />
        <div>
          <h2 className="text-xl font-extrabold text-[#0E1B2B]">Fila Priorizada</h2>
          <p className="text-xs font-semibold text-gray-500 mt-1">Por ordem de atendimento</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {queueData.map((user, index) => {
          const styles = getSchemeStyles(user.scheme);
          return (
            <div 
              key={index} 
              onClick={() => navigate(`/clientes/${user.id}`)}
              className="bg-[#E4F8F4] px-4 py-3 rounded-2xl flex gap-3 border border-transparent hover:border-gray-200 transition-all cursor-pointer shadow-sm"
            >
              {/* Icon Circle */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${styles.iconBg}`}>
                {styles.icon}
              </div>

              {/* Text Area */}
              <div className="flex-1 min-w-0 flex flex-col">
                <h3 className="text-sm font-bold text-[#0E1B2B] truncate">{user.name}</h3>
                <span className="text-[10px] font-semibold text-gray-500">{user.company}</span>
                <p className="text-[11px] text-[#0E1B2B] font-medium mt-1 leading-tight pr-4">{user.reason}</p>
                
                {/* Timestamp */}
                <span className="text-[9px] font-semibold text-gray-500 self-end mt-1 flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  {user.date}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 flex justify-end">
        <button 
          onClick={() => navigate('/fila-priorizada')}
          className="py-1.5 px-4 bg-white hover:bg-gray-50 text-[#0E1B2B] border border-gray-200 text-xs font-bold rounded-full transition-colors cursor-pointer text-center shadow-sm flex items-center gap-1"
        >
          Ver todos <span className="text-sm font-light leading-none">→</span>
        </button>
      </div>
    </div>
  );
};
