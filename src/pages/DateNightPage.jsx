import React, { useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BARS, RESTAURANTS } from '../data/dateNightData';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import DateNightIntro from '../components/datenight/DateNightIntro';
import BattleScreen from '../components/datenight/BattleScreen';
import ChampionReveal from '../components/datenight/ChampionReveal';
import FinalResults from '../components/datenight/FinalResults';
import PlaceCatalog from '../components/datenight/PlaceCatalog';

// Shuffle array (Fisher-Yates)
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Build matchups from a list of contenders. If odd, last gets a bye.
const buildMatchups = (contenders) => {
  const pairs = [];
  for (let i = 0; i < contenders.length - 1; i += 2) {
    pairs.push([contenders[i], contenders[i + 1]]);
  }
  // If odd number, last one gets a bye (auto-advances)
  const bye = contenders.length % 2 !== 0 ? contenders[contenders.length - 1] : null;
  return { pairs, bye };
};

const STAGES = {
  INTRO: 'intro',
  BROWSE: 'browse',
  RESTAURANTS_BATTLE: 'restaurants_battle',
  RESTAURANTS_CHAMPION: 'restaurants_champion',
  BARS_BATTLE: 'bars_battle',
  BARS_CHAMPION: 'bars_champion',
  FINAL: 'final',
};

const DateNightPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stage, setStage] = useState(STAGES.INTRO);

  // Tournament state
  const [currentContenders, setCurrentContenders] = useState([]);
  const [currentMatchups, setCurrentMatchups] = useState([]);
  const [currentBye, setCurrentBye] = useState(null);
  const [matchIndex, setMatchIndex] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [roundWinners, setRoundWinners] = useState([]);
  const [bracketHistory, setBracketHistory] = useState([]);

  // Final winners
  const [barWinner, setBarWinner] = useState(null);
  const [restaurantWinner, setRestaurantWinner] = useState(null);

  // Start a new tournament for a category
  const startTournament = useCallback((items, stageKey) => {
    const shuffled = shuffle(items);
    const { pairs, bye } = buildMatchups(shuffled);
    setCurrentContenders(shuffled);
    setCurrentMatchups(pairs);
    setCurrentBye(bye);
    setMatchIndex(0);
    setRoundNumber(1);
    setRoundWinners([]);
    setBracketHistory([]);
    setStage(stageKey);
  }, []);

  // Handle winner selection in a battle
  const handleWinnerSelected = useCallback((winner) => {
    const currentMatch = currentMatchups[matchIndex];
    const loser = currentMatch.find((p) => p.id !== winner.id);

    // Record in bracket history
    const historyEntry = {
      round: roundNumber,
      matchup: [currentMatch[0].name, currentMatch[1].name],
      winner: winner.name,
    };

    const newHistory = [...bracketHistory, historyEntry];
    setBracketHistory(newHistory);

    const newRoundWinners = [...roundWinners, winner];

    if (matchIndex + 1 < currentMatchups.length) {
      // More matches in this round
      setMatchIndex(matchIndex + 1);
      setRoundWinners(newRoundWinners);
    } else {
      // Round is over — advance winners + bye to next round
      const advancers = currentBye ? [...newRoundWinners, currentBye] : newRoundWinners;

      if (advancers.length === 1) {
        // We have a champion!
        const champion = advancers[0];
        if (stage === STAGES.RESTAURANTS_BATTLE) {
          setRestaurantWinner(champion);
          savePick('restaurant', champion, newHistory);
          setStage(STAGES.RESTAURANTS_CHAMPION);
        } else {
          setBarWinner(champion);
          savePick('bar', champion, newHistory);
          setStage(STAGES.BARS_CHAMPION);
        }
      } else {
        // Next round
        const { pairs, bye } = buildMatchups(advancers);
        setCurrentMatchups(pairs);
        setCurrentBye(bye);
        setMatchIndex(0);
        setRoundNumber(roundNumber + 1);
        setRoundWinners([]);
      }
    }
  }, [currentMatchups, matchIndex, roundNumber, roundWinners, currentBye, bracketHistory, stage]);

  // Save pick to Supabase
  const savePick = async (category, winner, history) => {
    try {
      if (!supabase) return;
      await supabase.from('anniversary_picks').insert({
        category,
        winner_name: winner.name,
        winner_instagram: winner.instagram,
        bracket_path: history,
        picked_by: user?.id || null,
      });
    } catch (e) {
      console.error('Error saving pick:', e);
    }
  };

  // Current matchup for battle screen
  const currentMatchup = currentMatchups[matchIndex] || null;

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 40%, #16213e 100%)',
      }}
    >
      {/* Subtle overlay texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Back button — hidden in browse (PlaceCatalog has its own) */}
      {stage !== STAGES.BROWSE && (
        <button
          onClick={() => navigate('/')}
          className="fixed top-5 left-5 z-50 p-2.5 rounded-full transition-all hover:scale-110"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#c9b896',
          }}
        >
          <ArrowLeft size={18} />
        </button>
      )}

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {stage === STAGES.INTRO && (
            <DateNightIntro
              key="intro"
              onStart={() => startTournament(RESTAURANTS, STAGES.RESTAURANTS_BATTLE)}
              onBrowse={() => setStage(STAGES.BROWSE)}
            />
          )}

          {stage === STAGES.BROWSE && (
            <PlaceCatalog
              key="browse"
              bars={BARS}
              restaurants={RESTAURANTS}
              onBack={() => setStage(STAGES.INTRO)}
            />
          )}

          {stage === STAGES.RESTAURANTS_BATTLE && currentMatchup && (
            <BattleScreen
              key={`rest-${roundNumber}-${matchIndex}`}
              matchup={currentMatchup}
              roundNumber={roundNumber}
              matchNumber={matchIndex + 1}
              totalMatches={currentMatchups.length}
              categoryLabel="Restaurantes"
              categoryEmoji="🍽️"
              onWinnerSelected={handleWinnerSelected}
            />
          )}

          {stage === STAGES.RESTAURANTS_CHAMPION && restaurantWinner && (
            <ChampionReveal
              key="rest-champion"
              winner={restaurantWinner}
              category="restaurant"
              categoryEmoji="🍽️"
              isFinal={false}
              onContinue={() => startTournament(BARS, STAGES.BARS_BATTLE)}
            />
          )}

          {stage === STAGES.BARS_BATTLE && currentMatchup && (
            <BattleScreen
              key={`bar-${roundNumber}-${matchIndex}`}
              matchup={currentMatchup}
              roundNumber={roundNumber}
              matchNumber={matchIndex + 1}
              totalMatches={currentMatchups.length}
              categoryLabel="Bares"
              categoryEmoji="🍸"
              onWinnerSelected={handleWinnerSelected}
            />
          )}

          {stage === STAGES.BARS_CHAMPION && barWinner && (
            <ChampionReveal
              key="bar-champion"
              winner={barWinner}
              category="bar"
              categoryEmoji="🍸"
              isFinal={true}
              onContinue={() => setStage(STAGES.FINAL)}
            />
          )}

          {stage === STAGES.FINAL && barWinner && restaurantWinner && (
            <FinalResults
              key="final"
              barWinner={barWinner}
              restaurantWinner={restaurantWinner}
              onGoHome={() => navigate('/')}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DateNightPage;
