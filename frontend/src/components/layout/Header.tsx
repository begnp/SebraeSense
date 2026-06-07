import { Search, Bell, PanelLeft } from 'lucide-react';

export const Header = () => {
  return (
    <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-10 bg-transparent">
      {/* Search Bar container with panel toggle */}
      <div className="flex items-center gap-4">
        <button className="text-[#0E1B2B] hover:text-[#3CDAB6] transition-colors cursor-pointer">
          <PanelLeft size={20} />
        </button>
        <div className="relative w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar cliente, empresa..."
            className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-lg leading-5 bg-[#D5E1DC] text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-gray-300 sm:text-sm transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center">
        <button className="relative p-2 text-[#0E1B2B] hover:text-[#3CDAB6] transition-colors cursor-pointer">
          <Bell size={24} />
          <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-[#6B4C9A] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#EBF5F0]">
            3
          </span>
        </button>
      </div>
    </header>
  );
};
