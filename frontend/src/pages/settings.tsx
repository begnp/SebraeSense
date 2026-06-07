import { useState } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Bell, Shield, Monitor, ChevronRight } from "lucide-react";

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-10 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 ${checked ? "bg-[#34B4A6]" : "bg-gray-200"}`}
    >
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-1"}`} />
    </button>
  );
}

export function Settings() {
  const [notifs, setNotifs] = useState({ email: true, push: false, alertas: true, resumo: false });
  const [pref, setPref] = useState({ darkMode: false, compacto: false });

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2530]">Configurações</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie suas preferências</p>
        </div>

        {/* Notificações */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <Bell size={16} className="text-[#34B4A6]" />
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Notificações</h2>
          </div>

          {[
            { key: "email",   label: "Notificações por email",     desc: "Receba alertas no seu email" },
            { key: "push",    label: "Notificações push",          desc: "Alertas em tempo real no navegador" },
            { key: "alertas", label: "Alertas de risco",           desc: "Notificar quando cliente entrar em risco" },
            { key: "resumo",  label: "Resumo diário",              desc: "Receber resumo do dia todo dia às 8h" },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-700">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <Toggle
                checked={notifs[item.key as keyof typeof notifs]}
                onChange={() => setNotifs(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifs] }))}
              />
            </div>
          ))}
        </div>

        {/* Preferências */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <Monitor size={16} className="text-[#34B4A6]" />
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Preferências</h2>
          </div>

          {[
            { key: "darkMode",  label: "Modo escuro",    desc: "Alternar tema escuro na interface" },
            { key: "compacto",  label: "Layout compacto", desc: "Reduzir espaçamento para ver mais dados" },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-700">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <Toggle
                checked={pref[item.key as keyof typeof pref]}
                onChange={() => setPref(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof pref] }))}
              />
            </div>
          ))}
        </div>

        {/* Segurança */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} className="text-[#34B4A6]" />
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Segurança</h2>
          </div>

          {[
            { label: "Alterar senha",              desc: "Atualize sua senha de acesso" },
            { label: "Sessões ativas",             desc: "Gerencie dispositivos conectados" },
          ].map(item => (
            <button key={item.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}