import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Heart } from 'lucide-react';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-romantic-50">
                <Heart className="text-romantic-500 animate-bounce" size={48} />
                <p className="mt-4 text-romantic-800 font-serif">Cargando nuestro mundo...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
