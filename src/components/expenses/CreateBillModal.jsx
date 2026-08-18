import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { supabase } from '../../lib/supabase';

const CATEGORIES = ['Alquiler', 'Expensas', 'Servicios', 'Internet', 'Otros'];

const CreateBillModal = ({ isOpen, onClose, onSuccess, editingBill = null }) => {
    const [formData, setFormData] = useState({
        title: '', category: 'Servicios', amount: '', due_day: '10', notes: ''
    });
    const [saving, setSaving] = useState(false);

    const isEditing = !!editingBill;

    useEffect(() => {
        if (editingBill) {
            setFormData({
                title: editingBill.title || '',
                category: editingBill.category || 'Servicios',
                amount: editingBill.amount || '',
                due_day: String(editingBill.due_day || 10),
                notes: editingBill.notes || '',
            });
        } else {
            setFormData({ title: '', category: 'Servicios', amount: '', due_day: '10', notes: '' });
        }
    }, [editingBill, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.due_day) return;

        setSaving(true);
        try {
            const payload = {
                title: formData.title,
                category: formData.category,
                amount: Number(formData.amount) || 0,
                due_day: Number(formData.due_day),
                notes: formData.notes,
            };

            if (isEditing) {
                const { error } = await supabase.from('home_bills').update(payload).eq('id', editingBill.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('home_bills').insert([payload]);
                if (error) throw error;
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving bill:', error);
            alert(isEditing ? 'Error al editar la cuenta' : 'Error al crear la cuenta');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Cuenta' : 'Nueva Cuenta Fija'}>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="text-xs text-gray-400 pl-1 block mb-1">Nombre</label>
                    <input
                        autoFocus
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ej: Alquiler"
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-400 pl-1 block mb-1">Categoría</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300 bg-white"
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 pl-1 block mb-1">Día de vencimiento</label>
                        <input
                            type="number"
                            min="1"
                            max="31"
                            value={formData.due_day}
                            onChange={(e) => setFormData({ ...formData, due_day: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs text-gray-400 pl-1 block mb-1">Monto aproximado ($)</label>
                    <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0"
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300"
                    />
                </div>

                <div>
                    <label className="text-xs text-gray-400 pl-1 block mb-1">Notas</label>
                    <textarea
                        rows={2}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300 resize-none"
                        placeholder="Notas adicionales..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={saving || !formData.title.trim()}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50"
                >
                    {saving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Cuenta'}
                </button>
            </form>
        </Modal>
    );
};

export default CreateBillModal;
