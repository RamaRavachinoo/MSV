import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, X, Heart, Calendar as CalendarIcon, MapPin, Repeat, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { createPortal } from 'react-dom';

const EVENT_TYPES = {
    date: { label: 'Cita Romántica', color: 'bg-romantic-100 text-romantic-600', dotColor: 'bg-romantic-400', icon: <Heart size={16} /> },
    anniversary: { label: 'Aniversario', color: 'bg-purple-100 text-purple-600', dotColor: 'bg-purple-400', icon: <CalendarIcon size={16} /> },
    trip: { label: 'Viaje', color: 'bg-blue-100 text-blue-600', dotColor: 'bg-blue-400', icon: <MapPin size={16} /> },
    birthday: { label: 'Cumpleaños', color: 'bg-yellow-100 text-yellow-600', dotColor: 'bg-yellow-400', icon: <Heart size={16} /> },
    other: { label: 'Otro', color: 'bg-gray-100 text-gray-600', dotColor: 'bg-gray-400', icon: <div className="w-2 h-2 rounded-full bg-gray-400" /> }
};

const CalendarPage = () => {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('month');

    const [newEvent, setNewEvent] = useState({
        title: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'date',
        recurrence: 'none',
        description: ''
    });

    useEffect(() => {
        fetchEvents();
    }, [currentDate]);

    const fetchEvents = async () => {
        try {
            const { data, error } = await supabase.from('events').select('*');
            if (error) throw error;
            setEvents(data || []);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        if (!newEvent.title || !newEvent.date) return;

        try {
            const { error } = await supabase.from('events').insert([{
                title: newEvent.title,
                event_date: newEvent.date,
                type: newEvent.type,
                recurrence: newEvent.recurrence,
                description: newEvent.description,
                created_by: user?.id
            }]);
            if (error) throw error;

            fetchEvents();
            setIsModalOpen(false);
            setNewEvent({ title: '', date: format(new Date(), 'yyyy-MM-dd'), type: 'date', recurrence: 'none', description: '' });
        } catch (error) {
            console.error('Error adding event:', error);
            alert('Error al guardar fecha');
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm("¿Borrar esta fecha importante?")) return;
        try {
            const { error } = await supabase.from('events').delete().eq('id', id);
            if (error) throw error;
            fetchEvents();
        } catch (e) { console.error(e); }
    };

    // Calendar Generation
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const emptyStartDays = Array(getDay(monthStart)).fill(null);

    // Week view
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const isToday = (day) => isSameDay(day, new Date());
    const isSelected = (day) => isSameDay(day, selectedDate);

    const getEventsForDay = (day) => {
        return events.filter(e => {
            const eDate = parseISO(e.event_date);
            if (e.recurrence === 'none') return isSameDay(eDate, day);
            if (e.recurrence === 'monthly') return eDate.getDate() === day.getDate();
            if (e.recurrence === 'yearly') return eDate.getDate() === day.getDate() && eDate.getMonth() === day.getMonth();
            return false;
        });
    };

    // Next upcoming event
    const nextUpcoming = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = events.map(e => {
            const eDate = parseISO(e.event_date);
            if (e.recurrence === 'yearly') {
                let next = new Date(today.getFullYear(), eDate.getMonth(), eDate.getDate());
                if (next < today) next.setFullYear(next.getFullYear() + 1);
                return { ...e, nextDate: next };
            }
            if (e.recurrence === 'monthly') {
                let next = new Date(today.getFullYear(), today.getMonth(), eDate.getDate());
                if (next < today) next.setMonth(next.getMonth() + 1);
                return { ...e, nextDate: next };
            }
            return { ...e, nextDate: eDate };
        })
            .filter(e => e.nextDate >= today)
            .sort((a, b) => a.nextDate - b.nextDate);

        return upcoming[0] || null;
    }, [events]);

    const daysUntilNext = nextUpcoming ? differenceInDays(nextUpcoming.nextDate, new Date()) : null;

    // Navigation
    const goForward = () => {
        if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
        else setSelectedDate(addWeeks(selectedDate, 1));
    };
    const goBack = () => {
        if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
        else setSelectedDate(subWeeks(selectedDate, 1));
    };

    const renderDayCell = (day) => {
        const dayEvents = getEventsForDay(day);
        const hasEvent = dayEvents.length > 0;

        return (
            <div key={day.toString()} className="flex flex-col items-center gap-1 relative">
                <button
                    onClick={() => setSelectedDate(day)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all relative
                        ${isToday(day) ? 'bg-romantic-100 text-romantic-600 ring-2 ring-romantic-200' : ''}
                        ${isSelected(day) ? 'bg-romantic-500 text-white shadow-lg shadow-romantic-300' : 'text-gray-700 hover:bg-gray-50'}
                    `}
                >
                    {format(day, 'd')}
                </button>
                {/* Colored event dots */}
                {hasEvent && !isSelected(day) && (
                    <div className="absolute -bottom-1 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((e, i) => (
                            <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${EVENT_TYPES[e.type]?.dotColor || 'bg-gray-400'}`}
                            />
                        ))}
                    </div>
                )}
                {hasEvent && isSelected(day) && (
                    <div className="absolute -bottom-1 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen pb-24 px-4 bg-romantic-50/50">
            {/* Header */}
            <div className="pt-8 pb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif text-romantic-900">Fechas Importantes</h1>
                    <p className="text-sm text-romantic-600">Nuestros momentos especiales</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-3 bg-white text-romantic-500 rounded-full shadow-md active:scale-95 transition-transform"
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* Next Event Countdown */}
            {nextUpcoming && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-romantic-100 to-purple-100 p-4 rounded-2xl mb-6 flex items-center gap-4 border border-romantic-200/50"
                >
                    <div className="text-2xl">
                        {EVENT_TYPES[nextUpcoming.type]?.icon || <Clock size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-romantic-500 font-bold uppercase tracking-wider">Próximo</p>
                        <p className="font-serif font-bold text-gray-800 truncate">{nextUpcoming.title}</p>
                    </div>
                    <div className="flex flex-col items-center bg-white/60 backdrop-blur-sm px-3 py-2 rounded-xl">
                        <span className="text-2xl font-bold text-romantic-600">
                            {daysUntilNext === 0 ? 'Hoy' : daysUntilNext}
                        </span>
                        {daysUntilNext !== 0 && (
                            <span className="text-xs text-gray-500">{daysUntilNext === 1 ? 'día' : 'días'}</span>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Calendar Widget */}
            <div className="bg-white rounded-3xl shadow-lg shadow-romantic-200/50 p-6 mb-8 overflow-hidden relative">
                {/* View Mode Toggle */}
                <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
                    <button
                        onClick={() => setViewMode('month')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'month' ? 'bg-white text-romantic-600 shadow-sm' : 'text-gray-400'}`}
                    >
                        Mes
                    </button>
                    <button
                        onClick={() => setViewMode('week')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'week' ? 'bg-white text-romantic-600 shadow-sm' : 'text-gray-400'}`}
                    >
                        Semana
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mb-6">
                    <button onClick={goBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><ChevronLeft /></button>
                    <h2 className="text-xl font-bold text-gray-800 capitalize">
                        {viewMode === 'month'
                            ? format(currentDate, 'MMMM yyyy', { locale: es })
                            : `${format(weekStart, "d MMM", { locale: es })} - ${format(weekEnd, "d MMM", { locale: es })}`
                        }
                    </h2>
                    <button onClick={goForward} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><ChevronRight /></button>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 mb-4 text-center">
                    {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(d => (
                        <div key={d} className="text-xs font-bold text-gray-300 uppercase">{d}</div>
                    ))}
                </div>

                {/* Days Grid */}
                <AnimatePresence mode="wait">
                    {viewMode === 'month' ? (
                        <motion.div
                            key="month"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-7 gap-y-4 justify-items-center"
                        >
                            {emptyStartDays.map((_, i) => <div key={`empty-${i}`} />)}
                            {calendarDays.map(renderDayCell)}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="week"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-7 gap-y-4 justify-items-center"
                        >
                            {weekDays.map(renderDayCell)}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Selected Date Events */}
            <div className="space-y-4">
                <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider pl-1">
                    {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                </h3>

                {getEventsForDay(selectedDate).length === 0 ? (
                    <div className="text-center py-8 bg-white/50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm">No hay eventos para este día.</p>
                        <button onClick={() => {
                            setNewEvent({ ...newEvent, date: format(selectedDate, 'yyyy-MM-dd') });
                            setIsModalOpen(true);
                        }} className="text-romantic-500 font-bold text-sm mt-2 hover:underline">
                            + Agregar Evento
                        </button>
                    </div>
                ) : (
                    getEventsForDay(selectedDate).map(e => (
                        <motion.div
                            key={e.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${EVENT_TYPES[e.type]?.color || EVENT_TYPES.other.color}`}>
                                    {EVENT_TYPES[e.type]?.icon || EVENT_TYPES.other.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-lg">{e.title}</h4>
                                    {e.description && <p className="text-sm text-gray-500">{e.description}</p>}
                                    {e.recurrence !== 'none' && (
                                        <div className="flex items-center gap-1 text-xs text-romantic-400 mt-1 font-medium bg-romantic-50 px-2 py-0.5 rounded-md w-fit">
                                            <Repeat size={10} />
                                            {e.recurrence === 'monthly' ? 'Repite cada mes' : 'Repite cada año'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {user?.id === e.created_by && (
                                <button
                                    onClick={() => handleDeleteEvent(e.id)}
                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </motion.div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            {isModalOpen && createPortal(
                <AnimatePresence>
                    <>
                        <motion.div
                            key="backdrop-cal"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            key="modal-cal"
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-[70] shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-serif text-gray-800">Nueva Fecha Importante</h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddEvent} className="space-y-5 pb-8">
                                <div>
                                    <label className="text-xs text-gray-400 pl-1 block mb-1">Título</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newEvent.title}
                                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300"
                                        placeholder="Ej: Cena Aniversario"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-400 pl-1 block mb-1">Fecha</label>
                                        <input
                                            type="date"
                                            value={newEvent.date}
                                            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 pl-1 block mb-1">Tipo</label>
                                        <select
                                            value={newEvent.type}
                                            onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300 appearance-none"
                                        >
                                            <option value="date">Cita ❤️</option>
                                            <option value="anniversary">Aniversario 📅</option>
                                            <option value="trip">Viaje ✈️</option>
                                            <option value="birthday">Cumpleaños 🎂</option>
                                            <option value="other">Otro 📌</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400 pl-1 block mb-1">Repetición</label>
                                    <div className="flex p-1 bg-gray-100 rounded-xl">
                                        {['none', 'monthly', 'yearly'].map(rec => (
                                            <button
                                                key={rec}
                                                type="button"
                                                onClick={() => setNewEvent({ ...newEvent, recurrence: rec })}
                                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${newEvent.recurrence === rec ? 'bg-white text-romantic-600 shadow-sm' : 'text-gray-400'}`}
                                            >
                                                {rec === 'none' ? 'Una vez' : rec === 'monthly' ? 'Mensual' : 'Anual'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-romantic-500 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform shadow-romantic-200"
                                >
                                    Guardar Fecha
                                </button>
                            </form>
                        </motion.div>
                    </>
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default CalendarPage;
