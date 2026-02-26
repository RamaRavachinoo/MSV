import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Sub-components
import ExpensesView from '../components/expenses/ExpensesView';
import GoalsView from '../components/expenses/GoalsView';
import TransactionModal from '../components/expenses/TransactionModal';
import CreateGoalModal from '../components/expenses/CreateGoalModal';
import ContributionModal from '../components/expenses/ContributionModal';
import ConfirmModal from '../components/ui/ConfirmModal';

const ExpensesPage = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'goals'
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');

    // Modal State for Transactions
    const [isTxModalOpen, setIsTxModalOpen] = useState(false);
    const [editingTx, setEditingTx] = useState(null);
    const [deleteConfirmTx, setDeleteConfirmTx] = useState(null);

    // Month selector
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-11
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());

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
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter transactions by selected month
    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const d = new Date(tx.date);
            return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
        });
    }, [transactions, selectedMonth, selectedYear]);

    const monthlyIncome = useMemo(() => {
        return filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    }, [filteredTransactions]);

    const monthlyExpense = useMemo(() => {
        return filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    }, [filteredTransactions]);

    const goToPrevMonth = () => {
        if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(y => y - 1);
        } else {
            setSelectedMonth(m => m - 1);
        }
    };

    const goToNextMonth = () => {
        const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();
        if (isCurrentMonth) return;
        if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(y => y + 1);
        } else {
            setSelectedMonth(m => m + 1);
        }
    };

    const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();

    const monthLabel = format(new Date(selectedYear, selectedMonth, 1), 'MMMM yyyy', { locale: es });

    const handleDeleteTransaction = async () => {
        if (!deleteConfirmTx) return;

        try {
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', deleteConfirmTx);

            if (error) throw error;
            fetchTransactions();
            setDeleteConfirmTx(null);
        } catch (error) {
            console.error('Error deleting transaction:', error);
            // alert('Error al eliminar. Intenta de nuevo.'); // Replaced by simple console log for now, or use a toast later
        }
    };

    const confirmDeleteTransaction = (id) => {
        setDeleteConfirmTx(id);
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

            {/* Month Selector */}
            <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm px-4 py-3 mb-4">
                <button onClick={goToPrevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ChevronLeft size={20} className="text-gray-600" />
                </button>
                <div className="text-center">
                    <p className="font-serif font-semibold text-gray-800 capitalize">{monthLabel}</p>
                    {isCurrentMonth && (
                        <span className="text-[10px] bg-romantic-100 text-romantic-600 px-2 py-0.5 rounded-full font-medium">Mes actual</span>
                    )}
                </div>
                <button
                    onClick={goToNextMonth}
                    disabled={isCurrentMonth}
                    className={`p-2 rounded-full transition-colors ${isCurrentMonth ? 'text-gray-200' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                    <ChevronRight size={20} />
                </button>
            </div>

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
                        transactions={filteredTransactions}
                        income={monthlyIncome}
                        expense={monthlyExpense}
                        onEdit={openEditModal}
                        onDelete={confirmDeleteTransaction}
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

            <ConfirmModal
                isOpen={!!deleteConfirmTx}
                onClose={() => setDeleteConfirmTx(null)}
                onConfirm={handleDeleteTransaction}
                title="¿Eliminar movimiento?"
                message="Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                isDestructive={true}
            />
        </div>
    );
};

export default ExpensesPage;
