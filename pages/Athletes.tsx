
import React, { useState, useMemo } from 'react';
import { Users, Search, Award, MapPin, ExternalLink, Shield } from 'lucide-react';
import { useApp } from '../App';
import { User } from '../types';

const Athletes: React.FC = () => {
  const { db } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState<User | null>(null);

  const athletes = db.users.filter(u => u.nivel !== 'ADMIN');
  
  const filteredAthletes = athletes.filter(a => 
    a.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.idNorteNumero?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAthletePoints = (userId: string) => {
    return db.results.filter(r => r.userId === userId).reduce((acc, curr) => acc + curr.pontuacao, 0);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Galeria de Atletas</h1>
        <p className="text-slate-500">Consulte a base de competidores filiados à FNPE.</p>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
        <input 
          type="text"
          placeholder="Buscar por nome ou ID Norte..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-3xl outline-none shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all text-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAthletes.map((athlete) => (
          <div key={athlete.id} onClick={() => setSelectedAthlete(athlete)} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                {athlete.fotoUrl ? <img src={athlete.fotoUrl} className="w-full h-full object-cover rounded-2xl" /> : <Users className="w-8 h-8" />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-lg leading-tight">{athlete.nomeCompleto}</h3>
                <p className="text-slate-400 text-sm font-medium">{athlete.nivel === 'ATLETA' ? 'Atleta Profissional' : 'Pescador Amador'}</p>
              </div>
              {athlete.nivel === 'ATLETA' && <Shield className="w-6 h-6 text-amber-500 fill-amber-50" />}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID Norte</span>
                <span className="font-mono text-indigo-600 font-bold">{athlete.idNorteNumero || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pontuação</span>
                <span className="text-lg font-black text-slate-900">{getAthletePoints(athlete.id).toLocaleString('pt-BR')}</span>
              </div>
              <div className="pt-3 flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                <MapPin className="w-4 h-4" />
                {athlete.cidade} - {athlete.estado}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedAthlete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedAthlete(null)}>
          <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="h-32 bg-indigo-600"></div>
            <div className="px-8 pb-8 -mt-16 text-center space-y-6">
              <div className="inline-block p-2 bg-white rounded-full shadow-xl">
                 <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white overflow-hidden">
                    {selectedAthlete.fotoUrl ? <img src={selectedAthlete.fotoUrl} className="w-full h-full object-cover" /> : <Users className="w-10 h-10 text-slate-400" />}
                 </div>
              </div>
              
              <div>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{selectedAthlete.nomeCompleto}</h2>
                <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm mt-1">{selectedAthlete.nivel}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-3xl text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">ID Norte</p>
                  <p className="text-slate-900 font-mono font-bold">{selectedAthlete.idNorteNumero || '---'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Pontos Gerais</p>
                  <p className="text-slate-900 font-bold text-xl">{getAthletePoints(selectedAthlete.id).toLocaleString('pt-BR')}</p>
                </div>
              </div>

              <div className="text-left space-y-4 bg-slate-50 p-6 rounded-3xl">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold text-xs uppercase">E-mail</span>
                  <span className="text-slate-700 font-semibold">{selectedAthlete.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold text-xs uppercase">Estado/Cidade</span>
                  <span className="text-slate-700 font-semibold">{selectedAthlete.estado} / {selectedAthlete.cidade}</span>
                </div>
              </div>

              {selectedAthlete.idNortePdfLink && (
                <a 
                  href={selectedAthlete.idNortePdfLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="block w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30"
                >
                  <ExternalLink className="w-5 h-5" />
                  Abrir Carteirinha PDF
                </a>
              )}

              <button 
                onClick={() => setSelectedAthlete(null)}
                className="w-full text-slate-400 font-bold uppercase text-xs tracking-widest hover:text-slate-600"
              >
                Fechar Perfil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Athletes;
