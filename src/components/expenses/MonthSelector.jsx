import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';

const MonthSelector = ({ currentDate, onDateChange }) => {
    const handlePrevMonth = () => {
        onDateChange(subMonths(currentDate, 1));
    };

    const handleNextMonth = () => {
        onDateChange(addMonths(currentDate, 1));
    };

    const isCurrentMonth = () => {
        const now = new Date();
        return currentDate.getMonth() === now.getMonth() &&
               currentDate.getFullYear() === now.getFullYear();
    };

    return (
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm">
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handlePrevMonth}
                className="p-2 rounded-full hover:bg-romantic-100 transition-colors"
            >
                <ChevronLeft className="text-romantic-600" size={24} />
            </motion.button>

            <div className="text-center">
                <h2 className="text-xl font-serif font-bold text-romantic-800 capitalize">
                    {format(currentDate, 'MMMM yyyy', { locale: es })}
                </h2>
                {isCurrentMonth() && (
                    <span className="text-xs text-romantic-500 font-medium">
                        Mes actual
                    </span>
                )}
            </div>

            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleNextMonth}
                disabled={isCurrentMonth()}
                className={`p-2 rounded-full transition-colors ${
                    isCurrentMonth()
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'hover:bg-romantic-100 text-romantic-600'
                }`}
            >
                <ChevronRight size={24} />
            </motion.button>
        </div>
    );
};

export default MonthSelector;
