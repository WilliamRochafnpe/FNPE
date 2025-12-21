
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Trophy, Mail, ArrowRight, Waves, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { IS_LOCAL } from '../services/auth';

const AuthEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { requestOtp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      await requestOtp(email);
      navigate(`/login/codigo?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || "Erro ao solicitar código. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = (type: 'admin' | 'pescador' | 'atleta') => {
    const emails = {
      admin: 'williamrocha_25@icloud.com',
      pescador: 'pescador@demo.com',
      atleta: 'atleta@demo.com'
    };
    setEmail(emails[type]);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <Waves className="w-[1000px] h-[1000px] absolute -top-40 -left-40 text-emerald-500" />
      </div>

      <div className="w-full max-w-sm z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-[32px] shadow-2xl mb-6 shadow-emerald-500/20 rotate-3 transform hover:rotate-0 transition-all duration-300">
            <Trophy className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-1">FNPE</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Federação Norte de Pesca</p>
        </div>

        <div className="bg-slate-900 rounded-[40px] shadow-2xl p-10 border border-slate-800">
          <h2 className="text-xl font-black text-white mb-6 text-center">Entrar na Conta</h2>
          
          <form onSubmit={handleSend} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">E-mail de Acesso</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium"
                  required
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-[10px] font-bold text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-slate-950 font-black uppercase text-xs tracking-widest py-5 rounded-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? "Processando..." : (
                <>
                  Receber Código
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {IS_LOCAL && (
            <div className="mt-8 pt-8 border-t border-slate-800">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center mb-4">Modo Demonstração</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => demoLogin('admin')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-emerald-400 transition-all shadow-sm" title="ADM"><Shield className="w-5 h-5" /></button>
                <button onClick={() => demoLogin('atleta')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-amber-400 transition-all shadow-sm" title="ATLETA"><Trophy className="w-5 h-5" /></button>
                <button onClick={() => demoLogin('pescador')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-all shadow-sm" title="PESCADOR"><UserIcon className="w-5 h-5" /></button>
              </div>
            </div>
          )}
        </div>
        
        <p className="text-center mt-8 text-slate-600 text-xs font-medium">
          © 2025 Federação Norte de Pesca Esportiva
        </p>
      </div>
    </div>
  );
};

export default AuthEmail;
