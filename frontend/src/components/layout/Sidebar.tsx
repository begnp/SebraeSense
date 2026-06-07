import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Bell, LogOut, ChevronUp, User, List } from 'lucide-react';
import { Logo } from './Logo';

export const Sidebar = ({ isOpen }: { isOpen: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`w-64 bg-[#0E1B2B] text-white flex flex-col h-screen fixed left-0 top-0 z-20 border-r border-gray-800 transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Brand Logo Container */}
      <div className="p-6">
        <Logo />
      </div>

      {/* Navigation List */}
      <nav className="flex-1 mt-6">
        <ul className="space-y-1 px-3">
          <li>
            <Link 
              to="/" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-[#6B4C9A] text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/clientes/1" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive('/clientes') 
                  ? 'bg-[#6B4C9A] text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <List size={18} />
              <span>Fila Priorizada</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/alertas" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive('/alertas') 
                  ? 'bg-[#6B4C9A] text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bell size={18} />
              <span>Alertas</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/clientes-lista" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive('/clientes-lista') 
                  ? 'bg-[#6B4C9A] text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users size={18} />
              <span>Clientes</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer Configurações & User Profile */}
      <div className="mt-auto flex flex-col gap-2 p-3">
        {/* Configurações Link */}
        <Link 
          to="/configuracoes" 
          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <span>Configurações</span>
        </Link>

        {/* User profile dropdown popup */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute bottom-24 left-3 right-3 bg-[#172535] rounded-xl shadow-2xl z-20 overflow-hidden border border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#3CDAB6] flex items-center justify-center text-sm font-bold text-[#0E1B2B]">
                    {initials}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-white leading-tight truncate">{userName}</span>
                    {userEmail && <span className="text-xs text-gray-400 truncate">{userEmail}</span>}
                    <span className="text-[10px] text-[#3CDAB6] font-medium mt-0.5">Analista CX</span>
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
                <div className="border-t border-gray-700 mt-2 pt-2">
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

        {/* User Card */}
        <div
          onClick={() => setMenuOpen(!menuOpen)}
          className="bg-[#3CDAB6] px-4 py-3.5 rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#2fa396] transition-colors select-none text-[#0E1B2B]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0E1B2B] text-white flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight">{userName}</span>
              <span className="text-[10px] font-medium opacity-80">Analista CX</span>
            </div>
          </div>
          <ChevronUp
            size={18}
            className={`transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>
    </aside>
  );
};