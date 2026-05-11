import React from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { StatCard } from './components/dashboard/StatCard';
import { PriorityQueue } from './components/dashboard/PriorityQueue';
import { UserHighlightCard } from './components/dashboard/UserHighlightCard';
import { ChartWidget } from './components/dashboard/ChartWidget';
import { AlertTriangle, Eye, Leaf } from 'lucide-react';

function App() {
  const highlightUsers = [
    {
      initials: 'JS',
      name: 'João Santos',
      company: 'Tech Norte LTDA',
      score: 18,
      alertCount: 5,
      reason: '3 erros consecutivos no cadastro',
      engagement: 20,
      progression: 40,
      success: 30,
    },
    {
      initials: 'JS',
      name: 'João Santos',
      company: 'Tech Norte LTDA',
      score: 18,
      alertCount: 5,
      reason: '3 erros consecutivos no cadastro',
      engagement: 30,
      progression: 45,
      success: 25,
    },
    {
      initials: 'JS',
      name: 'João Santos',
      company: 'Tech Norte LTDA',
      score: 18,
      alertCount: 5,
      reason: '3 erros consecutivos no cadastro',
      engagement: 15,
      progression: 30,
      success: 10,
    },
  ];

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
            count={68}
            title="riscos"
            subtitle="Em risco: ação imediata"
            colorScheme="red"
          />
          <StatCard
            icon={<Eye size={32} />}
            count={94}
            title="em atenção"
            subtitle="Monitorar"
            colorScheme="yellow"
          />
          <StatCard
            icon={<Leaf size={32} />}
            count={85}
            title="saudáveis"
            subtitle="Saudáveis: sem ação necessária"
            colorScheme="green"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Left Column - Priority Queue */}
          <div className="lg:col-span-4 flex flex-col">
            <PriorityQueue />
          </div>

          {/* Right Column - Highlights & Chart */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Highlight Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
              {highlightUsers.map((user, index) => (
                <UserHighlightCard key={index} {...user} />
              ))}
            </div>

            {/* Chart Row */}
            <div className="h-64 mt-auto">
              <ChartWidget />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default App;
