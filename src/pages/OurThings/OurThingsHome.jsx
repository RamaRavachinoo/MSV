import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import CategoryCard from '../../components/OurThings/CategoryCard';
import StatsWidget from '../../components/OurThings/StatsWidget';
import { Loader2, ArrowLeft } from 'lucide-react';

const OurThingsHome = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, recent: 0, favorites: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch categories
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('*');

      if (catError) throw catError;

      // Fetch stats (simplified for now)
      const { data: thingsData, error: thingsError } = await supabase
        .from('our_things')
        .select('id, rating, created_at');

      if (thingsError) throw thingsError;

      // Calculate simple stats
      const total = thingsData.length;
      const favorites = thingsData.filter(t => t.rating >= 5).length;

      // Items from current month
      const now = new Date();
      const recent = thingsData.filter(t => {
        const d = new Date(t.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      setCategories(categoriesData || []);
      setStats({ total, recent, favorites });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/our-things/${categoryId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-romantic-500" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto pb-24">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="mr-3 p-2 rounded-full hover:bg-white/50 text-gray-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 leading-tight">
            Nuestras Cosas
          </h1>
          <p className="text-gray-500 text-sm">Coleccionando momentos juntos</p>
        </div>
      </div>

      <StatsWidget
        totalItems={stats.total}
        recentActivity={stats.recent}
        topRated={stats.favorites}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onClick={handleCategoryClick}
            // In a real app we'd fetch counts per category, for now 0 or if we wanted to pre-calculate
            count={0}
          />
        ))}
      </div>
    </div>
  );
};

export default OurThingsHome;
