import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isPushSupported, getPushSubscriptionStatus, subscribeToPush } from '../../lib/push';

const NotificationOptIn = () => {
    const { user } = useAuth();
    const [status, setStatus] = useState('checking');
    const [loading, setLoading] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        getPushSubscriptionStatus().then(setStatus);
    }, []);

    const handleActivate = async () => {
        setLoading(true);
        try {
            await subscribeToPush(user.id);
            setStatus('subscribed');
        } catch (e) {
            console.error('Error subscribing to push:', e);
            setStatus(Notification.permission === 'denied' ? 'denied' : 'not-subscribed');
        } finally {
            setLoading(false);
        }
    };

    if (dismissed || status !== 'not-subscribed' || !user) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass-card rounded-2xl p-4 flex items-center gap-3 border border-romantic-200/50"
            >
                <div className="w-10 h-10 rounded-full bg-romantic-100 flex items-center justify-center text-romantic-500 shrink-0">
                    <Bell size={18} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">Activá los avisos</p>
                    <p className="text-xs text-gray-500">Para no perderte exámenes ni cuentas por vencer.</p>
                </div>
                <button
                    onClick={handleActivate}
                    disabled={loading}
                    className="text-xs font-bold bg-romantic-500 text-white px-3 py-2 rounded-xl shadow-sm hover:bg-romantic-600 transition-colors disabled:opacity-50 shrink-0"
                >
                    {loading ? '...' : 'Activar'}
                </button>
                <button onClick={() => setDismissed(true)} className="p-1 text-gray-300 hover:text-gray-500 shrink-0">
                    <X size={16} />
                </button>
            </motion.div>
        </AnimatePresence>
    );
};

export default NotificationOptIn;
