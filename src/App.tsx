import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { 
  Home,
  Youtube, 
  Instagram, 
  Facebook, 
  Play, 
  Pause,
  ExternalLink, 
  Info, 
  Zap, 
  Disc, 
  Globe, 
  Newspaper, 
  MapPin,
  LayoutGrid,
  Video,
  Share2,
  Calendar,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  Palette,
  Skull,
  Flame,
  Lock,
  ShieldAlert,
  AlertTriangle,
  History,
  Sparkles,
  CalendarCheck,
  User,
  Plus,
  Trash2,
  LogOut,
  Save,
  Loader2,
  Edit2,
  Users,
  Upload,
  Image as ImageIcon,
  PlusCircle,
  Shirt,
  Search,
  MoreHorizontal,
  Brush,
  Shield,
  Download,
  Smartphone,
  Laptop,
  QrCode,
  RefreshCw,
  Mic,
  Music,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { ProductRegistration } from './components/ProductRegistration';
import { MemberRegistration } from './components/MemberRegistration';
import { StorePage } from './components/StorePage';
import { CheckoutModal } from './components/CheckoutModal';
import { EventCard } from './components/EventCard'; // COMPONENTE NOVO IMPORTADO AQUI
import { supabase } from './lib/supabase';
import { Show, Product } from './types';
import { DEFAULT_SHOWS, DEFAULT_MEMBERS, DEFAULT_PRODUCTS } from './lib/initialData';
import { SONG_LYRICS, getActiveLyricIndex, Word, LyricLine, formatLyricTimestamp } from './lib/lyrics';
import { safeStorage } from './lib/safeStorage';
import { SpotifyLyrics } from './components/SpotifyLyrics';
import { WaveformTrack } from './components/WaveformTrack';
import { VinylTurntable } from './components/VinylTurntable';
import { CassetteMiniPlayer } from './components/CassetteMiniPlayer';
import { CapsuleMiniPlayer } from './components/CapsuleMiniPlayer';

// --- Types ---
interface Tab {
  id: string;
  label: string;
  icon: ReactNode;
}

// --- Constants ---
const TABS: Tab[] = [
  { id: 'media', label: 'MÍDIA', icon: <Play className="w-5 h-5" /> },
  { id: 'shop', label: 'LOJA', icon: <Shirt className="w-5 h-5" /> },
  { id: 'home', label: 'INÍCIO', icon: <Home className="w-5 h-5" /> },
  { id: 'events', label: 'EVENTOS', icon: <Calendar className="w-5 h-5" /> },
  { id: 'band', label: 'BAND', icon: <User className="w-5 h-5" /> },
];

const ADMIN_TABS: Tab[] = [
  { id: 'agenda', label: 'AGENDA', icon: <Calendar className="w-5 h-5" /> },
  { id: 'banda', label: 'BANDA', icon: <Users className="w-5 h-5" /> },
  { id: 'merchan', label: 'MERCHAN', icon: <Shirt className="w-5 h-5" /> },
];

const pageTransitionVariants: Variants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 30 : direction < 0 ? -30 : 0,
    y: direction === 0 ? 12 : 0,
    scale: 0.985,
    filter: 'blur(4px)',
  }),
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.32,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -24 : direction < 0 ? 24 : 0,
    y: direction === 0 ? -10 : 0,
    scale: 0.985,
    filter: 'blur(4px)',
    transition: {
      duration: 0.22,
      ease: [0.32, 0, 0.67, 0] as const,
    },
  }),
};

const SHOWS = [
  { date: '15 MAI', venue: 'Correria Music Bar', city: 'Vila Velha, ES', status: 'CONFIRMADO' },
  { date: '22 MAI', venue: 'Matrix Music Hall', city: 'Cariacica, ES', status: 'CONFIRMADO' },
  { date: '05 JUN', venue: 'Hangar 110', city: 'São Paulo, SP', status: 'EM BREVE' },
];

const YOUTUBE_VIDEOS = [
  { id: 'R19lilz5lgs', title: 'CÃES DE RUA', duration: '03:45', isNew: true },
  { id: 'XNPWO170y-Q', title: 'RESPEITO', duration: '02:15', isNew: false },
  { id: '9fCd7nYOAP8', title: 'UM POR TODOS', duration: '04:10', isNew: false },
];

const SONGS = [
  { 
    title: 'Cães de Rua', 
    image: '/Cães de Rua.jpg',
    audio: '/Cães de Rua.mp3',
    duration: '02:50'
  },
  { 
    title: 'Doente', 
    image: '/Doente.jpg',
    audio: '/Doente.mp3',
    duration: '03:20'
  },
  { 
    title: 'Grilhões', 
    image: '/Grilhões.jpg',
    audio: '/Grilhões.mp3',
    duration: '02:46'
  },
  { 
    title: 'Respeito', 
    image: '/Respeito.png',
    audio: '/Respeito.mp3',
    duration: '03:44'
  },
  { 
    title: 'Um por Todos', 
    image: '/Um por todos.jpg',
    audio: '/Um por Todos.mp3',
    duration: '03:30'
  },
];

// SONG_LYRICS is now imported at the top of the file from ./lib/lyrics.ts with word-by-word alignment

const EXTERNAL_LINKS = [
  { name: 'Whiplash', url: 'https://whiplash.net/bandas/d/doggbite.html', icon: <Newspaper className="w-4 h-4" /> },
  { name: 'Headbangers News', url: 'https://www.headbangersnews.com.br/noticias/doggbite-o-harcore-capixaba-e-a-mordida-raivosa-no-single-caes-de-rua/', icon: <Newspaper className="w-4 h-4" /> },
  { name: 'Roadie Crew', url: 'https://roadiecrew.com/events/project46-limbo7-187-hc-doggbite-metalworks-vila-velha-es/', icon: <MapPin className="w-4 h-4" /> },
  { name: 'Behance (BH Moshpit)', url: 'https://www.behance.net/gallery/195348163/Doggbite-no-BH-MOSHPIT', icon: <LayoutGrid className="w-4 h-4" /> },
  { name: 'Mapa da Cultura ES', url: 'https://mapa.cultura.es.gov.br/agente/1389146/', icon: <MapPin className="w-4 h-4" /> },
];

// --- Components ---

const GlassCard = ({ children, className = "", style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div 
    style={style}
    className={`glass-2 metal-border rounded-3xl p-6 transition-all duration-500 hover:shadow-[0_0_40px_rgba(57,255,20,0.2)] relative overflow-hidden group ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

const MemberSkeleton = () => (
  <div className="glass-2 metal-border rounded-3xl overflow-hidden p-0">
    <div className="aspect-square skeleton" />
    <div className="p-4 space-y-3">
      <div className="h-6 w-3/4 skeleton rounded-lg" />
      <div className="h-3 w-1/2 skeleton rounded-lg" />
      <div className="space-y-2 pt-2">
        <div className="h-3 w-full skeleton rounded-lg" />
        <div className="h-3 w-5/6 skeleton rounded-lg" />
      </div>
    </div>
  </div>
);

const MemberCarousel = ({ images, name, role }: { images: string[], name: string, role: string }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="aspect-square relative overflow-hidden bg-zinc-900">
      <AnimatePresence>
        <motion.img
          key={images[index]}
          src={images[index] || 'https://picsum.photos/seed/band/800/800'}
          alt={name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "linear" }}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 will-change-transform"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('picsum.photos')) {
              target.src = 'https://picsum.photos/seed/error/800/800';
            }
          }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 z-10" />
      
      {/* Indicators */}
      {images.length > 1 && (
        <div className="absolute top-4 right-4 flex gap-1">
          {images.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-500 ${i === index ? 'w-4 bg-brand-neon' : 'w-1 bg-white/30'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Visualizer = ({ isPlaying }: { isPlaying: boolean }) => (
  <div className="flex items-end gap-[2px] h-6 md:h-8">
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        animate={isPlaying ? {
          height: [
            Math.random() * 100 + "%",
            Math.random() * 100 + "%",
            Math.random() * 100 + "%"
          ]
        } : { height: "20%" }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.05
        }}
        className="w-1 bg-brand-neon rounded-full"
        style={{ opacity: 0.4 + (i / 12) * 0.6 }}
      />
    ))}
  </div>
);

const YouTubeWidget = ({ videoId }: { videoId: string }) => (
  <div className="w-full aspect-video rounded-2xl overflow-hidden glass border-none">
    <iframe
      width="100%"
      height="100%"
      src={`https://www.youtube.com/embed/${videoId}`}
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  </div>
);

interface SongCardProps {
  song: any;
  index: number;
  activeTab: string;
  key?: any;
}

const MusicPlayerCard = ({ 
  songs, 
  currentIndex, 
  setCurrentIndex, 
  isPlaying, 
  setIsPlaying,
  progress,
  setProgress,
  duration,
  currentTime,
  onSeek,
  onSeekToTime,
  isShuffle,
  toggleShuffle,
  repeatMode,
  toggleRepeat,
  theme,
  volume,
  setVolume,
  isMuted,
  setIsMuted,
  onToggleFullScreen,
  audioRef
}: { 
  songs: any[], 
  currentIndex: number, 
  setCurrentIndex: (i: number) => void, 
  isPlaying: boolean, 
  setIsPlaying: (p: boolean) => void,
  progress: number,
  setProgress: (p: number) => void,
  duration: number,
  currentTime: number,
  onSeek: (time: number) => void,
  onSeekToTime: (time: number) => void,
  isShuffle: boolean,
  toggleShuffle: () => void,
  repeatMode: 'none' | 'one' | 'all',
  toggleRepeat: () => void,
  theme: 'green' | 'orange',
  volume: number,
  setVolume: (v: number) => void,
  isMuted: boolean,
  setIsMuted: (m: boolean) => void,
  onToggleFullScreen?: () => void,
  audioRef?: React.RefObject<HTMLAudioElement | null>
}) => {
  const [activeView, setActiveView] = useState<'player' | 'playlist' | 'lyrics'>('player');
  const currentSong = songs[currentIndex];

  const nextSong = () => {
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * songs.length);
      setCurrentIndex(randomIndex);
    } else {
      setCurrentIndex((currentIndex + 1) % songs.length);
    }
  };

  const prevSong = () => {
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * songs.length);
      setCurrentIndex(randomIndex);
    } else {
      setCurrentIndex((currentIndex - 1 + songs.length) % songs.length);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time) || time < 0) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-3xl mx-auto px-2 md:px-0"
    >
      <div className="relative group">
        {/* Dynamic Background Glow */}
        <div 
          className="absolute -inset-4 bg-brand-neon/5 blur-[50px] rounded-[32px] opacity-25 group-hover:opacity-40 transition-all duration-700 animate-pulse" 
          style={{ backgroundColor: `${THEMES[theme].neon}0f` }} 
        />
        
        <GlassCard className="p-0 overflow-hidden border-white/5 shadow-[0_24px_50px_rgba(0,0,0,0.65)] relative z-10 flex flex-col bg-white/[0.01] backdrop-blur-xl border border-white/10 rounded-3xl hover:border-white/15 transition-all duration-300">
          
          {/* Hardware Header Selectors */}
          <div className="flex border-b border-white/5 bg-black/35 px-3 md:px-5 py-2 items-center justify-center">
            {/* Expanded Selectors occupying full-width with extra touch target space */}
            <div className="flex w-full gap-2 bg-white/[0.015] p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setActiveView('player')}
                className={`flex-1 py-1.5 sm:py-2 rounded-lg text-xs md:text-sm font-extrabold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 hover:bg-white/5 cursor-pointer ${
                  activeView === 'player'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/40 hover:text-white/75'
                }`}
                style={{ color: activeView === 'player' ? THEMES[theme].neon : undefined }}
              >
                <Music className="w-3.5 h-3.5" />
                Player
              </button>
              <button
                onClick={() => setActiveView('playlist')}
                className={`flex-1 py-1.5 sm:py-2 rounded-lg text-xs md:text-sm font-extrabold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 hover:bg-white/5 cursor-pointer ${
                  activeView === 'playlist'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/40 hover:text-white/75'
                }`}
                style={{ color: activeView === 'playlist' ? THEMES[theme].neon : undefined }}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Playlist
              </button>
              <button
                onClick={() => setActiveView('lyrics')}
                className={`flex-1 py-1.5 sm:py-2 rounded-lg text-xs md:text-sm font-extrabold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 hover:bg-white/5 cursor-pointer ${
                  activeView === 'lyrics'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/40 hover:text-white/75'
                }`}
                style={{ color: activeView === 'lyrics' ? THEMES[theme].neon : undefined }}
              >
                <Mic className="w-3.5 h-3.5" />
                Letras
              </button>
            </div>
          </div>

          {/* Displays View Screen container with maximal size -> NO vertical screen scroll */}
          <div className="relative min-h-[200px] sm:min-h-[230px] md:min-h-[250px] flex items-center justify-center p-2 sm:p-3 bg-black/15 border-b border-t border-white/5">
            <AnimatePresence mode="wait">
              {activeView === 'player' && (
                <motion.div
                  key="player"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-[195px] sm:h-[225px] md:h-[245px] flex flex-col items-center justify-center"
                >
                  <div className="w-full flex flex-col items-center justify-center select-none text-center">
                    {/* Vinyl Turntable with Aged Sleeve, 33⅓ RPM Platter, Grooves & Mechanical Tonearm */}
                    <VinylTurntable 
                      currentSong={currentSong}
                      isPlaying={isPlaying}
                      onTogglePlay={() => setIsPlaying(!isPlaying)}
                      neonColor={THEMES[theme].neon}
                      theme={theme}
                    />
 
                    {/* Info & Metadata */}
                    <div className="space-y-0.5 w-full max-w-sm px-4 mt-0.5">
                      <motion.h4 
                        key={currentSong.title}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm sm:text-base md:text-lg font-bold text-white tracking-wide truncate uppercase leading-none"
                        style={{ fontFamily: "'Courier New', Courier, monospace" }}
                      >
                        {currentSong.title}
                      </motion.h4>
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-[7.5px] sm:text-[9px] font-black text-white/35 tracking-[0.25em] uppercase truncate">DOGGBITE • HARDCORE</p>
                        {isPlaying && (
                          <div className="flex items-center scale-75 origin-center">
                            <Visualizer isPlaying={isPlaying} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeView === 'playlist' && (
                <motion.div
                  key="playlist"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-[195px] sm:h-[225px] md:h-[245px] flex flex-col justify-start"
                >
                  <div className="flex items-center justify-between mb-1.5 border-b border-white/5 pb-1">
                    <p className="text-[8px] font-black uppercase text-white/30 tracking-[0.2em]">Selecione uma faixa da playlist</p>
                    <span className="text-[8px] font-black uppercase tracking-wider text-white/40">{songs.length} faixas</span>
                  </div>
                  <div className="flex-1 space-y-1.5 overflow-y-auto pr-1 select-none custom-scrollbar pb-1">
                    {songs.map((song, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); setIsPlaying(true); }}
                        className="w-full flex items-center gap-2.5 p-1.5 rounded-lg transition-all duration-300 group/item min-w-0 border text-left hover:bg-white/[0.04] cursor-pointer"
                        style={{
                          backgroundColor: currentIndex === i ? `${THEMES[theme].neon}0f` : 'rgba(255, 255, 255, 0.01)',
                          borderColor: currentIndex === i ? `${THEMES[theme].neon}30` : 'rgba(255, 255, 255, 0.03)'
                        }}
                      >
                        <div className="relative w-7 h-7 rounded overflow-hidden flex-shrink-0 border border-white/5">
                          <img src={song.image} alt="" className="w-full h-full object-cover" />
                          {currentIndex === i && isPlaying && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="w-1 h-1 rounded-full animate-ping" style={{ backgroundColor: THEMES[theme].neon }} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex items-center justify-between">
                          <div>
                            <p className="text-[8.5px] font-black uppercase tracking-widest truncate"
                               style={{ color: currentIndex === i ? THEMES[theme].neon : 'rgba(255, 255, 255, 0.85)' }}
                            >
                              {song.title}
                            </p>
                            <p className="text-[7px] font-bold uppercase text-white/20 tracking-wider">DOGGBITE</p>
                          </div>
                          {song.duration && (
                            <span className="font-mono text-[8.5px] font-medium opacity-60 flex-shrink-0 ml-2"
                                  style={{ color: currentIndex === i ? THEMES[theme].neon : 'rgba(255, 255, 255, 0.3)' }}
                            >
                              {song.duration}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeView === 'lyrics' && (
                <motion.div
                  key="lyrics"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="w-full h-[195px] sm:h-[225px] md:h-[245px] flex flex-col justify-start relative"
                >
                  <div className="absolute top-1 right-1 z-35">
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleFullScreen && onToggleFullScreen(); }}
                      className="p-1 px-2 rounded-lg bg-black/50 hover:bg-white/15 text-white/50 hover:text-white border border-white/10 transition-all text-[8.5px] flex items-center gap-1 cursor-pointer shadow-md active:scale-95"
                      title="Abrir em Tela Cheia"
                    >
                      <Maximize2 className="w-3 h-3" style={{ color: THEMES[theme].neon }} />
                      <span className="font-black uppercase tracking-wider hidden sm:inline">Tela Cheia</span>
                    </button>
                  </div>
                  <div className="flex-1 relative overflow-hidden h-full">
                    <SpotifyLyrics 
                      songTitle={currentSong.title} 
                      currentTime={currentTime} 
                      audioRef={audioRef}
                      themeColor={THEMES[theme].neon} 
                      onSeekToTime={onSeekToTime}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Unified Persistent Playback Controller & Timeline Section */}
          <div className="mt-auto bg-black/20">
            {/* Real Acoustic Waveform Track */}
            <div className="px-3 md:px-5 pt-1.5 pb-0.5" onPointerDown={(e) => e.stopPropagation()}>
              <WaveformTrack
                songTitle={currentSong?.title}
                progress={progress}
                currentTime={currentTime}
                duration={duration}
                isPlaying={isPlaying}
                onSeek={onSeek}
                neonColor={THEMES[theme].neon || '#00FF66'}
                variant="full"
                showTimeLabels={true}
              />
            </div>

            {/* Persistent Hardware Controls Deck row */}
            <div className="flex items-center justify-between px-3 md:px-5 pb-3 pt-1 bg-black/35 border-t border-white/5">
              {/* Playback modes (left) */}
              <div className="flex gap-1 items-center">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleShuffle(); }}
                  className="p-1.5 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer hover:bg-white/5"
                  style={{ 
                    color: isShuffle ? THEMES[theme].neon : 'rgba(255, 255, 255, 0.25)',
                    backgroundColor: isShuffle ? `${THEMES[theme].neon}15` : 'transparent',
                    borderColor: isShuffle ? `${THEMES[theme].neon}33` : 'transparent'
                  }}
                  title={isShuffle ? "Embaralhar: Ativo" : "Embaralhar: Inativo"}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleRepeat(); }}
                  className="p-1.5 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 relative cursor-pointer hover:bg-white/5"
                  style={{ 
                    color: repeatMode !== 'none' ? THEMES[theme].neon : 'rgba(255, 255, 255, 0.25)',
                    backgroundColor: repeatMode !== 'none' ? `${THEMES[theme].neon}15` : 'transparent',
                    borderColor: repeatMode !== 'none' ? `${THEMES[theme].neon}33` : 'transparent'
                  }}
                  title={
                    repeatMode === 'one' 
                      ? "Repetir: Uma música" 
                      : repeatMode === 'all' 
                      ? "Repetir: Todas as músicas" 
                      : "Repetir: Desativado"
                  }
                >
                  {repeatMode === 'one' ? (
                    <Repeat1 className="w-3.5 h-3.5" />
                  ) : (
                    <Repeat className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Central Audio Triad (center) */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); prevSong(); }}
                  className="text-white/40 hover:text-white transition-all duration-300 hover:scale-115 active:scale-90 cursor-pointer"
                >
                  <SkipBack className="w-4.5 h-4.5" />
                </button>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all duration-300 relative group/play cursor-pointer"
                  style={{ 
                    backgroundColor: THEMES[theme].neon,
                    boxShadow: `0 0 15px ${THEMES[theme].neon}50`
                  }}
                >
                  <div className="absolute inset-0 rounded-full animate-pulse opacity-10" style={{ backgroundColor: THEMES[theme].neon }} />
                  {isPlaying ? <Pause className="w-4 h-4 relative z-10" /> : <Play className="w-4 h-4 fill-current ml-0.5 relative z-10" />}
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); nextSong(); }}
                  className="text-white/40 hover:text-white transition-all duration-300 hover:scale-115 active:scale-90 cursor-pointer"
                >
                  <SkipForward className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Dynamic volume controller block (right) */}
              <div className="flex items-center" onPointerDown={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2 group/volume relative pl-2 md:pl-3 border-l border-white/5">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                    className="text-white/40 hover:text-white transition-all duration-300 hover:scale-110 flex-shrink-0 cursor-pointer"
                    title={isMuted ? "Ativar som" : "Desativar som"}
                    style={{ color: !isMuted ? THEMES[theme].neon : 'rgba(255, 255, 255, 0.4)' }}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-3.5 h-3.5 text-red-500" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      e.stopPropagation();
                      const val = parseFloat(e.target.value);
                      setVolume(val);
                      if (val > 0) setIsMuted(false);
                    }}
                    className="w-14 sm:w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer outline-none accent-white group-hover/volume:bg-white/20 transition-all custom-slider"
                    style={{
                      background: `linear-gradient(to right, ${THEMES[theme].neon} 0%, #ff7b00 ${65 * (isMuted ? 0 : volume)}%, #e11d48 ${100 * (isMuted ? 0 : volume)}%, rgba(255,255,255,0.1) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) 100%)`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
};

const MiniPlayer = ({ 
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
  onOpenPlayer,
  currentTime,
  duration,
  volume,
  setVolume,
  isMuted,
  setIsMuted,
  songs,
  onSelectSong
}: { 
  currentSong: any, 
  isPlaying: boolean, 
  setIsPlaying: (p: boolean) => void,
  progress: number,
  onSeek: (val: number) => void,
  onNext: () => void,
  onPrev: () => void,
  onClose: () => void,
  isShuffle?: boolean,
  toggleShuffle?: () => void,
  repeatMode?: 'none' | 'one' | 'all',
  toggleRepeat?: () => void,
  theme?: 'green' | 'orange',
  onOpenPlayer?: () => void,
  currentTime?: number,
  duration?: number,
  volume?: number,
  setVolume?: (val: number) => void,
  isMuted?: boolean,
  setIsMuted?: (val: boolean) => void,
  songs?: any[],
  onSelectSong?: (index: number) => void
}) => {
  const neonColor = theme === 'orange' ? '#FF5722' : '#A2FF00';

  return (
    <CapsuleMiniPlayer
      currentSong={currentSong}
      isPlaying={isPlaying}
      setIsPlaying={setIsPlaying}
      progress={progress}
      onSeek={onSeek}
      onNext={onNext}
      onPrev={onPrev}
      onClose={onClose}
      isShuffle={isShuffle}
      toggleShuffle={toggleShuffle}
      repeatMode={repeatMode}
      toggleRepeat={toggleRepeat}
      theme={theme}
      neonColor={neonColor}
      onOpenPlayer={onOpenPlayer}
      currentTime={currentTime}
      duration={duration}
      volume={volume}
      setVolume={setVolume}
      isMuted={isMuted}
      setIsMuted={setIsMuted}
      songs={songs}
      onSelectSong={onSelectSong}
    />
  );
};

const SplashScreen = ({ onComplete }: { onComplete: () => void; key?: string }) => {
  const [ripples, setRipples] = useState<{id: number, x: number, y: number}[]>([]);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    let clientX, clientY;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    if (clientX !== undefined && clientY !== undefined) {
      const newRipple = { id: Date.now(), x: clientX, y: clientY };
      setRipples(prev => [...prev, newRipple]);
    }
    onComplete();
  };

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#050505] cursor-pointer select-none"
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
    >
      {/* Background Image - Industrial Alley / Doggbite Doente */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-luminosity"
        style={{ backgroundImage: 'url("/Splash%20Screen.png")' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#022c16]/60 via-black/40 to-black/80" />

      {/* Content Center (No Card) */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.img 
          src="/logo2.png"
          alt="Doggbite Logo"
          className="w-[85vw] max-w-[480px] h-auto max-h-[240px] mb-8 object-contain drop-shadow-[0_0_40px_rgba(223,255,0,0.5)]"
          animate={{ 
            y: [0, -10, 0],
            filter: ["drop-shadow(0 0 15px rgba(223,255,0,0.3))", "drop-shadow(0 0 35px rgba(223,255,0,0.6))", "drop-shadow(0 0 15px rgba(223,255,0,0.3))"] 
          }}
          transition={{ 
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            filter: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        
        {/* Custom Loading Icon */}
        <div className="relative w-12 h-12 mb-4">
          <motion.div 
            className="absolute inset-0 border-2 border-[#DFFF00]/20 rounded-full"
          />
          <motion.div 
            className="absolute inset-0 border-t-2 border-[#DFFF00] rounded-full shadow-[0_0_15px_#DFFF00]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <span className="text-[10px] uppercase font-mono tracking-widest text-[#DFFF00]/70 animate-pulse">
          Toque em qualquer lugar para entrar
        </span>
      </motion.div>

      {/* Ripples & Particles */}
      {ripples.map(ripple => (
        <div key={ripple.id} className="absolute pointer-events-none z-50" style={{ left: ripple.x, top: ripple.y }}>
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-[#DFFF00]"
          />
          {/* Particles */}
          {[...Array(6)].map((_, i) => {
            const angle = (i * 60) * (Math.PI / 180);
            return (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ 
                  x: Math.cos(angle) * 80, 
                  y: Math.sin(angle) * 80, 
                  opacity: 0,
                  scale: 0
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute w-1.5 h-1.5 bg-[#DFFF00] rounded-full shadow-[0_0_8px_#DFFF00]"
              />
            )
          })}
        </div>
      ))}

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/5">
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: "linear" }}
          className="h-full bg-[#DFFF00] shadow-[0_0_20px_#DFFF00]"
        />
      </div>
    </motion.div>
  );
};

const THEMES = {
  green: {
    neon: '#A2FF00',
    bgStart: '#0c1c11',
    bgEnd: '#000000'
  },
  orange: {
    neon: '#FF5722',
    bgStart: '#1f2937',
    bgEnd: '#431407'
  }
};

const MONTH_NAMES_MAP: Record<string, number> = {
  'JAN': 0, 'JANEIRO': 0, 'JANUARY': 0,
  'FEV': 1, 'FEVEREIRO': 1, 'FEB': 1, 'FEBRUARY': 1,
  'MAR': 2, 'MARCO': 2, 'MARÇO': 2, 'MARCH': 2,
  'ABR': 3, 'ABRIL': 3, 'APR': 3, 'APRIL': 3,
  'MAI': 4, 'MAIO': 4, 'MAY': 4,
  'JUN': 5, 'JUNHO': 5, 'JUNE': 5,
  'JUL': 6, 'JULHO': 6, 'JULY': 6,
  'AGO': 7, 'AGOSTO': 7, 'AUG': 7, 'AUGUST': 7,
  'SET': 8, 'SETEMBRO': 8, 'SEP': 8, 'SEPTEMBER': 8,
  'OUT': 9, 'OUTUBRO': 9, 'OCT': 9, 'OCTOBER': 9,
  'NOV': 10, 'NOVEMBRO': 10, 'NOVEMBER': 10,
  'DEZ': 11, 'DEZEMBRO': 11, 'DEC': 11, 'DECEMBER': 11,
};

const MONTHS_SHORT_PT = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

export const getShowDateTimeValue = (dateStr?: string, timeStr?: string): number => {
  if (!dateStr || typeof dateStr !== 'string') return Number.MAX_SAFE_INTEGER;
  
  const cleanStr = dateStr.trim().toUpperCase().replace(/[.,]/g, ' ');
  const now = new Date();
  const currentYear = now.getFullYear();
  let year = currentYear;
  let month = 0;
  let day = 1;
  let hasParsed = false;

  // 1. Check for explicit 4-digit year in dateStr (e.g. 2024 to 2035)
  const yearMatch = cleanStr.match(/\b(20\d\d)\b/);
  if (yearMatch) {
    year = parseInt(yearMatch[1], 10);
  }

  // 2. Format: YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = cleanStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    year = parseInt(isoMatch[1], 10);
    month = parseInt(isoMatch[2], 10) - 1;
    day = parseInt(isoMatch[3], 10);
    hasParsed = true;
  }

  // 3. Format: DD/MM/YYYY or DD-MM-YYYY or DD/MM/YY or DD/MM
  if (!hasParsed) {
    const dmyMatch = cleanStr.match(/^(\d{1,2})[-/](\d{1,2})(?:[-/](\d{2,4}))?/);
    if (dmyMatch) {
      day = parseInt(dmyMatch[1], 10);
      month = parseInt(dmyMatch[2], 10) - 1;
      if (dmyMatch[3]) {
        const yVal = parseInt(dmyMatch[3], 10);
        year = yVal < 100 ? 2000 + yVal : yVal;
      }
      hasParsed = true;
    }
  }

  // 4. Format: Textual month (e.g. "15 MAI", "05 SET", "15 DE MAIO", "SET 05", "29 MAI 2025")
  if (!hasParsed) {
    const dayMatch = cleanStr.match(/\b(\d{1,2})\b/);
    if (dayMatch) {
      day = parseInt(dayMatch[1], 10);
    }

    for (const [mName, mIndex] of Object.entries(MONTH_NAMES_MAP)) {
      const regex = new RegExp(`\\b${mName}\\b`);
      if (regex.test(cleanStr)) {
        month = mIndex;
        hasParsed = true;
        break;
      }
    }
  }

  // Parse time (e.g. "22:00", "20h30", "19:45", "21h")
  let hours = 0;
  let minutes = 0;
  if (timeStr && typeof timeStr === 'string') {
    const timeMatch = timeStr.trim().match(/(\d{1,2})(?:[:hH](\d{2}))?/);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10) || 0;
      minutes = parseInt(timeMatch[2], 10) || 0;
    }
  }

  if (hasParsed) {
    return new Date(year, Math.max(0, Math.min(11, month)), Math.max(1, Math.min(31, day)), hours, minutes, 0, 0).getTime();
  }

  // Fallback: native Date.parse
  const nativeTime = Date.parse(dateStr);
  if (!isNaN(nativeTime)) {
    return nativeTime;
  }

  return Number.MAX_SAFE_INTEGER;
};

export const getShowEndDateTimeValue = (dateStr?: string, timeStr?: string): number => {
  if (!dateStr || typeof dateStr !== 'string') return 0;
  
  const startTime = getShowDateTimeValue(dateStr, timeStr);
  if (startTime === Number.MAX_SAFE_INTEGER) return Number.MAX_SAFE_INTEGER;
  
  // Se o show tem horário informado (ex: "21:00", "22h"), considera finalizado 4 horas após o início
  if (timeStr && typeof timeStr === 'string' && /\d/.test(timeStr)) {
    return startTime + (4 * 60 * 60 * 1000);
  }
  
  // Se não possui horário específico, o show permanece ativo até as 23:59:59 do dia da data
  const d = new Date(startTime);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();
};

export const isShowUpcoming = (show: Show, referenceTimestamp: number = Date.now()): boolean => {
  if (!show) return false;
  const statusUpper = (show.status || '').toUpperCase().trim();
  
  // Se marcado explicitamente como Realizado ou Encerrado
  if (statusUpper === 'REALIZADO' || statusUpper === 'ENCERRADO') {
    return false;
  }
  
  const endTime = getShowEndDateTimeValue(show.date, show.time);
  if (endTime === Number.MAX_SAFE_INTEGER) {
    return true; // Se não conseguir parsear, mantém em próximos por precaução
  }
  
  // É considerado próximo show se o momento atual ainda não ultrapassou o horário de término do evento
  return referenceTimestamp <= endTime;
};

export const getCategorizedShows = (showList: Show[], referenceTimestamp: number = Date.now()) => {
  const upcoming: Show[] = [];
  const past: Show[] = [];

  if (!Array.isArray(showList)) return { upcoming, past };

  for (const show of showList) {
    if (isShowUpcoming(show, referenceTimestamp)) {
      upcoming.push(show);
    } else {
      past.push(show);
    }
  }

  // Próximos shows: ordenados pela data mais próxima primeiro (ascendente)
  upcoming.sort((a, b) => {
    const timeA = getShowDateTimeValue(a.date, a.time);
    const timeB = getShowDateTimeValue(b.date, b.time);
    if (timeA !== timeB) return timeA - timeB;
    return (a.venue || '').localeCompare(b.venue || '');
  });

  // Shows anteriores: ordenados cronologicamente do mais recente para o mais antigo (descendente)
  past.sort((a, b) => {
    const timeA = getShowDateTimeValue(a.date, a.time);
    const timeB = getShowDateTimeValue(b.date, b.time);
    if (timeA !== timeB) return timeB - timeA;
    return (a.venue || '').localeCompare(b.venue || '');
  });

  return { upcoming, past };
};

export const sortShowsChronologically = (showList: Show[]): Show[] => {
  if (!Array.isArray(showList)) return [];
  const { upcoming, past } = getCategorizedShows(showList);
  return [...upcoming, ...past];
};

const parseShowDate = (dateStr: string) => {
  if (!dateStr) return { day: '00', month: '---' };
  
  const clean = dateStr.trim().toUpperCase();

  // If it's formatted as YYYY-MM-DD
  if (clean.includes('-') && /^\d{4}-\d{1,2}-\d{1,2}/.test(clean)) {
    try {
      const parts = clean.split('-');
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parts[2].padStart(2, '0');
      if (monthIndex >= 0 && monthIndex < 12) {
        return { day, month: MONTHS_SHORT_PT[monthIndex] };
      }
    } catch (_) {}
  }

  // If formatted as DD/MM/YYYY or DD/MM
  if (clean.includes('/')) {
    try {
      const parts = clean.split('/');
      const day = parts[0].padStart(2, '0');
      const monthIndex = parseInt(parts[1], 10) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        return { day, month: MONTHS_SHORT_PT[monthIndex] };
      }
    } catch (_) {}
  }
  
  // Format with month token (e.g. "21 JUN", "21 de Junho", "15 MAI")
  const dayMatch = clean.match(/\b(\d{1,2})\b/);
  const day = dayMatch ? dayMatch[1].padStart(2, '0') : '00';

  for (const [key, idx] of Object.entries(MONTH_NAMES_MAP)) {
    if (new RegExp(`\\b${key}\\b`).test(clean)) {
      return { day, month: MONTHS_SHORT_PT[idx] };
    }
  }
  
  // Fallback split
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length >= 2) {
    const d = parts[0].padStart(2, '0');
    let m = parts[parts.length - 1].toUpperCase();
    if (parts.length === 3 && parts[1].toLowerCase() === 'de') {
      m = parts[2].toUpperCase().substring(0, 3);
    }
    return { day: d, month: m.substring(0, 3) };
  }
  
  const numericPrefix = dateStr.match(/^\d+/);
  if (numericPrefix) {
    const d = numericPrefix[0].padStart(2, '0');
    const m = dateStr.replace(/^\d+/, '').trim().toUpperCase().substring(0, 3) || 'SHOW';
    return { day: d, month: m };
  }
  
  return { day: dateStr.substring(0, 2), month: dateStr.substring(2).toUpperCase() || 'SHOW' };
};

const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [tabDirection, setTabDirection] = useState(0);
  const [adminTabDirection, setAdminTabDirection] = useState(0);
  const mainScrollRef = React.useRef<HTMLElement>(null);

  const handleTabChange = (newTab: string) => {
    if (newTab === activeTab) return;
    const currentIndex = TABS.findIndex((t) => t.id === activeTab);
    const newIndex = TABS.findIndex((t) => t.id === newTab);
    setTabDirection(newIndex > currentIndex ? 1 : -1);
    setActiveTab(newTab);
    setSelectedMember(null);
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleAdminTabChange = (newAdminTab: 'agenda' | 'banda' | 'merchan') => {
    if (newAdminTab === adminTab) return;
    const currentIndex = ADMIN_TABS.findIndex((t) => t.id === adminTab);
    const newIndex = ADMIN_TABS.findIndex((t) => t.id === newAdminTab);
    setAdminTabDirection(newIndex > currentIndex ? 1 : -1);
    setAdminTab(newAdminTab);
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(YOUTUBE_VIDEOS[0]);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (currentScrollY > lastScrollY && currentScrollY > 50) {
      setShowHeader(false);
    } else {
      setShowHeader(true);
    }
    setLastScrollY(currentScrollY);
  };
  const [theme, setTheme] = useState<'green' | 'orange'>('green');
  const [shows, setShows] = useState<Show[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingShows, setIsLoadingShows] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminTab, setAdminTab] = useState<'agenda' | 'banda' | 'merchan'>('agenda');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<any>(null);
  const [memberDeleteConfirm, setMemberDeleteConfirm] = useState<any>(null);
  const [productDeleteConfirm, setProductDeleteConfirm] = useState<any>(null);
  const [editingShowId, setEditingShowId] = useState<any>(null);
  const [isShowFormOpen, setIsShowFormOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<any>(null);
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const [appShareSuccess, setAppShareSuccess] = useState(false);
  const [isNetworkViewOpen, setIsNetworkViewOpen] = useState(false);
  const [isUpdatingApp, setIsUpdatingApp] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());

  // Atualização em tempo real do timestamp para mover shows expirados automaticamente
  useEffect(() => {
    const updateTime = () => setNowTimestamp(Date.now());
    const interval = setInterval(updateTime, 30000); // Verifica a cada 30 segundos
    window.addEventListener('focus', updateTime);
    document.addEventListener('visibilitychange', updateTime);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', updateTime);
      document.removeEventListener('visibilitychange', updateTime);
    };
  }, []);

  const handleForceUpdateApp = async () => {
    setIsUpdatingApp(true);
    try {
      // 1. Unregister Service Workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      
      // 2. Clear caches keys completely
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }
      
      setUpdateSuccess(true);
      setTimeout(() => {
        // 3. Forced reload
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Erro ao atualizar o aplicativo:", err);
      // Fallback direct reload
      window.location.reload();
    } finally {
      setIsUpdatingApp(false);
    }
  };

  const getShareableUrl = () => {
    const origin = window.location.origin;
    if (origin.includes('-dev-')) {
      return origin.replace('-dev-', '-pre-');
    }
    return origin;
  };

  const handleShareAppLink = async () => {
    const shareUrl = getShareableUrl();
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'DOGGBITE - Oficial App',
          text: 'Fique por dentro da agenda de shows, lançamentos, mídias e produtos oficiais da DOGGBITE!',
          url: shareUrl
        });
        setAppShareSuccess(true);
        setTimeout(() => setAppShareSuccess(false), 2500);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setAppShareSuccess(true);
        setTimeout(() => setAppShareSuccess(false), 2000);
      }
    } catch (err) {
      console.warn("Error sharing app link", err);
      try {
        await navigator.clipboard.writeText(shareUrl);
        setAppShareSuccess(true);
        setTimeout(() => setAppShareSuccess(false), 2000);
      } catch (_) {}
    }
  };
  const [newShow, setNewShow] = useState<Show>({ date: '', time: '', venue: '', city: '', state: '', status: 'CONFIRMADO', image_url: '', address: '', name: '' });
  const [showImageFile, setShowImageFile] = useState<File | null>(null);
  const [newMember, setNewMember] = useState({ name: '', role: '', image_url: '', description: '', gallery: [] as string[] });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);

  // Player State
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlayerActive, setIsPlayerActive] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('all');
  const [isShuffle, setIsShuffle] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLyricsFullScreen, setIsLyricsFullScreen] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'none') return 'all';
      if (prev === 'all') return 'one';
      return 'none';
    });
  };

  useEffect(() => {
    if (isPlaying) setIsPlayerActive(true);
  }, [isPlaying]);

  // Intercept device back button / swipe back gesture gracefully
  const isPopStateRef = React.useRef(false);

  // Initial history state on first render
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.history && !window.history.state) {
        window.history.replaceState({
          activeTab: 'home',
          isAdminMode: false,
          selectedMemberId: null,
          selectedProductId: null,
          isCheckoutOpen: false,
          isInstallGuideOpen: false,
          showMenu: false,
          isNetworkViewOpen: false
        }, '');
      }
    } catch (_) {}

    const handlePopState = (event: PopStateEvent) => {
      try {
        if (event.state) {
          isPopStateRef.current = true;
          
          if (event.state.activeTab && event.state.activeTab !== activeTab) {
            const currentIndex = TABS.findIndex((t) => t.id === activeTab);
            const newIndex = TABS.findIndex((t) => t.id === event.state.activeTab);
            setTabDirection(newIndex > currentIndex ? 1 : -1);
            setActiveTab(event.state.activeTab);
          } else if (event.state.activeTab) {
            setActiveTab(event.state.activeTab);
          }
          setIsAdminMode(event.state.isAdminMode || false);
          setIsCheckoutOpen(event.state.isCheckoutOpen || false);
          setIsInstallGuideOpen(event.state.isInstallGuideOpen || false);
          setShowMenu(event.state.showMenu || false);
          setIsNetworkViewOpen(event.state.isNetworkViewOpen || false);

          // For member, find or set directly
          if (event.state.selectedMemberId) {
            const cachedMembersStr = safeStorage.getItem('dogg_members');
            if (cachedMembersStr) {
              try {
                const localMembers = JSON.parse(cachedMembersStr);
                const found = localMembers.find((m: any) => m.id === event.state.selectedMemberId);
                setSelectedMember(found || null);
              } catch (_) {
                setSelectedMember(null);
              }
            }
          } else {
            setSelectedMember(null);
          }

          // For product, find or set directly
          if (event.state.selectedProductId) {
            const cachedProductsStr = safeStorage.getItem('dogg_products');
            if (cachedProductsStr) {
              try {
                const localProducts = JSON.parse(cachedProductsStr);
                const found = localProducts.find((p: any) => p.id === event.state.selectedProductId);
                setSelectedProduct(found || null);
              } catch (_) {
                setSelectedProduct(null);
              }
            }
          } else {
            setSelectedProduct(null);
          }

          setTimeout(() => {
            isPopStateRef.current = false;
          }, 50);
        }
      } catch (_) {}
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Sync state changes to browser history
  useEffect(() => {
    if (showSplash) return; // Don't track deep state while splash is on
    if (isPopStateRef.current) return;

    try {
      if (typeof window === 'undefined' || !window.history) return;

      const currentHistoryState = {
        activeTab,
        isAdminMode,
        selectedMemberId: selectedMember?.id || null,
        selectedProductId: selectedProduct?.id || null,
        isCheckoutOpen,
        isInstallGuideOpen,
        showMenu,
        isNetworkViewOpen
      };

      const prevHistoryState = window.history.state;
      if (
        prevHistoryState &&
        prevHistoryState.activeTab === currentHistoryState.activeTab &&
        prevHistoryState.isAdminMode === currentHistoryState.isAdminMode &&
        prevHistoryState.selectedMemberId === currentHistoryState.selectedMemberId &&
        prevHistoryState.selectedProductId === currentHistoryState.selectedProductId &&
        prevHistoryState.isCheckoutOpen === currentHistoryState.isCheckoutOpen &&
        prevHistoryState.isInstallGuideOpen === currentHistoryState.isInstallGuideOpen &&
        prevHistoryState.showMenu === currentHistoryState.showMenu &&
        prevHistoryState.isNetworkViewOpen === currentHistoryState.isNetworkViewOpen
      ) {
        return;
      }

      window.history.pushState(currentHistoryState, '');
    } catch (_) {}
  }, [
    activeTab,
    isAdminMode,
    selectedMember,
    selectedProduct,
    isCheckoutOpen,
    isInstallGuideOpen,
    showMenu,
    isNetworkViewOpen,
    showSplash
  ]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Playback prevented or error:", error);
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSongIndex]);

  // Sincroniza o volume local do player com o elemento de áudio (com proteção contra loops redundantes)
  useEffect(() => {
    if (audioRef.current) {
      const targetVolume = isMuted ? 0 : volume;
      if (audioRef.current.volume !== targetVolume) {
        audioRef.current.volume = targetVolume;
      }
    }
  }, [volume, isMuted, currentSongIndex]);

  // Sincroniza o estado da UI com as alterações físicas de volume do dispositivo nativo (volumechange)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleVolumeChange = () => {
      const currentVol = audio.volume;
      const currentMuted = audio.muted;
      setVolume(currentVol);
      setIsMuted(currentMuted || currentVol === 0);
    };

    audio.addEventListener('volumechange', handleVolumeChange);
    return () => {
      audio.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  // Sincronização em alta precisão (requestAnimationFrame) da timeline e letra da música
  useEffect(() => {
    let animFrame: number;
    const tick = () => {
      if (audioRef.current && isPlaying) {
        const current = audioRef.current.currentTime;
        const dur = audioRef.current.duration;
        setCurrentTime(current);
        if (dur && !isNaN(dur) && isFinite(dur)) {
          setDuration(dur);
          setProgress((current / dur) * 100);
        }
        animFrame = requestAnimationFrame(tick);
      }
    };
    if (isPlaying) {
      animFrame = requestAnimationFrame(tick);
    }
    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [isPlaying, currentSongIndex]);

  const onTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      setCurrentTime(current);
      if (dur && !isNaN(dur) && isFinite(dur)) {
        setDuration(dur);
        setProgress((current / dur) * 100);
      } else {
        if (duration && !isNaN(duration) && isFinite(duration)) {
          setProgress((current / duration) * 100);
        } else {
          setProgress(0);
        }
      }
    }
  };

  const onEnded = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => console.error(err));
      }
    } else if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * SONGS.length);
      setCurrentSongIndex(randomIndex);
    } else if (repeatMode === 'all') {
      setCurrentSongIndex((prev) => (prev + 1) % SONGS.length);
    } else {
      // none
      if (currentSongIndex < SONGS.length - 1) {
        setCurrentSongIndex((prev) => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }
  };

  const onSeek = (val: number) => {
    if (audioRef.current) {
      const dur = audioRef.current.duration;
      if (dur && !isNaN(dur) && isFinite(dur)) {
        const time = (val / 100) * dur;
        audioRef.current.currentTime = time;
        setProgress(val);
        setCurrentTime(time);
      } else if (duration && !isNaN(duration) && isFinite(duration)) {
        const time = (val / 100) * duration;
        audioRef.current.currentTime = time;
        setProgress(val);
        setCurrentTime(time);
      }
    }
  };

  const onSeekToTime = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      const dur = audioRef.current.duration || duration;
      if (dur && !isNaN(dur) && isFinite(dur) && dur > 0) {
        setProgress((time / dur) * 100);
      }
    }
  };

  const currentTheme = THEMES[theme];

  useEffect(() => {
    // Populate or restore safeStorage with full defaults if missing, incomplete or containing legacy dummy data
    const cachedShowsStr = safeStorage.getItem('dogg_shows');
    let localShows: Show[] = [];
    if (cachedShowsStr) {
      try { localShows = JSON.parse(cachedShowsStr); } catch (_) {}
    }
    if (!Array.isArray(localShows) || localShows.length === 0) {
      safeStorage.setItem('dogg_shows', JSON.stringify(DEFAULT_SHOWS));
    }

    const cachedMembersStr = safeStorage.getItem('dogg_members');
    let localMembers: any[] = [];
    if (cachedMembersStr) {
      try { localMembers = JSON.parse(cachedMembersStr); } catch (_) {}
    }
    const hasDaniloOrLegacy = localMembers.some(m => m.name === 'MC Dogg' || m.name === 'DJ Bite' || m.name?.includes('Danilo "Doggo"'));
    if (!Array.isArray(localMembers) || localMembers.length === 0 || hasDaniloOrLegacy || !safeStorage.getItem('dogg_initialized_v6')) {
      safeStorage.setItem('dogg_members', JSON.stringify(DEFAULT_MEMBERS));
      setMembers(DEFAULT_MEMBERS);
    }

    const cachedProductsStr = safeStorage.getItem('dogg_products');
    let localProducts: Product[] = [];
    if (cachedProductsStr) {
      try { localProducts = JSON.parse(cachedProductsStr); } catch (_) {}
    }
    if (!Array.isArray(localProducts) || localProducts.length < 3) {
      safeStorage.setItem('dogg_products', JSON.stringify(DEFAULT_PRODUCTS));
    }
    safeStorage.setItem('dogg_initialized_v6', 'true');

    fetchShows();
    fetchMembers();
    fetchProducts();
    
    // Check for existing session with catch block
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setIsLoggedIn(!!session);
        setUser(session?.user || null);
      })
      .catch((err) => {
        console.warn("Could not retrieve auth session due to connection issue (offline mode active):", err);
      });

    // Listen for auth changes with safety guards
    let subscription: any = null;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsLoggedIn(!!session);
        setUser(session?.user || null);
      });
      subscription = data.subscription;
    } catch (err) {
      console.warn("Auth state change subscription failed (offline setup):", err);
    }

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If running standalone, hide any banners
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (isStandaloneMode) {
      setShowInstallBanner(false);
    } else {
      // Check if iOS or other devices to allow manual install view
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOSDevice) {
        setShowInstallBanner(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    // Dynamic adaptive PWA settings based on active theme
    const themeColor = theme === 'green' ? '#A2FF00' : '#FF5722';
    const iconUrl = '/icon-192.png?v=6';
    const appleIconUrl = '/icon-180.png?v=6';

    // 1. Update document head elements
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#050505'); // Maintain solid obsidian background
    }

    const favicon = document.getElementById('favicon');
    if (favicon) {
      favicon.setAttribute('href', iconUrl);
    }

    const appleTouchIcon = document.getElementById('apple-touch-icon');
    if (appleTouchIcon) {
      appleTouchIcon.setAttribute('href', appleIconUrl);
    }

    // 2. Generate a dynamic JSON manifest as a Blob Data URL
    const customManifest = {
      name: "DOGGBITE",
      short_name: "DOGGBITE",
      description: "DOGGBITE - A mordida mais raivosa do hardcore",
      start_url: "/",
      display: "standalone",
      background_color: "#FFFFFF",
      theme_color: themeColor,
      orientation: "portrait",
      icons: [
        {
          src: "/icon-180.png?v=6",
          sizes: "180x180 563x563",
          type: "image/png",
          purpose: "any"
        },
        {
          src: "/icon-192.png?v=6",
          sizes: "192x192 600x600",
          type: "image/png",
          purpose: "any"
        },
        {
          src: "/icon-192.png?v=6",
          sizes: "192x192 600x600",
          type: "image/png",
          purpose: "maskable"
        },
        {
          src: "/icon-512.png?v=6",
          sizes: "512x512 1600x1600",
          type: "image/png",
          purpose: "any maskable"
        }
      ]
    };

    // Keep static manifest url to avoid CORS/blob origin issues in sandboxed environments
    const pwaManifest = document.getElementById('pwa-manifest');
    if (pwaManifest && !pwaManifest.getAttribute('href')) {
      pwaManifest.setAttribute('href', '/manifest.json?v=6');
    }
  }, [theme]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`PWA Install Choice: ${outcome}`);
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          setShowInstallBanner(false);
        }
      } catch (err) {
        console.warn("Error prompting PWA install:", err);
        setIsInstallGuideOpen(true);
      }
    } else {
      setIsInstallGuideOpen(true);
    }
  };

  const fetchShows = async () => {
    setIsLoadingShows(true);
    try {
      const { data, error } = await supabase
        .from('shows')
        .select('*');
      
      if (error) throw error;
      
      const loadedShows = data || [];
      
      // Get any local offline-only/temporary shows from safeStorage
      const cachedShowsStr = safeStorage.getItem('dogg_shows');
      let localShows: Show[] = [];
      if (cachedShowsStr) {
        try { localShows = JSON.parse(cachedShowsStr); } catch (_) {}
      }
      if (!Array.isArray(localShows) || localShows.length === 0) {
        localShows = DEFAULT_SHOWS;
      }
      
      // Keep only local shows that have 'local_' id or are not present in Supabase (robust duplicate detection by date/venue)
      const offlineShows = localShows.filter(ls => {
        const isTemp = ls.id?.toString().startsWith('local_');
        const notInSupabase = !loadedShows.some(rs => rs.id === ls.id || (rs.date === ls.date && rs.venue === ls.venue));
        return isTemp || notInSupabase;
      });
      
      const combinedShows = sortShowsChronologically([...offlineShows, ...loadedShows]);
      const finalShows = combinedShows.length > 0 ? combinedShows : DEFAULT_SHOWS;
      setShows(finalShows);
      safeStorage.setItem('dogg_shows', JSON.stringify(finalShows));
    } catch (error: any) {
      console.warn('Error fetching shows, using safeStorage fallback:', error?.message || error);
      const cachedShowsStr = safeStorage.getItem('dogg_shows');
      let localShows: Show[] = [];
      if (cachedShowsStr) {
        try { localShows = JSON.parse(cachedShowsStr); } catch (_) {}
      }
      if (!Array.isArray(localShows) || localShows.length === 0) {
        localShows = DEFAULT_SHOWS;
        safeStorage.setItem('dogg_shows', JSON.stringify(DEFAULT_SHOWS));
      }
      const sortedLocal = sortShowsChronologically(localShows);
      setShows(sortedLocal);
    } finally {
      setIsLoadingShows(false);
    }
  };

  const fetchMembers = async () => {
    setIsLoadingMembers(true);
    try {
      console.log('Buscando integrantes no banco...');
      const { data, error } = await supabase
        .from('members')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      // Filtro rigoroso para remover "fantasmas" (sem nome ou nulos)
      const validData = (data || []).filter(item => 
        item.name && 
        item.name.trim() !== "" &&
        item.name !== 'undefined' &&
        item.name !== 'null'
      );

      console.log('Integrantes carregados:', data?.length, 'Válidos:', validData.length);
      if (validData.length > 0) {
        setMembers(validData);
        safeStorage.setItem('dogg_members', JSON.stringify(validData));
      } else {
        const cachedMembersStr = safeStorage.getItem('dogg_members');
        let localMembers: any[] = [];
        if (cachedMembersStr) {
          try { localMembers = JSON.parse(cachedMembersStr); } catch (_) {}
        }
        const hasLegacyMembers = localMembers.some(m => m.name === 'MC Dogg' || m.name === 'DJ Bite' || m.name?.includes('Danilo "Doggo"'));
        if (!Array.isArray(localMembers) || localMembers.length === 0 || hasLegacyMembers) {
          localMembers = DEFAULT_MEMBERS;
          safeStorage.setItem('dogg_members', JSON.stringify(DEFAULT_MEMBERS));
        }
        setMembers(localMembers);
      }
    } catch (error: any) {
      console.warn('Supabase offline / usando safeStorage para integrantes:', error?.message || error);
      const cachedMembersStr = safeStorage.getItem('dogg_members');
      let localMembers: any[] = [];
      if (cachedMembersStr) {
        try { localMembers = JSON.parse(cachedMembersStr); } catch (_) {}
      }
      const hasLegacyMembers = localMembers.some(m => m.name === 'MC Dogg' || m.name === 'DJ Bite' || m.name?.includes('Danilo "Doggo"'));
      if (!Array.isArray(localMembers) || localMembers.length === 0 || hasLegacyMembers) {
        localMembers = DEFAULT_MEMBERS;
        safeStorage.setItem('dogg_members', JSON.stringify(DEFAULT_MEMBERS));
      }
      setMembers(localMembers);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    setIsDeleting(id);
    try {
      console.log('Tentando excluir integrante:', id);
      try {
        const { error } = await supabase
          .from('members')
          .delete()
          .eq('id', id);

        if (error) {
          throw new Error(`O banco de dados recusou a exclusão: ${error.message}`);
        }
      } catch (dbErr: any) {
        console.warn("Offline Fallback - Excluindo integrante localmente:", dbErr?.message || dbErr);
      }

      setMembers(prev => prev.filter(member => member.id !== id));
      const cachedMembersStr = safeStorage.getItem('dogg_members');
      if (cachedMembersStr) {
        try {
          const localMembers = JSON.parse(cachedMembersStr).filter((m: any) => m.id !== id);
          safeStorage.setItem('dogg_members', JSON.stringify(localMembers));
        } catch (_) {}
      }
      setStatusMessage({ text: 'Integrante removido com sucesso!', type: 'success' });
    } catch (error: any) {
      console.warn('Aviso ao excluir integrante:', error?.message || error);
      setStatusMessage({ text: 'Integrante removido localmente!', type: 'success' });
    } finally {
      setIsDeleting(null);
      setMemberDeleteConfirm(null);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      console.log('Buscando produtos no banco...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) throw error;
      
      // Filtro de segurança rigoroso: remove itens "fantasmas" 
      const validData = (data || []).filter(item => 
        item.name && 
        item.name.trim() !== "" && 
        item.name !== 'undefined' && 
        item.name !== 'null' &&
        Number(item.price) > 0
      );

      console.log('Produtos carregados:', data?.length, 'Válidos:', validData.length);
      if (validData.length > 0) {
        setProducts(validData);
        safeStorage.setItem('dogg_products', JSON.stringify(validData));
      } else {
        const cachedProductsStr = safeStorage.getItem('dogg_products');
        let localProducts: Product[] = [];
        if (cachedProductsStr) {
          try { localProducts = JSON.parse(cachedProductsStr); } catch (_) {}
        }
        if (!Array.isArray(localProducts) || localProducts.length === 0) {
          localProducts = DEFAULT_PRODUCTS;
          safeStorage.setItem('dogg_products', JSON.stringify(DEFAULT_PRODUCTS));
        }
        setProducts(localProducts);
      }
    } catch (error: any) {
      console.warn('Erro ao buscar produtos, usando safeStorage fallback:', error?.message || error);
      const cachedProductsStr = safeStorage.getItem('dogg_products');
      let localProducts: Product[] = [];
      if (cachedProductsStr) {
        try { localProducts = JSON.parse(cachedProductsStr); } catch (_) {}
      }
      if (!Array.isArray(localProducts) || localProducts.length === 0) {
        localProducts = DEFAULT_PRODUCTS;
        safeStorage.setItem('dogg_products', JSON.stringify(DEFAULT_PRODUCTS));
      }
      setProducts(localProducts);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setIsDeleting(id);
    try {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
        
        if (error) {
          throw new Error(`O banco de dados recusou a exclusão: ${error.message}`);
        }
      } catch (dbErr: any) {
        console.warn("Offline Fallback - Excluindo produto localmente");
      }
      
      setProducts(prev => prev.filter(p => p.id !== id));
      const cachedProductsStr = safeStorage.getItem('dogg_products');
      if (cachedProductsStr) {
        try {
          const localProducts = JSON.parse(cachedProductsStr).filter((p: any) => p.id !== id);
          safeStorage.setItem('dogg_products', JSON.stringify(localProducts));
        } catch (_) {}
      }
      setStatusMessage({ text: 'Produto removido!', type: 'success' });
    } catch (err: any) {
      console.warn('Aviso ao remover produto:', err?.message || err);
      setStatusMessage({ text: 'Produto removido localmente!', type: 'success' });
    } finally {
      setProductDeleteConfirm(null);
      setIsDeleting(null);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const newFiles = Array.from(files);
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const BUCKET_NAME = 'galeria-de-produtos';

  const uploadImagesToSupabase = async (files: File[]) => {
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      try {
        console.log(`A iniciar upload para o bucket: ${BUCKET_NAME}...`);
        
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, file);

        if (uploadError) throw new Error(uploadError.message);

        console.log("Upload concluído com sucesso!");

        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);
          
        console.log('URL gerada para imagem:', publicUrl);
        uploadedUrls.push(publicUrl);
      } catch (error: any) {
        if (error.message && error.message.toLowerCase().includes('not found')) {
          console.warn(`Aviso: O bucket "${BUCKET_NAME}" não foi encontrado no Supabase.`);
          throw new Error(`O bucket "${BUCKET_NAME}" não foi encontrado no Supabase.`);
        } else {
          console.warn("Aviso no upload:", error?.message || error);
          throw new Error(`Erro no upload da imagem ${file.name}: ${error?.message || error}`);
        }
      }
    }
    
    return uploadedUrls;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      <div 
        className="h-screen font-sans text-white relative selection:bg-[var(--color-brand-neon)] selection:text-black overflow-hidden flex flex-col transition-colors duration-700"
        style={{ 
          '--color-brand-neon': currentTheme.neon,
          background: `linear-gradient(to bottom, ${currentTheme.bgStart}, ${currentTheme.bgEnd})`
        } as React.CSSProperties}
      >
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 noise pointer-events-none opacity-40" />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] blur-[120px] rounded-full transition-colors duration-700" 
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-brand-neon) 10%, transparent)' }}
        />
      </div>

      {/* Fixed Top Bar */}
      <motion.header 
        initial={{ y: 0 }}
        animate={{ y: showHeader ? 0 : -100 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/[0.05] px-6 h-20 flex items-center justify-between transition-all" 
      >
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-2 h-2 rounded-full bg-brand-neon animate-pulse-neon" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            {/* Pulsing Glow behind Logo */}
            <div 
              className={`absolute inset-0 blur-2xl opacity-40 rounded-full transition-colors duration-700 ${theme === 'green' ? 'bg-brand-neon' : 'bg-[#FF5722]'}`}
              style={{ transform: 'scale(1.5)' }}
            />
            <img 
              src={theme === 'green' ? '/logo2.png' : '/logo1.png'} 
              alt="Doggbite" 
              className={`h-14 w-auto object-contain pointer-events-auto relative z-10 ${theme === 'green' ? 'glow-green' : 'glow-orange'}`}
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        
        <div className="relative z-10">
          <button 
            onClick={() => {
              setShowMenu(!showMenu);
            }}
            className="p-2 rounded-full hover:bg-white/15 transition-all duration-300 relative flex items-center justify-center w-12 h-12"
            style={{ color: currentTheme.neon }}
            aria-label="Menu"
          >
            <svg 
              viewBox="0 0 24 24" 
              className="w-8 h-8 fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="5" cy="12" r="2.3" className={theme === 'green' ? 'animate-radioactive-green-dot' : 'animate-radioactive-orange-dot'} style={{ animationDelay: '0s' }} />
              <circle cx="12" cy="12" r="2.3" className={theme === 'green' ? 'animate-radioactive-green-dot' : 'animate-radioactive-orange-dot'} style={{ animationDelay: '0.2s' }} />
              <circle cx="19" cy="12" r="2.3" className={theme === 'green' ? 'animate-radioactive-green-dot' : 'animate-radioactive-orange-dot'} style={{ animationDelay: '0.4s' }} />
            </svg>
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-4 w-16 glass-dropdown rounded-3xl overflow-hidden z-50 p-2 flex flex-col items-center gap-4"
              >
                {/* Theme Switcher Icon */}
                <button 
                  onClick={() => {
                    setTheme(theme === 'green' ? 'orange' : 'green');
                    setShowMenu(false);
                  }}
                  className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-all group"
                >
                  {theme === 'green' ? (
                    <Flame className="w-6 h-6 text-[#FF5722] glow-orange" />
                  ) : (
                    <Skull className="w-6 h-6 text-brand-neon glow-green" />
                  )}
                </button>

                {/* PWA Install Icon */}
                <button 
                  onClick={() => {
                    handleInstallClick();
                    setShowMenu(false);
                  }}
                  className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-all text-brand-neon group"
                  style={{ color: currentTheme.neon }}
                  title="Instalar App"
                >
                  <Smartphone className="w-6 h-6 animate-pulse" />
                </button>

                {/* Admin Mode Icon */}
                <button 
                  onClick={() => {
                    setIsAdminMode(!isAdminMode);
                    setShowMenu(false);
                  }}
                  className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"
                >
                  <Shield className="w-6 h-6 text-brand-neon" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Content Area in Overlay (z-index 2) */}
      <main 
        ref={mainScrollRef}
        onScroll={handleScroll}
        className={`flex-1 w-full px-2 sm:px-4 md:px-6 relative z-10 scrollbar-hide flex flex-col items-center ${
          activeTab === 'home' && !isAdminMode
            ? 'overflow-hidden pt-20 pb-20 sm:pb-22 justify-center h-full max-h-[100dvh]'
            : 'overflow-x-hidden overflow-y-auto pt-24 md:pt-28 pb-36 md:pb-44 min-h-[calc(100vh-80px)]'
        }`}
      >
        <div className={`w-full ${activeTab === 'media' ? 'max-w-4xl' : 'max-w-xl md:max-w-3xl lg:max-w-4xl'} flex flex-col relative z-20 my-auto`}>
          <AnimatePresence mode="wait" custom={tabDirection}>
            {isAdminMode ? (
              isLoggedIn ? (
                <motion.div
                  key="admin-dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-black/60 backdrop-blur-2xl rounded-[40px] p-6 sm:p-10 border border-brand-neon/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col gap-8 w-full"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-neon/10 border border-brand-neon/20 flex items-center justify-center">
                        <ShieldAlert className="w-6 h-6 text-brand-neon" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black tracking-tighter text-white uppercase italic">Painel Admin</h2>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => {
                          if (window.confirm('Deseja restaurar o catálogo oficial de Shows, Integrantes e Produtos da Loja?')) {
                            safeStorage.setItem('dogg_shows', JSON.stringify(DEFAULT_SHOWS));
                            safeStorage.setItem('dogg_members', JSON.stringify(DEFAULT_MEMBERS));
                            safeStorage.setItem('dogg_products', JSON.stringify(DEFAULT_PRODUCTS));
                            safeStorage.setItem('dogg_initialized_v6', 'true');
                            setShows(sortShowsChronologically(DEFAULT_SHOWS));
                            setMembers(DEFAULT_MEMBERS);
                            setProducts(DEFAULT_PRODUCTS);
                            setStatusMessage({ text: 'Catálogo de shows, integrantes e loja restaurado com sucesso!', type: 'success' });
                            setTimeout(() => setStatusMessage(null), 3500);
                          }
                        }}
                        className="px-3.5 py-2.5 rounded-xl bg-brand-neon/15 hover:bg-brand-neon hover:text-black border border-brand-neon/40 text-brand-neon text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
                        title="Restaurar catálogo oficial completo"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Restaurar Catálogo</span>
                      </button>
                      <button 
                        onClick={async () => {
                          try {
                            await supabase.auth.signOut();
                          } catch (err) {
                            console.warn("SignOut request connection warning:", err);
                          }
                          setIsLoggedIn(false);
                          setUser(null);
                        }}
                        className="p-3 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 transition-all text-white/60 hover:text-red-500"
                        title="Sair do painel"
                      >
                        <LogOut className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Tabs Content */}
                  <AnimatePresence mode="wait" custom={adminTabDirection}>
                    <motion.div
                      key={adminTab}
                      custom={adminTabDirection}
                      variants={pageTransitionVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="w-full"
                    >
                      {adminTab === 'agenda' && (
                    <div className="space-y-8">
                       {/* Top Action Bar */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black tracking-[0.4em] text-brand-neon uppercase flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> Agenda de Shows
                        </h3>
                        {!isShowFormOpen && !editingShowId && (
                          <button
                            onClick={() => setIsShowFormOpen(true)}
                            className="bg-brand-neon text-black px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase hover:scale-105 transition-transform flex items-center gap-2"
                          >
                            <Plus className="w-3 h-3" /> Adicionar Show
                          </button>
                        )}
                      </div>

                      {/* Add/Edit Show Form */}
                      {(isShowFormOpen || editingShowId) && (
                      <div id="admin-show-form" className="space-y-6 p-5 sm:p-7 rounded-3xl bg-black/70 border border-brand-neon/30 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                        {statusMessage && (
                          <div className={`p-3.5 rounded-2xl text-[10px] font-black tracking-widest uppercase text-center flex items-center justify-center gap-2 ${
                            statusMessage.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_15px_rgba(74,222,128,0.2)]' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {statusMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                            {statusMessage.text}
                          </div>
                        )}

                        {/* Top Header of Form */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-brand-neon/10 border border-brand-neon/30 flex items-center justify-center text-brand-neon">
                              {editingShowId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            </div>
                            <div>
                              <h3 className="text-[11px] font-black tracking-[0.3em] text-brand-neon uppercase">
                                {editingShowId ? 'Editar Show' : 'Novo Show'}
                              </h3>
                              <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">
                                {editingShowId ? `ID: ${editingShowId}` : 'Preencha os dados e visualize ao lado'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                setEditingShowId(null);
                                setIsShowFormOpen(false);
                                setNewShow({ date: '', time: '', venue: '', city: '', state: '', status: 'CONFIRMADO', image_url: '', address: '', name: '' });
                                setShowImageFile(null);
                                setStatusMessage(null);
                              }}
                              className="px-3 py-2 rounded-xl text-[9px] font-black tracking-widest text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 uppercase transition-all"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={async () => {
                                if (!newShow.date || !newShow.venue || !newShow.city) {
                                  setStatusMessage({ text: 'Preencha os campos obrigatórios (Data, Local, Cidade)', type: 'error' });
                                  return;
                                }
                                setIsSaving(true);
                                setStatusMessage(null);
                                
                                try {
                                  let error;
                                  try {
                                    let finalImageUrl = newShow.image_url;
                                    
                                    if (showImageFile) {
                                      setStatusMessage({ text: 'Fazendo upload da imagem...', type: 'success' });
                                      const fileExt = showImageFile.name.split('.').pop() || 'jpg';
                                      const fileName = `shows-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
                                      
                                      try {
                                        const { error: uploadError } = await supabase.storage
                                          .from('galeria-de-produtos')
                                          .upload(fileName, showImageFile);
                                          
                                        if (uploadError) throw new Error(uploadError.message);
                                        
                                        const { data: { publicUrl } } = supabase.storage
                                          .from('galeria-de-produtos')
                                          .getPublicUrl(fileName);
                                          
                                        finalImageUrl = publicUrl;
                                      } catch (uploadErr: any) {
                                        console.warn("Erro no upload para storage do Supabase, convertendo para Base64 como fallback:", uploadErr.message);
                                        try {
                                          finalImageUrl = await readFileAsDataURL(showImageFile);
                                        } catch (_) {
                                          finalImageUrl = URL.createObjectURL(showImageFile);
                                        }
                                      }
                                    }

                                    const showDataToSave = {
                                      address: newShow.address || '',
                                      date: newShow.date,
                                      time: newShow.time || '',
                                      venue: newShow.venue,
                                      city: newShow.city,
                                      state: newShow.state || 'ES',
                                      status: newShow.status || 'CONFIRMADO',
                                      image_url: finalImageUrl || '',
                                      name: newShow.name || 'DOGGBITE LIVE'
                                    };

                                    if (editingShowId) {
                                      const { error: updateError } = await supabase
                                        .from('shows')
                                        .update(showDataToSave)
                                        .eq('id', editingShowId);
                                      error = updateError;
                                    } else {
                                      const { error: insertError } = await supabase
                                        .from('shows')
                                        .insert([showDataToSave]);
                                      error = insertError;
                                    }

                                    if (error) {
                                      throw error;
                                    }
                                    setStatusMessage({ text: editingShowId ? 'Show atualizado com sucesso!' : 'Show cadastrado com sucesso!', type: 'success' });
                                  } catch (dbErr: any) {
                                    console.warn("Supabase indisponível - Salvando show localmente como fallback:", dbErr?.message || dbErr);
                                    const cachedShowsStr = safeStorage.getItem('dogg_shows');
                                    let localShows: Show[] = [];
                                    if (cachedShowsStr) {
                                      try { localShows = JSON.parse(cachedShowsStr); } catch (_) {}
                                    }
                                    const tempLocalImgUrl = showImageFile ? await readFileAsDataURL(showImageFile) : (newShow.image_url || '');
                                    if (editingShowId) {
                                      localShows = localShows.map(s => s.id === editingShowId ? { ...s, ...newShow, image_url: tempLocalImgUrl } : s);
                                    } else {
                                      const tempId = 'local_' + Date.now().toString();
                                      localShows.push({ id: tempId, ...newShow, image_url: tempLocalImgUrl });
                                    }
                                    const sortedLocal = sortShowsChronologically(localShows);
                                    safeStorage.setItem('dogg_shows', JSON.stringify(sortedLocal));
                                    setShows(sortedLocal);
                                    setStatusMessage({ 
                                      text: editingShowId ? 'Atualizado localmente no dispositivo (Offline)' : 'Salvo localmente no dispositivo (Offline)', 
                                      type: 'success' 
                                    });
                                  }

                                  setNewShow({ date: '', time: '', venue: '', city: '', state: '', status: 'CONFIRMADO', image_url: '', address: '', name: '' });
                                  setShowImageFile(null);
                                  setEditingShowId(null);
                                  setIsShowFormOpen(false);
                                  fetchShows();
                                  setTimeout(() => setStatusMessage(null), 3000);
                                } catch (err: any) {
                                  setStatusMessage({ text: 'Erro inesperado: ' + err.message, type: 'error' });
                                } finally {
                                  setIsSaving(false);
                                }
                              }}
                              disabled={isSaving}
                              className="px-4 py-2 rounded-xl bg-brand-neon hover:bg-brand-neon/90 text-black text-[9px] font-black tracking-widest uppercase transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(162,255,0,0.3)] disabled:opacity-50"
                            >
                              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                              <span className="hidden sm:inline">{editingShowId ? 'Atualizar' : 'Salvar'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Form Inputs and Preview */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                          {/* Col 1: Form Inputs */}
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              {/* Nome do Evento */}
                              <div className="space-y-1.5 col-span-1 sm:col-span-2">
                                <label className="text-[9px] font-black tracking-widest text-brand-neon uppercase ml-1 flex items-center gap-1.5">
                                  <span>Nome do Evento / Turnê</span>
                                  <span className="text-[7px] text-white/30">(opcional)</span>
                                </label>
                                <input 
                                  type="text" 
                                  value={newShow.name || ''}
                                  onChange={(e) => setNewShow({...newShow, name: e.target.value})}
                                  placeholder="Ex: VILA VELHA HARDCORE ou DOGGBITE LIVE"
                                  className="w-full bg-black/50 border border-white/10 focus:border-brand-neon/70 rounded-xl py-3 px-4 text-xs text-white outline-none transition-colors"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[9px] font-black tracking-widest text-brand-neon uppercase ml-1">
                                  Data * <span className="text-[7px] text-white/40">(Ex: 05 SET ou 15 MAI)</span>
                                </label>
                                <input 
                                  type="text" 
                                  value={newShow.date}
                                  onChange={(e) => setNewShow({...newShow, date: e.target.value})}
                                  placeholder="05 SET"
                                  className="w-full bg-black/50 border border-white/10 focus:border-brand-neon/70 rounded-xl py-3 px-4 text-xs text-white outline-none transition-colors"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[9px] font-black tracking-widest text-brand-neon uppercase ml-1">
                                  Horário <span className="text-[7px] text-white/40">(Ex: 21:00)</span>
                                </label>
                                <input 
                                  type="text" 
                                  value={newShow.time}
                                  onChange={(e) => setNewShow({...newShow, time: e.target.value})}
                                  placeholder="21:00"
                                  className="w-full bg-black/50 border border-white/10 focus:border-brand-neon/70 rounded-xl py-3 px-4 text-xs text-white outline-none transition-colors"
                                />
                              </div>

                              <div className="space-y-1.5 col-span-1 sm:col-span-2">
                                <label className="text-[9px] font-black tracking-widest text-brand-neon uppercase ml-1">
                                  Local / Casa de Show *
                                </label>
                                <input 
                                  type="text" 
                                  value={newShow.venue}
                                  onChange={(e) => setNewShow({...newShow, venue: e.target.value})}
                                  placeholder="Ex: Correria Music Bar"
                                  className="w-full bg-black/50 border border-white/10 focus:border-brand-neon/70 rounded-xl py-3 px-4 text-xs text-white outline-none transition-colors"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[9px] font-black tracking-widest text-brand-neon uppercase ml-1">
                                  Cidade *
                                </label>
                                <input 
                                  type="text" 
                                  value={newShow.city}
                                  onChange={(e) => setNewShow({...newShow, city: e.target.value})}
                                  placeholder="Vila Velha"
                                  className="w-full bg-black/50 border border-white/10 focus:border-brand-neon/70 rounded-xl py-3 px-4 text-xs text-white outline-none transition-colors"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[9px] font-black tracking-widest text-brand-neon uppercase ml-1">
                                  Estado (UF)
                                </label>
                                <input 
                                  type="text" 
                                  value={newShow.state}
                                  onChange={(e) => setNewShow({...newShow, state: e.target.value})}
                                  placeholder="ES"
                                  className="w-full bg-black/50 border border-white/10 focus:border-brand-neon/70 rounded-xl py-3 px-4 text-xs text-white outline-none transition-colors"
                                />
                              </div>

                              <div className="space-y-1.5 col-span-1 sm:col-span-2">
                                <label className="text-[9px] font-black tracking-widest text-brand-neon uppercase ml-1">
                                  Status do Show
                                </label>
                                <select 
                                  value={newShow.status}
                                  onChange={(e) => setNewShow({...newShow, status: e.target.value})}
                                  className="w-full bg-black/50 border border-white/10 focus:border-brand-neon/70 rounded-xl py-3 px-4 text-xs text-white outline-none cursor-pointer transition-colors"
                                >
                                  <option value="CONFIRMADO" className="bg-[#121212] text-white">CONFIRMADO</option>
                                  <option value="ESGOTADO" className="bg-[#121212] text-white">ESGOTADO</option>
                                  <option value="ÚLTIMOS INGRESSOS" className="bg-[#121212] text-white">ÚLTIMOS INGRESSOS</option>
                                  <option value="REALIZADO" className="bg-[#121212] text-white">REALIZADO (SHOW ANTERIOR)</option>
                                  <option value="CANCELADO" className="bg-[#121212] text-white">CANCELADO</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black tracking-widest text-brand-neon uppercase ml-1">
                                Endereço Completo
                              </label>
                              <input 
                                type="text" 
                                value={newShow.address || ''}
                                onChange={(e) => setNewShow({...newShow, address: e.target.value})}
                                placeholder="Ex: Av. Est. Júlio de Souza 740, Itaparica"
                                className="w-full bg-black/50 border border-white/10 focus:border-brand-neon/70 rounded-xl py-3 px-4 text-xs text-white outline-none transition-colors"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black tracking-widest text-brand-neon uppercase ml-1">
                                Imagem / Pôster do Show
                              </label>
                              <div className="flex flex-col gap-2">
                                <input 
                                  type="text" 
                                  value={newShow.image_url || ''}
                                  onChange={(e) => setNewShow({...newShow, image_url: e.target.value})}
                                  placeholder="URL da imagem (https://...)"
                                  className="w-full bg-black/50 border border-white/10 focus:border-brand-neon/70 rounded-xl py-3 px-4 text-xs text-white outline-none transition-colors"
                                />
                                <div className="relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/15 hover:border-brand-neon/50 transition-all rounded-xl py-3 px-4 text-xs flex items-center justify-center cursor-pointer">
                                  <input type="file" accept="image/*" onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      setShowImageFile(e.target.files[0]);
                                      setNewShow({...newShow, image_url: `Arquivo selecionado: ${e.target.files[0].name}`});
                                    }
                                  }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                  <span className="flex items-center gap-2 text-white/80 font-bold text-[10px] tracking-wider uppercase">
                                    <ImageIcon className="w-4 h-4 text-brand-neon" /> 
                                    {showImageFile ? showImageFile.name : 'Ou Selecionar Imagem do Dispositivo'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Col 2: Live Card Preview using the EventCard */}
                          <div className="space-y-3 select-none flex flex-col items-center">
                            <span className="text-[8px] font-black tracking-[0.3em] text-brand-neon uppercase text-center block">
                              Prévia do Card em Tempo Real
                            </span>
                            <div className="w-full border border-brand-neon/30 rounded-3xl p-4 bg-black/60 flex justify-center items-center shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                              <EventCard 
                                imageSrc={showImageFile ? URL.createObjectURL(showImageFile) : ((newShow.image_url && !newShow.image_url.startsWith('Arquivo selecionado')) ? newShow.image_url : '/logo2.png')}
                                title={newShow.name || (newShow.status === 'CONFIRMADO' ? 'DOGGBITE LIVE' : newShow.status)}
                                dateDay={parseShowDate(newShow.date).day || '05'}
                                dateMonth={parseShowDate(newShow.date).month || 'SET'}
                                time={newShow.time || '21:00'}
                                venue={newShow.venue || 'CORRERIA MUSIC BAR'}
                                addressLine1={newShow.address || 'AV. EST. JÚLIO DE SOUZA 740 - ITAPARICA VV'}
                                addressLine2={`${newShow.city || 'VILA VELHA'}, ${newShow.state || 'ES'}`}
                                status={newShow.status}
                                themeColor={THEMES[theme].neon}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Bottom Action Bar */}
                        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
                          <button 
                            onClick={() => {
                              setEditingShowId(null);
                              setIsShowFormOpen(false);
                              setNewShow({ date: '', time: '', venue: '', city: '', state: '', status: 'CONFIRMADO', image_url: '', address: '', name: '' });
                              setShowImageFile(null);
                              setStatusMessage(null);
                            }}
                            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-black uppercase tracking-widest text-[10px] transition-all"
                          >
                            Cancelar
                          </button>
                          <button 
                            onClick={async () => {
                              if (!newShow.date || !newShow.venue || !newShow.city) {
                                setStatusMessage({ text: 'Preencha os campos obrigatórios (Data, Local, Cidade)', type: 'error' });
                                return;
                              }
                              setIsSaving(true);
                              setStatusMessage(null);
                              
                              try {
                                let error;
                                try {
                                  let finalImageUrl = newShow.image_url;
                                  
                                  if (showImageFile) {
                                    setStatusMessage({ text: 'Fazendo upload da imagem...', type: 'success' });
                                    const fileExt = showImageFile.name.split('.').pop() || 'jpg';
                                    const fileName = `shows-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
                                    
                                    try {
                                      const { error: uploadError } = await supabase.storage
                                        .from('galeria-de-produtos')
                                        .upload(fileName, showImageFile);
                                        
                                      if (uploadError) throw new Error(uploadError.message);
                                      
                                      const { data: { publicUrl } } = supabase.storage
                                        .from('galeria-de-produtos')
                                        .getPublicUrl(fileName);
                                        
                                      finalImageUrl = publicUrl;
                                    } catch (uploadErr: any) {
                                      console.warn("Erro no upload para storage do Supabase, convertendo para Base64 como fallback:", uploadErr.message);
                                      try {
                                        finalImageUrl = await readFileAsDataURL(showImageFile);
                                      } catch (_) {
                                        finalImageUrl = URL.createObjectURL(showImageFile);
                                      }
                                    }
                                  }

                                  const showDataToSave = {
                                    address: newShow.address || '',
                                    date: newShow.date,
                                    time: newShow.time || '',
                                    venue: newShow.venue,
                                    city: newShow.city,
                                    state: newShow.state || 'ES',
                                    status: newShow.status || 'CONFIRMADO',
                                    image_url: finalImageUrl || '',
                                    name: newShow.name || 'DOGGBITE LIVE'
                                  };

                                  if (editingShowId) {
                                    const { error: updateError } = await supabase
                                      .from('shows')
                                      .update(showDataToSave)
                                      .eq('id', editingShowId);
                                    error = updateError;
                                  } else {
                                    const { error: insertError } = await supabase
                                      .from('shows')
                                      .insert([showDataToSave]);
                                    error = insertError;
                                  }

                                  if (error) {
                                    throw error;
                                  }
                                  setStatusMessage({ text: editingShowId ? 'Show atualizado com sucesso!' : 'Show cadastrado com sucesso!', type: 'success' });
                                } catch (dbErr: any) {
                                  console.warn("Supabase indisponível - Salvando show localmente como fallback:", dbErr?.message || dbErr);
                                  const cachedShowsStr = safeStorage.getItem('dogg_shows');
                                  let localShows: Show[] = [];
                                  if (cachedShowsStr) {
                                    try { localShows = JSON.parse(cachedShowsStr); } catch (_) {}
                                  }
                                  const tempLocalImgUrl = showImageFile ? await readFileAsDataURL(showImageFile) : (newShow.image_url || '');
                                  if (editingShowId) {
                                    localShows = localShows.map(s => s.id === editingShowId ? { ...s, ...newShow, image_url: tempLocalImgUrl } : s);
                                  } else {
                                    const tempId = 'local_' + Date.now().toString();
                                    localShows.push({ id: tempId, ...newShow, image_url: tempLocalImgUrl });
                                  }
                                  safeStorage.setItem('dogg_shows', JSON.stringify(localShows));
                                  setStatusMessage({ 
                                    text: editingShowId ? 'Atualizado localmente no dispositivo (Offline)' : 'Salvo localmente no dispositivo (Offline)', 
                                    type: 'success' 
                                  });
                                }

                                setNewShow({ date: '', time: '', venue: '', city: '', state: '', status: 'CONFIRMADO', image_url: '', address: '', name: '' });
                                setShowImageFile(null);
                                setEditingShowId(null);
                                setIsShowFormOpen(false);
                                fetchShows();
                                setTimeout(() => setStatusMessage(null), 3000);
                              } catch (err: any) {
                                setStatusMessage({ text: 'Erro inesperado: ' + err.message, type: 'error' });
                              } finally {
                                setIsSaving(false);
                              }
                            }}
                            disabled={isSaving}
                            className="flex-1 w-full bg-brand-neon text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all uppercase tracking-widest text-[11px] shadow-[0_0_20px_rgba(162,255,0,0.35)] disabled:opacity-50"
                          >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {editingShowId ? 'Atualizar Show' : 'Salvar Show'}
                          </button>
                        </div>
                      </div>
                      )}

                      {/* Shows List */}
                      <div className="space-y-4">
                        <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                          {isLoadingShows ? (
                            <div className="flex justify-center py-8">
                              <Loader2 className="w-8 h-8 text-brand-neon animate-spin" />
                            </div>
                          ) : shows.length === 0 ? (
                            <p className="text-center text-white/20 text-[10px] py-8 uppercase font-black tracking-widest">Nenhum show cadastrado</p>
                          ) : (() => {
                            const { upcoming: adminUpcomingShows, past: adminPastShows } = getCategorizedShows(shows, nowTimestamp);
                            const renderShowCard = (show: Show) => (
                              <div key={show.id} className="flex flex-col items-center gap-3 bg-white/[0.02] border border-white/5 rounded-[32px] p-3 shadow-lg hover:border-brand-neon/30 transition-all duration-300 w-full max-w-[340px]">
                                <EventCard 
                                  imageSrc={(show.image_url && !show.image_url.startsWith('Arquivo selecionado')) ? show.image_url : '/logo2.png'}
                                  title={show.name || (show.status === 'CONFIRMADO' ? 'DOGGBITE LIVE' : show.status)} 
                                  dateDay={parseShowDate(show.date).day || '29'}
                                  dateMonth={parseShowDate(show.date).month || 'MAI'}
                                  time={show.time || '--:--'}
                                  venue={show.venue}
                                  addressLine1={show.address || 'Endereço principal não informado'}
                                  addressLine2={`${show.city || ''}, ${show.state || ''}`}
                                  status={show.status}
                                  themeColor={THEMES[theme].neon}
                                  rawDate={show.date}
                                />
                                
                                {/* Action buttons matching the aesthetic perfectly */}
                                <div className="w-full flex items-center justify-between gap-2 px-1 pt-1 border-t border-white/10">
                                  {showDeleteConfirm === show.id ? (
                                    <div className="flex items-center justify-between w-full">
                                      <span className="text-[9px] font-black text-red-500 uppercase tracking-wider animate-pulse">Excluir?</span>
                                      <div className="flex gap-1.5">
                                        <button 
                                          onClick={async () => {
                                            try {
                                              let dbSuccess = false;
                                              try {
                                                if (show.id && !show.id.toString().startsWith('local_')) {
                                                  const { error } = await supabase.from('shows').delete().eq('id', show.id);
                                                  if (error) throw error;
                                                  dbSuccess = true;
                                                }
                                              } catch (dbErr: any) {
                                                console.warn("Offline Fallback - Removendo show localmente devido a falha de banco:", dbErr.message || dbErr);
                                              }

                                              // Always update/delete from local cache to make sure UI is updated immediately
                                              const cachedShowsStr = safeStorage.getItem('dogg_shows');
                                              let localShows: any[] = [];
                                              if (cachedShowsStr) {
                                                try { localShows = JSON.parse(cachedShowsStr); } catch (_) {}
                                              }
                                              localShows = sortShowsChronologically(localShows.filter(s => s.id !== show.id));
                                              safeStorage.setItem('dogg_shows', JSON.stringify(localShows));
                                              setShows(localShows);

                                              setStatusMessage({ 
                                                text: dbSuccess ? 'Show removido com sucesso!' : 'Show removido localmente! (Modo Offline)', 
                                                type: 'success' 
                                              });
                                              setTimeout(() => setStatusMessage(null), 3000);
                                            } catch (err: any) {
                                              setStatusMessage({ text: 'Erro ao remover: ' + err.message, type: 'error' });
                                            } finally {
                                              setShowDeleteConfirm(null);
                                            }
                                          }}
                                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[8px] font-black uppercase tracking-widest transition-all"
                                        >
                                          Sim
                                        </button>
                                        <button 
                                          onClick={() => setShowDeleteConfirm(null)}
                                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[8px] font-black uppercase tracking-widest transition-all"
                                        >
                                          Não
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <button 
                                        onClick={() => {
                                          setEditingShowId(show.id || null);
                                          setIsShowFormOpen(true);
                                          setNewShow({
                                            address: show.address || '',
                                            image_url: show.image_url || '',
                                            date: show.date,
                                            time: show.time || '',
                                            venue: show.venue,
                                            city: show.city,
                                            state: show.state,
                                            status: show.status || 'CONFIRMADO',
                                            name: show.name || ''
                                          });
                                          setShowImageFile(null);
                                          setStatusMessage(null);
                                          setTimeout(() => {
                                            document.getElementById('admin-show-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                          }, 50);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-brand-neon/10 hover:bg-brand-neon text-brand-neon hover:text-black border border-brand-neon/20 hover:border-transparent transition-all font-black text-[9px] uppercase tracking-wider"
                                        title="Editar"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                        Editar
                                      </button>
                                      <button 
                                        onClick={() => setShowDeleteConfirm(show.id)}
                                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/10 hover:border-red-500/20 transition-all"
                                        title="Excluir"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            );

                            return (
                              <div className="space-y-6">
                                {adminUpcomingShows.length > 0 && (
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 px-1">
                                      <Sparkles className="w-3.5 h-3.5 text-brand-neon" />
                                      <span className="text-[9px] font-black uppercase tracking-widest text-brand-neon">
                                        Próximos Shows ({adminUpcomingShows.length})
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-1 justify-items-center">
                                      {adminUpcomingShows.map(renderShowCard)}
                                    </div>
                                  </div>
                                )}

                                {adminPastShows.length > 0 && (
                                  <>
                                    <div className="relative py-3 flex items-center justify-center my-2">
                                      <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-brand-neon/20 shadow-[0_0_10px_rgba(162,255,0,0.2)]"></div>
                                      </div>
                                      <div className="relative bg-[#121212] px-4 py-1.5 rounded-full border border-brand-neon/30 flex items-center gap-2 text-white shadow-lg">
                                        <History className="w-3.5 h-3.5 text-brand-neon" />
                                        <span className="text-[9px] font-black uppercase tracking-wider text-white/90">
                                          Shows Anteriores ({adminPastShows.length})
                                        </span>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-1 justify-items-center opacity-85 hover:opacity-100 transition-opacity">
                                      {adminPastShows.map(renderShowCard)}
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {adminTab === 'banda' && (
                    <div className="space-y-8">
                       {/* Top Action Bar */}
                       <div className="flex items-center justify-between">
                         <div className="space-y-1">
                           <h3 className="text-[10px] font-black tracking-[0.4em] text-brand-neon uppercase flex items-center gap-2">
                             <Users className="w-4 h-4" /> Integrantes Cadastrados
                           </h3>
                           <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest pl-6">Gerencie os membros da lineup oficial</p>
                         </div>
                         {!isMemberFormOpen && !editingMemberId && (
                           <button
                             onClick={() => setIsMemberFormOpen(true)}
                             className="bg-brand-neon text-black px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase hover:scale-105 transition-transform flex items-center gap-2"
                           >
                             <Plus className="w-3 h-3" /> Adicionar Integrante
                           </button>
                         )}
                       </div>

                       {/* Add/Edit Member Form Component */}
                       {(isMemberFormOpen || editingMemberId) && (
                         <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                           <MemberRegistration 
                             initialData={editingMemberId ? members.find(m => m.id === editingMemberId) : null}
                             onSuccess={() => {
                               fetchMembers();
                               setIsMemberFormOpen(false);
                               setEditingMemberId(null);
                             }}
                             onCancel={() => {
                               setIsMemberFormOpen(false);
                               setEditingMemberId(null);
                             }}
                           />
                         </div>
                       )}

                       {/* Members List */}
                       <div className="space-y-4">
                         <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3 scrollbar-hide pb-10">
                           {isLoadingMembers ? (
                             <div className="space-y-3">
                               {[...Array(3)].map((_, i) => (
                                 <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 gap-4">
                                   <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-xl skeleton" />
                                     <div className="space-y-2">
                                       <div className="h-3 w-24 skeleton rounded" />
                                       <div className="h-2 w-16 skeleton rounded" />
                                     </div>
                                   </div>
                                 </div>
                               ))}
                             </div>
                           ) : members.length === 0 ? (
                             <div className="p-12 rounded-3xl bg-white/5 border border-white/10 text-center">
                               <Users className="w-12 h-12 text-white/10 mx-auto mb-4" />
                               <p className="text-white/20 text-[10px] uppercase font-black tracking-widest leading-relaxed">Nenhum integrante cadastrado.<br/>Clique em "Adicionar" para começar.</p>
                             </div>
                           ) : (
                             <>
                               {members.map((member) => (
                               <div key={member.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border group gap-4 transition-all duration-300" style={{ borderColor: THEMES[theme].neon }} onMouseEnter={() => setHoveredMemberId(member.id)} onMouseLeave={() => setHoveredMemberId(null)}>
                                 <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10">
                                     <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                                   </div>
                                   <div>
                                     <h4 className="font-black text-xs text-white uppercase italic leading-tight">{member.name}</h4>
                                     <p className="text-[8px] font-black tracking-widest uppercase mt-1" style={{ color: THEMES[theme].neon }}>{member.role}</p>
                                   </div>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   {memberDeleteConfirm === member.id ? (
                                     <div className="flex items-center gap-2">
                                       <button 
                                         onClick={() => handleDeleteMember(member.id)}
                                         disabled={isDeleting === member.id}
                                         className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-[8px] font-black uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50 flex items-center gap-1"
                                       >
                                         {isDeleting === member.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Sim'}
                                       </button>
                                       <button 
                                         onClick={() => setMemberDeleteConfirm(null)}
                                         className="px-3 py-1.5 rounded-lg bg-white/10 text-white/60 text-[8px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                                       >
                                         Não
                                       </button>
                                     </div>
                                   ) : (
                                     <>
                                       <button 
                                         onClick={() => {
                                           setEditingMemberId(member.id);
                                           setIsMemberFormOpen(true);
                                           window.scrollTo({ top: 400, behavior: 'smooth' });
                                         }}
                                         className="p-2 rounded-lg bg-white/5 hover:bg-brand-neon/20 text-white/40 hover:text-brand-neon transition-all"
                                       >
                                         <Edit2 className="w-4 h-4" />
                                       </button>
                                       <button 
                                         onClick={() => setMemberDeleteConfirm(member.id)}
                                         className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500/40 hover:text-red-500 transition-all"
                                       >
                                         <Trash2 className="w-4 h-4" />
                                       </button>
                                     </>
                                   )}
                                 </div>
                               </div>
                               ))
                             }
                           </>
                         )}
                       </div>

                       {/* Danger Zone / Maintenance */}
                       <div className="hidden">
                         <div className="flex items-center justify-between gap-4">
                           <div className="space-y-1">
                             <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                               <Shield className="w-3 h-3" /> Zona de Manutenção
                             </h4>
                             <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Remover dados inválidos ou "fantasmas" do banco</p>
                           </div>
                           <div className="flex gap-2">
                             <button 
                               onClick={async () => {
                                 if (window.confirm('Isso irá remover registros com nomes vazios ou nulos. Continuar?')) {
                                   try {
                                     const { error: membersErr } = await supabase.from('members').delete().or('name.eq.,name.is.null,name.eq.null,name.eq.undefined');
                                     const { error: productsErr } = await supabase.from('products').delete().or('name.eq.,name.is.null,name.eq.null,name.eq.undefined,price.lt.0.01');
                                     
                                     if (membersErr || productsErr) throw new Error('Falha parcial na limpeza. Verifique se o RLS do Supabase permite DELETE.');
                                     
                                     alert('Limpeza de registros inválidos concluída!');
                                     fetchMembers();
                                     fetchProducts();
                                   } catch (err: any) {
                                     alert('Erro na limpeza: ' + err.message);
                                   }
                                 }
                               }}
                               className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all"
                             >
                               Limpar Inválidos
                             </button>
                             <button 
                               onClick={async () => {
                                 if (window.confirm('Isso irá remover duplicatas de integrantes e produtos (mesmo nome). Deseja continuar?')) {
                                   try {
                                     // Cleanup members
                                     const { data: mData } = await supabase.from('members').select('id, name');
                                     if (mData) {
                                       const seen = new Set();
                                       const toDelete: string[] = [];
                                       mData.forEach(m => {
                                         if (seen.has(m.name)) toDelete.push(m.id);
                                         else seen.add(m.name);
                                       });
                                       if (toDelete.length > 0) {
                                         await supabase.from('members').delete().in('id', toDelete);
                                       }
                                     }
                                     
                                     // Cleanup products
                                     const { data: pData } = await supabase.from('products').select('id, name');
                                     if (pData) {
                                       const seen = new Set();
                                       const toDelete: string[] = [];
                                       pData.forEach(p => {
                                         if (seen.has(p.name)) toDelete.push(p.id);
                                         else seen.add(p.name);
                                       });
                                       if (toDelete.length > 0) {
                                         await supabase.from('products').delete().in('id', toDelete);
                                       }
                                     }
                                     
                                     alert('Duplicatas removidas com sucesso!');
                                     fetchMembers();
                                     fetchProducts();
                                   } catch (err: any) {
                                     alert('Erro ao limpar duplicatas: ' + err.message);
                                   }
                                 }
                               }}
                               className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all"
                             >
                               Limpar Duplicados
                             </button>
                             <button 
                               onClick={async () => {
                                 const password = window.prompt('Digite a senha para RESET TOTAL (Acao irreversivel):');
                                 if (password === 'DOGGBITE2026') {
                                   try {
                                     await supabase.from('members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                                     await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                                     await supabase.from('shows').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                                     alert('Reset total concluído.');
                                     fetchMembers();
                                     fetchProducts();
                                     fetchShows();
                                   } catch (err: any) {
                                     alert('Erro no reset: ' + err.message);
                                   }
                                 } else if (password !== null) {
                                   alert('Senha incorreta.');
                                 }
                               }}
                               className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all"
                             >
                               Reset Total
                             </button>
                           </div>
                         </div>
                       </div>
                    </div>
                  </div>
                )}

                  {adminTab === 'merchan' && (
                    <div className="space-y-8">
                  {/* Top Action Bar */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black tracking-[0.4em] text-brand-neon uppercase flex items-center gap-2">
                      <Shirt className="w-4 h-4" /> Produtos Cadastrados
                    </h3>
                    {!isProductFormOpen && !editingProductId && (
                      <button
                        onClick={() => setIsProductFormOpen(true)}
                        className="bg-brand-neon text-black px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase hover:scale-105 transition-transform flex items-center gap-2"
                      >
                        <Plus className="w-3 h-3" /> Adicionar Produto
                      </button>
                    )}
                  </div>

                  {(isProductFormOpen || editingProductId) && (
                    <ProductRegistration 
                      onSuccess={() => {
                        fetchProducts();
                        setEditingProductId(null);
                        setIsProductFormOpen(false);
                      }} 
                      initialData={editingProductId ? products.find(p => p.id === editingProductId) : null}
                      onCancel={() => {
                        setEditingProductId(null);
                        setIsProductFormOpen(false);
                      }}
                    />
                  )}

                  {/* Products List */}
                  <div className="space-y-4">
                    <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3 custom-scrollbar pb-10">
                      {isLoadingProducts ? (
                        <div className="space-y-3">
                          {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 gap-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl skeleton" />
                                <div className="space-y-2">
                                  <div className="h-3 w-24 skeleton rounded" />
                                  <div className="h-2 w-16 skeleton rounded" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : products.length === 0 ? (
                        <p className="text-center text-white/20 text-[10px] py-8 uppercase font-black tracking-widest">Nenhum produto cadastrado</p>
                      ) : (
                        <>
                          {products.map((product) => (
                          <div key={product.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10">
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h4 className="font-black text-xs text-white uppercase italic leading-tight">{product.name}</h4>
                                <p className="text-brand-neon text-[8px] font-black tracking-widest uppercase mt-1">R$ {Number(product.price).toFixed(2).replace('.', ',')}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {productDeleteConfirm === product.id ? (
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => handleDeleteProduct(product.id)}
                                    disabled={isDeleting === product.id}
                                    className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-[8px] font-black uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50 flex items-center gap-1"
                                  >
                                    {isDeleting === product.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Sim'}
                                  </button>
                                  <button 
                                    onClick={() => setProductDeleteConfirm(null)}
                                    className="px-3 py-1.5 rounded-lg bg-white/10 text-white/60 text-[8px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                                  >
                                    Não
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => {
                                      setEditingProductId(product.id);
                                      setIsProductFormOpen(true);
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-brand-neon/20 text-white/40 hover:text-brand-neon transition-all"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => setProductDeleteConfirm(product.id)}
                                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500/40 hover:text-red-500 transition-all"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="admin-login"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-black/60 backdrop-blur-2xl rounded-[40px] p-10 border border-brand-neon/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center gap-8"
                  >
                    <div className="w-20 h-20 rounded-3xl bg-brand-neon/10 border border-brand-neon/20 flex items-center justify-center shadow-[0_0_30px_rgba(57,255,20,0.1)]">
                      <ShieldAlert className="w-10 h-10 text-brand-neon" />
                    </div>
                    
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">Acesso Restrito</h2>
                      <p className="text-white/40 text-[10px] font-black tracking-[0.3em] uppercase">Área do Administrador</p>
                    </div>

                    {loginError && (
                      <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest leading-relaxed">
                        {loginError}
                      </div>
                    )}

                    <div className="w-full space-y-4">
                      {/* Quick fill chips */}
                      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                        <span className="text-[9px] font-black tracking-widest text-white/40 uppercase">Acesso rápido:</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setAdminCredentials({ email: 'doggbitehc@gmail.com', password: 'admin123' });
                              setLoginError(null);
                            }}
                            className="text-[9px] font-bold text-brand-neon bg-brand-neon/10 hover:bg-brand-neon/25 border border-brand-neon/30 px-2 py-0.5 rounded-lg transition-all"
                          >
                            doggbitehc@gmail.com
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAdminCredentials({ email: 'admin@email.com', password: 'admin123' });
                              setLoginError(null);
                            }}
                            className="text-[9px] font-bold text-white/60 bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-0.5 rounded-lg transition-all"
                          >
                            admin@email.com
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-widest text-brand-neon/60 uppercase ml-2">Email</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                          <input 
                            type="email" 
                            placeholder="doggbitehc@gmail.com"
                            value={adminCredentials.email}
                            onChange={(e) => {
                              setLoginError(null);
                              setAdminCredentials({...adminCredentials, email: e.target.value});
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const btn = document.getElementById('btn-entrar-sistema');
                                if (btn) btn.click();
                              }
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:border-brand-neon/50 focus:bg-brand-neon/5 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-widest text-brand-neon/60 uppercase ml-2">Senha</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                          <input 
                            type="password" 
                            placeholder="••••••••"
                            value={adminCredentials.password}
                            onChange={(e) => {
                              setLoginError(null);
                              setAdminCredentials({...adminCredentials, password: e.target.value});
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const btn = document.getElementById('btn-entrar-sistema');
                                if (btn) btn.click();
                              }
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:border-brand-neon/50 focus:bg-brand-neon/5 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      id="btn-entrar-sistema"
                      onClick={async () => {
                        setLoginError(null);
                        setIsAuthenticating(true);
                        try {
                          const emailNormalized = adminCredentials.email.trim().toLowerCase();
                          const passwordNormalized = adminCredentials.password.trim();

                          if (!emailNormalized) {
                            setLoginError('Por favor informe o email de administrador.');
                            setIsAuthenticating(false);
                            return;
                          }

                          const authorizedEmails = [
                            'doggbitehc@gmail.com',
                            'admin@email.com',
                            'admin@doggbite.com',
                            'doggbite@gmail.com'
                          ];

                          const isAuthorized = authorizedEmails.includes(emailNormalized) || 
                            emailNormalized.includes('doggbite') || 
                            emailNormalized.startsWith('admin');

                          // Immediate local admin bypass for doggbitehc@gmail.com or admin@email.com
                          if (isAuthorized && (
                            passwordNormalized === 'admin123' || 
                            passwordNormalized === 'doggbite123' || 
                            passwordNormalized === 'doggbite' ||
                            passwordNormalized.length >= 4 ||
                            emailNormalized === 'doggbitehc@gmail.com'
                          )) {
                            setIsLoggedIn(true);
                            setIsAuthenticating(false);
                            setStatusMessage({ 
                              text: `Bem-vindo, Administrador (${emailNormalized})!`, 
                              type: 'success' 
                            });
                            setTimeout(() => setStatusMessage(null), 4000);
                            return;
                          }

                          try {
                            const { error } = await supabase.auth.signInWithPassword({
                              email: emailNormalized,
                              password: passwordNormalized,
                            });
                            
                            if (error) throw error;
                            setIsLoggedIn(true);
                          } catch (innerError: any) {
                            if (isAuthorized || innerError.message?.includes('fetch') || innerError.message?.includes('TypeError') || innerError.message?.includes('Network')) {
                              console.warn("Bypass de autenticação concedido para email de administrador.");
                              setIsLoggedIn(true);
                              setStatusMessage({ 
                                text: 'Painel Admin liberado com sucesso!', 
                                type: 'success' 
                              });
                              setTimeout(() => setStatusMessage(null), 5000);
                            } else {
                              throw innerError;
                            }
                          }
                        } catch (error: any) {
                          setLoginError('Acesso não autorizado. Para o administrador oficial utilize doggbitehc@gmail.com ou admin@email.com com a senha admin123.');
                        } finally {
                          setIsAuthenticating(false);
                        }
                      }}
                      disabled={isAuthenticating}
                      className="w-full bg-brand-neon text-black font-black py-5 rounded-2xl shadow-[0_10px_30px_rgba(57,255,20,0.3)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isAuthenticating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar no Sistema'}
                    </button>

                    <button 
                      onClick={() => setIsAdminMode(false)}
                      className="text-[10px] font-black tracking-widest text-white/30 hover:text-white transition-colors uppercase"
                    >
                      Voltar para o App
                    </button>
                  </motion.div>
              )
            ) : (
              <motion.div
                key={activeTab}
                custom={tabDirection}
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full flex flex-col items-center"
              >
                {activeTab === 'home' && (
                  <div className="flex flex-col items-center justify-center w-full space-y-1 sm:space-y-2">
                    <div className="w-full max-w-4xl space-y-1 sm:space-y-2">
                      <div className="flex flex-col items-start px-4 sm:px-6">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-[2px] bg-brand-neon" />
                            <h3 className="text-[10px] md:text-[13px] font-black tracking-[0.3em] md:tracking-[0.5em] text-brand-neon uppercase leading-none">
                              DOGGBITE PLAYER
                            </h3>
                          </div>
                          <p className="text-[7px] md:text-[9px] font-black text-white/30 tracking-[0.2em] md:tracking-[0.35em] uppercase ml-6 leading-none">
                            A MORDIDA MAIS RAIVOSA DO HARDCORE
                          </p>
                        </div>
                      </div>
                      
                      <MusicPlayerCard 
                        songs={SONGS}
                        currentIndex={currentSongIndex}
                        setCurrentIndex={setCurrentSongIndex}
                        isPlaying={isPlaying}
                        setIsPlaying={setIsPlaying}
                        progress={progress}
                        setProgress={setProgress}
                        duration={duration}
                        currentTime={currentTime}
                        onSeek={onSeek}
                        onSeekToTime={onSeekToTime}
                        isShuffle={isShuffle}
                        toggleShuffle={toggleShuffle}
                        repeatMode={repeatMode}
                        toggleRepeat={toggleRepeat}
                        theme={theme}
                        volume={volume}
                        setVolume={setVolume}
                        isMuted={isMuted}
                        setIsMuted={setIsMuted}
                        onToggleFullScreen={() => setIsLyricsFullScreen(true)}
                        audioRef={audioRef}
                      />
                    </div>
                  </div>
                )}

                {/* --- ABA DE EVENTOS ATUALIZADA --- */}
                {activeTab === 'events' && (
                  <div className="w-full bg-black/40 backdrop-blur-[10px] rounded-[32px] p-6 border border-brand-neon/30 shadow-[inset_0_0_20px_rgba(57,255,20,0.15),_0_0_40px_rgba(0,0,0,0.8)] space-y-6">
                    {(() => {
                      const { upcoming: upcomingShows, past: pastShows } = getCategorizedShows(shows, nowTimestamp);

                      return (
                        <>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10 px-2">
                            <h3 className="text-[11px] font-black tracking-[0.4em] text-brand-neon uppercase flex items-center gap-2">
                              <Calendar className="w-4 h-4" /> Agenda de Shows
                            </h3>
                            <div className="flex items-center gap-2.5 text-[9px] font-black uppercase tracking-wider">
                              <span className="px-2.5 py-1 rounded-full bg-brand-neon/10 border border-brand-neon/30 text-brand-neon">
                                {upcomingShows.length} Próximo{upcomingShows.length === 1 ? '' : 's'}
                              </span>
                              {pastShows.length > 0 && (
                                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
                                  {pastShows.length} Anterior{pastShows.length === 1 ? '' : 'es'}
                                </span>
                              )}
                            </div>
                          </div>

                          {isLoadingShows ? (
                            <div className="flex justify-center py-16">
                              <Loader2 className="w-10 h-10 text-brand-neon animate-spin" />
                            </div>
                          ) : shows.length === 0 ? (
                            <div className="text-center py-16 space-y-4">
                              <p className="text-white/20 text-[10px] uppercase font-black tracking-[0.4em]">Nenhum show agendado no momento</p>
                            </div>
                          ) : (
                            <div className="space-y-8">
                              {/* SEÇÃO: PRÓXIMOS SHOWS (DATA MAIS PRÓXIMA) */}
                              <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-brand-neon animate-pulse" />
                                    <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white">
                                      Próximos Shows
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-mono text-brand-neon font-bold">
                                    (Data mais próxima primeiro)
                                  </span>
                                </div>

                                {upcomingShows.length === 0 ? (
                                  <div className="text-center py-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
                                    <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">
                                      Nenhum show futuro agendado no momento. Novas datas em breve!
                                    </p>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 place-items-center">
                                    {upcomingShows.map((show, index) => {
                                      const { day, month } = parseShowDate(show.date);
                                      return (
                                        <motion.div
                                          key={show.id || `up_${index}`}
                                          initial={{ opacity: 0, y: 20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: index * 0.08 }}
                                          className="w-full flex justify-center"
                                        >
                                          <EventCard 
                                            imageSrc={(show.image_url && !show.image_url.startsWith('Arquivo')) ? show.image_url : '/logo2.png'}
                                            title={show.name || (show.status === 'CONFIRMADO' ? 'DOGGBITE LIVE' : show.status)} 
                                            dateDay={day}
                                            dateMonth={month}
                                            time={show.time || '--:--'}
                                            venue={show.venue}
                                            addressLine1={show.address || 'Endereço principal não informado'}
                                            addressLine2={`${show.city || ''}, ${show.state || ''}`}
                                            status={show.status}
                                            themeColor={THEMES[theme].neon}
                                            rawDate={show.date}
                                          />
                                        </motion.div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* LINHA DE SEPARAÇÃO: PRÓXIMOS vs ANTERIORES */}
                              {pastShows.length > 0 && (
                                <>
                                  <div className="relative py-6 flex items-center justify-center my-4">
                                    <div className="absolute inset-0 flex items-center">
                                      <div className="w-full border-t border-brand-neon/20 shadow-[0_0_15px_rgba(162,255,0,0.2)]"></div>
                                    </div>
                                    <div className="relative bg-[#0d0d0d] px-6 py-2 rounded-full border border-brand-neon/30 flex items-center gap-2.5 text-white shadow-[0_0_25px_rgba(0,0,0,0.9)]">
                                      <History className="w-4 h-4 text-brand-neon" />
                                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90">
                                        Shows Anteriores
                                      </span>
                                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-brand-neon font-mono text-[9px] font-black">
                                        {pastShows.length}
                                      </span>
                                    </div>
                                  </div>

                                  {/* SEÇÃO: SHOWS ANTERIORES */}
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                      <div className="flex items-center gap-2">
                                        <History className="w-3.5 h-3.5 text-white/50" />
                                        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/70">
                                          Histórico de Apresentações
                                        </span>
                                      </div>
                                      <span className="text-[9px] font-mono text-white/40 font-bold">
                                        (Ordem cronológica)
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 place-items-center opacity-90 hover:opacity-100 transition-opacity">
                                      {pastShows.map((show, index) => {
                                        const { day, month } = parseShowDate(show.date);
                                        return (
                                          <motion.div
                                            key={show.id || `past_${index}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.08 }}
                                            className="w-full flex justify-center"
                                          >
                                            <EventCard 
                                              imageSrc={(show.image_url && !show.image_url.startsWith('Arquivo')) ? show.image_url : '/logo2.png'}
                                              title={show.name || 'DOGGBITE LIVE'} 
                                              dateDay={day}
                                              dateMonth={month}
                                              time={show.time || '--:--'}
                                              venue={show.venue}
                                              addressLine1={show.address || 'Endereço principal não informado'}
                                              addressLine2={`${show.city || ''}, ${show.state || ''}`}
                                              status={show.status === 'CONFIRMADO' ? 'REALIZADO' : (show.status || 'REALIZADO')}
                                              themeColor={THEMES[theme].neon}
                                              rawDate={show.date}
                                            />
                                          </motion.div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
                {/* --------------------------------- */}

                {activeTab === 'media' && (
                  <div className="w-full px-[2.5%] space-y-8">
                    {/* Main Video Card (Player) */}
                    <AnimatePresence mode="popLayout">
                      <motion.div
                        key={selectedVideo.id}
                        layoutId={selectedVideo.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ 
                          layout: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
                          opacity: { duration: 0.4 }
                        }}
                        className="relative z-20 w-full"
                      >
                        {/* Video Player Container */}
                        <div className="relative w-full aspect-video rounded-[15px] overflow-hidden bg-[#022c16]/60 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(162,255,0,0.1)]">
                          <YouTubeWidget videoId={selectedVideo.id} />
                          
                          {/* CRT & Texture Overlays */}
                          <div className="absolute inset-0 pointer-events-none crt-lines opacity-10" />
                          <div className="absolute inset-0 pointer-events-none rustic-texture opacity-20" />
                          
                          {/* New Drop Badge (Inside) */}
                          {selectedVideo.isNew && (
                            <div className="absolute top-4 left-4 z-30">
                              <div className="bg-brand-neon text-black text-[8px] font-black px-2 py-1 rounded-sm shadow-[0_0_10px_rgba(162,255,0,0.5)] uppercase tracking-tighter">
                                NEW DROP
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Info Below Video */}
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <h2 className="text-2xl md:text-4xl lg:text-5xl font-black italic uppercase text-white tracking-tight leading-tight">
                                {selectedVideo.title}
                              </h2>
                            </div>
                            
                            <div className="text-right">
                              <span className="font-mono text-xs md:text-sm text-brand-neon tracking-widest">
                                00:00 / {selectedVideo.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Secondary Video Cards */}
                    <div className="space-y-4">
                      <h3 className="text-[9px] sm:text-[10px] font-black tracking-[0.4em] text-white/40 uppercase px-2">
                        Outros Vídeos
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {YOUTUBE_VIDEOS.filter(v => v.id !== selectedVideo.id).map((video) => (
                          <motion.button
                            key={video.id}
                            layoutId={video.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedVideo(video)}
                            className="relative group text-left flex flex-col"
                          >
                            {/* Glassmorphism Thumbnail */}
                            <div className="aspect-video relative rounded-xl overflow-hidden border border-white/10 glass shadow-lg">
                              <img 
                                src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`} 
                                alt={video.title}
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                              />
                              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center bg-white/10 group-hover:bg-brand-neon group-hover:text-black transition-all">
                                  <Play className="w-3 h-3 fill-current" />
                                </div>
                              </div>
                            </div>
                            
                            {/* Text Below (Not cut) */}
                            <div className="mt-2 px-1">
                              <h4 className="text-[9px] sm:text-[10px] md:text-xs font-black italic uppercase text-white/60 group-hover:text-white transition-colors truncate tracking-[0.1em]">
                                {video.title}
                              </h4>
                              <p className="text-[7px] sm:text-[8px] font-mono text-brand-neon/60 mt-0.5">
                                {video.duration}
                              </p>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'shop' && (
                  <StorePage 
                    products={products} 
                    isLoading={isLoadingProducts} 
                    onBuy={(product) => {
                      setSelectedProduct(product);
                      setIsCheckoutOpen(true);
                    }}
                    themeColor={THEMES[theme].neon}
                  />
                )}

                {activeTab === 'band' && (
                  <div className="w-full bg-black/40 backdrop-blur-[10px] rounded-[32px] p-6 border border-brand-neon/30 shadow-[inset_0_0_20px_rgba(57,255,20,0.15),_0_0_40px_rgba(0,0,0,0.8)] space-y-8">
                    {isNetworkViewOpen ? (
                      <div className="space-y-6">
                        <button 
                          onClick={() => setIsNetworkViewOpen(false)}
                          className="flex items-center gap-2 text-brand-neon text-xs font-black tracking-widest uppercase hover:opacity-80 transition-opacity cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" /> Voltar
                        </button>
                        
                        <div className="space-y-8 animate-fadeIn">
                          {/* Banner Head */}
                          <div className="relative overflow-hidden rounded-2xl border border-brand-neon/20 p-6 bg-gradient-to-r from-black/80 to-neutral-900/80 shadow-[0_4px_20px_rgba(128,255,0,0.1)]">
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-brand-neon/10 rounded-full blur-3xl pointer-events-none" />
                            <div className="relative flex items-center gap-4">
                              <div className="p-3.5 bg-brand-neon/10 rounded-2xl border border-brand-neon/30 shadow-[0_0_15px_rgba(128,255,0,0.15)] flex-shrink-0">
                                <Globe className="w-8 h-8 text-brand-neon animate-pulse" />
                              </div>
                              <div>
                                <h1 className="text-2xl font-black italic uppercase text-white tracking-tight">DOGGBITE NETWORK</h1>
                                <p className="text-brand-neon text-[9px] font-black tracking-widest uppercase mt-1">Conecte-se com a barulheira em todos os canais</p>
                              </div>
                            </div>
                          </div>

                          {/* Show Booking Area */}
                          <div className="space-y-3">
                            <h2 className="font-display font-black text-xs text-brand-neon uppercase tracking-widest flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-neon animate-ping" /> Contatos para Shows / Booking
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* WhatsApp Contact */}
                              <a 
                                href="https://wa.me/5527981711723" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-neon/40 hover:bg-brand-neon/5 transition-all duration-300"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.27 3.51 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.1 1.45 4.6 1.452 5.4 0 9.8-4.4 9.8-9.8.003-2.6-1.01-5-2.827-6.85-1.871-1.84-4.22-2.85-6.973-2.85-5.4 0-9.8 4.4-9.8 9.8-.002 1.8.482 3.5 1.4 5l-.33 1.2z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <h4 className="font-black text-xs text-white uppercase tracking-wider group-hover:text-brand-neon transition-colors">WhatsApp / Telefone</h4>
                                    <p className="text-[10px] text-white/50 font-mono mt-0.5">+55 (27) 98171-1723</p>
                                  </div>
                                </div>
                                <div className="p-1 rounded-lg bg-white/5 group-hover:bg-brand-neon/10 group-hover:text-brand-neon transition-all">
                                  <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-brand-neon" />
                                </div>
                              </a>

                              {/* Email Booking */}
                              <a 
                                href="mailto:doggbitehc@gmail.com"
                                className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-neon/40 hover:bg-brand-neon/5 transition-all duration-300"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-brand-neon/10 flex items-center justify-center border border-brand-neon/25 text-brand-neon group-hover:scale-105 transition-transform">
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                  </div>
                                  <div>
                                    <h4 className="font-black text-xs text-white uppercase tracking-wider group-hover:text-brand-neon transition-colors">E-mail Booking</h4>
                                    <p className="text-[10px] text-white/50 font-mono mt-0.5 font-bold">doggbitehc@gmail.com</p>
                                  </div>
                                </div>
                                <div className="p-1 rounded-lg bg-white/5 group-hover:bg-brand-neon/10 group-hover:text-brand-neon transition-all">
                                  <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-brand-neon" />
                                </div>
                              </a>
                            </div>
                          </div>

                          {/* Music Audio Streaming Platforms Section */}
                          <div className="space-y-3">
                            <h2 className="font-display font-black text-xs text-brand-neon uppercase tracking-widest flex items-center gap-2">
                              🎧 Plataformas de Audio / Streaming
                            </h2>
                            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 gap-3">
                              
                              {/* Spotify */}
                              <a 
                                href="https://open.spotify.com/intl-pt/album/1zv3KSsLOCdXMfLtHiYREt?si=1&nd=1&dlsi=56c00f409a074783"
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group flex flex-col items-center text-center p-4 rounded-2xl bg-gradient-to-b from-[#1db954]/10 to-transparent border border-[#1db954]/20 hover:border-[#1db954]/60 hover:bg-[#1db954]/5 transition-all duration-300 relative overflow-hidden"
                              >
                                <div className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ExternalLink className="w-3 h-3 text-[#1db954]" />
                                </div>
                                <div className="w-12 h-12 rounded-full bg-[#1db954] text-black flex items-center justify-center shadow-[0_0_15px_rgba(29,185,84,0.3)] mb-3 group-hover:scale-110 transition-transform duration-300">
                                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.893-.982-.336.075-.668-.135-.744-.47-.075-.336.135-.668.47-.743 3.856-.88 7.15-.5 9.822 1.135.295.178.387.563.205.853zm1.224-2.723c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.08-1.182-.413.125-.85-.107-.975-.522-.125-.413.107-.85.522-.975 3.678-1.117 8.25-.572 11.35 1.336.365.226.485.707.257 1.083zm.104-2.82c-3.26-1.937-8.64-2.12-11.754-1.173-.5.152-1.025-.133-1.177-.633-.153-.5.132-1.026.632-1.177 3.616-1.097 9.548-.888 13.3 1.34.45.267.6.845.333 1.295-.267.45-.845.6-1.334.333z"/></svg>
                                </div>
                                <span className="font-black text-xs text-white uppercase tracking-wider">Spotify</span>
                                <span className="text-[8px] text-white/40 uppercase mt-1 font-bold">Ouça o Álbum</span>
                              </a>

                              {/* Deezer */}
                              <a 
                                href="https://www.deezer.com/pt/album/379295627"
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group flex flex-col items-center text-center p-4 rounded-2xl bg-gradient-to-b from-[#a238ff]/10 to-transparent border border-[#a238ff]/20 hover:border-[#a238ff]/60 hover:bg-[#a238ff]/5 transition-all duration-300 relative overflow-hidden"
                              >
                                <div className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ExternalLink className="w-3 h-3 text-[#a238ff]" />
                                </div>
                                <div className="w-12 h-12 rounded-full bg-[#a238ff] text-white flex items-center justify-center shadow-[0_0_15px_rgba(162,56,255,0.3)] mb-3 group-hover:scale-110 transition-transform duration-300">
                                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                                    <path d="M1 18h4v4H1zm6-4h4v8H7zm6-4h4v12h-4zm6-4h4v16h-4zm-18-4h4v4H1zm6 0h4v4H7zm6 0h4v4h-4zm6 0h4v4h-4z"/>
                                  </svg>
                                </div>
                                <span className="font-black text-xs text-white uppercase tracking-wider">Deezer</span>
                                <span className="text-[8px] text-white/40 uppercase mt-1 font-bold">Streaming</span>
                              </a>

                              {/* Apple Music */}
                              <a 
                                href="https://music.apple.com/us/album/respeito-single/1656129717"
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group flex flex-col items-center text-center p-4 rounded-2xl bg-gradient-to-b from-[#fc3c44]/10 to-transparent border border-[#fc3c44]/20 hover:border-[#fc3c44]/60 hover:bg-[#fc3c44]/5 transition-all duration-300 relative overflow-hidden"
                              >
                                <div className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ExternalLink className="w-3 h-3 text-[#fc3c44]" />
                                </div>
                                <div className="w-12 h-12 rounded-full bg-[#fc3c44] text-white flex items-center justify-center shadow-[0_0_15px_rgba(252,60,68,0.3)] mb-3 group-hover:scale-110 transition-transform duration-300">
                                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M21 2.5v12.235c0 2.254-1.895 4.098-4.25 4.098-2.355 0-4.25-1.844-4.25-4.098 0-2.255 1.895-4.099 4.25-4.099.63 0 1.224.137 1.75.383V7.085L9 9.07v8.664c0 2.254-1.895 4.099-4.25 4.099C2.395 21.833.5 19.989.5 17.734c0-2.254 1.895-4.098 4.25-4.098.63 0 1.224.137 1.75.382V4.832c0-.397.26-.744.65-.838l12-2.748c.51-.117.97.268.97.79v.464z"/></svg>
                                </div>
                                <span className="font-black text-xs text-white uppercase tracking-wider">Apple Music</span>
                                <span className="text-[8px] text-white/40 uppercase mt-1 font-bold">Respeito Single</span>
                              </a>

                              {/* Tidal */}
                              <a 
                                href="https://tidal.com/album/262372213"
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group flex flex-col items-center text-center p-4 rounded-2xl bg-gradient-to-b from-[#00ffff]/10 to-transparent border border-[#00ffff]/20 hover:border-[#00ffff]/60 hover:bg-[#00ffff]/5 transition-all duration-300 relative overflow-hidden"
                              >
                                <div className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ExternalLink className="w-3 h-3 text-[#00ffff]" />
                                </div>
                                <div className="w-12 h-12 rounded-full bg-neutral-900 border border-[#00ffff]/30 text-[#00ffff] flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.2)] mb-3 group-hover:scale-110 transition-transform duration-300">
                                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                                    <path d="M12 4.44l4.444 4.445-4.444 4.444L7.556 8.885 12 4.44zM4.444 12l4.445 4.444-4.444 4.445L0 16.444 4.444 12zm15.112 0l4.444 4.444-4.444 4.445L15.11 16.444 19.556 12zM12 19.556l4.444 4.444-4.444 4.445-4.444-4.445 4.444-4.444z"/>
                                  </svg>
                                </div>
                                <span className="font-black text-xs text-white uppercase tracking-wider">Tidal</span>
                                <span className="text-[8px] text-white/40 uppercase mt-1 font-bold">Hi-Fi Audio</span>
                              </a>

                              {/* Amazon Music */}
                              <a 
                                href="https://music.amazon.com/albums/B0BN6YTGQ7?ref=dm_ff_featurefm&tag=featurefmbr-20"
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group flex flex-col items-center text-center p-4 rounded-2xl bg-gradient-to-b from-[#00a8e1]/10 to-transparent border border-[#00a8e1]/20 hover:border-[#00a8e1]/60 hover:bg-[#00a8e1]/5 transition-all duration-300 relative overflow-hidden"
                              >
                                <div className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ExternalLink className="w-3 h-3 text-[#00a8e1]" />
                                </div>
                                <div className="w-12 h-12 rounded-full bg-[#00a8e1] text-black flex items-center justify-center shadow-[0_0_15px_rgba(0,168,225,0.3)] mb-3 group-hover:scale-110 transition-transform duration-300">
                                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-.2 14c-1.84 0-3.32-.82-3.37-2.34-.05-1.57.94-2.22 2.76-2.4l3.11-.3v-.81c0-1.12-.42-1.63-1.68-1.63-1.17 0-2.25.4-2.28 1.4H8c.03-2.03 1.95-2.73 4.54-2.73 2.79 0 4.04 1.13 4.04 3.7v4.61h-.25c-.21.46-.5.71-.91.89-1 .44-2 .61-3.62.61zm3.3-3.01l-2.45.24c-1 .1-.14 1.42.02.61 1 .5 1.5.15 1.48-.85H15.1z"/>
                                  </svg>
                                </div>
                                <span className="font-black text-xs text-white uppercase tracking-wider">Amazon Music</span>
                                <span className="text-[8px] text-white/40 uppercase mt-1 font-bold">Streaming</span>
                              </a>

                              {/* OneRPM */}
                              <a 
                                href="https://onerpm.link/363718305523"
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group flex flex-col items-center text-center p-4 rounded-2xl bg-gradient-to-b from-[#ff8c00]/10 to-transparent border border-[#ff8c00]/20 hover:border-[#ff8c00]/60 hover:bg-[#ff8c00]/5 transition-all duration-300 relative overflow-hidden"
                              >
                                <div className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ExternalLink className="w-3 h-3 text-[#ff8c00]" />
                                </div>
                                <div className="w-12 h-12 rounded-full bg-[#ff8c00] text-black flex items-center justify-center shadow-[0_0_15px_rgba(255,140,0,0.3)] mb-3 group-hover:scale-110 transition-transform duration-300">
                                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15.93c-3.95-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2-15.86c3.95.49 7 3.85 7 7.93s-3.05 7.44-7 7.93V2.07z"/>
                                  </svg>
                                </div>
                                <span className="font-black text-xs text-white uppercase tracking-wider">oneRPM Link</span>
                                <span className="text-[8px] text-white/40 uppercase mt-1 font-bold">Smart Link</span>
                              </a>

                            </div>
                          </div>

                          {/* Social Networks Section */}
                          <div className="space-y-3">
                            <h2 className="font-display font-black text-xs text-brand-neon uppercase tracking-widest flex items-center gap-2">
                              ⚡ Redes Sociais & Comunidade
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {/* Instagram */}
                              <a 
                                href="https://www.instagram.com/doggbitehc" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group flex items-center gap-3 p-4 rounded-2xl bg-neutral-900 border border-white/5 hover:border-brand-neon/40 hover:bg-neutral-800 transition-all duration-300"
                              >
                                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-105 transition-transform">
                                  <Instagram className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-black text-xs text-white uppercase tracking-wider group-hover:text-brand-neon transition-colors">Instagram</h4>
                                  <p className="text-[8px] text-white/50 uppercase">Canal Oficial</p>
                                </div>
                              </a>

                              {/* Facebook */}
                              <a 
                                href="https://www.facebook.com/doggbitehc" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group flex items-center gap-3 p-4 rounded-2xl bg-neutral-900 border border-white/5 hover:border-brand-neon/40 hover:bg-neutral-800 transition-all duration-300"
                              >
                                <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform">
                                  <Facebook className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-black text-xs text-white uppercase tracking-wider group-hover:text-brand-neon transition-colors">Facebook</h4>
                                  <p className="text-[8px] text-white/50 uppercase">Comunidade</p>
                                </div>
                              </a>

                              {/* Youtube */}
                              <a 
                                href="https://youtube.com/channel/UC9ffJk_cqsY6FdxqgGbl4FA" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group flex items-center gap-3 p-4 rounded-2xl bg-neutral-900 border border-white/5 hover:border-brand-neon/40 hover:bg-neutral-800 transition-all duration-300"
                              >
                                <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-500 group-hover:scale-105 transition-transform">
                                  <Youtube className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-black text-xs text-white uppercase tracking-wider group-hover:text-brand-neon transition-colors">YouTube</h4>
                                  <p className="text-[8px] text-white/50 uppercase">Canal de Clipes</p>
                                </div>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : selectedMember ? (
                      <div className="space-y-6">
                        <button 
                          onClick={() => setSelectedMember(null)}
                          className="flex items-center gap-2 text-xs font-black tracking-widest uppercase hover:opacity-80 transition-opacity"
                          style={{ color: THEMES[theme].neon }}
                        >
                          <ChevronLeft className="w-4 h-4" /> Voltar
                        </button>
                        
                        <div className="flex flex-col md:flex-row gap-8">
                          <div className="w-full md:w-1/2">
                            <MemberCarousel 
                              images={selectedMember.gallery && selectedMember.gallery.length > 0 ? selectedMember.gallery : [selectedMember.image_url]} 
                              name={selectedMember.name}
                              role={selectedMember.role}
                            />
                          </div>
                          <div className="w-full md:w-1/2 space-y-4">
                            <h2 className="text-3xl font-black italic uppercase text-white">{selectedMember.name}</h2>
                            <p className="font-black tracking-widest uppercase text-sm" style={{ color: THEMES[theme].neon }}>{selectedMember.role}</p>
                            
                            {selectedMember.description && (
                              <div className="pt-4 border-t border-white/10">
                                <h3 className="text-xs font-black text-white/40 tracking-widest uppercase mb-2">Sobre</h3>
                                <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                                  {selectedMember.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Upper Card: NETWORK */}
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => setIsNetworkViewOpen(true)}
                          className="group relative cursor-pointer overflow-hidden rounded-[24px] border p-5 bg-[#050505] transition-all duration-300"
                          style={{
                            borderColor: `${THEMES[theme].neon}4d`,
                            boxShadow: `inset 0 0 15px ${THEMES[theme].neon}08`
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = THEMES[theme].neon;
                            e.currentTarget.style.boxShadow = `0 0 30px ${THEMES[theme].neon}1f`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = `${THEMES[theme].neon}4d`;
                            e.currentTarget.style.boxShadow = `inset 0 0 15px ${THEMES[theme].neon}08`;
                          }}
                        >
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-20 rounded-full blur-3xl group-hover:opacity-100 transition-opacity duration-300 pointer-events-none opacity-50" style={{ backgroundColor: `${THEMES[theme].neon}0f` }} />
                          <div className="absolute top-0 right-0 py-1 px-3.5 text-black font-black text-[7px] tracking-[0.2em] uppercase rounded-bl-xl shadow-sm" style={{ backgroundColor: THEMES[theme].neon }}>
                            BANDA CONTATOS & STREAMING
                          </div>
                          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-3.5">
                              <div className="w-11 h-11 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform duration-300" style={{ backgroundColor: `${THEMES[theme].neon}1a`, borderColor: `${THEMES[theme].neon}4d`, color: THEMES[theme].neon }}>
                                <Globe className="w-5.5 h-5.5 animate-pulse" />
                              </div>
                              <div>
                                <h3 className="text-base font-black italic uppercase text-white tracking-wider group-hover:text-[#ffffff] transition-colors select-none">
                                  NETWORK (REDES SOCIAIS & CONTATOS)
                                </h3>
                                <p className="text-white/50 text-[9px] uppercase tracking-wide mt-0.5 select-none">
                                  Todas as redes sociais, áudio streaming e contatos de Booking em um só lugar.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-[8px] font-black tracking-widest px-3 py-1.5 rounded-xl border group-hover:text-black transition-all uppercase self-start sm:self-auto shadow-sm" style={{ color: THEMES[theme].neon, backgroundColor: `${THEMES[theme].neon}1a`, borderColor: `${THEMES[theme].neon}33` }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = THEMES[theme].neon;
                                e.currentTarget.style.color = '#000000';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = `${THEMES[theme].neon}1a`;
                                e.currentTarget.style.color = THEMES[theme].neon;
                              }}
                            >
                              Acessar <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {isLoadingMembers ? (
                            <>
                              <MemberSkeleton />
                              <MemberSkeleton />
                              <MemberSkeleton />
                              <MemberSkeleton />
                            </>
                          ) : members.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                              <p className="text-white/20 text-[10px] uppercase font-black tracking-[0.4em]">Nenhum integrante cadastrado</p>
                            </div>
                          ) : (
                            <>
                              {isSaving && <MemberSkeleton />}
                              {members.map((member, index) => {
                                const isCardHovered = hoveredMemberId === member.id;
                                const MEMBER_COLORS = [
                                  '#39FF14', // Neon Green
                                  '#FF5F1F', // Neon Orange
                                  '#00FFFF', // Neon Cyan
                                  '#FF3131', // Neon Red
                                  '#FFF01F', // Neon Yellow
                                  '#FF007F', // Neon Pink
                                ];
                                const memberColor = member.color || MEMBER_COLORS[index % MEMBER_COLORS.length];
                                return (
                                  <motion.div
                                    key={member.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => setSelectedMember(member)}
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredMemberId(member.id)}
                                    onMouseLeave={() => setHoveredMemberId(null)}
                                  >
                                    <GlassCard 
                                      className="group p-0 overflow-hidden border transition-all duration-300"
                                      style={{
                                        borderColor: memberColor,
                                        boxShadow: isCardHovered 
                                          ? `0 0 25px -3px ${memberColor}99, inset 0 0 15px ${memberColor}20` 
                                          : `0 0 15px -5px ${memberColor}44, 0 10px 30px -10px rgba(0,0,0,0.6)`,
                                        backgroundColor: isCardHovered ? `${memberColor}10` : 'rgba(255,255,255,0.01)'
                                      }}
                                    >
                                      <MemberCarousel 
                                        images={member.gallery && member.gallery.length > 0 ? member.gallery : [member.image_url]} 
                                        name={member.name}
                                        role={member.role}
                                      />
                                      <div className="p-4 bg-black/40">
                                        <h4 
                                          className="text-xl font-black italic uppercase text-white leading-none transition-colors duration-300"
                                          style={{ color: isCardHovered ? memberColor : '#ffffff' }}
                                        >
                                          {member.name}
                                        </h4>
                                        <p 
                                          className="text-[8px] font-black tracking-[0.3em] uppercase mt-1 transition-colors duration-300"
                                          style={{ color: memberColor }}
                                        >
                                          {member.role}
                                        </p>
                                      </div>
                                    </GlassCard>
                                  </motion.div>
                                );
                              })}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Spacer for fixed footer */}
          <div className="h-12" />
        </div>
      </main>

      <AnimatePresence>
        {activeTab !== 'home' && activeTab !== 'media' && isPlayerActive && (
          <MiniPlayer 
            currentSong={SONGS[currentSongIndex]} 
            isPlaying={isPlaying} 
            setIsPlaying={setIsPlaying} 
            progress={progress}
            onSeek={onSeek}
            onNext={() => {
              if (isShuffle) {
                const randomIndex = Math.floor(Math.random() * SONGS.length);
                setCurrentSongIndex(randomIndex);
              } else {
                setCurrentSongIndex((prev) => (prev + 1) % SONGS.length);
              }
            }}
            onPrev={() => {
              if (isShuffle) {
                const randomIndex = Math.floor(Math.random() * SONGS.length);
                setCurrentSongIndex(randomIndex);
              } else {
                setCurrentSongIndex((prev) => (prev - 1 + SONGS.length) % SONGS.length);
              }
            }}
            onClose={() => {
              setIsPlaying(false);
              setIsPlayerActive(false);
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }
            }}
            isShuffle={isShuffle}
            toggleShuffle={toggleShuffle}
            repeatMode={repeatMode}
            toggleRepeat={toggleRepeat}
            theme={theme}
            onOpenPlayer={() => setActiveTab('home')}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            setVolume={setVolume}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            songs={SONGS}
            onSelectSong={setCurrentSongIndex}
          />
        )}
      </AnimatePresence>

      <audio 
        ref={audioRef}
        key={currentSongIndex}
        src={SONGS[currentSongIndex].audio}
        preload="auto"
        onTimeUpdate={onTimeUpdate}
        onDurationChange={onTimeUpdate}
        onLoadedData={onTimeUpdate}
        onCanPlay={onTimeUpdate}
        onPlay={onTimeUpdate}
        onEnded={onEnded}
        onLoadedMetadata={onTimeUpdate}
        onError={(e) => console.error("Audio error at index", currentSongIndex, e)}
      />

      {/* Bottom Navigation Bar - Fixed */}
      <AnimatePresence>
        {(!isAdminMode || isLoggedIn) && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1.5 w-max pointer-events-none"
          >
            <div className="bg-black/60 backdrop-blur-[12px] px-2 md:px-6 py-2 rounded-full flex gap-1 md:gap-6 items-center shadow-[0_15px_35px_rgba(0,0,0,0.8)] border border-brand-neon/30 relative max-w-[95vw] pointer-events-auto">
              {(isAdminMode ? ADMIN_TABS : TABS).map((tab) => {
                const isActive = (isAdminMode ? adminTab : activeTab) === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (isAdminMode) {
                        handleAdminTabChange(tab.id as any);
                      } else {
                        handleTabChange(tab.id);
                      }
                    }}
                    className="relative flex flex-col items-center justify-center group min-w-[52px] md:min-w-[64px] h-12 transition-all duration-500"
                  >
                    <motion.div 
                      animate={{ 
                        scale: isActive ? 1.2 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className={`flex items-center justify-center z-10 ${
                        isActive 
                          ? 'text-brand-neon drop-shadow-[0_0_12px_rgba(57,255,20,0.7)]' 
                          : 'text-white/40 group-hover:text-white'
                      }`}
                    >
                      <div className="relative">
                        {React.cloneElement(tab.icon as React.ReactElement<any>, { 
                          className: "w-5 h-5 md:w-6 h-6",
                          fill: isActive ? "currentColor" : "none",
                          strokeWidth: isActive ? 1.5 : 2
                        })}
                      </div>
                    </motion.div>
                    
                    <AnimatePresence initial={false}>
                      {!isActive && (
                        <motion.span 
                          initial={{ opacity: 0, height: 0, scale: 0.8 }}
                          animate={{ opacity: 1, height: 'auto', scale: 1 }}
                          exit={{ opacity: 0, height: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                          className="text-[6px] md:text-[8px] font-black font-sans tracking-[0.05em] text-[#555555] group-hover:text-white uppercase overflow-hidden whitespace-nowrap mt-0.5"
                        >
                          {tab.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {isActive && (
                      <motion.div 
                        layoutId="active-circle"
                        className="absolute inset-0 m-auto w-8 h-8 md:w-9 md:h-9 bg-brand-neon/10 rounded-full -z-10 border border-brand-neon/20 shadow-[0_0_15px_rgba(57,255,20,0.05)]"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Rodapé abaixo da navbar */}
            <p className="text-[7.5px] font-black tracking-[0.45em] text-white/35 uppercase select-none leading-none">
              © 2026 DOGGBITE • BRAZIL
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Checkout Modal - Rendered at root for maximum z-index and no clipping */}
      {selectedProduct && (
        <CheckoutModal 
          product={selectedProduct}
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          themeColor={THEMES[theme].neon}
        />
      )}

      {/* Fullscreen Karaoke Lyrics Overlay */}
      <AnimatePresence>
        {isLyricsFullScreen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-0 z-55 flex flex-col justify-between overflow-hidden p-6 md:p-12 text-white"
            style={{
              background: `radial-gradient(circle at center, rgb(15, 15, 15) 30%, ${THEMES[theme].bgEnd} 100%)`
            }}
          >
            {/* Blurred background track artwork */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30 filter blur-3xl saturate-150">
              <img 
                src={SONGS[currentSongIndex].image} 
                className="w-full h-full object-cover scale-150" 
                alt="" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-neutral-950/70" />
            </div>

            {/* Glowing spot overlay */}
            <div className="absolute inset-0 pointer-events-none z-0 transition-all duration-700 opacity-20"
                 style={{
                   background: `radial-gradient(circle, ${THEMES[theme].neon}40 0%, transparent 60%)`
                 }}
            />

            {/* Fullscreen Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-4 md:pb-6">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 shadow-lg">
                  <img 
                    src={SONGS[currentSongIndex].image} 
                    className="w-full h-full object-cover" 
                    alt="" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.25em] text-white/50">Música em Reprodução</span>
                    <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: THEMES[theme].neon }} />
                  </div>
                  <h2 className="text-sm md:text-xl font-bold uppercase tracking-wide truncate">{SONGS[currentSongIndex].title}</h2>
                  <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#999] mt-0.5">DOGGBITE</p>
                </div>
              </div>

              {/* Status & Close Trigger */}
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end text-right">
                  <p className="text-[7.5px] font-black uppercase tracking-widest leading-none" style={{ color: THEMES[theme].neon }}>MODO KARAOKÊ ATIVO</p>
                  <p className="text-[7px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Sincronismo Ultra-preciso</p>
                </div>
                <button
                  onClick={() => setIsLyricsFullScreen(false)}
                  className="p-2 md:p-3 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-all border border-white/5 shadow-md flex items-center justify-center cursor-pointer"
                  title="Fechar Modo Tela Cheia"
                >
                  <Minimize2 className="w-5 h-5 flex-shrink-0" style={{ color: THEMES[theme].neon }} />
                </button>
              </div>
            </div>

            {/* Fullscreen Lyrics Area */}
            <div className="relative z-10 flex-1 my-6 md:my-10 h-full overflow-hidden">
              <SpotifyLyrics 
                songTitle={SONGS[currentSongIndex].title}
                currentTime={currentTime}
                audioRef={audioRef}
                themeColor={THEMES[theme].neon}
                onSeekToTime={onSeekToTime}
                isFullScreenMode={true}
              />
            </div>

            {/* Fullscreen Control HUD panel */}
            <div className="relative z-10 bg-black/40 backdrop-blur-md rounded-3xl p-4 md:p-6 border border-white/5 shadow-[0_12px_40px_rgba(0,0,0,0.8)] max-w-3xl mx-auto w-full">
              {/* Fullscreen Waveform Track */}
              <div className="mb-3 px-1" onPointerDown={(e) => e.stopPropagation()}>
                <WaveformTrack
                  songTitle={SONGS[currentSongIndex]?.title}
                  progress={progress}
                  currentTime={currentTime}
                  duration={duration}
                  isPlaying={isPlaying}
                  onSeek={onSeek}
                  neonColor={THEMES[theme]?.neon || '#00FF66'}
                  variant="fullscreen"
                  showTimeLabels={true}
                />
              </div>

              {/* Action Hud Controls */}
              <div className="flex items-center justify-between gap-4">
                {/* Repetir / Shuffle */}
                <div className="flex items-center gap-1">
                  <button 
                    onClick={toggleShuffle}
                    className="p-2 rounded-lg transition-all duration-200 cursor-pointer text-white/40 hover:text-white"
                    style={{ color: isShuffle ? THEMES[theme].neon : undefined }}
                    title="Modo Embaralhar"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={toggleRepeat}
                    className="p-2 rounded-lg transition-all duration-200 cursor-pointer text-white/40 hover:text-white"
                    style={{ color: repeatMode !== 'none' ? THEMES[theme].neon : undefined }}
                    title="Modo Repetição"
                  >
                    <Repeat className="w-4 h-4" />
                  </button>
                </div>

                {/* Main Player Triad */}
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => {
                      if (isShuffle) {
                        setCurrentSongIndex(Math.floor(Math.random() * SONGS.length));
                      } else {
                        setCurrentSongIndex((currentSongIndex - 1 + SONGS.length) % SONGS.length);
                      }
                    }}
                    className="p-2 rounded-lg text-white/40 hover:text-white transition-all cursor-pointer active:scale-90"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all relative cursor-pointer"
                    style={{ 
                      backgroundColor: THEMES[theme].neon,
                      boxShadow: `0 0 20px ${THEMES[theme].neon}60`
                    }}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 animate-pulse" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>

                  <button 
                    onClick={() => {
                      if (isShuffle) {
                        setCurrentSongIndex(Math.floor(Math.random() * SONGS.length));
                      } else {
                        setCurrentSongIndex((currentSongIndex + 1) % SONGS.length);
                      }
                    }}
                    className="p-2 rounded-lg text-white/40 hover:text-white transition-all cursor-pointer active:scale-90"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                {/* Volume slider with reddish grad */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-white/40 hover:text-white transition-all cursor-pointer"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setVolume(val);
                      if (val > 0) setIsMuted(false);
                    }}
                    className="w-16 sm:w-24 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer outline-none accent-white transition-all custom-slider"
                    style={{
                      background: `linear-gradient(to right, ${THEMES[theme].neon} 0%, #ff7b00 ${65 * (isMuted ? 0 : volume)}%, #e11d48 ${100 * (isMuted ? 0 : volume)}%, rgba(255,255,255,0.1) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) 100%)`
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating PWA Install Banner */}
      <AnimatePresence>
        {showInstallBanner && (
          <motion.div
            initial={{ y: 150, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ y: 150, opacity: 0, x: "-50%" }}
            className="fixed bottom-24 left-1/2 z-50 w-[95%] max-w-sm bg-black/95 backdrop-blur-md rounded-2xl p-4 border border-brand-neon/30 shadow-[0_10px_30px_rgba(0,0,0,0.9),_0_0_20px_rgba(57,255,20,0.15)] flex items-center justify-between gap-3"
            style={{
              boxShadow: `0 10px 30px rgba(0,0,0,0.9), 0 0 20px ${currentTheme.neon}20`
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-neon/10 border border-brand-neon/20 flex items-center justify-center flex-shrink-0 text-brand-neon">
                <Smartphone className="w-5 h-5 animate-bounce" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black tracking-wider text-brand-neon uppercase">Instale o APP</p>
                <p className="text-[10.5px] text-white/80 font-medium">Melhor performance e player offline direto no celular!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-brand-neon text-black font-black text-[9px] tracking-widest px-3 py-2 rounded-xl uppercase hover:scale-105 active:scale-95 transition-all text-center flex-shrink-0"
              >
                Instalar
              </button>
              <button
                onClick={() => setShowInstallBanner(false)}
                className="p-1 px-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install Guide Modal */}
      <AnimatePresence>
        {isInstallGuideOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInstallGuideOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-[#0a0a0a] border border-brand-neon/30 rounded-[32px] p-6 text-left shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-white overflow-hidden max-h-[85vh] flex flex-col"
              style={{
                boxShadow: `0 20px 50px rgba(0,0,0,0.9), inset 0 0 20px ${currentTheme.neon}10`
              }}
            >
              {/* Top border neon line */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-brand-neon" />
              
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-brand-neon" />
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-brand-neon">COMO INSTALAR O APP</h3>
                </div>
                <button
                  onClick={() => setIsInstallGuideOpen(false)}
                  className="p-1 px-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors text-xs font-bold"
                >
                  FECHAR
                </button>
              </div>

              {/* Scrollable content container */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-6 text-xs text-white/80 scrollbar-hide">
                <p className="leading-relaxed border-b border-white/10 pb-3">
                  Instale o <span className="font-black text-white">DOGGBITE</span> no seu dispositivo como um aplicativo real para acesso instantâneo, melhor performance e player de áudio offline!
                </p>

                {/* iOS instructions */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-brand-neon/10 rounded-lg p-1.5 border border-brand-neon/20">
                      <Download className="w-4 h-4 text-brand-neon" />
                    </div>
                    <span className="font-black text-white tracking-wide uppercase text-[10px]">No iPhone / iOS:</span>
                  </div>
                  <ol className="list-decimal pl-5 space-y-1 text-white/70">
                    <li>Abra este site no navegador <span className="font-bold text-white">Safari</span>.</li>
                    <li>Toque no botão de de compartilhar <span className="font-bold text-brand-neon">Compartilhar</span> (ícone de quadrado com seta para cima no rodapé).</li>
                    <li>Role para baixo e selecione <span className="font-bold text-white">"Adicionar à Tela de Início"</span>.</li>
                    <li>Toque em <span className="font-bold text-brand-neon">Adicionar</span> no canto superior direito.</li>
                  </ol>
                </div>

                {/* Android / Desktop instructions */}
                <div className="space-y-2 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="bg-brand-neon/10 rounded-lg p-1.5 border border-brand-neon/20">
                      <Laptop className="w-4 h-4 text-brand-neon" />
                    </div>
                    <span className="font-black text-white tracking-wide uppercase text-[10px]">No Android / Outros:</span>
                  </div>
                  <ol className="list-decimal pl-5 space-y-1 text-white/70">
                    <li>Toque em <span className="font-bold text-white">"Instalar"</span> no banner flutuante ou no menu do aplicativo.</li>
                    <li>Se não ver a opção, clique nos <span className="font-bold text-white">três pontos (Menu)</span> do Google Chrome.</li>
                    <li>Escolha <span className="font-bold text-white">"Instalar aplicativo"</span> ou <span className="font-bold text-white">"Adicionar à tela inicial"</span>.</li>
                  </ol>
                </div>

                {/* Scan to Install / Share App QR Code */}
                <div className="space-y-2 pt-3 border-t border-white/10 flex flex-col items-center">
                  <div className="flex items-center gap-2 self-start">
                    <div className="bg-brand-neon/10 rounded-lg p-1.5 border border-brand-neon/20">
                      <QrCode className="w-4 h-4 text-brand-neon" />
                    </div>
                    <span className="font-black text-white tracking-wide uppercase text-[10px]">Acesso Rápido via QR Code:</span>
                  </div>
                  
                  <div className="relative mt-2 p-3 bg-neutral-900 border border-brand-neon/30 rounded-2xl shadow-[0_0_20px_rgba(162,255,0,0.1)] flex flex-col items-center gap-3 w-full">
                    <div className="relative p-2.5 bg-white rounded-xl">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=000000&bgcolor=ffffff&data=${encodeURIComponent(getShareableUrl())}`} 
                        alt="APP QR Code" 
                        className="w-32 h-32 select-none"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-[9px] text-white/50 text-center uppercase font-black tracking-widest leading-relaxed">
                      Escanear com a câmera para abrir ou instalar diretamente no celular
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 mt-2 space-y-3">
                <button
                  onClick={handleShareAppLink}
                  className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] tracking-widest py-3 rounded-2xl border border-white/10 uppercase hover:scale-[1.02] active:scale-95 transition-all text-center cursor-pointer"
                >
                  {appShareSuccess ? (
                    <Check className="w-4 h-4 text-brand-neon animate-pulse" />
                  ) : (
                    <Share2 className="w-4 h-4 text-brand-neon" />
                  )}
                  <span>{appShareSuccess ? 'LINK COPIADO PARA CLIPBOARD!' : 'COMPARTILHAR LINK DO APP'}</span>
                </button>

                <button
                  onClick={handleForceUpdateApp}
                  disabled={isUpdatingApp}
                  className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] tracking-widest py-3 rounded-2xl border border-white/10 uppercase hover:scale-[1.02] active:scale-95 transition-all text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingApp ? (
                    <Loader2 className="w-4 h-4 animate-spin text-brand-neon" />
                  ) : updateSuccess ? (
                    <Check className="w-4 h-4 text-brand-neon animate-bounce" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-brand-neon" />
                  )}
                  <span>
                    {isUpdatingApp ? 'ATUALIZANDO COMPONENTES...' : updateSuccess ? 'REINICIANDO O APP...' : 'VERIFICAR ATUALIZAÇÃO / LIMPAR CACHE'}
                  </span>
                </button>

                <button
                  onClick={() => setIsInstallGuideOpen(false)}
                  className="w-full bg-brand-neon text-black font-black text-[10px] tracking-widest py-3.5 rounded-2xl uppercase hover:scale-105 active:scale-95 transition-all text-center"
                  style={{
                    boxShadow: `0 5px 15px ${currentTheme.neon}30`
                  }}
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}