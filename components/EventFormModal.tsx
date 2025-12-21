
import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, MapPin } from 'lucide-react';
import { EventCertified } from '../types';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: EventCertified) => void;
  mode: 'create' | 'edit';
  initialData?: EventCertified;
}

const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, onSave, mode, initialData }) => {
  const [formData, setFormData] = useState<Partial<EventCertified>>({
    nomeEvento: '',
    descricao: '',
    instituicaoOrganizadora: '',
    responsaveis: '',
    cidade: '',
    estado: '',
    dataEvento: '',
    temCaiaque: false,
    temEmbarcado: false,
    temArremesso: false,
    logoDataUrl: '',
    contactPhone: ''
  });

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        nomeEvento: '', descricao: '', instituicaoOrganizadora: '', responsaveis: '',
        cidade: '', estado: '', dataEvento: '', temCaiaque: false,
        temEmbarcado: false, temArremesso: false, logoDataUrl: '', contactPhone: ''
      });
    }
  }, [mode, initialData, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoDataUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nomeEvento || !formData.dataEvento || !formData.cidade || !formData.estado) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (formData.estado?.length !== 2) {
      alert("Informe a sigla do estado (ex: AP).");
      return;
    }

    const eventToSave = {
      ...formData,
      id: mode === 'create' ? `event-${Date.now()}` : formData.id!,
      estado: formData.estado.toUpperCase().trim(),
      cidade: formData.cidade.trim(),
      createdAt: mode === 'create' ? new Date().toISOString() : formData.createdAt,
      updatedAt: mode === 'edit' ? new Date().toISOString() : undefined
    } as EventCertified;

    onSave(eventToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
          <h2 className="text-2xl font-black tracking-tight">{mode === 'create' ? 'Certificar Novo Evento' : 'Editar Evento'}</h2>
          <button onClick={onClose} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto hide-scrollbar">
          <div className="flex flex-col items-center gap-4 py-4 border-2 border-dashed border-slate-100 rounded-[32px] bg-slate-50/50">
            <div className="w-24 h-24 bg-white rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center">
              {formData.logoDataUrl ? (
                <img src={formData.logoDataUrl} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-300" />
              )}
            </div>
            <label className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase cursor-pointer hover:bg-slate-100 transition-all">
              Mudar Logo
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nome do Evento *</label>
              <input required value={formData.nomeEvento} onChange={e => setFormData({...formData, nomeEvento: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cidade *</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <input required value={formData.cidade} onChange={e => setFormData({...formData, cidade: e.target.value})} placeholder="Ex: Macapá" className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 outline-none focus:ring-2 focus:ring-indigo-500 font-medium" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">UF *</label>
                <input required maxLength={2} value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value.toUpperCase().replace(/\s/g, '')})} placeholder="AP" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-center outline-none focus:ring-2 focus:ring-indigo-500 font-black" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Data *</label>
                <input type="date" required value={formData.dataEvento} onChange={e => setFormData({...formData, dataEvento: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Organizador</label>
                <input required value={formData.instituicaoOrganizadora} onChange={e => setFormData({...formData, instituicaoOrganizadora: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-medium" />
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 pt-4 border-t border-slate-50">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-black text-slate-400 uppercase text-xs hover:bg-slate-50 rounded-2xl">Cancelar</button>
            <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black uppercase text-xs rounded-2xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all">Salvar Evento</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModal;
