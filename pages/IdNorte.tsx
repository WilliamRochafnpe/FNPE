
import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  FileText,
  AlertCircle,
  Info,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../App';
import { IdNorteRequest } from '../types';
import IdNorteCard from '../components/IdNorteCard';

const IdNortePage: React.FC = () => {
  const { db, setDb, user, setUser } = useApp();
  const [loading, setLoading] = useState(false);

  const pendingRequests = useMemo(() => {
    return db.requests.filter(r => r.status === 'PENDENTE');
  }, [db.requests]);

  const currentRequest = useMemo(() => {
    if (!user) return null;
    return [...db.requests]
      .sort((a, b) => b.dataSolicitacao.localeCompare(a.dataSolicitacao))
      .find(r => r.userId === user.id);
  }, [db.requests, user?.id]);

  const handleRequest = () => {
    if (!user) return;
    setLoading(true);
    
    const newRequest: IdNorteRequest = {
      id: `req-${Date.now()}`,
      userId: user.id,
      dataSolicitacao: new Date().toISOString(),
      status: 'PENDENTE'
    };

    setDb(prev => ({
      ...prev,
      requests: [...prev.requests, newRequest],
      users: prev.users.map(u => u.id === user.id ? { ...u, idNorteStatus: 'PENDENTE' } : u)
    }));
    
    setUser({ ...user, idNorteStatus: 'PENDENTE' });
    setTimeout(() => setLoading(false), 800);
  };

  const approveRequest = (req: IdNorteRequest) => {
    const nextNum = (db.users.filter(u => u.idNorteNumero).length + 1).toString().padStart(5, '0');
    const idNorteNumero = `ID-${nextNum}`;
    const idNortePdfLink = `https://example.com/carteirinha-${idNorteNumero}.pdf`;
    
    const adesao = new Date().toISOString();
    const validadeDate = new Date();
    validadeDate.setFullYear(validadeDate.getFullYear() + 1);
    const validade = validadeDate.toISOString();

    setDb(prev => ({
      ...prev,
      requests: prev.requests.map(r => r.id === req.id ? { ...r, status: 'APROVADO' } : r),
      users: prev.users.map(u => {
        if (u.id === req.userId) {
          return {
            ...u,
            idNorteStatus: 'APROVADO',
            idNorteNumero: u.idNorteNumero || idNorteNumero,
            idNortePdfLink: u.idNortePdfLink || idNortePdfLink,
            idNorteAdesao: u.idNorteAdesao || adesao,
            idNorteValidade: u.idNorteValidade || validade,
            nivel: 'ATLETA'
          };
        }
        return u;
      })
    }));
  };

  const rejectRequest = (req: IdNorteRequest) => {
    const reason = prompt("Informe o motivo da reprovação:");
    if (!reason) return;

    setDb(prev => ({
      ...prev,
      requests: prev.requests.map(r => r.id === req.id ? { ...r, status: 'REPROVADO', observacaoAdmin: reason } : r),
      users: prev.users.map(u => u.id === req.userId ? { ...u, idNorteStatus: 'REPROVADO' } : u)
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">
      <header className="text-center md:text-left">
        <h1 className="text-3xl font-black text-white tracking-tight">IDENTIDADE DIGITAL</h1>
        <p className="text-slate-500 font-medium italic mt-2">Documento oficial de filiação da FNPE.</p>
      </header>

      {user?.nivel === 'ADMIN' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="text-emerald-500 w-4 h-4" />
              Solicitações Pendentes
            </h2>
            <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-xl text-[10px] font-black">
              {pendingRequests.length} EM FILA
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {pendingRequests.map(req => {
              const requester = db.users.find(u => u.id === req.userId);
              return (
                <div key={req.id} className="bg-slate-900 p-6 rounded-[32px] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 font-black text-xl border border-slate-700 overflow-hidden">
                      {requester?.fotoUrl ? <img src={requester.fotoUrl} className="w-full h-full object-cover" /> : requester?.nomeCompleto.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white leading-tight">{requester?.nomeCompleto}</h3>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{requester?.cidade} - {requester?.estado}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => approveRequest(req)} className="flex-1 md:flex-none px-6 py-3 bg-emerald-500 text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all">Aprovar</button>
                    <button onClick={() => rejectRequest(req)} className="flex-1 md:flex-none px-6 py-3 bg-slate-800 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-700">Recusar</button>
                  </div>
                </div>
              );
            })}
            {pendingRequests.length === 0 && (
              <div className="py-20 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-[40px] text-slate-600 font-bold italic">
                <Clock className="w-8 h-8 mx-auto mb-4 opacity-20" />
                Sem solicitações pendentes.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {user?.idNorteStatus === 'NAO_SOLICITADO' && (
            <div className="bg-slate-900 p-10 rounded-[40px] border border-slate-800 text-center space-y-6 shadow-2xl">
              <div className="w-20 h-20 bg-indigo-500/10 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto">
                <CreditCard className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Solicite sua Filiação</h2>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">Tenha acesso aos rankings oficiais e torneios certificados da FNPE.</p>
              </div>
              <button 
                onClick={handleRequest}
                disabled={loading}
                className="w-full bg-emerald-500 text-slate-950 px-8 py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Processando...' : <>Solicitar ID Norte <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          )}

          {user?.idNorteStatus === 'PENDENTE' && (
            <div className="bg-slate-900 p-10 rounded-[40px] border border-amber-500/20 text-center space-y-6">
              <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                <Clock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase">Aguardando Análise</h2>
              <p className="text-slate-500 text-sm">Sua solicitação está na fila de aprovação dos administradores.</p>
              <div className="inline-block bg-amber-500/10 text-amber-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                Status: Pendente
              </div>
            </div>
          )}

          {user?.idNorteStatus === 'REPROVADO' && (
            <div className="bg-slate-900 p-10 rounded-[40px] border border-red-500/20 text-center space-y-6">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white">Solicitação Recusada</h2>
              {currentRequest?.observacaoAdmin && (
                <p className="text-red-400 text-sm italic">"{currentRequest.observacaoAdmin}"</p>
              )}
              <button 
                onClick={handleRequest}
                className="w-full bg-slate-800 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-700"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {user?.idNorteStatus === 'APROVADO' && (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
              <IdNorteCard user={user} />

              <div className="grid grid-cols-1 gap-4">
                {user.idNortePdfLink && (
                  <a 
                    href={user.idNortePdfLink} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-full bg-emerald-500 text-slate-950 py-5 rounded-3xl font-black text-xs uppercase tracking-widest text-center hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20"
                  >
                    <FileText className="w-5 h-5" /> Baixar Carteirinha PDF
                  </a>
                )}
                <div className="bg-slate-900 p-6 rounded-[32px] border border-slate-800 flex gap-4 items-center">
                  <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                  <p className="text-slate-500 text-[10px] font-bold uppercase leading-relaxed tracking-wide">
                    Este documento digital é válido em todos os eventos certificados pela federação nacional e estadual.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default IdNortePage;
