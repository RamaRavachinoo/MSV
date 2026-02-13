import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Search, Plus, File, Link as LinkIcon, StickyNote, MoreVertical, Loader2, Trash2, FolderInput, Folder, X, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const FolderView = () => {
    const { folderId } = useParams();
    const navigate = useNavigate();
    const [folder, setFolder] = useState(null);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // all, file, link, note
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [addModalType, setAddModalType] = useState(null); // 'file', 'link', 'note'

    // Form states
    const [title, setTitle] = useState('');
    const [content, setContent] = useState(''); // for notes or link url
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Context menu & action states
    const [contextMenuResourceId, setContextMenuResourceId] = useState(null);
    const [deleteConfirmResource, setDeleteConfirmResource] = useState(null);
    const [moveResource, setMoveResource] = useState(null);
    const [allFolders, setAllFolders] = useState([]);
    const [loadingFolders, setLoadingFolders] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const contextMenuRef = useRef(null);

    useEffect(() => {
        fetchFolderData();
    }, [folderId]);

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
                setContextMenuResourceId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const fetchFolderData = async () => {
        try {
            // Fetch folder details
            const { data: folderData, error: folderError } = await supabase
                .from('folders')
                .select('*')
                .eq('id', folderId)
                .single();

            if (folderError) throw folderError;
            setFolder(folderData);

            // Fetch resources
            const { data: resourcesData, error: resourcesError } = await supabase
                .from('resources')
                .select('*')
                .eq('folder_id', folderId)
                .order('created_at', { ascending: false });

            if (resourcesError) throw resourcesError;
            setResources(resourcesData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            navigate('/resources'); // Redirect if error (e.g. folder not found)
        } finally {
            setLoading(false);
        }
    };

    const handleAddResource = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setSubmitting(true);
        try {
            let resourceData = {
                folder_id: folderId,
                title: title,
                type: addModalType
            };

            if (addModalType === 'note') {
                resourceData.content = content;
            } else if (addModalType === 'link') {
                resourceData.url = content;
            } else if (addModalType === 'file') {
                if (!file) return;

                // Upload file
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${folderId}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('resources')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('resources')
                    .getPublicUrl(filePath);

                resourceData.file_path = filePath;
                resourceData.url = publicUrl;
                resourceData.mime_type = file.type;
                resourceData.file_size = file.size;
            }

            const { data, error } = await supabase
                .from('resources')
                .insert([resourceData])
                .select()
                .single();

            if (error) throw error;

            setResources([data, ...resources]);
            closeModal();
        } catch (error) {
            console.error('Error adding resource:', error);
            alert('Error al guardar: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const closeModal = () => {
        setAddModalType(null);
        setTitle('');
        setContent('');
        setFile(null);
        setShowAddMenu(false);
    };

    // ---------- DELETE RESOURCE ----------
    const handleDeleteResource = async (resource) => {
        setActionLoading(true);
        try {
            // If it's a file, also remove from storage
            if (resource.type === 'file' && resource.file_path) {
                const { error: storageError } = await supabase.storage
                    .from('resources')
                    .remove([resource.file_path]);

                if (storageError) {
                    console.error('Error deleting file from storage:', storageError);
                }
            }

            // Delete from database
            const { error } = await supabase
                .from('resources')
                .delete()
                .eq('id', resource.id);

            if (error) throw error;

            setResources(prev => prev.filter(r => r.id !== resource.id));
            setDeleteConfirmResource(null);
        } catch (error) {
            console.error('Error deleting resource:', error);
            alert('Error al eliminar: ' + error.message);
        } finally {
            setActionLoading(false);
        }
    };

    // ---------- MOVE RESOURCE ----------
    const openMoveModal = async (resource) => {
        setMoveResource(resource);
        setContextMenuResourceId(null);
        setLoadingFolders(true);
        try {
            const { data, error } = await supabase
                .from('folders')
                .select('*')
                .neq('id', folderId)
                .order('name', { ascending: true });

            if (error) throw error;
            setAllFolders(data || []);
        } catch (error) {
            console.error('Error fetching folders:', error);
            alert('Error al cargar carpetas: ' + error.message);
        } finally {
            setLoadingFolders(false);
        }
    };

    const handleMoveResource = async (targetFolderId) => {
        if (!moveResource) return;
        setActionLoading(true);
        try {
            const { error } = await supabase
                .from('resources')
                .update({ folder_id: targetFolderId })
                .eq('id', moveResource.id);

            if (error) throw error;

            setResources(prev => prev.filter(r => r.id !== moveResource.id));
            setMoveResource(null);
        } catch (error) {
            console.error('Error moving resource:', error);
            alert('Error al mover: ' + error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const filteredResources = resources.filter(r => activeTab === 'all' || r.type === activeTab);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-rose-500" /></div>;

    return (
        <div className="min-h-screen pb-24 relative">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-4 py-4 border-b border-gray-100 flex items-center gap-4">
                <button onClick={() => navigate('/resources')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-semibold text-gray-800">{folder?.name}</h1>
                    <p className="text-xs text-gray-400">{resources.length} elementos</p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                    <Search size={20} />
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 py-4 flex gap-2 overflow-x-auto no-scrollbar">
                {[
                    { id: 'all', label: 'Todo' },
                    { id: 'file', label: 'Archivos' },
                    { id: 'link', label: 'Links' },
                    { id: 'note', label: 'Notas' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                            ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Resource List */}
            <div className="px-4 space-y-3">
                {filteredResources.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p>No hay elementos aquí todavía.</p>
                    </div>
                ) : (
                    filteredResources.map(resource => (
                        <div key={resource.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-start group relative">
                            {/* Icon based on type */}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${resource.type === 'file' ? 'bg-blue-50 text-blue-500' :
                                resource.type === 'link' ? 'bg-green-50 text-green-500' :
                                    'bg-yellow-50 text-yellow-500'
                                }`}>
                                {resource.type === 'file' && <File size={20} />}
                                {resource.type === 'link' && <LinkIcon size={20} />}
                                {resource.type === 'note' && <StickyNote size={20} />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-medium text-gray-800 truncate pr-2">{resource.title}</h3>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setContextMenuResourceId(contextMenuResourceId === resource.id ? null : resource.id);
                                        }}
                                        className="text-gray-300 hover:text-gray-500 p-1 -m-1 shrink-0"
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                </div>

                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                    {resource.type === 'note' ? resource.content :
                                        resource.type === 'link' ? resource.url :
                                            format(new Date(resource.created_at), 'd MMM, HH:mm', { locale: es })}
                                </p>

                                {resource.url && (
                                    <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block mt-2 text-xs font-medium text-rose-500 hover:underline"
                                    >
                                        {resource.type === 'file' ? 'Descargar / Ver' : 'Visitar enlace'}
                                    </a>
                                )}
                            </div>

                            {/* Context Menu */}
                            {contextMenuResourceId === resource.id && (
                                <div
                                    ref={contextMenuRef}
                                    className="absolute right-4 top-12 z-30 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[160px] animate-in fade-in zoom-in-95 duration-150"
                                >
                                    <button
                                        onClick={() => openMoveModal(resource)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <FolderInput size={16} className="text-blue-500" />
                                        <span>Mover a...</span>
                                    </button>
                                    <div className="h-px bg-gray-100 mx-2" />
                                    <button
                                        onClick={() => {
                                            setDeleteConfirmResource(resource);
                                            setContextMenuResourceId(null);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                        <span>Eliminar</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-24 right-6 z-20">
                <div className={`absolute bottom-full right-0 mb-4 space-y-3 transition-all duration-300 ${showAddMenu ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                    <button onClick={() => setAddModalType('note')} className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-lg hover:bg-gray-50 w-max ml-auto">
                        <span className="text-sm font-medium text-gray-600">Crear Nota</span>
                        <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-500 flex items-center justify-center"><StickyNote size={16} /></div>
                    </button>
                    <button onClick={() => setAddModalType('link')} className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-lg hover:bg-gray-50 w-max ml-auto">
                        <span className="text-sm font-medium text-gray-600">Guardar Link</span>
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-500 flex items-center justify-center"><LinkIcon size={16} /></div>
                    </button>
                    <button onClick={() => setAddModalType('file')} className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-lg hover:bg-gray-50 w-max ml-auto">
                        <span className="text-sm font-medium text-gray-600">Subir Archivo</span>
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center"><File size={16} /></div>
                    </button>
                </div>

                <button
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all ${showAddMenu ? 'bg-gray-800 rotate-45' : 'bg-rose-500 hover:bg-rose-600'
                        }`}
                >
                    <Plus size={24} className="text-white" />
                </button>
            </div>

            {/* Add Resource Modal */}
            {addModalType && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            {addModalType === 'note' && <><StickyNote className="text-yellow-500" /> Nueva Nota</>}
                            {addModalType === 'link' && <><LinkIcon className="text-green-500" /> Nuevo Enlace</>}
                            {addModalType === 'file' && <><File className="text-blue-500" /> Subir Archivo</>}
                        </h3>

                        <form onSubmit={handleAddResource} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-rose-200 outline-none"
                                    placeholder={addModalType === 'note' ? 'Asunto...' : 'Nombre del archivo/enlace'}
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>

                            {addModalType === 'note' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                                    <textarea
                                        required
                                        rows={4}
                                        className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-rose-200 outline-none resize-none"
                                        placeholder="Escribe algo aquí..."
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                    />
                                </div>
                            )}

                            {addModalType === 'link' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                                    <input
                                        type="url"
                                        required
                                        className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-rose-200 outline-none"
                                        placeholder="https://..."
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                    />
                                </div>
                            )}

                            {addModalType === 'file' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Archivo</label>
                                    <input
                                        type="file"
                                        required
                                        className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                                        onChange={e => setFile(e.target.files[0])}
                                    />
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3 bg-rose-500 text-white font-medium rounded-xl hover:bg-rose-600 shadow-lg shadow-rose-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting && <Loader2 size={16} className="animate-spin" />}
                                    {submitting ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmResource && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <AlertTriangle size={28} className="text-red-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">¿Eliminar este elemento?</h3>
                            <p className="text-sm text-gray-500 mb-1">
                                <span className="font-medium text-gray-700">"{deleteConfirmResource.title}"</span>
                            </p>
                            <p className="text-xs text-gray-400 mb-6">
                                {deleteConfirmResource.type === 'file'
                                    ? 'Se eliminará el archivo permanentemente del almacenamiento.'
                                    : 'Esta acción no se puede deshacer.'}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirmResource(null)}
                                disabled={actionLoading}
                                className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDeleteResource(deleteConfirmResource)}
                                disabled={actionLoading}
                                className="flex-1 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                            >
                                {actionLoading && <Loader2 size={16} className="animate-spin" />}
                                {actionLoading ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Move Resource Modal */}
            {moveResource && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <FolderInput size={20} className="text-blue-500" />
                                Mover a...
                            </h3>
                            <button
                                onClick={() => setMoveResource(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={18} className="text-gray-400" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-500 mb-4">
                            Moviendo <span className="font-medium text-gray-700">"{moveResource.title}"</span>
                        </p>

                        {loadingFolders ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="animate-spin text-rose-500" />
                            </div>
                        ) : allFolders.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <Folder size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No hay otras carpetas disponibles.</p>
                                <p className="text-xs mt-1">Crea una nueva carpeta primero.</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {allFolders.map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => handleMoveResource(f.id)}
                                        disabled={actionLoading}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 border border-gray-100 hover:border-rose-200 transition-all text-left group disabled:opacity-50"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 shrink-0 group-hover:scale-105 transition-transform">
                                            <Folder size={18} fill="currentColor" className="opacity-80" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="font-medium text-gray-800 block truncate">{f.name}</span>
                                            <span className="text-xs text-gray-400">
                                                {format(new Date(f.created_at), 'd MMM yyyy', { locale: es })}
                                            </span>
                                        </div>
                                        <ArrowLeft size={16} className="text-gray-300 rotate-180 group-hover:text-rose-400 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => setMoveResource(null)}
                            className="w-full mt-4 py-3 text-gray-500 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FolderView;
