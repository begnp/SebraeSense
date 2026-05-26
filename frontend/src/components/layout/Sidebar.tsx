import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, Bell, LogOut, MonitorPlay } from 'lucide-react';

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-[#1A2530] text-white flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6">
        {/* Mock Logo */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold tracking-widest uppercase italic text-gray-400">Sebrae</span>
          <span className="text-2xl font-black tracking-wider text-[#34B4A6] uppercase">Sense</span>
        </div>
      </div>

      <nav className="flex-1 mt-6">
        <ul className="space-y-2">
          <li>
            <a href="#" className="flex items-center gap-3 px-6 py-3 bg-[#6B4C9A] text-white">
              <LayoutDashboard size={20} />
              <span className="font-medium text-sm">Dashboard</span>
            </a>
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

      {/* User Profile */}
      <div className="bg-[#34B4A6] p-4 m-4 rounded-xl flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1A2530] flex items-center justify-center text-xs font-bold">
            MM
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#1A2530] leading-tight">Marcela Menezes</span>
            <span className="text-[10px] text-[#1A2530] font-medium opacity-80">Analista CX</span>
          </div>
        </div>
        <button className="text-[#1A2530] hover:text-white transition-colors">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};
