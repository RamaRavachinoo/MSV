import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Lock, Circle } from 'lucide-react';
import { STATUS_CONFIG } from '../../data/careerData';

const SubjectNode = ({ subject, status, isBlocked, onClick, delay = 0 }) => {
    const currentStatus = status?.status || 'pendiente';
    const config = STATUS_CONFIG[currentStatus];

    const getIcon = () => {
        if (currentStatus === 'aprobada') return <CheckCircle size={14} className="text-green-500" />;
        if (currentStatus === 'cursando') return <Clock size={14} className="text-amber-500" />;
        if (isBlocked) return <Lock size={12} className="text-gray-300" />;
        return <Circle size={12} className="text-gray-300" />;
    };

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, type: 'spring', stiffness: 120 }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onClick(subject.code)}
            className={`relative flex flex-col items-start p-3 rounded-xl border-2 transition-all text-left min-w-0 ${
                config.bg
            } ${config.border} ${
                isBlocked && currentStatus === 'pendiente' ? 'opacity-50' : ''
            } ${
                currentStatus === 'cursando' ? 'shadow-md shadow-amber-200/50' : 'shadow-sm'
            }`}
        >
            {/* Pulse for cursando */}
            {currentStatus === 'cursando' && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                </span>
            )}

            <div className="flex items-center gap-1.5 mb-1 w-full">
                {getIcon()}
                {subject.code && !subject.code.startsWith('cbc') && (
                    <span className="text-[10px] font-bold text-gray-400">{subject.code}</span>
                )}
                {subject.isAnnual && (
                    <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600 ml-auto">
                        Anual
                    </span>
                )}
            </div>

            <p className={`text-xs font-semibold leading-tight ${config.text} line-clamp-2`}>
                {subject.name}
            </p>
        </motion.button>
    );
};

export default SubjectNode;
