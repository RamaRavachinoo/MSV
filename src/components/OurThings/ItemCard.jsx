import React from 'react';
import { Star, MapPin, Calendar, Heart, MoreVertical, Music, Film, Utensils, Plane } from 'lucide-react';

const ItemCard = ({ item, category, onClick, onEdit, onDelete }) => {
    const getIcon = () => {
        switch (category?.id) {
            case 'restaurants': return <Utensils size={14} />;
            case 'movies': return <Film size={14} />;
            case 'songs': return <Music size={14} />;
            case 'places': return <Plane size={14} />;
            default: return <Heart size={14} />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('es-ES', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const ratingColor = (rating) => {
        if (rating >= 5) return 'text-yellow-500 fill-yellow-500';
        if (rating >= 4) return 'text-yellow-400 fill-yellow-400';
        return 'text-gray-300';
    };

    return (
        <div
            onClick={() => onClick(item)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group"
        >
            <div className="relative h-48 bg-gray-100 overflow-hidden">
                {item.photo_url ? (
                    <img
                        src={item.photo_url}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className={`w-full h-full flex items-center justify-center ${category?.color?.replace('text-', 'bg-').replace('-500', '-50') || 'bg-gray-50'}`}>
                        <div className={`opacity-20 ${category?.color || 'text-gray-400'}`}>
                            {getIcon()}
                        </div>
                    </div>
                )}

                <div className="absolute top-2 right-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                        className="p-1.5 bg-white/80 backdrop-blur-md rounded-full text-gray-600 hover:text-gray-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <MoreVertical size={16} />
                    </button>
                </div>

                {item.rating > 0 && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg flex items-center shadow-sm">
                        <Star size={12} className={`mr-1 ${ratingColor(item.rating)}`} />
                        <span className="text-xs font-bold text-gray-700">{item.rating}</span>
                    </div>
                )}

                {item.status && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-white text-[10px] font-medium uppercase tracking-wide">
                        {item.status === 'want_to_go' ? 'Por ir' :
                            item.status === 'pending' ? 'Pendiente' :
                                item.status === 'watching' ? 'Viendo' :
                                    'Completado'}
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-gray-800 line-clamp-1 flex-1 mr-2">{item.title}</h3>
                </div>

                {item.location && (
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                        <MapPin size={12} className="mr-1" />
                        <span className="line-clamp-1">{item.location}</span>
                    </div>
                )}

                {category?.id === 'songs' && item.details?.artist && (
                    <div className="text-xs text-gray-500 mb-2 font-medium">
                        {item.details.artist}
                    </div>
                )}

                <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                    {item.date_event ? (
                        <div className="flex items-center">
                            <Calendar size={12} className="mr-1" />
                            {formatDate(item.date_event)}
                        </div>
                    ) : (
                        <span></span>
                    )}

                    {/* Optional: Add custom tags or "Volvería" indicator here */}
                    {item.details?.would_return && (
                        <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                            ♥ Volveremos
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemCard;
