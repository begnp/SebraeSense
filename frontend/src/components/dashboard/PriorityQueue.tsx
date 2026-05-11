import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

interface QueueUser {
  id: string;
  initials: string;
  name: string;
  company: string;
  score: number;
  reason: string;
  alertCount: number;
  date: string;
}

const mockUsers: QueueUser[] = [
  { id: '1', initials: 'JS', name: 'João Santos', company: 'Tech Norte LTDA', score: 18, reason: '3 erros consecutivos no cadastro', alertCount: 3, date: '5 de abr.' },
  { id: '2', initials: 'MS', name: 'Maria Silva', company: 'Padaria Estrela', score: 18, reason: 'Inatividade de 30 dias + tarefa abandonada', alertCount: 3, date: '7 de abr.' },
  { id: '3', initials: 'AC', name: 'Ana Costa', company: 'Confecções Sol', score: 18, reason: 'Abandono em tarefa crítica', alertCount: 3, date: '6 de abr.' },
  { id: '4', initials: 'MS', name: 'Maria Silva', company: 'Padaria Estrela', score: 18, reason: 'Inatividade de 30 dias + tarefa abandonada', alertCount: 3, date: '7 de abr.' },
];

export const PriorityQueue = () => {
  return (
    <div className="bg-transparent rounded-xl flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#1A2530]">Fila Priorizada</h2>
          <p className="text-xs text-gray-500">Briefing de atendimento</p>
        </div>
        <button className="text-sm font-semibold text-[#6B4C9A] hover:underline flex items-center">
          Ver todos <span className="ml-1">→</span>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {mockUsers.map((user, index) => (
          <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-transparent hover:border-red-100 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#6B4C9A] text-white flex items-center justify-center text-xs font-bold">
                  {user.initials}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A2530]">{user.name}</h3>
                  <p className="text-[10px] text-gray-500">{user.company}</p>
                </div>
              </div>
              <div className="px-2 py-0.5 rounded-full border border-red-500 text-red-500 text-xs font-bold">
                {user.score}
              </div>
            </div>
            
            <p className="text-xs text-gray-600 mb-3 ml-11">{user.reason}</p>
            
            <div className="flex items-center gap-4 ml-11">
              <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold">
                <AlertTriangle size={12} />
                <span>{user.alertCount} alertas</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-[10px] font-medium">
                <Clock size={12} />
                <span>{user.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
