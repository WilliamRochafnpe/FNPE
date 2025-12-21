
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, MapPin, Building, Trophy, ShieldCheck, 
  Plus, Trash2, Image as ImageIcon, FileText, CheckCircle2, 
  AlertCircle, Phone, CreditCard, UploadCloud, Users, RefreshCw 
} from 'lucide-react';
import { useApp } from '../App';
import { Category, ResponsiblePerson, UploadFile, CertificationRequest } from '../types';
import { isCpfValid, isCnpjValid, normalizeDocument } from '../utils/cpf';

const CertificationRequestForm: React.FC = () => {
  const { user, db, setDb } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [logo, setLogo] = useState<string | null>(null);
  const [nomeEvento, setNomeEvento] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [instNome, setInstNome] = useState('');
  const [instDoc, setInstDoc] = useState('');
  const [docTipo, setDocTipo] = useState<'CPF' | 'CNPJ'>('CNPJ');
  const [responsaveis, setResponsaveis] = useState<ResponsiblePerson[]>([
    { id: 'resp-1', nome: '', telefone: '', funcao: '' }
  ]);
  const [anexos, setAnexos] = useState<UploadFile[]>([]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAnexoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        alert(`${file.name} é muito grande (Máx 2MB).`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnexos(prev => [...prev, {
          id: `file-${Date.now()}-${Math.random()}`,
          name: file.name,
          mime: file.type,
          size: file.size,
          dataUrl: reader.result as string
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const toggleCategory = (cat: Category) => {
    setCategorias(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const addResponsible = () => {
    setResponsaveis(prev => [...prev, { id: `resp-${Date.now()}`, nome: '', telefone: '', funcao: '' }]);
  };

  const removeResponsible = (id: string) => {
    setResponsaveis(prev => prev.filter(r => r.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validations
    if (categorias.length === 0) return alert("Selecione pelo menos uma categoria.");
    if (new Date(dataInicio) > new Date(dataFim)) return alert("Data de início não pode ser maior que o fim.");
    
    const pureDoc = normalizeDocument(instDoc);
    if (docTipo === 'CPF' && !isCpfValid(pureDoc)) return alert("CPF da instituição inválido.");
    if (docTipo === 'CNPJ' && !isCnpjValid(pureDoc)) return alert("CNPJ da instituição inválido.");

    setLoading(true);

    const request: CertificationRequest = {
      id: `cert-req-${Date.now()}`,
      status: 'PENDENTE',
      requestedAt: new Date().toISOString(),
      requestedByUserId: user.id,
      requestedByEmail: user.email,
      logoDataUrl: logo || undefined,
      nomeEvento,
      dataInicio,
      dataFim,
      descricao,
      categorias,
      cidade,
      estado,
      instituicaoNome: instNome,
      documento: pureDoc,
      documentoTipo: docTipo,
      responsaveis,
      anexos
    };

    setTimeout(() => {
      setDb(prev => ({
        ...prev,
        certificationRequests: [...(prev.certificationRequests || []), request]
      }));
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-8 animate-in zoom-in-95">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Solicitação Enviada!</h1>
          <p className="text-slate-500 mt-4 text-lg">A FNPE analisará os dados do evento <strong>{nomeEvento}</strong> e você receberá uma notificação em breve.</p>
        </div>
        <button 
          onClick={() => navigate('/app/eventos')}
          className="bg-indigo-600 text-white px-10 py-5 rounded-3xl font-black uppercase text-sm tracking-widest shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all"
        >
          Voltar para Eventos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <button onClick={() => navigate('/app/eventos')} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold mb-2 transition-all">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Solicitar Certificação</h1>
          <p className="text-slate-500">Preencha os dados do seu evento para homologação oficial FNPE.</p>
        </div>
        <ShieldCheck className="w-16 h-16 text-indigo-100 hidden md:block" />
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Bloco 1: O Evento */}
        <section className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Trophy className="w-5 h-5" /></div>
            Dados do Evento
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 flex flex-col items-center gap-3 py-6 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
               <div className="w-24 h-24 bg-white rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center">
                 {logo ? <img src={logo} className="w-full h-full object-cover" /> : <ImageIcon className="w-10 h-10 text-slate-200" />}
               </div>
               <label className="text-[10px] font-black uppercase tracking-widest bg-white border px-3 py-1.5 rounded-xl cursor-pointer hover:bg-slate-50 shadow-sm transition-all">
                 Logo do Evento
                 <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
               </label>
            </div>

            <div className="md:col-span-2 space-y-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nome do Evento *</label>
                  <input required value={nomeEvento} onChange={e => setNomeEvento(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800" placeholder="Ex: Torneio Rio Negro 2026" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Data Início *</label>
                    <input type="date" required value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Data Fim *</label>
                    <input type="date" required value={dataFim} onChange={e => setDataFim(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                  </div>
               </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Descrição / Detalhes</label>
            <textarea value={descricao} onChange={e => setDescricao(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-medium h-32" placeholder="Descreva os objetivos, premiação e regras básicas..." />
          </div>

          <div>
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Categorias do Evento *</label>
             <div className="flex flex-wrap gap-3">
                {['CAIAQUE', 'EMBARCADO', 'ARREMESSO', 'BARRANCO'].map(cat => (
                  <button 
                    key={cat} 
                    type="button"
                    onClick={() => toggleCategory(cat as Category)}
                    className={`px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest transition-all ${
                      categorias.includes(cat as Category) ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>
        </section>

        {/* Bloco 2: Localização e Instituição */}
        <section className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-6">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><MapPin className="w-5 h-5" /></div>
                  Localização
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cidade *</label>
                    <input required value={cidade} onChange={e => setCidade(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="Manaus" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">UF *</label>
                    <input required maxLength={2} value={estado} onChange={e => setEstado(e.target.value.toUpperCase())} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-center outline-none focus:ring-2 focus:ring-indigo-500 font-black" placeholder="AM" />
                  </div>
                </div>
             </div>

             <div className="space-y-6">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><Building className="w-5 h-5" /></div>
                  Organização
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Instituição Organizadora *</label>
                    <input required value={instNome} onChange={e => setInstNome(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="Associação X de Pesca" />
                  </div>
                  <div className="flex gap-4">
                     <select value={docTipo} onChange={e => setDocTipo(e.target.value as any)} className="bg-slate-100 border-none rounded-2xl p-4 outline-none font-black text-[10px] uppercase tracking-widest">
                       <option value="CNPJ">CNPJ</option>
                       <option value="CPF">CPF</option>
                     </select>
                     <input required value={instDoc} onChange={e => setInstDoc(e.target.value)} className="flex-1 bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="00.000.000/0001-00" />
                  </div>
                </div>
             </div>
          </div>
        </section>

        {/* Bloco 3: Responsáveis */}
        <section className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Users className="w-5 h-5" /></div>
              Equipe de Responsáveis
            </h2>
            <button type="button" onClick={addResponsible} className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1 hover:underline">
              <Plus className="w-4 h-4" /> Adicionar Outro
            </button>
          </div>

          <div className="space-y-4">
            {responsaveis.map((resp, index) => (
              <div key={resp.id} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="md:col-span-3">
                   <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Nome Completo</label>
                   <input required value={resp.nome} onChange={e => setResponsaveis(prev => prev.map(r => r.id === resp.id ? {...r, nome: e.target.value} : r))} className="w-full bg-white border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" />
                </div>
                <div className="md:col-span-2">
                   <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Telefone</label>
                   <input required value={resp.telefone} onChange={e => setResponsaveis(prev => prev.map(r => r.id === resp.id ? {...r, telefone: e.target.value} : r))} className="w-full bg-white border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="(00) 00000-0000" />
                </div>
                <div className="md:col-span-1">
                   <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Função</label>
                   <input value={resp.funcao} onChange={e => setResponsaveis(prev => prev.map(r => r.id === resp.id ? {...r, funcao: e.target.value} : r))} className="w-full bg-white border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="Diretor" />
                </div>
                <div className="flex justify-center">
                  {responsaveis.length > 1 && (
                    <button type="button" onClick={() => removeResponsible(resp.id)} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bloco 4: Anexos */}
        <section className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-xl text-slate-500"><UploadCloud className="w-5 h-5" /></div>
            Arquivos para Avaliação
          </h2>
          <div className="space-y-6">
            <label className="flex flex-col items-center justify-center gap-4 py-12 border-2 border-dashed border-slate-200 rounded-[32px] bg-slate-50/50 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all cursor-pointer">
              <UploadCloud className="w-12 h-12 text-slate-300" />
              <div className="text-center">
                <p className="font-black text-slate-900 uppercase text-xs tracking-widest">Clique ou arraste documentos</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">PDF, JPG, PNG ou DOCX (Máx 2MB por arquivo)</p>
              </div>
              <input type="file" multiple className="hidden" onChange={handleAnexoUpload} />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {anexos.map(file => (
                 <div key={file.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-indigo-400" />
                      <div>
                        <p className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{file.name}</p>
                        <p className="text-[9px] font-black text-slate-400">{(file.size/1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setAnexos(prev => prev.filter(f => f.id !== file.id))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                 </div>
               ))}
            </div>
          </div>
        </section>

        <div className="pt-10 flex flex-col md:flex-row gap-6">
          <button 
            type="button" 
            onClick={() => navigate('/app/eventos')}
            className="flex-1 py-5 rounded-3xl font-black text-slate-400 uppercase tracking-widest text-xs hover:bg-slate-100 transition-all"
          >
            Desistir
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="flex-[2] bg-indigo-600 text-white py-6 rounded-[32px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <>Solicitar Certificação Agora <CheckCircle2 className="w-6 h-6" /></>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CertificationRequestForm;
