import React from 'react';
import { motion } from 'framer-motion';
import TimeTogether from '../components/timer/TimeTogether';

const Dashboard = () => {
    return (
        <div className="space-y-6">
            <header className="mb-6 text-center">
                <h1 className="text-3xl font-serif text-romantic-800">Hola, Martina ❤️</h1>
                <p className="text-gray-600 mt-2">Bienvenida a nuestro espacio especial.</p>
            </header>

            {/* Widgets Grid */}
            <div className="grid grid-cols-1 gap-4">

                {/* Timer Widget */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <TimeTogether />
                </motion.div>

                {/* Quick Access Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-pastel-pink/20 rounded-2xl p-4 flex flex-col items-center justify-center aspect-square cursor-pointer"
                    >
                        <span className="text-2xl mb-2">🎁</span>
                        <span className="font-serif font-bold text-romantic-800">Tu Regalo</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-pastel-blue/20 rounded-2xl p-4 flex flex-col items-center justify-center aspect-square cursor-pointer"
                    >
                        <span className="text-2xl mb-2">📸</span>
                        <span className="font-serif font-bold text-romantic-800">Recuerdos</span>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
