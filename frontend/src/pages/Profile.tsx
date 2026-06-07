import { useNavigate } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { Phone, Mail, Camera, ArrowLeft } from "lucide-react";

const MOCK_ACTIVITIES = [
  { date: "Ontem, 14h02", title: '3 buscas repetidas por "Linha de crédito"', tag: "Confusão na jornada", tagColor: "#F59E0B" },
  { date: "Ontem, 14h02", title: '3 buscas repetidas por "Linha de crédito"', tag: "Confusão na jornada", tagColor: "#F59E0B" },
  { date: "Ontem, 14h02", title: '3 buscas repetidas por "Linha de crédito"', tag: "Confusão na jornada", tagColor: "#F59E0B" },
];

const MOCK_SERVICES = [
  { id: "#1038", title: "Dúvida sobre documentação MEI", status: "18/15", deadline: "28/05" },
  { id: "#1024", title: "Dificuldade com linha de crédito", status: "Aberto hoje", deadline: null },
];

function GaugeChart({ value }: { value: number }) {
  const radius = 80;
  const cx = 110;
  const cy = 100;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arcPath = (r: number, start: number, end: number) => {
    const s = { x: cx + r * Math.cos(toRad(start)), y: cy - r * Math.sin(toRad(start)) };
    const e = { x: cx + r * Math.cos(toRad(end)), y: cy - r * Math.sin(toRad(end)) };
    return `M ${s.x} ${s.y} A ${r} ${r} 0 0 1 ${e.x} ${e.y}`;
  };

  const valueAngle = 180 - (value / 100) * 180;
  const needleX = cx + (radius - 10) * Math.cos(toRad(valueAngle));
  const needleY = cy - (radius - 10) * Math.sin(toRad(valueAngle));
  const color = value < 30 ? "#EF4444" : value < 50 ? "#F59E0B" : value < 70 ? "#84CC16" : "#22C55E";

  return (
    <svg viewBox="0 0 220 120" className="w-full max-w-[260px] mx-auto">
      <path d={arcPath(radius, 180, 0)} fill="none" stroke="#F3F4F6" strokeWidth="20" strokeLinecap="round" />
      <path d={arcPath(radius, 180, 120)} fill="none" stroke="#22C55E" strokeWidth="20" opacity="0.3" />
      <path d={arcPath(radius, 120, 60)} fill="none" stroke="#F59E0B" strokeWidth="20" opacity="0.3" />
      <path d={arcPath(radius, 60, 0)} fill="none" stroke="#EF4444" strokeWidth="20" opacity="0.3" />
      <path d={arcPath(radius, 180, valueAngle)} fill="none" stroke={color} strokeWidth="20" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#1A2530" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="5" fill="#1A2530" />
      <text x="18" y="115" fontSize="10" fill="#9CA3AF">0</text>
      <text x="103" y="22" fontSize="10" fill="#9CA3AF" textAnchor="middle">50</text>
      <text x="196" y="115" fontSize="10" fill="#9CA3AF">100</text>
    </svg>
  );
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className="h-2 rounded-full bg-[#4ECDC4] transition-all duration-500" style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-12 text-right flex-shrink-0">{value}/{max}</span>
    </div>
  );
}

export function Profile() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("user_name") || "Usuário";
  const userEmail = localStorage.getItem("user_email") || "email@sebrae.com.br";
  const initials = userName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  const scores = [
    { label: "Frequência de acesso", value: 15, max: 30 },
    { label: "Progressão",           value: 8,  max: 25 },
    { label: "Retorno",              value: 19, max: 25 },
    { label: "Engajamento",          value: 16, max: 25 },
  ];
  const total = scores.reduce((a, s) => a + s.value, 0);
  const maxTotal = scores.reduce((a, s) => a + s.max, 0);
  const scorePct = Math.round((total / maxTotal) * 100);

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

          {/* Coluna esquerda */}
          <div className="lg:col-span-8 flex flex-col gap-4">

            {/* Card do analista */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-5">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-black text-gray-400">
                      {initials}
                    </div>
                    <button className="absolute bottom-0 right-0 w-7 h-7 bg-[#1A2530] rounded-full flex items-center justify-center hover:bg-[#243040] transition-colors">
                      <Camera size={12} className="text-white" />
                    </button>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{userName}</h2>
                    <p className="text-sm text-[#34B4A6] font-medium">Analista CX</p>
                    <div className="flex flex-col gap-0.5 mt-2">
                      <span className="text-xs text-gray-400 flex items-center gap-1.5">
                        <Phone size={11} /> xxxx-xxxx
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1.5">
                        <Mail size={11} /> {userEmail}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF5F0] text-[#34B4A6] border border-[#34B4A6]/30">
                  Conectado
                </span>
              </div>
            </div>

            {/* Linha do tempo + Atendimentos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">

              {/* Linha do tempo */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-700 mb-5">
                  Linha do Tempo
                </h3>
                <div className="flex flex-col gap-0">
                  {MOCK_ACTIVITIES.map((act, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center pt-1 flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] border-2 border-white ring-1 ring-[#F59E0B]" />
                        {i < MOCK_ACTIVITIES.length - 1 && (
                          <div className="w-px flex-1 bg-gray-100 mt-1 min-h-[32px]" />
                        )}
                      </div>
                      <div className="flex-1 pb-5">
                        <p className="text-sm font-medium text-gray-800">{act.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{act.date}</p>
                        <span
                          className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: act.tagColor + "22", color: act.tagColor }}
                        >
                          {act.tag}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Atendimentos abertos */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-700 mb-5">
                  Atendimentos Abertos
                </h3>
                <div className="flex flex-col gap-3">
                  {MOCK_SERVICES.map((s, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
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
                        Enviar atualização ao cliente <span>↗</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Coluna direita — Score */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-4">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Score Calculado</p>
              <GaugeChart value={scorePct} />
              <div className="flex flex-col gap-3 mt-4">
                {scores.map(s => (
                  <ScoreBar key={s.label} label={s.label} value={s.value} max={s.max} />
                ))}
                <div className="border-t border-gray-100 pt-2 mt-1 flex justify-between text-xs">
                  <span className="text-gray-500 font-medium">Total</span>
                  <span className="font-bold text-gray-800">{total}/{maxTotal}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}