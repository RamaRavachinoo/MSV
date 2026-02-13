import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';

const GoalCard = ({ goal, currentUserId, onContribute, onDelete, onEdit }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    // Basic calculation for progress
    const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative group">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-8xl grayscale">
                {goal.emoji}
            </div>

            <div className="flex justify-between items-start mb-2 relative z-20">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        {goal.emoji} {goal.title}
                    </h3>
                    {goal.description && (
                        <p className="text-xs text-gray-500 mt-1 max-w-[200px]">{goal.description}</p>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${goal.is_shared ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        {goal.is_shared ? 'Compartida' : 'Personal'}
                    </span>
                </div>

                {/* Context Menu Button */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 text-gray-300 hover:text-gray-500 transition-colors rounded-full hover:bg-gray-50"
                    >
                        <MoreVertical size={18} />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-10 z-30 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[150px] animate-in fade-in zoom-in-95 duration-150">
                            <button
                                onClick={() => {
                                    setShowMenu(false);
                                    onEdit(goal);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Pencil size={15} className="text-blue-500" />
                                <span>Editar</span>
                            </button>
                            <div className="h-px bg-gray-100 mx-2" />
                            <button
                                onClick={() => {
                                    setShowMenu(false);
                                    onDelete(goal.id);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <Trash2 size={15} />
                                <span>Eliminar</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="relative mt-4">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 font-medium">${goal.current_amount?.toLocaleString()}</span>
                    <span className="text-gray-800 font-bold">${goal.target_amount?.toLocaleString()}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-romantic-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-gray-400">{Math.round(progress)}% completado</span>
                    <button
                        onClick={onContribute}
                        className="px-4 py-2 bg-romantic-50 text-romantic-600 rounded-xl font-bold text-sm hover:bg-romantic-100 transition-colors"
                    >
                        Aportar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GoalCard;
