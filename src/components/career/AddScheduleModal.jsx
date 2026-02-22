import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { SCHEDULE_DAYS, SCHEDULE_COLORS, ALL_SUBJECTS } from '../../data/careerData';

const TIME_OPTIONS = [];
for (let h = 7; h <= 22; h++) {
    TIME_OPTIONS.push(`${h.toString().padStart(2, '0')}:00`);
    if (h < 22) TIME_OPTIONS.push(`${h.toString().padStart(2, '0')}:30`);
}

const AddScheduleModal = ({ isOpen, onClose, onSave, onUpdate, editingEntry, subjectsInProgress }) => {
    const [form, setForm] = useState({
        subject_code: '',
        subject_name: '',
        day_of_week: 'Lunes',
        start_time: '08:00',
        end_time: '10:00',
        color: SCHEDULE_COLORS[0].hex,
        room: '',
    });

    useEffect(() => {
        if (editingEntry) {
            setForm({
                subject_code: editingEntry.subject_code || '',
                subject_name: editingEntry.subject_name || '',
                day_of_week: editingEntry.day_of_week || 'Lunes',
                start_time: editingEntry.start_time?.slice(0, 5) || '08:00',
                end_time: editingEntry.end_time?.slice(0, 5) || '10:00',
                color: editingEntry.color || SCHEDULE_COLORS[0].hex,
                room: editingEntry.room || '',
            });
        } else {
            setForm({
                subject_code: '',
                subject_name: '',
                day_of_week: 'Lunes',
                start_time: '08:00',
                end_time: '10:00',
                color: SCHEDULE_COLORS[0].hex,
                room: '',
            });
        }
    }, [editingEntry, isOpen]);

    const handleSubjectSelect = (code) => {
        const subject = ALL_SUBJECTS.find(s => s.code === code);
        setForm(prev => ({
            ...prev,
            subject_code: code,
            subject_name: subject?.name || '',
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.subject_name || !form.start_time || !form.end_time) return;
        if (editingEntry) {
            onUpdate(editingEntry.id, form);
        } else {
            onSave(form);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                onClick={onClose}
            />
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[70] max-h-[85vh] overflow-y-auto"
            >
                <div className="sticky top-0 bg-white rounded-t-3xl p-5 pb-3 border-b border-gray-100 flex justify-between items-center z-10">
                    <h3 className="font-serif font-bold text-gray-800 text-lg">
                        {editingEntry ? 'Editar Horario' : 'Nuevo Horario'}
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-5 pb-8">
                    {/* Subject Selection */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Materia</label>
                        {subjectsInProgress.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {subjectsInProgress.map(s => (
                                    <button
                                        key={s.code}
                                        type="button"
                                        onClick={() => handleSubjectSelect(s.code)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                            form.subject_code === s.code
                                                ? 'bg-romantic-500 text-white shadow-sm'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {s.name.length > 25 ? s.name.slice(0, 25) + '...' : s.name}
                                    </button>
                                ))}
                            </div>
                        )}
                        <input
                            type="text"
                            value={form.subject_name}
                            onChange={(e) => setForm(prev => ({ ...prev, subject_name: e.target.value, subject_code: prev.subject_code || 'custom' }))}
                            placeholder="Nombre de la materia"
                            className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300 text-sm"
                            required
                        />
                    </div>

                    {/* Day */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Día</label>
                        <div className="flex flex-wrap gap-2">
                            {SCHEDULE_DAYS.map(day => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, day_of_week: day }))}
                                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                                        form.day_of_week === day
                                            ? 'bg-romantic-500 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Desde</label>
                            <select
                                value={form.start_time}
                                onChange={(e) => setForm(prev => ({ ...prev, start_time: e.target.value }))}
                                className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300 text-sm"
                            >
                                {TIME_OPTIONS.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Hasta</label>
                            <select
                                value={form.end_time}
                                onChange={(e) => setForm(prev => ({ ...prev, end_time: e.target.value }))}
                                className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300 text-sm"
                            >
                                {TIME_OPTIONS.filter(t => t > form.start_time).map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Color */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Color</label>
                        <div className="flex flex-wrap gap-3">
                            {SCHEDULE_COLORS.map(c => (
                                <button
                                    key={c.hex}
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, color: c.hex }))}
                                    className={`w-8 h-8 rounded-full transition-all ${
                                        form.color === c.hex
                                            ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                                            : 'hover:scale-105'
                                    }`}
                                    style={{ backgroundColor: c.hex }}
                                    title={c.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Room */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Aula (opcional)</label>
                        <input
                            type="text"
                            value={form.room}
                            onChange={(e) => setForm(prev => ({ ...prev, room: e.target.value }))}
                            placeholder="Ej: Aula 204"
                            className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300 text-sm"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full py-3.5 btn-primary rounded-xl text-sm font-bold"
                    >
                        {editingEntry ? 'Guardar Cambios' : 'Agregar Horario'}
                    </button>
                </form>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default AddScheduleModal;
