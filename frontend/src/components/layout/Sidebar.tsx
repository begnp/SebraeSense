import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Bell, LogOut, MonitorPlay, Settings, ChevronUp, User } from 'lucide-react';

export const Sidebar = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("user_name") || "Usuário";
  const userEmail = localStorage.getItem("user_email") || "";
  const initials = userName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-[#1A2530] text-white flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold tracking-widest uppercase italic text-gray-400">Sebrae</span>
          <span className="text-2xl font-black tracking-wider text-[#34B4A6] uppercase">Sense</span>
        </div>
      </div>

      <nav className="flex-1 mt-6">
        <ul className="space-y-2">
          <li>
            <Link to="/" className="flex items-center gap-3 px-6 py-3 bg-[#6B4C9A] text-white">
              <LayoutDashboard size={20} />
              <span className="font-medium text-sm">Dashboard</span>
            </Link>
          </li>
          <li>
            <a href="#" className="flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-white/5 transition-colors">
              <Users size={20} />
              <span className="font-medium text-sm">Fila Priorizada</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-white/5 transition-colors">
              <Bell size={20} />
              <span className="font-medium text-sm">Alertas</span>
            </a>
          </li>
          <li>
            <Link to="/sebrae" className="flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-white/5 transition-colors">
              <MonitorPlay size={20} />
              <span className="font-medium text-sm">Acessar Mini Sebrae</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Popup menu */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />

          <div className="absolute bottom-24 left-4 right-4 bg-[#243040] rounded-xl shadow-2xl z-20 overflow-hidden border border-white/10">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#34B4A6] flex items-center justify-center text-sm font-bold text-[#1A2530]">
                  {initials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-white leading-tight truncate">{userName}</span>
                  {userEmail && <span className="text-xs text-gray-400 truncate">{userEmail}</span>}
                  <span className="text-[10px] text-[#34B4A6] font-medium mt-0.5">Analista CX</span>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={() => { navigate("/perfil"); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <User size={16} />
                Meu perfil
              </button>
              <button
                onClick={() => { navigate("/configuracoes"); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Settings size={16} />
                Configurações
              </button>
              <div className="border-t border-white/10 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* User card */}
      <div
        onClick={() => setMenuOpen(!menuOpen)}
        className="bg-[#34B4A6] p-4 m-4 rounded-xl flex items-center justify-between mt-auto cursor-pointer hover:bg-[#2fa396] transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1A2530] flex items-center justify-center text-xs font-bold">
            {initials}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#1A2530] leading-tight">{userName}</span>
            <span className="text-[10px] text-[#1A2530] font-medium opacity-80">Conectado</span>
          </div>
        </div>
        <ChevronUp
          size={18}
          className={`text-[#1A2530] transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
        />
      </div>
    </aside>
  );
};