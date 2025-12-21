
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Trash2, Edit3, Download, Upload, RotateCcw, Search, User as UserIcon, Plus, X, Check, Mail, Users, AlertCircle, MapPin, ShieldCheck, Clock, Lock } from 'lucide-react';
import { useApp } from '../App';
import { resetToSeed, exportJSON, importJSONFile } from '../db';
import { UserLevel, User } from '../types';
import { normalizeCpf, formatCpf, isCpfValid } from '../utils/cpf';
import BackupRestorePanel from '../components/BackupRestorePanel';

const Admin: React.FC = () => {
  const { db, setDb, user: currentUser } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({
    nomeCompleto: '',
    email: '',
    cpf: '',
    nivel: 'PESCADOR',
    idNorteStatus: 'NAO_SOLICITADO',
    estado: '',
    cidade: ''
  });

  const filteredUsers = db.users.filter(u => 
    u.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCertsCount = (db.certificationRequests || []).filter(r => r.status === 'PENDENTE').length;

  const cycleLevel = (userId: string) => {
    if (userId === currentUser?.id) {
      alert("Você não pode alterar seu próprio nível.");
      return;
    }
    setDb(prev => ({
      ...prev,
      users: prev.users.map(u => {
        if (u.id === userId) {
          const levels: UserLevel[] = ['PESCADOR', 'ATLETA', 'ADMIN'];
          const currentIndex = levels.indexOf(u.nivel);
          const nextLevel = levels[(currentIndex + 1) % levels.length];
          const status = nextLevel === 'ATLETA' ? 'APROVADO' : u.idNorteStatus;
          return { ...u, nivel: nextLevel, idNorteStatus: status as any };
        }
        return u;
      })
    }));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cpfDigits = normalizeCpf(newUser.cpf || '');
    if (cpfDigits && !isCpfValid(cpfDigits)) {
      setError('CPF inválido.');
      return;
    }
    if (!newUser.email || !newUser.nomeCompleto || !newUser.estado || !newUser.cidade) {
      setError('Preencha os campos obrigatórios.');
      return;
    }
    const createdUser: User = {
      id: `user-${Date.now()}`,
      nomeCompleto: newUser.nomeCompleto!.trim(),
      email: newUser.email!.toLowerCase().trim(),
      cpf: cpfDigits,
      nivel: newUser.nivel as UserLevel,
      idNorteStatus: newUser.nivel === 'ATLETA' ? 'APROVADO' : 'NAO_SOLICITADO',
      estado: newUser.estado.toUpperCase().trim(),
      cidade: newUser.cidade.trim(),
      createdAt: new Date().toISOString()
    };
    setDb(prev => ({ ...prev, users: [...prev.users, createdUser] }));
    setIsAddModalOpen(false);
    setNewUser({ nomeCompleto: '', email: '', cpf: '', nivel: 'PESCADOR', idNorteStatus: 'NAO_SOLICITADO', estado: '', cidade: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Painel Administrativo</h1>
          <p className="text-slate-500 font-medium">Gestão global de usuários e sistema FNPE.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setIsAddModalOpen(true)} className="bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-xl transition-all active:scale-95"><Plus className="w-5 h-5" /> Novo Usuário</button>
          <button onClick={() => confirm("Resetar tudo?") && resetToSeed()} className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-600 hover:text-white transition-all" title="Limpar para Seed Original"><RotateCcw className="w-5 h-5" /></button>
        </div>
      </header>

      {/* Seção de Segurança / Backup */}
      <section className="animate-in slide-in-from-top-4 duration-700">
        <BackupRestorePanel />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button onClick={() => navigate('/app/admin/certificacoes')} className="bg-emerald-600 p-8 rounded-[40px] text-white space-y-4 shadow-2xl shadow-emerald-500/20 text-left group">
           <div className="flex justify-between items-start">
             <ShieldCheck className="w-12 h-12 opacity-50 group-hover:scale-110 transition-transform" />
             {pendingCertsCount > 0 && <span className="bg-white text-emerald-600 px-3 py-1 rounded-full text-xs font-black animate-pulse">{pendingCertsCount} PENDENTES</span>}
           </div>
           <div>
             <h2 className="text-2xl font-black tracking-tight">Certificações</h2>
             <p className="text-emerald-100 font-bold uppercase tracking-widest text-[10px]">Gerenciar Pedidos de Eventos</p>
           </div>
        </button>
        
        <div className="bg-indigo-600 p-8 rounded-[40px] text-white space-y-4 shadow-2xl shadow-indigo-500/20">
           <Users className="w-12 h-12 opacity-50" />
           <div>
             <h2 className="text-4xl font-black tracking-tight">{db.users.length}</h2>
             <p className="text-indigo-200 font-bold uppercase tracking-widest text-[10px]">Total de Usuários</p>
           </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-4">
           <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl w-fit"><Edit3 className="w-6 h-6" /></div>
           <div>
             <h2 className="text-4xl font-black text-slate-900 tracking-tight">{db.events.length}</h2>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Eventos Certificados</p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input type="text" placeholder="Pesquisar por nome ou e-mail..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="py-5 px-8 font-black text-slate-400 uppercase text-[10px] tracking-widest">Identificação</th>
                <th className="py-5 px-8 font-black text-slate-400 uppercase text-[10px] tracking-widest">Nível</th>
                <th className="py-5 px-8 font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 overflow-hidden">{u.fotoUrl ? <img src={u.fotoUrl} className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5" />}</div>
                      <div><p className="font-bold text-slate-900 leading-none mb-1">{u.nomeCompleto}</p><p className="text-xs text-slate-400">{u.email}</p></div>
                    </div>
                  </td>
                  <td className="py-5 px-8">
                    <button onClick={() => cycleLevel(u.id)} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${u.nivel === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : u.nivel === 'ATLETA' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{u.nivel}</button>
                  </td>
                  <td className="py-5 px-8 text-center">
                    <button onClick={() => { if(confirm("Remover?")) setDb(p => ({...p, users: p.users.filter(x => x.id !== u.id)})) }} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="bg-indigo-600 p-8 text-white flex justify-between items-center"><h2 className="text-2xl font-black tracking-tight">Novo Usuário</h2><button onClick={() => setIsAddModalOpen(false)} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all"><X className="w-6 h-6" /></button></div>
            <form onSubmit={handleAddUser} className="p-8 space-y-6">
              <input required value={newUser.nomeCompleto} onChange={e => setNewUser({...newUser, nomeCompleto: e.target.value})} placeholder="Nome Completo" className="w-full bg-slate-50 border-none rounded-2xl p-4 font-medium" />
              <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="E-mail" className="w-full bg-slate-50 border-none rounded-2xl p-4 font-medium" />
              <div className="grid grid-cols-2 gap-4">
                <input value={newUser.cidade} onChange={e => setNewUser({...newUser, cidade: e.target.value})} placeholder="Cidade" className="w-full bg-slate-50 border-none rounded-2xl p-4 font-medium" />
                <input maxLength={2} value={newUser.estado} onChange={e => setNewUser({...newUser, estado: e.target.value.toUpperCase()})} placeholder="UF" className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black text-center" />
              </div>
              {error && <div className="text-red-500 text-xs font-bold">{error}</div>}
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black uppercase text-xs rounded-2xl">Cadastrar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
