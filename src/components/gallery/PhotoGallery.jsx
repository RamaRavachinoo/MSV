import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';

const PhotoGallery = ({ photos }) => {
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    return (
        <>
            <div className="columns-2 md:columns-3 gap-4 space-y-4">
                {photos.map((photo) => (
                    <motion.div
                        key={photo.id}
                        layoutId={`photo-${photo.id}`}
                        className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer shadow-md"
                        onClick={() => setSelectedPhoto(photo)}
                        whileHover={{ scale: 1.02 }}
                    >
                        <img
                            src={photo.url}
                            alt={photo.description || 'Foto especial'}
                            className="w-full h-auto object-cover"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                            <div className="text-white text-xs font-medium truncate w-full">
                                {photo.description}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <button
                            className="absolute top-4 right-4 text-white p-2 bg-white/10 rounded-full hover:bg-white/20"
                            onClick={() => setSelectedPhoto(null)}
                        >
                            <X size={24} />
                        </button>

                        <motion.div
                            layoutId={`photo-${selectedPhoto.id}`}
                            className="bg-white rounded-lg overflow-hidden max-w-lg w-full max-h-[80vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
                                <img
                                    src={selectedPhoto.url}
                                    alt={selectedPhoto.description}
                                    className="max-w-full max-h-[60vh] object-contain"
                                />
                            </div>

                            <div className="p-6 bg-white">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="px-2 py-1 bg-romantic-100 text-romantic-600 text-xs rounded-full uppercase font-bold tracking-wider">
                                        {selectedPhoto.category}
                                    </span>
                                    <Heart className="text-romantic-500 fill-romantic-500" size={20} />
                                </div>
                                <p className="text-gray-700 font-serif italic text-lg">
                                    "{selectedPhoto.description}"
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default PhotoGallery;
