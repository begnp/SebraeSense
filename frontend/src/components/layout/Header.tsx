import { Search, Bell, PanelLeft } from 'lucide-react';

export const Header = ({ onToggleSidebar }: { onToggleSidebar: () => void }) => {
  return (
    <header className="h-16 px-6 flex items-center justify-between sticky top-0 z-10 bg-white border-b border-gray-200/80 shadow-sm">
      {/* Search Bar container with panel toggle */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="text-[#0E1B2B] hover:text-[#3CDAB6] p-2 hover:bg-gray-100 active:bg-gray-200/50 rounded-lg transition-colors cursor-pointer"
        >
          <PanelLeft size={20} />
        </button>
        <div className="relative w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar cliente, empresa..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-[#F0F4F2] text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#3CDAB6] focus:ring-1 focus:ring-[#3CDAB6]/20 sm:text-sm transition-all"
          />
        </div>
      </div>

      <div className="flex items-center">
        <button className="relative p-2 text-[#0E1B2B] hover:text-[#3CDAB6] transition-colors cursor-pointer">
          <Bell size={24} />
          <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-[#6B4C9A] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
            3
          </span>
        </button>
      </div>
    </header>
  );
};
