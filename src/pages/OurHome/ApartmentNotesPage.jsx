import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, X, Star, MapPin, Trash2,
    ChevronDown, ChevronUp, Building2, DollarSign
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';

const STATUS_CONFIG = {
    favorito: { label: 'Favorito', color: 'bg-amber-100 text-amber-700', emoji: '⭐' },
    en_evaluacion: { label: 'En Evaluación', color: 'bg-blue-100 text-blue-700', emoji: '🔍' },
    descartado: { label: 'Descartado', color: 'bg-gray-100 text-gray-500', emoji: '❌' },
};

const ApartmentNotesPage = () => {
    const navigate = useNavigate();
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    const [form, setForm] = useState({
        name: '', address: '', rating: 3, price: '', expenses: '',
        pros: '', cons: '', notes: '', status: 'en_evaluacion',
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => { fetchApartments(); }, []);

    const fetchApartments = async () => {
        try {
            const { data, error } = await supabase
                .from('home_apartments')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setApartments(data || []);
        } catch (e) {
            console.error('Error:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!form.name.trim()) return;
        try {
            const payload = {
                name: form.name,
                address: form.address,
                rating: form.rating,
                price: parseFloat(form.price) || 0,
                expenses: parseFloat(form.expenses) || 0,
                pros: form.pros ? form.pros.split('\n').filter(Boolean) : [],
                cons: form.cons ? form.cons.split('\n').filter(Boolean) : [],
                notes: form.notes,
                status: form.status,
            };
            if (editingId) {
                const { data, error } = await supabase.from('home_apartments').update(payload).eq('id', editingId).select().single();
                if (error) throw error;
                setApartments(prev => prev.map(a => a.id === editingId ? data : a));
            } else {
                const { data, error } = await supabase.from('home_apartments').insert(payload).select().single();
                if (error) throw error;
                setApartments(prev => [data, ...prev]);
            }
            resetForm();
        } catch (e) {
            console.error('Error:', e);
        }
    };

    const deleteApartment = async (id) => {
        if (!window.confirm('¿Eliminar este departamento?')) return;
        try {
            const { error } = await supabase.from('home_apartments').delete().eq('id', id);
            if (error) throw error;
            setApartments(prev => prev.filter(a => a.id !== id));
        } catch (e) {
            console.error('Error:', e);
        }
    };

    const openEdit = (apt) => {
        const pros = Array.isArray(apt.pros) ? apt.pros.join('\n') : '';
        const cons = Array.isArray(apt.cons) ? apt.cons.join('\n') : '';
        setForm({
            name: apt.name, address: apt.address || '', rating: apt.rating || 3,
            price: apt.price?.toString() || '', expenses: apt.expenses?.toString() || '',
            pros, cons, notes: apt.notes || '', status: apt.status || 'en_evaluacion',
        });
        setEditingId(apt.id);
        setShowModal(true);
    };

    const resetForm = () => {
        setForm({ name: '', address: '', rating: 3, price: '', expenses: '', pros: '', cons: '', notes: '', status: 'en_evaluacion' });
        setEditingId(null);
        setShowModal(false);
    };

    const filtered = apartments.filter(a => filterStatus === 'all' || a.status === filterStatus);

    const formatPrice = (n) => (n || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

    const StarRating = ({ rating, onChange, size = 18 }) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <button key={i} type="button" onClick={() => onChange?.(i)}>
                    <Star size={size} className={i <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                </button>
            ))}
        </div>
    );

    return (
        <div className="p-4 max-w-4xl mx-auto pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button onClick={() => navigate('/our-home')} className="mr-3 p-2 rounded-full hover:bg-white/50 text-gray-600 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-gray-900">Deptos Visitados 🏢</h1>
                        <p className="text-gray-500 text-xs">{apartments.length} visitados</p>
                    </div>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                    <Plus size={22} />
                </button>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
                {[{ key: 'all', label: 'Todos' }, ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ key: k, label: v.label }))].map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilterStatus(f.key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${filterStatus === f.key
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                            : 'bg-white/60 text-gray-500 hover:bg-white'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Apartment Cards */}
            {loading ? (
                <div className="text-center py-20 text-gray-400">Cargando...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <Building2 size={48} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-400 text-sm">No hay departamentos registrados</p>
                    <button onClick={() => setShowModal(true)} className="text-blue-500 font-medium text-sm mt-2">¡Agrega el primero!</button>
                </div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence>
                        {filtered.map(apt => {
                            const statusConf = STATUS_CONFIG[apt.status] || STATUS_CONFIG.en_evaluacion;
                            const isExpanded = expandedId === apt.id;
                            const pros = Array.isArray(apt.pros) ? apt.pros : [];
                            const cons = Array.isArray(apt.cons) ? apt.cons : [];

                            return (
                                <motion.div
                                    key={apt.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    layout
                                    className={`glass-card rounded-2xl overflow-hidden transition-all ${apt.status === 'descartado' ? 'opacity-60' : ''}`}
                                >
                                    <div
                                        className="p-4 cursor-pointer"
                                        onClick={() => setExpandedId(isExpanded ? null : apt.id)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-gray-800 truncate">{apt.name}</h3>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusConf.color}`}>
                                                        {statusConf.emoji} {statusConf.label}
                                                    </span>
                                                </div>
                                                {apt.address && (
                                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                                        <MapPin size={10} /> {apt.address}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-3 mt-2">
                                                    <StarRating rating={apt.rating || 0} size={14} />
                                                    {(apt.price > 0 || apt.expenses > 0) && (
                                                        <span className="text-xs text-gray-500">
                                                            {apt.price > 0 && formatPrice(apt.price)}
                                                            {apt.price > 0 && apt.expenses > 0 && ' + '}
                                                            {apt.expenses > 0 && `${formatPrice(apt.expenses)} exp.`}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {isExpanded ? <ChevronUp size={18} className="text-gray-300" /> : <ChevronDown size={18} className="text-gray-300" />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-gray-100"
                                            >
                                                <div className="p-4 space-y-3">
                                                    {pros.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-bold text-emerald-600 mb-1">✅ Pros</p>
                                                            <ul className="space-y-0.5">
                                                                {pros.map((p, i) => <li key={i} className="text-xs text-gray-600 pl-3">• {p}</li>)}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {cons.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-bold text-red-500 mb-1">❌ Contras</p>
                                                            <ul className="space-y-0.5">
                                                                {cons.map((c, i) => <li key={i} className="text-xs text-gray-600 pl-3">• {c}</li>)}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {apt.notes && (
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-500 mb-1">📝 Notas</p>
                                                            <p className="text-xs text-gray-600">{apt.notes}</p>
                                                        </div>
                                                    )}
                                                    <div className="flex gap-2 pt-2">
                                                        <button onClick={() => openEdit(apt)}
                                                            className="flex-1 py-2 text-xs font-semibold rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                                            Editar
                                                        </button>
                                                        <button onClick={() => deleteApartment(apt.id)}
                                                            className="py-2 px-4 text-xs font-semibold rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Add/Edit Modal */}
            {createPortal(
                <AnimatePresence>
                    {showModal && (
                        <>
                            <motion.div
                                key="backdrop"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
                                onClick={resetForm}
                            />
                            <motion.div
                                key="modal"
                                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-white rounded-t-3xl p-6 z-[9999] shadow-2xl max-h-[90vh] overflow-y-auto pb-8"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-5">
                                    <h2 className="text-xl font-serif font-bold text-gray-800">
                                        {editingId ? 'Editar Depto' : 'Nuevo Depto'} 🏢
                                    </h2>
                                    <button onClick={resetForm} className="p-2 rounded-full hover:bg-gray-100">
                                        <X size={20} className="text-gray-400" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre *</label>
                                        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                            placeholder="ej: Depto Av. Corrientes"
                                            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm" />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dirección</label>
                                        <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                                            placeholder="ej: Av. Corrientes 1234"
                                            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none transition-all text-sm" />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Puntuación</label>
                                        <StarRating rating={form.rating} onChange={r => setForm({ ...form, rating: r })} size={24} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Alquiler</label>
                                            <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                                                placeholder="$0"
                                                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none transition-all text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Expensas</label>
                                            <input type="number" value={form.expenses} onChange={e => setForm({ ...form, expenses: e.target.value })}
                                                placeholder="$0"
                                                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none transition-all text-sm" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</label>
                                        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                                            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none transition-all text-sm bg-white">
                                            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pros (uno por línea)</label>
                                        <textarea value={form.pros} onChange={e => setForm({ ...form, pros: e.target.value })}
                                            placeholder="Buena luz&#10;Cerca del subte&#10;..." rows={3}
                                            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none transition-all text-sm resize-none" />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contras (uno por línea)</label>
                                        <textarea value={form.cons} onChange={e => setForm({ ...form, cons: e.target.value })}
                                            placeholder="Cocina chica&#10;Ruidoso&#10;..." rows={3}
                                            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none transition-all text-sm resize-none" />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notas</label>
                                        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                                            placeholder="Observaciones..." rows={2}
                                            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none transition-all text-sm resize-none" />
                                    </div>

                                    <button onClick={handleSave} disabled={!form.name.trim()}
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 active:scale-[0.98]">
                                        {editingId ? 'Guardar Cambios' : 'Agregar Departamento'}
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default ApartmentNotesPage;
