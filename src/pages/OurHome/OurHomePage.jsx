import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Building2, Palette, PiggyBank, ClipboardCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const SECTIONS = [
    {
        id: 'shopping',
        title: 'Lista de Compras',
        subtitle: 'Lo que necesitamos',
        emoji: '🛒',
        icon: ShoppingCart,
        path: '/our-home/shopping',
        gradient: 'from-amber-400 to-orange-500',
        bg: 'bg-amber-50',
        table: 'home_shopping_list',
        countLabel: (n) => `${n} items`,
    },
    {
        id: 'apartments',
        title: 'Deptos Visitados',
        subtitle: 'Nuestras notas',
        emoji: '🏢',
        icon: Building2,
        path: '/our-home/apartments',
        gradient: 'from-blue-400 to-indigo-500',
        bg: 'bg-blue-50',
        table: 'home_apartments',
        countLabel: (n) => `${n} visitados`,
    },
    {
        id: 'inspiration',
        title: 'Inspiración',
        subtitle: 'Ideas de decoración',
        emoji: '🎨',
        icon: Palette,
        path: '/our-home/inspiration',
        gradient: 'from-pink-400 to-fuchsia-500',
        bg: 'bg-pink-50',
        table: 'home_inspiration',
        countLabel: (n) => `${n} ideas`,
    },
    {
        id: 'budget',
        title: 'Presupuesto',
        subtitle: 'Control de gastos',
        emoji: '💰',
        icon: PiggyBank,
        path: '/our-home/budget',
        gradient: 'from-emerald-400 to-teal-500',
        bg: 'bg-emerald-50',
        table: 'home_moving_budget',
        countLabel: (n) => `${n} items`,
    },
    {
        id: 'checklist',
        title: 'Checklist Mudanza',
        subtitle: 'Tareas pendientes',
        emoji: '📋',
        icon: ClipboardCheck,
        path: '/our-home/checklist',
        gradient: 'from-violet-400 to-purple-500',
        bg: 'bg-violet-50',
        table: 'home_moving_checklist',
        countLabel: (n) => `${n} tareas`,
    },
];

const OurHomePage = () => {
    const navigate = useNavigate();
    const [counts, setCounts] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCounts();
    }, []);

    const fetchCounts = async () => {
        try {
            const results = {};
            for (const section of SECTIONS) {
                const { count, error } = await supabase
                    .from(section.table)
                    .select('*', { count: 'exact', head: true });
                if (!error) results[section.id] = count || 0;
            }
            setCounts(results);
        } catch (e) {
            console.error('Error fetching counts:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-4xl mx-auto pb-24">
            {/* Header */}
            <div className="flex items-center mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="mr-3 p-2 rounded-full hover:bg-white/50 text-gray-600 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900 leading-tight">
                        Nuestro Hogar 🏠
                    </h1>
                    <p className="text-gray-500 text-sm">Construyendo nuestro futuro juntos</p>
                </div>
            </div>

            {/* Section Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SECTIONS.map((section, index) => {
                    const Icon = section.icon;
                    const count = counts[section.id] || 0;

                    return (
                        <motion.div
                            key={section.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08, type: 'spring', stiffness: 100 }}
                            whileHover={{ y: -4, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(section.path)}
                            className={`glass-card rounded-3xl p-5 cursor-pointer transition-shadow hover:shadow-xl overflow-hidden relative`}
                        >
                            {/* Gradient accent */}
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${section.gradient}`} />

                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-2xl ${section.bg}`}>
                                    <span className="text-2xl">{section.emoji}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-serif font-bold text-gray-800 text-lg leading-tight">
                                        {section.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">{section.subtitle}</p>
                                    {!loading && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-xs font-semibold text-gray-400 mt-2"
                                        >
                                            {section.countLabel(count)}
                                        </motion.p>
                                    )}
                                </div>
                                <Icon size={20} className="text-gray-300 mt-1" />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default OurHomePage;
