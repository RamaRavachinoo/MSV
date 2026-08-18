import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, Sparkles, Trash2 } from 'lucide-react';
import TimeTogether from '../components/timer/TimeTogether';
import WeatherWidget from '../components/ui/WeatherWidget';
import TodayWidget from '../components/dashboard/TodayWidget';
import NotificationOptIn from '../components/notifications/NotificationOptIn';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { photoDescriptions } from '../data/photoDescriptions';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [randomPhoto, setRandomPhoto] = useState(null);
    const [anniversaryPicks, setAnniversaryPicks] = useState([]);
    const isAdmin = user?.email === 'ramaravachino00@gmail.com' || user?.user_metadata?.role === 'admin';

    useEffect(() => {
        fetchRandomPhoto();
        if (isAdmin) fetchAnniversaryPicks();
    }, []);

    const fetchAnniversaryPicks = async () => {
        try {
            if (!supabase) return;
            const { data } = await supabase
                .from('anniversary_picks')
                .select('*')
                .order('created_at', { ascending: false });
            if (data) setAnniversaryPicks(data);
        } catch (e) {
            console.error('Error fetching anniversary picks:', e);
        }
    };

    const deleteAnniversaryPick = async (pickId) => {
        try {
            if (!supabase) return;
            await supabase.from('anniversary_picks').delete().eq('id', pickId);
            setAnniversaryPicks(prev => prev.filter(p => p.id !== pickId));
        } catch (e) {
            console.error('Error deleting pick:', e);
        }
    };

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
                    Hola, Marti ❤️
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

            {/* Weather Widget */}
            <WeatherWidget />

            {/* Push notification opt-in */}
            <NotificationOptIn />

            {/* Today: exams, bills and events that need attention */}
            <TodayWidget />

            {/* Admin: Anniversary Picks Widget */}
            {isAdmin && anniversaryPicks.length > 0 && (() => {
                // Group picks into pairs (restaurant + bar close in time)
                const restaurants = anniversaryPicks.filter(p => p.category === 'restaurant');
                const bars = anniversaryPicks.filter(p => p.category === 'bar');
                const pairs = [];
                const maxPairs = Math.max(restaurants.length, bars.length);
                for (let i = 0; i < maxPairs; i++) {
                    pairs.push({
                        restaurant: restaurants[i] || null,
                        bar: bars[i] || null,
                    });
                }

                return (
                    <div className="space-y-3">
                        <h2 className="px-1 text-sm font-bold text-amber-600 uppercase tracking-widest">🎯 Martina eligió</h2>
                        {pairs.map((pair, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-4 rounded-2xl border"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(247,231,206,0.05))',
                                    borderColor: 'rgba(212,175,55,0.3)',
                                }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
                                        Opción {pairs.length - idx}
                                    </p>
                                    <button
                                        onClick={() => {
                                            if (pair.restaurant) deleteAnniversaryPick(pair.restaurant.id);
                                            if (pair.bar) deleteAnniversaryPick(pair.bar.id);
                                        }}
                                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
                                        title="Borrar esta opción"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {pair.restaurant && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">🍽️</span>
                                            <div className="flex-1">
                                                <p className="font-serif font-bold text-gray-800 text-sm">{pair.restaurant.winner_name}</p>
                                                <p className="text-[10px] text-gray-400 uppercase">Restaurante</p>
                                            </div>
                                            {pair.restaurant.winner_instagram && (
                                                <a href={pair.restaurant.winner_instagram} target="_blank" rel="noopener noreferrer" className="text-[10px] text-pink-400 hover:underline">IG</a>
                                            )}
                                        </div>
                                    )}
                                    {pair.bar && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">🍸</span>
                                            <div className="flex-1">
                                                <p className="font-serif font-bold text-gray-800 text-sm">{pair.bar.winner_name}</p>
                                                <p className="text-[10px] text-gray-400 uppercase">Bar</p>
                                            </div>
                                            {pair.bar.winner_instagram && (
                                                <a href={pair.bar.winner_instagram} target="_blank" rel="noopener noreferrer" className="text-[10px] text-pink-400 hover:underline">IG</a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                );
            })()}

            {/* Quick Access Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Special Date Night Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 100 }}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/date-night')}
                    className="col-span-2 p-5 rounded-3xl cursor-pointer relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(247,231,206,0.08))',
                        border: '1px solid rgba(212,175,55,0.3)',
                    }}
                >
                    {/* Shimmer */}
                    <motion.div
                        className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)' }}
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                    />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="text-3xl">🥂</div>
                        <div className="flex-1">
                            <h3 className="font-serif font-bold text-lg" style={{ color: '#D4AF37' }}>Nuestro Aniversario</h3>
                            <p className="text-xs mt-0.5" style={{ color: '#a89870' }}>1 año juntos — Elegí dónde festejamos 💕</p>
                        </div>
                        <Sparkles size={20} style={{ color: '#D4AF37' }} />
                    </div>
                </motion.div>
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
                <QuickCard
                    emoji="📚"
                    title="Carrera"
                    subtitle="Abogacía UBA"
                    delay={0.75}
                    color="bg-indigo-100/40"
                    borderColor="border-indigo-200/50"
                    onClick={() => navigate('/carrera')}
                />
                <QuickCard
                    emoji="🏠"
                    title="Nuestro Hogar"
                    subtitle="Nuestro futuro"
                    delay={0.8}
                    color="bg-teal-100/40"
                    borderColor="border-teal-200/50"
                    onClick={() => navigate('/our-home')}
                />
            </div>

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
