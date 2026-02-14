import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const CHART_COLORS = ['#f43f5e', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'];

const ExpensesView = ({ transactions, income, expense, onEdit, onDelete }) => {
    const balance = income - expense;

    const categoryData = useMemo(() => {
        const grouped = {};
        transactions.filter(t => t.type === 'expense').forEach(tx => {
            const cat = tx.category || 'Otros';
            grouped[cat] = (grouped[cat] || 0) + Number(tx.amount);
        });
        return Object.entries(grouped).map(([name, value]) => ({ name, value }));
    }, [transactions]);

    const monthlyData = useMemo(() => {
        const months = {};
        // Sort transactions chronologically for the chart
        const sortedTxs = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedTxs.forEach(tx => {
            const monthKey = format(new Date(tx.date), 'MMM', { locale: es });
            if (!months[monthKey]) months[monthKey] = { month: monthKey, ingresos: 0, gastos: 0 };
            if (tx.type === 'income') months[monthKey].ingresos += Number(tx.amount);
            else months[monthKey].gastos += Number(tx.amount);
        });
        return Object.values(months);
    }, [transactions]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
        >
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-green-100">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1 bg-green-100 rounded-full"><TrendingUp size={14} className="text-green-600" /></div>
                        <span className="text-xs text-gray-500 font-medium">Ingresos</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800">${income.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-red-100">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1 bg-red-100 rounded-full"><TrendingDown size={14} className="text-red-600" /></div>
                        <span className="text-xs text-gray-500 font-medium">Gastos</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800">${expense.toLocaleString()}</p>
                </div>
            </div>

            {/* Total Balance */}
            <div className="bg-gradient-to-r from-romantic-500 to-romantic-600 p-6 rounded-3xl text-white shadow-lg shadow-romantic-200">
                <span className="text-romantic-100 text-sm font-medium">Balance Disponible</span>
                <div className="text-4xl font-bold mt-1 mb-4">${balance.toLocaleString()}</div>
                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-white/90 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((expense / (income || 1)) * 100, 100)}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs mt-2 text-romantic-100">
                    <span>Gastado: {Math.round((expense / (income || 1)) * 100)}%</span>
                    <span>Meta: Ahorrar 20%</span>
                </div>
            </div>

            {/* Pie Chart - Expense Categories */}
            {categoryData.length > 0 && (
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-800 font-serif font-medium mb-4">Distribución de Gastos</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={2}
                            >
                                {categoryData.map((_, index) => (
                                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => `$${Number(value).toLocaleString()}`}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-2 mt-3 justify-center">
                        {categoryData.map((cat, i) => (
                            <div key={cat.name} className="flex items-center gap-1.5 text-xs">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                                <span className="text-gray-600">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bar Chart - Income vs Expenses by Month */}
            {monthlyData.length > 0 && (
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-800 font-serif font-medium mb-4">Ingresos vs Gastos</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} width={45} axisLine={false} tickLine={false} />
                            <Tooltip
                                formatter={(value) => `$${Number(value).toLocaleString()}`}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} name="Ingresos" />
                            <Bar dataKey="gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Gastos" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Transactions List */}
            <div>
                <h3 className="text-gray-800 font-serif font-medium mb-3 px-2">Movimientos Recientes</h3>
                <div className="space-y-3 pb-20">
                    {transactions.length > 0 ? (
                        transactions.map((tx) => (
                            <motion.div
                                layout
                                key={tx.id}
                                className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center group border border-gray-50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-full ${tx.type === 'income' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                        {tx.type === 'income' ? <DollarSign size={20} /> : <TrendingDown size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 text-sm">{tx.category || tx.description}</p>
                                        <p className="text-xs text-gray-400">{format(new Date(tx.date), "d MMM", { locale: es })} • {tx.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`font-bold text-sm ${tx.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>
                                        {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toLocaleString()}
                                    </span>
                                    <div className="flex gap-1 ml-2">
                                        <button onClick={() => onEdit(tx)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                                        </button>
                                        <button onClick={() => onDelete(tx.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <p className="text-center text-gray-400 py-10 text-sm bg-white rounded-2xl border border-dashed border-gray-200">
                            Aún no hay movimientos este mes.
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ExpensesView;
