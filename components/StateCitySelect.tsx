
import React from 'react';
import { MapPin } from 'lucide-react';
import { BR_STATES } from '../data/geoBrasil';
import { MUNICIPIOS_POR_UF } from '../data/municipiosPorUf';

interface StateCitySelectProps {
  uf: string;
  cidade: string;
  onChangeUf: (uf: string) => void;
  onChangeCidade: (cidade: string) => void;
  disabled?: boolean;
  required?: boolean;
}

const StateCitySelect: React.FC<StateCitySelectProps> = ({
  uf,
  cidade,
  onChangeUf,
  onChangeCidade,
  disabled,
  required
}) => {
  // Garantimos que o lookup use a sigla UF (ex: "AM", "SP")
  const municipios = uf ? (MUNICIPIOS_POR_UF[uf] || []) : [];

  const handleUfChange = (newUf: string) => {
    // newUf virá como a sigla (value do option)
    onChangeUf(newUf);
    onChangeCidade(''); // Resetar cidade imediatamente para evitar inconsistência
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
          Estado (UF) {required && '*'}
        </label>
        <div className="relative">
          <select
            required={required}
            disabled={disabled}
            value={uf}
            onChange={(e) => handleUfChange(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 appearance-none disabled:opacity-50 transition-all"
          >
            <option value="">Selecione...</option>
            {BR_STATES.map((s) => (
              <option key={s.uf} value={s.uf}>
                {s.uf} — {s.nome}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
          Cidade / Município {required && '*'}
        </label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
          <select
            required={required}
            disabled={disabled || !uf}
            value={cidade}
            onChange={(e) => onChangeCidade(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 appearance-none disabled:opacity-50 transition-all"
          >
            {!uf ? (
              <option value="">Escolha o estado primeiro</option>
            ) : municipios.length > 0 ? (
              <>
                <option value="">Selecione a cidade...</option>
                {municipios.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </>
            ) : (
              <option value="OUTRA">Outra cidade (Digitação livre)</option>
            )}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
        {uf && municipios.length === 0 && (
          <p className="mt-1 text-[10px] text-amber-600 font-bold uppercase tracking-tight">
            Nenhuma cidade mapeada para {uf}. Selecione 'Outra'.
          </p>
        )}
      </div>
    </div>
  );
};

export default StateCitySelect;
