import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, X, Trash2, Check, ClipboardCheck, Calendar
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const CATEGORIES = ['Todos', 'Trámites', 'Servicios', 'Mudanza', 'Otros'];

const CATEGORY_EMOJIS = {
    Trámites: '📄',
    Servicios: '🔌',
    Mudanza: '📦',
    Otros: '📌',
};

const SUGGESTED_TASKS = [
    { title: 'Cambiar dirección en DNI', category: 'Trámites' },
    { title: 'Actualizar dirección en el trabajo', category: 'Trámites' },
    { title: 'Cambiar dirección en la facultad', category: 'Trámites' },
    { title: 'Contratar internet', category: 'Servicios' },
    { title: 'Dar de alta luz', category: 'Servicios' },
    { title: 'Dar de alta gas', category: 'Servicios' },
    { title: 'Contratar seguro del hogar', category: 'Servicios' },
    { title: 'Coordinar flete', category: 'Mudanza' },
    { title: 'Empacar ropa', category: 'Mudanza' },
    { title: 'Empacar cocina', category: 'Mudanza' },
    { title: 'Empacar baño', category: 'Mudanza' },
    { title: 'Limpiar depto nuevo', category: 'Mudanza' },
    { title: 'Hacer copia de llaves', category: 'Mudanza' },
    { title: 'Avisar a amigos/familia la nueva dirección', category: 'Otros' },
];

const MovingChecklistPage = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Todos');

    const [form, setForm] = useState({
        title: '', category: 'Otros', due_date: '', notes: '',
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        try {
            const { data, error } = await supabase
                .from('home_moving_checklist')
                .select('*')
                .order('is_completed', { ascending: true })
                .order('due_date', { ascending: true, nullsFirst: false })
                .order('created_at', { ascending: false });
            if (error) throw error;
            setItems(data || []);
        } catch (e) {
            console.error('Error:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!form.title.trim()) return;
        try {
            const payload = {
                title: form.title,
                category: form.category,
                due_date: form.due_date || null,
                notes: form.notes || null,
            };
            if (editingId) {
                const { data, error } = await supabase.from('home_moving_checklist').update(payload).eq('id', editingId).select().single();
                if (error) throw error;
                setItems(prev => prev.map(i => i.id === editingId ? data : i));
            } else {
                const { data, error } = await supabase.from('home_moving_checklist').insert(payload).select().single();
                if (error) throw error;
                setItems(prev => [data, ...prev]);
            }
            resetForm();
        } catch (e) {
            console.error('Error:', e);
        }
    };

    const addSuggested = async (suggestion) => {
        try {
            const { data, error } = await supabase.from('home_moving_checklist')
                .insert({ title: suggestion.title, category: suggestion.category })
                .select().single();
            if (error) throw error;
            setItems(prev => [data, ...prev]);
        } catch (e) {
            console.error('Error:', e);
        }
    };

    const toggleCompleted = async (item) => {
        try {
            const { error } = await supabase.from('home_moving_checklist')
                .update({ is_completed: !item.is_completed }).eq('id', item.id);
            if (error) throw error;
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_completed: !i.is_completed } : i));
        } catch (e) {
            console.error('Error:', e);
        }
    };

    const deleteItem = async (id) => {
        if (!window.confirm('¿Eliminar esta tarea?')) return;
        try {
            const { error } = await supabase.from('home_moving_checklist').delete().eq('id', id);
            if (error) throw error;
            setItems(prev => prev.filter(i => i.id !== id));
        } catch (e) {
            console.error('Error:', e);
        }
    };

    const openEdit = (item) => {
        setForm({
            title: item.title, category: item.category || 'Otros',
            due_date: item.due_date || '', notes: item.notes || '',
        });
        setEditingId(item.id);
        setShowModal(true);
    };

    const resetForm = () => {
        setForm({ title: '', category: 'Otros', due_date: '', notes: '' });
        setEditingId(null);
        setShowModal(false);
    };

    const filtered = items.filter(i => activeCategory === 'Todos' || i.category === activeCategory);
    const completed = items.filter(i => i.is_completed).length;
    const total = items.length;
    const progress = total > 0 ? (completed / total) * 100 : 0;

    // Group by category
    const grouped = {};
    filtered.forEach(item => {
        const cat = item.category || 'Otros';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
    });

    // Existing titles set for suggestions
    const existingTitles = new Set(items.map(i => i.title.toLowerCase()));

    const formatDate = (d) => {
        if (!d) return null;
        return new Date(d + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
    };

    const isOverdue = (d) => {
        if (!d) return false;
        return new Date(d + 'T00:00:00') < new Date(new Date().toDateString());
    };

    return (
        <div className="p-4 max-w-4xl mx-auto pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button onClick={() => navigate('/our-home')} className="mr-3 p-2 rounded-full hover:bg-white/50 text-gray-600 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-gray-900">Checklist Mudanza 📋</h1>
                        <p className="text-gray-500 text-xs">{completed}/{total} completadas</p>
                    </div>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="p-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                    <Plus size={22} />
                </button>
            </div>

            {/* Progress */}
            <div className="glass-card rounded-3xl p-5 mb-6">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Progreso</p>
                    <p className="text-sm font-bold text-violet-600">{progress.toFixed(0)}%</p>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-violet-400 to-purple-500 rounded-full"
                    />
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                    {completed} de {total} tareas completadas
                </p>
            </div>

            {/* Suggestions Button */}
            <div className="mb-4 flex gap-2">
                <button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="text-xs text-violet-500 font-semibold hover:text-violet-700 transition-colors"
                >
                    {showSuggestions ? '✕ Cerrar sugerencias' : '💡 Ver sugerencias'}
                </button>
            </div>

            {/* Suggestions */}
            <AnimatePresence>
                {showSuggestions && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="glass-card rounded-2xl p-4 mb-5 overflow-hidden"
                    >
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Sugerencias</p>
                        <div className="flex flex-wrap gap-2">
                            {SUGGESTED_TASKS.filter(s => !existingTitles.has(s.title.toLowerCase())).map(s => (
                                <button
                                    key={s.title}
                                    onClick={() => addSuggested(s)}
                                    className="text-xs px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 hover:bg-violet-100 font-medium transition-colors"
                                >
                                    + {s.title}
                                </button>
                            ))}
                            {SUGGESTED_TASKS.filter(s => !existingTitles.has(s.title.toLowerCase())).length === 0 && (
                                <p className="text-xs text-gray-400">¡Ya agregaste todas las sugerencias! 🎉</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activeCategory === cat
                                ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md'
                                : 'bg-white/60 text-gray-500 hover:bg-white'
                            }`}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grouped Items */}
            {loading ? (
                <div className="text-center py-20 text-gray-400">Cargando...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                    <ClipboardCheck size={48} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-400 text-sm">No hay tareas</p>
                    <button onClick={() => setShowModal(true)} className="text-violet-500 font-medium text-sm mt-2">¡Agrega la primera!</button>
                </div>
            ) : (
                <div className="space-y-5">
                    {Object.entries(grouped).map(([cat, catItems]) => (
                        <div key={cat}>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <span>{CATEGORY_EMOJIS[cat] || '📌'}</span> {cat}
                            </p>
                            <div className="space-y-2">
                                <AnimatePresence>
                                    {catItems.map(item => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            layout
                                            className={`glass-card rounded-2xl p-3 transition-all ${item.is_completed ? 'opacity-60' : ''}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => toggleCompleted(item)}
                                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${item.is_completed
                                                            ? 'bg-violet-500 border-violet-500 text-white'
                                                            : 'border-gray-300 hover:border-violet-400'
                                                        }`}>
                                                    {item.is_completed && <Check size={14} />}
                                                </button>
                                                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEdit(item)}>
                                                    <p className={`font-semibold text-sm text-gray-800 ${item.is_completed ? 'line-through text-gray-400' : ''}`}>
                                                        {item.title}
                                                    </p>
                                                    {item.notes && <p className="text-xs text-gray-400 truncate mt-0.5">{item.notes}</p>}
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {item.due_date && (
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${item.is_completed ? 'bg-gray-100 text-gray-400'
                                                                : isOverdue(item.due_date) ? 'bg-red-100 text-red-600' : 'bg-violet-50 text-violet-600'
                                                            }`}>
                                                            <Calendar size={10} />
                                                            {formatDate(item.due_date)}
                                                        </span>
                                                    )}
                                                    <button onClick={() => deleteItem(item.id)}
                                                        className="p-1 rounded-lg hover:bg-red-50 text-red-300 hover:text-red-500 transition-colors">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
                        style={{ zIndex: 9999 }} onClick={resetForm}>
                        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                            className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-xl font-serif font-bold text-gray-800">
                                    {editingId ? 'Editar Tarea' : 'Nueva Tarea'} 📋
                                </h2>
                                <button onClick={resetForm} className="p-2 rounded-full hover:bg-gray-100">
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tarea *</label>
                                    <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                        placeholder="ej: Contratar internet"
                                        className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-sm" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</label>
                                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                                            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 outline-none transition-all text-sm bg-white">
                                            {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha límite</label>
                                        <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })}
                                            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 outline-none transition-all text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notas</label>
                                    <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                                        placeholder="Notas adicionales..." rows={2}
                                        className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 outline-none transition-all text-sm resize-none" />
                                </div>
                                <button onClick={handleSave} disabled={!form.title.trim()}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 active:scale-[0.98]">
                                    {editingId ? 'Guardar Cambios' : 'Agregar Tarea'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MovingChecklistPage;
