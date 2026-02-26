import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ALL_SUBJECTS } from '../../data/careerData';
import { differenceInDays, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const UpcomingExamsWidget = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUpcomingExams();
    }, []);

    const fetchUpcomingExams = async () => {
        try {
            if (!supabase) return;

            const today = new Date().toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('career_grades')
                .select('*')
                .gte('eval_date', today)
                .order('eval_date', { ascending: true })
                .limit(5);

            if (error) throw error;

            // Enrich with subject names
            const enriched = (data || []).map(exam => {
                const subject = ALL_SUBJECTS.find(s => s.code === exam.subject_code);
                return {
                    ...exam,
                    subject_name: subject?.name || exam.subject_code,
                };
            });

            setExams(enriched);
        } catch (e) {
            console.error('Error fetching upcoming exams:', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading || exams.length === 0) return null;

    return (
        <div className="space-y-3">
            <h2 className="px-1 text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={14} />
                Próximos Exámenes
            </h2>
            {exams.map((exam, index) => {
                const examDate = parseISO(exam.eval_date);
                const days = differenceInDays(examDate, new Date());

                const urgencyColor = days <= 3
                    ? 'from-red-100 to-red-50 border-red-200/50'
                    : days <= 7
                        ? 'from-amber-100 to-amber-50 border-amber-200/50'
                        : 'from-blue-50 to-indigo-50 border-blue-200/50';

                const daysColor = days <= 3
                    ? 'text-red-600'
                    : days <= 7
                        ? 'text-amber-600'
                        : 'text-blue-600';

                return (
                    <motion.div
                        key={exam.id || index}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.08 }}
                        className={`bg-gradient-to-r ${urgencyColor} p-4 rounded-2xl flex items-center gap-3 cursor-pointer border hover:shadow-md transition-shadow`}
                        onClick={() => navigate('/carrera')}
                    >
                        <div className="flex flex-col items-center bg-white/70 backdrop-blur-sm px-3 py-2 rounded-xl min-w-[56px]">
                            <span className={`text-lg font-bold ${daysColor}`}>
                                {days === 0 ? 'Hoy' : days}
                            </span>
                            {days !== 0 && (
                                <span className="text-[9px] text-gray-500 uppercase font-bold">
                                    {days === 1 ? 'día' : 'días'}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="font-serif font-bold text-gray-800 text-sm truncate">
                                {exam.subject_name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-semibold text-gray-500 bg-white/60 px-2 py-0.5 rounded-full">
                                    {exam.eval_name}
                                </span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Calendar size={10} />
                                    {format(examDate, 'd MMM', { locale: es })}
                                </span>
                            </div>
                        </div>

                        <ChevronRight size={16} className="text-gray-300 shrink-0" />
                    </motion.div>
                );
            })}
        </div>
    );
};

export default UpcomingExamsWidget;
