import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Clock, Target } from 'lucide-react';
import { ALL_SUBJECTS } from '../../data/careerData';

const TOTAL_SUBJECTS = ALL_SUBJECTS.length;

const CareerStats = ({ subjectStatuses, grades }) => {
    const stats = useMemo(() => {
        let aprobadas = 0;
        let cursando = 0;
        let pendientes = 0;

        ALL_SUBJECTS.forEach(s => {
            const st = subjectStatuses[s.code]?.status;
            if (st === 'aprobada') aprobadas++;
            else if (st === 'cursando') cursando++;
            else pendientes++;
        });

        // Average grade across all grades
        const allGrades = Object.values(grades).flat().filter(g => g.grade != null);
        const avgGrade = allGrades.length > 0
            ? (allGrades.reduce((sum, g) => sum + Number(g.grade), 0) / allGrades.length).toFixed(1)
            : null;

        const progressPercent = Math.round((aprobadas / TOTAL_SUBJECTS) * 100);

        return { aprobadas, cursando, pendientes, avgGrade, progressPercent };
    }, [subjectStatuses, grades]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-4"
        >
            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-gray-600">Progreso General</span>
                    <span className="text-xs font-bold text-romantic-600">{stats.progressPercent}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.progressPercent}%` }}
                        transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-romantic-400 to-romantic-500 rounded-full"
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3">
                <StatCard
                    icon={<CheckCircle size={16} />}
                    value={stats.aprobadas}
                    label="Aprobadas"
                    color="text-green-600"
                    bgColor="bg-green-100"
                />
                <StatCard
                    icon={<Clock size={16} />}
                    value={stats.cursando}
                    label="Cursando"
                    color="text-amber-600"
                    bgColor="bg-amber-100"
                />
                <StatCard
                    icon={<BookOpen size={16} />}
                    value={stats.pendientes}
                    label="Faltan"
                    color="text-gray-500"
                    bgColor="bg-gray-100"
                />
                <StatCard
                    icon={<Target size={16} />}
                    value={stats.avgGrade || '-'}
                    label="Promedio"
                    color="text-romantic-600"
                    bgColor="bg-romantic-100"
                />
            </div>
        </motion.div>
    );
};

const StatCard = ({ icon, value, label, color, bgColor }) => (
    <div className="flex flex-col items-center text-center">
        <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center mb-1 ${color}`}>
            {icon}
        </div>
        <span className={`text-lg font-bold ${color}`}>{value}</span>
        <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">{label}</span>
    </div>
);

export default CareerStats;
