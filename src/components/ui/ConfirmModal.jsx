import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', isDestructive = false }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="">
            <div className="flex flex-col items-center text-center -mt-6">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${isDestructive ? 'bg-red-100' : 'bg-blue-100'}`}>
                    <AlertTriangle size={28} className={isDestructive ? 'text-red-500' : 'text-blue-500'} />
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    {message}
                </p>

                <div className="flex gap-3 w-full">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 text-gray-600 font-medium hover:bg-gray-100 rounded-2xl transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 py-3.5 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all ${isDestructive
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
