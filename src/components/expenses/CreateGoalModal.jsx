import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Target, PiggyBank } from 'lucide-react';

const CreateGoalModal = ({ isOpen, onClose, onSuccess, editingGoal = null }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        target_amount: '',
        emoji: '🎯',
        is_shared: true
    });

    const isEditing = !!editingGoal;

    // Pre-fill form when editing
    useEffect(() => {
        if (editingGoal) {
            setFormData({
                title: editingGoal.title || '',
                description: editingGoal.description || '',
                target_amount: editingGoal.target_amount || '',
                emoji: editingGoal.emoji || '🎯',
                is_shared: editingGoal.is_shared ?? true
            });
        } else {
            setFormData({ title: '', description: '', target_amount: '', emoji: '🎯', is_shared: true });
        }
    }, [editingGoal, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.target_amount) return;

        try {
            if (isEditing) {
                // Update existing goal
                const { error } = await supabase
                    .from('goals')
                    .update({
                        title: formData.title,
                        description: formData.description,
                        target_amount: Number(formData.target_amount),
                        emoji: formData.emoji,
                        is_shared: formData.is_shared
                    })
                    .eq('id', editingGoal.id);

                if (error) throw error;
            } else {
                // Create new goal
                const { error } = await supabase.from('goals').insert([{
                    title: formData.title,
                    description: formData.description,
                    target_amount: formData.target_amount,
                    emoji: formData.emoji,
                    is_shared: formData.is_shared,
                    current_amount: 0,
                    created_by: user?.id
                }]);

                if (error) throw error;
            }

            setFormData({ title: '', description: '', target_amount: '', emoji: '🎯', is_shared: true });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving goal:', error);
            alert(isEditing ? 'Error al editar meta' : 'Error al crear meta');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Meta' : 'Nueva Meta'}>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="text-xs text-gray-400 pl-1 block mb-1">Título</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ej: Auto Nuevo 🚗"
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300"
                    />
                </div>

                <div>
                    <label className="text-xs text-gray-400 pl-1 block mb-1">Descripción</label>
                    <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Ej: Para viajar a Brasil en verano ☀️"
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300"
                    />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-xs text-gray-400 pl-1 block mb-1">Meta ($)</label>
                        <input
                            type="number"
                            value={formData.target_amount}
                            onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                            placeholder="500000"
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300"
                        />
                    </div>
                    <div className="w-24">
                        <label className="text-xs text-gray-400 pl-1 block mb-1">Emoji</label>
                        <input
                            type="text"
                            value={formData.emoji}
                            onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300 text-center"
                        />
                    </div>
                </div>

                {/* Shared Toggle */}
                <div
                    onClick={() => setFormData({ ...formData, is_shared: !formData.is_shared })}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${formData.is_shared ? 'bg-romantic-50 border-romantic-200' : 'bg-gray-50 border-gray-200'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${formData.is_shared ? 'bg-romantic-100 text-romantic-600' : 'bg-gray-200 text-gray-500'}`}>
                            {formData.is_shared ? <Target size={20} /> : <PiggyBank size={20} />}
                        </div>
                        <div>
                            <p className={`font-medium ${formData.is_shared ? 'text-romantic-900' : 'text-gray-700'}`}>
                                {formData.is_shared ? 'Meta Compartida' : 'Meta Personal'}
                            </p>
                            <p className="text-xs text-gray-400">
                                {formData.is_shared ? 'Ambos podrán ver y aportar.' : 'Solo tú podrás verla.'}
                            </p>
                        </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.is_shared ? 'border-romantic-500 bg-romantic-500' : 'border-gray-300'
                        }`}>
                        {formData.is_shared && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
                >
                    {isEditing ? 'Guardar Cambios' : 'Crear Meta'}
                </button>
            </form>
        </Modal>
    );
};

export default CreateGoalModal;
