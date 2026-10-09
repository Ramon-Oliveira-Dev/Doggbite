import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Clock3, 
  X, 
  Maximize2, 
  Share2, 
  Check, 
  Loader2, 
  Timer, 
  Flame, 
  Zap,
  Calendar,
  CalendarPlus,
  Download,
  Sparkles,
  ChevronDown
} from 'lucide-react';

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
  const [calendarMenuOpen, setCalendarMenuOpen] = useState(false);
  const [calendarFeedback, setCalendarFeedback] = useState<string | null>(null);

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

  // Date parsing for Google Calendar and Apple Calendar
  const parsedEventDates = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    let eventYear = currentYear;
    let eventMonth = now.getMonth();
    let eventDay = now.getDate();

    if (rawDate && typeof rawDate === 'string' && rawDate.trim()) {
      const clean = rawDate.trim().toUpperCase();
      const isoMatch = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (isoMatch) {
        eventYear = parseInt(isoMatch[1], 10);
        eventMonth = parseInt(isoMatch[2], 10) - 1;
        eventDay = parseInt(isoMatch[3], 10);
      } else {
        const dmyMatch = clean.match(/^(\d{1,2})[-/](\d{1,2})(?:[-/](\d{2,4}))?/);
        if (dmyMatch) {
          eventDay = parseInt(dmyMatch[1], 10);
          eventMonth = parseInt(dmyMatch[2], 10) - 1;
          if (dmyMatch[3]) {
            const parsedY = parseInt(dmyMatch[3], 10);
            eventYear = parsedY < 100 ? 2000 + parsedY : parsedY;
          }
        }
      }
    } else if (dateDay) {
      const dNum = parseInt(dateDay.replace(/\D/g, ''), 10);
      if (!isNaN(dNum)) eventDay = dNum;
      if (dateMonth) {
        const mClean = dateMonth.toUpperCase().trim();
        if (/^\d+$/.test(mClean)) {
          eventMonth = parseInt(mClean, 10) - 1;
        } else {
          for (const [key, val] of Object.entries(MONTH_NAMES_DICT)) {
            if (mClean.includes(key)) {
              eventMonth = val;
              break;
            }
          }
        }
      }
    }

    let startHour = 20;
    let startMinute = 0;
    if (time) {
      const timeParts = time.match(/(\d{1,2})[:h](\d{2})?/i);
      if (timeParts) {
        startHour = parseInt(timeParts[1], 10);
        if (timeParts[2]) {
          startMinute = parseInt(timeParts[2], 10);
        }
      }
    }

    const startDate = new Date(eventYear, eventMonth, eventDay, startHour, startMinute, 0);
    if (startDate.getTime() < now.getTime() - (60 * 24 * 60 * 60 * 1000) && !rawDate?.match(/\d{4}/)) {
      startDate.setFullYear(eventYear + 1);
    }
    const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // 3 horas de duração

    return { startDate, endDate };
  }, [rawDate, dateDay, dateMonth, time]);

  const triggerCalendarSuccess = (msg: string) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 60, 40]);
      } catch (_) {}
    }
    setCalendarFeedback(msg);
    setTimeout(() => {
      setCalendarFeedback(null);
    }, 3200);
  };

  const handleAddToGoogleCalendar = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const { startDate, endDate } = parsedEventDates;

    const pad = (n: number) => String(n).padStart(2, '0');
    const formatGoogleDate = (d: Date) => {
      return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    };

    const datesStr = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`;
    const eventTitle = `DOGGBITE - ${title} (@ ${venue})`;
    const locationStr = `${venue}, ${addressLine1}${addressLine2 ? ` - ${addressLine2}` : ''}`;
    const detailsStr = `Show ao vivo da banda DOGGBITE!\nHorário: ${time}\nLocal: ${venue}\nEndereço: ${locationStr}\nAcesse o site oficial da DOGGBITE para novidades e merch!`;

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${datesStr}&details=${encodeURIComponent(detailsStr)}&location=${encodeURIComponent(locationStr)}`;
    
    window.open(url, '_blank', 'noopener,noreferrer');
    triggerCalendarSuccess('Adicionado ao Google Agenda!');
    setCalendarMenuOpen(false);
  };

  const handleAddToAppleCalendar = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const { startDate, endDate } = parsedEventDates;

    const pad = (n: number) => String(n).padStart(2, '0');
    const formatIcsDate = (d: Date) => {
      return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
    };

    const nowStamp = formatIcsDate(new Date());
    const dtStart = formatIcsDate(startDate);
    const dtEnd = formatIcsDate(endDate);
    const locationStr = `${venue}, ${addressLine1}${addressLine2 ? ` - ${addressLine2}` : ''}`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//DOGGBITE//Shows Agenda//PT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:doggbite-${startDate.getTime()}-${Math.random().toString(36).substring(2, 9)}@doggbite.com`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:DOGGBITE - ${title}`,
      `DESCRIPTION:Apresentação ao vivo da banda DOGGBITE no ${venue}. Horário: ${time}. Local: ${locationStr}.`,
      `LOCATION:${locationStr}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT2H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Lembrete de Show da DOGGBITE!',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    try {
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `doggbite-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerCalendarSuccess('Arquivo .ics baixado!');
    } catch (err) {
      console.error("Falha ao gerar arquivo iCal", err);
    }
    setCalendarMenuOpen(false);
  };

  const closeLightbox = () => setIsLightboxOpen(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
        setCalendarMenuOpen(false);
      }
    };
    if (isLightboxOpen || calendarMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, calendarMenuOpen]);

  // Fechar menu de calendário ao clicar fora
  useEffect(() => {
    if (!calendarMenuOpen) return;
    const handleClickOutside = () => setCalendarMenuOpen(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [calendarMenuOpen]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSharing) return;
    setIsSharing(true);
    setShareSuccess(null);

    const shareUrl = window.location.href;
    const shareText = `🔥 DOGGBITE AO VIVO!\n\n📅 Data: ${dateDay} de ${dateMonth}\n⏰ Horário: ${time}\n📍 Local: ${venue}\n🗺️ Endereço: ${addressLine1}${addressLine2 ? ` - ${addressLine2}` : ''}\n\nGaranta sua presença!`;

    try {
      if (navigator.share) {
        try {
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
          console.warn("File share not supported, falling back to text/link", imgErr);
        }

        await navigator.share({
          title: `DOGGBITE - ${title}`,
          text: shareText,
          url: shareUrl
        });
        setShareSuccess('Compartilhado!');
        setTimeout(() => setShareSuccess(null), 2500);
        return;
      }

      const fullText = `${shareText}\n\n🔗 Acesse: ${shareUrl}`;
      await navigator.clipboard.writeText(fullText);
      setShareSuccess('Copiado!');
      setTimeout(() => setShareSuccess(null), 2500);
    } catch (err: any) {
      console.error("Share failed", err);
      try {
        await navigator.clipboard.writeText(`DOGGBITE - ${title} | ${dateDay} de ${dateMonth} @ ${venue}`);
        setShareSuccess('Copiado!');
        setTimeout(() => setShareSuccess(null), 2500);
      } catch (_) {
        setShareSuccess('Erro ao compartilhar');
        setTimeout(() => setShareSuccess(null), 2500);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const isShowPast = status === 'REALIZADO' || status === 'ENCERRADO';
  const isShowCancelled = status === 'CANCELADO' || status === 'ESGOTADO';

  return (
    <>
      <motion.div
        whileHover={{ y: -4, transition: { type: "spring", stiffness: 350, damping: 20 } }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative w-full max-w-[340px] rounded-2xl bg-[#0f0f0f]/95 border overflow-hidden font-sans group flex flex-col justify-between shadow-xl"
        style={{
          borderColor: `${color}40`,
          boxShadow: `0 10px 30px -10px rgba(0,0,0,0.8), 0 0 20px -8px ${color}26`
        }}
      >
        {/* Glow sutil de fundo */}
        <div 
          className="absolute -top-20 -right-20 w-48 h-48 blur-[70px] rounded-full pointer-events-none transition-opacity duration-300 opacity-20 group-hover:opacity-40" 
          style={{ backgroundColor: color }} 
        />
        <div 
          className="absolute -bottom-20 -left-20 w-48 h-48 blur-[70px] rounded-full pointer-events-none transition-opacity duration-300 opacity-10 group-hover:opacity-25" 
          style={{ backgroundColor: color }} 
        />

        {/* FEEDBACK FLUTUANTE DE SUCESSO (AGENDA / CLIPBOARD) */}
        <AnimatePresence>
          {calendarFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-2xl backdrop-blur-md"
              style={{
                backgroundColor: 'rgba(12, 12, 12, 0.95)',
                borderColor: color,
                boxShadow: `0 0 20px ${color}80`
              }}
            >
              <Check className="w-3.5 h-3.5 text-black p-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[10px] font-black tracking-wider uppercase text-white whitespace-nowrap">
                {calendarFeedback}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CONTEÚDO PRINCIPAL DO CARD */}
        <div className="p-4 space-y-3.5 relative z-20">
          
          {/* TOPO: HORÁRIO & STATUS */}
          <div className="flex items-center justify-between gap-2">
            {/* Horário de abertura */}
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border bg-black/70 backdrop-blur-md" 
              style={{ borderColor: `${color}33` }}
            >
              <Clock3 className="w-3.5 h-3.5" style={{ color: color }} />
              <span className="text-[10.5px] font-black text-white italic tracking-tight">
                {time ? `DOORS ${time}` : 'DOORS 20:00'}
              </span>
            </div>

            {/* Badge de Status */}
            <div 
              className="px-2.5 py-1 rounded-lg border backdrop-blur-md text-[8.5px] font-black tracking-widest uppercase shadow-sm"
              style={
                isShowCancelled
                  ? { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444' }
                  : isShowPast
                  ? { borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: '#a3a3a3' }
                  : { borderColor: `${color}66`, backgroundColor: `${color}14`, color: color }
              }
            >
              {status || 'CONFIRMADO'}
            </div>
          </div>

          {/* PÔSTER DO SHOW COM ZOOM LIGHTBOX */}
          <div className="flex justify-center relative">
            <motion.div
              className="relative rounded-xl p-1 border overflow-hidden cursor-zoom-in group/poster bg-black/60 shadow-md"
              style={{
                borderColor: `${color}40`,
              }}
              whileHover={{ scale: 1.025, borderColor: color, transition: { duration: 0.2 } }}
              onClick={() => setIsLightboxOpen(true)}
              title="Clique para ampliar o pôster"
            >
              <img 
                src={imageSrc} 
                alt={`Pôster do evento ${title}`} 
                className="w-[140px] h-[140px] object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded-lg">
                <Maximize2 className="w-5 h-5 text-white" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
              </div>
            </motion.div>
          </div>

          {/* CONTAGEM REGRESSIVA VISUAL (< 14 dias) */}
          {countdown && (
            <div className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border backdrop-blur-md select-none"
                style={{
                  borderColor: countdown.isUrgent ? 'rgba(239, 68, 68, 0.7)' : `${color}66`,
                  backgroundColor: countdown.isUrgent ? 'rgba(239, 68, 68, 0.15)' : `${color}14`,
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
                  className="text-[10px] font-black uppercase tracking-wider italic leading-none"
                  style={{ color: countdown.isUrgent ? '#ff5252' : color }}
                >
                  {countdown.text}
                </span>
              </motion.div>
            </div>
          )}

          {/* TÍTULO DO SHOW */}
          <h2 className="text-base sm:text-lg font-black text-center text-white tracking-wider uppercase italic drop-shadow-md leading-tight px-1">
            {title ? (
              title.split(' ').map((word, index) => (
                index === title.split(' ').length - 1 ? (
                  <span key={index} style={{ color: color }}>{word}</span>
                ) : (
                  word + ' '
                )
              ))
            ) : (
              <span style={{ color: color }}>SHOW CONFIRMADO</span>
            )}
          </h2>

          {/* BLOCO DE DATA & LOCAL ORGANIZADO */}
          <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 p-3 rounded-xl">
            {/* Bloco de Data Destacado */}
            <div 
              className="flex flex-col items-center justify-center w-[54px] h-[54px] rounded-lg border bg-gradient-to-b from-[#222] to-[#121212] flex-shrink-0 shadow-inner"
              style={{ borderColor: `${color}66` }}
            >
              <span className="text-2xl font-black leading-none tracking-tighter" style={{ color: color }}>
                {dateDay || '29'}
              </span>
              <span className="text-[8.5px] font-black text-white/90 uppercase tracking-widest mt-0.5">
                {dateMonth || 'MAI'}
              </span>
            </div>

            {/* Local e Endereço */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: color }} />
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-black text-white uppercase italic tracking-tight leading-tight truncate">
                    {venue}
                  </h3>
                  <div className="mt-0.5 space-y-0.5">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-tight truncate">
                      {addressLine1}
                    </p>
                    {addressLine2 && (
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-tight truncate">
                        {addressLine2}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTÕES DE AÇÃO: ADICIONAR À AGENDA & COMPARTILHAR */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Botão Agenda com Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCalendarMenuOpen(!calendarMenuOpen);
                }}
                className="w-full py-2.5 px-2.5 rounded-xl border font-black text-[9.5px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md hover:brightness-110 active:scale-95"
                style={{
                  backgroundColor: `${color}1a`,
                  borderColor: `${color}66`,
                  color: '#ffffff',
                }}
                title="Adicionar show ao calendário"
              >
                <CalendarPlus className="w-3.5 h-3.5 flex-shrink-0" style={{ color: color }} />
                <span className="truncate">Agenda</span>
                <ChevronDown className={`w-3 h-3 flex-shrink-0 text-white/70 transition-transform ${calendarMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Menu Google / Apple Calendar */}
              <AnimatePresence>
                {calendarMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-0 mb-2 w-[190px] rounded-xl bg-[#141414] border border-white/20 shadow-2xl p-1.5 z-50 flex flex-col gap-1 backdrop-blur-xl"
                    style={{ borderColor: `${color}66` }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-2 py-1 text-[8px] font-mono font-black uppercase tracking-wider text-white/50 border-b border-white/10 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" style={{ color: color }} />
                      <span>Salvar na Agenda</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddToGoogleCalendar}
                      className="w-full px-2.5 py-1.5 rounded-lg text-left text-[9.5px] font-black uppercase tracking-wide text-white hover:bg-white/10 flex items-center gap-2 transition-colors cursor-pointer group/opt"
                    >
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: color }} />
                      <div className="flex flex-col">
                        <span className="leading-none group-hover/opt:text-white">Google Agenda</span>
                        <span className="text-[7.5px] text-white/40 font-mono">Web / App</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddToAppleCalendar}
                      className="w-full px-2.5 py-1.5 rounded-lg text-left text-[9.5px] font-black uppercase tracking-wide text-white hover:bg-white/10 flex items-center gap-2 transition-colors cursor-pointer group/opt"
                    >
                      <Download className="w-3.5 h-3.5 flex-shrink-0" style={{ color: color }} />
                      <div className="flex flex-col">
                        <span className="leading-none group-hover/opt:text-white">Apple / iCal</span>
                        <span className="text-[7.5px] text-white/40 font-mono">Arquivo .ics</span>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Botão de Compartilhar */}
            <button
              type="button"
              onClick={handleShare}
              disabled={isSharing}
              className="w-full py-2.5 px-2.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-white font-black text-[9.5px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:brightness-110 active:scale-95 shadow-md"
            >
              {isSharing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
              ) : shareSuccess ? (
                <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
              ) : (
                <Share2 className="w-3.5 h-3.5 text-white/70 flex-shrink-0" />
              )}
              <span className="truncate">{shareSuccess || 'Compartilhar'}</span>
            </button>
          </div>

        </div>

      </motion.div>

      {/* LIGHTBOX / PÔSTER EM TELA CHEIA VIA PORTAL */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isLightboxOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md overflow-hidden select-none"
              onClick={closeLightbox}
            >
              <motion.div
                initial={{ scale: 0.92, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 15 }}
                transition={{ type: "spring", damping: 26, stiffness: 360 }}
                className="relative w-full max-w-[340px] sm:max-w-[400px] max-h-[85dvh] sm:max-h-[88vh] bg-[#0c0c0c] border-2 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto z-10"
                style={{ borderColor: color, boxShadow: `0 0 35px ${color}66` }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Imagem do Pôster */}
                <div className="relative flex-1 min-h-0 flex items-center justify-center bg-black/80 p-3 overflow-hidden">
                  <img
                    src={imageSrc}
                    alt={`Pôster do show ${title}`}
                    className="w-full h-auto max-h-[46dvh] sm:max-h-[52dvh] object-contain rounded-xl select-none"
                  />
                  
                  {/* Botão de Fechar */}
                  <button
                    type="button"
                    onClick={closeLightbox}
                    className="absolute top-2.5 right-2.5 z-30 p-2 rounded-full bg-black/85 text-white border border-white/20 transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95 flex items-center justify-center"
                    aria-label="Fechar modal de visualização"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Legenda e Ações Rápidas */}
                <div className="bg-[#111111] px-4 py-3 border-t border-white/10 flex flex-col gap-2.5 flex-shrink-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs sm:text-sm font-black uppercase tracking-wider block italic truncate leading-tight" style={{ color: color }}>
                        {title}
                      </span>
                      <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-0.5 truncate leading-tight">
                        {venue} {addressLine2 ? `— ${addressLine2}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={handleAddToGoogleCalendar}
                        className="px-2.5 py-1.5 rounded-lg border text-[8.5px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                        style={{
                          backgroundColor: `${color}14`,
                          borderColor: `${color}80`,
                          color: color
                        }}
                        title="Adicionar ao Google Agenda"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>+ Agenda</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleShare}
                        disabled={isSharing}
                        className="px-3 py-1.5 rounded-lg text-black font-black text-[8.5px] uppercase tracking-wider flex items-center gap-1.5 hover:scale-[1.03] active:scale-95 transition-all cursor-pointer"
                        style={{ backgroundColor: color }}
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
                  </div>
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
