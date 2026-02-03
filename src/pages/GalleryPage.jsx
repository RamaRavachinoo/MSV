import React, { useState } from 'react';
import PhotoGallery from '../components/gallery/PhotoGallery';

// Mock Data for MVP
const MOCK_PHOTOS = [
    { id: 1, url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=500&q=80', description: 'Nuestra primera salida', category: 'Recuerdos' },
    { id: 2, url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=500&q=80', description: 'Eres maravillosa', category: 'Maravillosas' },
    { id: 3, url: 'https://images.unsplash.com/photo-1621600411688-4be93cd68504?auto=format&fit=crop&w=500&q=80', description: 'Caminando juntos', category: 'A tu lado' },
    { id: 4, url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=500&q=80', description: 'Esa sonrisa', category: 'Maravillosas' },
    { id: 5, url: 'https://images.unsplash.com/photo-1604514332463-c7bc45db7f30?auto=format&fit=crop&w=500&q=80', description: 'Un día de lluvia', category: 'Recuerdos' },
    { id: 6, url: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=500&q=80', description: 'Siempre juntos', category: 'A tu lado' },
];

const GalleryPage = () => {
    const [filter, setFilter] = useState('Todas');
    const categories = ['Todas', 'Recuerdos', 'Maravillosas', 'A tu lado'];

    const filteredPhotos = filter === 'Todas'
        ? MOCK_PHOTOS
        : MOCK_PHOTOS.filter(photo => photo.category === filter);

    return (
        <div className="min-h-screen py-4">
            <header className="mb-6 px-2">
                <h1 className="text-3xl font-serif text-romantic-800 mb-2">Mis Favoritas Tuyas</h1>
                <p className="text-sm text-gray-500">Colección de momentos que me enamoran</p>
            </header>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide px-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === cat
                                ? 'bg-romantic-500 text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <PhotoGallery photos={filteredPhotos} />
        </div>
    );
};

export default GalleryPage;
