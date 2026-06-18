import { useState, useEffect } from 'react';

export interface StatCardData {
  risks: number;
  attention: number;
  healthy: number;
}

export interface QueueUser {
  id: number;
  initials: string;
  name: string;
  company: string;
  score: number;
  reason: string;
  alertCount: number;
  date: string;
  scheme: 'red' | 'yellow' | 'green' | string;
}

export interface HighlightUser {
  id: number;
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

export interface ChartDataPoint {
  name: string;
  chs: number;
}

export interface AlertSummary {
  inatividade: number;
  erro_critico: number;
  suporte: number;
  desengajamento: number;
  eventos: number;
  cursos: number;
}

export interface DashboardData {
  stats: StatCardData;
  queue: QueueUser[];
  highlights: HighlightUser[];
  chart: ChartDataPoint[];
  alerts_summary: AlertSummary;
}

export const useDashboardData = (days: number = 30) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://sebraesense-api.onrender.com/api/dashboard/?days=${days}`);
        if (!response.ok) {
          throw new Error('Falha ao buscar dados da API');
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Polling simulation every 30 seconds
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [days]);

  return { data, loading, error };
};
