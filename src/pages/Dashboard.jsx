import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TimeTogether from '../components/timer/TimeTogether';

const Dashboard = () => {
    const navigate = useNavigate();

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

            {/* Quick Access Grid */}
            <div className="grid grid-cols-2 gap-4">
                <QuickCard
                    emoji="🎁"
                    title="Tu Regalo"
                    subtitle="Un detalle especial"
                    delay={0.3}
                    color="bg-rose-100/40"
                    borderColor="border-rose-200/50"
                    onClick={() => navigate('/roulette')}
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
                    subtitle="Calendario Juntos"
                    delay={0.5}
                    color="bg-pink-100/40"
                    borderColor="border-pink-200/50"
                    onClick={() => navigate('/calendar')}
                />
                <QuickCard
                    emoji="💌"
                    title="Razones"
                    subtitle="Por qué te amo"
                    delay={0.5}
                    color="bg-purple-100/40"
                    borderColor="border-purple-200/50"
                    onClick={() => navigate('/reasons')}
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
