import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Plus, BookOpen, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ALL_SUBJECTS, CPC_SUBJECTS, CBC_SUBJECTS, IDIOMA } from '../data/careerData';
import WeeklySchedule from '../components/career/WeeklySchedule';
import SubjectGraph from '../components/career/SubjectGraph';
import SubjectDetailModal from '../components/career/SubjectDetailModal';
import AddScheduleModal from '../components/career/AddScheduleModal';
import CareerStats from '../components/career/CareerStats';
import ConfirmModal from '../components/ui/ConfirmModal';

const CareerPage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [subjectStatuses, setSubjectStatuses] = useState({});
    const [grades, setGrades] = useState({});
    const [scheduleEntries, setScheduleEntries] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [editingScheduleEntry, setEditingScheduleEntry] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [activeTab, setActiveTab] = useState('horarios');

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchStatuses(),
                fetchGrades(),
                fetchSchedule(),
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatuses = async () => {
        try {
            if (!supabase) return;
            const { data, error } = await supabase.from('career_subject_status').select('*');
            if (error) throw error;
            const map = {};
            (data || []).forEach(row => {
                map[row.subject_code] = row;
            });
            setSubjectStatuses(map);
        } catch (e) {
            console.error('Error fetching statuses:', e);
        }
    };

    const fetchGrades = async () => {
        try {
            if (!supabase) return;
            const { data, error } = await supabase
                .from('career_grades')
                .select('*')
                .order('created_at', { ascending: true });
            if (error) throw error;
            const map = {};
            (data || []).forEach(row => {
                if (!map[row.subject_code]) map[row.subject_code] = [];
                map[row.subject_code].push(row);
            });
            setGrades(map);
        } catch (e) {
            console.error('Error fetching grades:', e);
        }
    };

    const fetchSchedule = async () => {
        try {
            if (!supabase) return;
            const { data, error } = await supabase.from('career_schedule').select('*');
            if (error) throw error;
            setScheduleEntries(data || []);
        } catch (e) {
            console.error('Error fetching schedule:', e);
        }
    };

    const handleStatusChange = async (subjectCode, newStatus) => {
        try {
            if (!supabase) return;
            const existing = subjectStatuses[subjectCode];
            if (existing) {
                const { error } = await supabase
                    .from('career_subject_status')
                    .update({ status: newStatus, updated_at: new Date().toISOString() })
                    .eq('id', existing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('career_subject_status')
                    .insert([{ subject_code: subjectCode, status: newStatus, user_id: user?.id }]);
                if (error) throw error;
            }
            await fetchStatuses();
        } catch (e) {
            console.error('Error updating status:', e);
        }
    };

    const handleNotesChange = async (subjectCode, notes) => {
        try {
            if (!supabase) return;
            const existing = subjectStatuses[subjectCode];
            if (existing) {
                const { error } = await supabase
                    .from('career_subject_status')
                    .update({ notes, updated_at: new Date().toISOString() })
                    .eq('id', existing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('career_subject_status')
                    .insert([{ subject_code: subjectCode, notes, status: 'pendiente', user_id: user?.id }]);
                if (error) throw error;
            }
            await fetchStatuses();
        } catch (e) {
            console.error('Error updating notes:', e);
        }
    };

    const handleAddGrade = async (subjectCode, gradeData) => {
        try {
            if (!supabase) return;
            const { error } = await supabase.from('career_grades').insert([{
                subject_code: subjectCode,
                eval_name: gradeData.eval_name,
                grade: gradeData.grade,
                eval_date: gradeData.eval_date || null,
                user_id: user?.id,
            }]);
            if (error) throw error;
            await fetchGrades();
        } catch (e) {
            console.error('Error adding grade:', e);
        }
    };

    const handleUpdateGrade = async (gradeId, gradeData) => {
        try {
            if (!supabase) return;
            const { error } = await supabase
                .from('career_grades')
                .update({
                    eval_name: gradeData.eval_name,
                    grade: gradeData.grade,
                    eval_date: gradeData.eval_date || null,
                })
                .eq('id', gradeId);
            if (error) throw error;
            await fetchGrades();
        } catch (e) {
            console.error('Error updating grade:', e);
        }
    };

    const handleDeleteGrade = async (gradeId) => {
        try {
            if (!supabase) return;
            const { error } = await supabase.from('career_grades').delete().eq('id', gradeId);
            if (error) throw error;
            await fetchGrades();
        } catch (e) {
            console.error('Error deleting grade:', e);
        }
    };

    const handleAddSchedule = async (entry) => {
        try {
            if (!supabase) return;
            const { error } = await supabase.from('career_schedule').insert([{
                subject_code: entry.subject_code,
                subject_name: entry.subject_name,
                day_of_week: entry.day_of_week,
                start_time: entry.start_time,
                end_time: entry.end_time,
                color: entry.color,
                room: entry.room || null,
                user_id: user?.id,
            }]);
            if (error) throw error;
            await fetchSchedule();
            setIsScheduleModalOpen(false);
        } catch (e) {
            console.error('Error adding schedule:', e);
        }
    };

    const handleUpdateSchedule = async (entryId, entry) => {
        try {
            if (!supabase) return;
            const { error } = await supabase
                .from('career_schedule')
                .update({
                    subject_code: entry.subject_code,
                    subject_name: entry.subject_name,
                    day_of_week: entry.day_of_week,
                    start_time: entry.start_time,
                    end_time: entry.end_time,
                    color: entry.color,
                    room: entry.room || null,
                })
                .eq('id', entryId);
            if (error) throw error;
            await fetchSchedule();
            setIsScheduleModalOpen(false);
            setEditingScheduleEntry(null);
        } catch (e) {
            console.error('Error updating schedule:', e);
        }
    };

    const handleDeleteSchedule = async () => {
        if (!deleteConfirm) return;
        try {
            if (!supabase) return;
            const { error } = await supabase.from('career_schedule').delete().eq('id', deleteConfirm);
            if (error) throw error;
            await fetchSchedule();
            setDeleteConfirm(null);
        } catch (e) {
            console.error('Error deleting schedule:', e);
        }
    };

    const handleEditScheduleEntry = (entry) => {
        setEditingScheduleEntry(entry);
        setIsScheduleModalOpen(true);
    };

    const subjectsInProgress = useMemo(() => {
        return ALL_SUBJECTS.filter(s => subjectStatuses[s.code]?.status === 'cursando');
    }, [subjectStatuses]);

    const selectedSubjectData = useMemo(() => {
        if (!selectedSubject) return null;
        return ALL_SUBJECTS.find(s => s.code === selectedSubject);
    }, [selectedSubject]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-romantic-200 border-t-romantic-500 rounded-full animate-spin" />
                    <p className="text-romantic-400 font-serif animate-pulse">Cargando carrera...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pt-6 pb-32">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-serif font-bold text-romantic-900 flex items-center gap-3"
                    >
                        <GraduationCap size={32} className="text-romantic-500" />
                        Carrera
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-sm text-romantic-500 mt-1 ml-1"
                    >
                        Abogacía UBA - Plan 2004/2008
                    </motion.p>
                </div>
            </div>

            {/* Tab Toggle */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex p-1 bg-gray-100 rounded-xl"
            >
                <button
                    onClick={() => setActiveTab('horarios')}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'horarios'
                            ? 'bg-white text-romantic-600 shadow-sm'
                            : 'text-gray-500'
                        }`}
                >
                    <Calendar size={16} />
                    Horarios
                </button>
                <button
                    onClick={() => setActiveTab('materias')}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'materias'
                            ? 'bg-white text-romantic-600 shadow-sm'
                            : 'text-gray-500'
                        }`}
                >
                    <BookOpen size={16} />
                    Materias
                </button>
            </motion.div>

            {/* Stats */}
            <CareerStats subjectStatuses={subjectStatuses} grades={grades} />

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'horarios' ? (
                    <motion.div
                        key="horarios"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <WeeklySchedule
                            entries={scheduleEntries}
                            onEdit={handleEditScheduleEntry}
                            onDelete={(id) => setDeleteConfirm(id)}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="materias"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <SubjectGraph
                            subjectStatuses={subjectStatuses}
                            onSelectSubject={setSelectedSubject}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAB */}
            {activeTab === 'horarios' && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                        setEditingScheduleEntry(null);
                        setIsScheduleModalOpen(true);
                    }}
                    className="fixed bottom-24 right-5 z-50 w-14 h-14 rounded-full btn-primary flex items-center justify-center shadow-xl"
                >
                    <Plus size={24} />
                </motion.button>
            )}

            {/* Modals */}
            <AddScheduleModal
                isOpen={isScheduleModalOpen}
                onClose={() => { setIsScheduleModalOpen(false); setEditingScheduleEntry(null); }}
                onSave={handleAddSchedule}
                onUpdate={handleUpdateSchedule}
                editingEntry={editingScheduleEntry}
                subjectsInProgress={subjectsInProgress}
            />

            {selectedSubjectData && (
                <SubjectDetailModal
                    isOpen={!!selectedSubject}
                    onClose={() => setSelectedSubject(null)}
                    subject={selectedSubjectData}
                    status={subjectStatuses[selectedSubject]}
                    grades={grades[selectedSubject] || []}
                    subjectStatuses={subjectStatuses}
                    onStatusChange={(newStatus) => handleStatusChange(selectedSubject, newStatus)}
                    onAddGrade={(gradeData) => handleAddGrade(selectedSubject, gradeData)}
                    onUpdateGrade={handleUpdateGrade}
                    onDeleteGrade={handleDeleteGrade}
                    onNotesChange={(notes) => handleNotesChange(selectedSubject, notes)}
                />
            )}

            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleDeleteSchedule}
                title="¿Borrar horario?"
                message="Este bloque de horario se eliminará del calendario."
                confirmText="Borrar"
                cancelText="Cancelar"
                isDestructive={true}
            />
        </div>
    );
};

export default CareerPage;
