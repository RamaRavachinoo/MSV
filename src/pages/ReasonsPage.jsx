import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';

const ReasonsPage = () => {
    const { user } = useAuth();
    const [reasons, setReasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newReason, setNewReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchReasons();
    }, []);

    const fetchReasons = async () => {
        try {
            const { data, error } = await supabase
                .from('reasons')
                .select('*')
                .order('created_at', { ascending: false }); // Newest first

            if (error) throw error;
            setReasons(data || []);
        } catch (error) {
            console.error('Error fetching reasons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddReason = async (e) => {
        e.preventDefault();
        if (!newReason.trim()) return;

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('reasons')
                .insert([{ text: newReason, category: 'General' }]);

            if (error) throw error;

            setNewReason('');
            setIsModalOpen(false);
            fetchReasons();
        } catch (error) {
            console.error('Error adding reason:', error);
            alert('Error al guardar. ¿Quizás no tienes permisos?');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen py-6 px-4 pb-24">
            <header className="mb-8 text-center sticky top-0 bg-white/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 shadow-sm border-b border-romantic-50">
                <h1 className="text-3xl font-serif text-romantic-800 mb-2">Por qué te amo</h1>
                <p className="text-sm text-gray-500">
                    {loading ? 'Cargando razones...' : `${reasons.length} razones (y contando...)`}
                </p>
            </header>

            <div className="space-y-4 max-w-lg mx-auto">
                <AnimatePresence>
                    {loading ? (
                        <div className="text-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-romantic-500 mx-auto"></div>
                        </div>
                    ) : reasons.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                            <Heart className="mx-auto text-gray-300 mb-2" size={32} />
                            <p className="text-gray-400">Aún no hay razones guardadas.</p>
                            <button onClick={() => setIsModalOpen(true)} className="text-romantic-500 font-bold mt-2">
                                ¡Agrega la primera!
                            </button>
                        </div>
                    ) : (
                        reasons.map((reason, index) => (
                            <motion.div
                                key={reason.id}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.02 }}
                                className="bg-white p-6 rounded-xl shadow-sm border border-romantic-100 flex items-start group"
                            >
                                <div className="mr-4 mt-1 bg-romantic-50 p-2 rounded-full group-hover:bg-romantic-100 transition-colors">
                                    <Heart size={20} className="text-romantic-400 group-hover:text-romantic-600 transition-colors" />
                                </div>
                                <div className="flex-1">
                                    <span className="text-xs text-uppercase text-gray-400 font-bold tracking-widest block mb-1">
                                        RAZÓN #{reasons.length - index}
                                    </span>
                                    <p className="text-lg font-serif text-gray-800 leading-snug">
                                        {reason.text}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <div className="text-center mt-8 pb-10">
                <p className="text-romantic-400 font-serif italic text-lg">...y por todo lo que nos falta vivir.</p>
            </div>

            {/* Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-24 right-6 bg-romantic-500 text-white p-4 rounded-full shadow-lg shadow-romantic-300/50 z-40 bg-gradient-to-r from-romantic-400 to-romantic-600"
            >
                <Plus size={28} />
            </motion.button>

            {/* Add Reason Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Nueva Razón"
            >
                <form onSubmit={handleAddReason}>
                    <div className="mb-6">
                        <label className="text-xs text-gray-400 block mb-2 font-medium">¿Por qué l@ amas?</label>
                        <textarea
                            autoFocus
                            rows={4}
                            value={newReason}
                            onChange={(e) => setNewReason(e.target.value)}
                            className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300 text-gray-800 text-lg font-serif placeholder-gray-300"
                            placeholder="Escribe algo hermoso..."
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting || !newReason.trim()}
                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
                    >
                        {submitting ? 'Guardando...' : 'Guardar Razón ❤️'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default ReasonsPage;
