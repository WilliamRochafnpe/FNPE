
import React, { useState, useMemo } from 'react';
import { 
  Trophy, ShieldCheck, Clock, CheckCircle2, XCircle, 
  Search, Eye, MapPin, Calendar, Building, FileText, 
  User as UserIcon, AlertCircle, X, Download, Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../App';
import { CertificationRequest, CertificationRequestStatus, EventCertified } from '../types';

const AdminCertificationRequests: React.FC = () => {
  const { db, setDb, user: admin } = useApp();
  const [filterStatus, setFilterStatus] = useState<CertificationRequestStatus | 'TODAS'>('PENDENTE');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReq, setSelectedReq] = useState<CertificationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const requests = useMemo(() => {
    const base = db.certificationRequests || [];
    return base.filter(r => {
      const matchStatus = filterStatus === 'TODAS' || r.status === filterStatus;
      const matchSearch = r.nomeEvento.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.instituicaoNome.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    }).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }, [db.certificationRequests, filterStatus, searchTerm]);

  const handleApprove = (req: CertificationRequest) => {
    if (!admin) return;
    if (!confirm(`Aprovar certificação do evento "${req.nomeEvento}"?`)) return;

    // Criar o Evento Certificado
    const newEvent: EventCertified = {
      id: `event-approved-${Date.now()}`,
      nomeEvento: req.nomeEvento,
      descricao: req.descricao || '',
      instituicaoOrganizadora: req.instituicaoNome,
      responsaveis: req.responsaveis.map(r => `${r.nome} (${r.telefone})`).join(', '),
      cidade: req.cidade,
      estado: req.estado,
      dataEvento: req.dataInicio,
      temCaiaque: req.categorias.includes('CAIAQUE'),
      temEmbarcado: req.categorias.includes('EMBARCADO'),
      temArremesso: req.categorias.includes('ARREMESSO'),
      temBarranco: req.categorias.includes('BARRANCO'),
      logoDataUrl: req.logoDataUrl,
      createdAt: new Date().toISOString()
    };

    setDb(prev => ({
      ...prev,
      events: [...prev.events, newEvent],
      certificationRequests: prev.certificationRequests.map(r => r.id === req.id ? {
        ...r,
        status: 'APROVADO',
        approvedAt: new Date().toISOString(),
        approvedBy: admin.email,
        eventId: newEvent.id
      } : r)
    }));
    
    setSelectedReq(null);
    alert("Evento certificado e publicado com sucesso!");
  };

  const handleReject = () => {
    if (!admin || !selectedReq || !rejectReason.trim()) return;

    setDb(prev => ({
      ...prev,
      certificationRequests: prev.certificationRequests.map(r => r.id === selectedReq.id ? {
        ...r,
        status: 'REPROVADO',
        rejectedAt: new Date().toISOString(),
        rejectedBy: admin.email,
        rejectReason: rejectReason
      } : r)
    }));

    // Reset de estados após reprovação bem sucedida
    setSelectedReq(null);
    setIsRejecting(false);
    setRejectReason('');
    alert("Solicitação reprovada.");
  };

  const closeModal = () => {
    if (isRejecting && rejectReason.trim()) {
      if (!confirm("Deseja cancelar a avaliação? O motivo digitado será perdido.")) return;
    }
    setSelectedReq(null);
    setIsRejecting(false);
    setRejectReason('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Solicitações de Certificação</h1>
        <p className="text-slate-500">Avalie os pedidos de homologação de eventos recebidos pela federação.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-full md:w-fit">
          {(['PENDENTE', 'APROVADO', 'REPROVADO', 'TODAS'] as const).map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filterStatus === st ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
          <input 
            placeholder="Buscar evento ou organizador..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-2xl p-4 pl-12 outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
             <Clock className="w-12 h-12 text-slate-100 mx-auto mb-4" />
             <p className="text-slate-400 font-bold italic">Nenhuma solicitação encontrada.</p>
          </div>
        ) : (
          requests.map(req => (
            <div key={req.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all">
               <div className="p-6 space-y-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden shadow-sm">
                        {req.logoDataUrl ? <img src={req.logoDataUrl} className="w-full h-full object-cover" alt="Logo Evento" /> : <Trophy className="w-6 h-6 text-slate-200" />}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 leading-tight">{req.nomeEvento}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{req.instituicaoNome}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      req.status === 'PENDENTE' ? 'bg-amber-100 text-amber-600' : 
                      req.status === 'APROVADO' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      {new Date(req.dataInicio).toLocaleDateString()} a {new Date(req.dataFim).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
                      <MapPin className="w-4 h-4 text-indigo-400" />
                      {req.cidade} - {req.estado}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
                      <UserIcon className="w-4 h-4 text-indigo-400" />
                      {req.requestedByEmail}
                    </div>
                  </div>
               </div>
               
               <div className="p-4 bg-slate-50 flex gap-2">
                 <button 
                  type="button"
                  onClick={() => setSelectedReq(req)}
                  className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
                 >
                   <Eye className="w-4 h-4" /> Detalhes
                 </button>
                 {req.status === 'PENDENTE' && (
                    <button 
                      type="button"
                      onClick={() => handleApprove(req)}
                      className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Aprovar
                    </button>
                 )}
               </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Detalhes da Solicitação */}
      {selectedReq && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-indigo-600 p-8 text-white flex justify-between items-center shrink-0">
               <div className="flex items-center gap-4">
                 <Building className="w-10 h-10 text-white/40" />
                 <div>
                   <h2 className="text-2xl font-black tracking-tight">Avaliar Solicitação</h2>
                   <p className="text-white/60 text-xs font-black uppercase tracking-widest">Homologação de Evento Certificado</p>
                 </div>
               </div>
               <button type="button" onClick={closeModal} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 hide-scrollbar">
               {/* Cabeçalho */}
               <div className="flex items-center gap-6">
                 <div className="w-24 h-24 bg-slate-100 rounded-[32px] border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                   {selectedReq.logoDataUrl ? <img src={selectedReq.logoDataUrl} className="w-full h-full object-cover" alt="Logo" /> : <ImageIcon className="w-10 h-10 text-slate-200" />}
                 </div>
                 <div className="space-y-1">
                   <h3 className="text-3xl font-black text-slate-900 tracking-tight">{selectedReq.nomeEvento}</h3>
                   <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">{selectedReq.instituicaoNome} - {selectedReq.documentoTipo}: {selectedReq.documento}</p>
                 </div>
               </div>

               {/* Grid Informações */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                    <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest">Logística</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 font-bold text-slate-700"><Calendar className="w-4 h-4 text-indigo-500" /> {new Date(selectedReq.dataInicio).toLocaleDateString()} até {new Date(selectedReq.dataFim).toLocaleDateString()}</div>
                      <div className="flex items-center gap-3 font-bold text-slate-700"><MapPin className="w-4 h-4 text-indigo-500" /> {selectedReq.cidade} - {selectedReq.estado}</div>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                    <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest">Categorias</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedReq.categorias.map(c => <span key={c} className="bg-white border border-slate-200 px-3 py-1 rounded-xl text-[9px] font-black uppercase text-slate-600">{c}</span>)}
                    </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest">Responsáveis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedReq.responsaveis.map(resp => (
                      <div key={resp.id} className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-indigo-600">{resp.nome.charAt(0)}</div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{resp.nome}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">{resp.telefone} | {resp.funcao || '---'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest">Anexos / Evidências ({selectedReq.anexos.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedReq.anexos.map(file => (
                      <a 
                        key={file.id} 
                        href={file.dataUrl} 
                        download={file.name}
                        className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100 hover:bg-indigo-100 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-6 h-6 text-indigo-500" />
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-indigo-900 truncate max-w-[150px]">{file.name}</p>
                            <p className="text-[9px] font-black text-indigo-400 uppercase">Baixar Arquivo</p>
                          </div>
                        </div>
                        <Download className="w-5 h-5 text-indigo-300 group-hover:text-indigo-600" />
                      </a>
                    ))}
                  </div>
               </div>
            </div>

            <div className="p-8 border-t border-slate-100 shrink-0">
               {isRejecting ? (
                 <div className="space-y-4 animate-in slide-in-from-bottom-2">
                    <label className="block text-xs font-black text-red-500 uppercase tracking-widest">Motivo da Reprovação *</label>
                    <textarea 
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder="Explique ao solicitante por que o evento não pôde ser certificado (dados insuficientes, conflito de datas, etc)..."
                      className="w-full bg-red-50 border border-red-100 rounded-2xl p-4 h-24 outline-none focus:ring-2 focus:ring-red-500 font-medium"
                    />
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setIsRejecting(false)} className="flex-1 py-4 font-black uppercase text-xs text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">Cancelar</button>
                      <button type="button" onClick={handleReject} disabled={!rejectReason.trim()} className="flex-[2] bg-red-600 text-white font-black uppercase text-xs rounded-2xl py-4 shadow-xl shadow-red-500/20 hover:bg-red-700 disabled:opacity-50 transition-all">Confirmar Reprovação</button>
                    </div>
                 </div>
               ) : (
                 <div className="flex gap-4">
                    {selectedReq.status === 'PENDENTE' ? (
                      <>
                        <button 
                          type="button"
                          onClick={() => setIsRejecting(true)} 
                          className="flex-1 py-4 bg-slate-100 text-slate-500 font-black uppercase text-xs rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" /> Reprovar
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleApprove(selectedReq)} 
                          className="flex-[2] bg-emerald-600 text-white font-black uppercase text-xs rounded-2xl py-4 shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-5 h-5" /> Certificar Evento
                        </button>
                      </>
                    ) : selectedReq.status === 'REPROVADO' ? (
                      <div className="w-full bg-red-50 p-4 rounded-2xl border border-red-100 flex items-start gap-4">
                         <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                         <div>
                           <p className="text-xs font-black text-red-600 uppercase tracking-widest">Reprovado em {new Date(selectedReq.rejectedAt!).toLocaleDateString()}</p>
                           <p className="text-sm text-red-800 font-medium mt-1">Motivo: {selectedReq.rejectReason}</p>
                         </div>
                      </div>
                    ) : (
                      <div className="w-full bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center justify-center gap-4">
                         <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                         <p className="text-xs font-black text-emerald-600 uppercase tracking-widest text-center">Certificado em {new Date(selectedReq.approvedAt!).toLocaleDateString()} por {selectedReq.approvedBy}</p>
                      </div>
                    )}
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCertificationRequests;
