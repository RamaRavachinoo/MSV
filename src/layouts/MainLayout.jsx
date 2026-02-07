import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Mail, Home, Gift, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

const MainLayout = () => {
    const location = useLocation();

    // Bottom Navigation Items
    const navItems = [
        { icon: Home, label: 'Inicio', path: '/' },
        { icon: Mail, label: 'Carta', path: '/love-letter' },
        { icon: Gift, label: 'Ruleta', path: '/roulette' },
        { icon: Star, label: 'Fotos', path: '/gallery' },
    ];

    return (
        <div className="min-h-screen relative font-sans pb-24 overflow-hidden">
            {/* Background Decoration */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-200/30 rounded-full blur-[100px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-200/30 rounded-full blur-[100px] pointer-events-none" />

            <main className="relative z-10 container mx-auto px-4 py-8 max-w-md md:max-w-2xl">
                <Outlet />
            </main>

            {/* Premium Floating Navigation */}
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md glass-nav rounded-2xl p-2 z-50">
                <div className="flex justify-around items-center h-14">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="relative flex flex-col items-center justify-center w-full h-full group"
                            >
                                {/* Active Indicator Glow */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-rose-100/50 blur-xl rounded-full" />
                                )}

                                <div className={clsx(
                                    "relative transition-all duration-300 transform",
                                    isActive ? "text-rose-600 scale-110 -translate-y-1" : "text-gray-400 group-hover:text-rose-400"
                                )}>
                                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? "currentColor" : "none"} />
                                </div>

                                {/* Small Dot for Active State */}
                                {isActive && (
                                    <span className="absolute -bottom-1 w-1 h-1 bg-rose-600 rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default MainLayout;
