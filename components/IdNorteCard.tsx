
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { User as UserIcon, ShieldCheck, Loader2 } from 'lucide-react';
import { User } from '../types';

interface IdNorteCardProps {
  user: User;
}

const IdNorteCard: React.FC<IdNorteCardProps> = ({ user }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  
  const qrValue = `${window.location.origin}/#/app/consultar-id-norte?numero=${encodeURIComponent(user.idNorteNumero || '')}`;

  useEffect(() => {
    let active = true;
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(qrValue, {
          margin: 1,
          width: 200,
          color: { dark: '#000000', light: '#ffffff' }
        });
        if (active) setQrDataUrl(url);
      } catch (err) {
        console.error("Erro ao gerar QR Code:", err);
      }
    };

    if (user.idNorteNumero) generateQR();
    return () => { active = false; };
  }, [qrValue, user.idNorteNumero]);

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '---';
    return new Date(isoStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className="w-full bg-slate-900 rounded-[40px] border border-slate-800 shadow-2xl overflow-hidden relative group">
      {/* Background Gradient Accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
      
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-slate-800 rounded-3xl border border-slate-700 flex items-center justify-center overflow-hidden">
                {user.fotoUrl ? (
                  <img src={user.fotoUrl} alt={user.nomeCompleto} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-8 h-8 text-slate-600" />
                )}
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 leading-none">Atleta Federado</p>
               <h2 className="text-xl font-black text-white uppercase tracking-tight">{user.nomeCompleto}</h2>
             </div>
          </div>
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
        </div>

        <div className="grid grid-cols-2 gap-y-6">
          <div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">ID Norte</p>
            <p className="text-emerald-500 font-mono font-black text-lg leading-none">{user.idNorteNumero || '---'}</p>
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Nascimento</p>
            <p className="text-white font-bold text-sm leading-none">{formatDate(user.dataNascimento)}</p>
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Adesão</p>
            <p className="text-white font-bold text-sm leading-none">{formatDate(user.idNorteAdesao)}</p>
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Validade</p>
            <p className="text-indigo-400 font-bold text-sm leading-none">{formatDate(user.idNorteValidade)}</p>
          </div>
        </div>

        <div className="flex justify-center pt-4 border-t border-slate-800/50">
          <div className="bg-white p-2 rounded-2xl shadow-xl w-24 h-24 flex items-center justify-center">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Validação" className="w-full h-full" />
            ) : (
              <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-950/50 p-4 text-center">
        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">Federação Norte de Pesca Esportiva</p>
      </div>
    </div>
  );
};

export default IdNorteCard;
