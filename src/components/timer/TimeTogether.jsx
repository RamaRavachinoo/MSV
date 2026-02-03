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

    const TimeUnit = ({ value, label }) => (
        <div className="flex flex-col items-center">
            <motion.div
                key={value}
                initial={{ y: -5, opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl md:text-3xl font-bold text-romantic-600 font-serif"
            >
                {String(value).padStart(2, '0')}
            </motion.div>
            <span className="text-[10px] md:text-xs uppercase tracking-wider text-gray-500">{label}</span>
        </div>
    );

    return (
        <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-sm border border-romantic-200 w-full">
            <h2 className="text-center font-serif text-xl text-romantic-800 mb-4">Juntos creando historias por...</h2>

            <div className="grid grid-cols-3 gap-y-4 gap-x-2 md:flex md:justify-center md:gap-8">
                {time.years > 0 && <TimeUnit value={time.years} label="Años" />}
                <TimeUnit value={time.months} label="Meses" />
                <TimeUnit value={time.days} label="Días" />
                <TimeUnit value={time.hours} label="Hs" />
                <TimeUnit value={time.minutes} label="Min" />
                <TimeUnit value={time.seconds} label="Seg" />
            </div>

            <p className="text-center text-xs text-romantic-400 mt-4 italic font-serif">
                Desde el 31 de Mayo de 2025
            </p>
        </div>
    );
};

export default TimeTogether;
