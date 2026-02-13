import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';

const RoulettePage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-24">
            {/* Back button */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
                <ArrowLeft size={18} />
                <span className="text-sm">Volver</span>
            </button>

            <div className="text-center max-w-sm">
                <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
                    <Construction size={36} className="text-amber-500" />
                </div>

                <h1 className="text-2xl font-serif text-gray-800 mb-3">
                    Ruleta en construcción 🎰
                </h1>

                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                    Esta sección todavía no está disponible. Pronto vas a poder girar la ruleta y ganar vales especiales. 💝
                </p>

                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-romantic-500 text-white font-medium rounded-xl hover:bg-romantic-600 active:scale-95 transition-all shadow-lg shadow-romantic-200"
                >
                    Volver al inicio
                </button>
            </div>
        </div>
    );
};

export default RoulettePage;
