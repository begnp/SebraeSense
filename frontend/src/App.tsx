import type { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { StatCard } from './components/dashboard/StatCard';
import { PriorityQueue } from './components/dashboard/PriorityQueue';
import { ChartWidget } from './components/dashboard/ChartWidget';
import { AlertTriangle, Eye, Loader2, Info, ShieldCheck, Bell } from 'lucide-react';
import { useDashboardData } from './hooks/useDashboardData';
import { CustomerProfile } from './pages/CustomerProfile';
import { MiniSebraeHome } from './pages/sebrae/MiniSebraeHome';
import { MiniSebraeTask } from './pages/sebrae/MiniSebraeTask';
import { TrackerViewer } from './components/TrackerViewer';
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/settings";

function Dashboard() {
  const { data, loading, error } = useDashboardData();

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

                <button className="w-full py-2.5 mt-2 bg-[#0E1B2B] hover:bg-[#152a42] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center">
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