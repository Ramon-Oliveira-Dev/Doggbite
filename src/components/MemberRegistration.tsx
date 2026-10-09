import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DEFAULT_MEMBERS } from '../lib/initialData';
import { 
  Plus, 
  Upload, 
  X, 
  Loader2, 
  Save, 
  Users, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MemberRegistrationProps {
  onSuccess?: () => void;
  initialData?: any | null;
  onCancel?: () => void;
}

export const MemberRegistration: React.FC<MemberRegistrationProps> = ({ onSuccess, initialData, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [role, setRole] = useState(initialData?.role || '');
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
      setRole(initialData.role);
      setDescription(initialData.description || '');
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

    const bucketName = 'galeria-de-produtos'; // Reusing the same bucket for simplicity or use a specific one
    
    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `public/members/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        return publicUrl;
      });

      return await Promise.all(uploadPromises);
    } catch (err: any) {
      console.warn("Utilizando URLs locais como fallback durante falha de upload:", err.message);
      return selectedFiles.map(file => URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || (selectedFiles.length === 0 && existingGallery.length === 0)) {
      setStatus({ type: 'error', message: 'Nome, função e pelo menos uma imagem são obrigatórios.' });
      return;
    }

    setIsUploading(true);
    setStatus(null);

    try {
      // 1. Upload new images
      const newImageUrls = await uploadImages();
      const finalGallery = [...existingGallery, ...newImageUrls];

      const memberData = {
        name: name,
        role: role.toLowerCase(),
        description: description,
        image_url: finalGallery[0] || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400', // Default backup
        gallery: finalGallery.length > 0 ? finalGallery : ['https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400']
      };

      console.log('Salvando integrante:', memberData);

      try {
        let error;
        if (initialData?.id) {
          const { error: updateError } = await supabase
            .from('members')
            .update(memberData)
            .eq('id', initialData.id);
          error = updateError;
        } else {
          const { error: upsertError } = await supabase
            .from('members')
            .upsert([memberData], { onConflict: 'name' });
          error = upsertError;
        }

        if (error) throw error;
        setStatus({ type: 'success', message: initialData ? 'Integrante atualizado!' : 'Integrante cadastrado com sucesso!' });
      } catch (dbError: any) {
        console.warn("Offline Fallback - Salvando integrante no localStorage:", dbError.message);
        const cachedMembersStr = localStorage.getItem('dogg_members');
        let localMembers: any[] = [];
        if (cachedMembersStr) {
          try { localMembers = JSON.parse(cachedMembersStr); } catch (_) {}
        }
        if (localMembers.length === 0) {
          localMembers = DEFAULT_MEMBERS;
        }

        if (initialData?.id) {
          localMembers = localMembers.map(m => m.id === initialData.id ? { ...m, ...memberData } : m);
        } else {
          localMembers.push({
            id: 'local_' + Date.now().toString(),
            ...memberData
          });
        }
        localStorage.setItem('dogg_members', JSON.stringify(localMembers));
        setStatus({ type: 'success', message: initialData ? 'Integrante atualizado localmente! (Modo Offline)' : 'Integrante cadastrado localmente! (Modo Offline)' });
      }

      if (!initialData) {
        setName('');
        setRole('');
        setDescription('');
        setSelectedFiles([]);
        setPreviews([]);
        setExistingGallery([]);
      }

      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.warn('Aviso ao salvar integrante:', error?.message || error);
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
          <div className="p-2 bg-brand-neon/10 rounded-xl">
            <Users className="w-6 h-6 text-brand-neon" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase italic">
              {initialData ? 'Editar Integrante' : 'Novo Integrante'}
            </h2>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Doggbite ES-HC / Lineup</p>
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
          {/* Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Nome Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="NOME DO INTEGRANTE"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-brand-neon/50 transition-all placeholder:text-zinc-700 uppercase italic"
              required
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Função</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="EX: GUITARRA / VOCAL"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-brand-neon/50 transition-all placeholder:text-zinc-700 uppercase italic"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Descrição / Biografia</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="CONTE UM POUCO SOBRE O INTEGRANTE..."
            rows={3}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-brand-neon/50 transition-all placeholder:text-zinc-700 resize-none uppercase italic"
          />
        </div>

        {/* Image Upload Area */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Galeria de Fotos</label>
          
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
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-brand-neon rounded text-[8px] font-black text-black uppercase tracking-tighter">
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
                  className="aspect-square rounded-2xl overflow-hidden border border-brand-neon/30 relative group bg-brand-neon/5"
                >
                  <img src={url} alt="Preview" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-brand-neon animate-pulse" />
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
                </motion.div>
              ))}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-zinc-800 hover:border-brand-neon/50 hover:bg-brand-neon/5 flex flex-col items-center justify-center gap-2 transition-all group"
            >
              <div className="p-3 bg-zinc-900 rounded-2xl group-hover:bg-brand-neon/10 transition-colors">
                <Plus className="w-6 h-6 text-zinc-600 group-hover:text-brand-neon" />
              </div>
              <span className="text-[8px] font-black text-zinc-600 group-hover:text-brand-neon uppercase tracking-widest">Add Fotos</span>
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
          disabled={isUploading || !name || !role || (selectedFiles.length === 0 && existingGallery.length === 0)}
          className="w-full bg-brand-neon hover:bg-brand-neon/80 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black py-5 rounded-2xl uppercase tracking-[0.3em] text-xs transition-all flex items-center justify-center gap-3 shadow-lg shadow-brand-neon/20"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{initialData ? 'Atualizando...' : 'Processando...'}</span>
            </>
          ) : (
            <>
              {initialData ? <Edit2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              <span>{initialData ? 'Salvar Alterações' : 'Cadastrar Integrante'}</span>
            </>
          )}
        </button>
      </form>

      {/* Footer Info */}
      <div className="bg-zinc-900/50 p-4 border-t border-zinc-800 flex justify-center">
        <div className="flex items-center gap-2 text-[8px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
          <Users className="w-3 h-3" />
          <span>Gestão de Integrantes / Doggbite</span>
        </div>
      </div>
    </div>
  );
};
