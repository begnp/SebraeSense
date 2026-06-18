import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import {
  ArrowLeft, Phone, Mail, AlertTriangle, Eye, CheckCircle2, Loader2, Star, X
} from 'lucide-react';

interface ScoreItem { value: number; max: number; color: 'yellow' | 'red' | 'green'; }
interface TimelineEvent { title: string; time: string; type: 'alert' | 'eye' | 'check'; alert_id?: number; status?: string; }
interface ProcessItem { id: string; title: string; period: string; dots: ('green' | 'yellow' | 'gray')[]; status: string; notes?: string; sla_status: string; }
interface FeedbackItem { id: number; comment: string; rating?: number; sentiment: 'positive' | 'neutral' | 'negative' | string; response?: string; responded_at?: string; created_at: string; }

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
  feedbacks: FeedbackItem[];
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

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<ProcessItem | null>(null);
  const [newStatus, setNewStatus] = useState<string>('aberto');
  const [newNotes, setNewNotes] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const handleUpdateProcess = async () => {
    if (!selectedProcess) return;
    setUpdating(true);
    try {
      const cleanId = selectedProcess.id.replace('#', '');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/customers/processes/${cleanId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          notes: newNotes,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar o processo');
      }

      const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/api/customers/${id ?? 1}`);
      if (profileRes.ok) {
        const updatedCustomer = await profileRes.json();
        setCustomer(updatedCustomer);
      }
      setIsUpdateModalOpen(false);
    } catch (err: any) {
      console.error('Erro ao atualizar processo:', err);
      alert('Erro ao atualizar o processo: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const reloadCustomer = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/customers/${id ?? 1}`);
      if (response.ok) {
        const data = await response.json();
        setCustomer(data);
      }
    } catch (err) {
      console.error('Erro ao recarregar dados do cliente:', err);
    }
  };

  const handleCreateProcess = async () => {
    if (!createTitle.trim()) return;
    setCreating(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/customers/${id ?? 1}/processes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: createTitle }),
      });
      if (response.ok) {
        setCreateTitle('');
        setIsCreateModalOpen(false);
        reloadCustomer();
      } else {
        alert('Erro ao registrar atendimento.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao registrar atendimento.');
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/customers/${id ?? 1}`);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/customers/alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        throw new Error('Falha ao atualizar o alerta');
      }
      const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/api/customers/${id ?? 1}`);
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
                   {/* Left Column components (Timeline, Processes & Feedbacks) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
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

              <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(52,180,166,0.06)] border border-gray-100/50 flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-extrabold text-[#0E1B2B]">Processos abertos</h3>
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-2.5 py-1.5 bg-[#0E1B2B] hover:bg-[#1c3552] text-white text-[10px] font-black rounded-lg transition-colors cursor-pointer"
                  >
                    + Novo Caso
                  </button>
                </div>
                
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

                        {/* SLA Status Badge */}
                        <div className="flex items-center justify-between border-t border-gray-50 pt-2 flex-wrap gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${
                            proc.sla_status === 'atrasado'
                              ? 'bg-red-50 text-red-500 border-red-100'
                              : proc.sla_status === 'atencao'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
                              : proc.sla_status === 'finalizado'
                              ? 'bg-gray-100 text-gray-500 border-gray-200'
                              : 'bg-green-50 text-green-600 border-green-100'
                          }`}>
                            {proc.sla_status === 'atrasado'
                              ? 'SLA: Estourado'
                              : proc.sla_status === 'atencao'
                              ? 'SLA: Em Atenção'
                              : proc.sla_status === 'finalizado'
                              ? 'SLA: Finalizado'
                              : 'SLA: No Prazo'}
                          </span>
                        </div>

                        <button 
                          onClick={() => {
                            setSelectedProcess(proc);
                            setNewStatus(proc.status);
                            setNewNotes(proc.notes || '');
                            setIsUpdateModalOpen(true);
                          }}
                          className="w-full py-2 bg-[#E5EFEA] hover:bg-[#d8e7e1] text-[#0E1B2B] text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
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

            {/* Feedbacks do Cliente Card */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(52,180,166,0.06)] border border-gray-100/50 flex flex-col">
              <h3 className="text-lg font-extrabold text-[#0E1B2B] mb-6">Feedbacks do Cliente</h3>
              
              {customer.feedbacks.length === 0 ? (
                <div className="text-center py-8 text-gray-400 font-semibold text-xs bg-gray-50 rounded-2xl border border-gray-100">
                  Nenhum feedback registrado para este cliente.
                </div>
              ) : (
                <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-1">
                  {customer.feedbacks.map((fb) => (
                    <div key={fb.id} className="bg-[#F4F7FA] rounded-[20px] p-4 border border-gray-100/50 flex flex-col gap-2 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={12}
                              className={
                                s <= (fb.rating || 0)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }
                            />
                          ))}
                        </div>
                        
                        <span className={`px-2.5 py-0.5 text-[8px] font-extrabold rounded-full uppercase tracking-wider border ${
                          fb.sentiment === 'positive'
                            ? 'bg-green-50 text-green-600 border-green-200'
                            : fb.sentiment === 'negative'
                            ? 'bg-red-50 text-red-500 border-red-200'
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}>
                          {fb.sentiment === 'positive'
                            ? 'POSITIVO'
                            : fb.sentiment === 'negative'
                            ? 'NEGATIVO'
                            : 'NEUTRO'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed font-semibold">"{fb.comment}"</p>
                      <span className="text-[10px] text-gray-400 font-semibold mt-1">
                        Registrado em {new Date(fb.created_at).toLocaleDateString('pt-BR')}
                      </span>

                      {/* Visual response or response form */}
                      {fb.response ? (
                        <div className="mt-3 ml-2 p-3 bg-white border-l-4 border-purple-500 rounded-r-2xl flex flex-col gap-1.5 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-wider">Resposta Sebrae</span>
                            <span className="text-[9px] text-gray-400 font-bold">
                              {fb.responded_at ? new Date(fb.responded_at).toLocaleDateString('pt-BR') : ''}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed font-medium">{fb.response}</p>
                        </div>
                      ) : (
                        <FeedbackReplyForm feedbackId={fb.id} onReplied={reloadCustomer} />
                      )}
                    </div>
                  ))}
                </div>
              )}
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

      {/* Update Process Modal */}
      {isUpdateModalOpen && selectedProcess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-[32px] border border-gray-100/80 p-6 shadow-[0_10px_50px_rgba(0,0,0,0.15)] max-w-md w-full mx-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Gestão de Ocorrências
                </span>
                <h3 className="text-xl font-extrabold text-[#0E1B2B] mt-0.5">
                  Atualizar Caso {selectedProcess.id}
                </h3>
              </div>
              <button 
                onClick={() => setIsUpdateModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Case Details */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Assunto</span>
              <p className="text-xs font-bold text-[#0E1B2B] mt-0.5">{selectedProcess.title}</p>
            </div>

            {/* Status Selector */}
            <div className="mb-6">
              <label className="text-xs font-bold text-[#0E1B2B] block mb-2.5">
                Alterar Status do Atendimento
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['aberto', 'em_andamento', 'finalizado'] as const).map((statusVal) => {
                  const labelMap = {
                    aberto: 'Aberto',
                    em_andamento: 'Em Andamento',
                    finalizado: 'Finalizado'
                  };
                  const activeColorMap = {
                    aberto: 'bg-[#E5EFEA] text-[#1e4a38] border-green-300 shadow-sm shadow-green-100',
                    em_andamento: 'bg-yellow-50 text-yellow-800 border-yellow-300 shadow-sm shadow-yellow-100',
                    finalizado: 'bg-blue-50 text-blue-800 border-blue-300 shadow-sm shadow-blue-100'
                  };
                  const isActive = newStatus === statusVal;
                  return (
                    <button
                      key={statusVal}
                      type="button"
                      onClick={() => setNewStatus(statusVal)}
                      className={`py-3 px-1 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        isActive 
                          ? activeColorMap[statusVal]
                          : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50 hover:text-gray-600'
                      }`}
                    >
                      {labelMap[statusVal]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Observation Notes */}
            <div className="mb-6">
              <label htmlFor="notes" className="text-xs font-bold text-[#0E1B2B] block mb-2">
                Observações de Resolução / Andamento
              </label>
              <textarea
                id="notes"
                rows={4}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Insira detalhes sobre as ações tomadas..."
                className="w-full rounded-2xl border border-gray-200 p-3 text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3CDAB6] focus:border-[#3CDAB6] bg-gray-50/50 resize-none transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={handleUpdateProcess}
                className="flex-1 py-3 bg-[#0E1B2B] hover:bg-[#1c3552] text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Atualização'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Create Process Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-[32px] border border-gray-100/80 p-6 shadow-[0_10px_50px_rgba(0,0,0,0.15)] max-w-md w-full mx-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Gestão de Ocorrências
                </span>
                <h3 className="text-xl font-extrabold text-[#0E1B2B] mt-0.5">
                  Registrar Novo Atendimento
                </h3>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-650 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Case Title Input */}
            <div className="mb-6">
              <label htmlFor="createTitle" className="text-xs font-bold text-[#0E1B2B] block mb-2">
                Assunto / Título do Caso
              </label>
              <input
                id="createTitle"
                type="text"
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                placeholder="Ex: Reclamação sobre taxas DAS ou Dúvida de Crédito..."
                className="w-full rounded-2xl border border-gray-200 p-3.5 text-xs font-semibold text-gray-750 focus:outline-none focus:ring-2 focus:ring-[#3CDAB6] focus:border-[#3CDAB6] bg-gray-50/50 transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={creating || !createTitle.trim()}
                onClick={handleCreateProcess}
                className="flex-1 py-3 bg-[#0E1B2B] hover:bg-[#1c3552] text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Registrando...
                  </>
                ) : (
                  'Registrar Atendimento'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

function FeedbackReplyForm({ feedbackId, onReplied }: { feedbackId: number; onReplied: () => void }) {
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/customers/feedback/${feedbackId}/respond`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response: replyText }),
      });
      if (response.ok) {
        setReplyText('');
        setShowForm(false);
        onReplied();
      } else {
        alert('Erro ao enviar resposta.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de rede ao responder feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="mt-2 text-[10.5px] font-bold text-purple-600 hover:text-purple-800 hover:underline w-fit text-left cursor-pointer flex items-center gap-1"
      >
        <span>+ Responder feedback</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3.5 flex flex-col gap-2 bg-white p-3.5 rounded-2xl border border-purple-100 shadow-sm">
      <span className="text-[10px] font-extrabold text-[#0E1B2B] uppercase">Nova Resposta Sebrae</span>
      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Escreva uma resposta direta e objetiva..."
        rows={2}
        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500 bg-gray-50/50 text-gray-700 placeholder-gray-400"
      />
      <div className="flex gap-2.5 self-end">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-3 py-1.5 text-[10px] font-bold text-gray-400 hover:text-gray-650 cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting || !replyText.trim()}
          className="px-4 py-1.5 bg-[#0E1B2B] hover:bg-[#152a42] text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
        >
          {submitting ? 'Enviando...' : 'Enviar Resposta'}
        </button>
      </div>
    </form>
  );
}