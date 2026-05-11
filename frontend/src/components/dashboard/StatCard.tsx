import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  count: number | string;
  title: string;
  subtitle: string;
  colorScheme: 'red' | 'yellow' | 'green';
}

export const StatCard: React.FC<StatCardProps> = ({ icon, count, title, subtitle, colorScheme }) => {
  const colors = {
    red: { text: 'text-red-500', bg: 'bg-white' },
    yellow: { text: 'text-yellow-500', bg: 'bg-white' },
    green: { text: 'text-green-500', bg: 'bg-white' },
  };

  return (
    <div className={`rounded-xl p-6 flex items-center gap-6 shadow-sm ${colors[colorScheme].bg}`}>
      <div className={`p-1 ${colors[colorScheme].text}`}>
        {icon}
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[#1A2530]">{count}</span>
          <span className="text-lg font-bold text-[#1A2530]">{title}</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
};
