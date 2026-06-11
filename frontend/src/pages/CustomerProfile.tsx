import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import {
  ArrowLeft, Phone, Mail, AlertTriangle, Eye, CheckCircle2, Loader2
} from 'lucide-react';

interface ScoreItem { value: number; max: number; color: 'yellow' | 'red' | 'green'; }
interface TimelineEvent { title: string; time: string; type: 'alert' | 'eye' | 'check'; alert_id?: number; status?: string; }
interface ProcessItem { id: string; title: string; period: string; dots: ('green' | 'yellow' | 'gray')[]; }

interface CustomerData {
  id: number;
  name: string;
  company: string;
  phone: string;
  email: string;
  status: string;
  score: number;
  scores: {
    frequencia: ScoreItem;
    progressao: ScoreItem;
    retorno: ScoreItem;
    engajamento: ScoreItem;
  };
  timeline: TimelineEvent[];
  processes: ProcessItem[];
}



// Gauge (velocímetro) SVG
function GaugeChart({ value }: { value: number }) {
  const min = 100;
  const max = 900;
  const range = max - min;
  const percent = Math.min(Math.max((value - min) / range, 0), 1);
  const angle = 180 - percent * 180; // 180 is left (100), 0 is right (900)

  const rad = (angle * Math.PI) / 180;
  const cx = 110;
  const cy = 100;

  const rStart = 62;
  const rEnd = 80;
  const needleX1 = cx + rStart * Math.cos(rad);
  const needleY1 = cy - rStart * Math.sin(rad);
  const needleX2 = cx + rEnd * Math.cos(rad);
  const needleY2 = cy - rEnd * Math.sin(rad);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg viewBox="0 0 220 125" className="w-full max-w-[220px]">
        <defs>
          <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="30%" stopColor="#EAB308" />
            <stop offset="60%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>

        {/* Arc Track */}
        <path
          d="M 25 100 A 85 85 0 0 1 195 100"
          fill="none"
          stroke="url(#gauge-grad)"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Labels */}
        <text x="18" y="118" fontSize="9" fill="#9CA3AF" fontWeight="bold">100</text>
        <text x="50" y="52" fontSize="9" fill="#9CA3AF" fontWeight="bold">350</text>
        <text x="110" y="22" fontSize="9" fill="#9CA3AF" fontWeight="bold" textAnchor="middle">500</text>
        <text x="170" y="52" fontSize="9" fill="#9CA3AF" fontWeight="bold">750</text>
        <text x="192" y="118" fontSize="9" fill="#9CA3AF" fontWeight="bold">900</text>

        {/* Value inside SVG */}
        <text 
          x="110" 
          y="94" 
          textAnchor="middle" 
          fontSize="30" 
          fontWeight="900" 
          fill="#0E1B2B"
          style={{ fontFamily: 'sans-serif' }}
        >
          {value}
        </text>

        {/* Status Pill Background inside SVG */}
        <rect 
          x="73" 
          y="105" 
          width="74" 
          height="18" 
          rx="9" 
          fill="#FEF08A" 
          stroke="#FEF08A" 
          strokeWidth="1" 
        />
        
        {/* Status Pill Text inside SVG */}
        <text 
          x="110" 
          y="117" 
          textAnchor="middle" 
          fontSize="8" 
          fontWeight="900" 
          fill="#854D0E"
          style={{ fontFamily: 'sans-serif', letterSpacing: '0.05em' }}
        >
          EM RISCO
        </text>

        {/* Needle - Shorter tick segment */}
        <line
          x1={needleX1}
          y1={needleY1}
          x2={needleX2}
          y2={needleY2}
          stroke="#0E1B2B"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// Progress Bar Helper
function ScoreBar({ label, value, color }: { label: string; value: number; color: 'yellow' | 'red' | 'green' }) {
  const colorClasses = {
    yellow: 'bg-yellow-400',
    red: 'bg-red-500',
    green: 'bg-green-500'
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-[#0E1B2B]">{label}</span>
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500`} 
            style={{ width: `${value}%` }} 
          />
        </div>
        <span className="text-xs font-bold text-gray-400 w-8 text-right">{value}%</span>
      </div>
    </div>
  );
}

export function CustomerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/customers/${id ?? 1}`);
        if (!response.ok) {
          throw new Error('Falha ao buscar dados do cliente');
        }
        const data = await response.json();
        setCustomer(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Erro de conexão');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  const handleResolveAlert = async (alertId: number, status: 'resolved' | 'false_positive') => {
    try {
      const response = await fetch(`http://localhost:8000/api/customers/alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        throw new Error('Falha ao atualizar o alerta');
      }
      const profileRes = await fetch(`http://localhost:8000/api/customers/${id ?? 1}`);
      if (profileRes.ok) {
        const updatedCustomer = await profileRes.json();
        setCustomer(updatedCustomer);
      }
    } catch (err: any) {
      console.error('Erro ao atualizar alerta:', err);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <Loader2 className="animate-spin text-[#6B4C9A]" size={48} />
        </div>
      </MainLayout>
    );
  }

  if (error || !customer) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-red-500 font-sans">
          <AlertTriangle size={48} className="mb-4" />
          <h2 className="text-xl font-bold">Erro ao carregar o perfil do cliente</h2>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 px-5 py-2.5 bg-[#0E1B2B] hover:bg-[#1c3552] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </MainLayout>
    );
  }

  const getTimelineIcon = (type: 'alert' | 'eye' | 'check') => {
    switch (type) {
      case 'alert':
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} />
          </div>
        );
      case 'eye':
        return (
          <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center flex-shrink-0">
            <Eye size={18} />
          </div>
        );
      case 'check':
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-500 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={18} />
          </div>
        );
    }
  };

  const getDotColorClass = (status: 'green' | 'yellow' | 'gray') => {
    switch (status) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-400';
      case 'gray': return 'bg-gray-300';
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 font-sans">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#0E1B2B] w-fit transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Voltar
        </button>

        {/* Top Profile Card */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(52,180,166,0.06)] border border-gray-100/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
            {/* Avatar container with purple border */}
            <div className="w-20 h-20 rounded-full border-4 border-purple-500/30 p-1 flex-shrink-0 flex items-center justify-center bg-gray-100">
              <div className="w-full h-full rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-extrabold text-[#0E1B2B] leading-none">{customer.name}</h2>
              <span className="text-sm font-semibold text-gray-400 mt-1">{customer.company}</span>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mt-2 text-xs font-semibold text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-[#3CDAB6]" /> {customer.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-[#3CDAB6]" /> {customer.email}
                </span>
              </div>
            </div>
          </div>

          {/* Eye Icon Double Status Pill */}
          <div className="flex items-center rounded-full overflow-hidden border border-yellow-200 shadow-sm flex-shrink-0">
            <div className="bg-[#FEF08A] text-[#854D0E] px-4 py-2 flex items-center justify-center">
              <Eye size={16} />
            </div>
            <div className="bg-[#FEF08A]/60 text-[#854D0E] px-5 py-2 font-extrabold text-xs uppercase tracking-wide">
              {customer.status}
            </div>
          </div>
        </div>

        {/* Detailed Grid (Left Col-span 8, Right Col-span 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column components (Timeline & Processes) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Linha do tempo Card */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(52,180,166,0.06)] border border-gray-100/50 flex flex-col h-full">
              <h3 className="text-lg font-extrabold text-[#0E1B2B] mb-6">Linha do tempo</h3>
              
              <div className="flex-1 flex flex-col gap-5 relative pl-6 border-l-2 border-dashed border-[#3CDAB6]/40 ml-2 py-1">
                {customer.timeline.map((event, idx) => (
                  <div key={idx} className="relative flex items-center">
                    {/* Circle bullet on the dashed line */}
                    <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-[#3CDAB6] border-2 border-white ring-2 ring-[#3CDAB6]/20 flex-shrink-0" />
                    
                    {/* Event Bubble */}
                    <div className="bg-[#E5EFEA] rounded-[16px] p-4 flex-1 flex items-center justify-between gap-4 border border-gray-100/20">
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-bold text-[#0E1B2B] leading-tight break-words">
                          {event.title}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400 mt-1">
                          {event.time}
                        </span>
                        {event.alert_id && (
                          <div className="mt-2.5 flex flex-wrap gap-2">
                            {event.status === 'active' ? (
                              <>
                                <button
                                  onClick={() => handleResolveAlert(event.alert_id!, 'resolved')}
                                  className="px-2.5 py-1 bg-[#3CDAB6] hover:bg-[#2cb898] text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                                >
                                  ✓ Resolvido
                                </button>
                                <button
                                  onClick={() => handleResolveAlert(event.alert_id!, 'false_positive')}
                                  className="px-2.5 py-1 bg-gray-500 hover:bg-gray-600 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                                >
                                  ✗ Falso Positivo
                                </button>
                              </>
                            ) : event.status === 'resolved' ? (
                              <span className="px-2.5 py-0.5 bg-[#E5EFEA] text-[#0E1B2B] text-[10px] font-extrabold rounded-full border border-green-200 uppercase tracking-wider">
                                ✓ Resolvido
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-extrabold rounded-full border border-gray-200 uppercase tracking-wider">
                                ✗ Falso Positivo
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {getTimelineIcon(event.type)}
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-6 py-2.5 w-full border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center">
                Ver mais +
              </button>
            </div>

            {/* Processos abertos Card */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(52,180,166,0.06)] border border-gray-100/50 flex flex-col h-full">
              <h3 className="text-lg font-extrabold text-[#0E1B2B] mb-6">Processos abertos</h3>
              
              <div className="flex flex-col gap-5 flex-1">
                {customer.processes.map((proc, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-[20px] overflow-hidden flex flex-col shadow-sm bg-white">
                    {/* Top Tag Bar */}
                    <div className="bg-[#3CDAB6] px-4 py-1.5 flex justify-between items-center text-[10px] font-bold text-white">
                      <span>{proc.period}</span>
                      <span>{proc.id}</span>
                    </div>
                    {/* Card Body */}
                    <div className="p-4 flex flex-col gap-4">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-xs font-extrabold text-[#0E1B2B] leading-tight pr-2">
                          {proc.title}
                        </span>
                        
                        {/* Dot Status Indicators */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {proc.dots.map((dot, dIdx) => (
                            <div 
                              key={dIdx} 
                              className={`w-2.5 h-2.5 rounded-full ${getDotColorClass(dot)}`} 
                            />
                          ))}
                        </div>
                      </div>

                      <button className="w-full py-2 bg-[#E5EFEA] hover:bg-[#d8e7e1] text-[#0E1B2B] text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                        Atualizar caso <span className="text-sm">↗</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-6 py-2.5 w-full border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center">
                Ver mais +
              </button>
            </div>

          </div>

          {/* Right Column (Score Calculado panel) */}
          <div className="lg:col-span-4 bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(52,180,166,0.06)] border border-gray-100/50 flex flex-col">
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">
              Score Calculado
            </span>
            
            {/* Speedometer Gauge Component */}
            <div className="mb-6">
              <GaugeChart value={customer.score} />
              <div className="text-center text-[10px] font-semibold text-gray-400 mt-4">
                Última atualização: 01 de junho 2026
              </div>
            </div>

            {/* Score Indicators List */}
            <div className="flex flex-col gap-4 border-t border-gray-100 pt-6">
              <ScoreBar 
                label="Frequência de acesso" 
                value={customer.scores.frequencia.value} 
                color={customer.scores.frequencia.color} 
              />
              <ScoreBar 
                label="Progressão" 
                value={customer.scores.progressao.value} 
                color={customer.scores.progressao.color} 
              />
              <ScoreBar 
                label="Retorno" 
                value={customer.scores.retorno.value} 
                color={customer.scores.retorno.color} 
              />
              <ScoreBar 
                label="Engajamento" 
                value={customer.scores.engajamento.value} 
                color={customer.scores.engajamento.color} 
              />
            </div>

            {/* Total Indicator footer inside column */}
            <div className="bg-[#E5EFEA] rounded-[20px] p-4 flex justify-between items-center mt-6">
              <span className="text-sm font-extrabold text-[#0E1B2B]">Total</span>
              <div className="flex items-center gap-1.5 bg-[#FEF08A] text-[#854D0E] font-extrabold text-xs px-3 py-1 rounded-full border border-yellow-200">
                <Eye size={12} />
                <span>53%</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </MainLayout>
  );
}