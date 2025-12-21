
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Trophy, Plus, Search, Phone, Image as ImageIcon, Edit3, Trash2, ShieldCheck } from 'lucide-react';
import { useApp } from '../App';
import { EventCertified } from '../types';
import EventFormModal from '../components/EventFormModal';

const Events: React.FC = () => {
  const { db, setDb, user } = useApp();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingEvent, setEditingEvent] = useState<EventCertified | undefined>(undefined);
  const [filter, setFilter] = useState('');

  const displayEvents = useMemo(() => {
    let baseEvents = db.events;
    return baseEvents.filter(e => 
      e.nomeEvento.toLowerCase().includes(filter.toLowerCase()) || 
      e.cidade.toLowerCase().includes(filter.toLowerCase()) ||
      e.estado.toLowerCase().includes(filter.toLowerCase())
    ).sort((a, b) => new Date(b.dataEvento).getTime() - new Date(a.dataEvento).getTime());
  }, [db.events, filter]);

  const handleOpenCreate = () => {
    setFormMode('create');
    setEditingEvent(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, event: EventCertified) => {
    e.preventDefault();
    e.stopPropagation();
    setFormMode('edit');
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, eventId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Tem certeza que deseja remover este evento certificado? Todos os resultados vinculados serão perdidos.")) {
      setDb(prev => ({
        ...prev,
        events: prev.events.filter(ev => ev.id !== eventId),
        results: prev.results.filter(res => res.eventId !== eventId)
      }));
    }
  };

  const handleSaveEvent = (eventData: EventCertified) => {
    setDb(prev => {
      if (formMode === 'create') {
        return { ...prev, events: [...prev.events, eventData] };
      } else {
        return {
          ...prev,
          events: prev.events.map(ev => ev.id === eventData.id ? eventData : ev)
        };
      }
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Eventos Certificados
          </h1>
          <p className="text-slate-500 font-medium">
            Calendário oficial de competições homologados pela FNPE.
          </p>
        </div>
        
        <div className="flex gap-2">
          {user?.nivel === 'ADMIN' ? (
            <button 
              onClick={handleOpenCreate}
              className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Certificar Evento
            </button>
          ) : (
            <button 
              onClick={() => navigate('/app/solicitar-certificacao')}
              className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
            >
              <ShieldCheck className="w-5 h-5" />
              Solicitar Certificação
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Pesquisar por nome, cidade ou estado..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayEvents.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200">
            <Trophy className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold italic">Nenhum evento certificado encontrado.</p>
          </div>
        ) : (
          displayEvents.map((event) => (
            <div key={event.id} className="relative group">
              {user?.nivel === 'ADMIN' && (
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  <button onClick={(e) => handleOpenEdit(e, event)} className="p-2 bg-white/90 backdrop-blur-sm text-indigo-600 rounded-xl shadow-lg hover:bg-indigo-600 hover:text-white transition-all"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={(e) => handleDelete(e, event.id)} className="p-2 bg-white/90 backdrop-blur-sm text-red-600 rounded-xl shadow-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
              
              <Link to={`/app/eventos/${event.id}`} className="block h-full">
                <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-2xl transition-all duration-300 h-full flex flex-col group-hover:-translate-y-1">
                  <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
                    {event.logoDataUrl ? (
                      <img src={event.logoDataUrl} alt={event.nomeEvento} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center"><ImageIcon className="w-12 h-12 text-slate-300" /></div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm">{event.estado}</div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(event.dataEvento).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{event.nomeEvento}</h3>
                    <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-2 font-medium">{event.descricao}</p>
                    <div className="space-y-3 pt-4 border-t border-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-600 text-xs font-bold uppercase"><MapPin className="w-4 h-4 text-slate-400" />{event.cidade}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {event.temCaiaque && <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase">Caiaque</span>}
                        {event.temEmbarcado && <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase">Embarcado</span>}
                        {event.temArremesso && <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase">Arremesso</span>}
                        {event.temBarranco && <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase">Barranco</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>

      <EventFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveEvent} mode={formMode} initialData={editingEvent} />
    </div>
  );
};

export default Events;
