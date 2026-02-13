import React from 'react';
import { TrendingUp, Calendar, Star } from 'lucide-react';

const StatsWidget = ({ totalItems, recentActivity, topRated }) => {
    return (
        <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-white/50 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="bg-blue-100 p-2 rounded-full mb-1">
                    <TrendingUp size={16} className="text-blue-500" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{totalItems}</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Recuerdos</span>
            </div>

            <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-white/50 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="bg-green-100 p-2 rounded-full mb-1">
                    <Calendar size={16} className="text-green-500" />
                </div>
                <span className="text-xl font-bold text-gray-800">{recentActivity}</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Este Mes</span>
            </div>

            <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-white/50 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="bg-yellow-100 p-2 rounded-full mb-1">
                    <Star size={16} className="text-yellow-500" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{topRated}</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Favoritos</span>
            </div>
        </div>
    );
};

export default StatsWidget;
