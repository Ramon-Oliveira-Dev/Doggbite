import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Clock3, X, Maximize2, Share2, Check, Loader2, Timer, Flame, Zap } from 'lucide-react';

interface EventCardProps {
  imageSrc: string;
  title: string;
  dateDay: string;
  dateMonth: string;
  time: string;
  venue: string;
  addressLine1: string;
  addressLine2: string;
  status?: string;
  themeColor?: string;
  rawDate?: string;
}

const MONTH_NAMES_DICT: Record<string, number> = {
  JAN: 0, JANEIRO: 0,
  FEV: 1, FEVEREIRO: 1,
  MAR: 2, MARCO: 2, MARÇO: 2,
  ABR: 3, ABRIL: 3,
  MAI: 4, MAIO: 4,
  JUN: 5, JUNHO: 5,
  JUL: 6, JULHO: 6,
  AGO: 7, AGOSTO: 7,
  SET: 8, SETEMBRO: 8,
  OUT: 9, OUTUBRO: 9,
  NOV: 10, NOVEMBRO: 10,
  DEZ: 11, DEZEMBRO: 11
};

export function EventCard({
  imageSrc,
  title,
  dateDay,
  dateMonth,
  time,
  venue,
  addressLine1,
  addressLine2,
  status,
  themeColor,
  rawDate,
}: EventCardProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

  const color = themeColor || '#80ff00';

  // Cálculo da contagem regressiva para os próximos shows (< 14 dias)
  const countdown = useMemo(() => {
    const statusUpper = (status || '').toUpperCase().trim();
    if (statusUpper === 'REALIZADO' || statusUpper === 'ENCERRADO' || statusUpper === 'CANCELADO') {
      return null;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    let targetDate: Date | null = null;

    // 1. Tentar fazer parse do rawDate (ex: 2025-05-29 ou 29/05/2025 ou 29 MAI)
    if (rawDate && typeof rawDate === 'string' && rawDate.trim()) {
      const clean = rawDate.trim().toUpperCase();
      const isoMatch = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (isoMatch) {
        targetDate = new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10));
      } else {
        const dmyMatch = clean.match(/^(\d{1,2})[-/](\d{1,2})(?:[-/](\d{2,4}))?/);
        if (dmyMatch) {
          let y = currentYear;
          if (dmyMatch[3]) {
            const parsedY = parseInt(dmyMatch[3], 10);
            y = parsedY < 100 ? 2000 + parsedY : parsedY;
          }
          targetDate = new Date(y, parseInt(dmyMatch[2], 10) - 1, parseInt(dmyMatch[1], 10));
        }
      }
    }

    // 2. Se não parseou do rawDate, usar dateDay e dateMonth
    if (!targetDate && dateDay) {
      const dayNum = parseInt(dateDay.replace(/\D/g, ''), 10);
      let monthIdx = -1;
      if (dateMonth) {
        const mClean = dateMonth.toUpperCase().trim();
        if (/^\d+$/.test(mClean)) {
          monthIdx = parseInt(mClean, 10) - 1;
        } else {
          for (const [key, val] of Object.entries(MONTH_NAMES_DICT)) {
            if (mClean.includes(key)) {
              monthIdx = val;
              break;
            }
          }
        }
      }

      if (!isNaN(dayNum) && monthIdx >= 0) {
        targetDate = new Date(currentYear, monthIdx, dayNum);
        // Ajusta ano se já passou há mais de 30 dias neste ano
        const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        if (targetDate.getTime() < nowMidnight - (30 * 24 * 60 * 60 * 1000)) {
          targetDate.setFullYear(currentYear + 1);
        }
      }
    }

    if (!targetDate || isNaN(targetDate.getTime())) {
      return null;
    }

    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();

    const diffTime = targetMidnight - todayMidnight;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Apenas para shows a menos de 14 dias de distância e que ainda não passaram
    if (diffDays < 0 || diffDays >= 14) {
      return null;
    }

    if (diffDays === 0) {
      return { days: 0, text: 'É HOJE!', isUrgent: true };
    } else if (diffDays === 1) {
      return { days: 1, text: 'Falta 1 dia', isUrgent: true };
    } else {
      return { days: diffDays, text: `Faltam ${diffDays} dias`, isUrgent: diffDays <= 3 };
    }
  }, [rawDate, dateDay, dateMonth, status]);

  useEffect(() => {
    if (isLightboxOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      try {
        window.history.pushState({ isEventCardLightbox: true }, '');
      } catch (_) {}

      const handlePopState = () => {
        setIsLightboxOpen(false);
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsLightboxOpen(false);
        }
      };

      window.addEventListener('popstate', handlePopState);
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('popstate', handlePopState);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isLightboxOpen]);

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    try {
      if (window.history.state?.isEventCardLightbox) {
        window.history.back();
      }
    } catch (_) {}
  };

  const handleShare = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const getShareableUrl = () => {
      const origin = window.location.origin;
      if (origin.includes('-dev-')) {
        return origin.replace('-dev-', '-pre-');
      }
      return origin;
    };

    const shareUrl = getShareableUrl();
    setIsSharing(true);
    try {
      const shareText = `🔥 *DOGGBITE - ${title}* \n📅 Data: ${dateDay} de ${dateMonth}\n⏰ Horário: ${time}\n📍 Local: ${venue}\n🗺️ Endereço: ${addressLine1} - ${addressLine2}\n\nConfira os produtos e detalhes em nosso site oficial!`;

      // Try to fetch image first and share natively if Web Share API files feature is supported
      if (navigator.share && navigator.canShare) {
        try {
          // If the image starts with blob: or http, try fetching it
          const res = await fetch(imageSrc);
          const blob = await res.blob();
          const mimeType = blob.type || 'image/png';
          const ext = mimeType.split('/')[1] || 'png';
          const fileToShare = new File([blob], `doggbite_${dateDay}_${dateMonth}.${ext}`, { type: mimeType });

          const shareData: ShareData = {
            title: `DOGGBITE - ${title}`,
            text: shareText,
            files: [fileToShare],
            url: shareUrl
          };

          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            setShareSuccess('Compartilhado!');
            setTimeout(() => setShareSuccess(null), 2500);
            return;
          }
        } catch (imgErr) {
          console.warn("File share not supported or fetch failed, falling back to text/link share.", imgErr);
        }

        // Fallback to text + URL Web Share
        await navigator.share({
          title: `DOGGBITE - ${title}`,
          text: shareText,
          url: shareUrl
        });
        setShareSuccess('Compartilhado!');
        setTimeout(() => setShareSuccess(null), 2500);
        return;
      }

      // Clipboard fallback
      const fullText = `${shareText}\n\n🔗 Acesse: ${shareUrl}`;
      await navigator.clipboard.writeText(fullText);
      setShareSuccess('Copiado para o clipboard!');
      setTimeout(() => setShareSuccess(null), 2500);
    } catch (err: any) {
      console.error("Share failed", err);
      // Ultimate low level clipboard fallback
      try {
        await navigator.clipboard.writeText(`DOGGBITE - ${title} | ${dateDay} de ${dateMonth} @ ${venue}`);
        setShareSuccess('Dados copiados!');
        setTimeout(() => setShareSuccess(null), 2500);
      } catch (_) {
        setShareSuccess('Erro ao compartilhar');
        setTimeout(() => setShareSuccess(null), 2500);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const hoverAnimation = {
    y: -5,
    scale: 1.015,
    transition: { type: "spring", stiffness: 300, damping: 15 }
  };

  const glowOnHover = {
    boxShadow: `0 0 40px ${color}80`,
    transition: { duration: 0.3 }
  };

  return (
    <>
      <motion.div
        whileHover={{ ...hoverAnimation, ...glowOnHover }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="relative w-full max-w-[340px] p-4 pt-14 rounded-[24px] bg-gradient-to-b from-[#141414] to-[#080808] border overflow-hidden font-sans group flex flex-col justify-between"
        style={{
          borderColor: `${color}cc`,
          boxShadow: `0 0 20px -5px ${color}4d`
        }}
      >
        
        {/* Decorative background elements */}
        <div className="absolute -top-16 -right-16 w-44 h-44 blur-[60px] rounded-full pointer-events-none transition-colors duration-500" style={{ backgroundColor: `${color}0d` }} />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 blur-[60px] rounded-full pointer-events-none transition-colors duration-500" style={{ backgroundColor: `${color}0d` }} />

        {/* Mini-Card Horário (Canto Esquerdo Superior) */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1 px-2.5 py-1 rounded-lg border bg-black/80 backdrop-blur-md" style={{ borderColor: `${color}4d`, boxShadow: `0 0 8px ${color}26` }}>
          <Clock3 className="w-3.5 h-3.5" style={{ color: color }} />
          <span className="text-[10px] font-black text-white italic tracking-tighter">{time || '20:00'}</span>
        </div>

        {/* Tag de Status (Canto Direito Superior) */}
        <div 
          className="absolute top-4 right-4 z-20 px-2.5 py-1 rounded-lg border backdrop-blur-md text-[8px] font-black tracking-widest uppercase shadow-lg text-center"
          style={
            (status === 'CANCELADO' || status === 'ESGOTADO') 
              ? { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', boxShadow: '0 0 10px rgba(239,68,68,0.25)' }
              : (status === 'REALIZADO' || status === 'ENCERRADO')
              ? { borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.06)', color: '#d4d4d4', boxShadow: '0 0 10px rgba(255,255,255,0.05)' }
              : { borderColor: color, backgroundColor: `${color}1a`, color: color, boxShadow: `0 0 10px ${color}40` }
          }
        >
          {status || 'CONFIRMADO'}
        </div>

        <div>
          {/* Container do Pôster com Borda Neon Otimizado e Zoom */}
          <div className="flex justify-center mb-3 relative z-10 mt-1">
            <motion.div
              className="relative rounded-2xl p-1 border overflow-hidden cursor-zoom-in"
              style={{
                backgroundColor: `${color}1a`,
                borderColor: `${color}80`,
                boxShadow: `0 0 12px ${color}33`
              }}
              whileHover={{ scale: 1.03, boxShadow: `0 0 25px ${color}66`, transition: { duration: 0.2 }}}
              onClick={() => setIsLightboxOpen(true)}
              title="Clique para ampliar o pôster"
            >
              <img 
                src={imageSrc} 
                alt={`Pôster do evento ${title}`} 
                className="w-[125px] h-[125px] xs:w-[135px] xs:h-[135px] object-cover rounded-xl"
              />
              {/* Hover Indicator overlay */}
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <Maximize2 className="w-5 h-5" style={{ color: color, filter: `drop-shadow(0 0 8px ${color})` }} />
              </div>
            </motion.div>
          </div>

          {/* Contagem Regressiva Visual (< 14 dias) */}
          {countdown && (
            <div className="flex justify-center mb-2.5 relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border backdrop-blur-md shadow-lg select-none"
                style={{
                  borderColor: countdown.isUrgent ? 'rgba(239, 68, 68, 0.8)' : `${color}80`,
                  backgroundColor: countdown.isUrgent ? 'rgba(239, 68, 68, 0.16)' : `${color}14`,
                  boxShadow: countdown.isUrgent ? '0 0 16px rgba(239, 68, 68, 0.4)' : `0 0 14px ${color}2e`
                }}
              >
                {countdown.days === 0 ? (
                  <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse flex-shrink-0" />
                ) : countdown.isUrgent ? (
                  <Zap className="w-3.5 h-3.5 text-red-400 animate-pulse flex-shrink-0" />
                ) : (
                  <Timer className="w-3.5 h-3.5 flex-shrink-0" style={{ color: color }} />
                )}
                <span
                  className="text-[9.5px] font-black uppercase tracking-wider italic leading-none"
                  style={{ color: countdown.isUrgent ? '#ff4d4d' : color }}
                >
                  {countdown.text}
                </span>
              </motion.div>
            </div>
          )}

          {/* Título Principal Compacto */}
          <h2 className="text-lg sm:text-xl font-black text-center text-white tracking-widest uppercase italic drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-tight mb-4 px-1">
            {title ? (
              title.split(' ').map((word, index) => (
                index === title.split(' ').length - 1 ? (
                  <span key={index} style={{ color: color, filter: `drop-shadow(0 0 8px ${color}66)` }}>{word}</span>
                ) : (
                  word + ' '
                )
              ))
            ) : (
              <span style={{ color: color }}>SHOW CONFIRMADO</span>
            )}
          </h2>
        </div>

        {/* Seção de Detalhes - Compacta, sem scroll vertical (Data e Localização Lado a Lado) */}
        <div className="flex items-center gap-2.5 relative z-10 bg-white/[0.03] backdrop-blur-md border border-white/5 p-3 rounded-xl shadow-lg mt-auto min-h-[68px]">
          
          {/* Data */}
          <div className="flex flex-col items-center justify-center w-[50px] h-[50px] rounded-lg border border-white/10 bg-gradient-to-br from-[#202020] to-[#0c0c0c] shadow-inner flex-shrink-0">
            <span className="text-xl font-black leading-none tracking-tighter" style={{ color: color, filter: `drop-shadow(0 0 6px ${color}66)` }}>
              {dateDay || '29'}
            </span>
            <span className="text-[7px] font-black text-white/90 uppercase tracking-widest mt-0.5 opacity-80">
              {dateMonth || 'MAI'}
            </span>
          </div>

          {/* Divisor vertical */}
          <div className="w-[1px] h-9 bg-white/10 flex-shrink-0" />

          {/* Localização e Endereço */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: color }} />
              <div className="min-w-0 flex-1">
                <h3 className="text-[11px] sm:text-[12px] font-black text-white uppercase italic tracking-tight leading-tight break-words">
                  {venue}
                </h3>
                <div className="mt-1 space-y-0.5">
                  <p className="text-[8.5px] sm:text-[9.5px] font-bold text-gray-400 uppercase tracking-wider leading-tight break-words">
                    {addressLine1}
                  </p>
                  <p className="text-[8.5px] sm:text-[9.5px] font-bold text-gray-400 uppercase tracking-wider leading-tight break-words">
                    {addressLine2}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
        </div>

      </motion.div>

      {/* Lightbox / Imagem Tela Cheia com Portal no document.body para não ser afetado por transforms de pais */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isLightboxOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/92 backdrop-blur-md overflow-hidden select-none"
              onClick={closeLightbox}
            >
              {/* Esqueleto de fundo que fecha no clique */}
              <div className="absolute inset-0 w-full h-full pointer-events-none" />

              <motion.div
                initial={{ scale: 0.92, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 15 }}
                transition={{ type: "spring", damping: 26, stiffness: 360 }}
                className="relative w-full max-w-[340px] sm:max-w-[400px] max-h-[82dvh] sm:max-h-[85vh] bg-[#0c0c0c] border-2 rounded-[24px] shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col my-auto z-10"
                style={{ borderColor: color, boxShadow: `0 0 35px ${color}66` }}
                onClick={(e) => e.stopPropagation()} // Impede fechar ao clicar no corpo do modal
              >
                {/* Área da Imagem / Arte do Show (sem scroll vertical, escala automática proporcional) */}
                <div className="relative flex-1 min-h-0 flex items-center justify-center bg-black/80 p-2 sm:p-3 overflow-hidden">
                  <img
                    src={imageSrc}
                    alt={`Pôster do show ${title}`}
                    className="w-full h-auto max-h-[46dvh] sm:max-h-[52dvh] object-contain rounded-xl select-none"
                  />
                  
                  {/* Botão de Fechar no canto superior direito */}
                  <button
                    type="button"
                    onClick={closeLightbox}
                    className="absolute top-2.5 right-2.5 z-30 p-2 rounded-full bg-black/85 text-white border border-white/20 transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95 flex items-center justify-center"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = color;
                      e.currentTarget.style.color = '#000000';
                      e.currentTarget.style.borderColor = color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                    aria-label="Fechar modal de visualização"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Legenda e Botão de Compartilhar Compactos (Uma Linha Sem Scroll) */}
                <div className="bg-[#0e0e0e] px-3.5 py-2.5 sm:px-4 sm:py-3 border-t border-white/10 flex flex-row items-center justify-between gap-2.5 flex-shrink-0">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wider block italic truncate leading-tight" style={{ color: color, filter: `drop-shadow(0 0 5px ${color}59)` }}>
                      {title}
                    </span>
                    <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-0.5 truncate leading-tight">
                      {venue} {addressLine2 ? `— ${addressLine2}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={handleShare}
                    disabled={isSharing}
                    className="px-3 py-2 rounded-xl text-black font-black text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5 hover:scale-[1.03] active:scale-95 transition-all cursor-pointer duration-200 flex-shrink-0"
                    style={{
                      backgroundColor: color
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = `0 0 15px ${color}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {isSharing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : shareSuccess ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                    <span>{shareSuccess || 'Compartilhar'}</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
