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

interface ActiveAlert {
  id: number;
  customer_id: number;
  customer_name: string;
  company: string;
  reason: string;
  created_at: string;
}

function ActiveAlertsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<ActiveAlert[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchActiveAlerts = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:8000/api/customers/alerts/active');
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

  if (!isOpen) return null;

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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-[#6B4C9A]" size={36} />
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-semibold text-sm">
            Nenhum alerta ativo no momento.
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 flex flex-col gap-3.5 pr-1 py-1">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className="bg-[#F4F7FA] rounded-[16px] p-4 border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-xs text-[#0E1B2B]">{alert.customer_name}</span>
                    <span className="text-[10px] text-gray-400 font-bold bg-gray-200/50 px-2 py-0.5 rounded-full">{alert.company}</span>
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
  const { data, loading, error } = useDashboardData();
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
      <div className="flex flex-col gap-6 font-sans">
        
        {/* Top KPIs Row (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Info size={22} />}
            count={data.stats.risks + data.stats.attention + data.stats.healthy}
            title="Clientes totais"
            colorScheme="grey"
          />
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
        </div>

        {/* Main Content Grid (Left Span 8, Right Span 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (Span 8) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Alertas de Clientes Card */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(52,180,166,0.06)] border border-gray-100 flex flex-col sm:flex-row gap-6 justify-between">
              
              {/* Left Side: Title and Icon */}
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-[#0E1B2B]">
                  <Bell size={24} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xl font-extrabold text-[#0E1B2B] mt-1.5">
                    Alertas de Clientes
                  </h3>
                </div>
              </div>

              {/* Right Side: Grey Box with list of alerts */}
              <div className="bg-[#E5EFEA] rounded-[20px] p-6 w-full sm:w-80 flex flex-col gap-4">
                <span className="text-sm font-extrabold text-[#0E1B2B]">
                  Últimos 30 dias
                </span>
                
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
                    <span>Inatividade prolongada</span>
                    <span className="text-[#0E1B2B] font-bold">14</span>
                  </div>
                  <hr className="border-gray-200/50" />
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
                    <span>Erro em tarefa crítica</span>
                    <span className="text-[#0E1B2B] font-bold">11</span>
                  </div>
                  <hr className="border-gray-200/50" />
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
                    <span>Suporte sem resolução</span>
                    <span className="text-[#0E1B2B] font-bold">9</span>
                  </div>
                  <hr className="border-gray-200/50" />
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
                    <span>Queda de engajamento</span>
                    <span className="text-[#0E1B2B] font-bold">8</span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsAlertsOpen(true)}
                  className="w-full py-2.5 mt-2 bg-[#0E1B2B] hover:bg-[#152a42] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                >
                  Ver alertas →
                </button>
              </div>

            </div>

            {/* Chart Widget */}
            <div className="h-72">
              <ChartWidget data={data.chart} />
            </div>

          </div>

          {/* Right Column (Span 4) */}
          <div className="lg:col-span-4">
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
      </Routes>
      <TrackerViewer />
    </>
  );
}

export default App;