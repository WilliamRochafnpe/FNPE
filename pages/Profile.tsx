
import React, { useState } from 'react';
import { User as UserIcon, Camera, Save, Phone, CreditCard, Mail, AlertCircle, MapPin } from 'lucide-react';
import { useApp } from '../App';
import { normalizeCpf, formatCpf, isCpfValid } from '../utils/cpf';

const Profile: React.FC = () => {
  const { user, setUser, db, setDb } = useApp();
  const [formData, setFormData] = useState({
    nomeCompleto: user?.nomeCompleto || '',
    cpf: formatCpf(user?.cpf || ''),
    telefone: user?.telefone || '',
    cidade: user?.cidade || '',
    estado: user?.estado || '',
    fotoUrl: user?.fotoUrl || ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, fotoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);

    const cpfDigits = normalizeCpf(formData.cpf);

    if (cpfDigits && !isCpfValid(cpfDigits)) {
      setError('CPF inválido. Confere os números e tenta de novo.');
      return;
    }

    if (!formData.estado.trim() || formData.estado.trim().length !== 2) {
      setError('Informe a sigla do estado (ex: AP).');
      return;
    }
    
    setSaving(true);
    
    setTimeout(() => {
      const updatedUser = { 
        ...user, 
        ...formData,
        cpf: cpfDigits,
        estado: formData.estado.toUpperCase().trim()
      };
      
      setDb(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === user.id ? updatedUser : u)
      }));
      
      setUser(updatedUser);
      setSaving(false);
      alert("Perfil atualizado com sucesso!");
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Meu Perfil</h1>
        <p className="text-slate-500">Gerencie suas informações e foto de identificação.</p>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm text-center space-y-4">
            <div className="relative inline-block">
              <div className="w-40 h-40 bg-slate-100 rounded-[48px] overflow-hidden border-4 border-white shadow-xl flex items-center justify-center text-slate-300">
                {formData.fotoUrl ? (
                  <img src={formData.fotoUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-16 h-16" />
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-3 rounded-2xl shadow-lg cursor-pointer hover:bg-indigo-700 transition-all active:scale-90">
                <Camera className="w-6 h-6" />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg uppercase tracking-tight">Foto de Perfil</h3>
            </div>
            <div className="pt-4">
              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                user?.nivel === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 
                user?.nivel === 'ATLETA' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}>
                Nível: {user?.nivel}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <input 
                    type="text" 
                    value={formData.nomeCompleto}
                    onChange={e => setFormData({...formData, nomeCompleto: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">CPF</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                    <input 
                      type="text" 
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={e => setFormData({...formData, cpf: formatCpf(e.target.value)})}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                    <input 
                      type="text" 
                      placeholder="(00) 00000-0000"
                      value={formData.telefone}
                      onChange={e => setFormData({...formData, telefone: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cidade</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                    <input 
                      type="text" 
                      value={formData.cidade}
                      onChange={e => setFormData({...formData, cidade: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">UF</label>
                  <input 
                    type="text" 
                    maxLength={2}
                    value={formData.estado}
                    onChange={e => setFormData({...formData, estado: e.target.value.toUpperCase().replace(/\s/g, '')})}
                    className="w-full py-3 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-black text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">E-mail (Apenas Leitura)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <input 
                    type="email" 
                    disabled
                    value={user?.email}
                    className="w-full pl-12 pr-4 py-3 bg-slate-100 border border-transparent rounded-2xl text-slate-500 outline-none font-medium cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={saving}
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-3xl shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
