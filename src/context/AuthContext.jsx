import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDevMode, setIsDevMode] = useState(false); // Default to false to use Real Supabase

    useEffect(() => {
        // Check for active Supabase session
        const checkSession = async () => {
            // If we already manually logged in via dev mode, skip
            const devUser = localStorage.getItem('dev_user');
            if (devUser) {
                setUser(JSON.parse(devUser));
                setLoading(false);
                return;
            }

            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(session.user);
                }
            } catch (error) {
                console.log('Supabase check skipped or failed', error);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(session.user);
                localStorage.removeItem('dev_user'); // Clear dev user if real login happens
            } else if (!localStorage.getItem('dev_user')) {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loginAsDevUser = (role) => {
        const mockUser = {
            id: role === 'admin' ? 'admin-123' : 'martina-123',
            email: role === 'admin' ? 'ramaravachino00@gmail.com' : 'martina@love.com',
            user_metadata: {
                full_name: role === 'admin' ? 'Rama' : 'Martina',
                role: role
            }
        };
        setUser(mockUser);
        localStorage.setItem('dev_user', JSON.stringify(mockUser));
    };

    const logout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('dev_user');
        setUser(null);
    };

    const loginWithPassword = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginAsDevUser, loginWithPassword, logout, isDevMode }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
