import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Trash2, Edit3 } from 'lucide-react';
import { SCHEDULE_DAYS } from '../../data/careerData';

const HOUR_START = 7;
const HOUR_END = 22;
const HOURS = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i);
const ROW_HEIGHT = 52;

const timeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
};

const WeeklySchedule = ({ entries, onEdit, onDelete }) => {
    const [activeEntryId, setActiveEntryId] = useState(null);

    const entriesByDay = useMemo(() => {
        const map = {};
        SCHEDULE_DAYS.forEach(d => { map[d] = []; });
        entries.forEach(e => {
            if (map[e.day_of_week]) {
                map[e.day_of_week].push(e);
            }
        });
        return map;
    }, [entries]);

    const getEntryStyle = (entry) => {
        const startMin = timeToMinutes(entry.start_time);
        const endMin = timeToMinutes(entry.end_time);
        const topOffset = ((startMin - HOUR_START * 60) / 60) * ROW_HEIGHT;
        const height = ((endMin - startMin) / 60) * ROW_HEIGHT;
        return { top: `${topOffset}px`, height: `${Math.max(height, 28)}px` };
    };

    const handleEntryClick = (e, entryId) => {
        e.stopPropagation();
        setActiveEntryId(prev => prev === entryId ? null : entryId);
    };

    if (entries.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card rounded-2xl p-8 text-center"
            >
                <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-serif text-lg">Sin horarios todavía</p>
                <p className="text-gray-400 text-sm mt-1">
                    Tocá el botón + para agregar tus horarios de cursada
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl overflow-hidden"
            onClick={() => setActiveEntryId(null)}
        >
            <div className="p-4 border-b border-gray-100">
                <h3 className="font-serif font-bold text-gray-800 text-lg">Horarios de Cursada</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                    {entries.length} bloque{entries.length !== 1 ? 's' : ''} ·{' '}
                    <span className="italic">Tocá un bloque para editar o borrar</span>
                </p>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                    {/* Day Headers */}
                    <div className="grid grid-cols-[60px_repeat(6,1fr)] border-b border-gray-100">
                        <div className="p-2" />
                        {SCHEDULE_DAYS.map(day => (
                            <div key={day} className="p-2 text-center">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {day.slice(0, 3)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Time Grid */}
                    <div className="grid grid-cols-[60px_repeat(6,1fr)] relative">
                        {/* Hour labels */}
                        <div className="relative" style={{ height: `${HOURS.length * ROW_HEIGHT}px` }}>
                            {HOURS.map(h => (
                                <div
                                    key={h}
                                    className="absolute w-full text-right pr-2 text-[10px] text-gray-400 font-medium"
                                    style={{ top: `${(h - HOUR_START) * ROW_HEIGHT}px`, lineHeight: `${ROW_HEIGHT}px` }}
                                >
                                    {h}:00
                                </div>
                            ))}
                        </div>

                        {/* Day Columns */}
                        {SCHEDULE_DAYS.map(day => (
                            <div
                                key={day}
                                className="relative border-l border-gray-100"
                                style={{ height: `${HOURS.length * ROW_HEIGHT}px` }}
                            >
                                {/* Hour grid lines */}
                                {HOURS.map(h => (
                                    <div
                                        key={h}
                                        className="absolute w-full border-t border-gray-50"
                                        style={{ top: `${(h - HOUR_START) * ROW_HEIGHT}px` }}
                                    />
                                ))}

                                {/* Schedule Entries */}
                                {entriesByDay[day]?.map(entry => {
                                    const style = getEntryStyle(entry);
                                    const isActive = activeEntryId === entry.id;
                                    return (
                                        <div
                                            key={entry.id}
                                            className="absolute left-0.5 right-0.5 rounded-lg overflow-hidden cursor-pointer transition-all"
                                            style={{
                                                ...style,
                                                backgroundColor: entry.color + '20',
                                                borderLeft: `3px solid ${entry.color}`,
                                                boxShadow: isActive ? `0 0 0 2px ${entry.color}80` : undefined,
                                                zIndex: isActive ? 20 : 1,
                                            }}
                                            onClick={(e) => handleEntryClick(e, entry.id)}
                                        >
                                            {/* Content */}
                                            <div className="px-1.5 py-1">
                                                <p
                                                    className="text-[10px] font-bold leading-tight truncate"
                                                    style={{ color: entry.color }}
                                                >
                                                    {entry.subject_name}
                                                </p>
                                                <p className="text-[9px] text-gray-500 truncate">
                                                    {entry.start_time?.slice(0, 5)} - {entry.end_time?.slice(0, 5)}
                                                </p>
                                                {entry.room && (
                                                    <p className="text-[9px] text-gray-400 truncate flex items-center gap-0.5">
                                                        <MapPin size={8} /> {entry.room}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Action Bar — visible on tap */}
                                            <AnimatePresence>
                                                {isActive && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 4 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 4 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="absolute bottom-0 left-0 right-0 flex border-t"
                                                        style={{
                                                            borderColor: entry.color + '40',
                                                            backgroundColor: entry.color + '15',
                                                        }}
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onEdit(entry);
                                                                setActiveEntryId(null);
                                                            }}
                                                            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-bold hover:bg-blue-100 transition-colors"
                                                            style={{ color: '#3b82f6' }}
                                                        >
                                                            <Edit3 size={11} /> Editar
                                                        </button>
                                                        <div className="w-px bg-gray-200" />
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDelete(entry.id);
                                                                setActiveEntryId(null);
                                                            }}
                                                            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-bold hover:bg-red-100 transition-colors"
                                                            style={{ color: '#ef4444' }}
                                                        >
                                                            <Trash2 size={11} /> Borrar
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default WeeklySchedule;
