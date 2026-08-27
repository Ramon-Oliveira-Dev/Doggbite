import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shirt, ShoppingBag, Loader2, Sparkles, Flame, ArrowRight, Star } from 'lucide-react';
import { Product } from '../types';

interface StorePageProps {
  products: Product[];
  isLoading: boolean;
  onBuy: (product: Product) => void;
  themeColor?: string;
}

const ProductCard: React.FC<{ product: Product; onBuy: (p: Product) => void; themeColor: string }> = ({ product, onBuy, themeColor }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const color = themeColor || '#A2FF00';

  const images = (product.images && product.images.length > 0)
    ? product.images
    : (product.gallery && product.gallery.length > 0 
      ? product.gallery 
      : [product.image_url || 'https://picsum.photos/seed/merch/400/400']);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  // Generate a random-looking but stable tag/badge for products based on name length or id
  const getProductTag = () => {
    if (product.price && Number(product.price) > 150) {
      return { text: 'DROP EXCLUSIVO ⚡', borderClass: 'border-amber-500/50 bg-amber-950/40 text-amber-400' };
    }
    const sum = product.name ? product.name.length % 3 : 0;
    if (sum === 0) {
      return { text: 'ÚLTIMAS UNIDADES 🔥', borderClass: 'border-red-500/50 bg-red-950/40 text-red-400' };
    } else if (sum === 1) {
      return { text: 'EDIÇÃO LIMITADA 💀', borderClass: 'border-[#9eff00]/50 bg-black/80 text-white' };
    } else {
      return { text: 'MAIS VENDIDO ⭐', borderClass: 'border-sky-500/50 bg-sky-950/40 text-sky-400' };
    }
  };

  const badge = getProductTag();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -8 }}
      className="bg-zinc-950/80 backdrop-blur-xl rounded-[32px] overflow-hidden border flex flex-col h-full shadow-2xl group relative transition-all duration-300"
      style={{
        borderColor: `${color}1d`,
        boxShadow: `0 15px 35px -15px rgba(0,0,0,0.8), 0 0 25px -10px ${color}15`
      }}
    >
      {/* Dynamic Border Hover Glow */}
      <div 
        className="absolute inset-0 rounded-[32px] border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-30" 
        style={{ borderColor: `${color}40`, boxShadow: `inset 0 0 15px ${color}1a` }}
      />

      {/* Decorative Ambient Radial Glow */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 blur-[80px] rounded-full pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity duration-500" 
        style={{ backgroundColor: color }} 
      />

      {/* Product Image Stage */}
      <div className="relative aspect-[4/3] w-full bg-neutral-900 overflow-hidden shrink-0">
        
        {/* Floating Urgency Tag */}
        <div className="absolute top-4 left-4 z-20">
          <motion.div 
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={`px-3 py-1 rounded-full border backdrop-blur-md text-[8px] sm:text-[9.5px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xl ${badge.borderClass}`}
          >
            {badge.text.includes('🔥') && <Flame className="w-3 h-3 text-red-500 animate-pulse" />}
            {badge.text.includes('⚡') && <Sparkles className="w-3 h-3 text-amber-400 animate-spin-slow" />}
            {badge.text.includes('⭐') && <Star className="w-3 h-3 text-sky-400 fill-current" />}
            <span>{badge.text}</span>
          </motion.div>
        </div>

        {/* Carousel Transition */}
        {images.map((img, idx) => (
          <motion.img
            key={idx}
            src={img}
            alt={`${product.name} - ${idx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: idx === currentImageIndex ? 1 : 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ))}
        
        {/* Shadow Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/20" />
        
        {/* Gallery Carousel Dot Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 w-full flex justify-center gap-2 z-10">
            {images.map((_, idx) => (
              <button 
                key={idx}
                type="button"
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentImageIndex ? 'w-5' : 'w-1.5 opacity-40 hover:opacity-100'
                }`}
                style={{ backgroundColor: idx === currentImageIndex ? color : '#ffffff' }}
                title={`Ir para imagem ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Details Area */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between relative z-15 bg-zinc-950/90">
        
        <div className="space-y-2">
          {/* Header Track Drop Tag */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black tracking-[0.25em] opacity-40 uppercase" style={{ color: color }}>DOGGBITE DROP</span>
            <div className="h-[2px] w-12 rounded-full" style={{ backgroundColor: `${color}26` }} />
          </div>

          {/* Product Name */}
          <h3 className="text-white font-black text-sm sm:text-base uppercase italic tracking-wide group-hover:text-white transition-colors line-clamp-1 leading-snug">
            {product.name}
          </h3>

          {/* Large Price Badge */}
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase italic">R$</span>
            <span className="text-2xl sm:text-3xl font-black italic tracking-tighter leading-none" style={{ color: color, filter: `drop-shadow(0 0 10px ${color}33)` }}>
              {typeof product.price === 'number' ? product.price.toFixed(2).replace('.', ',') : product.price}
            </span>
          </div>

          {/* Product Description */}
          {product.description && (
            <p className="text-gray-400 text-[10px] sm:text-[11.5px] line-clamp-2 leading-relaxed font-semibold uppercase tracking-wide mt-2">
              {product.description}
            </p>
          )}
        </div>

        {/* Emphasized Comprar Agora Button with continuous scale movement & light sweep highlight */}
        <div className="mt-3.5 relative">
          
          {/* External constant pulse ripple background */}
          <div 
            className="absolute -inset-1.5 rounded-2xl opacity-15 blur-md pointer-events-none group-hover:opacity-30 transition-opacity duration-300"
            style={{ backgroundColor: color }}
          />

          <motion.button 
            onClick={() => onBuy(product)}
            // Continuous scale pulsing animation on the CTA to drag standard customer focus!
            animate={{ 
              scale: [1, 1.02, 1],
              boxShadow: [
                `0 0 12px ${color}20`,
                `0 0 25px ${color}40`,
                `0 0 12px ${color}20`
              ]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="w-full text-black font-black py-4.5 rounded-2xl uppercase tracking-[0.2em] text-[10px] sm:text-xs transition-all duration-300 flex items-center justify-center gap-3 border shadow-2xl relative overflow-hidden cursor-pointer"
            style={{
              backgroundColor: color,
              borderColor: color,
            }}
          >
            {/* Moving visual Shimmer Light Sweep Effect */}
            <span className="absolute inset-x-0 top-0 h-full w-[40px] bg-gradient-to-r from-transparent via-white/50 to-transparent transform -skew-x-[35deg] -translate-x-[200px] animate-[shimmer_3s_infinite_linear]" style={{ mixBlendMode: 'overlay' }} />
            
            <ShoppingBag className="w-4 h-4 text-black flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
            <span className="relative z-10">Comprar Agora</span>
            <ArrowRight className="w-3.5 h-3.5 text-black flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
          </motion.button>
        </div>

      </div>
    </motion.div>
  );
};

export const StorePage: React.FC<StorePageProps> = ({ products, isLoading, onBuy, themeColor }) => {
  const color = themeColor || '#A2FF00';

  return (
    <div 
      className="bg-black/40 backdrop-blur-[12px] rounded-[40px] p-5 md:p-10 border shadow-[0_30px_60px_rgba(0,0,0,0.6)] space-y-8 relative overflow-hidden transition-all duration-750"
      style={{ borderColor: `${color}33`, boxShadow: `0 30px 60px rgba(0,0,0,0.8), inset 0 0 20px ${color}05` }}
    >
      {/* Decorative background elements ambient light */}
      <div className="absolute -top-32 -right-32 w-96 h-96 blur-[140px] rounded-full pointer-events-none opacity-10 transition-colors duration-500" style={{ backgroundColor: color }} />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 blur-[140px] rounded-full pointer-events-none opacity-10 transition-colors duration-500" style={{ backgroundColor: color }} />
      
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-[2px]" style={{ backgroundColor: color }} />
            <h3 className="text-[10px] sm:text-[11px] font-black tracking-[0.5em] uppercase flex items-center gap-2" style={{ color: color }}>
              <Sparkles className="w-3.5 h-3.5" /> Merchandising
            </h3>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
            Loja <span className="drop-shadow-[0_0_15px_rgba(158,255,0,0.2)] transition-colors duration-500" style={{ color: color }}>Oficial</span>
          </h2>
        </div>
        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-2xl self-start md:self-auto shadow-xl">
          <div className="w-2.5 h-2.5 rounded-full animate-pulse shadow-lg" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
          <span className="text-[9px] sm:text-[10px] font-black tracking-[0.3em] text-white/85 uppercase">Coleção 2026</span>
        </div>
      </div>
      
      {/* Visual divider line */}
      <div className="h-px bg-white/5 w-full my-4" />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-8">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin" style={{ color: color }} />
            <div className="absolute inset-0 blur-2xl opacity-40 animate-pulse" style={{ backgroundColor: color }} />
          </div>
          <p className="text-[10px] font-black tracking-[0.6em] text-white/40 uppercase animate-pulse">Sincronizando Estoque...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 space-y-10 relative z-10">
          <div className="w-28 h-28 bg-white/5 rounded-full flex items-center justify-center mx-auto border relative group" style={{ borderColor: `${color}1a` }}>
            <Shirt className="w-14 h-14 text-white/30 group-hover:text-white transition-colors duration-700" style={{ color: `${color}60` }} />
            <div className="absolute inset-0 rounded-full border border-white/10 animate-ping opacity-20" style={{ borderColor: color }} />
          </div>
          <div className="space-y-4">
            <p className="text-white font-black uppercase tracking-tighter text-2xl italic">Sold Out</p>
            <p className="text-white/40 text-xs max-w-xs mx-auto font-bold uppercase tracking-[0.2em] leading-relaxed">
              Novos drops em breve. Fique atento às redes sociais.
            </p>
          </div>
        </div>
      ) : (
        /* Optimized Responsiveness: Grid columns for neat and organized layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 relative z-10">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onBuy={onBuy}
              themeColor={color}
            />
          ))}
        </div>
      )}
    </div>
  );
};
