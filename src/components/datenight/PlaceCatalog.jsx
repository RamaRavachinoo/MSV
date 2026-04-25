import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Globe, ExternalLink, ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';

const PlaceCatalog = ({ bars, restaurants, onBack }) => {
  const [activeTab, setActiveTab] = useState('restaurants');
  const [selectedPlace, setSelectedPlace] = useState(null);

  const items = activeTab === 'restaurants' ? restaurants : bars;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 py-6 pb-10"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-full transition-colors"
          style={{ background: 'rgba(255,255,255,0.08)', color: '#c9b896' }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="font-serif font-bold text-xl" style={{ color: '#F7E7CE' }}>
            Todos los lugares
          </h2>
          <p className="text-xs" style={{ color: '#6a5d45' }}>
            Explotalos uno por uno 👀
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'restaurants', label: '🍽️ Restaurantes', count: restaurants.length },
          { key: 'bars', label: '🍸 Bares', count: bars.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background:
                activeTab === tab.key
                  ? 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(247,231,206,0.1))'
                  : 'rgba(255,255,255,0.04)',
              border:
                activeTab === tab.key
                  ? '1px solid rgba(212,175,55,0.4)'
                  : '1px solid rgba(255,255,255,0.08)',
              color: activeTab === tab.key ? '#F7E7CE' : '#6a5d45',
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {items.map((place, index) => (
            <motion.div
              key={place.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedPlace(place)}
              className="rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02]"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl mt-0.5">{place.emoji}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif font-bold text-base" style={{ color: '#F7E7CE' }}>
                    {place.name}
                  </h3>
                  <p className="text-[11px] font-medium mb-2" style={{ color: '#D4AF37' }}>
                    {place.vibe}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: '#8a7d65' }}>
                    {place.description}
                  </p>
                </div>
              </div>

              {/* Quick links */}
              <div className="flex gap-2 mt-3 ml-10">
                <a
                  href={place.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium"
                  style={{
                    background: 'linear-gradient(135deg, #833AB4, #E1306C, #F77737)',
                    color: 'white',
                  }}
                >
                  <Instagram size={11} />
                  Instagram
                </a>
                {place.website && (
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium"
                    style={{ background: 'rgba(255,255,255,0.08)', color: '#c9b896' }}
                  >
                    <Globe size={11} />
                    Web
                  </a>
                )}
                {place.bookingUrl && (
                  <a
                    href={place.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium"
                    style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}
                  >
                    <ExternalLink size={11} />
                    Reservar
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedPlace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSelectedPlace(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl p-6 relative"
              style={{
                background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                border: '1px solid rgba(212,175,55,0.3)',
              }}
            >
              <button
                onClick={() => setSelectedPlace(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#c9b896' }}
              >
                <X size={16} />
              </button>

              <div className="text-5xl mb-4">{selectedPlace.emoji}</div>
              <h3 className="font-serif font-bold text-2xl mb-1" style={{ color: '#F7E7CE' }}>
                {selectedPlace.name}
              </h3>
              <p className="text-xs font-semibold mb-4" style={{ color: '#D4AF37' }}>
                {selectedPlace.vibe}
              </p>
              <p className="text-sm leading-relaxed mb-6" style={{ color: '#a89870' }}>
                {selectedPlace.description}
              </p>

              <div className="flex flex-wrap gap-2">
                <a
                  href={selectedPlace.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium"
                  style={{
                    background: 'linear-gradient(135deg, #833AB4, #E1306C, #F77737)',
                    color: 'white',
                  }}
                >
                  <Instagram size={14} />
                  Ver en Instagram
                </a>
                {selectedPlace.website && (
                  <a
                    href={selectedPlace.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium"
                    style={{ background: 'rgba(255,255,255,0.1)', color: '#c9b896' }}
                  >
                    <Globe size={14} />
                    Sitio web
                  </a>
                )}
                {selectedPlace.bookingUrl && (
                  <a
                    href={selectedPlace.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium"
                    style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37' }}
                  >
                    <ExternalLink size={14} />
                    Reservar
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PlaceCatalog;
