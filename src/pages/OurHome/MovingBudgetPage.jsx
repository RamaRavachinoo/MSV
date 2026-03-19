import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, X, Trash2, Check, PiggyBank, TrendingUp
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';

const CATEGORIES = ['Todos', 'Depósito', 'Comisión', 'Flete', 'Servicios', 'Compras', 'Otros'];

const CATEGORY_COLORS = {
    Depósito: 'bg-blue-100 text-blue-700',
    Comisión: 'bg-purple-100 text-purple-700',
    Flete: 'bg-amber-100 text-amber-700',
    Servicios: 'bg-cyan-100 text-cyan-700',
    Compras: 'bg-orange-100 text-orange-700',
    Otros: 'bg-gray-100 text-gray-600',
};

const MovingBudgetPage = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [shoppingTotal, setShoppingTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Todos');

    const [form, setForm] = useState({
        title: '', category: 'Otros', estimated_amount: '', actual_amount: '',
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchItems();
        fetchShoppingTotal();
    }, []);

    const fetchItems = async () => {
        try {
            const { data, error } = await supabase
                .from('home_moving_budget')
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

    const fetchShoppingTotal = async () => {
        try {
            const { data, error } = await supabase.from('home_shopping_list').select('estimated_price, is_purchased');
            if (error) throw error;
            const total = (data || []).reduce((s, i) => s + (i.estimated_price || 0), 0);
            setShoppingTotal(total);
        } catch (e) {
            console.error('Error:', e);
        }
    };

    const handleSave = async () => {
        if (!form.title.trim()) return;
        try {
            const payload = {
                title: form.title,
                category: form.category,
                estimated_amount: parseFloat(form.estimated_amount) || 0,
                actual_amount: parseFloat(form.actual_amount) || 0,
                is_paid: parseFloat(form.actual_amount) > 0,
            };
            if (editingId) {
                const { data, error } = await supabase.from('home_moving_budget').update(payload).eq('id', editingId).select().single();
                if (error) throw error;
                setItems(prev => prev.map(i => i.id === editingId ? data : i));
            } else {
                const { data, error } = await supabase.from('home_moving_budget').insert(payload).select().single();
                if (error) throw error;
                setItems(prev => [data, ...prev]);
            }
            resetForm();
        } catch (e) {
            console.error('Error:', e);
        }
    };

    const togglePaid = async (item) => {
        try {
            const { error } = await supabase.from('home_moving_budget').update({ is_paid: !item.is_paid }).eq('id', item.id);
            if (error) throw error;
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_paid: !i.is_paid } : i));
        } catch (e) {
            console.error('Error:', e);
        }
    };

    const deleteItem = async (id) => {
        if (!window.confirm('¿Eliminar este gasto?')) return;
        try {
            const { error } = await supabase.from('home_moving_budget').delete().eq('id', id);
            if (error) throw error;
            setItems(prev => prev.filter(i => i.id !== id));
        } catch (e) {
            console.error('Error:', e);
        }
    };

    const openEdit = (item) => {
        setForm({
            title: item.title, category: item.category,
            estimated_amount: item.estimated_amount?.toString() || '',
            actual_amount: item.actual_amount?.toString() || '',
        });
        setEditingId(item.id);
        setShowModal(true);
    };

    const resetForm = () => {
        setForm({ title: '', category: 'Otros', estimated_amount: '', actual_amount: '' });
        setEditingId(null);
        setShowModal(false);
    };

    const filtered = items.filter(i => activeCategory === 'Todos' || i.category === activeCategory);

    const totalEstimated = items.reduce((s, i) => s + (i.estimated_amount || 0), 0) + shoppingTotal;
    const totalActual = items.reduce((s, i) => s + (i.actual_amount || 0), 0);
    const totalPaid = items.filter(i => i.is_paid).reduce((s, i) => s + (i.actual_amount || 0), 0);
    const progress = totalEstimated > 0 ? Math.min((totalPaid / totalEstimated) * 100, 100) : 0;

    const formatPrice = (n) => (n || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

    // Category breakdown
    const categoryBreakdown = CATEGORIES.filter(c => c !== 'Todos').map(cat => {
        const catItems = items.filter(i => i.category === cat);
        const estimated = catItems.reduce((s, i) => s + (i.estimated_amount || 0), 0) + (cat === 'Compras' ? shoppingTotal : 0);
        return { category: cat, estimated, color: CATEGORY_COLORS[cat] };
    }).filter(c => c.estimated > 0);

    return (
        <div className="p-4 max-w-4xl mx-auto pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button onClick={() => navigate('/our-home')} className="mr-3 p-2 rounded-full hover:bg-white/50 text-gray-600 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-gray-900">Presupuesto 💰</h1>
                        <p className="text-gray-500 text-xs">Control de gastos de mudanza</p>
                    </div>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                    <Plus size={22} />
                </button>
            </div>

            {/* Progress Card */}
            <div className="glass-card rounded-3xl p-5 mb-6">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Presupuesto Total</p>
                        <p className="text-2xl font-bold text-gray-800 mt-0.5">{formatPrice(totalEstimated)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Pagado</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-0.5">{formatPrice(totalPaid)}</p>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                    />
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">{progress.toFixed(0)}% del presupuesto pagado</p>
            </div>

            {/* Category Breakdown */}
            {categoryBreakdown.length > 0 && (
                <div className="glass-card rounded-2xl p-4 mb-6">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Desglose por categoría</p>
                    <div className="space-y-2">
                        {categoryBreakdown.map(({ category, estimated, color }) => {
                            const pct = totalEstimated > 0 ? ((estimated / totalEstimated) * 100) : 0;
                            return (
                                <div key={category} className="flex items-center gap-3">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium w-20 text-center ${color}`}>
                                        {category}
                                    </span>
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium w-24 text-right">{formatPrice(estimated)}</span>
                                </div>
                            );
                        })}
                    </div>
                    {shoppingTotal > 0 && (
                        <p className="text-[10px] text-gray-400 mt-2 text-center italic">
                            * Incluye {formatPrice(shoppingTotal)} de la lista de compras
                        </p>
                    )}
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activeCategory === cat
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                            : 'bg-white/60 text-gray-500 hover:bg-white'
                            }`}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* Budget Items */}
            {loading ? (
                <div className="text-center py-20 text-gray-400">Cargando...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                    <PiggyBank size={48} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-400 text-sm">No hay gastos registrados</p>
                    <button onClick={() => setShowModal(true)} className="text-emerald-500 font-medium text-sm mt-2">¡Agrega el primero!</button>
                </div>
            ) : (
                <div className="space-y-2">
                    <AnimatePresence>
                        {filtered.map(item => (
                            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }} layout
                                className={`glass-card rounded-2xl p-4 transition-all ${item.is_paid ? 'opacity-70' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => togglePaid(item)}
                                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${item.is_paid ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 hover:border-emerald-400'
                                            }`}>
                                        {item.is_paid && <Check size={14} />}
                                    </button>
                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEdit(item)}>
                                        <p className={`font-semibold text-gray-800 text-sm ${item.is_paid ? 'line-through text-gray-400' : ''}`}>
                                            {item.title}
                                        </p>
                                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Otros}`}>
                                            {item.category}
                                        </span>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs text-gray-400">Estimado</p>
                                        <p className="text-sm font-bold text-gray-600">{formatPrice(item.estimated_amount)}</p>
                                        {item.actual_amount > 0 && (
                                            <>
                                                <p className="text-xs text-gray-400 mt-1">Real</p>
                                                <p className="text-sm font-bold text-emerald-600">{formatPrice(item.actual_amount)}</p>
                                            </>
                                        )}
                                    </div>
                                    <button onClick={() => deleteItem(item.id)}
                                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-300 hover:text-red-500 transition-colors shrink-0">
                                        <Trash2 size={14} />
                                    </button>
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
                                        {editingId ? 'Editar Gasto' : 'Nuevo Gasto'} 💰
                                    </h2>
                                    <button onClick={resetForm} className="p-2 rounded-full hover:bg-gray-100">
                                        <X size={20} className="text-gray-400" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Concepto *</label>
                                        <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                            placeholder="ej: Depósito alquiler"
                                            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</label>
                                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                                            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 outline-none transition-all text-sm bg-white">
                                            {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estimado</label>
                                            <input type="number" value={form.estimated_amount} onChange={e => setForm({ ...form, estimated_amount: e.target.value })}
                                                placeholder="$0"
                                                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 outline-none transition-all text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Real (pagado)</label>
                                            <input type="number" value={form.actual_amount} onChange={e => setForm({ ...form, actual_amount: e.target.value })}
                                                placeholder="$0"
                                                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 outline-none transition-all text-sm" />
                                        </div>
                                    </div>
                                    <button onClick={handleSave} disabled={!form.title.trim()}
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 active:scale-[0.98]">
                                        {editingId ? 'Guardar Cambios' : 'Agregar Gasto'}
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

export default MovingBudgetPage;
