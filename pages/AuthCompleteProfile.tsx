
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User as UserIcon, Phone, CreditCard, UserPlus, AlertCircle, CheckCircle2, MessageCircle, ArrowRight, RefreshCw, ArrowLeft, MapPin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../App';
import { normalizeCpf, formatCpf, isCpfValid } from '../utils/cpf';
import { maskEmail } from '../utils/maskEmail';
import { User } from '../types';

const AuthCompleteProfile: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();
  const { db } = useApp();
  const { registerAndLogin } = useAuth();

  const [formData, setFormData] = useState({
    nomeCompleto: '',
    cpf: '',
    telefone: '',
    cidade: '',
    estado: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateUser, setDuplicateUser] = useState<User | null>(null);

  useEffect(() => {
    if (!email) navigate('/login/email');
  }, [email, navigate]);

  const isDirty = () => {
    return Object.values(formData).some(val => val.trim() !== '');
  };

  const handleBack = () => {
    if (isDirty() && !duplicateUser) {
      if (!window.confirm("Quer voltar? Os dados preenchidos aqui não serão salvos.")) {
        return;
      }
    }
    navigate(`/login/codigo?email=${encodeURIComponent(email)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDuplicateUser(null);

    const cpfDigits = normalizeCpf(formData.cpf);

    // Validação matemática do CPF
    if (!isCpfValid(cpfDigits)) {
      setError('CPF inválido. Confere os números e tenta de novo.');
      return;
    }

    if (!formData.estado.trim() || formData.estado.trim().length !== 2) {
      setError('Informe a sigla do estado (ex: AP).');
      return;
    }

    setLoading(true);

    try {
      const found = db.users.find(u => normalizeCpf(u.cpf ?? "") === cpfDigits);
      
      if (found) {
        setDuplicateUser(found);
        setLoading(false);
        return;
      }

      await registerAndLogin({
        email,
        nomeCompleto: formData.nomeCompleto.trim(),
        cpf: cpfDigits,
        telefone: formData.telefone.trim(),
        cidade: formData.cidade.trim(),
        estado: formData.estado.trim().toUpperCase()
      });

      alert("Perfil criado com sucesso! Bem-vindo à FNPE.");
      navigate('/app');
    } catch (err) {
      setError('Ocorreu um erro ao salvar seu perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleSupport = () => {
    const support = db.settings?.appSupport;
    const msg = encodeURIComponent("Olá! Meu CPF apareceu como já cadastrado no app FNPE e preciso de ajuda para acessar minha conta.");
    if (support?.supportWhatsApp) {
      window.open(`https://wa.me/${support.supportWhatsApp}?text=${msg}`, '_blank');
    } else if (support?.supportEmail) {
      window.open(`mailto:${support.supportEmail}?subject=Ajuda%20para%20acessar%20conta&body=${msg}`, '_blank');
    }
  };

  const handleGoToRecovery = () => {
    const cpfDigits = normalizeCpf(formData.cpf);
    navigate(`/login/recuperar?cpf=${cpfDigits}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors font-bold uppercase text-xs tracking-widest group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar para Código
        </button>

        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 relative">
          
          {duplicateUser ? (
            <div className="p-10 text-center space-y-8 animate-in zoom-in-95 duration-300">
               <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto rotate-3">
                 <AlertCircle className="w-10 h-10" />
               </div>
               
               <div className="space-y-4">
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight">Esse CPF já tem uma conta aqui 🙂</h2>
                 <p className="text-slate-500 leading-relaxed font-medium">
                   Pode ter sido você em outro e-mail. Se você quiser, dá pra recuperar seu acesso agora.
                 </p>
               </div>

               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Conta vinculada ao e-mail:</p>
                 <p className="text-lg font-bold text-slate-700">{maskEmail(duplicateUser.email)}</p>
               </div>

               <div className="space-y-4">
                  <button 
                    onClick={handleGoToRecovery}
                    className="w-full bg-indigo-600 text-white font-black uppercase text-xs tracking-widest py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
                  >
                    Quero recuperar meu acesso
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleSupport}
                    className="w-full bg-white text-slate-600 border border-slate-200 font-black uppercase text-xs tracking-widest py-5 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Falar com a FNPE
                  </button>
               </div>

               <button 
                 onClick={() => setDuplicateUser(null)}
                 className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline"
               >
                 Voltar e corrigir CPF
               </button>
            </div>
          ) : (
            <>
              <div className="bg-indigo-600 p-10 text-white relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                    <UserPlus className="w-8 h-8" />
                  </div>
                  <h1 className="text-3xl font-black tracking-tight">Quase lá!</h1>
                </div>
                <p className="text-indigo-100 font-medium">Complete seu perfil para participar da Federação Norte de Pesca Esportiva.</p>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nome Completo *</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                      <input
                        required
                        type="text"
                        value={formData.nomeCompleto}
                        onChange={e => setFormData({...formData, nomeCompleto: e.target.value})}
                        placeholder="Como aparece no seu documento"
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">CPF (Único) *</label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                        <input
                          required
                          type="text"
                          value={formData.cpf}
                          onChange={e => setFormData({...formData, cpf: formatCpf(e.target.value)})}
                          placeholder="000.000.000-00"
                          maxLength={14}
                          className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Telefone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                        <input
                          type="text"
                          value={formData.telefone}
                          onChange={e => setFormData({...formData, telefone: e.target.value})}
                          placeholder="(00) 00000-0000"
                          className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cidade *</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                        <input
                          required
                          type="text"
                          value={formData.cidade}
                          onChange={e => setFormData({...formData, cidade: e.target.value})}
                          placeholder="Ex: Macapá"
                          className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">UF *</label>
                      <input
                        required
                        type="text"
                        maxLength={2}
                        value={formData.estado}
                        onChange={e => setFormData({...formData, estado: e.target.value.toUpperCase().replace(/\s/g, '')})}
                        placeholder="AP"
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 text-center focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-black"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-3 bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 animate-in shake duration-300">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white font-black uppercase text-xs tracking-widest py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Finalizar Cadastro e Entrar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCompleteProfile;
