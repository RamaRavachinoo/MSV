import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Loader2, Save } from 'lucide-react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';

const AddItemModal = ({ isOpen, onClose, category, itemToEdit = null, onSave }) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        // Populate form with existing data
        setValue('title', itemToEdit.title);
        setValue('description', itemToEdit.description);
        setValue('rating', itemToEdit.rating);
        setValue('date_event', itemToEdit.date_event);
        setValue('status', itemToEdit.status);
        setValue('location', itemToEdit.location);
        setPhotoUrl(itemToEdit.photo_url);

        // Populate dynamic details
        if (itemToEdit.details) {
          Object.keys(itemToEdit.details).forEach(key => {
            setValue(`details.${key}`, itemToEdit.details[key]);
          });
        }
      } else {
        reset();
        setPhotoUrl(null);
        setValue('category_id', category?.id);
        setValue('date_event', new Date().toISOString().split('T')[0]);
        setValue('rating', 5);
        setValue('status', 'completed');
      }
    }
  }, [isOpen, itemToEdit, category, reset, setValue]);

  const handleImageUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('our-things')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('our-things')
        .getPublicUrl(filePath);

      setPhotoUrl(data.publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const itemData = {
        title: data.title,
        description: data.description,
        rating: data.rating,
        date_event: data.date_event,
        status: data.status,
        location: data.location,
        category_id: category.id,
        photo_url: photoUrl,
        details: data.details || {},
        user_id: (await supabase.auth.getUser()).data.user?.id
      };

      let result;
      if (itemToEdit) {
        const { data: updated, error } = await supabase
          .from('our_things')
          .update(itemData)
          .eq('id', itemToEdit.id)
          .select()
          .single();
        if (error) throw error;
        result = updated;
      } else {
        const { data: created, error } = await supabase
          .from('our_things')
          .insert([itemData])
          .select()
          .single();
        if (error) throw error;
        result = created;
      }

      onSave(result);
      onClose();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item');
    }
  };


  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-serif font-bold text-gray-800">
            {itemToEdit ? 'Editar Recuerdo' : `Nuevo en ${category?.name || '...'}`}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

          {/* Photo Upload */}
          <div className="flex justify-center mb-6">
            <div className="relative group w-full h-48 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden hover:border-romantic-400 transition-colors cursor-pointer">
              {photoUrl ? (
                <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <Upload size={32} className="mb-2" />
                  <span className="text-sm">Subir foto (opcional)</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Common Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título / Nombre</label>
              <input
                {...register('title', { required: true })}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-romantic-300 focus:border-transparent"
                placeholder="Ej: Cena en..."
              />
              {errors.title && <span className="text-red-500 text-xs">Requerido</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  {...register('date_event')}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-romantic-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <select
                  {...register('rating')}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-romantic-300"
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                  <option value="4">⭐⭐⭐⭐ (4)</option>
                  <option value="3">⭐⭐⭐ (3)</option>
                  <option value="2">⭐⭐ (2)</option>
                  <option value="1">⭐ (1)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios / Notas</label>
              <textarea
                {...register('description')}
                rows="3"
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-romantic-300"
                placeholder="Escribe algo bonito sobre este recuerdo..."
              ></textarea>
            </div>

            {/* Dynamic Fields based on Category */}
            {category?.id === 'restaurants' && (
              <div className="space-y-3 bg-orange-50 p-4 rounded-xl">
                <h4 className="font-medium text-orange-800 text-sm">Detalles de Comida</h4>
                <div>
                  <label className="block text-xs font-semibold text-orange-700 mb-1">Platos Favoritos</label>
                  <input {...register('details.dishes')} className="w-full p-2 bg-white border-orange-200 rounded-lg text-sm" placeholder="Pasta, Pizza..." />
                </div>
                <div className="flex items-center">
                  <input type="checkbox" {...register('details.would_return')} className="text-orange-500 rounded focus:ring-orange-400" />
                  <label className="ml-2 text-sm text-orange-800">¿Volveríamos?</label>
                </div>
              </div>
            )}

            {category?.id === 'movies' && (
              <div className="space-y-3 bg-purple-50 p-4 rounded-xl">
                <h4 className="font-medium text-purple-800 text-sm">Detalles de Película/Serie</h4>
                <div>
                  <label className="block text-xs font-semibold text-purple-700 mb-1">Plataforma</label>
                  <select {...register('details.platform')} className="w-full p-2 bg-white border-purple-200 rounded-lg text-sm">
                    <option value="Netflix">Netflix</option>
                    <option value="Disney+">Disney+</option>
                    <option value="HBO">HBO Max</option>
                    <option value="Amazon">Amazon Prime</option>
                    <option value="Cine">Cine</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-purple-700 mb-1">Estado</label>
                  <select {...register('status')} className="w-full p-2 bg-white border-purple-200 rounded-lg text-sm">
                    <option value="completed">Visto</option>
                    <option value="watching">Viendo Ahora</option>
                    <option value="pending">Pendiente</option>
                  </select>
                </div>
              </div>
            )}

            {category?.id === 'songs' && (
              <div className="space-y-3 bg-pink-50 p-4 rounded-xl">
                <h4 className="font-medium text-pink-800 text-sm">Detalles Musicales</h4>
                <div>
                  <label className="block text-xs font-semibold text-pink-700 mb-1">Artista</label>
                  <input {...register('details.artist')} className="w-full p-2 bg-white border-pink-200 rounded-lg text-sm" placeholder="Nombre del artista" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-pink-700 mb-1">Link (Spotify/Youtube)</label>
                  <input {...register('details.link')} className="w-full p-2 bg-white border-pink-200 rounded-lg text-sm" placeholder="https://..." />
                </div>
              </div>
            )}

            {category?.id === 'places' && (
              <div className="space-y-3 bg-green-50 p-4 rounded-xl">
                <h4 className="font-medium text-green-800 text-sm">Detalles del Lugar</h4>
                <div>
                  <label className="block text-xs font-semibold text-green-700 mb-1">Ubicación / Dirección</label>
                  <input {...register('location')} className="w-full p-2 bg-white border-green-200 rounded-lg text-sm" placeholder="Ciudad, País o Dirección" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-green-700 mb-1">Tipo de Lugar</label>
                  <select {...register('details.type')} className="w-full p-2 bg-white border-green-200 rounded-lg text-sm">
                    <option value="trip">Viaje</option>
                    <option value="park">Parque/Plaza</option>
                    <option value="museum">Museo/Cultura</option>
                    <option value="bar">Bar/Nightlife</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>
            )}

            {category?.id === 'wishlist' && (
              <div className="space-y-3 bg-blue-50 p-4 rounded-xl">
                <h4 className="font-medium text-blue-800 text-sm">Detalles del Plan</h4>
                <div>
                  <label className="block text-xs font-semibold text-blue-700 mb-1">Prioridad</label>
                  <select {...register('details.priority')} className="w-full p-2 bg-white border-blue-200 rounded-lg text-sm">
                    <option value="high">Alta (¡Pronto!)</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja (Algún día)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-blue-700 mb-1">Presupuesto Estimado</label>
                  <input type="number" {...register('details.budget')} className="w-full p-2 bg-white border-blue-200 rounded-lg text-sm" placeholder="$" />
                </div>
              </div>
            )}

          </div>

          <div className="pt-4 border-t border-gray-100 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-romantic-500 text-white rounded-xl font-medium hover:bg-romantic-600 transition-colors shadow-lg shadow-romantic-200/50"
            >
              <Save size={18} className="mr-2" />
              {uploading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddItemModal;
