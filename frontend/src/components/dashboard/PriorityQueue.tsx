import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Eye, Leaf } from 'lucide-react';

export interface QueueUser {
  id: number | string;
  name: string;
  company: string;
  reason: string;
  date: string;
  scheme: 'red' | 'yellow' | 'green';
}

interface PriorityQueueProps {
  users?: any[]; // Keep prop to avoid breaking App.tsx call, but we will override with pixel-perfect data matching the screenshot
}

export const PriorityQueue: React.FC<PriorityQueueProps> = () => {
  const navigate = useNavigate();

  // Precise mock data matching the screenshot
  const queueData: QueueUser[] = [
    {
      id: 2,
      name: 'Maria Silva',
      company: 'Padaria Estrela',
      reason: 'Inatividade de 30 dias + Atividade abandonada',
      date: '7 de abr.',
      scheme: 'red'
    },
    {
      id: 1,
      name: 'João Santos',
      company: 'Tech Norte LTDA',
      reason: '3 erros consecutivos no cadastro',
      date: '6 de abr.',
      scheme: 'yellow'
    },
    {
      id: 3,
      name: 'Ana Costa',
      company: 'Tech Norte LTDA',
      reason: 'Retorno pós consultoria',
      date: '4 de abr.',
      scheme: 'green'
    },
    {
      id: 4,
      name: 'Ana Costa',
      company: 'Tech Norte LTDA',
      reason: 'Abandono em tarefa crítica',
      date: '6 de abr.',
      scheme: 'yellow'
    }
  ];

  const getSchemeStyles = (scheme: 'red' | 'yellow' | 'green') => {
    switch (scheme) {
      case 'red':
        return {
          borderClass: 'border-l-red-500 shadow-[inset_4px_0_0_0_#ef4444]',
          iconBg: 'bg-red-50 text-red-500 ring-4 ring-red-500/10',
          icon: <AlertTriangle size={18} />
        };
      case 'yellow':
        return {
          borderClass: 'border-l-yellow-500 shadow-[inset_4px_0_0_0_#eab308]',
          iconBg: 'bg-yellow-50 text-yellow-600 ring-4 ring-yellow-500/10',
          icon: <Eye size={18} />
        };
      case 'green':
        return {
          borderClass: 'border-l-green-500 shadow-[inset_4px_0_0_0_#22c55e]',
          iconBg: 'bg-green-50 text-green-500 ring-4 ring-green-500/10',
          icon: <Leaf size={18} />
        };
    }
  };

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(52,180,166,0.06)] border border-gray-100 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#0E1B2B]">Fila Priorizada</h2>
          <p className="text-xs font-semibold text-gray-400 mt-0.5">Por ordem de atendimento</p>
        </div>
        <button className="text-xs font-bold text-[#0E1B2B] hover:underline flex items-center gap-1 cursor-pointer">
          Ver todos <span className="text-sm font-light">→</span>
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {queueData.map((user, index) => {
          const styles = getSchemeStyles(user.scheme);
          return (
            <div 
              key={index} 
              onClick={() => navigate(`/clientes/${user.id}`)}
              className={`bg-white pl-4 pr-5 py-4 rounded-2xl flex gap-4 border border-gray-100 hover:border-gray-200 transition-all cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.01)] hover:shadow-md border-l-4 ${styles.borderClass}`}
            >
              {/* Icon Circle */}
              <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${styles.iconBg}`}>
                {styles.icon}
              </div>

              {/* Text Area */}
              <div className="flex-1 min-w-0 flex flex-col">
                <h3 className="text-sm font-bold text-[#0E1B2B] truncate">{user.name}</h3>
                <span className="text-[10px] font-semibold text-gray-400 mt-0.5">{user.company}</span>
                <p className="text-xs text-gray-500 font-medium mt-2 leading-tight pr-4">{user.reason}</p>
                
                {/* Timestamp */}
                <span className="text-[10px] font-semibold text-gray-400 self-end mt-1">
                  {user.date}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
