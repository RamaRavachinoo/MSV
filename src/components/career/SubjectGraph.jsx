import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CBC_SUBJECTS, CPO_SUBJECTS, IDIOMA, YEAR_COLORS } from '../../data/careerData';
import SubjectNode from './SubjectNode';

const SubjectGraph = ({ subjectStatuses, onSelectSubject }) => {

    const isBlocked = (subject) => {
        if (!subject.prerequisites || subject.prerequisites.length === 0) return false;
        return subject.prerequisites.some(prereq =>
            subjectStatuses[prereq]?.status !== 'aprobada'
        );
    };

    // Group CPO subjects by year
    const subjectsByYear = useMemo(() => {
        const groups = {};
        CPO_SUBJECTS.forEach(s => {
            if (!groups[s.year]) groups[s.year] = [];
            groups[s.year].push(s);
        });
        return groups;
    }, []);

    const years = Object.keys(subjectsByYear).sort((a, b) => Number(a) - Number(b));

    return (
        <div className="space-y-5">
            {/* CBC Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-4"
            >
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                    <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider">CBC</h4>
                    <span className="text-xs text-slate-400 ml-auto">
                        {CBC_SUBJECTS.filter(s => subjectStatuses[s.code]?.status === 'aprobada').length}/{CBC_SUBJECTS.length}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {CBC_SUBJECTS.map((subject, i) => (
                        <SubjectNode
                            key={subject.code}
                            subject={subject}
                            status={subjectStatuses[subject.code]}
                            isBlocked={false}
                            onClick={onSelectSubject}
                            delay={i * 0.03}
                        />
                    ))}
                </div>
            </motion.div>

            {/* CPO by Year */}
            {years.map((year, yi) => {
                const subjects = subjectsByYear[year];
                const colors = YEAR_COLORS[year] || YEAR_COLORS[1];
                const approved = subjects.filter(s => subjectStatuses[s.code]?.status === 'aprobada').length;

                return (
                    <motion.div
                        key={year}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + yi * 0.08 }}
                        className="glass-card rounded-2xl p-4"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: colors.accent }} />
                            <h4 className={`text-sm font-bold uppercase tracking-wider ${colors.text}`}>
                                Año {year}
                            </h4>
                            <span className="text-xs text-gray-400 ml-auto">
                                {approved}/{subjects.length}
                            </span>
                        </div>

                        {/* Prerequisite hints */}
                        {subjects.some(s => s.prerequisites.length > 0) && (
                            <div className="mb-3 flex flex-wrap gap-1.5">
                                {subjects.filter(s => s.prerequisites.length > 0).map(s => (
                                    <div key={s.code} className="text-[9px] text-gray-400 bg-gray-50 rounded-full px-2 py-0.5">
                                        <span className="font-semibold">{s.code}</span>
                                        {' ← '}
                                        {s.prerequisites.join(', ')}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                            {subjects.map((subject, i) => (
                                <SubjectNode
                                    key={subject.code}
                                    subject={subject}
                                    status={subjectStatuses[subject.code]}
                                    isBlocked={isBlocked(subject)}
                                    onClick={onSelectSubject}
                                    delay={0.05 + i * 0.03}
                                />
                            ))}
                        </div>
                    </motion.div>
                );
            })}

            {/* Idioma */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card rounded-2xl p-4"
            >
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                    <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Otros</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <SubjectNode
                        subject={IDIOMA}
                        status={subjectStatuses[IDIOMA.code]}
                        isBlocked={false}
                        onClick={onSelectSubject}
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default SubjectGraph;
