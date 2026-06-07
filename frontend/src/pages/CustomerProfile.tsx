import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import {
  ArrowLeft, Phone, MessageSquare, Mail, Calendar, FileText,
  AlertTriangle, CheckCircle2,
} from 'lucide-react';

const MOCK_CUSTOMERS: Record<string, CustomerData> = {
  '1': {
    id: 1, name: 'João Santos', company: 'Tech Norte LTDA',
    phone: 'xxxx-xxxx', email: 'xxxxxxx@xxxx.xxx',
    risk: 'alto', chs: 18, chsLabel: 'Em Risco',
    scores: { engajamento: { value: 15, max: 30 }, progressao: { value: 8, max: 25 }, retorno: { value: 19, max: 25 }, engajamento2: { value: 16, max: 25 } },
    context: [
      { type: 'ok', text: 'Cadastro completo' },
      { type: 'ok', text: 'Primeiro acesso realizado' },
      { type: 'warning', text: 'Tarefa pendente há 7 dias' },
    ],
    nextAction: 'Entrar em contato para resolver pendência no módulo financeiro.',
    activities: [
      { date: '08 Abr', title: 'Informações enviadas ao cliente', description: 'Verificado status do cadastro e enviado follow-up.', author: 'Marcela M.', tag: 'Discovery', tagColor: 'purple' },
      { date: '05 Abr', title: 'Coletando informações adicionais', description: 'Cliente confirmou interesse e aguarda proposta.', author: 'Marcela M.', tag: 'Proposta', tagColor: 'blue' },
      { date: '01 Abr', title: 'Primeiro contato realizado', description: 'Apresentação do programa SEBRAE e coleta de dados iniciais.', author: 'Marcela M.', tag: 'Onboarding', tagColor: 'green' },
    ],
    openServices: [
      { id: '#1024', title: 'Dificuldade com linha de crédito', status: 'Aberto hoje', deadline: null },
      { id: '#1038', title: 'Dúvida sobre documentação MEI', status: '18/15', deadline: '28/05' },
    ],
  },
  '2': {
    id: 2, name: 'Maria Silva', company: 'Padaria Estrela',
    phone: '(81) 99876-5432', email: 'maria@padariastrela.com',
    risk: 'alto', chs: 18, chsLabel: 'Em Risco',
    scores: { engajamento: { value: 10, max: 30 }, progressao: { value: 5, max: 25 }, retorno: { value: 8, max: 25 }, engajamento2: { value: 7, max: 25 } },
    context: [
      { type: 'ok', text: 'Cadastro completo' },
      { type: 'warning', text: 'Sem acesso há 30 dias' },
      { type: 'warning', text: 'Tarefa abandonada' },
    ],
    nextAction: 'Reengajar cliente com conteúdo personalizado para o setor alimentício.',
    activities: [
      { date: '02 Abr', title: 'Tentativa de contato', description: 'Cliente não atendeu. Deixado recado.', author: 'Marcela M.', tag: 'Follow-up', tagColor: 'yellow' },
    ],
    openServices: [
      { id: '#1040', title: 'Reativação de conta', status: 'Aberto hoje', deadline: null },
    ],
  },
};

interface ScoreItem { value: number; max: number; }
interface ActivityItem { date: string; title: string; description: string; author: string; tag: string; tagColor: string; }
interface ServiceItem { id: string; title: string; status: string; deadline: string | null; }
interface CustomerData {
  id: number; name: string; company: string; phone: string; email: string;
  risk: 'alto' | 'medio' | 'baixo'; chs: number; chsLabel: string;
  scores: { engajamento: ScoreItem; progressao: ScoreItem; retorno: ScoreItem; engajamento2: ScoreItem; };
  context: { type: 'ok' | 'warning'; text: string }[];
  nextAction: string;
  activities: ActivityItem[];
  openServices: ServiceItem[];
}

const RISK_CONFIG = {
  alto:  { label: 'Em Risco',  bg: 'bg-red-100',    text: 'text-red-600',    border: 'border-red-200' },
  medio: { label: 'Atenção',   bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  baixo: { label: 'Saudável',  bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200' },
};

const TAG_COLORS: Record<string, string> = {
  purple: 'bg-purple-100 text-purple-700',
  blue:   'bg-blue-100 text-blue-700',
  green:  'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
};

// Gauge (velocímetro) SVG
function GaugeChart({ value }: { value: number }) {
  const radius = 80;
  const cx = 110;
  const cy = 100;
  const startAngle = 180;
  const endAngle = 0;
  const range = startAngle - endAngle;
  const valueAngle = startAngle - (value / 100) * range;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arcPath = (r: number, start: number, end: number) => {
    const s = { x: cx + r * Math.cos(toRad(start)), y: cy - r * Math.sin(toRad(start)) };
    const e = { x: cx + r * Math.cos(toRad(end)),   y: cy - r * Math.sin(toRad(end)) };
    return `M ${s.x} ${s.y} A ${r} ${r} 0 0 1 ${e.x} ${e.y}`;
  };

  const needleX = cx + (radius - 10) * Math.cos(toRad(valueAngle));
  const needleY = cy - (radius - 10) * Math.sin(toRad(valueAngle));

  const color = value < 30 ? '#EF4444' : value < 50 ? '#F59E0B' : value < 70 ? '#84CC16' : '#22C55E';

  return (
    <svg viewBox="0 0 220 120" className="w-full max-w-[220px] mx-auto">
      {/* Track */}
      <path d={arcPath(radius, 180, 0)} fill="none" stroke="#F3F4F6" strokeWidth="18" strokeLinecap="round" />
      {/* Green zone */}
      <path d={arcPath(radius, 180, 120)} fill="none" stroke="#22C55E" strokeWidth="18" opacity="0.25" />
      {/* Yellow zone */}
      <path d={arcPath(radius, 120, 60)} fill="none" stroke="#F59E0B" strokeWidth="18" opacity="0.25" />
      {/* Red zone */}
      <path d={arcPath(radius, 60, 0)} fill="none" stroke="#EF4444" strokeWidth="18" opacity="0.25" />
      {/* Active arc */}
      <path d={arcPath(radius, 180, valueAngle)} fill="none" stroke={color} strokeWidth="18" strokeLinecap="round" />
      {/* Needle */}
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#1A2530" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="5" fill="#1A2530" />
      {/* Labels */}
      <text x="18" y="115" fontSize="10" fill="#9CA3AF">0</text>
      <text x="103" y="22" fontSize="10" fill="#9CA3AF" textAnchor="middle">50</text>
      <text x="196" y="115" fontSize="10" fill="#9CA3AF">100</text>
    </svg>
  );
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className="h-2 rounded-full bg-[#4ECDC4] transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-12 text-right flex-shrink-0">{value}/{max}</span>
    </div>
  );
}

const TABS = ['Linha do Tempo', 'Atendimentos', 'Analítica'] as const;
type Tab = typeof TABS[number];

export function CustomerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('Linha do Tempo');

  const customer = MOCK_CUSTOMERS[id ?? '1'] ?? MOCK_CUSTOMERS['1'];
  const risk = RISK_CONFIG[customer.risk];

  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-4 w-fit transition-colors"
        >
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">

          {/* ── Left column ── */}
          <div className="lg:col-span-8 flex flex-col gap-4">

            {/* Profile card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
                    <p className="text-sm text-gray-500">{customer.company}</p>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Phone size={10} /> {customer.phone}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Mail size={10} /> {customer.email}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${risk.bg} ${risk.text} ${risk.border}`}>
                  {risk.label}
                </span>
              </div>

              <div className="flex gap-3 mt-4 flex-wrap">
                {[
                  { icon: <Phone size={13} />, label: 'Ligar' },
                  { icon: <MessageSquare size={13} />, label: 'Chat' },
                  { icon: <Mail size={13} />, label: 'Email' },
                  { icon: <Calendar size={13} />, label: 'Agendar' },
                  { icon: <FileText size={13} />, label: 'Nota' },
                ].map(btn => (
                  <button key={btn.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-all">
                    {btn.icon} {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 flex flex-col flex-1 min-h-0">
              <div className="flex gap-0 border-b border-gray-100 px-5">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                      activeTab === tab ? 'border-[#1A2530] text-[#1A2530]' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-5 overflow-y-auto flex-1">
                {/* LINHA DO TEMPO */}
                {activeTab === 'Linha do Tempo' && (
                  <div className="flex flex-col gap-0">
                    {customer.activities.map((act, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center gap-0 pt-1 min-w-[52px]">
                          <span className="text-xs text-gray-400 whitespace-nowrap">{act.date}</span>
                          <div className="w-2.5 h-2.5 rounded-full bg-[#4ECDC4] border-2 border-white ring-1 ring-[#4ECDC4] mt-1 flex-shrink-0" />
                          {i < customer.activities.length - 1 && (
                            <div className="w-px flex-1 bg-gray-100 mt-1 min-h-[32px]" />
                          )}
                        </div>
                        <div className="flex-1 pb-5">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{act.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{act.description}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs text-gray-400">{act.author}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[act.tagColor] ?? 'bg-gray-100 text-gray-500'}`}>
                                {act.tag}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ATENDIMENTOS ABERTOS */}
                {activeTab === 'Atendimentos' && (
                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Atendimentos Abertos</h3>
                    {customer.openServices.map((s, i) => (
                      <div key={i} className="border border-gray-200 rounded-xl p-4">
                        <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{s.id}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">{s.status}</span>
                          {s.deadline && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                Prazo: {s.deadline}
                              </span>
                            </>
                          )}
                        </div>
                        <button className="mt-3 w-full flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-all">
                          Enviar atualização ao cliente
                          <span className="text-gray-400">↗</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'Analítica' && (
                  <div className="flex items-center justify-center h-32 text-gray-300 text-sm">
                    Em desenvolvimento
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="lg:col-span-4 flex flex-col gap-4">

            {/* Score calculado */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Score Calculado</p>
              <GaugeChart value={customer.chs} />
              <div className="flex flex-col gap-3 mt-4">
                <ScoreBar label="Frequência de acesso" value={customer.scores.engajamento.value}  max={customer.scores.engajamento.max} />
                <ScoreBar label="Progressão"           value={customer.scores.progressao.value}  max={customer.scores.progressao.max} />
                <ScoreBar label="Retorno"              value={customer.scores.retorno.value}      max={customer.scores.retorno.max} />
                <ScoreBar label="Engajamento"          value={customer.scores.engajamento2.value} max={customer.scores.engajamento2.max} />
                <div className="border-t border-gray-100 pt-2 mt-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">Total</span>
                    <span className="font-bold text-gray-800">
                      {customer.scores.engajamento.value + customer.scores.progressao.value + customer.scores.retorno.value + customer.scores.engajamento2.value}
                      /{customer.scores.engajamento.max + customer.scores.progressao.max + customer.scores.retorno.max + customer.scores.engajamento2.max}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contexto */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Contexto</p>
              <div className="flex flex-col gap-2">
                {customer.context.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {item.type === 'ok'
                      ? <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                      : <AlertTriangle size={14} className="text-yellow-500 flex-shrink-0" />}
                    <span className="text-sm text-gray-600">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Próxima ação */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Próxima Ação</p>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{customer.nextAction}</p>
              <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1A2530] text-white text-xs font-bold rounded-lg hover:bg-[#243040] transition-colors">
                <Phone size={13} /> Ligar agora
              </button>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}