import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Plus } from 'lucide-react';
import ItemCard from '../../components/OurThings/ItemCard';
import FilterBar from '../../components/OurThings/FilterBar';
import AddItemModal from '../../components/OurThings/AddItemModal';

const CategoryView = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        fetchData();
    }, [categoryId]);

    useEffect(() => {
        filterItems();
    }, [items, searchTerm, filterType]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch category details
            const { data: catData, error: catError } = await supabase
                .from('categories')
                .select('*')
                .eq('id', categoryId)
                .single();

            if (catError) throw catError;
            setCategory(catData);

            // Fetch items
            const { data: itemsData, error: itemsError } = await supabase
                .from('our_things')
                .select('*')
                .eq('category_id', categoryId)
                .order('created_at', { ascending: false });

            if (itemsError) throw itemsError;
            setItems(itemsData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterItems = () => {
        let result = [...items];

        // Search
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(item =>
                item.title.toLowerCase().includes(lower) ||
                item.description?.toLowerCase().includes(lower) ||
                item.location?.toLowerCase().includes(lower)
            );
        }

        // Filter
        if (filterType !== 'all') {
            if (filterType === 'favorites') {
                result = result.filter(item => item.rating >= 5);
            } else {
                // Example: 'completed', 'pending' matches status
                result = result.filter(item => item.status === filterType);
            }
        }

        setFilteredItems(result);
    };

    const handleSort = (type) => {
        const sorted = [...filteredItems];
        if (type === 'date') {
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (type === 'rating') {
            sorted.sort((a, b) => b.rating - a.rating);
        }
        setFilteredItems(sorted);
    };

    const handleEdit = (item) => {
        setItemToEdit(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (item) => {
        // In a real app, show confirmation dialog
        if (!window.confirm('¿Seguro que quieres borrar este recuerdo?')) return;

        try {
            const { error } = await supabase.from('our_things').delete().eq('id', item.id);
            if (error) throw error;
            setItems(prev => prev.filter(i => i.id !== item.id));
        } catch (err) {
            console.error(err);
            alert('Error al borrar');
        }
    };

    const handleSave = (savedItem) => {
        if (itemToEdit) {
            setItems(prev => prev.map(i => i.id === savedItem.id ? savedItem : i));
        } else {
            setItems(prev => [savedItem, ...prev]);
        }
        setItemToEdit(null);
    };

    if (loading) return <div className="p-8 text-center">Cargando...</div>;
    if (!category) return <div className="p-8 text-center">Categoría no encontrada</div>;

    return (
        <div className="p-4 max-w-7xl mx-auto pb-24 min-h-screen bg-gray-50/50">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white/80 backdrop-blur-md p-4 -mx-4 z-10 border-b border-gray-100">
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/our-things')}
                        className="mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 font-serif">
                            {category.name}
                        </h1>
                        <p className="text-xs text-gray-500">{items.length} recuerdos</p>
                    </div>
                </div>

                <button
                    onClick={() => { setItemToEdit(null); setIsModalOpen(true); }}
                    className="p-3 bg-romantic-500 text-white rounded-full shadow-lg hover:bg-romantic-600 transition-all active:scale-95"
                >
                    <Plus size={24} />
                </button>
            </div>

            <FilterBar
                onSearch={setSearchTerm}
                onSort={handleSort}
                onFilter={setFilterType}
            />

            {filteredItems.length === 0 ? (
                <div className="text-center py-20 opacity-50">
                    <p className="text-gray-400 mb-2">No hay nada aquí todavía</p>
                    <button onClick={() => setIsModalOpen(true)} className="text-romantic-500 font-medium">
                        ¡Agrega el primer recuerdo!
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map(item => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            category={category}
                            onClick={() => handleEdit(item)} // For now, clicking card opens edit modal which serves as detail
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            <AddItemModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setItemToEdit(null); }}
                category={category}
                itemToEdit={itemToEdit}
                onSave={handleSave}
            />
        </div>
    );
};

export default CategoryView;
