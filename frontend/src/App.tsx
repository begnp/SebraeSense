import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
      <div className="flex flex-col h-full gap-6">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold text-[#1A2530]">Olá, Marcela.</h1>
          <p className="text-gray-600 mt-1">Monitore os usuários do Sebrae em tempo real.</p>
        </div>

        {/* Top KPIs */}
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

        {/* Main Content Grid */}
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

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clientes/:id" element={<CustomerProfile />} />
        <Route path="/sebrae" element={<MiniSebraeHome />} />
        <Route path="/sebrae/tarefa" element={<MiniSebraeTask />} />
      </Routes>
      <TrackerViewer />
    </>
  );
}

export default App;