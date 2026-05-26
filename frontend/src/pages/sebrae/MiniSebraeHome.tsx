import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTracker } from '../../hooks/useTracker';
import { ArrowRight, BookOpen, Briefcase, Lightbulb, TrendingUp } from 'lucide-react';

export function MiniSebraeHome() {
  // Use tracker to monitor behavior on the home page as well
  useTracker({ pageName: 'Mini Sebrae - Home' });
  const navigate = useNavigate();

  const handleStartTask = () => {
    navigate('/sebrae/tarefa');
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] font-sans text-gray-800">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/sebrae')}>
              {/* Fake Sebrae Logo using Tailwind colors */}
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#005AA5] mix-blend-multiply opacity-90"></div>
                <div className="w-8 h-8 rounded-full bg-[#00A859] mix-blend-multiply opacity-90"></div>
                <div className="w-8 h-8 rounded-full bg-[#FFB612] mix-blend-multiply opacity-90"></div>
              </div>
              <span className="font-bold text-2xl tracking-tight text-[#005AA5] ml-2">Sebrae</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-600 hover:text-[#005AA5] font-medium transition-colors">Cursos</a>
              <a href="#" className="text-gray-600 hover:text-[#005AA5] font-medium transition-colors">Ideias de Negócios</a>
              <a href="#" className="text-gray-600 hover:text-[#005AA5] font-medium transition-colors">Consultoria</a>
            </div>
            <div className="flex items-center">
              <button 
                onClick={handleStartTask}
                className="bg-[#005AA5] hover:bg-[#004785] text-white px-6 py-2.5 rounded-md font-semibold transition-all transform hover:scale-105 shadow-md flex items-center gap-2"
              >
                Acesse sua conta
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <div className="relative bg-gradient-to-br from-[#005AA5] to-[#003B6D] text-white overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-5 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#00A859] opacity-20 blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                O parceiro <span className="text-[#FFB612]">número 1</span> dos micro e pequenos negócios.
              </h1>
              <p className="text-xl md:text-2xl mb-10 text-blue-100 font-light max-w-2xl">
                Tudo o que você precisa para abrir, administrar e crescer a sua empresa em um só lugar.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleStartTask}
                  className="bg-[#FFB612] hover:bg-[#E5A310] text-[#003B6D] px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Abrir minha empresa <ArrowRight size={20} />
                </button>
                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center">
                  Falar com especialista
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 -mt-32 relative z-20">
            {[
              { icon: Briefcase, title: 'Formalização', desc: 'Abra seu MEI de forma rápida, fácil e gratuita.', color: 'text-[#005AA5]', bg: 'bg-blue-50' },
              { icon: BookOpen, title: 'Capacitação', desc: 'Cursos online gratuitos com certificado Sebrae.', color: 'text-[#00A859]', bg: 'bg-green-50' },
              { icon: TrendingUp, title: 'Crédito', desc: 'Soluções financeiras para alavancar seu negócio.', color: 'text-[#FFB612]', bg: 'bg-yellow-50' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-xl p-8 transition-transform hover:-translate-y-2 border border-gray-100 flex flex-col items-start cursor-pointer" onClick={handleStartTask}>
                <div className={`p-4 rounded-2xl ${item.bg} mb-6`}>
                  <item.icon className={`w-8 h-8 ${item.color}`} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6 flex-1">{item.desc}</p>
                <span className="text-[#005AA5] font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                  Saiba mais <ArrowRight size={16} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
