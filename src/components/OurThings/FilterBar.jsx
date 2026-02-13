import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

const FilterBar = ({ onSearch, onSort, onFilter }) => {
    return (
        <div className="flex flex-col gap-3 mb-6">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Buscar..."
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-romantic-400 focus:ring-1 focus:ring-romantic-400 transition-all shadow-sm"
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button
                    onClick={() => onSort('date')}
                    className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 active:bg-gray-50 whitespace-nowrap"
                >
                    <ArrowUpDown size={14} className="mr-2" />
                    Más recientes
                </button>

                <button
                    onClick={() => onSort('rating')}
                    className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 active:bg-gray-50 whitespace-nowrap"
                >
                    <Filter size={14} className="mr-2" />
                    Mejores
                </button>

                <select
                    onChange={(e) => onFilter(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 focus:outline-none focus:border-romantic-400"
                >
                    <option value="all">Todos</option>
                    <option value="completed">Completados</option>
                    <option value="pending">Pendientes</option>
                    <option value="favorites">Favoritos</option>
                </select>
            </div>
        </div>
    );
};

export default FilterBar;
