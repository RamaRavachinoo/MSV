import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { currentPeriod, dueDateThisMonth } from '../../lib/bills';
import { ALL_SUBJECTS } from '../../data/careerData';

const EVENT_EMOJIS = {
    date: '❤️',
    anniversary: '📅',
    trip: '✈️',
    birthday: '🎂',
    other: '📌',
};

const urgencyStyle = (daysUntil) => {
    if (daysUntil <= 3) return { bg: 'from-red-100 to-red-50 border-red-200/50', pill: 'text-red-600' };
    if (daysUntil <= 7) return { bg: 'from-amber-100 to-amber-50 border-amber-200/50', pill: 'text-amber-600' };
    return { bg: 'from-blue-50 to-indigo-50 border-blue-200/50', pill: 'text-blue-600' };
};

const nextOccurrence = (event) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eDate = parseISO(event.event_date);

    if (event.recurrence === 'yearly') {
        let next = new Date(today.getFullYear(), eDate.getMonth(), eDate.getDate());
        if (next < today) next.setFullYear(next.getFullYear() + 1);
        return next;
    }
    if (event.recurrence === 'monthly') {
        let next = new Date(today.getFullYear(), today.getMonth(), eDate.getDate());
        if (next < today) next.setMonth(next.getMonth() + 1);
        return next;
    }
    return eDate;
};

const TodayWidget = () => {
    const navigate = useNavigate();
    const [dateItems, setDateItems] = useState([]);
    const [shoppingItems, setShoppingItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            if (!supabase) return;
            const today = new Date().toISOString().split('T')[0];

            const [examsRes, eventsRes, billsRes, paymentsRes, shoppingRes] = await Promise.all([
                supabase.from('career_grades').select('*').gte('eval_date', today).order('eval_date', { ascending: true }).limit(5),
                supabase.from('events').select('*'),
                supabase.from('home_bills').select('*').eq('is_active', true),
                supabase.from('home_bill_payments').select('*').eq('period', currentPeriod()),
                supabase.from('home_shopping_list').select('*').eq('priority', 'alta').eq('is_purchased', false).limit(3),
            ]);

            const exams = (examsRes.data || []).map(exam => {
                const subject = ALL_SUBJECTS.find(s => s.code === exam.subject_code);
                return {
                    id: `exam-${exam.id}`,
                    emoji: '📚',
                    title: subject?.name || exam.subject_code,
                    subtitle: exam.eval_name,
                    daysUntil: differenceInCalendarDays(parseISO(exam.eval_date), new Date()),
                    onClick: () => navigate('/carrera'),
                };
            });

            const events = (eventsRes.data || [])
                .map(e => ({ ...e, nextDate: nextOccurrence(e) }))
                .filter(e => differenceInCalendarDays(e.nextDate, new Date()) >= 0)
                .map(e => ({
                    id: `event-${e.id}`,
                    emoji: EVENT_EMOJIS[e.type] || '📌',
                    title: e.title,
                    subtitle: e.nextDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' }),
                    daysUntil: differenceInCalendarDays(e.nextDate, new Date()),
                    onClick: () => navigate('/calendar'),
                }));

            const payments = paymentsRes.data || [];
            const bills = (billsRes.data || [])
                .filter(b => !payments.some(p => p.bill_id === b.id))
                .map(b => ({
                    id: `bill-${b.id}`,
                    emoji: '💸',
                    title: b.title,
                    subtitle: `Vence el día ${b.due_day}`,
                    daysUntil: differenceInCalendarDays(dueDateThisMonth(b.due_day), new Date()),
                    onClick: () => navigate('/expenses'),
                }));

            const merged = [...exams, ...events, ...bills].sort((a, b) => a.daysUntil - b.daysUntil);
            setDateItems(merged.slice(0, 5));

            setShoppingItems((shoppingRes.data || []).map(s => ({
                id: `shop-${s.id}`,
                emoji: '🛒',
                title: s.title,
                subtitle: 'Compra pendiente · prioridad alta',
                onClick: () => navigate('/our-home/shopping'),
            })));
        } catch (e) {
            console.error('Error fetching today widget:', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading || (dateItems.length === 0 && shoppingItems.length === 0)) return null;

    return (
        <div className="space-y-3">
            <h2 className="px-1 text-sm font-bold text-gray-400 uppercase tracking-widest">Hoy</h2>

            {dateItems.map((item, index) => {
                const urgency = urgencyStyle(item.daysUntil);
                return (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + index * 0.06 }}
                        onClick={item.onClick}
                        className={`bg-gradient-to-r ${urgency.bg} p-4 rounded-2xl flex items-center gap-3 cursor-pointer border hover:shadow-md transition-shadow`}
                    >
                        <div className="text-2xl">{item.emoji}</div>
                        <div className="flex-1 min-w-0">
                            <p className="font-serif font-bold text-gray-800 text-sm truncate">{item.title}</p>
                            <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                        </div>
                        <div className="flex flex-col items-center bg-white/70 backdrop-blur-sm px-3 py-2 rounded-xl min-w-[56px]">
                            <span className={`text-lg font-bold ${urgency.pill}`}>
                                {item.daysUntil === 0 ? 'Hoy' : item.daysUntil < 0 ? `-${Math.abs(item.daysUntil)}` : item.daysUntil}
                            </span>
                            {item.daysUntil !== 0 && (
                                <span className="text-[9px] text-gray-500 uppercase font-bold">
                                    {Math.abs(item.daysUntil) === 1 ? 'día' : 'días'}
                                </span>
                            )}
                        </div>
                    </motion.div>
                );
            })}

            {shoppingItems.map((item, index) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + (dateItems.length + index) * 0.06 }}
                    onClick={item.onClick}
                    className="bg-white/70 p-4 rounded-2xl flex items-center gap-3 cursor-pointer border border-gray-100 hover:shadow-md transition-shadow"
                >
                    <div className="text-2xl">{item.emoji}</div>
                    <div className="flex-1 min-w-0">
                        <p className="font-serif font-bold text-gray-800 text-sm truncate">{item.title}</p>
                        <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default TodayWidget;
