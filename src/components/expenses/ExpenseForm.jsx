import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ShoppingBag } from 'lucide-react';

const CATEGORIES = [
    { name: 'Comida', emoji: '🍕', color: 'bg-orange-100 text-orange-600' },
    { name: 'Transporte', emoji: '🚗', color: 'bg-blue-100 text-blue-600' },
    { name: 'Entretenimiento', emoji: '🎬', color: 'bg-purple-100 text-purple-600' },
    { name: 'Salud', emoji: '💊', color: 'bg-red-100 text-red-600' },
    { name: 'Hogar', emoji: '🏠', color: 'bg-green-100 text-green-600' },
    { name: 'Ropa', emoji: '👕', color: 'bg-pink-100 text-pink-600' },
    { name: 'Educación', emoji: '📚', color: 'bg-indigo-100 text-indigo-600' },
    { name: 'Otros', emoji: '📦', color: 'bg-gray-100 text-gray-600' },
];

const ExpenseForm = ({ onAddExpense, isOpen, onToggle }) => {
    const [product, setProduct] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!product || !amount || !category) return;

        onAddExpense({
            product,
            amount: parseFloat(amount),
            category,
            description,
            date
        });

        // Reset form
        setProduct('');
        setAmount('');
        setCategory('');
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
        onToggle();
    };

    return (
        <>
            {/* Botón flotante para agregar gasto */}
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onToggle}
                className="fixed bottom-24 right-4 z-40 p-4 bg-romantic-500 text-white rounded-full shadow-lg"
            >
                <Plus size={24} />
            </motion.button>

            {/* Modal de formulario */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onToggle}
                            className="fixed inset-0 bg-black/50 z-40"
                        />

                        {/* Formulario */}
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-50 max-h-[85vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="text-romantic-500" size={24} />
                                    <h2 className="text-xl font-serif font-bold text-gray-800">
                                        Nuevo Gasto
                                    </h2>
                                </div>
                                <button
                                    onClick={onToggle}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <X className="text-gray-500" size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Producto */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Producto / Servicio
                                    </label>
                                    <input
                                        type="text"
                                        value={product}
                                        onChange={(e) => setProduct(e.target.value)}
                                        placeholder="Ej: Café en Starbucks"
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-romantic-400 focus:outline-none"
                                    />
                                </div>

                                {/* Precio */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Precio (€)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-romantic-400 focus:outline-none text-2xl font-bold"
                                    />
                                </div>

                                {/* Categoría */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Categoría
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {CATEGORIES.map((cat) => (
                                            <button
                                                key={cat.name}
                                                type="button"
                                                onClick={() => setCategory(cat.name)}
                                                className={`p-2 rounded-xl text-center transition-all ${
                                                    category === cat.name
                                                        ? 'ring-2 ring-romantic-500 scale-105'
                                                        : ''
                                                } ${cat.color}`}
                                            >
                                                <span className="text-xl">{cat.emoji}</span>
                                                <p className="text-xs font-medium mt-1">{cat.name}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Fecha */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha
                                    </label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-romantic-400 focus:outline-none"
                                    />
                                </div>

                                {/* Descripción */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nota (opcional)
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Añade una nota..."
                                        rows={2}
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-romantic-400 focus:outline-none resize-none"
                                    />
                                </div>

                                {/* Botón de envío */}
                                <button
                                    type="submit"
                                    disabled={!product || !amount || !category}
                                    className="w-full py-4 bg-romantic-500 text-white rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                                >
                                    Guardar Gasto
                                </button>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export { CATEGORIES };
export default ExpenseForm;
