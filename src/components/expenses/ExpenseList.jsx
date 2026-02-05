import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Filter, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CATEGORIES } from './ExpenseForm';

const getCategoryInfo = (categoryName) => {
    return CATEGORIES.find(c => c.name === categoryName) || CATEGORIES[CATEGORIES.length - 1];
};

const ExpenseList = ({ expenses, onDeleteExpense, totalExpenses }) => {
    const [filterCategory, setFilterCategory] = useState('Todos');

    const filteredExpenses = filterCategory === 'Todos'
        ? expenses
        : expenses.filter(e => e.category === filterCategory);

    // Agrupar gastos por fecha
    const groupedExpenses = filteredExpenses.reduce((groups, expense) => {
        const date = expense.date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(expense);
        return groups;
    }, {});

    const sortedDates = Object.keys(groupedExpenses).sort((a, b) => new Date(b) - new Date(a));

    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
            {/* Header con total */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-serif font-bold text-gray-800">Gastos del Mes</h3>
                    <p className="text-2xl font-bold text-romantic-600">
                        €{totalExpenses.toFixed(2)}
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-sm text-gray-500">
                        {expenses.length} {expenses.length === 1 ? 'gasto' : 'gastos'}
                    </span>
                </div>
            </div>

            {/* Filtros de categoría */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                <button
                    onClick={() => setFilterCategory('Todos')}
                    className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                        filterCategory === 'Todos'
                            ? 'bg-romantic-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    <Filter size={14} className="inline mr-1" />
                    Todos
                </button>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.name}
                        onClick={() => setFilterCategory(cat.name)}
                        className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                            filterCategory === cat.name
                                ? 'bg-romantic-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {cat.emoji} {cat.name}
                    </button>
                ))}
            </div>

            {/* Lista de gastos agrupados por fecha */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {sortedDates.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-400">No hay gastos registrados</p>
                        <p className="text-sm text-gray-300 mt-1">
                            Toca el botón + para agregar uno
                        </p>
                    </div>
                ) : (
                    sortedDates.map((date) => (
                        <div key={date}>
                            {/* Fecha header */}
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar size={14} className="text-gray-400" />
                                <span className="text-sm font-medium text-gray-500">
                                    {format(new Date(date), "EEEE, d 'de' MMMM", { locale: es })}
                                </span>
                            </div>

                            {/* Gastos de esa fecha */}
                            <div className="space-y-2">
                                <AnimatePresence>
                                    {groupedExpenses[date].map((expense) => {
                                        const catInfo = getCategoryInfo(expense.category);
                                        return (
                                            <motion.div
                                                key={expense.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
                                            >
                                                {/* Icono categoría */}
                                                <div className={`p-2 rounded-xl ${catInfo.color}`}>
                                                    <span className="text-lg">{catInfo.emoji}</span>
                                                </div>

                                                {/* Info del gasto */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-800 truncate">
                                                        {expense.product}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {expense.category}
                                                        {expense.description && ` • ${expense.description}`}
                                                    </p>
                                                </div>

                                                {/* Precio y eliminar */}
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-romantic-600">
                                                        -€{parseFloat(expense.amount).toFixed(2)}
                                                    </span>
                                                    <button
                                                        onClick={() => onDeleteExpense(expense.id)}
                                                        className="p-1.5 hover:bg-red-100 rounded-full transition-colors"
                                                    >
                                                        <Trash2 className="text-red-400" size={16} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ExpenseList;
