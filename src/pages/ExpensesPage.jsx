import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

// Sub-components
import ExpensesView from '../components/expenses/ExpensesView';
import GoalsView from '../components/expenses/GoalsView';
import TransactionModal from '../components/expenses/TransactionModal';

const ExpensesPage = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'goals'
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Summary State
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [userName, setUserName] = useState('');

    // Modal State for Transactions
    const [isTxModalOpen, setIsTxModalOpen] = useState(false);
    const [editingTx, setEditingTx] = useState(null);

    useEffect(() => {
        fetchTransactions();
        fetchUserName();
    }, []);

    const fetchUserName = async () => {
        try {
            if (!user) return;
            const { data } = await supabase
                .from('profiles')
                .select('username')
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

            const txs = data || [];
            setTransactions(txs);
            calculateSummary(txs);
        } catch (error) {
            console.error('Error fetching transactions:', error);
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
        setIsTxModalOpen(true);
    };

    const openNewTxModal = () => {
        setEditingTx(null);
        setIsTxModalOpen(true);
    };

    return (
        <div className="min-h-screen px-4 bg-gray-50 pb-20">
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

            {/* Quick Add Button (Floating) - Only shown on expenses tab usually, but good to have always or conditional */}
            {activeTab === 'expenses' && (
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={openNewTxModal}
                    className="fixed bottom-24 right-6 bg-romantic-500 text-white p-4 rounded-full shadow-lg shadow-romantic-300/50 z-40"
                >
                    <Plus size={28} />
                </motion.button>
            )}

            {/* Transaction Modal */}
            <TransactionModal
                isOpen={isTxModalOpen}
                onClose={() => setIsTxModalOpen(false)}
                editingTx={editingTx}
                onSuccess={fetchTransactions}
            />
        </div>
    );
};

export default ExpensesPage;
