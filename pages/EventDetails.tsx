
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Building, Trophy, Plus, Trash2, ArrowLeft, Search, Phone, ExternalLink, AlertCircle } from 'lucide-react';
import { useApp } from '../App';
import { Category, EventResult, User } from '../types';
import AthleteProfileModal from '../components/AthleteProfileModal';

const EventDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { db, setDb, user } = useApp();
  const event = db.events.find(e => e.id === id);

  const categories = useMemo(() => {
    if (!event) return [];
    const cats: Category[] = [];
    if (event.temCaiaque) cats.push('CAIAQUE');
    if (event.temEmbarcado) cats.push('EMBARCADO');
    if (event.temArremesso) cats.push('ARREMESSO');
    return cats;
  }, [event]);

  const [activeTab, setActiveTab] = useState<Category>(categories[0] || 'CAIAQUE');
  const [showAddResult, setShowAddResult] = useState(false);
  const [idNorteSearch, setIdNorteSearch] = useState('');
  const [score, setScore] = useState('');
  
  // Estado para o modal de perfil do atleta
  const [selectedAthleteProfile, setSelectedAthleteProfile] = useState<User | null>(null);

  const selectedAthlete = useMemo(() => {
    return db.users.find(u => u.idNorteNumero === idNorteSearch && u.nivel === 'ATLETA');
  }, [idNorteSearch, db.users]);

  // Verifica se o usuário logado participou deste evento (em qualquer categoria)
  const hasParticipated = useMemo(() => {
    if (!user || !event) return false;
    return db.results.some(r => r.eventId === event.id && r.userId === user.id);
  }, [db.results, event, user]);

  const results = useMemo(() => {
    if (!event) return [];
    const catResults = db.results.filter(r => r.eventId === event.id && r.categoria === activeTab);
    
    // Calculate rankings with tie handling
    const sorted = [...catResults].sort((a, b) => b.pontuacao - a.pontuacao);
    return sorted.map((res) => {
      const placement = 1 + sorted.filter(r => r.pontuacao > res.pontuacao).length;
      return { ...res, colocacao: placement };
    });
  }, [db.results, event, activeTab]);

  const handleAddResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthlete || !event) return;

    const newResult: EventResult = {
      id: `res-${Date.now()}`,
      eventId: event.id,
      categoria: activeTab,
      idNorteNumero: selectedAthlete.idNorteNumero!,
      userId: selectedAthlete.id,
      pontuacao: parseFloat(score),
      createdAt: new Date().toISOString()
    };

    setDb(prev => ({ ...prev, results: [...prev.results, newResult] }));
    setShowAddResult(false);
    setIdNorteSearch('');
    setScore('');
  };

  const removeResult = (resId: string) => {
    if (!confirm("Remover este resultado?")) return;
    setDb(prev => ({ ...prev, results: prev.results.filter(r => r.id !== resId) }));
  };

  if (!event) return <div className="p-8 text-center font-bold">Evento não encontrado.</div>;

  return (
    <div className="space-y-8 pb-20">
      <button onClick={() => navigate('/app/eventos')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-all group">
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Voltar para Calendário
      </button>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        {/* Banner do Evento */}
        <div className="h-64 md:h-80 bg-slate-100 relative">
          {event.logoDataUrl ? (
            <img src={event.logoDataUrl} alt={event.nomeEvento} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-600 to-indigo-900 flex items-center justify-center">
              <Trophy className="w-20 h-20 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-8 left-8 right-8 text-white">
             <div className="flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight">{event.nomeEvento}</h1>
                  <p className="text-white/80 font-medium mt-1">{event.instituicaoOrganizadora}</p>
                </div>
                {event.contactPhone && (
                  <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-2 font-black uppercase text-xs">
                    <Phone className="w-4 h-4" />
                    Contato: {event.contactPhone}
                  </div>
                )}
             </div>
          </div>
        </div>

        <div className="p-8 md:p-10 space-y-6">
          <p className="text-slate-500 text-lg leading-relaxed max-w-4xl">{event.descricao}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            <InfoItem icon={Calendar} label="Data Oficial" value={new Date(event.dataEvento).toLocaleDateString('pt-BR')} />
            <InfoItem icon={MapPin} label="Localidade" value={`${event.cidade} - ${event.estado}`} />
            <InfoItem icon={Building} label="Certificação" value="Homologado FNPE" />
            <InfoItem icon={Trophy} label="Responsável" value={event.responsaveis} />
          </div>
        </div>
      </div>

      {/* Aviso de participação */}
      {!hasParticipated && user?.nivel !== 'ADMIN' && (
        <div className="bg-slate-100 border border-slate-200 p-6 rounded-[32px] flex items-center gap-4 animate-in fade-in duration-500">
          <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-slate-700">Participação não registrada</p>
            <p className="text-sm text-slate-500 italic">Você não possui resultados oficiais registrados para este evento.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-100">
        <div className="bg-slate-50 border-b border-slate-100 p-3 flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`flex-1 min-w-[120px] py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${
                activeTab === cat 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <Trophy className="text-indigo-600 w-6 h-6" />
              Ranking: {activeTab}
            </h2>
            {user?.nivel === 'ADMIN' && (
              <button 
                onClick={() => setShowAddResult(true)}
                className="w-full md:w-auto bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 transition-all"
              >
                Lançar Resultado
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="py-5 px-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Colocação</th>
                  <th className="py-5 px-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Atleta / Competidor</th>
                  <th className="py-5 px-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">ID Norte</th>
                  <th className="py-5 px-4 font-black text-slate-400 uppercase text-[10px] tracking-widest text-right">Pontuação (cm/pts)</th>
                  {user?.nivel === 'ADMIN' && <th className="py-5 px-4 font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {results.length === 0 ? (
                  <tr><td colSpan={5} className="py-20 text-center text-slate-400 italic font-medium">Nenhum resultado oficial registrado.</td></tr>
                ) : (
                  results.map((res) => {
                    const athlete = db.users.find(u => u.id === res.userId);
                    const isCurrentUser = athlete?.id === user?.id;

                    return (
                      <tr key={res.id} className={`hover:bg-slate-50/50 transition-colors group ${isCurrentUser ? 'bg-indigo-50/30' : ''}`}>
                        <td className="py-5 px-4">
                          <span className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-sm shadow-sm ${
                            res.colocacao === 1 ? 'bg-amber-100 text-amber-600 border border-amber-200' : 
                            res.colocacao === 2 ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                            res.colocacao === 3 ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-white text-slate-400 border border-slate-100'
                          }`}>
                            {res.colocacao}º
                          </span>
                        </td>
                        <td className="py-5 px-4">
                          <button 
                            onClick={() => athlete && setSelectedAthleteProfile(athlete)}
                            className="text-left group/btn"
                          >
                            <p className={`font-bold transition-colors underline decoration-slate-200 decoration-2 underline-offset-4 group-hover/btn:decoration-indigo-300 ${
                              isCurrentUser ? 'text-indigo-700' : 'text-slate-900 group-hover/btn:text-indigo-600'
                            }`}>
                              {athlete?.nomeCompleto} {isCurrentUser && '(Você)'}
                            </p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{athlete?.cidade} - {athlete?.estado}</p>
                          </button>
                        </td>
                        <td className="py-5 px-4">
                          <span className="font-mono bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold">{res.idNorteNumero}</span>
                        </td>
                        <td className="py-5 px-4 text-right">
                          <div className={`font-black text-xl ${isCurrentUser ? 'text-indigo-700' : 'text-indigo-600'}`}>
                            {res.pontuacao.toLocaleString('pt-BR')}
                          </div>
                          <div className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Pontuação Bruta</div>
                        </td>
                        {user?.nivel === 'ADMIN' && (
                          <td className="py-5 px-4 text-center">
                            <button 
                              onClick={() => removeResult(res.id)}
                              className="p-3 bg-white text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-slate-100"
                              title="Excluir Resultado"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Lançar Resultado */}
      {showAddResult && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-emerald-600 p-8 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black tracking-tight">Lançar Resultado</h2>
                <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mt-1">{activeTab}</p>
              </div>
              <button onClick={() => setShowAddResult(false)} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAddResult} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">ID Norte do Atleta</label>
                <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                   <input 
                    required 
                    placeholder="Ex: ID-00001"
                    value={idNorteSearch} 
                    onChange={e => setIdNorteSearch(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                  />
                </div>
                {selectedAthlete && (
                  <div className="mt-4 p-4 bg-indigo-50 rounded-3xl border border-indigo-100 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl overflow-hidden shadow-lg">
                      {selectedAthlete.fotoUrl ? <img src={selectedAthlete.fotoUrl} className="w-full h-full object-cover" /> : selectedAthlete.nomeCompleto.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-indigo-900">{selectedAthlete.nomeCompleto}</p>
                      <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">{selectedAthlete.cidade} - {selectedAthlete.estado}</p>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Pontuação (Somatória)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  required 
                  placeholder="0.00"
                  value={score} 
                  onChange={e => setScore(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-black text-xl" 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddResult(false)} className="flex-1 py-4 font-black text-slate-400 uppercase text-xs tracking-widest hover:bg-slate-50 rounded-2xl">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={!selectedAthlete}
                  className="flex-1 py-4 bg-emerald-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Perfil do Atleta */}
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

const InfoItem: React.FC<{ icon: any, label: string, value: string }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100 shadow-sm">
    <div className="p-3 bg-white text-indigo-600 rounded-2xl shadow-sm">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-slate-900 font-bold leading-tight">{value}</p>
    </div>
  </div>
);

export default EventDetails;
