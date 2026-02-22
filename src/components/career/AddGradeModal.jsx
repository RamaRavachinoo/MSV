import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { EVAL_PRESETS } from '../../data/careerData';

const AddGradeModal = ({ isOpen, onClose, onSave, editingGrade }) => {
    const [form, setForm] = useState({
        eval_name: '',
        grade: '',
        eval_date: '',
    });

    useEffect(() => {
        if (editingGrade) {
            setForm({
                eval_name: editingGrade.eval_name || '',
                grade: editingGrade.grade != null ? String(editingGrade.grade) : '',
                eval_date: editingGrade.eval_date || '',
            });
        } else {
            setForm({ eval_name: '', grade: '', eval_date: '' });
        }
    }, [editingGrade, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.eval_name) return;
        onSave({
            eval_name: form.eval_name,
            grade: form.grade !== '' ? Number(form.grade) : null,
            eval_date: form.eval_date || null,
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {/* This renders on top of the SubjectDetailModal */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 z-[80]"
                onClick={onClose}
            />
            <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 250 }}
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[90] max-h-[70vh] overflow-y-auto"
            >
                <div className="sticky top-0 bg-white rounded-t-3xl p-4 pb-2 border-b border-gray-100 flex justify-between items-center z-10">
                    <h4 className="font-serif font-bold text-gray-800">
                        {editingGrade ? 'Editar Nota' : 'Nueva Nota'}
                    </h4>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <X size={18} className="text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4 pb-8">
                    {/* Eval name presets */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Tipo de evaluación</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {EVAL_PRESETS.map(preset => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, eval_name: preset }))}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                        form.eval_name === preset
                                            ? 'bg-romantic-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {preset}
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={form.eval_name}
                            onChange={(e) => setForm(prev => ({ ...prev, eval_name: e.target.value }))}
                            placeholder="O escribí un nombre personalizado"
                            className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300 text-sm"
                            required
                        />
                    </div>

                    {/* Grade */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Nota (0-10)</label>
                        <input
                            type="number"
                            value={form.grade}
                            onChange={(e) => setForm(prev => ({ ...prev, grade: e.target.value }))}
                            placeholder="Ej: 7"
                            min="0"
                            max="10"
                            step="0.5"
                            className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300 text-sm"
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Fecha (opcional)</label>
                        <input
                            type="date"
                            value={form.eval_date}
                            onChange={(e) => setForm(prev => ({ ...prev, eval_date: e.target.value }))}
                            className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300 text-sm"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full py-3 btn-primary rounded-xl text-sm font-bold"
                    >
                        {editingGrade ? 'Guardar Cambios' : 'Agregar Nota'}
                    </button>
                </form>
            </motion.div>
        </AnimatePresence>
    );
};

export default AddGradeModal;
