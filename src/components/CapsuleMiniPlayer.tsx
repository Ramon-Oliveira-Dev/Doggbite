import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  ChevronUp, 
  X, 
  ListMusic, 
  Disc, 
  Shuffle, 
  Repeat, 
  Repeat1,
  Minimize2,
  Maximize2
} from 'lucide-react';

export interface CapsuleMiniPlayerProps {
  currentSong: {
    title: string;
    image?: string;
    audio?: string;
    duration?: string;
    [key: string]: any;
  };
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
  progress: number;
  onSeek: (val: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  isShuffle?: boolean;
  toggleShuffle?: () => void;
  repeatMode?: 'none' | 'one' | 'all';
  toggleRepeat?: () => void;
  theme?: 'green' | 'orange';
  neonColor?: string;
  onOpenPlayer?: () => void;
  currentTime?: number;
  duration?: number;
  volume?: number;
  setVolume?: (val: number) => void;
  isMuted?: boolean;
  setIsMuted?: (val: boolean) => void;
  songs?: any[];
  onSelectSong?: (index: number) => void;
}

export function CapsuleMiniPlayer({
  currentSong,
  isPlaying,
  setIsPlaying,
  progress,
  onSeek,
  onNext,
  onPrev,
  onClose,
  isShuffle,
  toggleShuffle,
  repeatMode,
  toggleRepeat,
  theme = 'green',
  neonColor: customNeonColor,
  onOpenPlayer,
  currentTime = 0,
  duration = 0,
  volume = 1,
  setVolume,
  isMuted = false,
  setIsMuted,
  songs = [],
  onSelectSong
}: CapsuleMiniPlayerProps) {
  // Theme color values matching the active app theme
  const isOrange = theme === 'orange';
  const primaryColor = isOrange ? '#FF3B30' : '#A2FF00';
  const gradientColor = isOrange 
    ? 'from-[#e61a00] via-[#ff3b20] to-[#ff6600]' 
    : 'from-[#65b800] via-[#8cee00] to-[#baff2a]';
  const glowShadow = isOrange 
    ? 'rgba(255, 59, 48, 0.65)' 
    : 'rgba(162, 255, 0, 0.65)';

  // View state: 'capsule' (bar horizontal) or 'bubble' (disco de vinil flutuante com ondas)
  const [viewMode, setViewMode] = useState<'capsule' | 'bubble'>('capsule');
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Time formatting helper: M:SS
  const formatTime = (secs?: number, fallbackStr?: string) => {
    if (secs !== undefined && !isNaN(secs) && isFinite(secs) && secs > 0) {
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    }
    if (fallbackStr && typeof fallbackStr === 'string' && fallbackStr.includes(':')) {
      return fallbackStr;
    }
    return '0:00';
  };

  const formattedCurrent = formatTime(currentTime);
  const formattedDuration = formatTime(duration, currentSong?.duration || '3:30');

  // Vinyl cover image
  const coverImage = currentSong?.image || '/logo2.png';

  // Floating Bubble mode (Screenshot 1)
  if (viewMode === 'bubble') {
    return (
      <div className="fixed bottom-[92px] right-4 sm:right-7 z-40 select-none">
        <motion.div
          drag
          dragConstraints={{ left: -280, right: 20, top: -450, bottom: 20 }}
          dragElastic={0.1}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="relative cursor-pointer group"
          onClick={() => setViewMode('capsule')}
          title="Toque para expandir o mini player"
        >
          {/* Ondas acústicas pulsantes concêntricas (Acoustic Wave Rings) */}
          {isPlaying && (
            <>
              <motion.div
                animate={{
                  scale: [1, 1.45, 1.8],
                  opacity: [0.65, 0.35, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  ease: 'easeOut',
                }}
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  border: `2px solid ${primaryColor}`,
                  boxShadow: `0 0 16px ${primaryColor}80`,
                }}
              />
              <motion.div
                animate={{
                  scale: [1, 1.35, 1.65],
                  opacity: [0.55, 0.25, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  delay: 0.7,
                  ease: 'easeOut',
                }}
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  border: `1.5px solid ${primaryColor}`,
                  boxShadow: `0 0 12px ${primaryColor}60`,
                }}
              />
            </>
          )}

          {/* Disco de Vinil Giratório Flutuante */}
          <div 
            className="relative w-16 h-16 rounded-full bg-[#121212] border-2 flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.9)] overflow-visible"
            style={{ 
              borderColor: `${primaryColor}aa`,
              boxShadow: `0 0 25px ${glowShadow}`
            }}
          >
            {/* Ranhuras de vinil */}
            <motion.div
              animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'linear' }}
              className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: 'radial-gradient(circle, #242424 0%, #151515 50%, #0c0c0c 100%)'
              }}
            >
              {/* Ranhuras ópticas finas */}
              <div className="absolute inset-1.5 rounded-full border border-white/10 pointer-events-none" />
              <div className="absolute inset-3 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-4 rounded-full border border-white/10 pointer-events-none" />

              {/* Rótulo Central / Capa do Álbum */}
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-black/40 shadow-inner flex items-center justify-center">
                <img
                  src={coverImage}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
                {/* Furo central do fuso (spindle hole) com anel colorido */}
                <div 
                  className="absolute w-2.5 h-2.5 rounded-full bg-black border-2 shadow-sm"
                  style={{ borderColor: primaryColor }}
                />
              </div>

              {/* Reflexo luminoso acetinado de vinil */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 45%, transparent 55%, rgba(255,255,255,0.2) 100%)'
                }}
              />
            </motion.div>

            {/* Badge de Equalizador no Canto Superior Direito (Screenshot 1) */}
            <div 
              className="absolute -top-1 -right-1 z-20 w-6 h-6 rounded-full flex items-center justify-center shadow-lg border border-white/20"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 0 12px ${primaryColor}`
              }}
            >
              {/* Barras animadas do equalizador 'ılı' */}
              <div className="flex items-end gap-[1.5px] h-3 px-1">
                {[0, 1, 2].map((idx) => (
                  <motion.div
                    key={idx}
                    animate={isPlaying ? {
                      height: idx === 1 ? ['5px', '12px', '4px', '11px', '5px'] : ['3px', '9px', '12px', '5px', '3px']
                    } : { height: '3px' }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8 + idx * 0.2,
                      ease: 'easeInOut'
                    }}
                    className="w-[2px] bg-white rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Capsule Pill Mini-Player Mode (Screenshot 2)
  return (
    <div className="fixed bottom-[88px] sm:bottom-[92px] left-1/2 -translate-x-1/2 z-40 w-full max-w-[490px] px-3 pointer-events-auto select-none">
      
      {/* Drawer / Popover de Playlist quando aberto */}
      <AnimatePresence>
        {isPlaylistOpen && songs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-2 p-3 rounded-2xl bg-[#111111]/95 border border-white/15 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.95)] max-h-[230px] overflow-y-auto"
            style={{ borderColor: `${primaryColor}66` }}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-white/70 flex items-center gap-1.5">
                <ListMusic className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                Fila de Músicas
              </span>
              <button
                type="button"
                onClick={() => setIsPlaylistOpen(false)}
                className="p-1 rounded-full text-white/50 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              {songs.map((song, idx) => {
                const isActive = currentSong?.title === song.title;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (onSelectSong) onSelectSong(idx);
                      setIsPlaylistOpen(false);
                      setIsPlaying(true);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                      isActive 
                        ? 'bg-white/10 border' 
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                    style={isActive ? { borderColor: `${primaryColor}80` } : {}}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 bg-black/60 border border-white/10">
                        <img src={song.image || '/logo2.png'} alt={song.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <span className={`text-[11px] font-black uppercase tracking-wider block truncate ${isActive ? 'text-white' : 'text-white/70'}`}>
                          {song.title}
                        </span>
                        <span className="text-[9px] font-mono text-white/40">
                          {song.duration || '3:30'}
                        </span>
                      </div>
                    </div>

                    {isActive && (
                      <div className="flex items-end gap-[1.5px] h-3 px-1 flex-shrink-0">
                        {[0, 1, 2].map(b => (
                          <motion.div
                            key={b}
                            animate={isPlaying ? { height: ['3px', '11px', '4px'] } : { height: '3px' }}
                            transition={{ repeat: Infinity, duration: 0.6 + b * 0.2 }}
                            className="w-[2px] rounded-full"
                            style={{ backgroundColor: primaryColor }}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popover Mini Slider de Volume */}
      <AnimatePresence>
        {showVolumeSlider && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-2 p-2.5 rounded-2xl bg-[#141414]/95 border border-white/15 backdrop-blur-xl shadow-2xl flex items-center gap-3 w-44 ml-auto"
            style={{ borderColor: `${primaryColor}66` }}
          >
            <button
              type="button"
              onClick={() => setIsMuted && setIsMuted(!isMuted)}
              className="text-white/70 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (setVolume) setVolume(val);
                if (setIsMuted && isMuted && val > 0) setIsMuted(false);
              }}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-white bg-white/20"
              style={{
                accentColor: primaryColor
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* A CÁPSULA PRINCIPAL DO MINI PLAYER (Screenshot 2) */}
      <motion.div
        layout
        initial={{ y: 25, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 25, opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="relative w-full rounded-full bg-[#121212]/95 border backdrop-blur-2xl px-2.5 py-1.5 sm:px-3 sm:py-2 flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.85)] group/capsule overflow-hidden"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.12)',
          boxShadow: `0 12px 35px rgba(0,0,0,0.9), 0 0 25px ${glowShadow}`
        }}
      >
        {/* Glow sutil ambiente de fundo com a cor do tema */}
        <div 
          className="absolute -inset-1 blur-xl opacity-20 pointer-events-none transition-opacity duration-500"
          style={{ backgroundColor: primaryColor }}
        />

        {/* LADO ESQUERDO: Disco de Vinil Miniatura + Título + Timestamp */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2 relative z-10">
          
          {/* Disco de Vinil com rotação suave ao reproduzir */}
          <div 
            onClick={onOpenPlayer}
            className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1a1a1a] border border-white/20 flex-shrink-0 flex items-center justify-center cursor-pointer shadow-md group/disc"
            title="Clique para abrir o toca-discos expandido"
          >
            {/* Vinil giratório */}
            <motion.div
              animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              className="w-full h-full rounded-full flex items-center justify-center overflow-hidden relative"
              style={{
                background: 'radial-gradient(circle, #222222 0%, #161616 60%, #0a0a0a 100%)'
              }}
            >
              {/* Ranhuras gravadas finas */}
              <div className="absolute inset-1 rounded-full border border-white/10 pointer-events-none" />
              <div className="absolute inset-2 rounded-full border border-white/5 pointer-events-none" />

              {/* Centro com a Capa do Álbum */}
              <div className="relative w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full overflow-hidden flex items-center justify-center border border-black/40">
                <img
                  src={coverImage}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
                {/* Furo central do spindle com anel na cor do tema (vermelho/neon do print) */}
                <div 
                  className="absolute w-2 h-2 rounded-full bg-black border-[1.5px] shadow-sm"
                  style={{ borderColor: primaryColor }}
                />
              </div>

              {/* Reflexo radial óptico de acetato */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(255,255,255,0.2) 100%)'
                }}
              />
            </motion.div>
          </div>

          {/* Nome da Música e Marcador de Tempo (como no print '0:12 / 4:30') */}
          <div 
            className="min-w-0 cursor-pointer"
            onClick={onOpenPlayer}
          >
            <h4 className="text-[12px] sm:text-[13px] font-black uppercase text-white tracking-wider truncate leading-tight">
              {currentSong.title || 'DOGGBITE'}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span 
                className="text-[10px] sm:text-[11px] font-mono font-black tracking-wider leading-none"
                style={{ color: primaryColor }}
              >
                {formattedCurrent} / {formattedDuration}
              </span>
            </div>
          </div>

        </div>

        {/* CENTRO & DIREITA: Controles de Reprodução e Ações Rápidas */}
        <div className="flex items-center gap-1 sm:gap-2 relative z-10 flex-shrink-0">
          
          {/* Botão Anterior (SkipBack |◀) */}
          <button
            type="button"
            onClick={onPrev}
            className="p-1.5 sm:p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
            title="Música anterior"
          >
            <SkipBack className="w-4 h-4 fill-current text-white/80" />
          </button>

          {/* Botão Play / Pause Circular com Glow Vibrante (Círculo Vermelho/Neon do Print) */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center cursor-pointer shadow-lg bg-gradient-to-tr ${gradientColor}`}
            style={{
              boxShadow: `0 0 18px ${primaryColor}99, 0 4px 12px rgba(0,0,0,0.6)`
            }}
            title={isPlaying ? "Pausar" : "Reproduzir"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white fill-white" />
            ) : (
              <Play className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white fill-white translate-x-0.5" />
            )}
          </motion.button>

          {/* Botão Próximo (SkipForward ▶|) */}
          <button
            type="button"
            onClick={onNext}
            className="p-1.5 sm:p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
            title="Próxima música"
          >
            <SkipForward className="w-4 h-4 fill-current text-white/80" />
          </button>

          {/* Botão de Volume / Mute */}
          <button
            type="button"
            onClick={() => {
              if (setShowVolumeSlider) {
                setShowVolumeSlider(!showVolumeSlider);
              } else if (setIsMuted) {
                setIsMuted(!isMuted);
              }
            }}
            className="p-1.5 sm:p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
            title={isMuted ? "Ativar áudio" : "Volume"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-white/70" />
            )}
          </button>

          {/* Divisor Vertical '|' */}
          <div className="w-[1px] h-4 bg-white/20 mx-0.5 sm:mx-1 flex-shrink-0" />

          {/* Botão de Playlist / Fila de Músicas */}
          <button
            type="button"
            onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
            className={`p-1.5 sm:p-2 rounded-full active:scale-90 transition-all cursor-pointer ${
              isPlaylistOpen 
                ? 'bg-white/20 text-white' 
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title="Lista de reprodução"
          >
            <ListMusic className="w-4 h-4" style={isPlaylistOpen ? { color: primaryColor } : {}} />
          </button>

          {/* Botão Chevron Up '^' (Expandir Toca-Discos / Player Completo) */}
          <button
            type="button"
            onClick={onOpenPlayer}
            className="p-1.5 sm:p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
            title="Abrir reprodutor de vinil expandido"
          >
            <ChevronUp className="w-4 h-4 text-white/80" />
          </button>

          {/* Botão Minimizar para Bolha de Vinil ou Fechar */}
          <button
            type="button"
            onClick={() => setViewMode('bubble')}
            className="p-1.5 sm:p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
            title="Minimizar para bolha flutuante"
          >
            <Minimize2 className="w-3.5 h-3.5 text-white/70" />
          </button>

          {/* Botão Fechar 'X' */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
            title="Fechar reprodutor"
          >
            <X className="w-3.5 h-3.5" />
          </button>

        </div>

      </motion.div>
    </div>
  );
}
