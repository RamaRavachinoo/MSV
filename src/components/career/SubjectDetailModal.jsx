import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Edit3, Star, ArrowRight, Lock, CheckCircle } from 'lucide-react';
import { STATUS_CONFIG, CPC_SUBJECTS, ALL_SUBJECTS, EVAL_PRESETS } from '../../data/careerData';
import AddGradeModal from './AddGradeModal';

const SubjectDetailModal = ({
    isOpen,
    onClose,
    subject,
    status,
    grades,
    subjectStatuses,
    onStatusChange,
    onAddGrade,
    onUpdateGrade,
    onDeleteGrade,
    onNotesChange,
}) => {
    const [notes, setNotes] = useState(status?.notes || '');
    const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
    const [editingGrade, setEditingGrade] = useState(null);
    const [deleteGradeId, setDeleteGradeId] = useState(null);

    const currentStatus = status?.status || 'pendiente';

    const avgGrade = useMemo(() => {
        const valid = grades.filter(g => g.grade != null && g.grade !== '');
        if (valid.length === 0) return null;
        return (valid.reduce((sum, g) => sum + Number(g.grade), 0) / valid.length).toFixed(1);
    }, [grades]);

    // Get prerequisite subjects info
    const prerequisites = useMemo(() => {
        if (!subject.prerequisites || subject.prerequisites.length === 0) return [];
        return subject.prerequisites.map(code => {
            const s = ALL_SUBJECTS.find(sub => sub.code === code);
            return {
                code,
                name: s?.name || code,
                approved: subjectStatuses[code]?.status === 'aprobada',
            };
        });
    }, [subject, subjectStatuses]);

    // Get subjects that this one unlocks
    const unlocks = useMemo(() => {
        return CPC_SUBJECTS.filter(s =>
            s.prerequisites && s.prerequisites.includes(subject.code)
        ).map(s => ({ code: s.code, name: s.name }));
    }, [subject]);

    const handleNotesBlur = () => {
        if (notes !== (status?.notes || '')) {
            onNotesChange(notes);
        }
    };

    const handleSaveGrade = (gradeData) => {
        if (editingGrade) {
            onUpdateGrade(editingGrade.id, gradeData);
        } else {
            onAddGrade(gradeData);
        }
        setEditingGrade(null);
        setIsGradeModalOpen(false);
    };

    const handleConfirmDeleteGrade = () => {
        if (deleteGradeId) {
            onDeleteGrade(deleteGradeId);
            setDeleteGradeId(null);
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
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[70] max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="sticky top-0 bg-white rounded-t-3xl p-5 pb-3 border-b border-gray-100 z-10">
                    <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-2 mb-1">
                                {subject.code && !subject.code.startsWith('cbc') && (
                                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {subject.code}
                                    </span>
                                )}
                                {subject.isAnnual && (
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">
                                        Anual
                                    </span>
                                )}
                            </div>
                            <h3 className="font-serif font-bold text-gray-800 text-lg leading-tight">
                                {subject.name}
                            </h3>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 shrink-0">
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>
                </div>

                <div className="p-5 space-y-6 pb-10">
                    {/* Status Toggle */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Estado</label>
                        <div className="flex gap-2">
                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                <button
                                    key={key}
                                    onClick={() => onStatusChange(key)}
                                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border-2 ${currentStatus === key
                                        ? `${cfg.bg} ${cfg.border} ${cfg.text} shadow-sm`
                                        : 'border-gray-200 text-gray-400 hover:border-gray-300'
                                        }`}
                                >
                                    {cfg.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Prerequisites */}
                    {prerequisites.length > 0 && (
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Correlativas</label>
                            <div className="space-y-2">
                                {prerequisites.map(p => (
                                    <div
                                        key={p.code}
                                        className={`flex items-center gap-2 p-2.5 rounded-xl text-xs ${p.approved ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                                            }`}
                                    >
                                        {p.approved ? (
                                            <CheckCircle size={14} className="text-green-500 shrink-0" />
                                        ) : (
                                            <Lock size={14} className="text-red-400 shrink-0" />
                                        )}
                                        <span className="font-semibold">{p.code}</span>
                                        <span className="truncate">{p.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Unlocks */}
                    {unlocks.length > 0 && (
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Habilita</label>
                            <div className="flex flex-wrap gap-2">
                                {unlocks.map(u => (
                                    <div
                                        key={u.code}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium"
                                    >
                                        <ArrowRight size={10} />
                                        <span className="font-bold">{u.code}</span>
                                        {u.name.length > 20 ? u.name.slice(0, 20) + '...' : u.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Grades Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-semibold text-gray-700">Notas</label>
                                {avgGrade && (
                                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                        <Star size={10} fill="currentColor" />
                                        Promedio: {avgGrade}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => { setEditingGrade(null); setIsGradeModalOpen(true); }}
                                className="flex items-center gap-1 text-xs font-semibold text-romantic-500 hover:text-romantic-600"
                            >
                                <Plus size={14} /> Agregar
                            </button>
                        </div>

                        {grades.length === 0 ? (
                            <div className="text-center py-6 bg-gray-50 rounded-xl">
                                <p className="text-gray-400 text-sm">Sin notas todavía</p>
                                <p className="text-gray-300 text-xs mt-1">Agregá parciales, finales, TPs...</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {grades.map(g => (
                                    <motion.div
                                        key={g.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group"
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${g.grade >= 7 ? 'bg-green-100 text-green-700' :
                                            g.grade >= 4 ? 'bg-amber-100 text-amber-700' :
                                                g.grade != null ? 'bg-red-100 text-red-600' :
                                                    'bg-gray-100 text-gray-400'
                                            }`}>
                                            {g.grade != null ? g.grade : '-'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-700 truncate">{g.eval_name}</p>
                                            {g.eval_date && (
                                                <p className="text-[10px] text-gray-400">
                                                    {new Date(g.eval_date + 'T12:00:00').toLocaleDateString('es-AR', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                        <div className="hidden group-hover:flex gap-1">
                                            <button
                                                onClick={() => { setEditingGrade(g); setIsGradeModalOpen(true); }}
                                                className="p-1.5 rounded-lg hover:bg-blue-100"
                                            >
                                                <Edit3 size={14} className="text-blue-500" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteGradeId(g.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-100"
                                            >
                                                <Trash2 size={14} className="text-red-500" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Delete grade confirmation */}
                    {deleteGradeId && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-200">
                            <p className="text-xs text-red-600 flex-1">¿Borrar esta nota?</p>
                            <button
                                onClick={() => setDeleteGradeId(null)}
                                className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-white rounded-lg"
                            >
                                No
                            </button>
                            <button
                                onClick={handleConfirmDeleteGrade}
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-500 rounded-lg"
                            >
                                Sí, borrar
                            </button>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Observaciones</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            onBlur={handleNotesBlur}
                            placeholder="Notas sobre la materia, profesor, tips..."
                            rows={3}
                            className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300 text-sm resize-none"
                        />
                    </div>
                </div>

                {/* Add/Edit Grade Sub-Modal */}
                <AddGradeModal
                    isOpen={isGradeModalOpen}
                    onClose={() => { setIsGradeModalOpen(false); setEditingGrade(null); }}
                    onSave={handleSaveGrade}
                    editingGrade={editingGrade}
                />
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default SubjectDetailModal;
