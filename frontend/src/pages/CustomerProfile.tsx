import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import {
  ArrowLeft, Phone, Mail, AlertTriangle, Eye, CheckCircle2, Loader2, User, X
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

function ScoreBar({ label, value, color }: { label: string; value: number; color: 'yellow' | 'red' | 'green' }) {
  const colorClasses = {
    yellow: 'bg-[#FBE2C6]',
    red: 'bg-[#FCD8D4]',
    green: 'bg-[#8EF2AD]'
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[12px] font-extrabold text-[#0E1B2B]">{label}</span>
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-[#E4F8F4] rounded-full h-4 overflow-hidden shadow-inner">
          <div 
            className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500 shadow-sm`} 
            style={{ width: `${value}%` }} 
          />
        </div>
        <span className="text-[11px] font-extrabold text-gray-600 w-8 text-right">{value}%</span>
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
          <div className="w-[42px] h-[42px] rounded-full bg-[#FCD8D4] text-[#D34135] flex items-center justify-center flex-shrink-0 border border-[#D34135]/10 shadow-sm">
            <AlertTriangle size={20} />
          </div>
        );
      case 'eye':
        return (
          <div className="w-[42px] h-[42px] rounded-full bg-[#FBE2C6] text-[#C17A2A] flex items-center justify-center flex-shrink-0 border border-[#C17A2A]/10 shadow-sm">
            <Eye size={20} />
          </div>
        );
      case 'check':
        return (
          <div className="w-[42px] h-[42px] rounded-full bg-[#8EF2AD] text-[#1E4A38] flex items-center justify-center flex-shrink-0 border border-[#1E4A38]/10 shadow-sm">
            <CheckCircle2 size={20} />
          </div>
        );
    }
  };

  const getDotColorClass = (status: 'green' | 'yellow' | 'gray') => {
    switch (status) {
      case 'green': return 'bg-[#3CDAB6]';
      case 'yellow': return 'bg-[#FEF08A]';
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

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
          
          {/* Left Side: Profile Card + Bottom Cards */}
          <div className="lg:col-span-8 flex flex-col gap-6 h-full">

            {/* Top Profile Card */}
            <div className="bg-[#F4FBFA] rounded-[32px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col md:flex-row items-center gap-8 relative">
              {/* Avatar */}
              <div className="w-[100px] h-[100px] rounded-full border-[6px] border-[#8B6EBB]/40 p-1 flex-shrink-0 flex items-center justify-center bg-gray-50">
                <div className="w-full h-full rounded-full bg-[#EAE5F3] text-[#8B6EBB] flex items-center justify-center shadow-inner">
                  <User size={40} strokeWidth={2.5} />
                </div>
              </div>
              
              <div className="flex flex-col gap-5 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex flex-col gap-1.5">
                    <h2 className="text-[28px] font-extrabold text-[#0E1B2B] leading-none tracking-tight">{customer.name}</h2>
                    <span className="text-[15px] font-semibold text-gray-600">{customer.company}</span>
                  </div>
                  
                  <div className="flex flex-col gap-2.5 text-[13px] font-semibold text-gray-500 mr-auto sm:ml-12">
                    <span className="flex items-center gap-2.5">
                      <Phone size={16} className="text-[#3CDAB6]" /> {customer.phone}
                    </span>
                    <span className="flex items-center gap-2.5">
                      <Mail size={16} className="text-[#3CDAB6]" /> {customer.email}
                    </span>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="flex bg-[#F9F6EA] rounded-full w-full max-w-lg items-center text-[13px] font-extrabold h-9 relative overflow-hidden shadow-inner mt-2">
                   <div className="absolute left-0 top-0 bottom-0 bg-[#FBE2C6] w-[50%] rounded-full flex items-center pl-5 text-[#C17A2A]">
                      <Eye size={18} />
                   </div>
                   <div className="absolute right-6 top-0 bottom-0 flex items-center text-[#0E1B2B]">
                     {customer.status}
                   </div>
                </div>
              </div>
            </div>

            {/* Bottom Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch flex-1">
          
          {/* Linha do tempo Card */}
          <div className="bg-[#F4FBFA] rounded-[32px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col h-full">
            <h3 className="text-[22px] font-extrabold text-[#0E1B2B] tracking-tight mb-8">Linha do tempo</h3>
            
            <div className="flex-1 flex flex-col gap-6 relative pl-7 border-l-[3px] border-[#3CDAB6] ml-2 py-2">
              {customer.timeline.map((event, idx) => (
                <div key={idx} className="relative flex items-center">
                  {/* Circle bullet on the line */}
                  <div className="absolute -left-[37px] w-5 h-5 rounded-full bg-[#3CDAB6] border-[3px] border-white ring-2 ring-[#3CDAB6]/30 flex-shrink-0" />
                  
                  {/* Event Bubble */}
                  <div className="bg-[#E4F8F4] rounded-[24px] p-5 flex-1 flex flex-row items-center justify-between gap-4 shadow-sm border border-transparent hover:border-gray-200 transition-all ml-4">
                    <div className="flex flex-col min-w-0 flex-1 gap-1">
                      <span className="text-[13px] font-extrabold text-[#0E1B2B] leading-tight break-words pr-2">
                        {event.title}
                      </span>
                      <span className="text-[11px] font-semibold text-gray-500">
                        {event.time}
                      </span>
                    </div>
                    {getTimelineIcon(event.type)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <button className="py-2 px-5 bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-600 text-[11px] font-extrabold uppercase tracking-wide rounded-full transition-colors cursor-pointer text-center">
                Ver mais +
              </button>
            </div>
          </div>

          {/* Processos abertos Card */}
          <div className="bg-[#F4FBFA] rounded-[32px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col h-full">
            <h3 className="text-[22px] font-extrabold text-[#0E1B2B] tracking-tight mb-8">Processos abertos</h3>
            
            <div className="flex flex-col gap-6 flex-1">
              {customer.processes.map((proc, idx) => (
                <div key={idx} className="bg-[#E4F8F4] rounded-[24px] overflow-hidden flex flex-col shadow-sm border border-transparent hover:border-gray-200 transition-all">
                  {/* Top Tag Bar */}
                  <div className="bg-[#3CDAB6] px-5 py-2 flex justify-between items-center text-[11px] font-extrabold text-white uppercase tracking-wider">
                    <span>{proc.period}</span>
                    <span>{proc.id}</span>
                  </div>
                  {/* Card Body */}
                  <div className="p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[14px] font-extrabold text-[#0E1B2B] leading-snug pr-2">
                        {proc.title}
                      </span>
                      
                      {/* Dot Status Indicators */}
                      <div className="flex items-center gap-1.5 flex-shrink-0 mt-1">
                        {proc.dots.map((dot, dIdx) => (
                          <div 
                            key={dIdx} 
                            className={`w-3 h-3 rounded-full ${getDotColorClass(dot)} shadow-sm`} 
                          />
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setSelectedProcess(proc);
                        setNewStatus(proc.status);
                        setNewNotes(proc.notes || '');
                        setIsUpdateModalOpen(true);
                      }}
                      className="mt-2 w-full py-2.5 bg-white hover:bg-gray-50 text-[#0E1B2B] text-[12px] font-extrabold rounded-full border border-gray-200 transition-colors flex items-center justify-between px-5 shadow-sm cursor-pointer"
                    >
                      Atualizar caso <span className="text-sm font-light leading-none">↗</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <button className="py-2 px-5 bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-600 text-[11px] font-extrabold uppercase tracking-wide rounded-full transition-colors cursor-pointer text-center">
                Ver mais +
              </button>
            </div>
          </div>

            </div>
          </div>

          {/* Right Side: Score Calculado */}
          <div className="lg:col-span-4 flex flex-col h-full">
            {/* Score Calculado Card */}
            <div className="bg-[#F4FBFA] rounded-[32px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col h-full">
              <h3 className="text-[22px] font-extrabold text-[#0E1B2B] tracking-tight mb-8">Score Calculado</h3>
              
              {/* Speedometer Gauge Component */}
              <div className="mb-8">
                <GaugeChart value={customer.score} />
                <div className="text-center text-[10px] font-semibold text-gray-500 mt-6">
                  Última atualização: 01 de junho 2026
                </div>
              </div>

              {/* Score Indicators List */}
              <div className="flex flex-col gap-6 pt-4">
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

              {/* Total Indicator */}
              <div className="bg-[#E4F8F4] rounded-[24px] p-5 flex justify-between items-center mt-auto shadow-sm border border-gray-100/50">
                <span className="text-[16px] font-extrabold text-[#0E1B2B]">Total</span>
                <div className="flex items-center gap-2 bg-[#FBE2C6] text-[#C17A2A] font-extrabold text-[14px] px-4 py-1.5 rounded-full border border-[#C17A2A]/10 shadow-sm">
                  <Eye size={16} />
                  <span>53%</span>
                </div>
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
