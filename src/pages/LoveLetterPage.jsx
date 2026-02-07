import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Envelope from '../components/letter/Envelope';

const LETTER_CONTENT = {
    greeting: "Mi amor,",
    body: `Acá va tu carta. Todavía estoy buscando las palabras perfectas
para decirte todo lo que siento...

Pero mientras tanto, quiero que sepas que cada día
que paso con vos es el mejor de mi vida.

Pronto vas a poder leer todo lo que mi corazón
quiere decirte.`,
    closing: "Te amo infinitamente,",
    signature: "Rama"
};

const LoveLetterPage = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center py-8 px-4">
            {/* Back button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => navigate('/')}
                className="self-start mb-8 flex items-center gap-2 text-sm text-gray-400 hover:text-romantic-500 transition-colors"
            >
                <ArrowLeft size={16} />
                Volver
            </motion.button>

            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-3xl font-serif text-romantic-800 mb-2 text-center"
            >
                Tengo algo para vos...
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-gray-400 mb-10 text-center"
            >
                Una carta escrita con el corazón
            </motion.p>

            <Envelope isOpen={isOpen} onOpen={() => setIsOpen(true)}>
                <div className="p-6 min-h-[280px]">
                    <p className="font-serif italic text-romantic-600 text-xl mb-4">
                        {LETTER_CONTENT.greeting}
                    </p>
                    <p className="font-serif text-gray-700 leading-relaxed whitespace-pre-line text-sm md:text-base">
                        {LETTER_CONTENT.body}
                    </p>
                    <div className="mt-8 border-t border-romantic-100 pt-4">
                        <p className="font-serif text-romantic-600 italic">
                            {LETTER_CONTENT.closing}
                        </p>
                        <p className="font-serif text-romantic-800 font-bold text-2xl mt-2">
                            {LETTER_CONTENT.signature}
                        </p>
                    </div>
                </div>
            </Envelope>

            {!isOpen && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="text-sm text-gray-400 mt-10 animate-bounce-slow"
                >
                    Tocá el corazón para abrir
                </motion.p>
            )}

            {isOpen && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    onClick={() => setIsOpen(false)}
                    className="mt-10 text-sm text-romantic-400 hover:text-romantic-600 underline underline-offset-4 transition-colors"
                >
                    Cerrar sobre
                </motion.button>
            )}
        </div>
    );
};

export default LoveLetterPage;
