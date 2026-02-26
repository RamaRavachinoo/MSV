import React from 'react';
import { motion } from 'framer-motion';
import { CBC_SUBJECTS, CPC_SUBJECTS, CPO_SUBJECTS, IDIOMA } from '../../data/careerData';
import SubjectNode from './SubjectNode';

const SubjectGraph = ({ subjectStatuses, onSelectSubject }) => {

    const isBlocked = (subject) => {
        if (!subject.prerequisites || subject.prerequisites.length === 0) return false;
        return subject.prerequisites.some(prereq =>
            subjectStatuses[prereq]?.status !== 'aprobada'
        );
    };

    const cpcApproved = CPC_SUBJECTS.filter(s => subjectStatuses[s.code]?.status === 'aprobada').length;

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
                    <span className="text-xs text-slate-400 ml-1">Ciclo Básico Común</span>
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

            {/* CPC — Unified Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-2xl p-4"
            >
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <h4 className="text-sm font-bold text-blue-700 uppercase tracking-wider">CPC</h4>
                    <span className="text-xs text-blue-400 ml-1">Ciclo Profesional Común</span>
                    <span className="text-xs text-gray-400 ml-auto">
                        {cpcApproved}/{CPC_SUBJECTS.length}
                    </span>
                </div>

                {/* Prerequisite hints */}
                {CPC_SUBJECTS.some(s => s.prerequisites.length > 0) && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                        {CPC_SUBJECTS.filter(s => s.prerequisites.length > 0).map(s => (
                            <div key={s.code} className="text-[9px] text-gray-400 bg-gray-50 rounded-full px-2 py-0.5">
                                <span className="font-semibold">{s.code}</span>
                                {' ← '}
                                {s.prerequisites.join(', ')}
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                    {CPC_SUBJECTS.map((subject, i) => (
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

            {/* Idioma */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card rounded-2xl p-4"
            >
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                    <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Idioma</h4>
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

            {/* CPO Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card rounded-2xl p-4 border-2 border-purple-200"
            >
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <h4 className="text-sm font-bold text-purple-700 uppercase tracking-wider">CPO</h4>
                    <span className="text-xs text-purple-400 ml-1">Ciclo Profesional Orientado</span>
                    <span className="text-xs text-purple-400 ml-auto">
                        {CPO_SUBJECTS.filter(s => subjectStatuses[s.code]?.status === 'aprobada').length}/{CPO_SUBJECTS.length}
                    </span>
                </div>
                <p className="text-[10px] text-purple-400 mb-3">Elegís una orientación y cursás sus materias</p>
                <div className="grid grid-cols-2 gap-2">
                    {CPO_SUBJECTS.map((subject, i) => (
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
        </div>
    );
};

export default SubjectGraph;
