import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BattleCard from './BattleCard';

const BattleScreen = ({
  matchup, // [placeA, placeB]
  roundNumber,
  matchNumber,
  totalMatches,
  categoryLabel,
  categoryEmoji,
  onWinnerSelected,
}) => {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (place) => {
    setSelected(place.id);
    setShowResult(true);

    // Wait for animation, then advance
    setTimeout(() => {
      onWinnerSelected(place);
      setSelected(null);
      setShowResult(false);
    }, 1200);
  };

  const [placeA, placeB] = matchup;

  return (
    <motion.div
      key={`${placeA.id}-${placeB.id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center px-4 py-6 min-h-[75vh]"
    >
      {/* Round info */}
      <div className="text-center mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#8a7d65' }}>
          {categoryEmoji} {categoryLabel}
        </p>
        <p className="text-xs" style={{ color: '#6a5d45' }}>
          Ronda {roundNumber} · Batalla {matchNumber}/{totalMatches}
        </p>
      </div>

      {/* Battle area */}
      <div className="w-full max-w-md flex flex-col gap-4 relative">
        {/* Place A */}
        <BattleCard
          place={placeA}
          side="left"
          onSelect={handleSelect}
          isSelected={showResult && selected === placeA.id}
          isLoser={showResult && selected !== placeA.id}
        />

        {/* VS Badge */}
        <div className="flex items-center justify-center -my-2 z-10">
          <motion.div
            className="w-14 h-14 rounded-full flex items-center justify-center font-black text-base"
            style={{
              background: 'linear-gradient(135deg, #ff4444, #ff6b35)',
              color: 'white',
              boxShadow: '0 0 30px rgba(255,68,68,0.4)',
            }}
            animate={{
              boxShadow: [
                '0 0 20px rgba(255,68,68,0.3)',
                '0 0 40px rgba(255,68,68,0.6)',
                '0 0 20px rgba(255,68,68,0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            VS
          </motion.div>
        </div>

        {/* Place B */}
        <BattleCard
          place={placeB}
          side="right"
          onSelect={handleSelect}
          isSelected={showResult && selected === placeB.id}
          isLoser={showResult && selected !== placeB.id}
        />
      </div>

      {/* Instruction */}
      {!showResult && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-xs text-center"
          style={{ color: '#6a5d45' }}
        >
          Tocá el que más te cope 👆
        </motion.p>
      )}
    </motion.div>
  );
};

export default BattleScreen;
