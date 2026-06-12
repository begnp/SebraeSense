import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTracker } from '../../hooks/useTracker';
import { 
  ArrowRight, BookOpen, Briefcase, TrendingUp, ChevronLeft, Play, 
  CheckCircle, Download, Calendar, Send, MessageSquare, Clock, 
  User, Check, Loader2, AlertTriangle
} from 'lucide-react';

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export function MiniSebraeHome() {
  const navigate = useNavigate();
  const { completeTask, logError } = useTracker({ pageName: 'Mini Sebrae - Portal de Serviços' });

  // State-controlled sub-view: 'home' | 'cursos' | 'ideias' | 'consultoria' | 'especialista'
  const [view, setView] = useState<'home' | 'cursos' | 'ideias' | 'consultoria' | 'especialista'>('home');

  // Cursos States
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<'success' | 'failed' | null>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [simulatingError, setSimulatingError] = useState(false);

  // Ideias States
  const [selectedIdea, setSelectedIdea] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Consultoria States
  const [consultingSubject, setConsultingSubject] = useState('Finanças');
  const [fullName, setFullName] = useState('João Santos');
  const [document, setDocument] = useState('123.456.789-00');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('14:00');
  const [messageText, setMessageText] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Especialista States
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'bot', text: 'Olá! Sou o assistente virtual do Sebrae. Como posso apoiar você e o seu negócio hoje?', time: '17:21' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // 1. Course details
  const coursesList = [
    {
      id: 1,
      title: 'Gestão Financeira para MEI',
      desc: 'Aprenda a organizar seu fluxo de caixa, precificar seus serviços e planejar seu capital de giro.',
      duration: '4 horas',
      modules: 5,
      questions: [
        { id: 1, q: 'O que é Fluxo de Caixa?', opts: ['Dinheiro guardado no cofre', 'Registro de todas as entradas e saídas financeiras', 'Dívidas futuras que a empresa possui'], ans: 'Registro de todas as entradas e saídas financeiras' },
        { id: 2, q: 'O que representa o Capital de Giro?', opts: ['O valor do empréstimo bancário', 'Recursos necessários para sustentar a operação diária', 'O lucro anual final da empresa'], ans: 'Recursos necessários para sustentar a operação diária' }
      ]
    },
    {
      id: 2,
      title: 'Marketing Digital e Redes Sociais',
      desc: 'Como usar Instagram, WhatsApp e anúncios pagos para atrair e fidelizar clientes da sua região.',
      duration: '6 horas',
      modules: 4,
      questions: [
        { id: 1, q: 'Qual a principal vantagem da Persona no Marketing?', opts: ['Segmentar os anúncios para o público ideal', 'Gastar menos papel em panfletos', 'Ter mais seguidores fantasmas'], ans: 'Segmentar os anúncios para o público ideal' },
        { id: 2, q: 'Qual ferramenta de comunicação é ideal para atendimento imediato e fechamento de vendas?', opts: ['E-mail institucional', 'WhatsApp Business', 'Outdoor comercial'], ans: 'WhatsApp Business' }
      ]
    },
    {
      id: 3,
      title: 'Tributação e MEI Descomplicado',
      desc: 'Entenda os impostos da DAS, regras de faturamento e como emitir notas fiscais sem complicação.',
      duration: '3 horas',
      modules: 3,
      questions: [
        { id: 1, q: 'Qual o faturamento anual máximo permitido do MEI?', opts: ['R$ 81.000', 'R$ 120.000', 'R$ 45.000'], ans: 'R$ 81.000' },
        { id: 2, q: 'O pagamento mensal da guia DAS inclui o quê?', opts: ['Apenas imposto de renda PJ', 'Previdência Social (INSS), ICMS e/ou ISS unificados', 'Apenas a taxa de alvará municipal'], ans: 'Previdência Social (INSS), ICMS e/ou ISS unificados' }
      ]
    }
  ];

  // 2. Business ideas
  const businessIdeas = [
    { id: 1, title: 'Hamburgueria Artesanal Delivery', investment: 'R$ 25.000 a R$ 40.000', payback: '12 a 18 meses', profitability: '20%', structure: 'Cozinha comercial equipada, sistema de delivery e embalagens térmicas.' },
    { id: 2, title: 'Loja Virtual de Roupas e Acessórios', investment: 'R$ 5.000 a R$ 12.000', payback: '6 a 12 meses', profitability: '25%', structure: 'Plataforma e-commerce, estoque de produtos, estúdio de fotos e convênio com Correios.' },
    { id: 3, title: 'Consultoria de Tecnologia e Suporte', investment: 'R$ 2.000 a R$ 5.000', payback: '3 a 6 meses', profitability: '45%', structure: 'Computador potente, softwares de diagnóstico e conexões remotas seguras.' },
    { id: 4, title: 'Pet Shop Móvel / Banho e Tosa', investment: 'R$ 45.000 a R$ 70.000', payback: '18 a 24 meses', profitability: '18%', structure: 'Veículo adaptado com reservatório de água, sopradores e banheira pet.' }
  ];

  const handleStartTask = () => {
    navigate('/sebrae/tarefa');
  };

  const handleStartCourse = (id: number) => {
    setSelectedCourse(id);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
    setIsPlayingVideo(false);
  };

  const handleQuizAnswer = (qId: number, option: string) => {
    setQuizAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleSubmitQuiz = () => {
    const course = coursesList.find(c => c.id === selectedCourse);
    if (!course) return;

    let isCorrect = true;
    course.questions.forEach(q => {
      if (quizAnswers[q.id] !== q.ans) {
        isCorrect = false;
      }
    });

    setQuizSubmitted(true);
    if (isCorrect) {
      setQuizResult('success');
      completeTask();
    } else {
      setQuizResult('failed');
    }
  };

  const handleSimulateVideoError = () => {
    setSimulatingError(true);
    setTimeout(() => {
      logError('Falha no streaming do vídeo (Timeout de Conexão - HTTP 504)');
      setSimulatingError(false);
      alert('Simulação disparada! Um erro de carregamento foi logado na telemetria.');
    }, 1200);
  };

  const handleDownloadIdeaPdf = () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          completeTask();
          alert('Download concluído com sucesso! Plano de negócios enviado para telemetria.');
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  const handleScheduleConsulting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) {
      alert('Selecione uma data para o agendamento.');
      return;
    }

    setIsBooking(true);
    try {
      // Registers a process directly on the CRM database for user João Santos (ID 1)
      const res = await fetch('http://localhost:8000/api/customers/1/processes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Consultoria Agendada: ${consultingSubject} (Dia ${bookingDate.split('-').reverse().join('/')} às ${bookingTime})`
        })
      });

      if (res.ok) {
        setBookingSuccess(true);
        completeTask();
      } else {
        alert('Erro ao registrar agendamento no servidor.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao realizar agendamento.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      sender: 'user',
      text: chatInput,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const inputClean = chatInput.toLowerCase().trim();
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = 'Entendi! O Sebrae está sempre pronto para orientar você. Deseja agendar uma consultoria gratuita ou conferir nossos cursos?';
      
      if (inputClean.includes('mei') || inputClean.includes('abrir')) {
        botResponse = 'Para abrir um MEI é rápido! O processo é gratuito e você ganha benefícios como CNPJ, emissão de nota fiscal de serviços e previdência social. Experimente nosso assistente de formalização clicando em "Abrir minha empresa" no menu principal.';
      } else if (inputClean.includes('credito') || inputClean.includes('crédito') || inputClean.includes('dinheiro') || inputClean.includes('financia')) {
        botResponse = 'O Sebrae ajuda você a obter crédito com garantia pelo FAMPE. Recomendo preencher o formulário de Consultoria Financeira para recebermos o seu contato!';
      } else if (inputClean.includes('imposto') || inputClean.includes('pagar') || inputClean.includes('das')) {
        botResponse = 'O MEI paga um imposto único chamado DAS, que unifica INSS, ICMS e ISS. O valor fica em torno de R$ 70 a R$ 80 mensais. Mantenha os pagamentos em dia para garantir seus benefícios!';
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
      completeTask();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] font-sans text-gray-800 flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#005AA5] mix-blend-multiply opacity-90"></div>
                <div className="w-8 h-8 rounded-full bg-[#00A859] mix-blend-multiply opacity-90"></div>
                <div className="w-8 h-8 rounded-full bg-[#FFB612] mix-blend-multiply opacity-90"></div>
              </div>
              <span className="font-bold text-2xl tracking-tight text-[#005AA5] ml-2">Sebrae</span>
            </div>

            {/* Nav Menu */}
            <div className="hidden md:flex space-x-8">
              <button 
                onClick={() => setView('cursos')} 
                className={`font-semibold transition-colors cursor-pointer ${view === 'cursos' ? 'text-[#005AA5] border-b-2 border-[#005AA5]' : 'text-gray-600 hover:text-[#005AA5]'}`}
              >
                Cursos
              </button>
              <button 
                onClick={() => setView('ideias')} 
                className={`font-semibold transition-colors cursor-pointer ${view === 'ideias' ? 'text-[#005AA5] border-b-2 border-[#005AA5]' : 'text-gray-600 hover:text-[#005AA5]'}`}
              >
                Ideias de Negócios
              </button>
              <button 
                onClick={() => setView('consultoria')} 
                className={`font-semibold transition-colors cursor-pointer ${view === 'consultoria' ? 'text-[#005AA5] border-b-2 border-[#005AA5]' : 'text-gray-600 hover:text-[#005AA5]'}`}
              >
                Consultoria
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setView('especialista')}
                className="hidden lg:flex bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-bold text-xs transition-colors items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare size={14} className="text-[#005AA5]" />
                Falar com Especialista
              </button>
              <button 
                onClick={handleStartTask}
                className="bg-[#005AA5] hover:bg-[#004785] text-white px-5 py-2.5 rounded-lg font-bold text-xs transition-all transform hover:scale-105 shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <User size={14} />
                Abrir minha empresa
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Main Content Render */}
      <div className="flex-1">

        {/* 1. VIEW HOME */}
        {view === 'home' && (
          <main>
            <div className="relative bg-gradient-to-br from-[#005AA5] to-[#003B6D] text-white overflow-hidden">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-5 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#00A859] opacity-20 blur-3xl"></div>
              
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
                <div className="max-w-3xl">
                  <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                    O parceiro <span className="text-[#FFB612]">número 1</span> dos micro e pequenos negócios.
                  </h1>
                  <p className="text-xl md:text-2xl mb-10 text-blue-100 font-light max-w-2xl">
                    Tudo o que você precisa para abrir, administrar e crescer a sua empresa em um só lugar.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={handleStartTask}
                      className="bg-[#FFB612] hover:bg-[#E5A310] text-[#003B6D] px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Abrir minha empresa <ArrowRight size={20} />
                    </button>
                    <button 
                      onClick={() => setView('especialista')}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center cursor-pointer"
                    >
                      Falar com especialista
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Services Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 -mt-32 relative z-20">
                {[
                  { icon: Briefcase, title: 'Formalização', desc: 'Abra seu MEI de forma rápida, fácil e gratuita.', color: 'text-[#005AA5]', bg: 'bg-blue-50', action: () => handleStartTask() },
                  { icon: BookOpen, title: 'Capacitação', desc: 'Cursos online gratuitos com certificado Sebrae.', color: 'text-[#00A859]', bg: 'bg-green-50', action: () => setView('cursos') },
                  { icon: TrendingUp, title: 'Consultoria', desc: 'Soluções e orientações financeiras ou de impostos.', color: 'text-[#FFB612]', bg: 'bg-yellow-50', action: () => setView('consultoria') },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-xl p-8 transition-transform hover:-translate-y-2 border border-gray-100 flex flex-col items-start cursor-pointer" onClick={item.action}>
                    <div className={`p-4 rounded-2xl ${item.bg} mb-6`}>
                      <item.icon className={`w-8 h-8 ${item.color}`} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">{item.title}</h3>
                    <p className="text-gray-650 leading-relaxed mb-6 flex-1">{item.desc}</p>
                    <span className="text-[#005AA5] font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                      Saiba mais <ArrowRight size={16} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </main>
        )}

        {/* 2. VIEW CURSOS */}
        {view === 'cursos' && (
          <div className="max-w-5xl mx-auto px-4 py-12">
            {selectedCourse === null ? (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-extrabold text-[#005AA5]">Cursos de Capacitação Sebrae</h2>
                  <p className="text-gray-500 text-sm mt-1">Capacite-se gratuitamente e melhore os indicadores de sucesso da sua empresa.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {coursesList.map((course) => (
                    <div key={course.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-6 hover:shadow-md transition-all">
                      <div className="flex flex-col gap-3">
                        <span className="text-[10px] font-black text-[#00A859] uppercase tracking-wider bg-green-50 border border-green-200 px-2.5 py-0.5 rounded w-fit">
                          Curso Online
                        </span>
                        <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
                        <p className="text-xs text-gray-600 leading-relaxed">{course.desc}</p>
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between text-[11px] text-gray-400 font-bold border-t border-gray-100 pt-3">
                          <span className="flex items-center gap-1"><Clock size={12} /> {course.duration}</span>
                          <span className="flex items-center gap-1"><BookOpen size={12} /> {course.modules} módulos</span>
                        </div>
                        <button
                          onClick={() => handleStartCourse(course.id)}
                          className="w-full py-2.5 bg-[#005AA5] hover:bg-[#004785] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                        >
                          Iniciar Curso
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              // Selected Course class simulation
              (() => {
                const course = coursesList.find(c => c.id === selectedCourse);
                if (!course) return null;
                return (
                  <div className="flex flex-col gap-6">
                    <button 
                      onClick={() => setSelectedCourse(null)}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#005AA5] hover:underline cursor-pointer"
                    >
                      <ChevronLeft size={16} /> Voltar aos cursos
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      
                      {/* Left: Video Player and Quiz */}
                      <div className="lg:col-span-8 flex flex-col gap-6">
                        
                        {/* Video Player Box */}
                        <div className="bg-[#172535] rounded-2xl overflow-hidden aspect-video relative flex flex-col items-center justify-center text-white border border-gray-800">
                          {isPlayingVideo ? (
                            <div className="w-full h-full flex flex-col justify-between p-4 bg-black/60 relative">
                              {/* Video placeholder display */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-0 flex items-center justify-center">
                                <Loader2 className="animate-spin text-[#FFB612] mr-2" size={32} />
                                <span className="font-extrabold text-sm tracking-wide">Assistindo: Aula 1 - Conceitos Fundamentais</span>
                              </div>
                              
                              <div className="z-10 text-[10px] bg-red-600 px-2 py-0.5 rounded font-black w-fit uppercase">Simulação Telemetria</div>
                              
                              <div className="z-10 flex flex-col gap-2 w-full mt-auto">
                                <div className="h-1 bg-white/20 w-full rounded overflow-hidden">
                                  <div className="h-full bg-[#FFB612] w-1/3" />
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-gray-300 font-bold">
                                  <span>03:22 / 12:00</span>
                                  <button
                                    onClick={handleSimulateVideoError}
                                    disabled={simulatingError}
                                    className="px-2.5 py-1 bg-red-700 hover:bg-red-800 disabled:bg-gray-700 text-white font-extrabold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <AlertTriangle size={10} />
                                    {simulatingError ? 'Simulando...' : 'Simular Erro Vídeo'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button 
                                onClick={() => setIsPlayingVideo(true)}
                                className="w-16 h-16 rounded-full bg-[#FFB612] text-[#0E1B2B] hover:scale-105 active:scale-95 transition-transform flex items-center justify-center cursor-pointer shadow-lg shadow-[#FFB612]/20"
                              >
                                <Play size={28} className="fill-[#0E1B2B] ml-1" />
                              </button>
                              <span className="text-xs font-bold text-gray-400 mt-4">Clique para iniciar a videoaula</span>
                            </>
                          )}
                        </div>

                        {/* Quiz Form Card */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col gap-6">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                              <CheckCircle className="text-[#00A859]" size={20} />
                              Quiz de Avaliação de Módulo
                            </h4>
                            <p className="text-xs text-gray-400 mt-0.5">Responda corretamente para concluir o curso e gerar os logs de telemetria.</p>
                          </div>

                          <div className="flex flex-col gap-6 border-t border-gray-100 pt-5">
                            {course.questions.map((item, idx) => (
                              <div key={item.id} className="flex flex-col gap-3">
                                <p className="text-xs font-extrabold text-gray-800">{idx + 1}. {item.q}</p>
                                <div className="grid grid-cols-1 gap-2">
                                  {item.opts.map((opt) => {
                                    const isSelected = quizAnswers[item.id] === opt;
                                    return (
                                      <button
                                        key={opt}
                                        onClick={() => handleQuizAnswer(item.id, opt)}
                                        disabled={quizSubmitted && quizResult === 'success'}
                                        className={`text-left p-3.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                          isSelected
                                            ? 'bg-blue-50 border-[#005AA5] text-[#005AA5] font-bold shadow-sm'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Submit Action */}
                          {quizResult === 'success' ? (
                            <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center gap-3 text-green-700">
                              <CheckCircle size={20} />
                              <div className="text-xs">
                                <p className="font-extrabold">Parabéns! Quiz concluído com 100% de acerto.</p>
                                <p className="font-medium text-green-600/90 mt-0.5">O curso foi finalizado e os dados de telemetria de progressão foram sincronizados.</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3">
                              {quizResult === 'failed' && (
                                <div className="bg-red-50 border border-red-200 p-4.5 rounded-xl flex items-center gap-3 text-red-700">
                                  <AlertTriangle size={18} className="flex-shrink-0" />
                                  <span className="text-xs font-extrabold">Alguma resposta está incorreta. Revise suas escolhas e tente novamente.</span>
                                </div>
                              )}
                              <button
                                onClick={handleSubmitQuiz}
                                disabled={course.questions.some(q => !quizAnswers[q.id])}
                                className="w-full py-3 bg-[#00A859] hover:bg-[#008f4b] disabled:bg-gray-200 text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                              >
                                Enviar Respostas
                              </button>
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Right: Sidebar module list */}
                      <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-4">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ementa do Curso</span>
                        <div className="flex flex-col gap-2">
                          {[1, 2, 3, 4, 5].slice(0, course.modules).map((mIdx) => (
                            <div 
                              key={mIdx} 
                              className={`p-3 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
                                mIdx === 1 
                                  ? 'border-[#005AA5]/30 bg-blue-50/30 text-[#005AA5]' 
                                  : 'border-gray-100 bg-gray-50/50 text-gray-400'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                mIdx === 1 ? 'bg-[#005AA5] text-white' : 'bg-gray-200 text-gray-400'
                              }`}>
                                {mIdx}
                              </div>
                              <span>Módulo {mIdx}: {mIdx === 1 ? 'Conceitos Iniciais' : 'Prática e Exercícios'}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* 3. VIEW IDEIAS */}
        {view === 'ideias' && (
          <div className="max-w-5xl mx-auto px-4 py-12 flex flex-col gap-8">
            {selectedIdea === null ? (
              <>
                <div>
                  <h2 className="text-3xl font-extrabold text-[#005AA5]">Ideias de Negócios</h2>
                  <p className="text-gray-500 text-sm mt-1">Explore modelos de negócios estruturados pelo Sebrae para inspirar sua jornada.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {businessIdeas.map((idea) => (
                    <div 
                      key={idea.id} 
                      onClick={() => setSelectedIdea(idea.id)}
                      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md cursor-pointer transition-all flex justify-between items-start gap-4"
                    >
                      <div className="flex flex-col gap-3 flex-1 min-w-0">
                        <h3 className="text-base font-extrabold text-[#0E1B2B] truncate">{idea.title}</h3>
                        <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                          <p><strong>Investimento Médio:</strong> {idea.investment}</p>
                          <p><strong>Payback Estimado:</strong> {idea.payback}</p>
                        </div>
                      </div>
                      <span className="text-[#005AA5] text-xs font-bold flex items-center gap-0.5 hover:underline whitespace-nowrap self-end flex-shrink-0">
                        Ver Plano →
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              (() => {
                const idea = businessIdeas.find(i => i.id === selectedIdea);
                if (!idea) return null;
                return (
                  <div className="flex flex-col gap-6">
                    <button 
                      onClick={() => setSelectedIdea(null)}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#005AA5] hover:underline cursor-pointer"
                    >
                      <ChevronLeft size={16} /> Voltar às ideias
                    </button>

                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col gap-6">
                      <div className="border-b border-gray-100 pb-4">
                        <h3 className="text-2xl font-extrabold text-[#0E1B2B]">{idea.title}</h3>
                        <p className="text-xs text-gray-400 mt-1">Estrutura operacional e financeira estimada para implantação da empresa.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50 flex flex-col gap-1">
                          <span className="text-[10px] font-black text-gray-400 uppercase">Investimento Mínimo</span>
                          <span className="text-lg font-bold text-[#005AA5]">{idea.investment}</span>
                        </div>
                        <div className="bg-green-50/50 rounded-xl p-4 border border-green-100/50 flex flex-col gap-1">
                          <span className="text-[10px] font-black text-gray-400 uppercase">Prazo de Retorno</span>
                          <span className="text-lg font-bold text-[#00A859]">{idea.payback}</span>
                        </div>
                        <div className="bg-yellow-50/40 rounded-xl p-4 border border-yellow-250/30 flex flex-col gap-1">
                          <span className="text-[10px] font-black text-gray-400 uppercase">Rentabilidade</span>
                          <span className="text-lg font-bold text-yellow-700">{idea.profitability}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <h4 className="text-sm font-bold text-[#0E1B2B] uppercase tracking-wider">Estrutura Operacional Necessária</h4>
                        <p className="text-xs text-gray-650 leading-relaxed font-semibold bg-gray-50 p-4 rounded-xl border border-gray-100">{idea.structure}</p>
                      </div>

                      {/* Download PDF Simulator */}
                      <div className="border-t border-gray-150 pt-5 mt-2 flex flex-col gap-4">
                        {isDownloading ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold">
                              <span>Fazendo download do Plano completo (PDF)...</span>
                              <span>{downloadProgress}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden w-full">
                              <div className="h-full bg-[#005AA5] transition-all duration-300" style={{ width: `${downloadProgress}%` }} />
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={handleDownloadIdeaPdf}
                            className="bg-[#005AA5] hover:bg-[#004785] text-white px-6 py-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-blue-100"
                          >
                            <Download size={14} />
                            Baixar Plano de Negócios Completo (PDF)
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* 4. VIEW CONSULTORIA */}
        {view === 'consultoria' && (
          <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col gap-8">
            <div>
              <h2 className="text-3xl font-extrabold text-[#005AA5]">Consultoria Especializada Sebrae</h2>
              <p className="text-gray-500 text-sm mt-1">Agende uma sessão gratuita de 1 hora com um especialista para tirar dúvidas de gestão.</p>
            </div>

            {bookingSuccess ? (
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center flex flex-col items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-green-50 text-[#00A859] flex items-center justify-center border border-green-200">
                  <Check size={36} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Agendamento Solicitado!</h3>
                  <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
                    Sua solicitação de consultoria para o tema <strong>{consultingSubject}</strong> no dia <strong>{bookingDate.split('-').reverse().join('/')}</strong> foi registrada no CRM como uma ocorrência operacional e o evento foi gravado.
                  </p>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      setBookingSuccess(false);
                      setBookingDate('');
                      setView('home');
                    }}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-205 text-gray-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Voltar para Home
                  </button>
                  <button
                    onClick={() => {
                      setBookingSuccess(false);
                      setBookingDate('');
                    }}
                    className="px-5 py-2.5 bg-[#005AA5] hover:bg-[#004785] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Agendar Outra
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleScheduleConsulting} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Name field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-250 focus:ring-1 focus:ring-[#005AA5] outline-none"
                    />
                  </div>

                  {/* Document field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase">CPF ou CNPJ</label>
                    <input
                      type="text"
                      required
                      value={document}
                      onChange={(e) => setDocument(e.target.value)}
                      className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-250 focus:ring-1 focus:ring-[#005AA5] outline-none"
                    />
                  </div>

                </div>

                {/* Subject / expertise */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Tema de Interesse</label>
                  <select
                    value={consultingSubject}
                    onChange={(e) => setConsultingSubject(e.target.value)}
                    className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-250 bg-white focus:ring-1 focus:ring-[#005AA5] outline-none"
                  >
                    <option value="Finanças">Gestão Financeira & Capital de Giro</option>
                    <option value="Impostos">Tributação Simplificada (DAS/MEI)</option>
                    <option value="Marketing">Marketing Digital & Canais Digitais</option>
                    <option value="Abertura">Processo de Abertura & Legalização</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Date field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Data</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-250 focus:ring-1 focus:ring-[#005AA5] outline-none"
                    />
                  </div>

                  {/* Time field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Horário</label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-250 bg-white focus:ring-1 focus:ring-[#005AA5] outline-none"
                    >
                      <option value="09:00">09:00</option>
                      <option value="11:00">11:00</option>
                      <option value="14:00">14:00</option>
                      <option value="16:00">16:00</option>
                    </select>
                  </div>
                </div>

                {/* Main message */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase font-sans">Dúvida Principal</label>
                  <textarea
                    rows={3}
                    placeholder="Descreva brevemente o seu principal desafio de negócio..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="px-3 py-2.5 text-xs font-semibold rounded-lg border border-gray-250 focus:ring-1 focus:ring-[#005AA5] outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isBooking}
                  className="mt-2 w-full py-3 bg-[#005AA5] hover:bg-[#004785] disabled:bg-gray-200 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-blue-100"
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Agendando...
                    </>
                  ) : (
                    <>
                      <Calendar size={14} />
                      Agendar Consultoria Gratuita
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* 5. VIEW ESPECIALISTA CHAT */}
        {view === 'especialista' && (
          <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden flex flex-col h-[550px] animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Chat Header */}
              <div className="bg-[#005AA5] p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/10 font-bold text-sm">
                    EX
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-extrabold leading-tight">Especialista Sebrae</span>
                    <span className="text-[10px] opacity-75 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                      Online • Apoio ao MEI
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setView('home')}
                  className="text-white/80 hover:text-white text-xs font-bold cursor-pointer"
                >
                  Sair do Chat
                </button>
              </div>

              {/* Chat Messages list */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
                {messages.map((m) => {
                  const isUser = m.sender === 'user';
                  return (
                    <div 
                      key={m.id}
                      className={`flex flex-col max-w-[80%] rounded-2xl p-3.5 shadow-sm text-xs font-semibold ${
                        isUser 
                          ? 'bg-[#EBF5F0] border border-green-100 text-gray-800 self-end rounded-tr-none' 
                          : 'bg-white border border-gray-150 text-gray-800 self-start rounded-tl-none'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                      <span className="text-[9px] text-gray-400 font-bold mt-1 self-end">{m.time}</span>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="bg-white border border-gray-150 text-gray-800 rounded-2xl rounded-tl-none p-3 shadow-sm self-start flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
              </div>

              {/* Chat Input panel */}
              <div className="p-3 bg-white border-t border-gray-200 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                  placeholder="Escreva sua pergunta (Ex: Como funciona o imposto do mei?)..."
                  className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 outline-none focus:border-[#005AA5]"
                />
                <button
                  onClick={handleSendChatMessage}
                  disabled={!chatInput.trim() || isTyping}
                  className="bg-[#005AA5] hover:bg-[#004785] disabled:bg-gray-150 text-white p-2.5 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
