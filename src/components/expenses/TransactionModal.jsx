import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

const PRESET_CATEGORIES = {
    expense: [
        { id: 'comida', label: 'Cena Rica 🍕' },
        { id: 'transporte', label: 'Uber/Bondi 🚌' },
        { id: 'super', label: 'Supermercado 🛒' },
        { id: 'servicios', label: 'Servicios 💡' },
        { id: 'regalos', label: 'Regalitos 🎁' },
        { id: 'otros', label: 'Otros 🤷‍♂️' }
    ],
    income: [
        { id: 'sueldo', label: 'Sueldo 💼' },
        { id: 'regalo', label: 'Regalo 🎁' },
        { id: 'extra', label: 'Platita Extra 🤑' }
    ]
};

const TransactionModal = ({ isOpen, onClose, editingTx, onSuccess }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        type: 'expense',
        amount: '',
        description: '',
        category: '',
        date: format(new Date(), 'yyyy-MM-dd')
    });

    useEffect(() => {
        if (editingTx) {
            setFormData({
                type: editingTx.type,
                amount: editingTx.amount,
                description: editingTx.description,
                category: editingTx.category,
                date: format(new Date(editingTx.date), 'yyyy-MM-dd')
            });
        } else {
            setFormData({
                type: 'expense',
                amount: '',
                description: '',
                category: '',
                date: format(new Date(), 'yyyy-MM-dd')
            });
        }
    }, [editingTx, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.description) return;

        try {
            const txData = {
                type: formData.type,
                amount: formData.amount,
                description: formData.description,
                category: formData.category || (formData.type === 'income' ? 'Ingreso' : 'Gasto'),
                date: new Date(formData.date).toISOString(),
                user_id: user?.id
            };

            if (editingTx) {
                const { error } = await supabase
                    .from('expenses')
                    .update(txData)
                    .eq('id', editingTx.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('expenses')
                    .insert([txData]);
                if (error) throw error;
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving transaction:', error);
            alert('Error al guardar. Intenta de nuevo.');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingTx ? 'Editar Movimiento' : 'Nuevo Movimiento'}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Type Toggle */}
                <div className="flex p-1 bg-gray-100 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'expense' })}
                        className={`flex-1 py-3 rounded-lg font-medium transition-all ${formData.type === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400'
                            }`}
                    >
                        Gasto 💸
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'income' })}
                        className={`flex-1 py-3 rounded-lg font-medium transition-all ${formData.type === 'income' ? 'bg-white text-green-500 shadow-sm' : 'text-gray-400'
                            }`}
                    >
                        Ingreso 💰
                    </button>
                </div>

                {/* Amount */}
                <div>
                    <label className="text-xs text-gray-400 pl-1 block mb-1">Monto</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="w-full pl-10 pr-4 py-4 bg-gray-50 rounded-2xl text-2xl font-bold text-gray-800 outline-none focus:ring-2 focus:ring-romantic-300"
                            placeholder="0"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="text-xs text-gray-400 pl-1 block mb-1">Descripción</label>
                    <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300"
                        placeholder={formData.type === 'expense' ? 'Ej: Cine y pochoclos' : 'Ej: Aguinaldo'}
                    />
                </div>

                {/* Category Tags */}
                <div>
                    <label className="text-xs text-gray-400 pl-1 block mb-2">Categoría</label>
                    <div className="flex flex-wrap gap-2">
                        {PRESET_CATEGORIES[formData.type].map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, category: cat.label })}
                                className={`px-3 py-2 rounded-lg text-sm transition-all border ${formData.category === cat.label
                                    ? 'bg-romantic-100 border-romantic-300 text-romantic-700'
                                    : 'bg-white border-gray-200 text-gray-500'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date */}
                <div>
                    <label className="text-xs text-gray-400 pl-1 block mb-1">Fecha</label>
                    <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-lg shadow-gray-200 active:scale-95 transition-transform"
                >
                    Guardar
                </button>
            </form>
        </Modal>
    );
};

export default TransactionModal;
