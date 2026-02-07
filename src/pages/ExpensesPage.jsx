import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, TrendingUp, TrendingDown, DollarSign, PiggyBank, Target, Calendar, X, Save } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const MOCK_TRANSACTIONS = [
    { id: 1, type: 'expense', amount: 15000, category: 'Cena Romántica 🍕', date: new Date().toISOString() },
    { id: 2, type: 'income', amount: 500000, category: 'Sueldo Rama 💼', date: new Date().toISOString() },
    { id: 3, type: 'expense', amount: 2500, category: 'Uber a casa 🚗', date: new Date().toISOString() },
];

const ExpensesPage = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'goals'
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Summary State
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [userName, setUserName] = useState(''); // User Name State

    // Modal State
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [editingTx, setEditingTx] = useState(null); // State for editing
    const [newTx, setNewTx] = useState({
        type: 'expense',
        amount: '',
        description: '',
        category: '',
        date: format(new Date(), 'yyyy-MM-dd')
    });

    const PRESET_CATEGORIES = {
        expense: [
            { id: 'comida', label: 'Cena Rica 🍕', formal: 'Comida' },
            { id: 'transporte', label: 'Uber/Bondi 🚌', formal: 'Transporte' },
            { id: 'super', label: 'Supermercado 🛒', formal: 'Supermercado' },
            { id: 'servicios', label: 'Servicios 💡', formal: 'Servicios' },
            { id: 'regalos', label: 'Regalitos 🎁', formal: 'Regalos' },
            { id: 'otros', label: 'Otros 🤷‍♂️', formal: 'Otros' }
        ],
        income: [
            { id: 'sueldo', label: 'Sueldo 💼', formal: 'Sueldo' },
            { id: 'regalo', label: 'Regalo 🎁', formal: 'Regalo' },
            { id: 'extra', label: 'Platita Extra 🤑', formal: 'Extra' }
        ]
    };

    useEffect(() => {
        fetchTransactions();
        fetchUserName();
    }, []);

    const fetchUserName = async () => {
        try {
            if (!user) return;
            const { data, error } = await supabase
                .from('profiles')
                .select('username') // assuming username field exists based on previous code
                .eq('id', user.id)
                .single();

            if (data) {
                setUserName(data.username);
            }
        } catch (e) {
            console.error('Error fetching name', e);
        }
    };

    const fetchTransactions = async () => {
        try {
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;

            const txs = data || []; // fallback if empty
            setTransactions(txs);
            calculateSummary(txs);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            // Fallback for demo if DB empty or error
            // setTransactions(MOCK_TRANSACTIONS); 
        } finally {
            setLoading(false);
        }
    };

    const calculateSummary = (txs) => {
        const income = txs.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
        const expense = txs.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
        setTotalIncome(income);
        setTotalExpense(expense);
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        if (!newTx.amount || !newTx.description) return;

        try {
            if (editingTx) {
                // Update existing
                const { error } = await supabase.from('expenses')
                    .update({
                        type: newTx.type,
                        amount: newTx.amount,
                        description: newTx.description,
                        category: newTx.category || (newTx.type === 'income' ? 'Ingreso' : 'Gasto'),
                        date: new Date(newTx.date).toISOString()
                    })
                    .eq('id', editingTx.id);
                if (error) throw error;
            } else {
                // Insert new
                const { error } = await supabase.from('expenses').insert([{
                    type: newTx.type,
                    amount: newTx.amount,
                    description: newTx.description,
                    category: newTx.category || (newTx.type === 'income' ? 'Ingreso' : 'Gasto'),
                    date: new Date(newTx.date).toISOString(),
                    user_id: user?.id
                }]);
                if (error) throw error;
            }

            // Refresh list
            fetchTransactions();
            closeModal();
        } catch (error) {
            console.error('Error adding/updating transaction:', error);
            alert('Error al guardar. Intenta de nuevo.');
        }
    };

    const handleDeleteTransaction = async (id) => {
        if (!window.confirm("¿Seguro que quieres borrar este movimiento?")) return;
        try {
            const { error } = await supabase.from('expenses').delete().eq('id', id);
            if (error) throw error;
            fetchTransactions();
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const openEditModal = (tx) => {
        setEditingTx(tx);
        setNewTx({
            type: tx.type,
            amount: tx.amount,
            description: tx.description,
            category: tx.category,
            date: format(new Date(tx.date), 'yyyy-MM-dd')
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTx(null);
        setNewTx({ type: 'expense', amount: '', description: '', category: '', date: format(new Date(), 'yyyy-MM-dd') });
    };

    return (
        <div className="min-h-screen pb-24 px-4 bg-gray-50">
            {/* Header */}
            <header className="pt-8 pb-6 bg-white px-4 -mx-4 mb-4 shadow-sm border-b border-gray-100 sticky top-0 z-30">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xs text-romantic-500 font-bold uppercase tracking-wider mb-1">
                            {userName ? `Hola, ${userName} 👋` : 'Bienvenido'}
                        </p>
                        <h1 className="text-2xl font-serif text-gray-900">Tus Finanzas 💸</h1>
                    </div>
                    {/* User Avatar Placeholder & Logout */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={logout}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        >
                            Cerrar Sesión
                        </button>
                        <div className="w-10 h-10 rounded-full bg-romantic-100 flex items-center justify-center text-romantic-600 font-bold border-2 border-white shadow-sm">
                            {userName ? userName.charAt(0).toUpperCase() : 'U'}
                        </div>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex p-1 bg-white rounded-xl shadow-sm mb-6">
                <button
                    onClick={() => setActiveTab('expenses')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'expenses' ? 'bg-romantic-100 text-romantic-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    Gastos del Mes
                </button>
                <button
                    onClick={() => setActiveTab('goals')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'goals' ? 'bg-romantic-100 text-romantic-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    Metas de Ahorro
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'expenses' ? (
                    <ExpensesView
                        key="expenses"
                        transactions={transactions}
                        income={totalIncome}
                        expense={totalExpense}
                        onEdit={openEditModal}
                        onDelete={handleDeleteTransaction}
                    />
                ) : (
                    <GoalsView key="goals" />
                )}
            </AnimatePresence>

            {/* Quick Add Button (Floating) */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                    setEditingTx(null);
                    setNewTx({
                        type: 'expense',
                        amount: '',
                        description: '',
                        category: '',
                        date: format(new Date(), 'yyyy-MM-dd')
                    });
                    setIsModalOpen(true);
                }}
                className="fixed bottom-24 right-6 bg-romantic-500 text-white p-4 rounded-full shadow-lg shadow-romantic-300/50 z-40"
            >
                <Plus size={28} />
            </motion.button>

            {/* Add Transaction Modal */}
            {isModalOpen && createPortal(
                <AnimatePresence>
                    <>
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            key="modal"
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-[70] shadow-2xl pb-10"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">{editingTx ? 'Editar Movimiento' : 'Nuevo Movimiento'}</h2>
                                <button onClick={closeModal} className="p-2 bg-gray-100 rounded-full text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddTransaction} className="space-y-5">
                                {/* Type Toggle */}
                                <div className="flex p-1 bg-gray-100 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setNewTx({ ...newTx, type: 'expense' })}
                                        className={`flex-1 py-3 rounded-lg font-medium transition-all ${newTx.type === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400'
                                            }`}
                                    >
                                        Gasto 💸
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewTx({ ...newTx, type: 'income' })}
                                        className={`flex-1 py-3 rounded-lg font-medium transition-all ${newTx.type === 'income' ? 'bg-white text-green-500 shadow-sm' : 'text-gray-400'
                                            }`}
                                    >
                                        Ingreso 💰
                                    </button>
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="text-xs text-gray-400 pl-1 block mb-1">Monto</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
                                        <input
                                            type="number"
                                            value={newTx.amount}
                                            onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                                            className="w-full pl-10 pr-4 py-4 bg-gray-50 rounded-2xl text-2xl font-bold text-gray-800 outline-none focus:ring-2 focus:ring-romantic-300"
                                            placeholder="0"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="text-xs text-gray-400 pl-1 block mb-1">Descripción</label>
                                    <input
                                        type="text"
                                        value={newTx.description}
                                        onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300"
                                        placeholder={newTx.type === 'expense' ? 'Ej: Cine y pochoclos' : 'Ej: Aguinaldo'}
                                    />
                                </div>

                                {/* Category Tags */}
                                <div>
                                    <label className="text-xs text-gray-400 pl-1 block mb-2">Categoría</label>
                                    <div className="flex flex-wrap gap-2">
                                        {PRESET_CATEGORIES[newTx.type].map((cat) => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setNewTx({ ...newTx, category: cat.label })}
                                                className={`px-3 py-2 rounded-lg text-sm transition-all border ${newTx.category === cat.label
                                                    ? 'bg-romantic-100 border-romantic-300 text-romantic-700'
                                                    : 'bg-white border-gray-200 text-gray-500'
                                                    }`}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="text-xs text-gray-400 pl-1 block mb-1">Fecha</label>
                                    <input
                                        type="date"
                                        value={newTx.date}
                                        onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-lg shadow-gray-200 active:scale-95 transition-transform"
                                >
                                    Guardar
                                </button>
                            </form>
                        </motion.div>
                    </>
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

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
        transactions.forEach(tx => {
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
                        className="h-full bg-white/90 rounded-full"
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
                <div className="bg-white p-5 rounded-3xl shadow-sm">
                    <h3 className="text-gray-800 font-serif font-medium mb-4">Distribución de Gastos</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={80}
                                paddingAngle={2}
                            >
                                {categoryData.map((_, index) => (
                                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
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
                <div className="bg-white p-5 rounded-3xl shadow-sm">
                    <h3 className="text-gray-800 font-serif font-medium mb-4">Ingresos vs Gastos</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 10 }} width={50} />
                            <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                            <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} name="Ingresos" />
                            <Bar dataKey="gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Gastos" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Transactions List */}
            <div>
                <h3 className="text-gray-800 font-serif font-medium mb-3">Movimientos Recientes</h3>
                <div className="space-y-3">
                    {transactions.length > 0 ? (
                        transactions.map((tx) => (
                            <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${tx.type === 'income' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                        {tx.type === 'income' ? <DollarSign size={20} /> : <TrendingDown size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{tx.category || tx.description}</p>
                                        <p className="text-xs text-gray-400">{format(new Date(tx.date), "d MMM", { locale: es })} • {tx.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>
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
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-400 py-4 text-sm">Aún no hay movimientos este mes.</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const GoalsView = () => {
    const { user } = useAuth();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    // Contribution State
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [isContribModalOpen, setIsContribModalOpen] = useState(false);

    // New Goal State
    const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);
    const [newGoal, setNewGoal] = useState({
        title: '',
        description: '', // Added description
        target_amount: '',
        emoji: '🎯',
        is_shared: true
    });

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setGoals(data || []);
        } catch (error) {
            console.error('Error fetching goals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGoal = async (e) => {
        e.preventDefault();
        if (!newGoal.title || !newGoal.target_amount) return;

        try {
            const { error } = await supabase.from('goals').insert([{
                title: newGoal.title,
                description: newGoal.description, // Insert description
                target_amount: newGoal.target_amount,
                emoji: newGoal.emoji,
                is_shared: newGoal.is_shared,
                current_amount: 0,
                created_by: user?.id
            }]);

            if (error) throw error;

            fetchGoals();
            setIsCreateGoalOpen(false);
            setNewGoal({ title: '', description: '', target_amount: '', emoji: '🎯', is_shared: true }); // Reset description
        } catch (error) {
            console.error('Error creating goal:', error);
            alert('Error al crear meta');
        }
    };

    const handleDeleteGoal = async (id) => {
        if (!window.confirm("¿Borrar esta meta? Esta acción no se puede deshacer.")) return;
        try {
            // Delete contributions first (cascade usually handles this but safety first)
            await supabase.from('contributions').delete().eq('goal_id', id);

            const { error } = await supabase.from('goals').delete().eq('id', id);
            if (error) throw error;
            fetchGoals();
        } catch (e) {
            console.error(e);
            alert("Error al borrar meta");
        }
    };

    const openContribModal = (goal) => {
        setSelectedGoal(goal);
        setIsContribModalOpen(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 pb-24"
        >
            {/* Header / Create Button */}
            <div className="flex justify-between items-center px-2">
                <h2 className="text-xl font-serif text-gray-800">Nuestras Metas</h2>
                <button
                    onClick={() => setIsCreateGoalOpen(true)}
                    className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-800 transition-colors"
                >
                    + Nueva Meta
                </button>
            </div>

            <div className="space-y-6">
                {loading ? (
                    <p className="text-center text-gray-400 py-10">Cargando...</p>
                ) : goals.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-400 mb-4">No hay metas activas.</p>
                        <button onClick={() => setIsCreateGoalOpen(true)} className="text-romantic-500 font-medium">¡Crea la primera!</button>
                    </div>
                ) : (
                    goals.map((g) => (
                        <GoalCard
                            key={g.id}
                            goal={g}
                            currentUserId={user?.id}
                            onContribute={() => openContribModal(g)}
                            onDelete={() => handleDeleteGoal(g.id)}
                        />
                    ))
                )}
            </div>

            {/* Create Goal Modal */}
            {isCreateGoalOpen && createPortal(
                <AnimatePresence>
                    <>
                        <motion.div
                            key="backdrop-create"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                            onClick={() => setIsCreateGoalOpen(false)}
                        />
                        <motion.div
                            key="modal-create"
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-[70] shadow-2xl pb-10"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Nueva Meta</h2>
                                <button onClick={() => setIsCreateGoalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateGoal} className="space-y-5">
                                <div>
                                    <label className="text-xs text-gray-400 pl-1 block mb-1">Título</label>
                                    <input
                                        type="text"
                                        value={newGoal.title}
                                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                        placeholder="Ej: Auto Nuevo 🚗"
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400 pl-1 block mb-1">Descripción</label>
                                    <input
                                        type="text"
                                        value={newGoal.description}
                                        onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                                        placeholder="Ej: Para viajar a Brasil en verano ☀️"
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-400 pl-1 block mb-1">Meta ($)</label>
                                        <input
                                            type="number"
                                            value={newGoal.target_amount}
                                            onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                                            placeholder="500000"
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300"
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className="text-xs text-gray-400 pl-1 block mb-1">Emoji</label>
                                        <input
                                            type="text"
                                            value={newGoal.emoji}
                                            onChange={(e) => setNewGoal({ ...newGoal, emoji: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300 text-center"
                                        />
                                    </div>
                                </div>

                                {/* Shared Toggle */}
                                <div
                                    onClick={() => setNewGoal({ ...newGoal, is_shared: !newGoal.is_shared })}
                                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${newGoal.is_shared ? 'bg-romantic-50 border-romantic-200' : 'bg-gray-50 border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${newGoal.is_shared ? 'bg-romantic-100 text-romantic-600' : 'bg-gray-200 text-gray-500'}`}>
                                            {newGoal.is_shared ? <Target size={20} /> : <PiggyBank size={20} />}
                                        </div>
                                        <div>
                                            <p className={`font-medium ${newGoal.is_shared ? 'text-romantic-900' : 'text-gray-700'}`}>
                                                {newGoal.is_shared ? 'Meta Compartida' : 'Meta Personal'}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {newGoal.is_shared ? 'Ambos podrán ver y aportar.' : 'Solo tú podrás verla.'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${newGoal.is_shared ? 'border-romantic-500 bg-romantic-500' : 'border-gray-300'
                                        }`}>
                                        {newGoal.is_shared && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
                                >
                                    Crear Meta
                                </button>
                            </form>
                        </motion.div>
                    </>
                </AnimatePresence>,
                document.body
            )}

            {/* Contribution Modal (Reused Logic) */}
            {selectedGoal && (
                <ContributionModal
                    isOpen={isContribModalOpen}
                    onClose={() => setIsContribModalOpen(false)}
                    goal={selectedGoal}
                    onSuccess={() => {
                        fetchGoals();
                        setIsContribModalOpen(false);
                    }}
                />
            )}
        </motion.div>
    );
};

// Sub-components for cleaner code
const GoalCard = ({ goal, currentUserId, onContribute, onDelete }) => {
    const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
    // Can delete if creator
    const canDelete = goal.created_by === currentUserId; // simplified check

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-8xl grayscale">
                {goal.emoji}
            </div>

            <div className="flex justify-between items-start mb-2 relative z-10">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        {goal.emoji} {goal.title}
                    </h3>
                    {goal.description && (
                        <p className="text-xs text-gray-500 mt-1 max-w-[200px]">{goal.description}</p>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${goal.is_shared ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        {goal.is_shared ? 'Compartida' : 'Personal'}
                    </span>
                </div>
                {canDelete && (
                    <button onClick={onDelete} className="p-2 text-gray-300 hover:text-red-500 transition-colors" title="Borrar Meta">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                    </button>
                )}
            </div>

            <div className="flex justify-between items-end mb-2 mt-4 relative z-10">
                <span className="text-2xl font-bold text-gray-900">${Number(goal.current_amount).toLocaleString()}</span>
                <span className="text-xs text-gray-400 mb-1">de ${Number(goal.target_amount).toLocaleString()}</span>
            </div>

            <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative z-10 mb-4">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={`h-full rounded-full ${goal.is_shared ? 'bg-gradient-to-r from-romantic-400 to-purple-400' : 'bg-gray-800'}`}
                />
            </div>

            <button
                onClick={onContribute}
                className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors relative z-10"
            >
                Agregar Aporte
            </button>
        </div>
    );
};

const ContributionModal = ({ isOpen, onClose, goal, onSuccess }) => {
    const { user } = useAuth();
    const [amount, setAmount] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount) return;

        try {
            const { error: contribError } = await supabase.from('contributions').insert([{
                goal_id: goal.id,
                user_id: user?.id,
                amount: amount,
                note: 'Aporte'
            }]);

            if (contribError) throw contribError;

            // Simple update, trigger ensures atomic safety but for MVP client-side calc is ok-ish or we rely on backend trigger if exists
            const { error: updateError } = await supabase
                .from('goals')
                .update({ current_amount: Number(goal.current_amount) + Number(amount) })
                .eq('id', goal.id);

            if (updateError) throw updateError;

            onSuccess();
            setAmount('');
        } catch (error) {
            console.error(error);
            alert('Error al aportar');
        }
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        key="backdrop-contrib"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                        onClick={onClose}
                    />
                    <motion.div
                        key="modal-contrib"
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-[70] pb-10"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Aportar a {goal.title}</h2>
                            <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label className="text-xs text-gray-400 block mb-2">Monto</label>
                                <input
                                    autoFocus
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full text-3xl font-bold text-gray-800 bg-gray-50 p-4 rounded-xl outline-none"
                                    placeholder="$0"
                                />
                            </div>
                            <button type="submit" className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold">Enviar</button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default ExpensesPage;
