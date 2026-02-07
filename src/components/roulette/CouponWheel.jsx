import React, { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Gift, Sparkles } from 'lucide-react';
import clsx from 'clsx';

const COUPONS = [
    { id: 1, text: "Noche de Hotel", color: "#fca5a5" },
    { id: 2, text: "Masaje con Final Feliz", color: "#c4b5fd" },
    { id: 3, text: "Desayuno en la Cama", color: "#fcd34d" },
    { id: 4, text: "Sesión de Fotos Hot", color: "#f9a8d4" },
    { id: 5, text: "Cena a la Luz de Velas", color: "#93c5fd" },
    { id: 6, text: "Día de Spa en Casa", color: "#86efac" },
    { id: 7, text: "Striptease Privado", color: "#fda4af" },
    { id: 8, text: "Comodín: Vos Elegís", color: "#d8b4fe" },
];

const CouponWheel = () => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState(null);
    const controls = useAnimation();

    const spinWheel = async () => {
        if (isSpinning) return;

        setIsSpinning(true);
        setWinner(null);

        const randomOffset = Math.floor(Math.random() * 360);
        const totalRotation = 3600 + randomOffset;

        await controls.start({
            rotate: totalRotation,
            transition: { duration: 5, ease: "circOut" }
        });

        const finalAngle = totalRotation % 360;
        const segmentSize = 360 / COUPONS.length;
        const winningIndex = Math.floor(((360 - finalAngle + segmentSize / 2) % 360) / segmentSize);

        setWinner(COUPONS[winningIndex]);
        setIsSpinning(false);
    };

    const sliceAngle = 360 / COUPONS.length;

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <h2 className="text-2xl font-serif text-romantic-800 mb-6 flex items-center">
                <Gift className="mr-2" size={24} />
                Ruleta del Amor
            </h2>

            <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 text-romantic-600 text-2xl">
                    ▼
                </div>

                {/* Wheel */}
                <motion.div
                    className="w-full h-full rounded-full border-4 border-white shadow-xl overflow-hidden relative"
                    animate={controls}
                    style={{ transformOrigin: 'center' }}
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {COUPONS.map((coupon, index) => {
                            const startAngle = index * sliceAngle;
                            const endAngle = startAngle + sliceAngle;

                            const x1 = 50 + 50 * Math.cos(Math.PI * startAngle / 180);
                            const y1 = 50 + 50 * Math.sin(Math.PI * startAngle / 180);
                            const x2 = 50 + 50 * Math.cos(Math.PI * endAngle / 180);
                            const y2 = 50 + 50 * Math.sin(Math.PI * endAngle / 180);

                            const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                            const midAngle = startAngle + sliceAngle / 2;
                            const textRadius = 33;
                            const tx = 50 + textRadius * Math.cos(Math.PI * midAngle / 180);
                            const ty = 50 + textRadius * Math.sin(Math.PI * midAngle / 180);

                            // Split text into two lines if longer than 10 chars
                            const words = coupon.text.split(' ');
                            let line1 = '';
                            let line2 = '';
                            if (words.length <= 2) {
                                line1 = words[0] || '';
                                line2 = words.slice(1).join(' ');
                            } else {
                                const mid = Math.ceil(words.length / 2);
                                line1 = words.slice(0, mid).join(' ');
                                line2 = words.slice(mid).join(' ');
                            }

                            return (
                                <g key={coupon.id}>
                                    <path
                                        d={pathData}
                                        fill={coupon.color}
                                        stroke="white"
                                        strokeWidth="0.5"
                                    />
                                    <text
                                        x={tx}
                                        y={ty}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}
                                        fontSize="3"
                                        fontWeight="700"
                                        fill="#1f2937"
                                    >
                                        <tspan x={tx} dy="-1.8">{line1}</tspan>
                                        <tspan x={tx} dy="3.6">{line2}</tspan>
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </motion.div>

                {/* Center dot */}
                <div className="absolute top-1/2 left-1/2 w-10 h-10 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg z-10 flex items-center justify-center">
                    <HeartIcon size={18} className="text-romantic-500" />
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
);

export default CouponWheel;
