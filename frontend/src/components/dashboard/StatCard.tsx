import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  count: number | string;
  title: string;
  colorScheme: 'red' | 'yellow' | 'green' | 'grey';
}

export const StatCard: React.FC<StatCardProps> = ({ icon, count, title, colorScheme }) => {
  const colors = {
    grey: { iconBg: 'bg-[#E5F3F1] text-[#2C5256]' },
    red: { iconBg: 'bg-[#FEE2E2] text-[#DC2626]' },
    yellow: { iconBg: 'bg-[#FEF3C7] text-[#D97706]' },
    green: { iconBg: 'bg-[#D1FAE5] text-[#059669]' },
  };

  return (
    <div className="bg-white rounded-[24px] p-6 flex flex-col gap-2 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-transparent">
      {/* Icon Circle */}
      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colors[colorScheme].iconBg}`}>
        {icon}
      </div>
      {/* Text Info */}
      <div className="flex flex-col mt-2">
        <span className="text-4xl font-extrabold text-[#0E1B2B] leading-none mb-3">
          {count}
        </span>
        <span className="text-sm font-medium text-gray-500 capitalize">
          {title}
        </span>
      </div>
    </div>
  );
};
