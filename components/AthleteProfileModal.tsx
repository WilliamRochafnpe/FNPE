
import React from 'react';
import { X, MapPin, Trophy, Star, ShieldCheck, Phone, Mail } from 'lucide-react';
import { User, DB } from '../types';

interface Props {
  athlete: User;
  db: DB;
  onClose: () => void;
}

const AthleteProfileModal: React.FC<Props> = ({ athlete, db, onClose }) => {
  // Cálculo da pontuação geral (somatório de todos os resultados em todos os eventos)
  const totalPoints = db.results
    .filter(r => r.userId === athlete.id)
    .reduce((acc, curr) => acc + curr.pontuacao, 0);

  // Contagem de pódios (1º, 2º ou 3º lugares)
  const podiums = db.results.filter(r => {
    if (r.userId !== athlete.id) return false;
    // Precisamos recalcular a colocação aqui caso não esteja salva
    const catResults = db.results.filter(res => res.eventId === r.eventId && res.categoria === r.categoria);
    const sorted = [...catResults].sort((a, b) => b.pontuacao - a.pontuacao);
    const placement = 1 + sorted.filter(res => res.pontuacao > r.pontuacao).length;
    return placement <= 3;
  }).length;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-slate-900 text-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header/Banner */}
        <div className="h-32 bg-gradient-to-br from-indigo-600 to-slate-900 relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="px-8 pb-10 -mt-16 relative">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-slate-800 rounded-[40px] border-4 border-slate-900 overflow-hidden shadow-2xl flex items-center justify-center">
                {athlete.fotoUrl ? (
                  <img src={athlete.fotoUrl} alt={athlete.nomeCompleto} className="w-full h-full object-cover" />
                ) : (
                  <Trophy className="w-12 h-12 text-slate-600" />
                )}
              </div>
              {athlete.nivel === 'ATLETA' && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-2xl shadow-lg">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* Name & Info */}
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight">{athlete.nomeCompleto}</h2>
              <div className="flex items-center justify-center gap-2 text-slate-400 text-sm font-medium">
                <MapPin className="w-4 h-4 text-indigo-400" />
                {athlete.cidade} - {athlete.estado}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 w-full pt-4">
              <div className="bg-slate-800/50 p-5 rounded-3xl border border-slate-700/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Pontuação Geral</p>
                <p className="text-2xl font-black text-indigo-400">{totalPoints.toLocaleString('pt-BR')}</p>
                <p className="text-[10px] font-bold text-slate-500">PONTOS PTS</p>
              </div>
              <div className="bg-slate-800/50 p-5 rounded-3xl border border-slate-700/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Pódios Conquistados</p>
                <p className="text-2xl font-black text-emerald-400">{podiums}</p>
                <p className="text-[10px] font-bold text-slate-500">TOP 3 RANKING</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="w-full space-y-3 pt-4 text-left">
              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl">
                 <div className="flex items-center gap-3">
                   <Star className="w-4 h-4 text-amber-500" />
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID Norte</span>
                 </div>
                 <span className="font-mono font-bold text-slate-200">{athlete.idNorteNumero || 'NÃO FILIADO'}</span>
              </div>
              
              {athlete.telefone && (
                <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-2xl">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-300">{athlete.telefone}</span>
                </div>
              )}
              
              <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-2xl">
                <Mail className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-300 truncate">{athlete.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthleteProfileModal;
