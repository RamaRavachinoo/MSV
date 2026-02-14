import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Upload, Calendar, Heart, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createPortal } from 'react-dom';
import ConfirmModal from '../components/ui/ConfirmModal';

const MemoryBookPage = () => {
    const { user } = useAuth();
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [deleteConfirmMem, setDeleteConfirmMem] = useState(null);

    // Upload State
    const [newMemory, setNewMemory] = useState({
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        file: null,
        previewUrl: null
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchMemories();
    }, []);

    const fetchMemories = async () => {
        try {
            const { data, error } = await supabase
                .from('memories')
                .select('*')
                .order('memory_date', { ascending: false });

            if (error) throw error;
            setMemories(data || []);
        } catch (error) {
            console.error('Error fetching memories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewMemory({
                ...newMemory,
                file: file,
                previewUrl: URL.createObjectURL(file)
            });
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!newMemory.file) return;

        setUploading(true);
        try {
            const fileExt = newMemory.file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            // 1. Upload Image
            const { error: uploadError } = await supabase.storage
                .from('memories')
                .upload(filePath, newMemory.file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('memories')
                .getPublicUrl(filePath);

            // 3. Save to Database
            const { error: dbError } = await supabase
                .from('memories')
                .insert([{
                    user_id: user.id,
                    photo_url: publicUrl,
                    description: newMemory.description,
                    memory_date: newMemory.date
                }]);

            if (dbError) throw dbError;

            // Reset & Refresh
            setIsUploadModalOpen(false);
            setNewMemory({ description: '', date: format(new Date(), 'yyyy-MM-dd'), file: null, previewUrl: null });
            fetchMemories();

        } catch (error) {
            console.error('Error uploading:', error);
            alert('Error al subir el recuerdo. Intenta de nuevo.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirmMem) return;

        try {
            // Optional: Delete from storage logic could be added here if needed
            // extracting path from url is complex, for MVP just deleting DB entry

            const { error } = await supabase.from('memories').delete().eq('id', deleteConfirmMem.id);
            if (error) throw error;
            fetchMemories();
            setDeleteConfirmMem(null);
        } catch (error) {
            console.error('Error deleting:', error);
        }
    }

    return (
        <div className="min-h-screen pb-24 px-4 bg-romantic-50">
            {/* Header */}
            <header className="pt-8 pb-6 sticky top-0 bg-romantic-50/90 backdrop-blur-sm z-30">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-serif text-romantic-900">Nuestra Historia 📖</h1>
                        <p className="text-sm text-romantic-600">Cada momento cuenta</p>
                    </div>
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="bg-white text-romantic-500 p-2 rounded-full shadow-sm border border-romantic-200"
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </header>

            {/* Memories Grid (Masonry-ish) */}
            <div className="columns-2 gap-4 space-y-4">
                {loading ? (
                    <p className="text-center col-span-2 text-gray-400">Cargando recuerdos...</p>
                ) : memories.length === 0 ? (
                    <div className="col-span-2 text-center py-20">
                        <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Heart size={32} className="text-romantic-300" />
                        </div>
                        <p className="text-gray-500">Aún no hay recuerdos.</p>
                        <button onClick={() => setIsUploadModalOpen(true)} className="text-romantic-500 font-bold mt-2">¡Sube la primera foto!</button>
                    </div>
                ) : (
                    memories.map((mem) => (
                        <motion.div
                            key={mem.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="break-inside-avoid bg-white p-2 pb-4 rounded-2xl shadow-sm border border-romantic-100 group relative"
                        >
                            <div className="relative overflow-hidden rounded-xl mb-3">
                                <img
                                    src={mem.photo_url}
                                    alt={mem.description}
                                    className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent p-2 flex items-end justify-end">
                                    <button
                                        onClick={() => setDeleteConfirmMem(mem)}
                                        className="bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                                        title="Borrar recuerdo"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="px-1">
                                <p className="text-xs text-romantic-400 font-bold uppercase tracking-wider mb-1">
                                    {format(new Date(mem.memory_date), "d 'de' MMMM, yyyy", { locale: es })}
                                </p>
                                {mem.description && (
                                    <p className="text-gray-700 font-serif text-sm leading-tight">
                                        {mem.description}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && createPortal(
                <AnimatePresence>
                    <>
                        <motion.div
                            key="backdrop-upload"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                            onClick={() => setIsUploadModalOpen(false)}
                        />
                        <motion.div
                            key="modal-upload"
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-[70] shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-serif text-gray-800">Nuevo Recuerdo ✨</h2>
                                <button onClick={() => setIsUploadModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleUpload} className="space-y-4 pb-8">
                                {/* Image Preview */}
                                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center relative bg-gray-50 h-48 flex flex-col items-center justify-center overflow-hidden">
                                    {newMemory.previewUrl ? (
                                        <div className="relative w-full h-full">
                                            <img src={newMemory.previewUrl} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                                            <button
                                                type="button"
                                                onClick={() => setNewMemory({ ...newMemory, file: null, previewUrl: null })}
                                                className="absolute top-0 right-0 bg-black/50 text-white p-1 rounded-bl-xl rounded-tr-xl"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 text-romantic-400">
                                                <Upload size={24} />
                                            </div>
                                            <p className="text-sm text-gray-500 font-medium">Toca para subir una foto</p>
                                            <p className="text-xs text-gray-400 mt-1">JPEG, PNG</p>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="text-xs text-gray-400 pl-1 block mb-1">¿Cuándo fue?</label>
                                    <div className="relative">
                                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="date"
                                            value={newMemory.date}
                                            onChange={(e) => setNewMemory({ ...newMemory, date: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="text-xs text-gray-400 pl-1 block mb-1">Descripción</label>
                                    <textarea
                                        rows="3"
                                        value={newMemory.description}
                                        onChange={(e) => setNewMemory({ ...newMemory, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-romantic-300 resize-none"
                                        placeholder="Escribe algo lindo sobre este momento..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading || !newMemory.file}
                                    className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all ${uploading || !newMemory.file
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-romantic-500 text-white shadow-romantic-200 active:scale-95'
                                        }`}
                                >
                                    {uploading ? 'Subiendo...' : 'Guardar Recuerdo ❤️'}
                                </button>
                            </form>
                        </motion.div>
                    </>
                </AnimatePresence>,
                document.body
            )}
        </div>
    )
}

<ConfirmModal
    isOpen={!!deleteConfirmMem}
    onClose={() => setDeleteConfirmMem(null)}
    onConfirm={handleDelete}
    title="¿Borrar recuerdo?"
    message="¿Seguro que quieres borrar este recuerdo? 😢"
    confirmText="Borrar"
    cancelText="Mmm... mejor no"
    isDestructive={true}
/>
        </div >
    );
};

export default MemoryBookPage;
