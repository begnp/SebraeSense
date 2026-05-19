import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Mail,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';

// ─── Mock data (substitua por fetch para /clientes/:id quando o backend estiver pronto) ───
const MOCK_CUSTOMERS: Record<string, CustomerData> = {
  '1': {
    id: 1,
    name: 'João Santos',
    company: 'Tech Norte LTDA',
    phone: '(85) 98765-4321',
    email: 'joao@technorte.com',
    risk: 'alto',
    chs: 18,
    chsLabel: '3 erros consecutivos no cadastro',
    scores: {
      engajamento: 10,
      progressao: 15,
      sucesso: 10,
      friccao: 60,
    },
    context: [
      { type: 'ok',      text: 'Cadastro completo' },
      { type: 'ok',      text: 'Primeiro acesso realizado' },
      { type: 'warning', text: 'Tarefa pendente há 7 dias' },
    ],
    nextAction: 'Entrar em contato para resolver pendência no módulo financeiro.',
    activities: [
      {
        date: '08 Abr',
        dot: 'blue',
        title: 'Informações enviadas ao cliente',
        description: 'Verificado status do cadastro e enviado follow-up.',
        author: 'Marcela M.',
        tag: 'Discovery',
        tagColor: 'purple',
      },
      {
        date: '05 Abr',
        dot: 'blue',
        title: 'Coletando informações adicionais',
        description: 'Cliente confirmou interesse e aguarda proposta.',
        author: 'Marcela M.',
        tag: 'Proposta',
        tagColor: 'blue',
      },
      {
        date: '01 Abr',
        dot: 'blue',
        title: 'Primeiro contato realizado',
        description: 'Apresentação do programa SEBRAE e coleta de dados iniciais.',
        author: 'Marcela M.',
        tag: 'Onboarding',
        tagColor: 'green',
      },
    ],
  },
  '2': {
    id: 2,
    name: 'Maria Silva',
    company: 'Padaria Estrela',
    phone: '(81) 99876-5432',
    email: 'maria@padariastrela.com',
    risk: 'alto',
    chs: 18,
    chsLabel: 'Inatividade de 30 dias + tarefa abandonada',
    scores: {
      engajamento: 30,
      progressao: 45,
      sucesso: 25,
      friccao: 40,
    },
    context: [
      { type: 'ok',      text: 'Cadastro completo' },
      { type: 'warning', text: 'Sem acesso há 30 dias' },
      { type: 'warning', text: 'Tarefa abandonada' },
    ],
    nextAction: 'Reengajar cliente com conteúdo personalizado para o setor alimentício.',
    activities: [
      {
        date: '02 Abr',
        dot: 'blue',
        title: 'Tentativa de contato',
        description: 'Cliente não atendeu. Deixado recado.',
        author: 'Marcela M.',
        tag: 'Follow-up',
        tagColor: 'yellow',
      },
    ],
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityItem {
  date: string;
  dot: string;
  title: string;
  description: string;
  author: string;
  tag: string;
  tagColor: string;
}

interface CustomerData {
  id: number;
  name: string;
  company: string;
  phone: string;
  email: string;
  risk: 'alto' | 'medio' | 'baixo';
  chs: number;
  chsLabel: string;
  scores: {
    engajamento: number;
    progressao: number;
    sucesso: number;
    friccao: number;
  };
  context: { type: 'ok' | 'warning'; text: string }[];
  nextAction: string;
  activities: ActivityItem[];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const RISK_CONFIG = {
  alto:  { label: 'Alto Risco', bg: 'bg-red-100',    text: 'text-red-600',    border: 'border-red-200' },
  medio: { label: 'Atenção',    bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  baixo: { label: 'Saudável',   bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200' },
};

const TAG_COLORS: Record<string, string> = {
  purple: 'bg-purple-100 text-purple-700',
  blue:   'bg-blue-100 text-blue-700',
  green:  'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red:    'bg-red-100 text-red-600',
};

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-semibold text-gray-700">{value}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

const TABS = ['Resumo', 'Atividades', 'Analítica', 'Detalhes', 'Arquivos', 'Histórico'] as const;
type Tab = typeof TABS[number];

// ─── Main Page ────────────────────────────────────────────────────────────────

export function CustomerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('Resumo');

  const customer = MOCK_CUSTOMERS[id ?? '1'] ?? MOCK_CUSTOMERS['1'];
  const risk = RISK_CONFIG[customer.risk];

  // CHS ring color
  const chsColor = customer.chs < 30 ? '#EF4444' : customer.chs < 70 ? '#F59E0B' : '#22C55E';
  const chsCircumference = 2 * Math.PI * 28;
  const chsOffset = chsCircumference - (customer.chs / 100) * chsCircumference;

  return (
    <MainLayout>
      <div className="flex flex-col h-full">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-4 w-fit transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">

          {/* ── Left / Center column ── */}
          <div className="lg:col-span-8 flex flex-col gap-4">

            {/* Profile card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-[#1A2530] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {customer.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
                    <p className="text-sm text-gray-500">{customer.company} · {customer.phone}</p>
                    <p className="text-sm text-gray-400">{customer.email}</p>
                  </div>
                </div>
                {/* Risk badge */}
                <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${risk.bg} ${risk.text} ${risk.border}`}>
                  {risk.label}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-5 flex-wrap">
                {[
                  { icon: <Phone size={14} />,        label: 'Ligar' },
                  { icon: <MessageSquare size={14} />, label: 'Chat' },
                  { icon: <Mail size={14} />,          label: 'Email' },
                  { icon: <Calendar size={14} />,      label: 'Agendar' },
                  { icon: <FileText size={14} />,      label: 'Nota' },
                ].map(btn => (
                  <button
                    key={btn.label}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    {btn.icon}
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 flex flex-col flex-1 min-h-0">
              <div className="flex gap-0 border-b border-gray-100 px-5 overflow-x-auto">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                      activeTab === tab
                        ? 'border-[#1A2530] text-[#1A2530]'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-5 overflow-y-auto flex-1">
                {activeTab === 'Resumo' && (
                  <div className="flex flex-col gap-3">
                    {customer.activities.map((act, i) => (
                      <div key={i} className="flex gap-4">
                        {/* Date + dot */}
                        <div className="flex flex-col items-center gap-1 pt-0.5 min-w-[52px]">
                          <span className="text-xs text-gray-400 whitespace-nowrap">{act.date}</span>
                          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-0.5" />
                          {i < customer.activities.length - 1 && (
                            <div className="w-px flex-1 bg-gray-100 mt-1" />
                          )}
                        </div>
                        {/* Content */}
                        <div className="flex-1 pb-4">
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

                {activeTab !== 'Resumo' && (
                  <div className="flex items-center justify-center h-32 text-gray-300 text-sm">
                    Em desenvolvimento
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="lg:col-span-4 flex flex-col gap-4">

            {/* CHS Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Customer Health Score</p>

              {/* Ring + score */}
              <div className="flex items-center gap-4 mb-5">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#F3F4F6" strokeWidth="6" />
                    <circle
                      cx="32" cy="32" r="28"
                      fill="none"
                      stroke={chsColor}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={chsCircumference}
                      strokeDashoffset={chsOffset}
                      style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-800">
                    {customer.chs}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-snug">{customer.chsLabel}</p>
              </div>

              {/* Score bars */}
              <ScoreBar label="Engajamento" value={customer.scores.engajamento} color="bg-blue-400" />
              <ScoreBar label="Progressão"  value={customer.scores.progressao}  color="bg-indigo-400" />
              <ScoreBar label="Sucesso"     value={customer.scores.sucesso}     color="bg-green-400" />
              <ScoreBar label="Fricção"     value={customer.scores.friccao}     color="bg-red-400" />
            </div>

            {/* Context card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Contexto do Atendimento</p>
              <div className="flex flex-col gap-2">
                {customer.context.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {item.type === 'ok'
                      ? <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                      : <AlertTriangle size={14} className="text-yellow-500 flex-shrink-0" />
                    }
                    <span className="text-sm text-gray-600">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next action card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Próxima Ação</p>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{customer.nextAction}</p>
              <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1A2530] text-white text-sm font-semibold rounded-lg hover:bg-[#243040] transition-colors">
                <Phone size={14} />
                Ligar agora
              </button>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}