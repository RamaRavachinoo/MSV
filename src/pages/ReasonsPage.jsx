import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const REASONS = [
    "Por cómo te brillan los ojos cuando hablas de lo que te apasiona.",
    "Por tu risa que ilumina cualquier día gris.",
    "Porque me haces querer ser mejor persona.",
    "Por tu inteligencia y determinación en la abogacía.",
    "Por cada momento de paz que me das.",
    "Por tus abrazos que reconfortan el alma.",
    "Por cómo cuidas a los que amas.",
    "Porque eres mi mejor amiga y mi amor.",
    "Por nuestros planes a futuro juntos.",
    "Simplemente, por existir y elegirme.",
];

const ReasonsPage = () => {
    return (
        <div className="min-h-screen py-6 px-4">
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-serif text-romantic-800 mb-2">Por qué te amo</h1>
                <p className="text-sm text-gray-500">Solo 10 de las infinitas razones</p>
            </header>

            <div className="space-y-4 max-w-lg mx-auto pb-20">
                {REASONS.map((reason, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white p-6 rounded-xl shadow-sm border border-romantic-100 flex items-start group"
                    >
                        <div className="mr-4 mt-1 bg-romantic-50 p-2 rounded-full group-hover:bg-romantic-100 transition-colors">
                            <Heart size={20} className="text-romantic-400 group-hover:text-romantic-600 transition-colors" />
                        </div>
                        <div>
                            <span className="text-xs text-uppercase text-gray-400 font-bold tracking-widest">RAZÓN #{index + 1}</span>
                            <p className="text-lg font-serif text-gray-800 mt-1 leading-snug">
                                {reason}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="text-center mt-8 pb-10">
                <p className="text-romantic-400 font-serif italic text-lg">...y por todo lo que nos falta vivir.</p>
            </div>
        </div>
    );
};

export default ReasonsPage;
