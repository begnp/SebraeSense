import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTracker } from '../../hooks/useTracker';
import { CheckCircle2, AlertCircle, FileText, ChevronLeft, Loader2, Star } from 'lucide-react';

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

  const handleSendFeedback = async () => {
    setSendingFeedback(true);
    try {
      const response = await fetch('http://localhost:8000/api/customers/1/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment, rating })
      });
      if (response.ok) {
        setFeedbackSent(true);
      }
    } catch (err) {
      console.error('Erro ao enviar feedback:', err);
    } finally {
      setSendingFeedback(false);
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
        
        {!success && (
          <p className="mt-8 text-sm text-gray-500 bg-white/50 px-4 py-2 rounded-full border border-gray-200">
            Dica: Mova o mouse para fora da janela do navegador para acionar o alerta de <strong>Abandono</strong>.
          </p>
        )}
      </main>
    </div>
  );
}
