import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  count: number | string;
  title: string;
  colorScheme: 'red' | 'yellow' | 'green' | 'grey';
}

export const StatCard: React.FC<StatCardProps> = ({ icon, count, title, colorScheme }) => {
  const colors = {
    grey: { iconBg: 'bg-gray-100 text-gray-500' },
    red: { iconBg: 'bg-red-100 text-red-500' },
    yellow: { iconBg: 'bg-yellow-100 text-yellow-500' },
    green: { iconBg: 'bg-green-100 text-green-500' },
  };

  return (
    <div className="bg-white rounded-[16px] p-5 flex items-center gap-4 shadow-[0_4px_20px_rgba(52,180,166,0.04)] border border-gray-100/50">
      {/* Icon Circle */}
      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colors[colorScheme].iconBg}`}>
        {icon}
      </div>
      {/* Text Info */}
      <div className="flex flex-col">
        <span className="text-3xl font-extrabold text-[#0E1B2B] leading-none mb-1">
          {count}
        </span>
        <span className="text-xs font-semibold text-gray-400 capitalize">
          {title}
        </span>
      </div>
    </div>
  );
};
