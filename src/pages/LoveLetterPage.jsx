import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Envelope from '../components/letter/Envelope';

const LETTER_CONTENT = {
    greeting: "Marti,",
    body: `Este era tu regalo para el 14 de febrero, lamentablemente no estoy en condiciones de escribirte cosas lindas por las cosas que hice.
    queria que al menos lo veas por que me costo mucho y hay mucho amor en este proyectito.
    Cambies o no de opinion sos y siempre vas a ser el amor de mi vida. estoy tan arrepentido de todo lo que hice que me da mucha verguenza mostrarte esto, me dijiste que nisiquiera te hacia ilusion pero es una pequeña muestra de amor de mi hacia vos.
    No me quiero hacer la victima por que no soy ningun santo, pero si te pido perdon por todo lo que hice y por todo el daño que te cause.
    solo quiero que sepas que voy a esperarte y esforzarme para ser la persona que mereces.
    te amo muchisimo y siempre te voy a amar, ojala algun dia puedas perdonarme y volver a estar juntos.`,
    closing: "Te amo infinitamente,",
    signature: "Rama"
};

const LoveLetterPage = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center pt-8 px-4 pb-32 overflow-y-auto">
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

            <h1 className="text-3xl font-serif text-romantic-800 mb-2 text-center">
                Tengo algo para vos...
            </h1>

            <p className="text-sm text-gray-400 mb-10 text-center">
                Una carta escrita con el corazón
            </p>

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
