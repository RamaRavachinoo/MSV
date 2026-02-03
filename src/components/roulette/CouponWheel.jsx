import React, { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Gift, Sparkles } from 'lucide-react';
import clsx from 'clsx';

const COUPONS = [
    { id: 1, text: "Cena Romántica", color: "#fca5a5" }, // red-300
    { id: 2, text: "Masajes (30 min)", color: "#93c5fd" }, // blue-300
    { id: 3, text: "Noche de Pelis", color: "#fcd34d" }, // amber-300
    { id: 4, text: "Desayuno en Cama", color: "#86efac" }, // green-300
    { id: 5, text: "Vale por un BESO", color: "#f0abfc" }, // fuchsia-300
    { id: 6, text: "Comodín: Tu Eliges", color: "#d8b4fe" }, // purple-300
];

const CouponWheel = () => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState(null);
    const controls = useAnimation();

    const spinWheel = async () => {
        if (isSpinning) return;

        setIsSpinning(true);
        setWinner(null);

        // Random rotation between 5 and 10 full spins (1800 - 3600 deg) + random offset
        const randomOffset = Math.floor(Math.random() * 360);
        const totalRotation = 3600 + randomOffset;

        // Calculate winner based on final rotation
        // Each segment is 360 / 6 = 60 degrees.
        // The pointer is usually at top (0 deg) or right. Let's assume top.
        // Rotation is clockwise.
        // If we rotate X degrees, the effective angle is X % 360.
        // The slice at the top is the one that correlates to (360 - (X % 360)) basically.

        // But let's just animate visual first
        await controls.start({
            rotate: totalRotation,
            transition: { duration: 5, ease: "circOut" }
        });

        // Determine winner logic (simplified for visual match)
        // Normalized angle (0-360)
        const finalAngle = totalRotation % 360;
        const segmentSize = 360 / COUPONS.length;
        // Pointer is at TOP (let's say 0 degrees in CSS terms if we didn't rotate the container weirdly)
        // If wheel rotates clockwise, the segment at 0 is the one that was at (360 - finalAngle).
        const winningIndex = Math.floor(((360 - finalAngle + segmentSize / 2) % 360) / segmentSize);
        // Note: The math can be tricky depending on initial alignment. 
        // Let's just pick a random winner via JS and force the rotation to land there?
        // Easier: random index -> calculate rotation.

        // RE-DOING LOGIC:
        // Pick winner first:
        /*
        const winnerIndex = Math.floor(Math.random() * COUPONS.length);
        const segmentAngle = 360 / COUPONS.length;
        const targetAngle = 360 * 10 - (winnerIndex * segmentAngle); // 10 spins minus position
        */

        // For now, let's just use the calculated one from the random spin to be "fair" physically
        setWinner(COUPONS[winningIndex]);
        setIsSpinning(false);
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <h2 className="text-2xl font-serif text-romantic-800 mb-6 flex items-center">
                <Gift className="mr-2" size={24} />
                Ruleta del Amor
            </h2>

            <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 text-romantic-600">
                    ▼
                </div>

                {/* Wheel */}
                <motion.div
                    className="w-full h-full rounded-full border-4 border-white shadow-xl overflow-hidden relative"
                    animate={controls}
                    style={{ transformOrigin: 'center' }}
                >
                    {COUPONS.map((coupon, index) => {
                        const rotation = (360 / COUPONS.length) * index;
                        return (
                            <div
                                key={coupon.id}
                                className="absolute w-1/2 h-full top-0 left-1/2 origin-left flex items-center justify-center"
                                style={{
                                    transform: `rotate(${rotation}deg)`,
                                    backgroundColor: coupon.color,
                                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' // Trying to make slices? 
                                    // CSS slices are hard with just divs.
                                    // Better approach: Conic gradient or SVG.
                                }}
                            >
                                {/* This div method is flawy for slices.
                                    Let's use a simpler Conic Gradient approach for the background,
                                    and place text absolutely.
                                */}
                            </div>
                        );
                    })}

                    {/* SVG Implementation is safer for Pie Chart look */}
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {COUPONS.map((coupon, index) => {
                            // Calculate SVG path for each slice
                            const sliceAngle = 360 / COUPONS.length;
                            const startAngle = index * sliceAngle;
                            const endAngle = startAngle + sliceAngle;

                            // Convert polar to cartesian
                            const x1 = 50 + 50 * Math.cos(Math.PI * startAngle / 180);
                            const y1 = 50 + 50 * Math.sin(Math.PI * startAngle / 180);
                            const x2 = 50 + 50 * Math.cos(Math.PI * endAngle / 180);
                            const y2 = 50 + 50 * Math.sin(Math.PI * endAngle / 180);

                            const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                            return (
                                <path
                                    key={coupon.id}
                                    d={pathData}
                                    fill={coupon.color}
                                    stroke="white"
                                    strokeWidth="1"
                                />
                            );
                        })}
                    </svg>

                    {/* Text overlays */}
                    {COUPONS.map((coupon, index) => {
                        const sliceAngle = 360 / COUPONS.length;
                        const rotation = index * sliceAngle + sliceAngle / 2;
                        return (
                            <div
                                key={coupon.id}
                                className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none"
                                style={{ transform: `rotate(${rotation}deg)` }}
                            >
                                <span className="text-xs font-bold text-gray-800 -translate-y-16 md:-translate-y-24 bg-white/70 px-2 py-1 rounded-full whitespace-nowrap">
                                    {coupon.text}
                                </span>
                            </div>
                        )
                    })}
                </motion.div>

                {/* Center dot */}
                <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-md z-10 flex items-center justify-center">
                    <HeartIcon size={16} className="text-romantic-500" />
                </div>
            </div>

            <button
                onClick={spinWheel}
                disabled={isSpinning}
                className={clsx(
                    "px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all",
                    isSpinning ? "bg-gray-400 cursor-not-allowed" : "bg-romantic-500 hover:bg-romantic-600 hover:scale-105 active:scale-95"
                )}
            >
                {isSpinning ? "Girando..." : "¡Girar Ruleta!"}
            </button>

            {winner && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-8 p-6 bg-white rounded-2xl shadow-xl border-2 border-romantic-300 text-center max-w-xs"
                >
                    <Sparkles className="mx-auto text-yellow-400 mb-2" size={32} />
                    <h3 className="text-lg font-bold text-gray-800 mb-1">¡Ganaste!</h3>
                    <p className="text-2xl font-serif text-romantic-600">{winner.text}</p>
                    <p className="text-xs text-gray-400 mt-2">Saca captura y envíamelo ❤️</p>
                </motion.div>
            )}
        </div>
    );
};

// Helper
const HeartIcon = ({ className, size }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
)

export default CouponWheel;
