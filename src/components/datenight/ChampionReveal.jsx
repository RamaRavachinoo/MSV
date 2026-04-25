import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Globe, Trophy, ArrowRight, ExternalLink } from 'lucide-react';

const ChampionReveal = ({ winner, category, categoryEmoji, onContinue, isFinal }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center relative"
    >
      {/* Confetti / Stars */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-xl pointer-events-none"
          style={{
            left: `${5 + Math.random() * 90}%`,
            top: `${5 + Math.random() * 90}%`,
          }}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0],
            rotate: [0, 180, 360],
            y: [0, -30, -60],
          }}
          transition={{
            duration: 2.5,
            delay: 0.2 + Math.random() * 1.5,
            repeat: Infinity,
            repeatDelay: Math.random() * 3,
          }}
        >
          {['✨', '⭐', '🌟', '💫', '🎉', '🥂'][Math.floor(Math.random() * 6)]}
        </motion.div>
      ))}

      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
        className="text-7xl mb-4"
      >
        👑
      </motion.div>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs font-bold uppercase tracking-[0.25em] mb-3"
        style={{ color: '#D4AF37' }}
      >
        {categoryEmoji} {category === 'bar' ? 'Bar Campeón' : 'Restaurante Campeón'}
      </motion.p>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-4xl font-serif font-bold mb-2"
        style={{ color: '#F7E7CE' }}
      >
        {winner.name}
      </motion.h2>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-sm mb-2"
        style={{ color: '#a89870' }}
      >
        {winner.vibe}
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-5xl mb-8"
      >
        {winner.emoji}
      </motion.div>

      {/* Links */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="flex gap-3 mb-10"
      >
        <a
          href={winner.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
          style={{
            background: 'linear-gradient(135deg, #833AB4, #E1306C, #F77737)',
            color: 'white',
          }}
        >
          <Instagram size={16} />
          Ver en Instagram
        </a>
        {winner.website && (
          <a
            href={winner.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#c9b896',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <Globe size={16} />
            Web
          </a>
        )}
      </motion.div>

      {/* Continue button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onContinue}
        className="px-8 py-3 rounded-2xl font-bold text-base flex items-center gap-2"
        style={{
          background: 'linear-gradient(135deg, #D4AF37, #F7E7CE)',
          color: '#1a1a2e',
        }}
      >
        {isFinal ? (
          <>
            <Trophy size={18} />
            Ver el plan completo
          </>
        ) : (
          <>
            {category === 'restaurant' ? 'Ahora los bares' : 'Ahora los restaurantes'}
            <ArrowRight size={18} />
          </>
        )}
      </motion.button>
    </motion.div>
  );
};

export default ChampionReveal;
