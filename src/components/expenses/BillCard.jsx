import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Pencil, Trash2, Check, Clock } from 'lucide-react';

const URGENCY = (daysUntil) => {
    if (daysUntil < 0) return { badge: 'text-red-700 bg-red-100', label: `Vencida hace ${Math.abs(daysUntil)}d` };
    if (daysUntil === 0) return { badge: 'text-red-700 bg-red-100', label: 'Vence hoy' };
    if (daysUntil <= 3) return { badge: 'text-red-600 bg-red-50', label: `Vence en ${daysUntil}d` };
    if (daysUntil <= 7) return { badge: 'text-amber-600 bg-amber-50', label: `Vence en ${daysUntil}d` };
    return { badge: 'text-blue-600 bg-blue-50', label: `Vence en ${daysUntil}d` };
};

const BillCard = ({ bill, isPaid, daysUntil, onTogglePaid, onEdit, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const urgency = URGENCY(daysUntil);

    return (
        <div className={`bg-white p-4 rounded-2xl shadow-sm border transition-all ${isPaid ? 'border-green-100 opacity-70' : 'border-gray-100'}`}>
            <div className="flex items-start gap-3">
                <button
                    onClick={onTogglePaid}
                    className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${isPaid ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-300 hover:bg-emerald-50 hover:text-emerald-500'
                        }`}
                    title={isPaid ? 'Marcar como pendiente' : 'Marcar como pagada'}
                >
                    {isPaid ? <Check size={18} /> : <Clock size={16} />}
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <p className={`font-semibold text-gray-800 ${isPaid ? 'line-through decoration-gray-300' : ''}`}>{bill.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{bill.category} · día {bill.due_day}</p>
                        </div>
                        <span className="font-bold text-gray-800 text-sm shrink-0">
                            {Number(bill.amount) > 0 ? `$${Number(bill.amount).toLocaleString()}` : ''}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        {isPaid ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-green-100 text-green-700">
                                Pagada este mes
                            </span>
                        ) : (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${urgency.badge}`}>
                                {urgency.label}
                            </span>
                        )}
                    </div>
                </div>

                <div className="relative shrink-0" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1.5 text-gray-300 hover:text-gray-500 rounded-full hover:bg-gray-50 transition-colors"
                    >
                        <MoreVertical size={16} />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-9 z-30 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[140px] animate-in fade-in zoom-in-95 duration-150">
                            <button
                                onClick={() => { setShowMenu(false); onEdit(bill); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Pencil size={14} className="text-blue-500" />
                                <span>Editar</span>
                            </button>
                            <div className="h-px bg-gray-100 mx-2" />
                            <button
                                onClick={() => { setShowMenu(false); onDelete(bill); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <Trash2 size={14} />
                                <span>Eliminar</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BillCard;
