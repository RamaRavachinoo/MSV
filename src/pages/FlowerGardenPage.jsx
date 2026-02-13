import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './FlowerGardenPage.css';

// ===================== CONFIG =====================

const FLOWER_PALETTES = [
    { petals: ['#ff6b8a', '#ff8fa3', '#ffb3c1', '#ffc8dd'], center: '#ffe066', glow: 'rgba(255,107,138,0.35)', stem: '#2ecc71' },
    { petals: ['#ffd60a', '#ffea00', '#ffe066', '#fff3b0'], center: '#fff8dc', glow: 'rgba(255,214,10,0.4)', stem: '#2bb85a' },
    { petals: ['#b388ff', '#ce93d8', '#e1bee7', '#f3e5f5'], center: '#fff59d', glow: 'rgba(179,136,255,0.35)', stem: '#388e3c' },
    { petals: ['#64b5f6', '#90caf9', '#bbdefb', '#e3f2fd'], center: '#fff9c4', glow: 'rgba(100,181,246,0.35)', stem: '#43a047' },
    { petals: ['#f48fb1', '#f8bbd0', '#fce4ec', '#fff0f5'], center: '#ffecb3', glow: 'rgba(244,143,177,0.4)', stem: '#2e7d32' },
    { petals: ['#ff8a65', '#ffab91', '#ffccbc', '#fbe9e7'], center: '#fff9c4', glow: 'rgba(255,138,101,0.35)', stem: '#33a65e' },
    { petals: ['#9c27b0', '#ba68c8', '#ce93d8', '#e1bee7'], center: '#ffd54f', glow: 'rgba(156,39,176,0.35)', stem: '#2e7d32' },
    { petals: ['#ef5350', '#e57373', '#ef9a9a', '#ffcdd2'], center: '#fff176', glow: 'rgba(239,83,80,0.35)', stem: '#388e3c' },
    { petals: ['#ffee58', '#fff176', '#fff59d', '#fff9c4'], center: '#ffe0b2', glow: 'rgba(255,238,88,0.45)', stem: '#2e9b55' },
    { petals: ['#ec407a', '#f06292', '#f48fb1', '#f8bbd0'], center: '#fff9c4', glow: 'rgba(236,64,122,0.35)', stem: '#43a047' },
    { petals: ['#ffab40', '#ffcc02', '#ffe082', '#fff8e1'], center: '#ffffff', glow: 'rgba(255,171,64,0.4)', stem: '#2e7d32' },
    { petals: ['#e040fb', '#ea80fc', '#f3b8ff', '#fce4ec'], center: '#fff59d', glow: 'rgba(224,64,251,0.35)', stem: '#388e3c' },
];

const PAPER_COLORS = [
    { main: '#e6cfb3', fold: '#d8c0a4', shadow: '#c4aa8e', accent: '#bfa083', ribbon: '#e76f51', tag: '#f4eadd' }, // Main Kraft
    { main: '#eddcd2', fold: '#e0cec5', shadow: '#d0bba0', accent: '#c9b896', ribbon: '#d08c60', tag: '#fffbf0' }, // Light Kraft
    { main: '#f5ebe0', fold: '#e3d5ca', shadow: '#d5bdaf', accent: '#d6ccc2', ribbon: '#ddbea9', tag: '#ffffff' }, // White Paper
];

const PETAL_SHAPES = ['ellipse', 'rounded', 'pointed', 'wide', 'teardrop'];

const MESSAGES = [
    { title: 'Para que tengas flores siempre que quieras.', subtitle: 'Con todo mi amor 💐' },
    { title: 'Sé que te gustan las flores, así que...', subtitle: 'Acá van todas las que quieras ✨' },
    { title: 'Un ramito para arrancarte una sonrisa.', subtitle: 'Vení que te hago otro 🌻' },
    { title: 'No se marchitan, como las ganas de verte bebe ;).', subtitle: 'Apretá de nuevo y te regalo más 🌹' },
    { title: 'Hoy te toca un ramo así de lindo.', subtitle: 'Mañana te toca otro mejor 💕' },
];

// ===================== HELPERS =====================

const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Predefined slot positions so flowers spread nicely
// Each slot: { leftPercent, stemHeight range, angle, zIndex }
const FLOWER_SLOTS = [
    // Back row (tall, middle area)
    { left: 30, hMin: 180, hMax: 230, angle: -15, z: 1 },
    { left: 40, hMin: 195, hMax: 245, angle: -5, z: 1 },
    { left: 50, hMin: 200, hMax: 250, angle: 0, z: 1 },
    { left: 60, hMin: 195, hMax: 245, angle: 5, z: 1 },
    { left: 70, hMin: 180, hMax: 230, angle: 15, z: 2 },
    // Middle row
    { left: 22, hMin: 140, hMax: 180, angle: -24, z: 3 },
    { left: 33, hMin: 155, hMax: 195, angle: -12, z: 3 },
    { left: 44, hMin: 160, hMax: 200, angle: -4, z: 3 },
    { left: 56, hMin: 160, hMax: 200, angle: 4, z: 3 },
    { left: 67, hMin: 155, hMax: 195, angle: 12, z: 3 },
    { left: 78, hMin: 140, hMax: 180, angle: 24, z: 4 },
    // Front row (shorter, wider spread)
    { left: 15, hMin: 130, hMax: 160, angle: -32, z: 5 },
    { left: 28, hMin: 135, hMax: 170, angle: -18, z: 5 },
    { left: 40, hMin: 140, hMax: 180, angle: -8, z: 6 },
    { left: 50, hMin: 145, hMax: 180, angle: 0, z: 6 },
    { left: 60, hMin: 140, hMax: 175, angle: 8, z: 6 },
    { left: 72, hMin: 135, hMax: 170, angle: 18, z: 5 },
    { left: 85, hMin: 130, hMax: 160, angle: 32, z: 5 },
];

function generateFlower(index, slot) {
    const palette = pick(FLOWER_PALETTES);
    const shape = pick(PETAL_SHAPES);
    const petalCount = randInt(5, 8);
    const headSize = randInt(40, 65);
    const stemHeight = randInt(slot.hMin, slot.hMax);
    const growDelay = 0.12 * index;

    return {
        id: `f-${index}-${Date.now()}-${Math.random()}`,
        palette,
        shape,
        petalCount,
        headSize,
        stemHeight,
        stemWidth: randInt(3, 5),
        leftPercent: slot.left + rand(-3, 3),
        angle: slot.angle + rand(-3, 3),
        z: slot.z,
        growDelay,
        bloomDelay: growDelay + 0.5,
        swaySpeed: rand(4, 7),
        swayAmount: rand(1, 2.5),
        swayDelay: rand(0, 2),
        petalW: randInt(14, 22),
        petalH: randInt(22, 35),
        centerSize: randInt(10, 16),
        leafLeft: { top: randInt(35, 60), size: randInt(14, 24), delay: growDelay + 0.3 },
        leafRight: { top: randInt(18, 42), size: randInt(14, 24), delay: growDelay + 0.4 },
    };
}

function generateGarden() {
    const count = randInt(11, 16);
    // Pick random slots without repeating
    const shuffled = [...FLOWER_SLOTS].sort(() => Math.random() - 0.5);
    const slots = shuffled.slice(0, count);
    // Sort by z so back flowers render first
    slots.sort((a, b) => a.z - b.z);
    return slots.map((slot, i) => generateFlower(i, slot));
}

function generateFireflies(count = 25) {
    const colors = ['#fffbe6', '#ffeaa7', '#b2f5ea', '#fbc2eb', '#a8edea', '#fff5f5', '#ffd6e0'];
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: rand(2, 98),
        y: rand(2, 80),
        size: rand(2, 5),
        color: pick(colors),
        dur: rand(4, 10),
        delay: rand(0, 8),
        dx: rand(-25, 25),
        dy: rand(-30, 10),
    }));
}

// Filler greenery
function generateFillerGreens(count = 18) {
    const types = ['leaf', 'spike', 'fern'];
    return Array.from({ length: count }, (_, i) => {
        // Reduced spread to prevent sticking out of the sides
        const spread = 45;
        const leftPos = 27 + (spread / (count - 1)) * i + rand(-5, 5);

        return {
            id: i,
            type: pick(types),
            // Clamp to keep inside the paper area
            left: Math.max(25, Math.min(75, leftPos)),
            height: randInt(50, 120),
            width: randInt(8, 20),
            angle: (leftPos - 50) * 0.5 + rand(-8, 8),
            color: pick(['#2ecc71', '#27ae60', '#229954', '#1e8449', '#16a34a', '#22c55e', '#34d399']),
            delay: rand(0, 0.5),
            z: randInt(0, 7),
        };
    });
}

// ===================== COMPONENTS =====================

const Fireflies = React.memo(({ data }) => (
    <div className="fg-fireflies">
        {data.map((f) => (
            <div
                key={f.id}
                className="fg-firefly"
                style={{
                    left: `${f.x}%`,
                    top: `${f.y}%`,
                    width: f.size,
                    height: f.size,
                    background: f.color,
                    boxShadow: `0 0 ${f.size * 3}px ${f.size}px ${f.color}`,
                    animationDuration: `${f.dur}s`,
                    animationDelay: `${f.delay}s`,
                    '--dx': `${f.dx}px`,
                    '--dy': `${f.dy}px`,
                }}
            />
        ))}
    </div>
));

// SVG petal paths
function getPetalPath(shape, w, h) {
    switch (shape) {
        case 'ellipse':
            return `M 0,0 C ${w * 0.5},${-h * 0.2} ${w * 0.55},${-h * 0.8} 0,${-h} C ${-w * 0.55},${-h * 0.8} ${-w * 0.5},${-h * 0.2} 0,0 Z`;
        case 'rounded':
            return `M 0,0 C ${w * 0.6},${-h * 0.1} ${w * 0.7},${-h * 0.6} ${w * 0.1},${-h} C ${-w * 0.05},${-h * 1.05} ${-w * 0.05},${-h * 1.05} ${-w * 0.1},${-h} C ${-w * 0.7},${-h * 0.6} ${-w * 0.6},${-h * 0.1} 0,0 Z`;
        case 'pointed':
            return `M 0,0 C ${w * 0.45},${-h * 0.15} ${w * 0.35},${-h * 0.5} 0,${-h} C ${-w * 0.35},${-h * 0.5} ${-w * 0.45},${-h * 0.15} 0,0 Z`;
        case 'wide':
            return `M 0,0 C ${w * 0.7},${-h * 0.15} ${w * 0.8},${-h * 0.65} 0,${-h} C ${-w * 0.8},${-h * 0.65} ${-w * 0.7},${-h * 0.15} 0,0 Z`;
        case 'teardrop':
            return `M 0,0 C ${w * 0.55},${-h * 0.05} ${w * 0.65},${-h * 0.45} ${w * 0.15},${-h * 0.85} C ${w * 0.05},${-h} ${-w * 0.05},${-h} ${-w * 0.15},${-h * 0.85} C ${-w * 0.65},${-h * 0.45} ${-w * 0.55},${-h * 0.05} 0,0 Z`;
        default:
            return `M 0,0 C ${w * 0.5},${-h * 0.2} ${w * 0.55},${-h * 0.8} 0,${-h} C ${-w * 0.55},${-h * 0.8} ${-w * 0.5},${-h * 0.2} 0,0 Z`;
    }
}

const FlowerSVG = ({ flower }) => {
    const { palette, shape, petalCount, headSize, petalW, petalH, centerSize } = flower;
    const svgSize = headSize + petalH * 2 + 10;
    const cx = svgSize / 2;
    const cy = svgSize / 2;

    const petals = [];
    for (let i = 0; i < petalCount; i++) {
        const angle = (360 / petalCount) * i;
        const color = palette.petals[i % palette.petals.length];
        const nextColor = palette.petals[(i + 1) % palette.petals.length];
        const gradId = `grad-${flower.id}-${i}`;
        petals.push(
            <g key={i} transform={`rotate(${angle}, ${cx}, ${cy})`}>
                <defs>
                    <linearGradient id={gradId} x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                        <stop offset="100%" stopColor={nextColor} stopOpacity="0.95" />
                    </linearGradient>
                </defs>
                <path
                    d={getPetalPath(shape, petalW, petalH)}
                    fill={`url(#${gradId})`}
                    transform={`translate(${cx}, ${cy})`}
                    style={{ filter: `drop-shadow(0 0 3px ${color}66)` }}
                />
            </g>
        );
    }

    return (
        <svg
            width={svgSize}
            height={svgSize}
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            className="fg-flower-svg"
            style={{ animationDelay: `${flower.bloomDelay}s` }}
        >
            <defs>
                <radialGradient id={`glow-${flower.id}`}>
                    <stop offset="0%" stopColor={palette.glow.replace(')', ',0.5)')} />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
            </defs>
            <circle cx={cx} cy={cy} r={headSize / 2 + petalH * 0.6} fill={`url(#glow-${flower.id})`} className="fg-glow-circle" />
            {petals}
            <circle cx={cx} cy={cy} r={centerSize / 2} fill={palette.center} style={{ filter: `drop-shadow(0 0 8px ${palette.center}88)` }} />
            <circle cx={cx} cy={cy} r={centerSize / 2 - 2} fill="none" stroke={palette.petals[0]} strokeWidth="0.5" opacity="0.3" />
        </svg>
    );
};

// Single flower: positioned at its leftPercent, rotated by angle, grows from bottom
const Flower = ({ flower }) => {
    const svgTotalSize = flower.headSize + flower.petalH * 2 + 10;
    const totalH = flower.stemHeight + svgTotalSize / 2;

    return (
        <div
            className="fg-flower"
            style={{
                left: `${flower.leftPercent}%`,
                height: totalH,
                zIndex: flower.z,
                transform: `translateX(-50%) rotate(${flower.angle}deg)`,
                animationDuration: `${flower.swaySpeed}s`,
                animationDelay: `${flower.swayDelay}s`,
                '--sway': `${flower.swayAmount}deg`,
                '--base-angle': `${flower.angle}deg`,
            }}
        >
            {/* Stem */}
            <div
                className="fg-stem"
                style={{
                    height: flower.stemHeight,
                    width: flower.stemWidth,
                    background: `linear-gradient(to top, #1a5c3a, ${flower.palette.stem})`,
                    animationDelay: `${flower.growDelay}s`,
                }}
            >
                <div className="fg-leaf fg-leaf-l" style={{
                    top: `${flower.leafLeft.top}%`,
                    width: flower.leafLeft.size,
                    height: flower.leafLeft.size * 0.45,
                    animationDelay: `${flower.leafLeft.delay}s`,
                }} />
                <div className="fg-leaf fg-leaf-r" style={{
                    top: `${flower.leafRight.top}%`,
                    width: flower.leafRight.size,
                    height: flower.leafRight.size * 0.45,
                    animationDelay: `${flower.leafRight.delay}s`,
                }} />
            </div>

            {/* Flower head */}
            <div className="fg-head" style={{
                width: svgTotalSize,
                height: svgTotalSize,
                top: 0,
                left: '50%',
                transform: `translateX(-50%) rotate(${-flower.angle}deg)`,
            }}>
                <FlowerSVG flower={flower} />
            </div>
        </div>
    );
};

// Filler greenery element
const FillerGreen = ({ green }) => {
    const shapeStyle = (() => {
        switch (green.type) {
            case 'spike':
                return { borderRadius: '30% 70% 0 0', width: green.width * 0.6 };
            case 'fern':
                return { borderRadius: '50% 50% 10% 10%', width: green.width * 1.2 };
            default: // leaf
                return { borderRadius: '40% 60% 20% 20%' };
        }
    })();

    return (
        <div
            className="fg-filler"
            style={{
                left: `${green.left}%`,
                height: green.height,
                width: green.width,
                background: `linear-gradient(to top, ${green.color}66, ${green.color})`,
                transform: `translateX(-50%) rotate(${green.angle}deg)`,
                zIndex: green.z,
                animationDelay: `${green.delay}s`,
                ...shapeStyle,
            }}
        />
    );
};

// Paper wrapper SVG (Kraft Paper Style)
const PaperWrapper = ({ color }) => {
    // Keep internal coordinate system the same, but render smaller
    const w = 340;
    const h = 420;

    return (
        <svg className="fg-paper-svg" viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id="pg-paper" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={color.main} />
                    <stop offset="50%" stopColor={color.fold} />
                    <stop offset="100%" stopColor={color.main} />
                </linearGradient>
                <filter id="pg-noise" x="-20%" y="-20%" width="140%" height="140%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" result="noise" />
                    <feColorMatrix type="saturate" values="0" result="desaturatedNoise" />
                    <feComposite operator="in" in="desaturatedNoise" in2="SourceGraphic" result="composite" />
                    <feBlend in="composite" in2="SourceGraphic" mode="multiply" />
                </filter>
                <dropShadow id="tag-shadow" dx="1" dy="2" stdDeviation="2" floodColor="#00000033" />
            </defs>

            {/* Stems poking out bottom */}
            <g transform={`translate(${w / 2 - 15}, ${h - 50})`}>
                <line x1="5" y1="0" x2="2" y2="35" stroke="#2e7d32" strokeWidth="3" strokeLinecap="round" />
                <line x1="15" y1="0" x2="15" y2="40" stroke="#388e3c" strokeWidth="3" strokeLinecap="round" />
                <line x1="25" y1="0" x2="28" y2="38" stroke="#1b5e20" strokeWidth="3" strokeLinecap="round" />
                <line x1="10" y1="0" x2="8" y2="25" stroke="#43a047" strokeWidth="2.5" strokeLinecap="round" />
            </g>

            {/* Back sheet (darker inside) */}
            <path
                d={`M ${w * 0.1},${h * 0.1} 
                   L ${w * 0.9},${h * 0.15} 
                   L ${w * 0.5},${h * 0.85} 
                   Z`}
                fill={color.shadow}
            />

            {/* Front Paper Main (Cone) */}
            <path
                d={`M ${w * 0.12},${h * 0.15} 
                   C ${w * 0.05},${h * 0.25} ${w * 0.3},${h * 0.8} ${w * 0.5},${h * 0.85}
                   C ${w * 0.7},${h * 0.8} ${w * 0.95},${h * 0.25} ${w * 0.88},${h * 0.15}
                   L ${w * 0.5},${h * 0.88}
                   Z`}
                fill="url(#pg-paper)"
                stroke={color.fold}
                strokeWidth="1"
                filter="url(#pg-noise)"
            />

            {/* Right overlapping flap */}
            <path
                d={`M ${w * 0.88},${h * 0.15}
                   C ${w * 0.75},${h * 0.3} ${w * 0.6},${h * 0.6} ${w * 0.5},${h * 0.85}
                   L ${w * 0.5},${h * 0.85}
                   L ${w * 0.9},${h * 0.15}
                   Z`}
                fill={color.fold}
                opacity="0.4"
            />

            {/* Left overlapping flap (creates the fold effect) */}
            <path
                d={`M ${w * 0.12},${h * 0.15} 
                   Q ${w * 0.35},${h * 0.5} ${w * 0.48},${h * 0.75}
                   L ${w * 0.5},${h * 0.85}
                   L ${w * 0.12},${h * 0.15}`}
                fill={color.main}
                opacity="0.1"
            />

            {/* Bow / Ribbon */}
            <path
                d={`M ${w * 0.35},${h * 0.72} Q ${w * 0.5},${h * 0.78} ${w * 0.65},${h * 0.72}`}
                fill="none"
                stroke={color.ribbon}
                strokeWidth="3"
                strokeLinecap="round"
            />

            {/* Bow loop left */}
            <path
                d={`M ${w * 0.5},${h * 0.75} 
                   C ${w * 0.35},${h * 0.65} ${w * 0.35},${h * 0.85} ${w * 0.5},${h * 0.75}`}
                fill="none"
                stroke={color.ribbon}
                strokeWidth="3"
            />
            {/* Bow loop right */}
            <path
                d={`M ${w * 0.5},${h * 0.75} 
                   C ${w * 0.65},${h * 0.65} ${w * 0.65},${h * 0.85} ${w * 0.5},${h * 0.75}`}
                fill="none"
                stroke={color.ribbon}
                strokeWidth="3"
            />

            {/* Tag string */}
            <path
                d={`M ${w * 0.5},${h * 0.75} Q ${w * 0.52},${h * 0.82} ${w * 0.55},${h * 0.88}`}
                fill="none"
                stroke={color.ribbon}
                strokeWidth="1.5"
            />

            {/* Tag */}
            <g transform={`translate(${w * 0.52}, ${h * 0.88}) rotate(-10)`} filter="url(#tag-shadow)">
                <path
                    d="M 0,0 L 25,0 L 30,15 L 25,30 L 0,30 Z"
                    fill={color.tag}
                />
                <circle cx="26" cy="15" r="2.5" fill="#f0f0f0" stroke="#ddd" strokeWidth="0.5" />
                <path d="M 12,14 Q 15,12 18,14 Q 15,20 12,14" fill="#ff6b6b" />
            </g>
        </svg>
    );
};

// ===================== MAIN PAGE =====================

const FlowerGardenPage = () => {
    const navigate = useNavigate();
    const [key, setKey] = useState(0);

    const garden = useMemo(() => generateGarden(), [key]);
    const fireflies = useMemo(() => generateFireflies(25), [key]);
    const message = useMemo(() => pick(MESSAGES), [key]);
    const paperColor = useMemo(() => pick(PAPER_COLORS), [key]);
    const fillerGreens = useMemo(() => generateFillerGreens(randInt(16, 22)), [key]);

    const regenerate = useCallback(() => setKey((k) => k + 1), []);

    return (
        <div className="fg-page" key={key}>
            <button className="fg-back" onClick={() => navigate(-1)} title="Volver">←</button>

            <Fireflies data={fireflies} />

            {/* BOUQUET */}
            <div className="fg-bouquet">
                {/* Flowers + greenery area */}
                <div className="fg-flowers-area">
                    {/* Filler greenery (behind flowers) */}
                    {fillerGreens.map((g) => (
                        <FillerGreen key={g.id} green={g} />
                    ))}
                    {/* Flowers */}
                    {garden.map((f) => (
                        <Flower key={f.id} flower={f} />
                    ))}
                </div>

                {/* Paper wrapper (overlaps bottom of stems) */}
                <div className="fg-paper-wrap">
                    <PaperWrapper color={paperColor} />
                </div>
            </div>

            {/* Message */}
            <motion.div
                className="fg-message"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8, duration: 1 }}
            >
                <p className="fg-msg-main">{message.title}</p>
                <p className="fg-msg-sub">{message.subtitle}</p>
            </motion.div>

            {/* Regenerate */}
            <motion.button
                className="fg-regen"
                onClick={regenerate}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 0.8 }}
            >
                🌸 Dame otro ramo
            </motion.button>
        </div>
    );
};

export default FlowerGardenPage;
