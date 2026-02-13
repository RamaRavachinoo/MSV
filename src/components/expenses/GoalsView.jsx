import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, Loader2 } from 'lucide-react';
import GoalCard from './GoalCard';
import CreateGoalModal from './CreateGoalModal';
import ContributionModal from './ContributionModal';

const GoalsView = () => {
    const { user } = useAuth();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    // Contribution State
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [isContribModalOpen, setIsContribModalOpen] = useState(false);

    // New / Edit Goal State
    const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);

    // Delete Confirmation State
    const [deleteConfirmGoal, setDeleteConfirmGoal] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setGoals(data || []);
        } catch (error) {
            console.error('Error fetching goals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGoal = async (id) => {
        setDeleting(true);
        try {
            // Delete contributions first (cascade usually handles this but safety first)
            await supabase.from('contributions').delete().eq('goal_id', id);

            const { error } = await supabase.from('goals').delete().eq('id', id);
            if (error) throw error;
            setGoals(prev => prev.filter(g => g.id !== id));
            setDeleteConfirmGoal(null);
        } catch (e) {
            console.error(e);
            alert("Error al borrar meta");
        } finally {
            setDeleting(false);
        }
    };

    const openContribModal = (goal) => {
        setSelectedGoal(goal);
        setIsContribModalOpen(true);
    };

    const openEditModal = (goal) => {
        setEditingGoal(goal);
        setIsCreateGoalOpen(true);
    };

    const openNewGoalModal = () => {
        setEditingGoal(null);
        setIsCreateGoalOpen(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 pb-24"
        >
            {/* Header / Create Button */}
            <div className="flex justify-between items-center px-2">
                <h2 className="text-xl font-serif text-gray-800">Nuestras Metas</h2>
                <button
                    onClick={openNewGoalModal}
                    className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-800 transition-colors"
                >
                    + Nueva Meta
                </button>
            </div>

            <div className="space-y-6">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : goals.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 p-8">
                        <div className="text-4xl mb-4">🎯</div>
                        <p className="text-gray-400 mb-4">No hay metas activas.</p>
                        <button onClick={openNewGoalModal} className="text-romantic-500 font-bold hover:underline">
                            ¡Creen la primera juntos!
                        </button>
                    </div>
                ) : (
                    goals.map((g) => (
                        <GoalCard
                            key={g.id}
                            goal={g}
                            currentUserId={user?.id}
                            onContribute={() => openContribModal(g)}
                            onDelete={(id) => setDeleteConfirmGoal(g)}
                            onEdit={(goal) => openEditModal(goal)}
                        />
                    ))
                )}
            </div>

            {/* Create / Edit Goal Modal */}
            <CreateGoalModal
                isOpen={isCreateGoalOpen}
                onClose={() => {
                    setIsCreateGoalOpen(false);
                    setEditingGoal(null);
                }}
                onSuccess={fetchGoals}
                editingGoal={editingGoal}
            />

            {/* Contribution Modal */}
            {selectedGoal && (
                <ContributionModal
                    isOpen={isContribModalOpen}
                    onClose={() => setIsContribModalOpen(false)}
                    goal={selectedGoal}
                    onSuccess={() => {
                        fetchGoals();
                        setIsContribModalOpen(false);
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmGoal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <AlertTriangle size={28} className="text-red-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">¿Eliminar esta meta?</h3>
                            <p className="text-sm text-gray-500 mb-1">
                                <span className="font-medium text-gray-700">
                                    {deleteConfirmGoal.emoji} "{deleteConfirmGoal.title}"
                                </span>
                            </p>
                            <p className="text-xs text-gray-400 mb-6">
                                Se eliminarán todos los aportes asociados a esta meta. Esta acción no se puede deshacer.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirmGoal(null)}
                                disabled={deleting}
                                className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDeleteGoal(deleteConfirmGoal.id)}
                                disabled={deleting}
                                className="flex-1 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                            >
                                {deleting && <Loader2 size={16} className="animate-spin" />}
                                {deleting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default GoalsView;
