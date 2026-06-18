import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTracker } from '../../hooks/useTracker';
import { CheckCircle2, AlertCircle, FileText, ChevronLeft, Loader2, Star, Mail, PlusCircle, Check, RotateCcw, AlertTriangle, MessageSquare, Clock, Activity } from 'lucide-react';

export function MiniSebraeTask() {
  const { completeTask, logError } = useTracker({ pageName: 'Mini Sebrae - Abertura de Empresa' });
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  // Feedback states
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [feedbackSent, setFeedbackSent] = useState<boolean>(false);
  const [sendingFeedback, setSendingFeedback] = useState<boolean>(false);

  // SENSE Sandbox & Testing states
  const [customer, setCustomer] = useState<any | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [newProcessTitle, setNewProcessTitle] = useState('');
  const [submittingProcess, setSubmittingProcess] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);

  // CRM Agent Action states (inline process status transitions)
  const [editingProcessId, setEditingProcessId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string>('aberto');
  const [editNotes, setEditNotes] = useState<string>('');
  const [updatingProcess, setUpdatingProcess] = useState(false);

  const [rageClicks, setRageClicks] = useState(0);
  const [errorsCount, setErrorsCount] = useState(0);
  const [exitsCount, setExitsCount] = useState(0);

  const fetchCustomerData = async () => {
    setLoadingCustomer(true);
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/customers/1');
      if (res.ok) {
        const data = await res.json();
        setCustomer(data);
      }
      
      const alertsRes = await fetch(import.meta.env.VITE_API_URL + '/api/customers/alerts/active');
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        // Filter alerts for client ID 1 (João Santos)
        const customerAlerts = alertsData.filter((a: any) => a.customer_id === 1);
        setActiveAlerts(customerAlerts);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do cliente no sandbox:', err);
    } finally {
      setLoadingCustomer(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  useEffect(() => {
    const handleTrackerEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { message } = customEvent.detail;
      if (message.includes('RAGE CLICK')) {
        setRageClicks(prev => prev + 1);
      } else if (message.includes('ERRO')) {
        setErrorsCount(prev => prev + 1);
      } else if (message.includes('ABANDONO')) {
        setExitsCount(prev => prev + 1);
      }
      // Re-fetch customer data after event logs propagate to backend
      setTimeout(() => fetchCustomerData(), 500);
    };
    
    window.addEventListener('tracker-event', handleTrackerEvent);
    return () => {
      window.removeEventListener('tracker-event', handleTrackerEvent);
    };
  }, []);

  const handleCreateProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProcessTitle.trim()) return;
    setSubmittingProcess(true);
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/customers/1/processes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newProcessTitle })
      });
      if (res.ok) {
        setNewProcessTitle('');
        fetchCustomerData();
      }
    } catch (err) {
      console.error('Erro ao criar processo:', err);
    } finally {
      setSubmittingProcess(false);
    }
  };

  const handleOptIn = async (processIdStr: string) => {
    const cleanId = processIdStr.replace('#', '');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/customers/processes/${cleanId}/opt-in`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ opt_in: true })
      });
      if (res.ok) {
        fetchCustomerData();
      }
    } catch (err) {
      console.error('Erro ao registrar opt-in:', err);
    }
  };

  const handleSimulateCriticalError = async () => {
    try {
      logError('Falha crítica na emissão de nota fiscal IBS/CBS (US 12H)');
      // Delay fetching to let telemetry record
      setTimeout(() => fetchCustomerData(), 500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateManualRageClick = async () => {
    try {
      await fetch(import.meta.env.VITE_API_URL + '/api/telemetry/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: 1,
          event_type: 'rage_click',
          metadata_payload: { page: 'Mini Sebrae - Abertura de Empresa' }
        })
      });
      window.dispatchEvent(new CustomEvent('tracker-event', {
        detail: { message: '🚨 [RAGE CLICK DETECTED] na página (Simulado)', type: 'warn' }
      }));
      setTimeout(() => fetchCustomerData(), 500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendFeedback = async () => {
    setSendingFeedback(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/customers/1/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment, rating })
      });
      if (response.ok) {
        setFeedbackSent(true);
        fetchCustomerData();
      }
    } catch (err) {
      console.error('Erro ao enviar feedback:', err);
    } finally {
      setSendingFeedback(false);
    }
  };

  // Agent updates process status and notes inline
  const handleUpdateProcessStatus = async (processIdStr: string) => {
    setUpdatingProcess(true);
    const cleanId = processIdStr.replace('#', '');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/customers/processes/${cleanId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: editStatus,
          notes: editNotes
        })
      });
      if (res.ok) {
        setEditingProcessId(null);
        setEditNotes('');
        fetchCustomerData();
      }
    } catch (err) {
      console.error('Erro ao atualizar processo pelo agente:', err);
    } finally {
      setUpdatingProcess(false);
    }
  };

  // Agent resolves alert or sets it as false positive
  const handleResolveAlert = async (alertId: number, status: 'resolved' | 'false_positive') => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/customers/alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchCustomerData();
      }
    } catch (err) {
      console.error('Erro ao resolver alerta no sandbox:', err);
    }
  };

  // Reset entire client sandbox state
  const handleResetSandbox = async () => {
    if (!window.confirm('Tem certeza de que deseja reiniciar o sandbox de simulação? Isso restaurará o score CHS para 18 e removerá processos e feedbacks criados.')) return;
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/customers/1/reset', {
        method: 'POST'
      });
      if (res.ok) {
        setRageClicks(0);
        setErrorsCount(0);
        setExitsCount(0);
        setFeedbackSent(false);
        setRating(0);
        setComment('');
        fetchCustomerData();
      }
    } catch (err) {
      console.error('Erro ao reiniciar o sandbox:', err);
    }
  };

  // Form states
  const [cpf, setCpf] = useState('');
  const [name, setName] = useState('');

  // This button is intentionally buggy to cause Rage Clicks
  const handleBuggyNextStep = () => {
    // 70% chance of "not responding" visually to induce multiple clicks
    if (Math.random() > 0.3) {
      // do nothing - user might click again!
      return;
    }
    
    if (cpf.length < 11) {
      setErrorMsg('CPF inválido.');
      logError('Tentativa de avançar com CPF inválido.');
      return;
    }
    
    setErrorMsg('');
    setStep(2);
  };

  // Another button to simulate a failed API call or error
  const handleSimulateError = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setErrorMsg('Erro de comunicação com a Receita Federal. Tente novamente mais tarde.');
      logError('Falha de comunicação com a API da Receita Federal (Simulado)');
    }, 1500);
  };

  const handleComplete = () => {
    if (!name) {
      setErrorMsg('Nome é obrigatório.');
      logError('Tentativa de concluir sem nome.');
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      completeTask(); // TTV marker hit!
      setTimeout(() => fetchCustomerData(), 500);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] font-sans text-gray-800 flex flex-col">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/sebrae')} className="text-gray-500 hover:text-gray-800 transition-colors">
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center">
              <div className="flex -space-x-1 mr-2">
                <div className="w-5 h-5 rounded-full bg-[#005AA5] mix-blend-multiply opacity-90"></div>
                <div className="w-5 h-5 rounded-full bg-[#00A859] mix-blend-multiply opacity-90"></div>
                <div className="w-5 h-5 rounded-full bg-[#FFB612] mix-blend-multiply opacity-90"></div>
              </div>
              <span className="font-bold text-lg text-[#005AA5]">Sebrae</span>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-500">Portal do Empreendedor</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 flex flex-col items-center">
        
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Progress Bar */}
          <div className="flex h-2 w-full bg-gray-100">
            <div className={`h-full bg-[#00A859] transition-all duration-500 ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
          </div>

          <div className="p-8 sm:p-10">
            {success ? (
              <div className="text-center py-4 animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Empresa aberta com sucesso!</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Parabéns! Seu processo de formalização foi concluído no Portal.
                </p>

                {!feedbackSent ? (
                  <div className="bg-[#F4F7FA] border border-gray-200/50 rounded-xl p-5 text-left mb-6 flex flex-col gap-4 animate-in slide-in-from-bottom-2 duration-300">
                    <div>
                      <h4 className="font-extrabold text-[#0E1B2B] text-xs uppercase tracking-wider mb-2">
                        Como foi sua experiência? (Avaliação Rápida)
                      </h4>
                      <p className="text-xs text-gray-500 mb-3">
                        Sua opinião ajuda o Sebrae a aprimorar seus canais de atendimento digital.
                      </p>
                      
                      <div className="flex items-center gap-1.5 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                          >
                            <Star
                              size={24}
                              className={
                                star <= (hoverRating || rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Comentário ou Crítica</label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Conte-nos o que funcionou ou o que deu errado..."
                        rows={3}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#005AA5] focus:border-[#005AA5] outline-none transition-all resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 mt-1">
                      <button
                        onClick={handleSendFeedback}
                        disabled={sendingFeedback || rating === 0}
                        className="flex-1 bg-[#00A859] hover:bg-[#008F4C] disabled:bg-gray-300 text-white py-2.5 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {sendingFeedback ? <Loader2 className="animate-spin" size={16} /> : 'Enviar Avaliação'}
                      </button>
                      <button
                        onClick={() => setFeedbackSent(true)}
                        className="text-xs text-gray-400 hover:text-gray-600 font-bold px-2 py-2"
                      >
                        Pular
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200/50 rounded-xl p-5 text-center mb-6 animate-in zoom-in duration-300">
                    <p className="text-green-800 text-sm font-bold">Obrigado! Sua opinião foi registrada com sucesso.</p>
                    <p className="text-green-600 text-xs mt-1">O time de Customer Experience (CX) irá analisar o seu relato.</p>
                  </div>
                )}

                <button 
                  onClick={() => navigate('/')}
                  className="bg-[#005AA5] hover:bg-[#004785] text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-md w-full"
                >
                  Voltar ao CRM Principal
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {step === 1 ? 'Identificação' : 'Dados da Empresa'}
                  </h2>
                  <p className="text-gray-500">
                    {step === 1 ? 'Informe seu CPF para iniciar o processo.' : 'Preencha os dados básicos para a formalização.'}
                  </p>
                </div>

                {errorMsg && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-start gap-3">
                    <AlertCircle className="text-red-500 mt-0.5" size={20} />
                    <p className="text-red-700 font-medium">{errorMsg}</p>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6 animate-in slide-in-from-left-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">CPF do Titular</label>
                      <input 
                        type="text" 
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        placeholder="000.000.000-00"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#005AA5] focus:border-[#005AA5] outline-none transition-all text-lg"
                      />
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <FileText size={12} /> Apenas números. Este botão pode "travar" propositalmente para simular fricção.
                      </p>
                    </div>

                    <div className="pt-4 flex gap-4">
                      <button 
                        onClick={handleSimulateError}
                        disabled={isSubmitting}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Validar Receita (Erro)'}
                      </button>
                      <button 
                        onClick={handleBuggyNextStep}
                        className="flex-1 bg-[#005AA5] hover:bg-[#004785] text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md active:scale-95"
                      >
                        Continuar
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Fantasia Sugerido</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Minha Empresa Inc."
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#005AA5] focus:border-[#005AA5] outline-none transition-all text-lg"
                      />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h4 className="font-semibold text-blue-800 mb-1">Dica de Sucesso</h4>
                      <p className="text-blue-600 text-sm">Ao clicar em "Concluir Abertura", o tempo total desde que você acessou a primeira página (TTV) será calculado e impresso no console.</p>
                    </div>

                    <div className="pt-4 flex gap-4">
                      <button 
                        onClick={() => { setStep(1); setErrorMsg(''); }}
                        className="px-6 py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-all"
                      >
                        Voltar
                      </button>
                      <button 
                        onClick={handleComplete}
                        disabled={isSubmitting}
                        className="flex-1 bg-[#00A859] hover:bg-[#008F4C] text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Concluir Abertura'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* SENSE Sandbox Simulator Dashboard (US 11H) */}
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mt-8 p-8 flex flex-col gap-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-200">
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 bg-indigo-500 rounded-full animate-pulse"></div>
              <div>
                <h3 className="font-extrabold text-[#0E1B2B] text-lg">Console de Simulação Sandbox (SENSE)</h3>
                <p className="text-xs text-gray-400 font-semibold">Simule a jornada do cliente João Santos, analise telemetria e gerencie alertas do CRM</p>
              </div>
            </div>
            
            <button
              onClick={handleResetSandbox}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex-shrink-0"
            >
              <RotateCcw size={14} />
              Reiniciar Sandbox
            </button>
          </div>

          {loadingCustomer && !customer ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="animate-spin text-[#005AA5]" size={32} />
            </div>
          ) : (
            <>
              {/* Row 1: Health Score (CHS) & Telemetry Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Score CHS Box (col-span 5) */}
                <div className="md:col-span-5 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 border border-gray-100 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Customer Health Score (CHS)</span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-4xl font-black text-[#0E1B2B] tracking-tight">{customer?.score ?? 0}</span>
                      <span className="text-sm font-bold text-gray-400">/ 100</span>
                    </div>
                    
                    {/* Status Pill */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide mt-3 ${
                      (customer?.score ?? 0) <= 40
                        ? 'bg-red-50 text-red-600 border border-red-100'
                        : (customer?.score ?? 0) <= 70
                        ? 'bg-yellow-50 text-yellow-600 border border-yellow-100'
                        : 'bg-green-50 text-green-600 border border-green-100'
                    }`}>
                      <Activity size={12} />
                      {customer?.status ?? 'Carregando...'}
                    </span>
                  </div>
                  
                  {/* Small sub-scores display */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-200/50 text-[10px] font-bold text-gray-400">
                    <div className="flex justify-between">
                      <span>Frequência:</span>
                      <span className="text-gray-700">{customer?.scores?.frequencia?.value ?? 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Progressão:</span>
                      <span className="text-gray-700">{customer?.scores?.progressao?.value ?? 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Retorno:</span>
                      <span className="text-gray-700">{customer?.scores?.retorno?.value ?? 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Engajamento:</span>
                      <span className="text-gray-700">{customer?.scores?.engajamento?.value ?? 0}%</span>
                    </div>
                  </div>
                </div>

                {/* Telemetry Metrics and Simulators (col-span 7) */}
                <div className="md:col-span-7 border border-gray-150 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Métricas de Fricção (Telemetria)</span>
                    <div className="grid grid-cols-3 gap-3 text-center mt-3">
                      <div className="bg-amber-50/50 border border-amber-100 p-2.5 rounded-xl flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-amber-700">Rage Clicks</span>
                        <span className="text-lg font-black text-amber-600 mt-0.5">{rageClicks}</span>
                      </div>
                      <div className="bg-red-50/50 border border-red-100 p-2.5 rounded-xl flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-red-700">Erros Críticos</span>
                        <span className="text-lg font-black text-red-500 mt-0.5">{errorsCount}</span>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-xl flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-gray-600">Saídas (Mouse Out)</span>
                        <span className="text-lg font-black text-gray-500 mt-0.5">{exitsCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <button
                      onClick={handleSimulateManualRageClick}
                      className="flex-1 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-250 rounded-xl text-[10px] font-bold transition-all cursor-pointer text-center"
                    >
                      Disparar Rage Click (US 3H)
                    </button>
                    <button
                      onClick={handleSimulateCriticalError}
                      className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-800 border border-red-250 rounded-xl text-[10px] font-bold transition-all cursor-pointer text-center"
                    >
                      Disparar Erro Nota (US 5H)
                    </button>
                  </div>
                </div>

              </div>

              {/* Row 2: active CRM alerts and simulation email opt-in inbox */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Active Alerts CRM Panel */}
                <div className="border border-gray-250 rounded-2xl p-5 flex flex-col">
                  <div className="flex items-center gap-1.5 mb-4 pb-2 border-b border-gray-100">
                    <AlertTriangle className="text-red-500" size={16} />
                    <span className="text-xs font-extrabold text-[#0E1B2B] uppercase tracking-wider">Alertas Ativos no CRM</span>
                  </div>

                  {activeAlerts.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center p-6 text-center text-xs text-gray-400 font-bold italic bg-gray-50 rounded-xl border border-gray-100/50">
                      Nenhum alerta ativo no momento.
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
                      {activeAlerts.map((a) => (
                        <div key={a.id} className="bg-red-50/20 border border-red-100/50 rounded-xl p-3 flex flex-col justify-between gap-2.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{a.category}</span>
                            <span className="text-xs font-extrabold text-gray-800 leading-tight">{a.reason}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleResolveAlert(a.id, 'resolved')}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-[9px] font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              ✓ Resolver
                            </button>
                            <button
                              onClick={() => handleResolveAlert(a.id, 'false_positive')}
                              className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white text-[9px] font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              ✗ Falso Positivo
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Email Inbox simulator (opt-in) */}
                <div className="border border-gray-250 rounded-2xl p-5 flex flex-col">
                  <div className="flex items-center gap-1.5 mb-4 pb-2 border-b border-gray-100">
                    <Mail className="text-[#005AA5]" size={16} />
                    <span className="text-xs font-extrabold text-[#0E1B2B] uppercase tracking-wider">Simulador de E-mails do Cliente (Opt-In)</span>
                  </div>

                  <div className="flex-1 flex flex-col gap-3 max-h-56 overflow-y-auto pr-1">
                    {(!customer?.processes || customer.processes.filter((p: any) => p.status !== 'finalizado').length === 0) ? (
                      <div className="flex-1 flex items-center justify-center p-6 text-center text-xs text-gray-400 font-bold italic bg-gray-50 rounded-xl border border-gray-100/50">
                        Nenhum email recebido. Abra uma nova reclamação abaixo.
                      </div>
                    ) : (
                      customer.processes.filter((p: any) => p.status !== 'finalizado').map((p: any) => (
                        <div key={p.id} className="border border-blue-100 rounded-xl p-3 bg-blue-50/20 flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-extrabold text-[#005AA5] uppercase tracking-wider">Confirmação: Caso {p.id}</span>
                            <span className="text-[9px] text-gray-400 font-bold">Agora</span>
                          </div>
                          <p className="text-[10.5px] text-gray-600 leading-relaxed font-semibold">
                            Olá João Santos, recebemos seu chamado: <em>"{p.title}"</em>. Ative as notificações automáticas de status.
                          </p>
                          <div className="mt-1">
                            {p.opt_in ? (
                              <span className="text-[9px] font-extrabold text-green-700 flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200 w-fit">
                                <Check size={12} /> Acompanhamento Ativo
                              </span>
                            ) : (
                              <button
                                onClick={() => handleOptIn(p.id)}
                                className="bg-[#005AA5] hover:bg-[#004785] text-white px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                              >
                                Autorizar Recebimento por E-mail
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Row 3: Suggestion / claim creation & Processes timeline updates */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Claims & Processes Editor (col-span 7) */}
                <div className="lg:col-span-7 border border-gray-250 rounded-2xl p-5 flex flex-col gap-4">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-gray-100">
                    <PlusCircle className="text-[#005AA5]" size={16} />
                    <span className="text-xs font-extrabold text-[#0E1B2B] uppercase tracking-wider">Central de Reclamações e Ouvidoria</span>
                  </div>

                  {/* Create claim form */}
                  <form onSubmit={handleCreateProcess} className="flex gap-2">
                    <input
                      type="text"
                      value={newProcessTitle}
                      onChange={(e) => setNewProcessTitle(e.target.value)}
                      placeholder="Ex: Instabilidade no credenciamento ou Erro no Certificado MEI..."
                      className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#005AA5] focus:border-[#005AA5] outline-none"
                    />
                    <button
                      type="submit"
                      disabled={submittingProcess || !newProcessTitle.trim()}
                      className="bg-[#005AA5] hover:bg-[#004785] disabled:bg-gray-200 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
                    >
                      {submittingProcess ? <Loader2 className="animate-spin" size={14} /> : <PlusCircle size={14} />}
                      Registrar
                    </button>
                  </form>

                  {/* Processes List and Agent Actions */}
                  <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1 mt-1">
                    {(!customer?.processes || customer.processes.length === 0) ? (
                      <p className="text-xs text-gray-400 font-semibold italic bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">Nenhum chamado aberto registrado.</p>
                    ) : (
                      customer.processes.map((p: any) => {
                        const isEditing = editingProcessId === p.id;
                        return (
                          <div key={p.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 flex flex-col gap-3">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex flex-col gap-1 min-w-0">
                                <span className="text-[11px] font-extrabold text-gray-800 leading-tight pr-2">{p.title}</span>
                                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                  <span className="text-[9px] font-bold bg-gray-250/60 text-gray-500 px-1.5 py-0.2 rounded-full">{p.id}</span>
                                  <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase border ${
                                    p.sla_status === 'atrasado'
                                      ? 'bg-red-50 text-red-500 border-red-150'
                                      : p.sla_status === 'atencao'
                                      ? 'bg-yellow-50 text-yellow-650 border-yellow-150'
                                      : p.sla_status === 'finalizado'
                                      ? 'bg-gray-100 text-gray-550 border-gray-150'
                                      : 'bg-green-50 text-green-600 border-green-150'
                                  }`}>
                                    {p.sla_status === 'atrasado'
                                      ? 'SLA: Estourado'
                                      : p.sla_status === 'atencao'
                                      ? 'SLA: Em Atenção'
                                      : p.sla_status === 'finalizado'
                                      ? 'SLA: Finalizado'
                                      : 'SLA: No Prazo'}
                                  </span>
                                  <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase border ${
                                    p.opt_in
                                      ? 'bg-blue-50 text-blue-600 border-blue-150'
                                      : 'bg-orange-50 text-orange-650 border-orange-150'
                                  }`}>
                                    {p.opt_in ? 'Notificações Ativas' : 'Sem Opt-in'}
                                  </span>
                                  {p.notes && (
                                    <span className="text-[9px] text-gray-500 font-medium italic truncate max-w-[120px]">Notes: {p.notes}</span>
                                  )}
                                </div>
                              </div>

                              {/* Progress Spheres & Edit Button */}
                              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                <div className="flex items-center gap-1">
                                  {p.dots.map((dotColor: 'green' | 'yellow' | 'gray', dIdx: number) => {
                                    const bgMap = {
                                      green: 'bg-green-500',
                                      yellow: 'bg-yellow-400',
                                      gray: 'bg-gray-300'
                                    };
                                    return (
                                      <div key={dIdx} className={`w-2.5 h-2.5 rounded-full ${bgMap[dotColor] || 'bg-gray-300'}`} />
                                    );
                                  })}
                                </div>
                                
                                {!isEditing && (
                                  <button
                                    onClick={() => {
                                      setEditingProcessId(p.id);
                                      setEditStatus(p.status);
                                      setEditNotes(p.notes || '');
                                    }}
                                    className="text-[9px] font-extrabold text-[#005AA5] hover:underline cursor-pointer"
                                  >
                                    Simular CRM Agente ↗
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Inline Agent Actions Panel */}
                            {isEditing && (
                              <div className="bg-white border border-gray-150 rounded-lg p-3 flex flex-col gap-2.5 animate-in slide-in-from-top-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Painel do Agente do CRM</span>
                                  <button onClick={() => setEditingProcessId(null)} className="text-[9px] font-bold text-gray-400 hover:text-gray-600 cursor-pointer">Cancelar</button>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-gray-600">Alterar Status:</span>
                                  <div className="flex gap-1.5">
                                    {['aberto', 'em_andamento', 'finalizado'].map((s) => (
                                      <button
                                        key={s}
                                        type="button"
                                        onClick={() => setEditStatus(s)}
                                        className={`px-2 py-1 text-[9px] font-bold rounded border uppercase cursor-pointer ${
                                          editStatus === s
                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                            : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'
                                        }`}
                                      >
                                        {s === 'aberto' ? 'Aberto' : s === 'em_andamento' ? 'Em Progresso' : 'Finalizado'}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex gap-1.5">
                                  <input
                                    type="text"
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    placeholder="Nota de resolução / observações..."
                                    className="flex-1 px-2.5 py-1.5 text-[10px] font-semibold border border-gray-300 rounded focus:ring-1 focus:ring-[#005AA5] outline-none"
                                  />
                                  <button
                                    onClick={() => handleUpdateProcessStatus(p.id)}
                                    disabled={updatingProcess}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center flex-shrink-0"
                                  >
                                    {updatingProcess ? <Loader2 className="animate-spin" size={12} /> : 'Salvar'}
                                  </button>
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Interactive Timeline View (col-span 5) */}
                <div className="lg:col-span-5 border border-gray-250 rounded-2xl p-5 flex flex-col gap-4">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-gray-100">
                    <Clock className="text-purple-500" size={16} />
                    <span className="text-xs font-extrabold text-[#0E1B2B] uppercase tracking-wider">Linha do Tempo (Eventos)</span>
                  </div>

                  <div className="flex-1 flex flex-col gap-3.5 max-h-80 overflow-y-auto pr-1 pl-1 py-1 relative">
                    {(!customer?.timeline || customer.timeline.length === 0) ? (
                      <div className="flex-1 flex items-center justify-center text-center text-xs text-gray-400 font-bold italic bg-gray-50 rounded-xl border border-gray-100/50">
                        Nenhum evento registrado.
                      </div>
                    ) : (
                      customer.timeline.map((event: any, idx: number) => {
                        let colorClass = 'bg-gray-100 text-gray-500 border-gray-200';
                        if (event.type === 'alert') {
                          colorClass = 'bg-red-50 text-red-600 border border-red-200';
                        } else if (event.type === 'check') {
                          colorClass = 'bg-green-50 text-green-700 border border-green-200';
                        } else if (event.type === 'eye') {
                          colorClass = 'bg-yellow-50 text-yellow-600 border border-yellow-250';
                        }
                        
                        return (
                          <div key={idx} className={`p-2.5 rounded-xl border text-[10px] leading-tight font-semibold ${colorClass} flex flex-col gap-1`}>
                            <span className="font-extrabold">{event.title}</span>
                            <span className="text-[8px] text-gray-400 font-bold self-end">{event.time}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* Row 4: Client feedback analysis history */}
              <div className="border border-gray-250 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-1.5 pb-2 border-b border-gray-100">
                  <MessageSquare className="text-amber-500" size={16} />
                  <span className="text-xs font-extrabold text-[#0E1B2B] uppercase tracking-wider">Histórico de Feedbacks & Análise de Sentimento (US 7H)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-56 overflow-y-auto pr-1">
                  {(!customer?.feedbacks || customer.feedbacks.length === 0) ? (
                    <div className="col-span-2 text-center py-8 text-gray-400 font-semibold text-xs bg-gray-50 rounded-xl border border-gray-100/50">
                      Nenhum feedback enviado por este cliente. Envie o formulário da tarefa para ver os dados.
                    </div>
                  ) : (
                    customer.feedbacks.map((fb: any) => (
                      <div key={fb.id} className="bg-gray-50 border border-gray-150 rounded-xl p-3 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={11}
                                className={s <= (fb.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          
                          <span className={`px-2 py-0.5 text-[8px] font-black rounded border ${
                            fb.sentiment === 'positive'
                              ? 'bg-green-50 text-green-600 border-green-200'
                              : fb.sentiment === 'negative'
                              ? 'bg-red-50 text-red-500 border-red-200'
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}>
                            {fb.sentiment === 'positive' ? 'POSITIVO' : fb.sentiment === 'negative' ? 'NEGATIVO' : 'NEUTRO'}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-700 leading-relaxed font-bold">"{fb.comment}"</p>
                        
                        {fb.response && (
                          <div className="mt-2 p-2.5 bg-purple-50/50 border-l-2 border-purple-400 rounded-r-lg flex flex-col gap-0.5">
                            <span className="text-[9px] font-extrabold text-purple-600 uppercase tracking-wide">Resposta do Sebrae:</span>
                            <p className="text-[11px] text-gray-600 font-medium leading-relaxed">{fb.response}</p>
                          </div>
                        )}

                        <span className="text-[9px] text-gray-400 font-bold self-end">
                          {new Date(fb.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

        </div>
        
        {!success && (
          <p className="mt-8 text-sm text-gray-500 bg-white/50 px-4 py-2 rounded-full border border-gray-200">
            Dica: Mova o mouse para fora da janela do navegador para acionar o alerta de <strong>Abandono</strong>.
          </p>
        )}
      </main>
    </div>
  );
}

