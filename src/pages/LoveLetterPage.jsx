import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Envelope from '../components/letter/Envelope';

const LETTER_CONTENT = {
    greeting: "Marti,",
    body: `Esta es la tercera versión de la carta, ya te imaginarás las etapas por las que pasé escribiéndola.

No quiero ser repetitivo, soy completamente consciente de todo lo que pasó. Te juré mil veces que jamás vamos a volver a pasar por algo igual; voy a dar absolutamente todo de mí para mejorar como novio y ser el hombre que te merecés.

Se me ocurrió hacerte esta página para demostrarte un poquito de todo lo que te amo. Le puse mucho tiempo y corazón a este proyecto, y espero de verdad que te guste. Me encantaría que me dejes seguir construyéndola y mejorándola para vos, para que sea un espacio útil y nuestro.

Esta página va a perdurar con el tiempo, como mi amor por vos. Cada vez que la veas quiero que te acuerdes de cuánto te amo y ojalá te motive a seguir construyendo cosas conmigo.

Sos lo mejor que me pasó en la vida y me llena el alma que me permitas festejar este día con vos. La verdad es que me hacés sentir el hombre más afortunado del mundo y te agradezco por elegirme una y otra vez.

Quiero que esta página sea el testigo de todo lo que nos queda por vivir: de los viajes que todavía no hicimos, de las risas que nos faltan y de cada momento que elijamos pasar uno al lado del otro. Este detalle es solo un pedacito de todo lo que te merecés. Te amo con todo lo que soy, hoy y todos los días. Feliz San Valentín, Marti.
    `,
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
