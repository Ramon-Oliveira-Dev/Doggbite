import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { Music, Play } from 'lucide-react';
import { SONG_LYRICS, getActiveLyricIndex, LyricLine, formatLyricTimestamp } from '../lib/lyrics';

interface SpotifyLyricsProps {
  songTitle: string;
  currentTime?: number;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  themeColor: string;
  onSeekToTime?: (time: number) => void;
  isFullScreenMode?: boolean;
}

export const SpotifyLyrics: React.FC<SpotifyLyricsProps> = ({
  songTitle,
  currentTime = 0,
  themeColor,
  onSeekToTime,
  isFullScreenMode = false
}) => {
  const lyrics = useMemo(() => SONG_LYRICS[songTitle] || [], [songTitle]);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track if user is actively touching or scrolling with mouse wheel
  const isUserInteractingRef = useRef(false);
  const interactionTimerRef = useRef<any>(null);
  const lastActiveIndexRef = useRef<number>(-1);

  // High-performance binary search for the active line without artificial offsets
  const activeState = useMemo(() => {
    return getActiveLyricIndex(lyrics, currentTime);
  }, [lyrics, currentTime]);

  const { lineIndex: activeIndex, nextVocalInSeconds } = activeState;

  // Center active line smoothly in viewport
  const scrollToActiveLine = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (!containerRef.current) return;
    
    if (activeIndex >= 0 && lineRefs.current[activeIndex]) {
      const activeEl = lineRefs.current[activeIndex];
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior,
          block: 'center',
          inline: 'nearest'
        });
      }
    } else if (activeIndex === -1) {
      containerRef.current.scrollTo({
        top: 0,
        behavior
      });
    }
  }, [activeIndex]);

  // Auto-scroll when active line index transitions
  useEffect(() => {
    if (!isUserInteractingRef.current && activeIndex !== lastActiveIndexRef.current) {
      lastActiveIndexRef.current = activeIndex;
      scrollToActiveLine('smooth');
    }
  }, [activeIndex, scrollToActiveLine]);

  // Reset scroll and re-center on song change
  useEffect(() => {
    isUserInteractingRef.current = false;
    lastActiveIndexRef.current = -1;
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [songTitle]);

  // Handle user manual touch / wheel interactions without breaking auto-scroll
  const handleUserInteraction = () => {
    isUserInteractingRef.current = true;
    if (interactionTimerRef.current) {
      clearTimeout(interactionTimerRef.current);
    }
    // Resume auto-centering after 2.5s of no touch/wheel input
    interactionTimerRef.current = setTimeout(() => {
      isUserInteractingRef.current = false;
      scrollToActiveLine('smooth');
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
    };
  }, []);

  if (lyrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center select-none">
        <Music className="w-10 h-10 text-white/20 mb-3 animate-pulse" />
        <p className="text-white/40 text-xs uppercase font-black tracking-widest leading-relaxed">
          Nenhuma letra sincronizada para<br />
          <span className="text-white/75 font-bold">{songTitle}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col justify-center overflow-hidden">
      {/* Scrollable Lyrics Container with Spotify Vertical Padding and Linear Gradient Mask */}
      <div
        ref={containerRef}
        onWheel={handleUserInteraction}
        onTouchStart={handleUserInteraction}
        onTouchMove={handleUserInteraction}
        className={`overflow-y-auto px-4 sm:px-8 py-20 md:py-32 custom-scrollbar relative h-full select-none space-y-4 sm:space-y-6 ${
          isFullScreenMode ? 'max-w-4xl mx-auto' : 'max-w-2xl mx-auto'
        }`}
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.95) 15%, rgba(0,0,0,0.95) 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.95) 15%, rgba(0,0,0,0.95) 85%, transparent 100%)',
          scrollBehavior: 'smooth'
        }}
      >
        {lyrics.map((line: LyricLine, index: number) => {
          const isCurrent = activeIndex === index;
          const isPast = activeIndex > index;
          const isInstrumental = line.isInstrumental || (line.text.startsWith('[') && line.text.endsWith(']'));

          // Instrumental Break / Solo (Spotify rhythmic wave indicator)
          if (isInstrumental) {
            const rawLabel = line.text.replace(/^\[|\]$/g, '').trim();
            return (
              <div
                key={index}
                ref={(el) => {
                  lineRefs.current[index] = el;
                }}
                onClick={() => {
                  isUserInteractingRef.current = false;
                  onSeekToTime?.(line.time);
                }}
                className={`group transition-all duration-300 py-2.5 px-6 mx-auto w-fit rounded-full border flex items-center gap-3 cursor-pointer select-none font-mono text-xs sm:text-sm tracking-wider uppercase my-4 ${
                  isCurrent
                    ? 'bg-white/10 opacity-100 scale-105 shadow-2xl'
                    : isPast
                    ? 'bg-black/20 text-white/40 border-white/5 opacity-50 hover:opacity-80'
                    : 'bg-black/30 text-white/20 border-white/5 opacity-30 hover:opacity-70'
                }`}
                style={{
                  borderColor: isCurrent ? themeColor : 'rgba(255, 255, 255, 0.08)',
                  boxShadow: isCurrent ? `0 0 25px ${themeColor}50` : 'none',
                  color: isCurrent ? themeColor : undefined,
                  textShadow: isCurrent ? `0 0 12px ${themeColor}` : 'none'
                }}
              >
                {/* Spotify Waveform Beat Animation */}
                <span className="flex items-center gap-1">
                  <span
                    className={`w-1.5 h-4 rounded-full ${isCurrent ? 'animate-bounce' : 'bg-white/25'}`}
                    style={{
                      backgroundColor: isCurrent ? themeColor : undefined,
                      animationDelay: '0ms'
                    }}
                  />
                  <span
                    className={`w-1.5 h-6 rounded-full ${isCurrent ? 'animate-bounce' : 'bg-white/25'}`}
                    style={{
                      backgroundColor: isCurrent ? themeColor : undefined,
                      animationDelay: '180ms'
                    }}
                  />
                  <span
                    className={`w-1.5 h-3 rounded-full ${isCurrent ? 'animate-bounce' : 'bg-white/25'}`}
                    style={{
                      backgroundColor: isCurrent ? themeColor : undefined,
                      animationDelay: '360ms'
                    }}
                  />
                </span>

                <span className="font-black text-xs sm:text-sm tracking-widest">{rawLabel}</span>

                {isCurrent && nextVocalInSeconds !== undefined && nextVocalInSeconds > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white font-mono font-bold">
                    {Math.ceil(nextVocalInSeconds)}s
                  </span>
                )}
              </div>
            );
          }

          // Vocal Lyric Line (Spotify High-Contrast Karaoke Typography)
          return (
            <div
              key={index}
              ref={(el) => {
                lineRefs.current[index] = el;
              }}
              onClick={() => {
                isUserInteractingRef.current = false;
                onSeekToTime?.(line.time);
              }}
              className={`group relative text-left sm:text-center transition-all duration-300 py-2 sm:py-3 px-4 sm:px-8 rounded-2xl cursor-pointer select-none ${
                isCurrent
                  ? isFullScreenMode
                    ? 'scale-105 opacity-100 font-black text-2xl sm:text-4xl md:text-5xl tracking-tight leading-tight my-2'
                    : 'scale-105 opacity-100 font-black text-base sm:text-xl md:text-2xl tracking-tight leading-snug my-1.5'
                  : isPast
                  ? isFullScreenMode
                    ? 'opacity-85 font-bold text-lg sm:text-2xl md:text-3xl text-white/80 hover:text-white hover:opacity-100 hover:scale-101'
                    : 'opacity-80 font-bold text-xs sm:text-base text-white/75 hover:text-white hover:opacity-100 hover:scale-101'
                  : isFullScreenMode
                  ? 'opacity-25 font-semibold text-base sm:text-xl md:text-2xl text-white/30 hover:opacity-60 hover:text-white/70 filter blur-[0.4px] hover:blur-none'
                  : 'opacity-25 font-semibold text-xs sm:text-sm text-white/30 hover:opacity-60 hover:text-white/70 filter blur-[0.3px] hover:blur-none'
              }`}
              style={{
                color: isCurrent ? '#ffffff' : undefined,
                textShadow: isCurrent
                  ? `0 0 24px ${themeColor}, 0 0 45px ${themeColor}90, 0 2px 10px rgba(0,0,0,0.9)`
                  : 'none'
              }}
            >
              {/* Timestamp on Hover */}
              <span className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-60 text-[9px] font-mono text-white/70 bg-black/60 px-2 py-0.5 rounded-md transition-opacity pointer-events-none hidden md:inline-flex items-center gap-1">
                <Play className="w-2.5 h-2.5 fill-current" />
                {formatLyricTimestamp(line.time)}
              </span>

              {/* Lyric Text Line */}
              <span className="inline-block transition-transform duration-200">
                {line.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
