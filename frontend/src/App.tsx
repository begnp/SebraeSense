import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { StatCard } from './components/dashboard/StatCard';
import { PriorityQueue } from './components/dashboard/PriorityQueue';
import { UserHighlightCard } from './components/dashboard/UserHighlightCard';
import { ChartWidget } from './components/dashboard/ChartWidget';
import { AlertTriangle, Eye, Leaf, Loader2 } from 'lucide-react';
import { useDashboardData } from './hooks/useDashboardData';
import { CustomerProfile } from './pages/CustomerProfile';
import { MiniSebraeHome } from './pages/sebrae/MiniSebraeHome';
import { MiniSebraeTask } from './pages/sebrae/MiniSebraeTask';
import { TrackerViewer } from './components/TrackerViewer';
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";

function Dashboard() {
  const { data, loading, error } = useDashboardData();
  const userName = localStorage.getItem("user_name") || "Usuário";

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
      <div className="flex flex-col h-full gap-6">

        <div>
          <h1 className="text-3xl font-bold text-[#1A2530]">Olá, {userName}.</h1>
          <p className="text-gray-600 mt-1">Monitore os usuários do Sebrae em tempo real.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={<AlertTriangle size={32} />}
            count={data.stats.risks}
            title="riscos"
            subtitle="Em risco: ação imediata"
            colorScheme="red"
          />
          <StatCard
            icon={<Eye size={32} />}
            count={data.stats.attention}
            title="em atenção"
            subtitle="Monitorar"
            colorScheme="yellow"
          />
          <StatCard
            icon={<Leaf size={32} />}
            count={data.stats.healthy}
            title="saudáveis"
            subtitle="Saudáveis: sem ação necessária"
            colorScheme="green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          <div className="lg:col-span-4 flex flex-col">
            <PriorityQueue users={data.queue} />
          </div>
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
              {data.highlights.map((user) => (
                <UserHighlightCard key={user.id} {...user} />
              ))}
            </div>
            <div className="h-64 mt-auto">
              <ChartWidget data={data.chart} />
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}

function PrivateRoute({ children }: { children: JSX.Element }) {
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