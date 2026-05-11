import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Activity } from 'lucide-react';

export interface ChartDataPoint {
  name: string;
  chs: number;
}

interface ChartWidgetProps {
  data: ChartDataPoint[];
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="text-gray-400" size={24} />
        <div>
          <h3 className="text-[#1A2530] font-bold">Variação Média do CHS</h3>
          <p className="text-sm text-gray-500">Últimos 30 dias</p>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="name" hide />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              ticks={[25, 50, 75, 100]} 
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
            />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="chs" 
              stroke="#EAB308" 
              strokeWidth={3} 
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
