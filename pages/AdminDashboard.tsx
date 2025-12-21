
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Legend, Cell 
} from 'recharts';
import { 
  Users, Trophy, Calendar, MapPin, Download, Printer, 
  TrendingUp, TrendingDown, Filter, AlertCircle, FileJson, FileSpreadsheet,
  Settings, Save, RotateCcw, Image as ImageIcon, CheckCircle2
} from 'lucide-react';
import { Category } from '../types';
import { downloadCSV, downloadJSON, handlePrint } from '../utils/report';

const STATES = ['AP', 'PA', 'AM', 'AC', 'RR', 'RO', 'TO'];
const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const AdminDashboard: React.FC = () => {
  const { db, setDb, user } = useApp();
  
  // Filtros
  const [selectedState, setSelectedState] = useState<string>('TODOS');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'TODAS'>('TODAS');
  const [period, setPeriod] = useState<'30' | '90' | '180' | 'CUSTOM'>('90');
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 90)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Branding State
  const [brandingForm, setBrandingForm] = useState({
    appName: db.settings?.appBranding?.appName || '',
    appLogoDataUrl: db.settings?.appBranding?.appLogoDataUrl || ''
  });
  const [brandingSaving, setBrandingSaving] = useState(false);

  if (user?.nivel !== 'ADMIN') {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900">Acesso Restrito</h1>
        <p className="text-slate-500">Apenas administradores podem acessar esta página.</p>
      </div>
    );
  }

  // Lógica de Período
  const getPeriodDates = () => {
    let start = new Date(startDate);
    let end = new Date(endDate);
    
    if (period !== 'CUSTOM') {
      const days = parseInt(period);
      end = new Date();
      start = new Date();
      start.setDate(end.getDate() - days);
    }
    
    const diff = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime());
    const prevStart = new Date(start.getTime() - diff);
    
    return { start, end, prevStart, prevEnd };
  };

  const { start, end, prevStart, prevEnd } = getPeriodDates();

  // Filtragem de Dados Baseada nos Filtros
  const filteredData = useMemo(() => {
    const isStateMatch = (st: string | undefined) => selectedState === 'TODOS' || st === selectedState;
    const isDateInRange = (dateStr: string | undefined) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d >= start && d <= end;
    };
    const isPrevDateInRange = (dateStr: string | undefined) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d >= prevStart && d <= prevEnd;
    };

    const currentEvents = db.events.filter(e => isStateMatch(e.estado) && isDateInRange(e.dataEvento));
    const prevEvents = db.events.filter(e => isStateMatch(e.estado) && isPrevDateInRange(e.dataEvento));
    
    const currentResults = db.results.filter(r => {
      const evt = db.events.find(e => e.id === r.eventId);
      const catMatch = selectedCategory === 'TODAS' || r.categoria === selectedCategory;
      return isStateMatch(evt?.estado) && isDateInRange(evt?.dataEvento) && catMatch;
    });

    const currentIdNorte = db.users.filter(u => 
      isStateMatch(u.estado) && isDateInRange(u.idNorteAprovadoEm) && u.idNorteStatus === 'APROVADO'
    );
    const prevIdNorte = db.users.filter(u => 
      isStateMatch(u.estado) && isPrevDateInRange(u.idNorteAprovadoEm) && u.idNorteStatus === 'APROVADO'
    );

    return { currentEvents, prevEvents, currentResults, currentIdNorte, prevIdNorte };
  }, [db, selectedState, selectedCategory, start, end, prevStart, prevEnd]);

  // KPIs
  const kpis = {
    totalUsuarios: db.users.length,
    totalAtletas: db.users.filter(u => u.nivel === 'ATLETA').length,
    totalSemIdNorte: db.users.filter(u => u.idNorteStatus !== 'APROVADO').length,
    totalEventos: db.events.length,
    participantesPeriodo: new Set(filteredData.currentResults.map(r => r.userId)).size,
    eventosPeriodo: filteredData.currentEvents.length
  };

  // Crescimento
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const idNorteGrowth = calculateGrowth(filteredData.currentIdNorte.length, filteredData.prevIdNorte.length);
  const eventsGrowth = calculateGrowth(filteredData.currentEvents.length, filteredData.prevEvents.length);

  // Dados Gráficos: Eventos por Estado
  const eventsByStateData = STATES.map(st => ({
    name: st,
    eventos: db.events.filter(e => e.estado === st).length,
    participantes: new Set(db.results.filter(r => {
      const evt = db.events.find(e => e.id === r.eventId);
      return evt?.estado === st;
    }).map(r => r.userId)).size
  })).sort((a, b) => b.eventos - a.eventos);

  // Dados Gráficos: Timeline (Agrupado por Mês)
  const timelineData = useMemo(() => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      last6Months.push({
        month: label,
        eventos: db.events.filter(e => e.dataEvento.startsWith(label)).length,
        participantes: new Set(db.results.filter(r => {
          const evt = db.events.find(e => e.id === r.eventId);
          return evt?.dataEvento.startsWith(label);
        }).map(r => r.userId)).size
      });
    }
    return last6Months;
  }, [db]);

  // Período com mais eventos
  const peakMonth = [...timelineData].sort((a, b) => b.eventos - a.eventos)[0];

  // Branding Handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem é muito grande. O limite é 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBrandingForm(prev => ({ ...prev, appLogoDataUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveBranding = () => {
    setBrandingSaving(true);
    setTimeout(() => {
      setDb(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          appBranding: {
            appName: brandingForm.appName,
            appLogoDataUrl: brandingForm.appLogoDataUrl
          }
        }
      }));
      setBrandingSaving(false);
      alert("Configurações de branding salvas com sucesso!");
    }, 800);
  };

  const restoreDefaultBranding = () => {
    if (confirm("Deseja restaurar o nome e logo originais?")) {
      const defaultBranding = {
        appName: 'FNPE - Federação Norte de Pesca Esportiva',
        appLogoDataUrl: ''
      };
      setBrandingForm(defaultBranding);
      setDb(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          appBranding: defaultBranding
        }
      }));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 print:p-0 print:space-y-4">
      {/* Header Administrativo */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Dashboard ADM
            <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-full uppercase tracking-widest font-bold">Relatórios</span>
          </h1>
          <p className="text-slate-500 font-medium italic">Visão analítica completa da Federação Norte de Pesca Esportiva.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 shadow-sm"
          >
            <Printer className="w-4 h-4" /> Relatório Imprimível
          </button>
          
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700">
              <Download className="w-4 h-4" /> Exportar Dados
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl hidden group-hover:block z-50">
              <div className="p-2 space-y-1">
                <button onClick={() => downloadCSV('usuarios_fnpe.csv', db.users)} className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-sm flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Usuários (CSV)
                </button>
                <button onClick={() => downloadJSON('eventos_fnpe.json', db.events)} className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-sm flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-amber-600" /> Eventos (JSON)
                </button>
                <button onClick={() => downloadCSV('resultados_fnpe.csv', db.results)} className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-sm flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-600" /> Resultados (CSV)
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Seção de Configurações do App (Branding) */}
      <section className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8 print:hidden">
        <div className="flex items-center gap-2 text-indigo-600 font-bold">
          <Settings className="w-6 h-6" />
          <h2 className="text-xl font-black text-slate-900">Configurações do App (Branding)</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 flex flex-col items-center gap-4">
             <div className="relative group">
               <div className="w-32 h-32 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                 {brandingForm.appLogoDataUrl ? (
                   <img src={brandingForm.appLogoDataUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                 ) : (
                   <ImageIcon className="w-10 h-10 text-slate-300" />
                 )}
               </div>
               <label className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-xl shadow-lg cursor-pointer hover:bg-indigo-700 transition-all active:scale-95">
                 <ImageIcon className="w-4 h-4" />
                 <input type="file" className="hidden" accept="image/png,image/jpeg,image/webp" onChange={handleLogoUpload} />
               </label>
             </div>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
               Logo do App (SVG/PNG recomendado)
             </p>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nome da Federação / Aplicativo</label>
                <input 
                  type="text"
                  value={brandingForm.appName}
                  onChange={e => setBrandingForm(prev => ({ ...prev, appName: e.target.value }))}
                  placeholder="Ex: FNPE - Federação Norte de Pesca Esportiva"
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={saveBranding}
                  disabled={brandingSaving}
                  className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  {brandingSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Salvar Branding
                    </>
                  )}
                </button>
                <button 
                  onClick={restoreDefaultBranding}
                  className="px-6 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Restaurar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros de Análise */}
      <section className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6 print:hidden">
        <div className="flex items-center gap-2 text-indigo-600 font-bold mb-2">
          <Filter className="w-5 h-5" />
          Filtros Globais de Análise
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado</label>
            <select 
              value={selectedState} 
              onChange={e => setSelectedState(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
            >
              <option value="TODOS">Todos os Estados (Norte)</option>
              {STATES.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Período</label>
            <select 
              value={period} 
              onChange={e => setPeriod(e.target.value as any)}
              className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
            >
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="180">Últimos 180 dias</option>
              <option value="CUSTOM">Personalizado</option>
            </select>
          </div>

          {period === 'CUSTOM' && (
            <>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">De</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Até</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Categoria de Pesca</label>
            <select 
              value={selectedCategory} 
              onChange={e => setSelectedCategory(e.target.value as any)}
              className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
            >
              <option value="TODAS">Todas as Categorias</option>
              <option value="CAIAQUE">Caiaque</option>
              <option value="EMBARCADO">Embarcado</option>
              <option value="ARREMESSO">Arremesso</option>
            </select>
          </div>
        </div>
      </section>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          icon={Users} 
          label="Usuários Totais" 
          value={kpis.totalUsuarios} 
          subText={`${kpis.totalAtletas} Atletas | ${kpis.totalSemIdNorte} s/ ID Norte`}
          color="indigo" 
        />
        <KpiCard 
          icon={Calendar} 
          label="Eventos no Período" 
          value={kpis.eventosPeriodo} 
          subText={`${kpis.totalEventos} Total Histórico`}
          color="emerald" 
          growth={eventsGrowth}
        />
        <KpiCard 
          icon={Trophy} 
          label="Participantes Período" 
          value={kpis.participantesPeriodo} 
          subText="Atletas Únicos Ativos"
          color="amber" 
        />
        <KpiCard 
          icon={TrendingUp} 
          label="Crescimento ID Norte" 
          value={filteredData.currentIdNorte.length} 
          subText="Novas filiações aprovadas"
          color="slate" 
          growth={idNorteGrowth}
          growthFieldMissing={!db.users.some(u => u.idNorteAprovadoEm)}
        />
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribuição por Estado */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <MapPin className="text-indigo-600 w-5 h-5" />
              Presença Geográfica
            </h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventsByStateData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="eventos" name="Eventos Certificados" radius={[6, 6, 0, 0]} barSize={24}>
                  {eventsByStateData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
                <Bar dataKey="participantes" name="Atletas Participantes" fill="#94a3b8" radius={[6, 6, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Evolução Temporal */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
           <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="text-emerald-600 w-5 h-5" />
              Evolução Mensal (Timeline)
            </h2>
            <div className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
              Pico: {peakMonth?.month}
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorEventos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="eventos" name="Eventos" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorEventos)" />
                <Line type="monotone" dataKey="participantes" name="Participantes" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabela de Estados */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h2 className="text-xl font-black text-slate-900">Resumo Regional</h2>
          <p className="text-slate-500 text-sm">Distribuição detalhada por unidade federativa.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="py-5 px-8 font-black text-slate-400 uppercase text-[10px] tracking-widest">Estado (UF)</th>
                <th className="py-5 px-8 font-black text-slate-400 uppercase text-[10px] tracking-widest">Eventos</th>
                <th className="py-5 px-8 font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">Participantes</th>
                <th className="py-5 px-8 font-black text-slate-400 uppercase text-[10px] tracking-widest text-right">% Participação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {eventsByStateData.map(st => {
                const totalParticipantes = eventsByStateData.reduce((acc, curr) => acc + curr.participantes, 0);
                const percent = totalParticipantes > 0 ? (st.participantes / totalParticipantes) * 100 : 0;
                
                return (
                  <tr key={st.name} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                          {st.name}
                        </div>
                        <span className="font-bold text-slate-700">{st.name === 'AM' ? 'Amazonas' : st.name === 'PA' ? 'Pará' : st.name}</span>
                      </div>
                    </td>
                    <td className="py-5 px-8 font-bold text-slate-900">{st.eventos}</td>
                    <td className="py-5 px-8 text-center">
                      <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-black">
                        {st.participantes}
                      </span>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-black text-indigo-600">{percent.toFixed(1)}%</span>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const KpiCard: React.FC<{ 
  icon: any, 
  label: string, 
  value: number | string, 
  subText: string, 
  color: string, 
  growth?: number,
  growthFieldMissing?: boolean
}> = ({ icon: Icon, label, value, subText, color, growth, growthFieldMissing }) => {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-50 text-slate-600'
  };

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all">
      <div className="flex justify-between items-start">
        <div className={`p-4 rounded-2xl ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        
        {growth !== undefined && !growthFieldMissing && (
          <div className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-lg ${growth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(growth).toFixed(1)}%
          </div>
        )}
        
        {growthFieldMissing && (
          <div className="group relative">
            <span className="text-[10px] text-slate-300 font-bold border-b border-dashed border-slate-300 cursor-help">---</span>
            <div className="absolute top-full right-0 mt-2 w-40 bg-slate-900 text-white text-[9px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
              Campo 'idNorteAprovadoEm' ausente em alguns registros para calcular crescimento exato.
            </div>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</h3>
        <p className="text-4xl font-black text-slate-900 tracking-tight">{value}</p>
        <p className="text-xs text-slate-500 font-medium mt-1">{subText}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
