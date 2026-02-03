import React, { useState, useEffect } from 'react';
import CouponWheel from '../components/roulette/CouponWheel';
import { supabase } from '../lib/supabase';

const RoulettePage = () => {
    const [spinsLeft, setSpinsLeft] = useState(1); // Default 1 spin for MVP

    useEffect(() => {
        // Here we would fetch available spins from Supabase
        // fetchSpins();
    }, []);

    return (
        <div className="flex flex-col items-center min-h-[80vh] py-8">
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-serif text-romantic-800">Tu Suerte Romántica</h1>
                <p className="text-gray-600 mt-2">Gira la ruleta para ganar un premio especial</p>
                <div className="mt-4 inline-block bg-romantic-100 text-romantic-800 px-4 py-1 rounded-full text-sm font-medium">
                    Giros disponibles: {spinsLeft}
                </div>
            </header>

            <div className="flex-1 flex items-center justify-center w-full">
                {spinsLeft > 0 ? (
                    <CouponWheel onSpinComplete={() => setSpinsLeft(prev => Math.max(0, prev - 1))} />
                ) : (
                    <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-sm">
                        <p className="text-gray-500 mb-4">¡Ya usaste tus giros de hoy!</p>
                        <p className="text-romantic-600 font-serif text-lg">Vuelve en una fecha especial ❤️</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoulettePage;
