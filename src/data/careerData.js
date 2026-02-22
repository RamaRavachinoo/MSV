// Datos del Plan de Estudios - Abogacía UBA (Plan 2004/2008)

// ─── CBC: Ciclo Básico Común ──────────────────────────────────────────────────
export const CBC_SUBJECTS = [
  { id: 'cbc-1', code: 'cbc-1', name: 'Principios Generales del Derecho Privado', group: 'CBC' },
  { id: 'cbc-2', code: 'cbc-2', name: 'Pensamiento Científico', group: 'CBC' },
  { id: 'cbc-3', code: 'cbc-3', name: 'Sociedad y Estado', group: 'CBC' },
  { id: 'cbc-4', code: 'cbc-4', name: 'Ciencia Política', group: 'CBC' },
  { id: 'cbc-5', code: 'cbc-5', name: 'Sociología', group: 'CBC' },
  { id: 'cbc-6', code: 'cbc-6', name: 'Principios de DDHH y Derecho Constitucional', group: 'CBC' },
];

// ─── CPC: Ciclo Profesional Común (14 materias) ───────────────────────────────
export const CPC_SUBJECTS = [
  // Año 1 del CPC
  { code: '131', name: 'Teoría General del Derecho', year: 1, isAnnual: false, prerequisites: [] },
  { code: '132', name: 'Teoría del Estado', year: 1, isAnnual: false, prerequisites: [] },
  { code: '133', name: 'Derechos Humanos y Garantías', year: 1, isAnnual: false, prerequisites: [] },
  { code: '144', name: 'Análisis Económico y Financiero', year: 1, isAnnual: false, prerequisites: [] },

  // Año 2 del CPC
  { code: '134', name: 'Derecho Constitucional', year: 2, isAnnual: false, prerequisites: ['132', '133'] },
  { code: '135', name: 'Elementos del Derecho Civil', year: 2, isAnnual: false, prerequisites: ['131'] },
  { code: '138', name: 'Elementos del Derecho Procesal Civil', year: 2, isAnnual: false, prerequisites: ['131'] },
  { code: '139', name: 'Derecho Penal y Procesal Penal', year: 2, isAnnual: true, prerequisites: ['133'] },
  { code: '147', name: 'Derecho Administrativo', year: 2, isAnnual: false, prerequisites: ['133'] },

  // Año 3 del CPC
  { code: '136', name: 'Obligaciones Civiles y Comerciales', year: 3, isAnnual: false, prerequisites: ['135'] },
  { code: '145', name: 'Elementos del Derecho Comercial', year: 3, isAnnual: false, prerequisites: ['144'] },
  { code: '142', name: 'Derecho del Trabajo y la Seguridad Social', year: 3, isAnnual: false, prerequisites: ['134'] },
  { code: '163', name: 'Derecho Internacional Público', year: 3, isAnnual: false, prerequisites: ['134', '147'] },

  // Año 4 del CPC
  { code: '137', name: 'Contratos Civiles y Comerciales', year: 4, isAnnual: true, prerequisites: ['136'] },
  { code: '140', name: 'Elementos de Derechos Reales', year: 4, isAnnual: false, prerequisites: ['136'] },
  { code: '162', name: 'Sociedades Civiles y Comerciales', year: 4, isAnnual: false, prerequisites: ['136', '145'] },
  { code: '197', name: 'Familia y Sucesiones', year: 4, isAnnual: false, prerequisites: ['139', '136'] },
  { code: '169', name: 'Finanzas Públicas y Derecho Tributario', year: 4, isAnnual: false, prerequisites: ['163'] },

  // Año 5 del CPC
  { code: '168', name: 'Derecho Internacional Privado', year: 5, isAnnual: false, prerequisites: ['162', '197'] },
];

// ─── CPO: Ciclo Profesional Orientado ─────────────────────────────────────────
// Materias comunes a todas las orientaciones (cursada cuatrimestral)
export const CPO_SUBJECTS = [
  { code: 'cpo-laboral', name: 'Derecho Laboral', group: 'CPO', isCommon: false },
  { code: 'cpo-pub-int', name: 'Derecho Público (Int. Público)', group: 'CPO', isCommon: false },
  { code: 'cpo-pub-adm', name: 'Derecho Público (Administrativo)', group: 'CPO', isCommon: false },
  { code: 'cpo-penal', name: 'Derecho Penal', group: 'CPO', isCommon: false },
  { code: 'cpo-privado', name: 'Derecho Privado', group: 'CPO', isCommon: false },
  { code: 'cpo-notarial', name: 'Derecho Notarial', group: 'CPO', isCommon: false },
  { code: 'cpo-economico', name: 'Derecho Económico y Empresarial', group: 'CPO', isCommon: false },
  { code: 'cpo-tributario', name: 'Derecho Tributario', group: 'CPO', isCommon: false },
];

export const IDIOMA = { code: 'idioma', name: 'Nivel Único de Idioma', year: 0, isAnnual: false, prerequisites: [] };

export const ALL_SUBJECTS = [
  ...CBC_SUBJECTS,
  ...CPC_SUBJECTS,
  ...CPO_SUBJECTS,
  IDIOMA,
];

// Backward compatibility: CPO_SUBJECTS was previously CPC
// kept for any other file that may import it as CPO_SUBJECTS referring to CPC
export { CPC_SUBJECTS as CPO_SUBJECTS_LEGACY };

export const CPO_ORIENTATIONS = [
  'Derecho Laboral',
  'Derecho Público (Int. Público)',
  'Derecho Público (Administrativo)',
  'Derecho Penal',
  'Derecho Privado',
  'Derecho Notarial',
  'Derecho Económico y Empresarial',
  'Derecho Tributario',
];

export const SCHEDULE_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const TIME_SLOTS = Array.from({ length: 16 }, (_, i) => {
  const hour = 7 + i;
  return `${hour.toString().padStart(2, '0')}:00`;
});

export const YEAR_COLORS = {
  0: { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-600', accent: '#64748b' },
  1: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', accent: '#3b82f6' },
  2: { bg: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-700', accent: '#8b5cf6' },
  3: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', accent: '#f59e0b' },
  4: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', accent: '#10b981' },
  5: { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700', accent: '#f43f5e' },
};

export const STATUS_CONFIG = {
  aprobada: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700', label: 'Aprobada', dot: 'bg-green-500', icon: 'CheckCircle' },
  cursando: { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-700', label: 'Cursando', dot: 'bg-amber-500', icon: 'Clock' },
  pendiente: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-400', label: 'Pendiente', dot: 'bg-gray-400', icon: 'Circle' },
};

export const SCHEDULE_COLORS = [
  { hex: '#f43f5e', name: 'Rosa' },
  { hex: '#8b5cf6', name: 'Violeta' },
  { hex: '#3b82f6', name: 'Azul' },
  { hex: '#10b981', name: 'Verde' },
  { hex: '#f59e0b', name: 'Ámbar' },
  { hex: '#ec4899', name: 'Pink' },
  { hex: '#6366f1', name: 'Índigo' },
  { hex: '#14b8a6', name: 'Teal' },
  { hex: '#ef4444', name: 'Rojo' },
  { hex: '#84cc16', name: 'Lima' },
];

export const EVAL_PRESETS = [
  '1er Parcial',
  '2do Parcial',
  '3er Parcial',
  'Recuperatorio',
  'Final',
  'TP Integrador',
  'TP',
  'Oral',
];

// Materias del grafo organizadas por filas para layout visual
export const GRAPH_ROWS = [
  { label: 'CBC', subjects: CBC_SUBJECTS.map(s => s.code) },
  { label: 'Año 1', subjects: ['131', '132', '133', '144'] },
  { label: 'Año 2', subjects: ['134', '135', '138', '139', '147'] },
  { label: 'Año 3', subjects: ['136', '137', '140', '142', '145', '163'] },
  { label: 'Año 4', subjects: ['162', '169', '197'] },
  { label: 'Año 5', subjects: ['168'] },
  { label: 'CPO', subjects: CPO_SUBJECTS.map(s => s.code) },
  { label: 'Otros', subjects: ['idioma'] },
];
