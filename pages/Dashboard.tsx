
import React, { useMemo } from 'react';
import { Trophy, Users, Calendar, Award, Star, TrendingUp, MapPin, Shield, User as UserIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { useApp } from '../App';

const Dashboard: React.FC = () => {
  const { db, user } = useApp();

  const athleteScores = useMemo(() => {
    const scores: Record<string, { id: string; name: string; total: number }> = {};
    db.results.forEach(res => {
      const athlete = db.users.find(u => u.id === res.userId);
      if (!athlete) return;
      if (!scores[res.userId]) {
        scores[res.userId] = { id: res.userId, name: athlete.nomeCompleto, total: 0 };
      }
      scores[res.userId].total += res.pontuacao;
    });
    return Object.values(scores).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [db.results, db.users]);

  const stateDistribution = useMemo(() => {
    const states: Record<string, number> = {};
    db.users.forEach(u => {
      if (u.estado) {
        states[u.estado] = (states[u.estado] || 0) + 1;
      }
    });
    return Object.entries(states).map(([name, value]) => ({ name, value }));
  }, [db.users]);

  const myStats = useMemo(() => {
    const results = db.results.filter(r => r.userId === user?.id);
    return {
      participations: results.length,
      totalScore: results.reduce((acc, curr) => acc + curr.pontuacao, 0)
    };
  }, [db.results, user?.id]);

  const COLORS = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Compacto e Escuro */}
      <section className="bg-slate-900 rounded-[40px] p-6 md:p-8 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-800 rounded-[32px] overflow-hidden border-2 border-slate-700 shadow-xl flex items-center justify-center text-slate-600">
            {user?.fotoUrl ? (
              <img src={user.fotoUrl} alt={user.nomeCompleto} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-10 h-10" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1.5 rounded-xl shadow-lg">
            <Shield className="w-4 h-4" />
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">{user?.nomeCompleto || 'Visitante'}</h1>
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit mx-auto md:mx-0">
              {user?.nivel || 'PESCADOR'}
            </span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3 mt-1 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            {user?.cidade || '---'}, {user?.estado || '--'}
          </div>
        </div>
        
        <div className="bg-slate-950/50 p-4 rounded-3xl border border-slate-800 text-center min-w-[120px]">
          <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">ID Norte</p>
          <p className="text-lg font-black text-emerald-500 font-mono">
            {user?.idNorteNumero || '---'}
          </p>
        </div>
      </section>

      {/* Quick Stats - Grid de 4 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Atletas" value={db.users.filter(u => u.nivel === 'ATLETA').length} />
        <StatCard icon={Calendar} label="Eventos" value={db.events.length} />
        <StatCard icon={Award} label="Pontos" value={myStats.totalScore.toLocaleString()} />
        <StatCard icon={Star} label="Status" value={user?.idNorteStatus === 'APROVADO' ? 'Ativo' : 'Pendente'} color={user?.idNorteStatus === 'APROVADO' ? 'text-emerald-400' : 'text-amber-400'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top 5 Athletes Chart */}
        <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-800 shadow-xl space-y-6">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <TrendingUp className="text-emerald-500 w-4 h-4" />
            Top 5 Pontuações
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={athleteScores} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={20}>
                  {athleteScores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* State Distribution */}
        <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-800 shadow-xl space-y-6">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <MapPin className="text-emerald-500 w-4 h-4" />
            Distribuição Regional
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stateDistribution}
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {stateDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: any, label: string, value: any, color?: string }> = ({ icon: Icon, label, value, color }) => (
  <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-lg group hover:border-emerald-500/50 transition-all">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-slate-800 rounded-xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
    <p className={`text-xl font-black ${color || 'text-white'}`}>{value}</p>
  </div>
);

export default Dashboard;
