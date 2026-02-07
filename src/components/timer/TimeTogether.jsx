import React, { useState, useEffect } from 'react';
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { motion } from 'framer-motion';

const TimeTogether = () => {
    // Start date: May 31, 2025 (Assuming this is the correct past date based on context)
    const startDate = new Date(2025, 4, 31); // Month is 0-indexed: 4 = May

    const [time, setTime] = useState({
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date();

            // Basic calculation (not precise total duration decomposition, but intuitive "X years, Y months, Z days")
            // Actually, for a precise countdown like timer, we need strictly decomposable units.
            // But date-fns intervalToDuration is better for this.

            // Let's implement a manual calculation to be safe and accurate for the "rolling" effect
            let diff = now - startDate;

            // This approach below is simple but effective for "Total time passed"
            const years = differenceInYears(now, startDate);
            const months = differenceInMonths(now, startDate) % 12;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24)) % 30.44; // Approx days rest
            // Actually, let's clearer specific logic

            // Recalculating strictly:
            // We want: 0 Years, 8 Months, 2 Days... etc.

            // Create dates to subtract parts
            let tempDate = new Date(startDate);
            tempDate.setFullYear(tempDate.getFullYear() + years);

            let calcMonths = differenceInMonths(now, tempDate);
            tempDate.setMonth(tempDate.getMonth() + calcMonths);

            let calcDays = differenceInDays(now, tempDate);
            tempDate.setDate(tempDate.getDate() + calcDays);

            let calcHours = differenceInHours(now, tempDate);
            tempDate.setHours(tempDate.getHours() + calcHours);

            let calcMinutes = differenceInMinutes(now, tempDate);
            tempDate.setMinutes(tempDate.getMinutes() + calcMinutes);

            let calcSeconds = differenceInSeconds(now, tempDate);

            setTime({
                years,
                months: calcMonths,
                days: calcDays,
                hours: calcHours,
                minutes: calcMinutes,
                seconds: calcSeconds
            });
        };

        const timer = setInterval(calculateTime, 1000);
        calculateTime(); // Initial call

        return () => clearInterval(timer);
    }, []);

    const TimeUnit = ({ value, label, isSeconds }) => (
        <div className="flex flex-col items-center relative group">
            <div className={`
                relative w-16 h-16 md:w-20 md:h-20 
                flex items-center justify-center 
                rounded-2xl 
                bg-white/60 backdrop-blur-md 
                border border-white/80 
                shadow-sm
                group-hover:scale-105 transition-transform duration-300
                ${isSeconds ? 'border-rose-300 shadow-rose-200/50' : ''}
            `}>
                <motion.div
                    key={value}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-rose-600 to-pink-500 font-serif"
                >
                    {String(value).padStart(2, '0')}
                </motion.div>

                {/* Decorative dots for seconds */}
                {isSeconds && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </span>
                )}
            </div>
            <span className="text-[10px] md:text-xs uppercase tracking-widest text-gray-400 mt-2 font-medium">{label}</span>
        </div>
    );

    return (
        <div className="glass-card rounded-[2rem] p-6 md:p-8 w-full overflow-hidden relative">
            {/* Background gloss effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-200/30 to-rose-200/30 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="h-px w-8 bg-rose-200"></span>
                    <h2 className="text-center font-serif text-lg text-rose-800 tracking-wide">Juntos creando historias</h2>
                    <span className="h-px w-8 bg-rose-200"></span>
                </div>

                <div className="grid grid-cols-3 gap-y-6 gap-x-4 md:flex md:justify-between md:gap-4 px-2">
                    {time.years > 0 && <TimeUnit value={time.years} label="Años" />}
                    <TimeUnit value={time.months} label="Meses" />
                    <TimeUnit value={time.days} label="Días" />
                    <TimeUnit value={time.hours} label="Hs" />
                    <TimeUnit value={time.minutes} label="Min" />
                    <TimeUnit value={time.seconds} label="Seg" isSeconds />
                </div>

                <div className="mt-6 text-center">
                    <p className="text-xs text-rose-400/80 font-medium tracking-wider uppercase">
                        Desde el 31 de Mayo de 2025
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TimeTogether;
