import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Globe, ExternalLink } from 'lucide-react';

const BattleCard = ({ place, side, onSelect, isSelected, isLoser }) => {
  const sideVariants = {
    left: { initial: { x: -100, opacity: 0 }, animate: { x: 0, opacity: 1 } },
    right: { initial: { x: 100, opacity: 0 }, animate: { x: 0, opacity: 1 } },
  };

  return (
    <motion.div
      initial={sideVariants[side].initial}
      animate={
        isLoser
          ? { scale: 0.8, opacity: 0, y: 40 }
          : isSelected
          ? { scale: 1.05, y: -10 }
          : sideVariants[side].animate
      }
      transition={{ type: 'spring', stiffness: 120, damping: 15 }}
      whileHover={!isSelected && !isLoser ? { scale: 1.03, y: -4 } : {}}
      whileTap={!isSelected && !isLoser ? { scale: 0.97 } : {}}
      onClick={() => !isSelected && !isLoser && onSelect(place)}
      className="relative flex-1 rounded-3xl p-5 cursor-pointer overflow-hidden transition-all"
      style={{
        background: isSelected
          ? 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(247,231,206,0.15))'
          : 'rgba(255,255,255,0.06)',
        border: isSelected
          ? '2px solid #D4AF37'
          : '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        minHeight: '200px',
      }}
    >
      {/* Winner glow */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            boxShadow: 'inset 0 0 40px rgba(212,175,55,0.2), 0 0 60px rgba(212,175,55,0.15)',
          }}
        />
      )}

      {/* Emoji */}
      <div className="text-4xl mb-3">{place.emoji}</div>

      {/* Name */}
      <h3
        className="font-serif font-bold text-xl mb-1 leading-tight"
        style={{ color: isSelected ? '#F7E7CE' : '#e8e0d0' }}
      >
        {place.name}
      </h3>

      {/* Vibe */}
      <p className="text-[11px] font-medium mb-1" style={{ color: '#D4AF37' }}>
        {place.vibe}
      </p>

      {/* Description */}
      <p className="text-xs leading-relaxed mb-4" style={{ color: '#8a7d65' }}>
        {place.description}
      </p>

      {/* Action links */}
      <div className="flex flex-wrap gap-2 mt-auto">
        <a
          href={place.instagram}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #833AB4, #E1306C, #F77737)',
            color: 'white',
          }}
        >
          <Instagram size={13} />
          Instagram
        </a>

        {place.website && (
          <a
            href={place.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#c9b896',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <Globe size={13} />
            Web
          </a>
        )}

        {place.bookingUrl && (
          <a
            href={place.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
            style={{
              background: 'rgba(212,175,55,0.15)',
              color: '#D4AF37',
              border: '1px solid rgba(212,175,55,0.3)',
            }}
          >
            <ExternalLink size={13} />
            Reservar
          </a>
        )}
      </div>

      {/* Winner badge */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute top-3 right-3 text-2xl"
          >
            👑
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BattleCard;
