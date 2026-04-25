import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, List } from 'lucide-react';

const DateNightIntro = ({ onStart, onBrowse }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 relative"
    >
      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: i % 2 === 0 ? '#D4AF37' : '#F7E7CE',
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-8"
        style={{ background: 'linear-gradient(135deg, #D4AF37, #F7E7CE)' }}
      >
        <Heart size={36} className="text-white" fill="white" />
      </motion.div>

      <motion.h1
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-4xl md:text-5xl font-serif font-bold mb-4"
        style={{ color: '#F7E7CE' }}
      >
        Nuestro Aniversario
      </motion.h1>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-5xl mb-6"
      >
        💕
      </motion.div>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-lg leading-relaxed max-w-sm mb-3"
        style={{ color: '#c9b896' }}
      >
        Marti, estoy muy feliz planeando dónde podemos ir a celebrar
      </motion.p>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="text-base leading-relaxed max-w-sm mb-10"
        style={{ color: '#a89870' }}
      >
      </motion.p>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="text-sm max-w-xs mb-8 italic"
        style={{ color: '#8a7d65' }}
      >
        Aca hay algunas recomendaciones de bares y restaurants para que me ayudes a elegir nuestra cita :D     </motion.p>

      {/* Two buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        {/* Main CTA - Start tournament */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="relative w-full px-8 py-4 rounded-2xl font-bold text-lg text-gray-900 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #F7E7CE)' }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Sparkles size={20} />
            ¡A elegir!
            <Sparkles size={20} />
          </span>
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 opacity-40"
            style={{ background: 'linear-gradient(90deg, transparent, white, transparent)' }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
        </motion.button>

        {/* Secondary - Browse all */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onBrowse}
          className="w-full px-8 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
          style={{
            background: 'rgba(255,255,255,0.06)',
            color: '#c9b896',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <List size={16} />
          Ver todos los lugares
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default DateNightIntro;
