import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PhotoGallery from '../components/gallery/PhotoGallery';
import { supabase } from '../lib/supabase';
import { photoDescriptions } from '../data/photoDescriptions';

const GalleryPage = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPhotos();
    }, []);

    const fetchPhotos = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .storage
                .from('photos')
                .list('', { sortBy: { column: 'created_at', order: 'desc' } });

            if (error) {
                console.error('Error fetching photos:', error);
                return;
            }

            // Transform data to include public URLs
            const photosWithUrl = data
                .filter(file => file.name !== '.emptyFolderPlaceholder') // Filter out placeholders
                .map((file, index) => {
                    const { data: { publicUrl } } = supabase
                        .storage
                        .from('photos')
                        .getPublicUrl(file.name);

                    return {
                        id: file.id || index,
                        url: publicUrl,
                        description: photoDescriptions[file.name] || file.name.split('.')[0], // Use config or filename as fallback
                        category: 'Recuerdos'
                    };
                });

            setPhotos(photosWithUrl);
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-4 space-y-6">
            <header className="relative text-center z-10 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-block mb-3 px-4 py-1.5 rounded-full bg-white/30 backdrop-blur-md border border-white/50 text-xs font-medium uppercase tracking-widest text-rose-800 shadow-sm"
                >
                    Galería de Amor
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-rose-700 to-pink-600 font-bold drop-shadow-sm mb-2">
                    El POR QUE de mis fotos favoritas
                </h1>
                <p className="text-sm text-gray-600 font-light max-w-xs mx-auto">
                    Cada foto cuenta una parte de nuestra historia juntos.
                </p>

            </header>

            {/* Content Area */}
            <div className="px-2">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                    </div>
                ) : photos.length > 0 ? (
                    <PhotoGallery photos={photos} />
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card p-8 text-center rounded-3xl mx-4"
                    >
                        <p className="text-gray-500 font-serif italic text-lg mb-2">Aún no hay fotos...</p>
                        <p className="text-xs text-gray-400">¡Sube tu primera foto a Supabase!</p>
                    </motion.div>
                )}
            </div>
            <p className="text-sm text-gray-600 font-light max-w-xs mx-auto">
                Obviamente voy a ir subiendo mas fotos :D
            </p>
        </div>
    );
};

export default GalleryPage;
