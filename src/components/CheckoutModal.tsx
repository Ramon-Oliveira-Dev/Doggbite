import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquare, Phone, User, Loader2 } from 'lucide-react';
import { Product } from '../types';

interface CheckoutModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  themeColor?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ product, isOpen, onClose, themeColor }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    additionalInfo: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const color = themeColor || '#A2FF00';

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // 1. TRAVA O SCROLL: Impede o body e html de rolar
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.scrollBehavior = 'auto';
    } else {
      // 2. LIBERA O SCROLL: Retorna ao normal ao fechar
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
      document.documentElement.style.scrollBehavior = '';
    }

    // Limpeza ao desmontar o componente
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.documentElement.style.scrollBehavior = '';
    };
  }, [isOpen]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const limited = digits.slice(0, 11);
    
    if (limited.length === 0) return '';
    if (limited.length <= 2) {
      return `(${limited}`;
    }
    if (limited.length <= 6) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    }
    if (limited.length <= 10) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
    }
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
  };

  const handleSendOrder = () => {
    setIsSending(true);
    
    const formattedPrice = typeof product.price === 'number' 
      ? product.price.toFixed(2).replace('.', ',') 
      : product.price;

    const message = `*NOVO PEDIDO - DOGGBITE*
Cliente: ${formData.name}
Telefone: ${formData.phone}
Produto: ${product.name} - R$ ${formattedPrice}
Informações Adicionais: ${formData.additionalInfo}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5527981711723?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    setTimeout(() => {
      setIsSending(false);
      onClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex flex-col overflow-hidden touch-none">
          {/* Background Overlay with heavy blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
          />

          {/* Modal Container */}
          <div className="relative flex-1 flex flex-col w-full h-full overflow-y-auto custom-scrollbar">
            
            {/* Background ambient glow matching theme */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] blur-[140px] rounded-full pointer-events-none opacity-20 transition-all duration-700" style={{ backgroundColor: color }} />

            {/* Cabeçalho com o botão fechar */}
            <div className="p-6 flex justify-end relative z-20">
              <button 
                onClick={onClose} 
                className="bg-zinc-900/90 backdrop-blur-md p-4 rounded-2xl active:scale-90 transition-all border border-white/10 shadow-2xl hover:scale-105 cursor-pointer"
                style={{ borderColor: `${color}33` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = color;
                  e.currentTarget.style.boxShadow = `0 0 15px ${color}33`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <X className="text-white w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo Centralizado */}
            <div className="flex-1 px-6 flex flex-col justify-center max-w-md mx-auto w-full pb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1 mb-5 text-center sm:text-left"
              >
                <h1 className="italic font-black text-4xl sm:text-5xl uppercase leading-[0.9] mb-1.5" style={{ color: color, filter: `drop-shadow(0 0 12px ${color}40)` }}>
                  Finalizar<br/>Pedido
                </h1>
                <p className="text-zinc-500 text-[9px] font-black tracking-[0.3em] uppercase">
                  CHECKOUT VIA WHATSAPP • EDITORIAL EXCLUSIVO
                </p>
              </motion.div>

              {/* Card do Produto (Resumo da Compra) - Redesigned to support dynamic theme border */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-zinc-900/50 backdrop-blur-xl border p-3.5 rounded-[20px] flex items-center gap-4 mb-4 shadow-2xl relative overflow-hidden group"
                style={{ borderColor: `${color}26`, boxShadow: `0 0 30px -10px ${color}1a` }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 blur-[40px] rounded-full pointer-events-none opacity-20" style={{ backgroundColor: color }} />
                
                <img 
                  src={product.image_url || (product.images && product.images[0]) || (product.gallery && product.gallery[0]) || 'https://picsum.photos/seed/merch/400/400'} 
                  alt={product.name} 
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-white/5 transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[8px] font-black tracking-[0.2em] opacity-50 uppercase" style={{ color: color }}>ITEM SELECIONADO</span>
                  <h3 className="text-white font-black italic uppercase text-xs sm:text-sm truncate mt-0.5">{product.name}</h3>
                  <p className="text-2xl sm:text-3xl font-black italic tracking-tighter mt-1" style={{ color: color, filter: `drop-shadow(0 0 10px ${color}50)` }}>
                    R$ {typeof product.price === 'number' ? product.price.toFixed(2).replace('.', ',') : product.price}
                  </p>
                </div>
              </motion.div>

              {/* Formulário de Contato */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <div className="relative group">
                  <User 
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 transition-colors duration-300" 
                    style={focusedField === 'name' ? { color: color } : {}} 
                  />
                  <input 
                    type="text" 
                    placeholder="SEU NOME"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    style={focusedField === 'name' ? { borderColor: color, boxShadow: `0 0 15px ${color}33` } : { borderColor: 'rgba(255,255,255,0.05)' }}
                    className="w-full bg-zinc-900/50 backdrop-blur-md border rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white placeholder:text-zinc-700 outline-none transition-all uppercase italic"
                  />
                </div>

                <div className="relative group">
                  <Phone 
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 transition-colors duration-300" 
                    style={focusedField === 'phone' ? { color: color } : {}}
                  />
                  <input 
                    type="tel" 
                    placeholder="TELEFONE WHATSAPP"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: formatPhone(e.target.value)})}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    style={focusedField === 'phone' ? { borderColor: color, boxShadow: `0 0 15px ${color}33` } : { borderColor: 'rgba(255,255,255,0.05)' }}
                    className="w-full bg-zinc-900/50 backdrop-blur-md border rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white placeholder:text-zinc-700 outline-none transition-all uppercase italic"
                  />
                </div>

                <div className="relative group">
                  <MessageSquare 
                    className="absolute left-4 top-4 w-4 h-4 text-zinc-600 transition-colors duration-300" 
                    style={focusedField === 'info' ? { color: color } : {}}
                  />
                  <textarea 
                    placeholder="INFORMAÇÕES ADICIONAIS (TAMANHO, COR...)"
                    rows={2}
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData({...formData, additionalInfo: e.target.value})}
                    onFocus={() => setFocusedField('info')}
                    onBlur={() => setFocusedField(null)}
                    style={focusedField === 'info' ? { borderColor: color, boxShadow: `0 0 15px ${color}33` } : { borderColor: 'rgba(255,255,255,0.05)' }}
                    className="w-full bg-zinc-900/50 backdrop-blur-md border rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white placeholder:text-zinc-700 outline-none transition-all resize-none uppercase italic"
                  />
                </div>

                {/* Confirm order button styled dynamically based on theme */}
                <button
                  onClick={handleSendOrder}
                  disabled={isSending || !formData.name || !formData.phone}
                  className="w-full text-black font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] italic disabled:opacity-40 mt-4 cursor-pointer relative overflow-hidden"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 10px 30px ${color}26, 0 0 15px ${color}40`,
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.boxShadow = `0 10px 40px ${color}40, 0 0 25px ${color}80`;
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.boxShadow = `0 10px 30px ${color}26, 0 0 15px ${color}40`;
                      e.currentTarget.style.transform = 'none';
                    }
                  }}
                >
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20" />
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Enviar Pedido via WhatsApp
                    </>
                  )}
                </button>
              </motion.div>
            </div>

            {/* Rodapé fixo no modal */}
            <div className="p-6 text-center text-[10px] text-zinc-600 uppercase tracking-[0.4em] font-bold mt-auto">
              © 2026 DOGGBITE • BRAZIL
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
