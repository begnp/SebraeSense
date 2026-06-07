import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';

export interface ChartDataPoint {
  name: string;
  chs: number;
}

interface ChartWidgetProps {
  data: ChartDataPoint[];
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-[24px] shadow-[0_4px_24px_rgba(52,180,166,0.06)] border border-gray-100/50 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
          <TrendingUp size={20} />
        </div>
        <div>
          <h3 className="text-[#0E1B2B] font-extrabold text-base">Variação Média do CHS</h3>
          <p className="text-xs font-semibold text-gray-400 mt-0.5">Últimos 30 dias</p>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorChs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6B4C9A" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#6B4C9A" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 500 }}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip 
              contentStyle={{ background: '#0E1B2B', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
              formatter={(value: any) => [`CHS: ${value}`, '']}
              labelFormatter={(label) => `Dia ${label}`}
            />
            <Area 
              type="monotone" 
              dataKey="chs" 
              stroke="#6B4C9A" 
              strokeWidth={3} 
              fillOpacity={1}
              fill="url(#colorChs)"
              activeDot={{ r: 6, fill: '#6B4C9A', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};