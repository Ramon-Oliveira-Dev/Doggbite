import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Loader2, Sparkles, Tag, Shirt } from 'lucide-react';
import { Product } from '../types';

interface StorePageProps {
  products: Product[];
  isLoading: boolean;
  onBuy: (product: Product) => void;
  themeColor?: string;
}

interface ProductCardProps {
  product: Product;
  onBuy: (product: Product) => void;
  themeColor: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onBuy, themeColor }) => {
  const images = (product.images && product.images.length > 0)
    ? product.images
    : (product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800']);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const currentImage = images[activeImageIndex] || images[0];

  const formattedPrice = typeof product.price === 'number'
    ? product.price.toFixed(2).replace('.', ',')
    : product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group relative bg-zinc-950/70 backdrop-blur-md rounded-[24px] border border-white/10 overflow-hidden flex flex-col transition-all duration-300"
      style={{
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${themeColor}60`;
        e.currentTarget.style.boxShadow = `0 15px 35px rgba(0, 0, 0, 0.7), 0 0 25px ${themeColor}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
      }}
    >
      {/* Imagem do Produto */}
      <div className="relative aspect-square w-full bg-black/60 overflow-hidden">
        <img
          src={currentImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradiente sutil */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        {/* Badge Oficial */}
        <div className="absolute top-3 left-3 z-10">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-black shadow-lg"
            style={{ backgroundColor: themeColor }}
          >
            <Tag className="w-3 h-3" />
            <span>Oficial</span>
          </div>
        </div>

        {/* Galeria de Miniaturas / Indicadores */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 z-10 flex items-center justify-center gap-1.5 px-3">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(idx);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeImageIndex === idx
                    ? 'w-6 h-2'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
                style={activeImageIndex === idx ? { backgroundColor: themeColor } : {}}
                aria-label={`Ver imagem ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Conteúdo / Informações do Produto */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <h4 className="text-white font-black italic uppercase text-base sm:text-lg tracking-tight leading-snug group-hover:text-white transition-colors">
            {product.name}
          </h4>
          <p className="text-zinc-400 text-xs font-normal line-clamp-2 leading-relaxed">
            {product.description || 'Produto oficial da banda Doggbite.'}
          </p>
        </div>

        {/* Preço e Botão de Ação */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
              Valor
            </span>
            <span
              className="text-2xl font-black italic tracking-tighter"
              style={{ color: themeColor, textShadow: `0 0 12px ${themeColor}40` }}
            >
              R$ {formattedPrice}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onBuy(product)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-black font-black uppercase text-[10px] sm:text-xs tracking-wider transition-all duration-200 active:scale-95 hover:brightness-110 cursor-pointer shadow-lg"
            style={{
              backgroundColor: themeColor,
              boxShadow: `0 0 15px ${themeColor}30`
            }}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Comprar</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const StorePage: React.FC<StorePageProps> = ({ products, isLoading, onBuy, themeColor }) => {
  const color = themeColor || '#A2FF00';

  return (
    <div
      className="w-full bg-black/40 backdrop-blur-[10px] rounded-[32px] p-6 border shadow-[0_0_40px_rgba(0,0,0,0.8)] space-y-6"
      style={{
        borderColor: `${color}4d`,
        boxShadow: `inset 0 0 20px ${color}26, 0 0 40px rgba(0,0,0,0.8)`
      }}
    >
      {/* Cabeçalho da Aba Loja */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10 px-2">
        <h3
          className="text-[11px] font-black tracking-[0.4em] uppercase flex items-center gap-2"
          style={{ color }}
        >
          <ShoppingBag className="w-4 h-4" /> Loja Oficial
        </h3>
        <div className="flex items-center gap-2.5 text-[9px] font-black uppercase tracking-wider">
          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
            {products.length} {products.length === 1 ? 'Produto' : 'Produtos'}
          </span>
        </div>
      </div>

      {/* Estados de Carregamento e Vazio */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color }} />
          <p className="text-[10px] font-black tracking-[0.4em] text-white/40 uppercase">
            Carregando Produtos...
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
            <Shirt className="w-8 h-8 text-white/40" />
          </div>
          <p className="text-white/40 text-[10px] uppercase font-black tracking-[0.4em]">
            Nenhum produto disponível no momento
          </p>
        </div>
      ) : (
        /* Grid de Produtos Padrão */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
