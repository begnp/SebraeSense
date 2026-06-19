import { useState, useEffect, type ReactNode } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { StatCard } from './components/dashboard/StatCard';
import { PriorityQueue } from './components/dashboard/PriorityQueue';
import { ChartWidget } from './components/dashboard/ChartWidget';
import { AlertTriangle, Eye, Loader2, Info, ShieldCheck, Bell, X } from 'lucide-react';
import { useDashboardData } from './hooks/useDashboardData';
import { CustomerProfile } from './pages/CustomerProfile';
import { MiniSebraeHome } from './pages/sebrae/MiniSebraeHome';
import { MiniSebraeTask } from './pages/sebrae/MiniSebraeTask';
import { TrackerViewer } from './components/TrackerViewer';
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/settings";
import { Alerts } from './pages/Alerts';
import { CustomersList } from './pages/CustomersList';
import { PriorityQueuePage } from './pages/PriorityQueuePage';

interface ActiveAlert {
  id: number;
  customer_id: number;
  customer_name: string;
  company: string;
  reason: string;
  category?: string;
  created_at: string;
}

function ActiveAlertsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<ActiveAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = [
    'Todos',
    'Inatividade prolongada',
    'Erro em tarefa crítica',
    'Suporte sem resolução',
    'Queda de engajamento',
    'Eventos',
    'Cursos'
  ];

  useEffect(() => {
    if (!isOpen) return;
    const fetchActiveAlerts = async () => {
      setLoading(true);
      try {
        const res = await fetch(import.meta.env.VITE_API_URL + '');
        if (res.ok) {
          const data = await res.json();
          setAlerts(data);
        }
      } catch (err) {
        console.error('Erro ao buscar alertas ativos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveAlerts();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedCategory('Todos');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categoryCounts = categories.reduce((acc, cat) => {
    if (cat === 'Todos') {
      acc[cat] = alerts.length;
    } else {
      acc[cat] = alerts.filter(a => a.category === cat).length;
    }
    return acc;
  }, {} as Record<string, number>);

  const filteredAlerts = selectedCategory === 'Todos'
    ? alerts
    : alerts.filter(a => a.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-[#0E1B2B]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] p-6 max-w-lg w-full shadow-2xl relative border border-gray-100/50 flex flex-col max-h-[70vh]">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-[#0E1B2B] transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
        
        <h3 className="text-xl font-extrabold text-[#0E1B2B] mb-4 flex items-center gap-2">
          <Bell className="text-red-500" size={20} />
          Alertas Ativos de Clientes
        </h3>

        {/* Category Filter Pills */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1.5 flex-shrink-0">
          {categories.map((cat) => {
            const count = categoryCounts[cat] || 0;
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#0E1B2B] text-white border-[#0E1B2B] shadow-sm'
                    : 'bg-[#F4F7FA] text-gray-400 border-gray-200/50 hover:bg-gray-100 hover:text-gray-600'
                }`}
              >
                {cat} 
                <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-200/60 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 flex-1">
            <Loader2 className="animate-spin text-[#6B4C9A]" size={36} />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-semibold text-xs bg-gray-50 rounded-[18px] border border-gray-100/50 flex-1 flex flex-col items-center justify-center">
            <Info className="text-gray-300 mb-2" size={24} />
            Nenhum alerta ativo nesta categoria.
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 flex flex-col gap-3.5 pr-1 py-1">
            {filteredAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className="bg-[#F4F7FA] rounded-[16px] p-4 border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-xs text-[#0E1B2B]">{alert.customer_name}</span>
                    <span className="text-[10px] text-gray-400 font-bold bg-gray-200/50 px-2 py-0.5 rounded-full">{alert.company}</span>
                    <span className="text-[9px] font-extrabold uppercase bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded border border-gray-300/30">
                      {alert.category || 'Queda de engajamento'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 font-medium leading-relaxed pr-2">{alert.reason}</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/clientes/${alert.customer_id}`);
                  }}
                  className="whitespace-nowrap px-3.5 py-2 bg-[#0E1B2B] hover:bg-[#152a42] text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Acessar Perfil →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Dashboard() {
  const days = 30;
  const { data, loading, error } = useDashboardData(days);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="animate-spin text-[#6B4C9A]" size={48} />
        </div>
      </MainLayout>
    );
  }

  if (error || !data) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full flex-col text-red-500">
          <AlertTriangle size={48} className="mb-4" />
          <h2 className="text-xl font-bold">Erro ao carregar os dados</h2>
          <p>{error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 font-sans h-full">
        {/* Main Content Grid (Left Area Span 9, Right Area Span 3) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch flex-1">
          
          {/* Left Area (Span 8) */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            
            {/* Top Row of Left Area: Alertas + KPIs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Alertas de Clientes (Span 1) */}
              <div className="lg:col-span-1 flex flex-col">
                <div className="bg-[#F4FBFA] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col h-full relative">
                  <h3 className="text-xl font-extrabold text-[#0E1B2B] mb-6 flex items-center gap-2">
                    <Bell size={22} className="text-[#0E1B2B]" />
                    Alertas de Clientes
                  </h3>

                  {/* Box with list of alerts */}
                  <div className="bg-[#E4F8F4] rounded-[20px] p-5 flex flex-col gap-4 flex-1">
                    <span className="text-sm font-extrabold text-[#0E1B2B]">
                      Últimos {days} dias
                    </span>
                    
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
                        <span>Inatividade prolongada</span>
                        <span className="text-[#0E1B2B] font-bold">{data.alerts_summary.inatividade}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
                        <span>Erro em tarefa crítica</span>
                        <span className="text-[#0E1B2B] font-bold">{data.alerts_summary.erro_critico}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
                        <span>Suporte sem resolução</span>
                        <span className="text-[#0E1B2B] font-bold">{data.alerts_summary.suporte}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
                        <span>Queda de engajamento</span>
                        <span className="text-[#0E1B2B] font-bold">{data.alerts_summary.desengajamento}</span>
                      </div>
                    </div>

                    <div className="mt-auto flex justify-end pt-4">
                      <button 
                        onClick={() => setIsAlertsOpen(true)}
                        className="py-1.5 px-4 bg-white hover:bg-gray-50 text-[#0E1B2B] border border-gray-200 text-xs font-bold rounded-full transition-colors cursor-pointer text-center shadow-sm flex items-center gap-1"
                      >
                        Ver alertas <span className="text-sm font-light leading-none">↗</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* KPI Cards (Span 2) */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-2 gap-6 h-full">
                  <StatCard
                    icon={<AlertTriangle size={22} />}
                    count={data.stats.risks}
                    title="Em risco"
                    colorScheme="red"
                  />
                  <StatCard
                    icon={<Eye size={22} />}
                    count={data.stats.attention}
                    title="Em atenção"
                    colorScheme="yellow"
                  />
                  <StatCard
                    icon={<ShieldCheck size={22} />}
                    count={data.stats.healthy}
                    title="Saudáveis"
                    colorScheme="green"
                  />
                  <StatCard
                    icon={<Info size={22} />}
                    count={data.stats.risks + data.stats.attention + data.stats.healthy}
                    title="Clientes totais"
                    colorScheme="grey"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Row of Left Area: Chart */}
            <div className="bg-[#F4FBFA] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 flex-1 flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-extrabold text-[#0E1B2B] flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0E1B2B]"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                  Variação média do CHS
                </h3>
                <p className="text-xs text-gray-500 font-semibold mt-1">Últimos {days} dias</p>
              </div>
              <div className="flex-1 min-h-[200px]">
                <ChartWidget data={data.chart} />
              </div>
            </div>

          </div>

          {/* Right Area (Span 4) - Priority Queue */}
          <div className="xl:col-span-4">
            <PriorityQueue users={data.queue} />
          </div>

        </div>
      </div>
      <ActiveAlertsModal isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />
    </MainLayout>
  );
}

function PrivateRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/clientes/:id" element={<PrivateRoute><CustomerProfile /></PrivateRoute>} />
        <Route path="/sebrae" element={<PrivateRoute><MiniSebraeHome /></PrivateRoute>} />
        <Route path="/sebrae/tarefa" element={<PrivateRoute><MiniSebraeTask /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/perfil" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/configuracoes" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/alertas" element={<PrivateRoute><Alerts /></PrivateRoute>} />
        <Route path="/clientes-lista" element={<PrivateRoute><CustomersList /></PrivateRoute>} />
        <Route path="/fila-priorizada" element={<PrivateRoute><PriorityQueuePage /></PrivateRoute>} />
      </Routes>
      <TrackerViewer />
    </>
  );
}

export default App;