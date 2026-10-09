import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DEFAULT_PRODUCTS } from '../lib/initialData';
import { 
  Plus, 
  Upload, 
  X, 
  Loader2, 
  Save, 
  Shirt, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';

interface ProductRegistrationProps {
  onSuccess?: () => void;
  initialData?: Product | null;
  onCancel?: () => void;
}

export const ProductRegistration: React.FC<ProductRegistrationProps> = ({ onSuccess, initialData, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>(initialData?.gallery || []);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPrice(initialData.price.toString());
      setDescription(initialData.description);
      setExistingGallery(initialData.gallery || []);
      setSelectedFiles([]);
      setPreviews([]);
    }
  }, [initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file as Blob));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      return newPreviews.filter((_, i) => i !== index);
    });
  };

  const removeExistingFile = (index: number) => {
    setExistingGallery(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) return [];

    const bucketName = 'galeria-de-produtos';
    
    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const fileName = `${Date.now()}-${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        return publicUrl;
      });

      return await Promise.all(uploadPromises);
    } catch (err: any) {
      console.warn("Utilizando URLs locais como fallback durante falha de upload do produto:", err.message);
      return selectedFiles.map(file => URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || (selectedFiles.length === 0 && existingGallery.length === 0)) {
      setStatus({ type: 'error', message: 'Nome e pelo menos uma imagem são obrigatórios.' });
      return;
    }

    setIsUploading(true);
    setStatus(null);

    try {
      // 1. Upload new images in parallel
      const newImageUrls = await uploadImages();
      const finalGallery = [...existingGallery, ...newImageUrls];

      // Normalize price for Supabase numeric format
      const normalizedPrice = parseFloat(price.replace(',', '.'));
      
      if (isNaN(normalizedPrice)) {
        setStatus({ type: 'error', message: 'Preço inválido. Use apenas números.' });
        setIsUploading(false);
        return;
      }

      const productData = {
        name,
        price: normalizedPrice,
        description: description || "Novo lançamento Doggbite",
        image_url: finalGallery[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400', // Default backup
        gallery: finalGallery.length > 0 ? finalGallery : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400']
      };

      console.log('Saving product:', productData);

      try {
        let error;
        if (initialData?.id) {
          console.log('Atualizando produto:', initialData.id);
          const { error: updateError } = await supabase
            .from('products')
            .update(productData)
            .eq('id', initialData.id);
          error = updateError;
        } else {
          console.log('Sincronizando novo produto (Upsert):', productData.name);
          const { error: upsertError } = await supabase
            .from('products')
            .upsert([productData], { onConflict: 'name' });
          error = upsertError;
        }

        if (error) {
          throw error;
        }

        setStatus({ type: 'success', message: initialData ? 'Produto atualizado!' : 'Produto lançado com sucesso!' });
      } catch (dbError: any) {
        console.warn("Offline Fallback - Salvando produto no localStorage:", dbError.message);
        const cachedProductsStr = localStorage.getItem('dogg_products');
        let localProducts: any[] = [];
        if (cachedProductsStr) {
          try { localProducts = JSON.parse(cachedProductsStr); } catch (_) {}
        }
        if (localProducts.length === 0) {
          localProducts = DEFAULT_PRODUCTS;
        }

        if (initialData?.id) {
          localProducts = localProducts.map(p => p.id === initialData.id ? { ...p, ...productData } : p);
        } else {
          localProducts.push({
            id: 'local_' + Date.now().toString(),
            ...productData
          });
        }
        localStorage.setItem('dogg_products', JSON.stringify(localProducts));
        setStatus({ type: 'success', message: initialData ? 'Produto atualizado localmente! (Modo Offline)' : 'Produto lançado localmente! (Modo Offline)' });
      }
      
      if (!initialData) {
        // Reset form only if it's a new product
        setName('');
        setPrice('');
        setDescription('');
        setSelectedFiles([]);
        setPreviews([]);
        setExistingGallery([]);
      }

      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.warn('Aviso ao salvar produto:', error?.message || error);
      setStatus({ type: 'error', message: `Erro: ${error.message || 'Falha no processo'}` });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-zinc-900 p-6 border-b border-zinc-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-600/10 rounded-xl">
            <Shirt className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase italic">
              {initialData ? 'Editar Produto' : 'Novo Drop'}
            </h2>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">DooggBite ES-HC / Streetwear</p>
          </div>
        </div>
        {initialData && onCancel && (
          <button 
            onClick={onCancel}
            className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="p-8 space-y-6">
        {/* Status Message */}
        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-2xl flex items-center gap-3 ${
                status.type === 'success' 
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}
            >
              {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-xs font-bold uppercase tracking-wider">{status.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Nome do Produto</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="EX: REGATA ALL-STAR 027"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-orange-600/50 transition-all placeholder:text-zinc-700"
              required
            />
          </div>

          {/* Product Price */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Preço (R$)</label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-orange-600/50 transition-all placeholder:text-zinc-700"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="JERSEY BASEBALL STYLE DOOGGBITE ES-HC..."
            rows={3}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-orange-600/50 transition-all placeholder:text-zinc-700 resize-none"
          />
        </div>

        {/* Image Upload Area */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Galeria de Imagens</label>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Existing Images */}
            {existingGallery.map((url, index) => (
              <div
                key={`existing-${index}`}
                className="aspect-square rounded-2xl overflow-hidden border border-zinc-800 relative group"
              >
                <img src={url} alt="Existing" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeExistingFile(index)}
                    className="p-2 bg-red-600 rounded-xl text-white hover:scale-110 transition-transform"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {index === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-orange-600 rounded text-[8px] font-black text-white uppercase tracking-tighter">
                    Principal
                  </div>
                )}
              </div>
            ))}

            {/* New Previews */}
            <AnimatePresence>
              {previews.map((url, index) => (
                <motion.div
                  key={`preview-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="aspect-square rounded-2xl overflow-hidden border border-orange-600/30 relative group bg-orange-600/5"
                >
                  <img src={url} alt="Preview" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-orange-600 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-2 bg-red-600 rounded-xl text-white hover:scale-110 transition-transform"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {existingGallery.length === 0 && index === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-orange-600 rounded text-[8px] font-black text-white uppercase tracking-tighter">
                      Principal
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-zinc-800 hover:border-orange-600/50 hover:bg-orange-600/5 flex flex-col items-center justify-center gap-2 transition-all group"
            >
              <div className="p-3 bg-zinc-900 rounded-2xl group-hover:bg-orange-600/10 transition-colors">
                <Plus className="w-6 h-6 text-zinc-600 group-hover:text-orange-600" />
              </div>
              <span className="text-[8px] font-black text-zinc-600 group-hover:text-orange-600 uppercase tracking-widest">Add Fotos</span>
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUploading || !name || (selectedFiles.length === 0 && existingGallery.length === 0)}
          className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-black py-5 rounded-2xl uppercase tracking-[0.3em] text-xs transition-all flex items-center justify-center gap-3 shadow-lg shadow-orange-600/20"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{initialData ? 'Atualizando...' : 'Processando Drop...'}</span>
            </>
          ) : (
            <>
              {initialData ? <Edit2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              <span>{initialData ? 'Salvar Alterações' : 'Lançar Produto'}</span>
            </>
          )}
        </button>
      </form>

      {/* Footer Info */}
      <div className="bg-zinc-900/50 p-4 border-t border-zinc-800 flex justify-center">
        <div className="flex items-center gap-2 text-[8px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
          <Upload className="w-3 h-3" />
          <span>Upload Paralelo Ativo / Supabase Storage</span>
        </div>
      </div>
    </div>
  );
};
