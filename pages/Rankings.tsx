
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, MapPin, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../App';

const STATES = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'TO', name: 'Tocantins' }
];

const Rankings: React.FC = () => {
  const { db } = useApp();
  const navigate = useNavigate();
  const covers = db.settings?.rankingsCovers || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Rankings Estaduais</h1>
        <p className="text-slate-500 font-medium italic">Selecione um estado para visualizar a classificação oficial FNPE.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {STATES.map((state) => (
          <button
            key={state.uf}
            onClick={() => navigate(`/app/ranking-estadual/${state.uf}`)}
            className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left"
          >
            {/* Capa do Card */}
            <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
              {covers[state.uf] ? (
                <img 
                  src={covers[state.uf]} 
                  alt={`Capa ${state.name}`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-slate-800 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-white/20" />
                </div>
              )}
              <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                {state.uf}
              </div>
            </div>

            <div className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                  {state.name}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ranking Estadual FNPE</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        ))}
      </div>

      <div className="bg-indigo-50 p-8 rounded-[40px] border border-indigo-100 flex flex-col md:flex-row items-center gap-6">
        <div className="bg-indigo-600 p-4 rounded-3xl shadow-xl shadow-indigo-500/20 text-white">
          <Trophy className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Sobre a Pontuação Estadual</h2>
          <p className="text-slate-500 text-sm max-w-2xl mt-1 leading-relaxed">
            Os rankings estaduais são calculados automaticamente com base na somatória das pontuações obtidas pelos atletas em eventos certificados dentro de cada estado e categoria.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Rankings;
