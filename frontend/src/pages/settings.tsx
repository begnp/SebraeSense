import { useState } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { ChevronRight, Settings as SettingsIcon, Shield, Mail, Bell, Info, Pencil } from "lucide-react";

export function Settings() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  // Sliders state
  const [sucesso, setSucesso] = useState(40);
  const [engajamento, setEngajamento] = useState(25);
  const [friccao, setFriccao] = useState(35);

  const total = sucesso + engajamento + friccao;

  // Obter dados do usuário logado
  const userName = localStorage.getItem("user_name") || "Usuário Convidado";
  const userEmail = localStorage.getItem("user_email") || "email@sebrae.com.br";
  const parts = userName.split(" ");
  const initials = parts.length > 1 
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : userName.substring(0, 2).toUpperCase();

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 font-sans">
        
        {/* Header */}
        <div className="mb-2">
          <h2 className="text-[28px] font-extrabold text-[#0E1B2B] leading-none tracking-tight">Configurações</h2>
          <p className="text-[15px] font-semibold text-[#0E1B2B] mt-1.5">Gerencie seu perfil, preferências e parâmetros do sistema.</p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Profile & Preferences) */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Profile Card */}
            <div className="bg-[#F4FBFA] rounded-[32px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col items-center relative overflow-hidden">
              
              {/* Avatar with Edit Badge */}
              <div className="relative mb-6">
                <div className="w-[100px] h-[100px] rounded-full bg-[#0E1B2B] text-white flex items-center justify-center text-[32px] font-extrabold shadow-md">
                  {initials}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#3CDAB6] rounded-full flex items-center justify-center text-white shadow-md border-[3px] border-[#F4FBFA] hover:bg-[#2cb898] transition-colors cursor-pointer">
                  <Pencil size={12} fill="currentColor" />
                </button>
              </div>

              {/* User Info */}
              <div className="text-center mb-8">
                <h3 className="text-lg font-extrabold text-[#0E1B2B] leading-none mb-1">{userName}</h3>
                <p className="text-xs font-bold text-gray-500">Analista de CX</p>
                <p className="text-[10px] font-semibold text-gray-400 mt-1">{userEmail}</p>
              </div>

              {/* Links */}
              <div className="w-full flex flex-col gap-2">
                <button className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-white border border-transparent hover:border-gray-100 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <SettingsIcon size={18} className="text-[#0E1B2B]" />
                    <span className="text-sm font-extrabold text-[#0E1B2B]">Ajustes de perfil</span>
                  </div>
                  <ChevronRight size={18} className="text-[#0E1B2B]" />
                </button>
                <button className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-white border border-transparent hover:border-gray-100 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-[#0E1B2B]" />
                    <span className="text-sm font-extrabold text-[#0E1B2B]">Segurança</span>
                  </div>
                  <ChevronRight size={18} className="text-[#0E1B2B]" />
                </button>
              </div>
            </div>

            {/* Preferences Card */}
            <div className="bg-[#F4FBFA] rounded-[32px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col gap-6">
              <h3 className="text-base font-extrabold text-[#0E1B2B]">Preferências do sistema</h3>
              
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-2">Idioma do painel</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-[#E4F8F4] text-[#0E1B2B] text-xs font-extrabold rounded-xl py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-[#3CDAB6] border border-transparent cursor-pointer">
                    <option>Português (Brasil)</option>
                    <option>English (US)</option>
                    <option>Español</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[#0E1B2B]">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-200/60 w-full" />

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-500" />
                    <span className="text-[13px] font-semibold text-gray-600">Alertas por e-mail</span>
                  </div>
                  <div 
                    onClick={() => setEmailAlerts(!emailAlerts)}
                    className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-colors ${emailAlerts ? 'bg-[#3CDAB6]' : 'bg-gray-200 border border-gray-300'}`}
                  >
                    {emailAlerts && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell size={16} className="text-gray-500" />
                    <span className="text-[13px] font-semibold text-gray-600">Notificações push</span>
                  </div>
                  <div 
                    onClick={() => setPushNotifs(!pushNotifs)}
                    className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-colors ${pushNotifs ? 'bg-[#3CDAB6]' : 'bg-gray-200 border border-gray-300'}`}
                  >
                    {pushNotifs && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Score Settings) */}
          <div className="lg:col-span-8 bg-[#F4FBFA] rounded-[32px] p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col h-full relative overflow-hidden">
            
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-[22px] font-extrabold text-[#0E1B2B] tracking-tight">Ajustes de Cálculo do Score</h3>
                <p className="text-[13px] font-semibold text-[#0E1B2B] mt-2">Defina o peso de cada pilar na análise de saúde do cliente.</p>
              </div>
              
              <div className="bg-[#3CDAB6] text-[#1E4A38] font-extrabold text-sm px-6 py-2.5 rounded-lg border border-[#2cb898]/20 shadow-sm">
                Total: {total}%
              </div>
            </div>

            {/* Sliders Container */}
            <div className="flex flex-col gap-10">
              
              {/* Sucesso Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[15px] font-extrabold text-[#0E1B2B]">Sucesso</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-extrabold text-[#3CDAB6]">{sucesso}</span>
                    <span className="text-[12px] font-extrabold text-[#3CDAB6] bg-white px-2 py-0.5 rounded border border-gray-100 shadow-sm">%</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={sucesso} 
                  onChange={(e) => setSucesso(Number(e.target.value))}
                  className="w-full h-2 bg-[#E4F8F4] rounded-lg appearance-none cursor-pointer accent-[#3CDAB6]"
                  style={{ background: `linear-gradient(to right, #3CDAB6 ${sucesso}%, #E4F8F4 ${sucesso}%)` }}
                />
                <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mt-2">
                  Métricas de entrega de valor e ROI percebido pelo cliente.
                </p>
              </div>

              {/* Engajamento Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[15px] font-extrabold text-[#0E1B2B]">Engajamento</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-extrabold text-[#3CDAB6]">{engajamento}</span>
                    <span className="text-[12px] font-extrabold text-[#3CDAB6] bg-white px-2 py-0.5 rounded border border-gray-100 shadow-sm">%</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={engajamento} 
                  onChange={(e) => setEngajamento(Number(e.target.value))}
                  className="w-full h-2 bg-[#E4F8F4] rounded-lg appearance-none cursor-pointer accent-[#3CDAB6]"
                  style={{ background: `linear-gradient(to right, #3CDAB6 ${engajamento}%, #E4F8F4 ${engajamento}%)` }}
                />
                <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mt-2">
                  Frequência de uso, adoção de novas funcionalidades e interações.
                </p>
              </div>

              {/* Fricção Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[15px] font-extrabold text-[#0E1B2B]">Fricção</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-extrabold text-[#3CDAB6]">{friccao}</span>
                    <span className="text-[12px] font-extrabold text-[#3CDAB6] bg-white px-2 py-0.5 rounded border border-gray-100 shadow-sm">%</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={friccao} 
                  onChange={(e) => setFriccao(Number(e.target.value))}
                  className="w-full h-2 bg-[#E4F8F4] rounded-lg appearance-none cursor-pointer accent-[#3CDAB6]"
                  style={{ background: `linear-gradient(to right, #3CDAB6 ${friccao}%, #E4F8F4 ${friccao}%)` }}
                />
                <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mt-2">
                  Chamados de suporte, bugs reportados e tempo de resposta.
                </p>
              </div>

            </div>

            {/* Info Box */}
            <div className="mt-auto pt-12">
              <div className="bg-[#E4F8F4] rounded-2xl p-5 border border-[#3CDAB6]/40 flex gap-4 items-start shadow-sm">
                <Info size={20} className="text-[#1E4A38] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[13px] font-extrabold text-[#0E1B2B] mb-1">Dica de Configuração</h4>
                  <p className="text-[12px] font-semibold text-[#0E1B2B] leading-relaxed pr-4">
                    Os pesos definidos acima impactam diretamente o cálculo do score de saúde global dos seus clientes no dashboard principal.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </MainLayout>
  );
}