import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Heart, Home, Gift, Star, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

const MainLayout = () => {
    const location = useLocation();

    // Bottom Navigation Items
    const navItems = [
        { icon: Home, label: 'Inicio', path: '/' },
        { icon: Heart, label: 'Razones', path: '/reasons' },
        { icon: Gift, label: 'Ruleta', path: '/roulette' },
        { icon: Star, label: 'Fotos', path: '/gallery' },
        { icon: Wallet, label: 'Gastos', path: '/expenses' },
    ];

    return (
        <div className="min-h-screen bg-romantic-50 font-sans pb-20">
            {/* Header / Top Bar could go here */}

            <main className="container mx-auto px-4 py-6 max-w-md md:max-w-2xl">
                <Outlet />
            </main>

            {/* Bottom Navigation for Mobile */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-romantic-200 safe-bottom">
                <div className="flex justify-around items-center h-16 max-w-md md:max-w-2xl mx-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex flex-col items-center justify-center w-full h-full transition-colors duration-200",
                                    isActive ? "text-romantic-600" : "text-gray-400 hover:text-romantic-400"
                                )}
                            >
                                <Icon size={24} fill={isActive ? "currentColor" : "none"} />
                                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default MainLayout;
