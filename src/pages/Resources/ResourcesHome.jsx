import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Folder, Plus, FolderPlus, ArrowRight, FileText, Link as LinkIcon, StickyNote, Trash2, AlertTriangle, Loader2, MoreVertical } from 'lucide-react';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ResourcesHome = () => {
    const navigate = useNavigate();
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [creating, setCreating] = useState(false);
    const [deleteFolderConfirm, setDeleteFolderConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchFolders();
    }, []);

    const fetchFolders = async () => {
        try {
            const { data, error } = await supabase
                .from('folders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setFolders(data || []);
        } catch (error) {
            console.error('Error fetching folders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        setCreating(true);
        try {
            const { data, error } = await supabase
                .from('folders')
                .insert([{ name: newFolderName }])
                .select()
                .single();

            if (error) throw error;
            setFolders([data, ...folders]);
            setNewFolderName('');
            setShowAddModal(false);
        } catch (error) {
            console.error('Error creating folder:', error);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteFolder = async (folder) => {
        setDeleting(true);
        try {
            // First, get all file resources in this folder to clean up storage
            const { data: fileResources, error: fetchError } = await supabase
                .from('resources')
                .select('file_path')
                .eq('folder_id', folder.id)
                .eq('type', 'file')
                .not('file_path', 'is', null);

            if (fetchError) throw fetchError;

            // Remove files from storage if any
            if (fileResources && fileResources.length > 0) {
                const filePaths = fileResources.map(r => r.file_path);
                const { error: storageError } = await supabase.storage
                    .from('resources')
                    .remove(filePaths);

                if (storageError) {
                    console.error('Error removing files from storage:', storageError);
                }
            }

            // Delete the folder (resources will cascade delete via DB constraint)
            const { error } = await supabase
                .from('folders')
                .delete()
                .eq('id', folder.id);

            if (error) throw error;

            setFolders(prev => prev.filter(f => f.id !== folder.id));
            setDeleteFolderConfirm(null);
        } catch (error) {
            console.error('Error deleting folder:', error);
            // alert('Error al eliminar carpeta: ' + error.message);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <header className="mb-8">
                <h1 className="text-3xl font-serif text-gray-800 mb-2">Mi Espacio</h1>
                <p className="text-gray-500">Un lugar para tus documentos, enlaces y notas personales.</p>
            </header>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {/* Add Folder Button */}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="aspect-square rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/50 flex flex-col items-center justify-center gap-2 hover:bg-rose-50 transition-colors group"
                    >
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Plus className="text-rose-400" size={24} />
                        </div>
                        <span className="text-sm font-medium text-rose-400">Nueva Carpeta</span>
                    </button>

                    {/* Folders List */}
                    {folders.map(folder => (
                        <div
                            key={folder.id}
                            onClick={() => navigate(`/resources/${folder.id}`)}
                            className="aspect-square bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-200 to-pink-200 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform" />

                            {/* Delete button on folder card */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteFolderConfirm(folder);
                                }}
                                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10 shadow-sm"
                                title="Eliminar carpeta"
                            >
                                <Trash2 size={14} />
                            </button>

                            <div className="h-full flex flex-col justify-between">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 mb-2">
                                    <Folder size={20} fill="currentColor" className="opacity-80" />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-800 truncate">{folder.name}</h3>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {format(new Date(folder.created_at), 'd MMM yyyy', { locale: es })}
                                    </p>
                                </div>

                                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                    <ArrowRight size={16} className="text-rose-400" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Stats / Info Widget */}
            {!loading && folders.length > 0 && (
                <div className="mt-8 bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-white/50">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Resumen</h4>
                    <div className="flex justify-between gap-2">
                        <div className="flex-1 bg-white/50 rounded-xl p-3 text-center">
                            <FileText size={16} className="mx-auto text-blue-400 mb-1" />
                            <span className="text-xs text-gray-500">Documentos</span>
                        </div>
                        <div className="flex-1 bg-white/50 rounded-xl p-3 text-center">
                            <LinkIcon size={16} className="mx-auto text-green-400 mb-1" />
                            <span className="text-xs text-gray-500">Links</span>
                        </div>
                        <div className="flex-1 bg-white/50 rounded-xl p-3 text-center">
                            <StickyNote size={16} className="mx-auto text-yellow-400 mb-1" />
                            <span className="text-xs text-gray-500">Notas</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Folder Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-rose-100 rounded-xl">
                                <FolderPlus className="text-rose-500" size={20} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Nueva Carpeta</h3>
                        </div>

                        <form onSubmit={handleCreateFolder}>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Nombre de la carpeta (ej. Facultad)"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-rose-200 outline-none text-gray-700 placeholder:text-gray-400 mb-4"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                            />

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 text-gray-500 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newFolderName.trim() || creating}
                                    className="flex-1 py-3 bg-rose-500 text-white font-medium rounded-xl hover:bg-rose-600 active:scale-95 transition-all shadow-lg shadow-rose-200 disabled:opacity-50 disabled:active:scale-100"
                                >
                                    {creating ? 'Creando...' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Folder Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteFolderConfirm}
                onClose={() => setDeleteFolderConfirm(null)}
                onConfirm={() => handleDeleteFolder(deleteFolderConfirm)}
                title="¿Eliminar carpeta?"
                message={`¿Seguro que quieres eliminar "${deleteFolderConfirm?.name}"? Se perderán todos los archivos dentro.`}
                confirmText={deleting ? "Eliminando..." : "Eliminar"}
                cancelText="Cancelar"
                isDestructive={true}
            />
        </div>
    );
};

export default ResourcesHome;
