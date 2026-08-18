import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, Trash2, Check, ListChecks,
    X, Pencil
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';

const CATEGORIES = ['Todos', 'Supermercado', 'Farmacia', 'Trámites', 'Otros'];

const DailyTasksPage = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Todos');

    const [form, setForm] = useState({ title: '', category: 'Supermercado', assigned_to: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        try {
            const { data, error } = await supabase
                .from('home_daily_tasks')
                .select('*')
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
            const payload = { ...form };
            if (editingId) {
                const { data, error } = await supabase
                    .from('home_daily_tasks')
                    .update(payload)
                    .eq('id', editingId)
                    .select()
                    .single();
                if (error) throw error;
                setItems(prev => prev.map(i => i.id === editingId ? data : i));
            } else {
                const { data, error } = await supabase
                    .from('home_daily_tasks')
                    .insert(payload)
                    .select()
                    .single();
                if (error) throw error;
                setItems(prev => [data, ...prev]);
            }
            resetForm();
        } catch (e) {
            console.error('Error:', e);
        }
    };

    const toggleCompleted = async (item) => {
        try {
            const { error } = await supabase
                .from('home_daily_tasks')
                .update({ is_completed: !item.is_completed })
                .eq('id', item.id);
            if (error) throw error;
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_completed: !i.is_completed } : i));
        } catch (e) {
            console.error('Error:', e);
        }
    };

    const deleteItem = async (id) => {
        if (!window.confirm('¿Eliminar este pendiente?')) return;
        try {
            const { error } = await supabase.from('home_daily_tasks').delete().eq('id', id);
            if (error) throw error;
            setItems(prev => prev.filter(i => i.id !== id));
        } catch (e) {
            console.error('Error:', e);
        }
    };

    const openEdit = (item) => {
        setForm({ title: item.title, category: item.category, assigned_to: item.assigned_to || '' });
        setEditingId(item.id);
        setShowModal(true);
    };

    const resetForm = () => {
        setForm({ title: '', category: 'Supermercado', assigned_to: '' });
        setEditingId(null);
        setShowModal(false);
    };

    const filtered = items.filter(i => activeCategory === 'Todos' || i.category === activeCategory);
    const pendingCount = items.filter(i => !i.is_completed).length;

    return (
        <div className="p-4 max-w-4xl mx-auto pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button onClick={() => navigate('/our-home')} className="mr-3 p-2 rounded-full hover:bg-white/50 text-gray-600 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-gray-900">Del Día a Día 📝</h1>
                        <p className="text-gray-500 text-xs">{pendingCount} pendientes</p>
                    </div>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="p-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                    <Plus size={22} />
                </button>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activeCategory === cat
                            ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md'
                            : 'bg-white/60 text-gray-500 hover:bg-white'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Items List */}
            {loading ? (
                <div className="text-center py-20 text-gray-400">Cargando...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <ListChecks size={48} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-400 text-sm">No hay pendientes{activeCategory !== 'Todos' ? ` en ${activeCategory}` : ''}</p>
                    <button onClick={() => setShowModal(true)} className="text-violet-500 font-medium text-sm mt-2">¡Agrega el primero!</button>
                </div>
            ) : (
                <div className="space-y-2">
                    <AnimatePresence>
                        {filtered.map(item => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                layout
                                className={`glass-card rounded-2xl p-4 transition-all ${item.is_completed ? 'opacity-60' : ''}`}
                            >
                                <div className="flex items-start gap-3">
                                    <button
                                        onClick={() => toggleCompleted(item)}
                                        className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${item.is_completed
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : 'border-gray-300 hover:border-violet-400'
                                            }`}
                                    >
                                        {item.is_completed && <Check size={14} />}
                                    </button>

                                    <div className="flex-1 min-w-0" onClick={() => openEdit(item)}>
                                        <p className={`font-semibold text-gray-800 ${item.is_completed ? 'line-through text-gray-400' : ''}`}>
                                            {item.title}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                                                {item.category}
                                            </span>
                                            {item.assigned_to && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium">
                                                    {item.assigned_to}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        <button onClick={() => openEdit(item)}
                                            className="p-1.5 rounded-lg hover:bg-violet-50 text-gray-300 hover:text-violet-500 transition-colors">
                                            <Pencil size={14} />
                                        </button>
                                        <button onClick={() => deleteItem(item.id)}
                                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
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
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
                                onClick={resetForm}
                            />
                            <motion.div
                                key="modal"
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-white rounded-t-3xl p-6 z-[9999] shadow-2xl max-h-[90vh] overflow-y-auto pb-8"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-5">
                                    <h2 className="text-xl font-serif font-bold text-gray-800">
                                        {editingId ? 'Editar Pendiente' : 'Nuevo Pendiente'} 📝
                                    </h2>
                                    <button onClick={resetForm} className="p-2 rounded-full hover:bg-gray-100">
                                        <X size={20} className="text-gray-400" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Qué hay que hacer *</label>
                                        <input
                                            type="text" value={form.title}
                                            onChange={e => setForm({ ...form, title: e.target.value })}
                                            placeholder="ej: Comprar leche"
                                            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</label>
                                        <select
                                            value={form.category}
                                            onChange={e => setForm({ ...form, category: e.target.value })}
                                            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 outline-none transition-all text-sm bg-white"
                                        >
                                            {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">¿Quién lo hace?</label>
                                        <div className="flex gap-2">
                                            {['Martina', 'Ramiro', 'Los dos'].map(name => (
                                                <button
                                                    key={name}
                                                    type="button"
                                                    onClick={() => setForm({ ...form, assigned_to: form.assigned_to === name ? '' : name })}
                                                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${form.assigned_to === name
                                                        ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSave}
                                        disabled={!form.title.trim()}
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 active:scale-[0.98]"
                                    >
                                        {editingId ? 'Guardar Cambios' : 'Agregar'}
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

export default DailyTasksPage;
