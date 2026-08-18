import { supabase } from './supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export const isPushSupported = () =>
    'serviceWorker' in navigator && 'PushManager' in window && !!VAPID_PUBLIC_KEY;

export const getPushSubscriptionStatus = async () => {
    if (!isPushSupported()) return 'unsupported';
    if (Notification.permission === 'denied') return 'denied';
    try {
        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();
        return existing ? 'subscribed' : 'not-subscribed';
    } catch {
        return 'not-subscribed';
    }
};

export const subscribeToPush = async (userId) => {
    if (!isPushSupported()) throw new Error('Push no soportado en este navegador');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Permiso de notificaciones denegado');

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
    }

    const json = subscription.toJSON();
    const { error } = await supabase.from('push_subscriptions').upsert(
        {
            user_id: userId,
            endpoint: json.endpoint,
            p256dh: json.keys.p256dh,
            auth: json.keys.auth,
        },
        { onConflict: 'endpoint' }
    );
    if (error) throw error;

    return subscription;
};
