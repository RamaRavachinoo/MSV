import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const ContributionModal = ({ isOpen, onClose, goal, onSuccess }) => {
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount) return;

        setLoading(true);
        try {
            // 1. Record contribution
            const { error: contribError } = await supabase.from('contributions').insert([{
                goal_id: goal.id,
                user_id: user?.id,
                amount: amount,
                note: 'Aporte'
            }]);

            if (contribError) throw contribError;

            // 2. Update goal current amount
            // NOTE: Ideally this should be a stored procedure or trigger for atomicity, 
            // but for now we follow existing logic.
            const { error: updateError } = await supabase
                .from('goals')
                .update({ current_amount: Number(goal.current_amount) + Number(amount) })
                .eq('id', goal.id);

            if (updateError) throw updateError;

            setAmount('');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error contributing:', error);
            alert('Error al aportar. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Aportar a ${goal?.title || 'Meta'}`}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="text-xs text-gray-400 block mb-2 pl-1">Monto a aportar</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
                        <input
                            autoFocus
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full pl-10 pr-4 py-4 text-3xl font-bold text-gray-800 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-romantic-300"
                            placeholder="0"
                        />
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-700">
                    <p>💡 Estás sumando tu granito de arena para <strong>{goal?.title}</strong>.</p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50"
                >
                    {loading ? 'Procesando...' : 'Confirmar Aporte'}
                </button>
            </form>
        </Modal>
    );
};

export default ContributionModal;
