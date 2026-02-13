import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Maximize2 } from 'lucide-react';

const PhotoGallery = ({ photos }) => {
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    return (
        <>
            <div className="columns-2 md:columns-3 gap-4 space-y-4 px-2">
                {photos.map((photo) => (
                    <motion.div
                        key={photo.id}
                        layoutId={`photo-${photo.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="break-inside-avoid relative group rounded-2xl overflow-hidden cursor-pointer glass-card p-1 hover:shadow-xl transition-all duration-300"
                        onClick={() => setSelectedPhoto(photo)}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="relative overflow-hidden rounded-xl">
                            <img
                                src={photo.url}
                                alt={photo.description || 'Momentos juntos'}
                                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110"
                                loading="lazy"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
                                <span className="text-white text-xs font-medium truncate pr-2 opacity-90">
                                    {photo.description}
                                </span>
                                <Maximize2 size={14} className="text-white opacity-80" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {selectedPhoto && createPortal(
                <AnimatePresence>
                    <motion.div
                        key="gallery-modal"
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        {/* Close Button */}
                        <button
                            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 bg-white/10 backdrop-blur-md rounded-full transition-colors z-[110]"
                            onClick={() => setSelectedPhoto(null)}
                        >
                            <X size={24} />
                        </button>

                        <motion.div
                            layoutId={`photo-${selectedPhoto.id}`}
                            className="bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-white/50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative flex-1 bg-black/5 flex items-center justify-center overflow-hidden p-2">
                                <img
                                    src={selectedPhoto.url}
                                    alt={selectedPhoto.description}
                                    className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-lg"
                                />
                            </div>

                            <div className="p-6 bg-white/60 backdrop-blur-md">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-rose-100 text-rose-600 text-[10px] rounded-full uppercase font-bold tracking-widest border border-rose-200">
                                            {selectedPhoto.category || 'Recuerdo'}
                                        </span>
                                    </div>
                                    <button className="text-rose-500 hover:text-rose-600 transition-colors">
                                        <Heart className="fill-current" size={24} />
                                    </button>
                                </div>
                                <h3 className="text-gray-800 font-serif text-xl mt-2">
                                    {selectedPhoto.description}
                                </h3>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

export default PhotoGallery;
