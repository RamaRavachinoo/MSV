import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

const Envelope = ({ isOpen, onOpen, children }) => {
    return (
        <div className="relative w-full max-w-sm mx-auto px-4">
            {/* Carta que aparece cuando se abre */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 80 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 80 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="bg-white rounded-xl shadow-2xl p-6 mb-6 relative z-50"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sobre */}
            <motion.div
                className="relative"
                animate={{ scale: isOpen ? 0.85 : 1, y: isOpen ? 20 : 0 }}
                transition={{ duration: 0.4 }}
            >
                {/* Cuerpo del sobre */}
                <div
                    className="relative w-full overflow-hidden rounded-lg"
                    style={{
                        aspectRatio: '16/11',
                        backgroundColor: '#e8d4be'
                    }}
                >
                    {/* Solapa de arriba (animada) */}
                    <motion.div
                        className="absolute inset-x-0 top-0 origin-top"
                        style={{
                            height: '55%',
                            zIndex: isOpen ? 5 : 20
                        }}
                        animate={{ rotateX: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div
                            className="w-full h-full"
                            style={{
                                backgroundColor: '#dcc5a8',
                                clipPath: 'polygon(0 0, 100% 0, 50% 100%)'
                            }}
                        />
                    </motion.div>

                    {/* Solapa inferior (fondo) */}
                    <div
                        className="absolute inset-x-0 bottom-0"
                        style={{
                            height: '60%',
                            backgroundColor: '#f0e2d0',
                            clipPath: 'polygon(0 100%, 50% 20%, 100% 100%)',
                            zIndex: 10
                        }}
                    />

                    {/* Sombra interna para profundidad */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: 'radial-gradient(ellipse at 50% 60%, transparent 40%, rgba(0,0,0,0.08) 100%)',
                            zIndex: 15
                        }}
                    />
                </div>

                {/* Sello corazón */}
                <AnimatePresence>
                    {!isOpen && (
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onOpen}
                            className="absolute left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer z-30"
                            style={{
                                top: '45%',
                                background: 'linear-gradient(135deg, #e85a71 0%, #c94b5c 100%)',
                                boxShadow: '0 4px 12px rgba(200, 75, 92, 0.4)'
                            }}
                        >
                            <Heart className="text-white fill-white" size={24} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Envelope;
