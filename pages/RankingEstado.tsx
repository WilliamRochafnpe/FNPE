
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft, MapPin, FileDown } from 'lucide-react';
import { useApp } from '../App';
import { Category, User } from '../types';
import AthleteProfileModal from '../components/AthleteProfileModal';

const STATE_NAMES: Record<string, string> = {
  AC: 'Acre',
  AM: 'Amazonas',
  AP: 'Amapá',
  PA: 'Pará',
  RO: 'Rondônia',
  RR: 'Roraima',
  TO: 'Tocantins'
};

const RankingEstado: React.FC = () => {
  const { uf } = useParams();
  const navigate = useNavigate();
  const { db } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<Category>('CAIAQUE');
  const [selectedAthleteProfile, setSelectedAthleteProfile] = useState<User | null>(null);

  const ranking = useMemo(() => {
    // Filtrar eventos do estado selecionado
    const validEvents = db.events.filter(e => e.estado === uf);
    const validEventIds = new Set(validEvents.map(e => e.id));
    
    const athleteScores: Record<string, { userId: string, score: number }> = {};
    
    db.results.forEach(res => {
      if (validEventIds.has(res.eventId) && res.categoria === selectedCategory) {
        if (!athleteScores[res.userId]) {
          athleteScores[res.userId] = { userId: res.userId, score: 0 };
        }
        athleteScores[res.userId].score += res.pontuacao;
      }
    });

    const sorted = Object.values(athleteScores).sort((a, b) => b.score - a.score);
    return sorted.map(item => {
      const placement = 1 + sorted.filter(i => i.score > item.score).length;
      return { ...item, placement };
    });
  }, [db.results, db.events, uf, selectedCategory]);

  const stateName = STATE_NAMES[uf || ''] || uf;

  const exportRanking = () => {
    const csvRows = [
      ["Posicao", "Nome", "ID Norte", "Cidade", "Pontuacao Total"].join(",")
    ];
    ranking.forEach(r => {
      const athlete = db.users.find(u => u.id === r.userId);
      csvRows.push([
        `${r.placement}º`,
        `"${athlete?.nomeCompleto || 'Desconhecido'}"`,
        athlete?.idNorteNumero || 'N/A',
        athlete?.cidade || 'N/A',
        r.score
      ].join(","));
    });
    
    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ranking_${uf}_${selectedCategory}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <button 
            onClick={() => navigate('/app/ranking-estadual')}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-all group mb-2"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Rankings Estaduais
          </button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <MapPin className="text-indigo-600 w-8 h-8" />
            Ranking {stateName}
          </h1>
        </div>
        <button 
          onClick={exportRanking}
          className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
        >
          <FileDown className="w-5 h-5" />
          Exportar CSV
        </button>
      </header>

      {/* Tabs de Categoria */}
      <div className="bg-white p-2 rounded-[32px] border border-slate-100 shadow-sm flex flex-wrap gap-2">
        {(['CAIAQUE', 'EMBARCADO', 'ARREMESSO'] as Category[]).map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`flex-1 min-w-[120px] py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
              selectedCategory === cat 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                : 'text-slate-400 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="py-5 px-8 font-black text-slate-400 uppercase text-[10px] tracking-widest">Posição</th>
                <th className="py-5 px-8 font-black text-slate-400 uppercase text-[10px] tracking-widest">Atleta / Competidor</th>
                <th className="py-5 px-8 font-black text-slate-400 uppercase text-[10px] tracking-widest">ID Norte</th>
                <th className="py-5 px-8 font-black text-slate-400 uppercase text-[10px] tracking-widest">Cidade</th>
                <th className="py-5 px-8 font-black text-slate-400 uppercase text-[10px] tracking-widest text-right">Pontuação Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ranking.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Trophy className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold italic">Nenhum atleta ranqueado nesta categoria para {stateName}.</p>
                  </td>
                </tr>
              ) : (
                ranking.map((item) => {
                  const athlete = db.users.find(u => u.id === item.userId);
                  return (
                    <tr key={item.userId} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-6 px-8">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-sm shadow-sm ${
                          item.placement === 1 ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                          item.placement === 2 ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                          item.placement === 3 ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                          'bg-white text-slate-400 border border-slate-100'
                        }`}>
                          {item.placement}º
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <button 
                          onClick={() => athlete && setSelectedAthleteProfile(athlete)}
                          className="text-left group/btn"
                        >
                          <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {athlete?.nomeCompleto}
                          </p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Filiado FNPE</p>
                        </button>
                      </td>
                      <td className="py-6 px-8">
                        <span className="font-mono bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold">
                          {athlete?.idNorteNumero || '---'}
                        </span>
                      </td>
                      <td className="py-6 px-8 text-slate-500 font-bold text-sm">{athlete?.cidade}</td>
                      <td className="py-6 px-8 text-right">
                        <div className="text-2xl font-black text-indigo-600">{item.score.toLocaleString('pt-BR')}</div>
                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Pontos Acumulados</div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAthleteProfile && (
        <AthleteProfileModal 
          athlete={selectedAthleteProfile} 
          db={db} 
          onClose={() => setSelectedAthleteProfile(null)} 
        />
      )}
    </div>
  );
};

export default RankingEstado;
