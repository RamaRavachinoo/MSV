import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const Envelope = ({ isOpen, onOpen, children }) => {
    return (
        <div className="relative w-72 md:w-80 mx-auto" style={{ perspective: '1000px' }}>
            {/* Envelope Body */}
            <div className="relative rounded-2xl shadow-2xl overflow-visible" style={{ minHeight: '200px' }}>

                {/* Envelope back */}
                <div
                    className="w-full rounded-2xl"
                    style={{
                        backgroundColor: '#e8d5b7',
                        minHeight: '200px',
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)'
                    }}
                />

                {/* Letter that slides out */}
                <motion.div
                    className="absolute inset-x-3 bg-white rounded-xl shadow-md"
                    initial={{ y: 0 }}
                    animate={isOpen ? { y: -280 } : { y: 0 }}
                    transition={{ delay: isOpen ? 0.6 : 0, duration: 0.8, ease: "easeOut" }}
                    style={{
                        bottom: '16px',
                        zIndex: isOpen ? 30 : 5,
                        minHeight: '180px',
                        maxHeight: isOpen ? '400px' : '170px',
                        overflow: isOpen ? 'auto' : 'hidden'
                    }}
                >
                    {children}
                </motion.div>

                {/* Envelope front (bottom half) */}
                <div
                    className="absolute bottom-0 left-0 right-0 rounded-b-2xl"
                    style={{
                        backgroundColor: '#f5e6d0',
                        height: '110px',
                        zIndex: isOpen ? 2 : 15,
                        boxShadow: '0 -2px 6px rgba(0,0,0,0.05)'
                    }}
                >
                    {/* Side triangles for envelope look */}
                    <div
                        className="absolute top-0 left-0 right-0"
                        style={{
                            height: '60px',
                            background: 'linear-gradient(135deg, #e8d5b7 25%, transparent 25%), linear-gradient(225deg, #e8d5b7 25%, transparent 25%)',
                            backgroundSize: '50% 100%',
                            backgroundPosition: 'left, right',
                            backgroundRepeat: 'no-repeat',
                        }}
                    />
                </div>

                {/* Envelope Flap (top triangle) */}
                <motion.div
                    className="absolute top-0 left-0 right-0"
                    initial={{ rotateX: 0 }}
                    animate={isOpen ? { rotateX: 180 } : { rotateX: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    style={{
                        transformOrigin: 'top center',
                        transformStyle: 'preserve-3d',
                        zIndex: isOpen ? 1 : 20
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            height: '110px',
                            backgroundColor: '#dcc8a5',
                            clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                            borderRadius: '16px 16px 0 0',
                        }}
                    />
                </motion.div>

                {/* Wax Seal / Heart button */}
                {!isOpen && (
                    <motion.button
                        onClick={onOpen}
                        className="absolute z-30 w-14 h-14 bg-romantic-500 rounded-full shadow-lg flex items-center justify-center"
                        style={{
                            top: '60px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                        }}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Heart className="text-white fill-white" size={24} />
                    </motion.button>
                )}
            </div>
        </div>
    );
};

export default Envelope;
