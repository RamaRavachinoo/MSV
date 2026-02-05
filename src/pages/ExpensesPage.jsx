import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, List, PieChart } from 'lucide-react';
import MonthSelector from '../components/expenses/MonthSelector';
import IncomeSection from '../components/expenses/IncomeSection';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseList from '../components/expenses/ExpenseList';
import ExpenseDashboard from '../components/expenses/ExpenseDashboard';

// Local storage keys
const STORAGE_KEYS = {
    EXPENSES: 'msv_expenses',
    INCOMES: 'msv_incomes'
};

const ExpensesPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'list'
    const [showExpenseForm, setShowExpenseForm] = useState(false);

    // All data (stored in localStorage for now)
    const [allExpenses, setAllExpenses] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
        return saved ? JSON.parse(saved) : [];
    });

    const [allIncomes, setAllIncomes] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.INCOMES);
        return saved ? JSON.parse(saved) : [];
    });

    // Save to localStorage when data changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(allExpenses));
    }, [allExpenses]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(allIncomes));
    }, [allIncomes]);

    // Get current month/year
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

    // Filter data for current month
    const monthExpenses = useMemo(() => {
        return allExpenses.filter(e => e.month === currentMonth && e.year === currentYear);
    }, [allExpenses, currentMonth, currentYear]);

    const monthIncomes = useMemo(() => {
        return allIncomes.filter(i => i.month === currentMonth && i.year === currentYear);
    }, [allIncomes, currentMonth, currentYear]);

    // Calculate totals
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const totalIncome = monthIncomes.reduce((sum, i) => sum + parseFloat(i.amount), 0);

    // Handlers
    const handleAddExpense = (expenseData) => {
        const newExpense = {
            ...expenseData,
            id: Date.now(),
            month: currentMonth,
            year: currentYear,
            created_at: new Date().toISOString()
        };
        setAllExpenses(prev => [...prev, newExpense]);
    };

    const handleDeleteExpense = (id) => {
        setAllExpenses(prev => prev.filter(e => e.id !== id));
    };

    const handleAddIncome = (incomeData) => {
        const newIncome = {
            ...incomeData,
            id: Date.now(),
            month: currentMonth,
            year: currentYear,
            date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString()
        };
        setAllIncomes(prev => [...prev, newIncome]);
    };

    const handleDeleteIncome = (id) => {
        setAllIncomes(prev => prev.filter(i => i.id !== id));
    };

    const tabs = [
        { id: 'dashboard', label: 'Resumen', icon: PieChart },
        { id: 'list', label: 'Gastos', icon: List },
    ];

    return (
        <div className="space-y-4 pb-4">
            {/* Header */}
            <header className="text-center mb-2">
                <h1 className="text-2xl font-serif font-bold text-romantic-800">
                    Mis Finanzas
                </h1>
                <p className="text-gray-500 text-sm">Controla tus gastos e ingresos</p>
            </header>

            {/* Month Selector */}
            <MonthSelector
                currentDate={currentDate}
                onDateChange={setCurrentDate}
            />

            {/* Income Section */}
            <IncomeSection
                incomes={monthIncomes}
                onAddIncome={handleAddIncome}
                onDeleteIncome={handleDeleteIncome}
                totalIncome={totalIncome}
            />

            {/* Tabs */}
            <div className="flex bg-white rounded-xl p-1 shadow-sm">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${
                                activeTab === tab.id
                                    ? 'bg-romantic-500 text-white'
                                    : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <Icon size={18} />
                            <span className="font-medium text-sm">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'dashboard' && (
                        <ExpenseDashboard
                            expenses={monthExpenses}
                            totalIncome={totalIncome}
                            totalExpenses={totalExpenses}
                        />
                    )}

                    {activeTab === 'list' && (
                        <ExpenseList
                            expenses={monthExpenses}
                            onDeleteExpense={handleDeleteExpense}
                            totalExpenses={totalExpenses}
                        />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Floating Add Expense Button + Form */}
            <ExpenseForm
                onAddExpense={handleAddExpense}
                isOpen={showExpenseForm}
                onToggle={() => setShowExpenseForm(!showExpenseForm)}
            />
        </div>
    );
};

export default ExpensesPage;
