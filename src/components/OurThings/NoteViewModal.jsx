import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, List, CheckSquare, Loader2, Tag, Plus } from 'lucide-react';

const TAG_PRESETS = [
    { name: 'personal', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { name: 'facultad', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { name: 'importante', color: 'bg-red-100 text-red-700 border-red-200' },
    { name: 'idea', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { name: 'lista', color: 'bg-green-100 text-green-700 border-green-200' },
    { name: 'trabajo', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
];

const getTagColor = (tagName) => {
    const preset = TAG_PRESETS.find(t => t.name === tagName.toLowerCase());
    return preset?.color || 'bg-gray-100 text-gray-600 border-gray-200';
};

const NoteViewModal = ({ isOpen, note, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [showTagPicker, setShowTagPicker] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        if (note) {
            setTitle(note.title || '');
            setContent(note.content || '');
            setTags(note.tags || []);
            setHasChanges(false);
            setShowTagPicker(false);
            setTagInput('');
        }
    }, [note]);

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        setHasChanges(true);
    };

    const handleContentChange = (e) => {
        setContent(e.target.value);
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (!hasChanges) {
            onClose();
            return;
        }
        setSaving(true);
        try {
            await onSave(note.id, { title, content, tags });
            setHasChanges(false);
            onClose();
        } catch (err) {
            console.error('Error saving note:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        if (hasChanges) {
            handleSave();
        } else {
            onClose();
        }
    };

    // ─── Checklist toggle ────────────────────────────────────────────
    const toggleCheckbox = (lineIndex) => {
        const lines = content.split('\n');
        const line = lines[lineIndex];
        if (line.includes('[ ]')) {
            lines[lineIndex] = line.replace('[ ]', '[x]');
        } else if (line.includes('[x]')) {
            lines[lineIndex] = line.replace('[x]', '[ ]');
        }
        setContent(lines.join('\n'));
        setHasChanges(true);
    };

    // ─── Tags ────────────────────────────────────────────────────────
    const addTag = (tagName) => {
        const normalized = tagName.toLowerCase().trim();
        if (normalized && !tags.includes(normalized)) {
            setTags([...tags, normalized]);
            setHasChanges(true);
        }
        setTagInput('');
        setShowTagPicker(false);
    };

    const removeTag = (tagName) => {
        setTags(tags.filter(t => t !== tagName));
        setHasChanges(true);
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (tagInput.trim()) addTag(tagInput);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const textarea = e.target;
            const { selectionStart } = textarea;
            const lines = content.substring(0, selectionStart).split('\n');
            const currentLine = lines[lines.length - 1];

            // Auto-continue checkboxes
            const checkMatch = currentLine.match(/^(\s*\[[ x]\]\s)/);
            if (checkMatch) {
                if (currentLine.trim() === '[ ]' || currentLine.trim() === '[x]') {
                    e.preventDefault();
                    const before = content.substring(0, selectionStart - currentLine.length);
                    const after = content.substring(selectionStart);
                    const newContent = before + '\n' + after;
                    setContent(newContent);
                    setHasChanges(true);
                    setTimeout(() => {
                        textarea.selectionStart = textarea.selectionEnd = before.length + 1;
                    }, 0);
                } else {
                    e.preventDefault();
                    const before = content.substring(0, selectionStart);
                    const after = content.substring(selectionStart);
                    const newContent = before + '\n[ ] ' + after;
                    setContent(newContent);
                    setHasChanges(true);
                    setTimeout(() => {
                        textarea.selectionStart = textarea.selectionEnd = selectionStart + 5;
                    }, 0);
                }
                return;
            }

            // Auto-continue bullets
            const bulletMatch = currentLine.match(/^(\s*[•·▸\-]\s)/);
            if (bulletMatch) {
                if (currentLine.trim() === currentLine.match(/^[•·▸\-]/)?.[0]) {
                    e.preventDefault();
                    const before = content.substring(0, selectionStart - currentLine.length);
                    const after = content.substring(selectionStart);
                    const newContent = before + '\n' + after;
                    setContent(newContent);
                    setHasChanges(true);
                    setTimeout(() => {
                        textarea.selectionStart = textarea.selectionEnd = before.length + 1;
                    }, 0);
                } else {
                    e.preventDefault();
                    const bullet = bulletMatch[1];
                    const before = content.substring(0, selectionStart);
                    const after = content.substring(selectionStart);
                    const newContent = before + '\n' + bullet + after;
                    setContent(newContent);
                    setHasChanges(true);
                    setTimeout(() => {
                        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1 + bullet.length;
                    }, 0);
                }
            }
        }
    };

    const insertBullet = () => {
        const textarea = contentRef.current;
        if (!textarea) return;

        const { selectionStart, selectionEnd } = textarea;
        const before = content.substring(0, selectionStart);
        const after = content.substring(selectionEnd);
        const lastNewline = before.lastIndexOf('\n');
        const lineStart = lastNewline + 1;
        const currentLine = before.substring(lineStart);

        let newContent;
        let newPos;

        if (currentLine.startsWith('• ')) {
            newContent = before.substring(0, lineStart) + currentLine.substring(2) + after;
            newPos = selectionStart - 2;
        } else {
            newContent = before.substring(0, lineStart) + '• ' + currentLine + after;
            newPos = selectionStart + 2;
        }

        setContent(newContent);
        setHasChanges(true);
        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = newPos;
        }, 0);
    };

    const insertChecklist = () => {
        const textarea = contentRef.current;
        if (!textarea) return;

        const { selectionStart, selectionEnd } = textarea;
        const before = content.substring(0, selectionStart);
        const after = content.substring(selectionEnd);
        const lastNewline = before.lastIndexOf('\n');
        const lineStart = lastNewline + 1;
        const currentLine = before.substring(lineStart);

        let newContent;
        let newPos;

        if (currentLine.startsWith('[ ] ') || currentLine.startsWith('[x] ')) {
            newContent = before.substring(0, lineStart) + currentLine.substring(4) + after;
            newPos = selectionStart - 4;
        } else {
            newContent = before.substring(0, lineStart) + '[ ] ' + currentLine + after;
            newPos = selectionStart + 4;
        }

        setContent(newContent);
        setHasChanges(true);
        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = newPos;
        }, 0);
    };

    // ─── Render checklist-aware content preview ──────────────────────
    const renderContentPreview = () => {
        const lines = content.split('\n');
        const hasCheckboxes = lines.some(l => l.includes('[ ]') || l.includes('[x]'));

        if (!hasCheckboxes) return null;

        return (
            <div className="absolute inset-0 pointer-events-none" style={{ padding: 0 }}>
                {lines.map((line, i) => {
                    const isUnchecked = line.trimStart().startsWith('[ ]');
                    const isChecked = line.trimStart().startsWith('[x]');
                    if (!isUnchecked && !isChecked) return <div key={i} style={{ height: '2rem' }} />;

                    return (
                        <div
                            key={i}
                            style={{ height: '2rem', display: 'flex', alignItems: 'center' }}
                            className="pointer-events-auto"
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleCheckbox(i); }}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${isChecked
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'border-gray-300 hover:border-amber-400'
                                    }`}
                                style={{ marginRight: '0.5rem' }}
                            >
                                {isChecked && (
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (!isOpen || !note) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999]"
                onClick={handleClose}
            />
            <motion.div
                initial={{ y: '100%', opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                className="fixed inset-0 z-[10000] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-1 flex flex-col bg-[#FFFBF5] min-h-0 overflow-hidden">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-amber-100/60 shrink-0">
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={insertBullet}
                                className="p-2 rounded-xl hover:bg-amber-50 transition-colors text-amber-600"
                                title="Viñeta"
                            >
                                <List size={18} />
                            </button>

                            <button
                                onClick={insertChecklist}
                                className="p-2 rounded-xl hover:bg-green-50 transition-colors text-green-600"
                                title="Checklist"
                            >
                                <CheckSquare size={18} />
                            </button>

                            <button
                                onClick={() => setShowTagPicker(!showTagPicker)}
                                className={`p-2 rounded-xl transition-colors ${showTagPicker ? 'bg-purple-100 text-purple-600' : 'hover:bg-purple-50 text-purple-500'}`}
                                title="Etiquetas"
                            >
                                <Tag size={18} />
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={saving || !hasChanges}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ml-1 ${hasChanges
                                        ? 'bg-amber-500 text-white shadow-md shadow-amber-200 active:scale-95'
                                        : 'bg-gray-100 text-gray-400'
                                    }`}
                            >
                                {saving ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <Save size={14} />
                                )}
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>

                    {/* Tag Picker */}
                    <AnimatePresence>
                        {showTagPicker && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white/60 border-b border-amber-100/40 px-4 overflow-hidden shrink-0"
                            >
                                <div className="py-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleTagKeyDown}
                                            placeholder="Escribir etiqueta..."
                                            className="flex-1 px-3 py-1.5 text-sm bg-white rounded-lg outline-none focus:ring-2 focus:ring-purple-200 border border-gray-200"
                                        />
                                        <button
                                            onClick={() => { if (tagInput.trim()) addTag(tagInput); }}
                                            className="p-1.5 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {TAG_PRESETS.filter(t => !tags.includes(t.name)).map(t => (
                                            <button
                                                key={t.name}
                                                onClick={() => addTag(t.name)}
                                                className={`px-2.5 py-1 rounded-full text-xs font-medium border ${t.color} hover:opacity-80 transition-opacity`}
                                            >
                                                + {t.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Note Content Area */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                        <div className="max-w-2xl mx-auto px-5 py-6">
                            {/* Title */}
                            <input
                                type="text"
                                value={title}
                                onChange={handleTitleChange}
                                placeholder="Título de la nota..."
                                className="w-full text-2xl font-bold text-gray-800 bg-transparent outline-none border-none placeholder:text-gray-300 mb-1 font-serif"
                                style={{ caretColor: '#d97706' }}
                            />

                            {/* Active Tags */}
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {tags.map(tag => (
                                        <span
                                            key={tag}
                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTagColor(tag)} cursor-pointer hover:opacity-70 transition-opacity`}
                                            onClick={() => removeTag(tag)}
                                            title="Click para quitar"
                                        >
                                            {tag}
                                            <X size={10} />
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Date label */}
                            <p className="text-xs text-gray-400 mb-6 ml-0.5">
                                {note.created_at && new Date(note.created_at).toLocaleDateString('es-AR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>

                            {/* Divider */}
                            <div className="h-px bg-gradient-to-r from-amber-200/60 via-amber-300/40 to-transparent mb-5" />

                            {/* Content with lined paper effect */}
                            <div className="relative">
                                <textarea
                                    ref={contentRef}
                                    value={content}
                                    onChange={handleContentChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Escribe aquí tu nota..."
                                    className="note-content-textarea"
                                    style={{
                                        width: '100%',
                                        minHeight: '60vh',
                                        background: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        resize: 'none',
                                        fontSize: '15px',
                                        lineHeight: '2rem',
                                        fontFamily: "'Inter', 'Segoe UI', sans-serif",
                                        color: '#374151',
                                        caretColor: '#d97706',
                                        padding: 0,
                                        backgroundImage: 'repeating-linear-gradient(transparent, transparent 1.95rem, #e5ddd0 1.95rem, #e5ddd0 2rem)',
                                        backgroundPositionY: '-2px',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default NoteViewModal;
