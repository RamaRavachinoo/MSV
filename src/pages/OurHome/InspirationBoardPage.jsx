import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, X, Trash2, ExternalLink, Palette, Image, Pencil
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ROOMS = ['Todos', 'Living', 'Cocina', 'Dormitorio', 'Baño', 'Balcón', 'Otros'];

const ROOM_COLORS = {
    Living: 'bg-amber-100 text-amber-700',
    Cocina: 'bg-orange-100 text-orange-700',
    Dormitorio: 'bg-purple-100 text-purple-700',
    Baño: 'bg-cyan-100 text-cyan-700',
    Balcón: 'bg-green-100 text-green-700',
    Otros: 'bg-gray-100 text-gray-600',
};

const InspirationBoardPage = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeRoom, setActiveRoom] = useState('Todos');
    const [expandedId, setExpandedId] = useState(null);
    const [lightboxItem, setLightboxItem] = useState(null);

    const [form, setForm] = useState({
        title: '', room: 'Living', image_url: '', notes: '', source_link: '',
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        try {
            const { data, error } = await supabase
                .from('home_inspiration')
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
            if (editingId) {
                const { data, error } = await supabase.from('home_inspiration').update(form).eq('id', editingId).select().single();
                if (error) throw error;
                setItems(prev => prev.map(i => i.id === editingId ? data : i));
            } else {
                const { data, error } = await supabase.from('home_inspiration').insert(form).select().single();
                if (error) throw error;
                setItems(prev => [data, ...prev]);
            }
            resetForm();
        } catch (e) {
            console.error('Error:', e);
        }
    };

    const deleteItem = async (id) => {
        if (!window.confirm('¿Eliminar esta idea?')) return;
        try {
            const { error } = await supabase.from('home_inspiration').delete().eq('id', id);
            if (error) throw error;
            setItems(prev => prev.filter(i => i.id !== id));
        } catch (e) {
            console.error('Error:', e);
        }
    };

    const openEdit = (item) => {
        setForm({
            title: item.title, room: item.room, image_url: item.image_url || '',
            notes: item.notes || '', source_link: item.source_link || '',
        });
        setEditingId(item.id);
        setShowModal(true);
    };

    const resetForm = () => {
        setForm({ title: '', room: 'Living', image_url: '', notes: '', source_link: '' });
        setEditingId(null);
        setShowModal(false);
    };

    const filtered = items.filter(i => activeRoom === 'Todos' || i.room === activeRoom);

    return (
        <div className="p-4 max-w-4xl mx-auto pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button onClick={() => navigate('/our-home')} className="mr-3 p-2 rounded-full hover:bg-white/50 text-gray-600 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-gray-900">Inspiración 🎨</h1>
                        <p className="text-gray-500 text-xs">Ideas de decoración</p>
                    </div>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="p-3 bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                    <Plus size={22} />
                </button>
            </div>

            {/* Room Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
                {ROOMS.map(room => (
                    <button
                        key={room}
                        onClick={() => setActiveRoom(room)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activeRoom === room
                            ? 'bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white shadow-md'
                            : 'bg-white/60 text-gray-500 hover:bg-white'
                            }`}
                    >
                        {room}
                    </button>
                ))}
            </div>

            {/* Masonry Grid */}
            {loading ? (
                <div className="text-center py-20 text-gray-400">Cargando...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <Palette size={48} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-400 text-sm">No hay ideas todavía</p>
                    <button onClick={() => setShowModal(true)} className="text-pink-500 font-medium text-sm mt-2">¡Agrega la primera!</button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-card rounded-2xl overflow-hidden"
                        >
                            {/* Image Preview */}
                            {item.image_url && (
                                <img
                                    src={item.image_url}
                                    alt={item.title}
                                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setLightboxItem(item)}
                                    onError={e => { e.target.style.display = 'none'; }}
                                />
                            )}

                            {/* Content */}
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-800 text-sm">{item.title}</h3>
                                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium mt-1.5 ${ROOM_COLORS[item.room] || ROOM_COLORS.Otros}`}>
                                            {item.room}
                                        </span>
                                    </div>
                                    {/* Action Buttons */}
                                    <div className="flex gap-1 shrink-0">
                                        {item.source_link && (
                                            <a href={item.source_link} target="_blank" rel="noopener noreferrer"
                                                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 transition-colors">
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                        <button onClick={() => openEdit(item)}
                                            className="p-1.5 rounded-lg hover:bg-pink-50 text-gray-300 hover:text-pink-500 transition-colors">
                                            <Pencil size={14} />
                                        </button>
                                        <button onClick={() => deleteItem(item.id)}
                                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Source link as text */}
                                {item.source_link && (
                                    <a href={item.source_link} target="_blank" rel="noopener noreferrer"
                                        className="text-[11px] text-blue-400 hover:text-blue-600 mt-1.5 block truncate transition-colors">
                                        🔗 {item.source_link}
                                    </a>
                                )}

                                {/* Notes */}
                                {item.notes && (
                                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">{item.notes}</p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
                        style={{ zIndex: 9999 }}
                        onClick={resetForm}
                    >
                        <motion.div
                            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                            className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-xl font-serif font-bold text-gray-800">
                                    {editingId ? 'Editar Idea' : 'Nueva Idea'} 🎨
                                </h2>
                                <button onClick={resetForm} className="p-2 rounded-full hover:bg-gray-100">
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Título *</label>
                                    <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                        placeholder="ej: Mesa ratona de madera"
                                        className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all text-sm" />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ambiente</label>
                                    <select value={form.room} onChange={e => setForm({ ...form, room: e.target.value })}
                                        className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 outline-none transition-all text-sm bg-white">
                                        {ROOMS.filter(r => r !== 'Todos').map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">URL de Imagen</label>
                                    <input type="url" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })}
                                        placeholder="https://... (pegar URL de imagen)"
                                        className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 outline-none transition-all text-sm" />
                                    {form.image_url && (
                                        <div className="mt-2 rounded-xl overflow-hidden border border-gray-100">
                                            <img src={form.image_url} alt="Preview" className="w-full h-32 object-cover"
                                                onError={e => { e.target.style.display = 'none'; }} />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Link de origen (opcional)</label>
                                    <input type="url" value={form.source_link} onChange={e => setForm({ ...form, source_link: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 outline-none transition-all text-sm" />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notas</label>
                                    <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                                        placeholder="¿Por qué te gusta?" rows={2}
                                        className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 outline-none transition-all text-sm resize-none" />
                                </div>

                                <button onClick={handleSave} disabled={!form.title.trim()}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 active:scale-[0.98]">
                                    {editingId ? 'Guardar Cambios' : 'Agregar Idea'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxItem && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center p-4"
                        style={{ zIndex: 9999 }}
                        onClick={() => setLightboxItem(null)}
                    >
                        <button
                            onClick={() => setLightboxItem(null)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <img
                            src={lightboxItem.image_url}
                            alt={lightboxItem.title}
                            className="max-w-full max-h-[75vh] object-contain rounded-2xl"
                            onClick={e => e.stopPropagation()}
                        />

                        <div className="mt-4 text-center" onClick={e => e.stopPropagation()}>
                            <p className="text-white font-semibold text-lg">{lightboxItem.title}</p>
                            {lightboxItem.source_link && (
                                <a
                                    href={lightboxItem.source_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 rounded-full bg-white/20 text-white text-sm font-medium hover:bg-white/30 transition-colors"
                                >
                                    <ExternalLink size={14} />
                                    Ir al link
                                </a>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InspirationBoardPage;
