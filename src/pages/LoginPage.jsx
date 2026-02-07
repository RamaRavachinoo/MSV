import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Key, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage = () => {
    const { loginWithPassword } = useAuth();
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null); // 'user' or 'admin'
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const USERS = {
        user: { email: 'martina@love.com', name: 'Martina', greeting: 'Hola mi amor ❤️' },
        admin: { email: 'ramaravachino00@gmail.com', name: 'Rama', greeting: 'Bienvenido Admin 🛠️' }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await loginWithPassword(USERS[selectedRole].email, password);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError('Contraseña incorrecta, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-romantic-50 to-white px-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-6">
                    <Heart className="text-romantic-500 fill-romantic-500" size={48} />
                </div>
                <h1 className="text-4xl font-serif text-romantic-900 mb-2">Martina & Rama</h1>
                <p className="text-gray-500">Nuestro espacio personal</p>
            </motion.div>

            <AnimatePresence mode="wait">
                {!selectedRole ? (
                    <motion.div
                        key="selection"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="w-full max-w-sm space-y-4"
                    >
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedRole('user')}
                            className="w-full py-4 px-6 bg-romantic-500 text-white rounded-2xl shadow-lg shadow-romantic-200/50 flex items-center justify-between group"
                        >
                            <div className="flex flex-col items-start">
                                <span className="font-bold text-lg">Soy Martina ❤️</span>
                                <span className="text-romantic-100 text-xs text-left">Ingresar a mi regalo</span>
                            </div>
                            <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                        </motion.button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-transparent text-gray-400">Admin Zone</span>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedRole('admin')}
                            className="w-full py-3 px-6 bg-white border border-gray-200 text-gray-600 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                        >
                            <Key size={16} />
                            <span>Soy Rama (Admin)</span>
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.form
                        key="login"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl"
                        onSubmit={handleLogin}
                    >
                        <h2 className="text-2xl font-serif text-romantic-800 mb-6 text-center">
                            {USERS[selectedRole].greeting}
                        </h2>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-romantic-500 outline-none transition-all"
                                placeholder="Ingresa tu clave..."
                                autoFocus
                            />
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded-lg">{error}</p>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedRole(null);
                                    setPassword('');
                                    setError('');
                                }}
                                className="px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                Volver
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !password}
                                className="flex-1 bg-romantic-500 text-white py-3 rounded-lg font-medium hover:bg-romantic-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Ingresar'}
                                {!loading && <ArrowRight size={20} />}
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <p className="mt-12 text-xs text-gray-400 text-center max-w-xs">
                Este sitio está protegido con mucho amor. Si no eres uno de nosotros, ¡shhh! 🤫
            </p>
        </div>
    );
};

export default LoginPage;
