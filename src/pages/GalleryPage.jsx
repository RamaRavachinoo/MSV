import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import PhotoGallery from '../components/gallery/PhotoGallery';

const GalleryPage = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadPhotos();
    }, []);

    const loadPhotos = async () => {
        try {
            setLoading(true);
            setError(null);

            // List all files in the 'photos' bucket
            const { data, error: listError } = await supabase.storage
                .from('photos')
                .list('', {
                    limit: 100,
                    sortBy: { column: 'created_at', order: 'desc' }
                });

            if (listError) {
                throw listError;
            }

            if (data && data.length > 0) {
                // Filter only image files
                const imageFiles = data.filter(file =>
                    file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                );

                // Get public URLs for each image
                const photosWithUrls = imageFiles.map((file, index) => {
                    const { data: urlData } = supabase.storage
                        .from('photos')
                        .getPublicUrl(file.name);

                    return {
                        id: file.id || index,
                        url: urlData.publicUrl,
                        description: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
                        category: 'Recuerdos',
                        created_at: file.created_at
                    };
                });

                setPhotos(photosWithUrls);
            }
        } catch (err) {
            console.error('Error loading photos:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-4">
            <header className="text-center mb-8">
                <span className="inline-block px-4 py-1 bg-white border border-romantic-300 text-romantic-600 text-xs font-bold tracking-widest rounded-full mb-4">
                    GALERÍA DE AMOR
                </span>
                <h1 className="text-4xl font-serif italic text-romantic-700 mb-2">
                    Nuestros Momentos
                </h1>
                <p className="text-sm text-gray-500">
                    Cada foto cuenta una parte de nuestra historia juntos.
                </p>
            </header>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-romantic-500"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mx-4">
                    <p className="text-red-600 font-medium">Error al cargar fotos</p>
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                    <button
                        onClick={loadPhotos}
                        className="mt-4 px-4 py-2 bg-romantic-500 text-white rounded-lg hover:bg-romantic-600 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            ) : photos.length === 0 ? (
                <div className="bg-white/50 border border-romantic-100 rounded-xl p-8 text-center mx-4">
                    <p className="text-gray-500 italic text-lg">Aún no hay fotos...</p>
                    <p className="text-romantic-400 text-sm mt-2">
                        ¡Sube tu primera foto a Supabase!
                    </p>
                </div>
            ) : (
                <PhotoGallery photos={photos} />
            )}
        </div>
    );
};

export default GalleryPage;
