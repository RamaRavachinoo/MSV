import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Wind, Thermometer, Eye } from 'lucide-react';

const WEATHER_EMOJIS = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '🌨️', '13n': '🌨️',
    '50d': '🌫️', '50n': '🌫️',
};

const getTimeGradient = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'from-sky-100 to-blue-200'; // Morning
    if (hour >= 12 && hour < 18) return 'from-amber-100 to-orange-200'; // Afternoon
    if (hour >= 18 && hour < 21) return 'from-orange-200 to-purple-200'; // Evening
    return 'from-indigo-200 to-purple-300'; // Night
};

const WeatherWidget = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchWeather();
    }, []);

    const fetchWeather = async () => {
        // Check session cache
        const cached = sessionStorage.getItem('weather_data');
        if (cached) {
            const parsed = JSON.parse(cached);
            // Cache valid for 30 minutes
            if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
                if (parsed.data) {
                    setWeather(parsed.data);
                }
                setLoading(false);
                return;
            }
        }

        // Check if we recently failed (avoid spamming)
        const lastFail = sessionStorage.getItem('weather_fail');
        if (lastFail && Date.now() - Number(lastFail) < 10 * 60 * 1000) {
            setLoading(false);
            return;
        }

        try {
            const key = import.meta.env.VITE_WEATHER_API_KEY;
            if (!key) { setLoading(false); return; }

            const res = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=Buenos+Aires,AR&units=metric&lang=es&appid=${key}`
            );
            if (!res.ok) {
                sessionStorage.setItem('weather_fail', String(Date.now()));
                throw new Error(`Weather API ${res.status}`);
            }
            const data = await res.json();

            setWeather(data);
            sessionStorage.setItem('weather_data', JSON.stringify({ data, timestamp: Date.now() }));
            sessionStorage.removeItem('weather_fail');
        } catch (e) {
            console.warn('Weather unavailable:', e.message);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={`glass-card rounded-2xl p-4 bg-gradient-to-br ${getTimeGradient()} animate-pulse`}>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/30" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-20 bg-white/30 rounded" />
                        <div className="h-3 w-32 bg-white/20 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !weather) return null;

    const icon = weather.weather?.[0]?.icon || '01d';
    const emoji = WEATHER_EMOJIS[icon] || '🌡️';
    const temp = Math.round(weather.main?.temp);
    const feelsLike = Math.round(weather.main?.feels_like);
    const description = weather.weather?.[0]?.description || '';
    const humidity = weather.main?.humidity;
    const windSpeed = Math.round(weather.wind?.speed * 3.6); // m/s to km/h

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`glass-card rounded-2xl p-4 bg-gradient-to-br ${getTimeGradient()} border border-white/40`}
        >
            <div className="flex items-center gap-4">
                {/* Big emoji + temp */}
                <div className="flex items-center gap-2">
                    <span className="text-4xl drop-shadow-sm">{emoji}</span>
                    <div>
                        <span className="text-3xl font-bold text-gray-800">{temp}°</span>
                        <p className="text-xs text-gray-600 capitalize font-medium -mt-0.5">{description}</p>
                    </div>
                </div>

                {/* Details */}
                <div className="ml-auto flex flex-col gap-1.5 text-right">
                    <div className="flex items-center gap-1.5 justify-end text-xs text-gray-600">
                        <Thermometer size={12} />
                        <span>Sensación {feelsLike}°</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end text-xs text-gray-600">
                        <Droplets size={12} />
                        <span>{humidity}%</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end text-xs text-gray-600">
                        <Wind size={12} />
                        <span>{windSpeed} km/h</span>
                    </div>
                </div>
            </div>

            <p className="text-[10px] text-gray-400 mt-2 text-right uppercase tracking-wider font-medium">
                Buenos Aires
            </p>
        </motion.div>
    );
};

export default WeatherWidget;
