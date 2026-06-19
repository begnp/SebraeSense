import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { User, Loader2 } from 'lucide-react';

interface PrioritizedCustomer {
  id: number;
  name: string;
  company: string;
  current_chs: number;
  status: string;
  alerts_count: number;
  last_contact_str: string;
  priority_group: number;
}

const fallbackCustomers: PrioritizedCustomer[] = [
  {
    id: 1,
    name: 'João Santos',
    company: 'Padaria Estrela',
    current_chs: 28,
    status: 'Parou de acessar após travar na jornada de crédito',
    alerts_count: 2,
    last_contact_str: 'Hoje, 14h02',
    priority_group: 1
  },
  {
    id: 2,
    name: 'Clara Mendes',
    company: 'Artesanato CM',
    current_chs: 35,
    status: 'Abandonou curso crítico a 58% de conclusão',
    alerts_count: 2,
    last_contact_str: 'Ontem, 08h55',
    priority_group: 1
  },
  {
    id: 3,
    name: 'Maria Silva',
    company: 'Padaria Estrela',
    current_chs: 44,
    status: 'Acesso oscilando: demorou 3x mais que o esperado numa tarefa simples',
    alerts_count: 1,
    last_contact_str: 'Ontem, 19h04',
    priority_group: 2
  },
  {
    id: 4,
    name: 'Ana Costa',
    company: 'Doces da Ana',
    current_chs: 53,
    status: 'Frequência de acesso caiu 40% na última semana',
    alerts_count: 1,
    last_contact_str: 'Hoje, 14h02',
    priority_group: 2
  },
  {
    id: 5,
    name: 'Ana Costa',
    company: 'Doces da Ana',
    current_chs: 53,
    status: 'Frequência de acesso caiu 40% na última semana',
    alerts_count: 1,
    last_contact_str: 'Hoje, 14h02',
    priority_group: 2
  }
];

export function PriorityQueuePage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<PrioritizedCustomer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPrioritizedCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/customers/prioritized');
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setCustomers(data);
        } else {
          setCustomers(fallbackCustomers);
        }
      } else {
        setCustomers(fallbackCustomers);
      }
    } catch (err) {
      console.error('Erro ao buscar fila priorizada:', err);
      setCustomers(fallbackCustomers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrioritizedCustomers();
  }, []);

  return (
    <MainLayout>
      <div className="font-sans flex-1 flex flex-col h-full">
        <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_4px_32px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col flex-1 min-h-0">
          
          <div className="mb-10">
            <h2 className="text-[26px] font-extrabold text-[#0E1B2B] tracking-tight">Fila Priorizada</h2>
            <p className="text-[15px] font-semibold text-[#0E1B2B] mt-0.5">Por ordem de atendimento</p>
          </div>

          <div className="hidden lg:grid grid-cols-12 gap-4 mb-4 px-6">
            <div className="col-span-4">
              <span className="bg-[#8B6EBB] text-white text-[13px] font-bold px-5 py-2 rounded-full">Cliente</span>
            </div>
            <div className="col-span-4">
              <span className="bg-[#8B6EBB] text-white text-[13px] font-bold px-5 py-2 rounded-full">Situação atual</span>
            </div>
            <div className="col-span-4">
              <span className="bg-[#8B6EBB] text-white text-[13px] font-bold px-5 py-2 rounded-full">Última atividade</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-4">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-[#6B4C9A]" size={48} />
              </div>
            ) : (
              customers.map((c, index) => {
                const getSubtext = () => {
                  if (c.status.includes('jornada de crédito')) return '3 buscas por linha de crédito';
                  if (c.status.includes('curso')) return 'Saiu do módulo 4 sem salvar';
                  if (c.status.includes('Acesso oscilando')) return 'Página "Plano de negócios"';
                  return 'Login sem interação';
                };

                return (
                  <div 
                    key={`${c.id}-${index}`} 
                    className="bg-[#E4F8F4] rounded-[24px] p-4 flex flex-col lg:grid lg:grid-cols-12 gap-6 items-center shadow-sm border border-transparent hover:border-gray-200 transition-all"
                  >
                    {/* Cliente */}
                    <div className="col-span-4 flex items-center justify-between w-full lg:pr-8">
                      <div className="flex items-center gap-4">
                        <div className="w-[52px] h-[52px] rounded-full bg-[#EAE5F3] flex items-center justify-center text-[#8B6EBB] shadow-inner flex-shrink-0">
                          <User size={26} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h3 className="text-[16px] font-extrabold text-[#0E1B2B] truncate">{c.name}</h3>
                          <p className="text-[12px] font-semibold text-gray-500 truncate">{c.company}</p>
                        </div>
                      </div>
                      
                      {/* Circular Progress */}
                      <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path stroke="#D1E5E0" strokeWidth="3.5" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path 
                            stroke={c.priority_group === 1 ? '#EF4444' : '#EAB308'} 
                            strokeWidth="3.5" 
                            strokeLinecap="round"
                            strokeDasharray={`${c.current_chs}, 100`} 
                            fill="none" 
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                          />
                        </svg>
                        <span className="absolute text-[11px] font-extrabold text-[#0E1B2B]">{c.current_chs}%</span>
                      </div>
                    </div>

                    {/* Situação Atual */}
                    <div className="col-span-4 flex flex-col gap-2.5 w-full">
                      <p className="text-[13px] font-extrabold text-[#0E1B2B] leading-snug pr-4">{c.status}</p>
                      <div className="flex gap-2 flex-wrap">
                        <span className="bg-[#FBE2C6] text-[#C17A2A] text-[10px] font-extrabold px-3 py-1 rounded-full border border-[#C17A2A]/10 uppercase tracking-wide">
                          {c.priority_group === 1 ? 'Queda de frequência' : 'Aumento de esforço'}
                        </span>
                        {c.priority_group === 1 && c.id === 1 && (
                          <span className="bg-[#FCD8D4] text-[#D34135] text-[10px] font-extrabold px-3 py-1 rounded-full border border-[#D34135]/10 uppercase tracking-wide">
                            Jornada interrompida
                          </span>
                        )}
                        {c.priority_group === 1 && c.id === 2 && (
                          <span className="bg-[#F9EDC7] text-[#B89B2B] text-[10px] font-extrabold px-3 py-1 rounded-full border border-[#B89B2B]/10 uppercase tracking-wide">
                            Queda de Score
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Última Atividade */}
                    <div className="col-span-2 flex flex-col gap-1 w-full lg:pl-2">
                      <p className="text-[13px] font-extrabold text-[#0E1B2B]">{c.last_contact_str}</p>
                      <p className="text-[13px] font-medium text-gray-600">{getSubtext()}</p>
                    </div>

                    {/* Button */}
                    <div className="col-span-2 flex lg:justify-end w-full lg:pr-2">
                      <button 
                        onClick={() => navigate(`/clientes/${c.id}`)} 
                        className="bg-white hover:bg-gray-50 border border-gray-200 text-[#0E1B2B] text-[13px] font-extrabold px-6 py-2.5 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-colors flex items-center gap-2"
                      >
                        Ver perfil <span className="font-light text-[15px] leading-none">↗</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-end items-center mt-auto pt-6 gap-2 text-[13px] font-extrabold text-[#0E1B2B]">
            <button className="flex items-center gap-1.5 hover:text-[#3CDAB6] transition-colors mr-2">
              <span className="font-light text-base leading-none">←</span> Anterior
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#E4F8F4] text-[#0E1B2B]">1</button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">2</button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">3</button>
            <button className="flex items-center gap-1.5 hover:text-[#3CDAB6] transition-colors ml-2">
              Próxima <span className="font-light text-base leading-none">→</span>
            </button>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
