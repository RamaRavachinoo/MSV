import React from 'react';
import { ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const CategoryCard = ({ category, onClick, count = 0 }) => {
    const Icon = LucideIcons[category.icon] || LucideIcons.Heart;

    return (
        <div
            onClick={() => onClick(category.id)}
            className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-white/60 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-98"
        >
            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500`}>
                <Icon size={80} className={category.color} />
            </div>

            <div className="relative z-10 flex items-start justify-between">
                <div className={`p-3 rounded-xl bg-white shadow-sm ${category.color.replace('text-', 'bg-').replace('-500', '-100')}`}>
                    <Icon size={24} className={category.color} />
                </div>
                <div className="bg-white/90 px-2 py-1 rounded-full text-xs font-medium text-gray-500 shadow-sm">
                    {count} items
                </div>
            </div>

            <div className="relative z-10 mt-4">
                <h3 className="text-xl font-bold text-gray-800 font-serif mb-1 group-hover:text-romantic-600 transition-colors">
                    {category.name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                    {category.description}
                </p>
            </div>

            <div className="relative z-10 mt-4 flex items-center text-sm font-medium text-romantic-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                Ver colección <ChevronRight size={16} className="ml-1" />
            </div>
        </div>
    );
};

export default CategoryCard;
