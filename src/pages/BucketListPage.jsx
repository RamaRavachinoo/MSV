import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2, MapPin, CheckSquare, Square } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const MOCK_ITEMS = [
    { id: 101, title: 'Pizza epica en la costa', is_completed: false },
    { id: 102, title: 'Ir a pasear a un pueblardo', is_completed: false },
    { id: 103, title: 'Vacaciones', is_completed: false },
    { id: 104, title: 'trekking con la fokin gorda', is_completed: false },
    { id: 105, title: 'ir a casa chinchin', is_completed: false },
    { id: 106, title: 'Cocinar algo', is_completed: false },
    { id: 107, title: 'BINGO', is_completed: false },
    { id: 108, title: 'barrio chino v2', is_completed: false },
    { id: 109, title: 'museo de arte decorativo', is_completed: false },
    { id: 110, title: 'diseñar depto', is_completed: false },
    { id: 111, title: 'candy moon', is_completed: false },
];

const BucketListPage = () => {
    const { isDevMode } = useAuth();
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isDevMode) {
            // Load from localStorage or Mock for Demo
            const saved = localStorage.getItem('demo_bucket_list');
            setItems(saved ? JSON.parse(saved) : MOCK_ITEMS);
            setLoading(false);
        } else {
            fetchItems();
        }
    }, [isDevMode]);

    const fetchItems = async () => {
        try {
            const { data, error } = await supabase
                .from('bucket_list')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error('Error fetching list:', error);
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;

        if (isDevMode) {
            const newEntry = { id: Date.now(), title: newItem, is_completed: false };
            const updated = [newEntry, ...items];
            setItems(updated);
            localStorage.setItem('demo_bucket_list', JSON.stringify(updated));
            setNewItem('');
        } else {
            try {
                const { data, error } = await supabase
                    .from('bucket_list')
                    .insert([{ title: newItem }])
                    .select();

                if (error) throw error;
                setItems([data[0], ...items]);
                setNewItem('');
            } catch (error) {
                console.error('Error adding item:', error);
            }
        }
    };

    const toggleItem = async (id, currentStatus) => {
        if (isDevMode) {
            const updated = items.map(item =>
                item.id === id ? { ...item, is_completed: !currentStatus } : item
            );
            setItems(updated);
            localStorage.setItem('demo_bucket_list', JSON.stringify(updated));
        } else {
            try {
                const { error } = await supabase
                    .from('bucket_list')
                    .update({ is_completed: !currentStatus })
                    .eq('id', id);

                if (error) throw error;
                setItems(items.map(item =>
                    item.id === id ? { ...item, is_completed: !currentStatus } : item
                ));
            } catch (error) {
                console.error('Error updating item:', error);
            }
        }
    };

    const deleteItem = async (id) => {
        if (isDevMode) {
            const updated = items.filter(item => item.id !== id);
            setItems(updated);
            localStorage.setItem('demo_bucket_list', JSON.stringify(updated));
        } else {
            try {
                const { error } = await supabase
                    .from('bucket_list')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                setItems(items.filter(item => item.id !== id));
            } catch (error) {
                console.error('Error deleting item:', error);
            }
        }
    };

    return (
        <div className="min-h-screen pb-20 px-4">
            <header className="py-6 text-center">
                <h1 className="text-3xl font-serif text-romantic-800 mb-2">Cosas para hacer juntos 🌎</h1>
                <p className="text-sm text-gray-500">Nuestra lista de aventuras pendientes</p>
            </header>

            {/* Add New Item */}
            <form onSubmit={addItem} className="mb-8 relative max-w-md mx-auto">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Próxima aventura..."
                    className="w-full pl-5 pr-12 py-4 rounded-full border-none shadow-lg bg-white/80 backdrop-blur focus:ring-2 focus:ring-romantic-300 outline-none text-gray-700 placeholder-gray-400"
                />
                <button
                    type="submit"
                    disabled={!newItem.trim()}
                    className="absolute right-2 top-2 p-2 bg-romantic-500 text-white rounded-full hover:bg-romantic-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Plus size={24} />
                </button>
            </form>

            <div className="max-w-md mx-auto space-y-3">
                <AnimatePresence>
                    {loading ? (
                        <p className="text-center text-gray-400">Cargando sueños...</p>
                    ) : (
                        items.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`p-4 rounded-xl flex items-center justify-between group transition-all duration-300 ${item.is_completed ? 'bg-gray-100/50' : 'bg-white shadow-sm border border-romantic-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <button
                                        onClick={() => toggleItem(item.id, item.is_completed)}
                                        className={`transition-colors ${item.is_completed ? 'text-green-500' : 'text-gray-300 hover:text-romantic-400'}`}
                                    >
                                        {item.is_completed ? (
                                            <CheckSquare size={24} className="fill-green-50" />
                                        ) : (
                                            <Square size={24} />
                                        )}
                                    </button>
                                    <span className={`text-lg font-serif transition-all ${item.is_completed ? 'text-gray-400 line-through decoration-romantic-300' : 'text-gray-800'
                                        }`}>
                                        {item.title}
                                    </span>
                                </div>

                                <button
                                    onClick={() => deleteItem(item.id)}
                                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all p-2"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>

                {items.length === 0 && !loading && (
                    <div className="text-center py-10 opacity-60">
                        <MapPin size={48} className="mx-auto text-romantic-300 mb-2" />
                        <p className="text-romantic-800 font-serif">¡Agreguemos nuestra primera aventura!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BucketListPage;
