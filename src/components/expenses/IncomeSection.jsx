import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, X, Wallet } from 'lucide-react';

const IncomeSection = ({ incomes, onAddIncome, onDeleteIncome, totalIncome }) => {
    const [showForm, setShowForm] = useState(false);
    const [source, setSource] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!source || !amount) return;

        onAddIncome({
            source,
            amount: parseFloat(amount),
            description
        });

        setSource('');
        setAmount('');
        setDescription('');
        setShowForm(false);
    };

    const incomeSources = ['Salario', 'Freelance', 'Regalo', 'Inversiones', 'Otros'];

    return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-full">
                        <TrendingUp className="text-green-600" size={20} />
                    </div>
                    <div>
                        <h3 className="font-serif font-bold text-gray-800">Ingresos</h3>
                        <p className="text-2xl font-bold text-green-600">
                            €{totalIncome.toFixed(2)}
                        </p>
                    </div>
                </div>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowForm(!showForm)}
                    className="p-2 bg-green-500 text-white rounded-full shadow-md"
                >
                    <Plus size={20} />
                </motion.button>
            </div>

            {/* Formulario para agregar ingreso */}
            <AnimatePresence>
                {showForm && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleSubmit}
                        className="space-y-3 mb-4 overflow-hidden"
                    >
                        <div className="flex flex-wrap gap-2">
                            {incomeSources.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setSource(s)}
                                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                        source === s
                                            ? 'bg-green-500 text-white'
                                            : 'bg-white text-gray-600 hover:bg-green-100'
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Cantidad (€)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full p-3 rounded-xl border border-green-200 focus:ring-2 focus:ring-green-400 focus:outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Descripción (opcional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 rounded-xl border border-green-200 focus:ring-2 focus:ring-green-400 focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!source || !amount}
                            className="w-full py-3 bg-green-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Agregar Ingreso
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Lista de ingresos */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
                {incomes.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-2">
                        No hay ingresos registrados este mes
                    </p>
                ) : (
                    incomes.map((income) => (
                        <motion.div
                            key={income.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between bg-white/50 rounded-xl p-3"
                        >
                            <div className="flex items-center gap-2">
                                <Wallet className="text-green-500" size={16} />
                                <div>
                                    <p className="font-medium text-gray-800">{income.source}</p>
                                    {income.description && (
                                        <p className="text-xs text-gray-500">{income.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-green-600">
                                    +€{parseFloat(income.amount).toFixed(2)}
                                </span>
                                <button
                                    onClick={() => onDeleteIncome(income.id)}
                                    className="p-1 hover:bg-red-100 rounded-full transition-colors"
                                >
                                    <X className="text-red-400" size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default IncomeSection;
