import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, X, Heart, Calendar as CalendarIcon, MapPin, Repeat } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, getDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { createPortal } from 'react-dom';

const CalendarPage = () => {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // New Event State
    const [newEvent, setNewEvent] = useState({
        title: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'date', // date, anniversary, trip, birthday
        recurrence: 'none', // none, monthly, yearly
        description: ''
    });

    useEffect(() => {
        fetchEvents();
    }, [currentDate]); // Refetch when changing months (could optimize to fetch range)

    const fetchEvents = async () => {
        try {
            // Fetch all events for now (MVP optimization later)
            const { data, error } = await supabase
                .from('events')
                .select('*');

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

    // Calendar Generation Logic
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Fill empty spots at start of month
    const startDay = getDay(monthStart); // 0 (Sun) to 6 (Sat)
    const emptyStartDays = Array(startDay).fill(null);

    // Helpers
    const isToday = (day) => isSameDay(day, new Date());
    const isSelected = (day) => isSameDay(day, selectedDate);

    const getEventsForDay = (day) => {
        return events.filter(e => {
            const eDate = parseISO(e.event_date);

            // Exact checks
            if (e.recurrence === 'none') {
                return isSameDay(eDate, day);
            }
            // Monthly checks (same day number)
            if (e.recurrence === 'monthly') {
                return eDate.getDate() === day.getDate();
            }
            // Yearly checks (same month and day)
            if (e.recurrence === 'yearly') {
                return eDate.getDate() === day.getDate() && eDate.getMonth() === day.getMonth();
            }
            return false;
        });
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const EVENT_TYPES = {
        date: { label: 'Cita Romántica', color: 'bg-romantic-100 text-romantic-600', icon: <Heart size={16} /> },
        anniversary: { label: 'Aniversario', color: 'bg-purple-100 text-purple-600', icon: <CalendarIcon size={16} /> },
        trip: { label: 'Viaje', color: 'bg-blue-100 text-blue-600', icon: <MapPin size={16} /> },
        birthday: { label: 'Cumpleaños', color: 'bg-yellow-100 text-yellow-600', icon: <Heart size={16} /> },
        other: { label: 'Otro', color: 'bg-gray-100 text-gray-600 scale-75', icon: <div className="w-2 h-2 rounded-full bg-gray-400" /> }
    };

    return (
        <div className="min-h-screen pb-24 px-4 bg-romantic-50/50">
            {/* Header */}
            <div className="pt-8 pb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif text-romantic-900">Fechas Importantes 📅</h1>
                    <p className="text-sm text-romantic-600">Nuestros momentos especiales</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-3 bg-white text-romantic-500 rounded-full shadow-md active:scale-95 transition-transform"
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* Calendar Widget */}
            <div className="bg-white rounded-3xl shadow-lg shadow-romantic-200/50 p-6 mb-8 overflow-hidden relative">
                {/* Month Navigation */}
                <div className="flex justify-between items-center mb-6">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><ChevronLeft /></button>
                    <h2 className="text-xl font-bold text-gray-800 capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </h2>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><ChevronRight /></button>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 mb-4 text-center">
                    {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(d => (
                        <div key={d} className="text-xs font-bold text-gray-300 uppercase">{d}</div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-y-4 justify-items-center">
                    {emptyStartDays.map((_, i) => <div key={`empty-${i}`} />)}

                    {calendarDays.map((day) => {
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
                                    {hasEvent && !isSelected(day) && (
                                        <div className="absolute -bottom-1 w-1.5 h-1.5 bg-romantic-400 rounded-full" />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
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

                            {/* Delete Button (Only creator) */}
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
