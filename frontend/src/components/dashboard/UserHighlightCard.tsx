import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface UserHighlightProps {
  initials: string;
  name: string;
  company: string;
  score: number;
  alertCount: number;
  reason: string;
  engagement: number;
  progression: number;
  success: number;
}

export const UserHighlightCard: React.FC<UserHighlightProps> = ({
  initials,
  name,
  company,
  score,
  alertCount,
  reason,
  engagement,
  progression,
  success,
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col h-full relative overflow-hidden">
      {/* Left Red Border indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-500 rounded-l-xl"></div>
      
      <div className="pl-4 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#6B4C9A] text-white flex items-center justify-center text-sm font-bold">
            {initials}
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1A2530]">{name}</h3>
            <p className="text-xs text-gray-500">{company}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="px-2 py-0.5 rounded-full border border-red-500 text-red-500 text-sm font-bold">
            {score}
          </div>
          <div className="flex items-center gap-1 text-red-500 text-sm font-bold">
            <AlertTriangle size={16} />
            <span>{alertCount}</span>
          </div>
        </div>

        <p className="text-xs text-gray-600 mb-8 flex-1">{reason}</p>

        {/* Progress Bars */}
        <div className="space-y-3 mt-auto">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 w-6">Eng</span>
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: `${engagement}%` }}></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 w-6">Prog</span>
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: `${progression}%` }}></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 w-6">Suc</span>
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: `${success}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
