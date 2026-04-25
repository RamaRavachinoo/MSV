import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Globe, Heart, ExternalLink } from 'lucide-react';

const FinalResults = ({ barWinner, restaurantWinner, onGoHome }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-8 text-center relative"
    >
      {/* Background particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
          style={{
            background: i % 3 === 0 ? '#D4AF37' : i % 3 === 1 ? '#F7E7CE' : '#ff6b8a',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="text-6xl mb-2"
      >
        🎉
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-3xl font-serif font-bold mb-2"
        style={{ color: '#F7E7CE' }}
      >
        ¡Ya tenemos plan!
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-sm mb-10"
        style={{ color: '#a89870' }}
      >
        Nuestra cita de aniversario va a ser increíble 💕
      </motion.p>

      {/* Winner Cards */}
      <div className="w-full max-w-sm space-y-5 mb-10">
        {/* Bar Winner */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8, type: 'spring' }}
          className="rounded-3xl p-5 text-left relative overflow-hidden"
          style={{
            background: 'rgba(212,175,55,0.1)',
            border: '1px solid rgba(212,175,55,0.3)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="absolute top-3 right-3 text-2xl">🍸</div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#D4AF37' }}>
            Tragos en
          </p>
          <h3 className="text-2xl font-serif font-bold mb-1" style={{ color: '#F7E7CE' }}>
            {barWinner.name}
          </h3>
          <p className="text-xs mb-4" style={{ color: '#8a7d65' }}>{barWinner.vibe}</p>
          <div className="flex gap-2">
            <a
              href={barWinner.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{
                background: 'linear-gradient(135deg, #833AB4, #E1306C, #F77737)',
                color: 'white',
              }}
            >
              <Instagram size={12} />
              Instagram
            </a>
            {barWinner.website && (
              <a
                href={barWinner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#c9b896' }}
              >
                <Globe size={12} /> Web
              </a>
            )}
            {barWinner.bookingUrl && (
              <a
                href={barWinner.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}
              >
                <ExternalLink size={12} /> Reservar
              </a>
            )}
          </div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.0 }}
          className="flex items-center justify-center"
        >
          <div className="h-px flex-1" style={{ background: 'rgba(212,175,55,0.2)' }} />
          <div className="px-4 text-xl">💕</div>
          <div className="h-px flex-1" style={{ background: 'rgba(212,175,55,0.2)' }} />
        </motion.div>

        {/* Restaurant Winner */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.2, type: 'spring' }}
          className="rounded-3xl p-5 text-left relative overflow-hidden"
          style={{
            background: 'rgba(212,175,55,0.1)',
            border: '1px solid rgba(212,175,55,0.3)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="absolute top-3 right-3 text-2xl">🍽️</div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#D4AF37' }}>
            Cenamos en
          </p>
          <h3 className="text-2xl font-serif font-bold mb-1" style={{ color: '#F7E7CE' }}>
            {restaurantWinner.name}
          </h3>
          <p className="text-xs mb-4" style={{ color: '#8a7d65' }}>{restaurantWinner.vibe}</p>
          <div className="flex gap-2">
            <a
              href={restaurantWinner.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{
                background: 'linear-gradient(135deg, #833AB4, #E1306C, #F77737)',
                color: 'white',
              }}
            >
              <Instagram size={12} />
              Instagram
            </a>
            {restaurantWinner.website && (
              <a
                href={restaurantWinner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#c9b896' }}
              >
                <Globe size={12} /> Web
              </a>
            )}
          </div>
        </motion.div>
      </div>

      {/* Closing message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="text-sm italic mb-8 max-w-xs"
        style={{ color: '#8a7d65' }}
      >
        Te amo, y no puedo esperar a esta cita ❤️
      </motion.p>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onGoHome}
        className="px-8 py-3 rounded-2xl font-bold text-sm flex items-center gap-2"
        style={{
          background: 'rgba(255,255,255,0.1)',
          color: '#c9b896',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <Heart size={16} />
        Volver al inicio
      </motion.button>
    </motion.div>
  );
};

export default FinalResults;
