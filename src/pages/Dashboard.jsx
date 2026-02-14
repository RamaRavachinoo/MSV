import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, Calendar, Clock } from 'lucide-react';
import TimeTogether from '../components/timer/TimeTogether';
import { supabase } from '../lib/supabase';
import { photoDescriptions } from '../data/photoDescriptions';
import { differenceInDays, parseISO } from 'date-fns';

const EVENT_ICONS = {
    date: '❤️',
    anniversary: '📅',
    trip: '✈️',
    birthday: '🎂',
    other: '📌'
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [randomPhoto, setRandomPhoto] = useState(null);
    const [nextEvents, setNextEvents] = useState([]);

    useEffect(() => {
        fetchRandomPhoto();
        fetchNextEvent();
    }, []);

    const fetchRandomPhoto = async () => {
        try {
            if (!supabase) return;
            const { data } = await supabase.storage.from('photos')
                .list('', { sortBy: { column: 'created_at', order: 'desc' } });

            if (data && data.length > 0) {
                const validPhotos = data.filter(f => f.name !== '.emptyFolderPlaceholder');
                if (validPhotos.length === 0) return;
                const randomFile = validPhotos[Math.floor(Math.random() * validPhotos.length)];
                const { data: urlData } = supabase.storage.from('photos').getPublicUrl(randomFile.name);
                setRandomPhoto({
                    url: urlData.publicUrl,
                    description: photoDescriptions[randomFile.name] || 'Uno de nuestros recuerdos'
                });
            }
        } catch (e) {
            console.error('Error fetching random photo:', e);
        }
    };

    const fetchNextEvent = async () => {
        try {
            if (!supabase) return;
            const { data } = await supabase.from('events').select('*');
            if (!data || data.length === 0) return;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const upcoming = data.map(e => {
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

            if (upcoming.length > 0) {
                // Take top 3 events
                setNextEvents(upcoming.slice(0, 3));
            }
        } catch (e) {
            console.error('Error fetching next event:', e);
        }
    };

    return (
        <div className="space-y-8 pt-4">
            {/* Hero Section */}
            <header className="relative text-center z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="inline-block mb-3 px-4 py-1.5 rounded-full bg-white/30 backdrop-blur-sm border border-white/50 text-xs font-medium uppercase tracking-widest text-rose-800"
                >
                    Nuestra Historia
                </motion.div>
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-4xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 font-bold drop-shadow-sm"
                >
                    Hola, Martina ❤️
                </motion.h1>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-600 mt-3 font-light text-lg"
                >
                    Bienvenida a tu regalo eterno.
                </motion.p>
            </header>

            {/* Timer Widget Hero */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <TimeTogether />
            </motion.div>

            {/* Random Photo of the Day */}
            {randomPhoto && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card rounded-3xl overflow-hidden cursor-pointer"
                    onClick={() => navigate('/gallery')}
                >
                    <img
                        src={randomPhoto.url}
                        alt="Recuerdo"
                        className="w-full h-auto"
                    />
                    <div className="p-4">
                        <p className="text-xs text-romantic-400 uppercase tracking-widest font-bold mb-1">Recuerdo del Día</p>
                        <p className="font-serif text-gray-800 text-sm leading-relaxed">{randomPhoto.description}</p>
                    </div>
                </motion.div>
            )}

            {/* Next Upcoming Events */}
            {nextEvents.length > 0 && (
                <div className="space-y-3">
                    <h2 className="px-1 text-sm font-bold text-gray-400 uppercase tracking-widest">Próximos Eventos</h2>
                    {nextEvents.map((event, index) => {
                        const days = differenceInDays(event.nextDate, new Date());
                        return (
                            <motion.div
                                key={event.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 + (index * 0.1) }}
                                className="bg-gradient-to-r from-romantic-100 to-purple-100 p-4 rounded-2xl flex items-center gap-4 cursor-pointer border border-romantic-200/50 hover:shadow-md transition-shadow"
                                onClick={() => navigate('/calendar')}
                            >
                                <div className="text-3xl">{EVENT_ICONS[event.type] || '📌'}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-serif font-bold text-gray-800 truncate">{event.title}</p>
                                    <p className="text-xs text-romantic-500 font-medium">
                                        {event.nextDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
                                    </p>
                                </div>
                                <div className="flex flex-col items-center bg-white/60 backdrop-blur-sm px-3 py-2 rounded-xl min-w-[70px]">
                                    <span className="text-xl font-bold text-romantic-600">
                                        {days === 0 ? 'Hoy' : days}
                                    </span>
                                    {days !== 0 && (
                                        <span className="text-[10px] text-gray-500 uppercase font-bold">{days === 1 ? 'día' : 'días'}</span>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Quick Access Grid */}
            <div className="grid grid-cols-2 gap-4">
                <QuickCard
                    emoji="📂"
                    title="Mi Espacio"
                    subtitle="Notas y archivos"
                    delay={0.3}
                    color="bg-amber-100/40"
                    borderColor="border-amber-200/50"
                    onClick={() => navigate('/resources')}
                />
                <QuickCard
                    emoji="📸"
                    title="Recuerdos"
                    subtitle="Nuestros momentos"
                    delay={0.4}
                    color="bg-blue-100/40"
                    borderColor="border-blue-200/50"
                    onClick={() => navigate('/gallery')}
                />
                <QuickCard
                    emoji="📖"
                    title="Historia"
                    subtitle="Nuestra vida juntos"
                    delay={0.45}
                    color="bg-orange-100/40"
                    borderColor="border-orange-200/50"
                    onClick={() => navigate('/memories')}
                />
                <QuickCard
                    emoji="📅"
                    title="Fechas"
                    subtitle="Calendario"
                    delay={0.5}
                    color="bg-pink-100/40"
                    borderColor="border-pink-200/50"
                    onClick={() => navigate('/calendar')}
                />
                <QuickCard
                    emoji="💌"
                    title="Mi Carta"
                    subtitle="Algo especial para vos"
                    delay={0.5}
                    color="bg-purple-100/40"
                    borderColor="border-purple-200/50"
                    onClick={() => navigate('/love-letter')}
                />
                <QuickCard
                    emoji="🌸"
                    title="Flores"
                    subtitle="Un ramo para vos"
                    delay={0.55}
                    color="bg-fuchsia-100/40"
                    borderColor="border-fuchsia-200/50"
                    onClick={() => navigate('/flowers')}
                />
                <QuickCard
                    emoji="🌎"
                    title="Planes"
                    subtitle="Para hacer juntos"
                    delay={0.6}
                    color="bg-emerald-100/40"
                    borderColor="border-emerald-200/50"
                    onClick={() => navigate('/bucket-list')}
                />
                <QuickCard
                    emoji="💸"
                    title="Gastos"
                    subtitle="Control & Metas"
                    delay={0.7}
                    color="bg-blue-100/40"
                    borderColor="border-blue-200/50"
                    onClick={() => navigate('/expenses')}
                />
            </div>
        </div>
    );
};

const QuickCard = ({ emoji, title, subtitle, delay, color, borderColor, fullWidth, onClick }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, type: "spring", stiffness: 100 }}
        whileHover={{ y: -5, shadow: "0 10px 30px -10px rgba(255,100,100,0.3)" }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`glass-card p-5 rounded-3xl flex flex-col items-start justify-center cursor-pointer transition-all ${fullWidth ? 'col-span-2 flex-row items-center gap-4' : 'aspect-[4/3]'} ${color} ${borderColor}`}
    >
        <div className="text-3xl mb-2 filter drop-shadow-md">{emoji}</div>
        <div>
            <h3 className="font-serif font-bold text-gray-800 text-lg leading-tight">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 mt-1 font-medium">{subtitle}</p>}
        </div>
    </motion.div>
);

export default Dashboard;
