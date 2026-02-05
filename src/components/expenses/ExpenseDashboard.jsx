import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PiggyBank, AlertCircle } from 'lucide-react';
import { CATEGORIES } from './ExpenseForm';

const ExpenseDashboard = ({ expenses, totalIncome, totalExpenses }) => {
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

    // Calcular gastos por categoría
    const expensesByCategory = CATEGORIES.map(cat => {
        const total = expenses
            .filter(e => e.category === cat.name)
            .reduce((sum, e) => sum + parseFloat(e.amount), 0);
        return {
            ...cat,
            total,
            percentage: totalExpenses > 0 ? ((total / totalExpenses) * 100).toFixed(1) : 0
        };
    }).filter(cat => cat.total > 0).sort((a, b) => b.total - a.total);

    // Top gastos del mes
    const topExpenses = [...expenses]
        .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
        .slice(0, 3);

    return (
        <div className="space-y-4">
            {/* Balance Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-5 shadow-sm ${
                    balance >= 0
                        ? 'bg-gradient-to-br from-green-50 to-emerald-100'
                        : 'bg-gradient-to-br from-red-50 to-rose-100'
                }`}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 font-medium">Balance del Mes</p>
                        <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {balance >= 0 ? '+' : ''}€{balance.toFixed(2)}
                        </p>
                    </div>
                    <div className={`p-3 rounded-full ${balance >= 0 ? 'bg-green-200' : 'bg-red-200'}`}>
                        {balance >= 0 ? (
                            <TrendingUp className="text-green-600" size={28} />
                        ) : (
                            <TrendingDown className="text-red-600" size={28} />
                        )}
                    </div>
                </div>

                {/* Barra de progreso Ingresos vs Gastos */}
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Gastado: €{totalExpenses.toFixed(2)}</span>
                        <span>Ingresos: €{totalIncome.toFixed(2)}</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((totalExpenses / totalIncome) * 100, 100)}%` }}
                            transition={{ duration: 0.5 }}
                            className={`h-full rounded-full ${
                                totalExpenses / totalIncome > 0.9
                                    ? 'bg-red-500'
                                    : totalExpenses / totalIncome > 0.7
                                        ? 'bg-yellow-500'
                                        : 'bg-green-500'
                            }`}
                        />
                    </div>
                    {totalExpenses / totalIncome > 0.9 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
                            <AlertCircle size={12} />
                            <span>Has gastado más del 90% de tus ingresos</span>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-4 shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <PiggyBank className="text-romantic-500" size={18} />
                        <span className="text-xs text-gray-500">Tasa de Ahorro</span>
                    </div>
                    <p className={`text-2xl font-bold ${parseFloat(savingsRate) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {savingsRate}%
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-4 shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="text-romantic-500" size={18} />
                        <span className="text-xs text-gray-500">Gasto Promedio</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                        €{expenses.length > 0 ? (totalExpenses / expenses.length).toFixed(2) : '0.00'}
                    </p>
                </motion.div>
            </div>

            {/* Gastos por Categoría */}
            {expensesByCategory.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-4 shadow-sm"
                >
                    <h4 className="font-serif font-bold text-gray-800 mb-3">Por Categoría</h4>
                    <div className="space-y-3">
                        {expensesByCategory.map((cat, index) => (
                            <div key={cat.name}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span>{cat.emoji}</span>
                                        <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-bold text-gray-800">€{cat.total.toFixed(2)}</span>
                                        <span className="text-xs text-gray-400 ml-1">({cat.percentage}%)</span>
                                    </div>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${cat.percentage}%` }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        className={`h-full rounded-full ${cat.color.replace('text-', 'bg-').replace('-100', '-400')}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Top Gastos */}
            {topExpenses.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl p-4 shadow-sm"
                >
                    <h4 className="font-serif font-bold text-gray-800 mb-3">Mayores Gastos</h4>
                    <div className="space-y-2">
                        {topExpenses.map((expense, index) => {
                            const catInfo = CATEGORIES.find(c => c.name === expense.category) || CATEGORIES[CATEGORIES.length - 1];
                            return (
                                <div key={expense.id} className="flex items-center gap-3">
                                    <span className="text-lg font-bold text-gray-300 w-6">
                                        {index + 1}
                                    </span>
                                    <span className="text-lg">{catInfo.emoji}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-800 truncate">{expense.product}</p>
                                    </div>
                                    <span className="font-bold text-romantic-600">
                                        €{parseFloat(expense.amount).toFixed(2)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default ExpenseDashboard;
