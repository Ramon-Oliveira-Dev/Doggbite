import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { getSongWaveform } from '../lib/waveformData';

interface WaveformTrackProps {
  songTitle?: string;
  progress: number; // 0 - 100
  currentTime?: number; // in seconds
  duration?: number; // in seconds
  isPlaying?: boolean;
  onSeek: (percentage: number) => void;
  neonColor?: string;
  variant?: 'full' | 'compact' | 'mini' | 'fullscreen';
  className?: string;
  showTimeLabels?: boolean;
}

export const WaveformTrack: React.FC<WaveformTrackProps> = ({
  songTitle = '',
  progress = 0,
  currentTime = 0,
  duration = 0,
  isPlaying = false,
  onSeek,
  neonColor = '#00FF66',
  variant = 'full',
  className = '',
  showTimeLabels = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null); // 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const [liveScrubProgress, setLiveScrubProgress] = useState<number | null>(null);

  // Retrieve precomputed real waveform peaks for this specific song
  const rawPeaks = useMemo(() => {
    return getSongWaveform(songTitle);
  }, [songTitle]);

  // Adjust bar density based on variant
  const numBars = useMemo(() => {
    switch (variant) {
      case 'mini':
        return 36;
      case 'compact':
        return 56;
      case 'fullscreen':
        return 96;
      case 'full':
      default:
        return 72;
    }
  }, [variant]);

  // Sample or resample the waveform peaks to match target bar count
  const bars = useMemo(() => {
    if (!rawPeaks || rawPeaks.length === 0) {
      return Array(numBars).fill(0.4);
    }
    const result: number[] = [];
    const step = rawPeaks.length / numBars;
    for (let i = 0; i < numBars; i++) {
      const startIdx = Math.floor(i * step);
      const endIdx = Math.min(rawPeaks.length, Math.floor((i + 1) * step));
      let sum = 0;
      let count = 0;
      for (let j = startIdx; j < endIdx; j++) {
        sum += rawPeaks[j];
        count++;
      }
      const avg = count > 0 ? sum / count : rawPeaks[startIdx] || 0.3;
      result.push(avg);
    }
    return result;
  }, [rawPeaks, numBars]);

  // Effective progress considering drag state
  const effectiveProgress = isDragging && liveScrubProgress !== null ? liveScrubProgress : progress;

  // Calculate percentage from pointer event
  const calculatePercentage = useCallback((clientX: number): number => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const raw = (offsetX / rect.width) * 100;
    return Math.max(0, Math.min(100, raw));
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const target = containerRef.current;
    if (target && 'setPointerCapture' in target) {
      try {
        target.setPointerCapture(e.pointerId);
      } catch (_) {}
    }
    setIsDragging(true);
    const pct = calculatePercentage(e.clientX);
    setLiveScrubProgress(pct);
    onSeek(pct);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const pct = calculatePercentage(e.clientX);
    setHoverPosition(pct);

    if (isDragging) {
      e.stopPropagation();
      setLiveScrubProgress(pct);
      onSeek(pct);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      e.stopPropagation();
      const pct = calculatePercentage(e.clientX);
      onSeek(pct);
      setIsDragging(false);
      setLiveScrubProgress(null);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Hover timestamp preview
  const hoverTime = useMemo(() => {
    if (hoverPosition === null || !duration) return null;
    return formatTime((hoverPosition / 100) * duration);
  }, [hoverPosition, duration]);

  // Dynamic bar height container classes
  const containerHeightClass = useMemo(() => {
    switch (variant) {
      case 'mini':
        return 'h-4';
      case 'compact':
        return 'h-7';
      case 'fullscreen':
        return 'h-14 md:h-18';
      case 'full':
      default:
        return 'h-9 md:h-11';
    }
  }, [variant]);

  // Bar gap and width classes
  const barGapClass = useMemo(() => {
    switch (variant) {
      case 'mini':
        return 'gap-[1.5px]';
      case 'compact':
        return 'gap-[2px]';
      case 'fullscreen':
        return 'gap-[2px] md:gap-[3px]';
      case 'full':
      default:
        return 'gap-[2px] md:gap-[2.5px]';
    }
  }, [variant]);

  return (
    <div className={`w-full select-none ${className}`}>
      {/* Waveform Interactive Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          setIsDragging(false);
          setLiveScrubProgress(null);
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setHoverPosition(null);
        }}
        className={`relative ${containerHeightClass} w-full flex items-center justify-between cursor-pointer px-1 py-1 rounded-xl transition-all duration-200 group/wave ${
          variant !== 'mini' ? 'hover:bg-white/[0.04]' : ''
        }`}
        role="slider"
        aria-valuenow={Math.round(effectiveProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Controle de reprodução em forma de onda"
      >
        {/* Hover Time Tooltip (Full & Fullscreen variants) */}
        {isHovering && hoverPosition !== null && hoverTime && variant !== 'mini' && (
          <div
            className="absolute -top-7 transform -translate-x-1/2 pointer-events-none z-30 transition-all duration-75"
            style={{ left: `${hoverPosition}%` }}
          >
            <div
              className="px-2 py-0.5 rounded text-[10px] font-mono font-black text-black shadow-lg uppercase tracking-wider backdrop-blur-md"
              style={{
                backgroundColor: neonColor,
                boxShadow: `0 0 12px ${neonColor}80`
              }}
            >
              {hoverTime}
            </div>
          </div>
        )}

        {/* Hover Ghost Scrubber Line */}
        {isHovering && hoverPosition !== null && variant !== 'mini' && (
          <div
            className="absolute top-0 bottom-0 w-[1.5px] pointer-events-none z-20 bg-white/40"
            style={{ left: `${hoverPosition}%` }}
          />
        )}

        {/* Playhead Glow Needle (Current Position) */}
        {variant !== 'mini' && (
          <div
            className="absolute top-0 bottom-0 w-[2px] pointer-events-none z-20 transition-all duration-75 rounded-full"
            style={{
              left: `${effectiveProgress}%`,
              backgroundColor: neonColor,
              boxShadow: `0 0 10px ${neonColor}, 0 0 4px #FFFFFF`
            }}
          />
        )}

        {/* The Waveform Bars Grid */}
        <div className={`w-full h-full flex items-center justify-between ${barGapClass} relative z-10`}>
          {bars.map((peak, idx) => {
            const barPercent = (idx / (numBars - 1)) * 100;
            const isPlayed = barPercent <= effectiveProgress;
            const isHovered = isHovering && hoverPosition !== null && barPercent <= hoverPosition;
            const isNearPlayhead = isPlaying && Math.abs(barPercent - effectiveProgress) < 2.5;

            // Compute dynamic height percentage (minimum 16% height for visibility)
            let heightPct = Math.max(16, Math.min(100, Math.round(peak * 100)));

            // Lively acoustic bounce when audio is playing near playhead
            if (isNearPlayhead) {
              heightPct = Math.min(100, heightPct * 1.15);
            }

            return (
              <div
                key={idx}
                className="flex-1 h-full flex items-center justify-center transition-transform duration-100"
              >
                <div
                  className={`w-full rounded-full transition-all duration-150 ${
                    isPlayed
                      ? 'shadow-[0_0_8px_var(--wave-glow)]'
                      : isHovered
                      ? 'bg-white/40'
                      : 'bg-white/18 hover:bg-white/30'
                  }`}
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: isPlayed ? neonColor : undefined,
                    // Real Neon Glow effect for played bars
                    boxShadow: isPlayed
                      ? `0 0 7px ${neonColor}AA, 0 0 2px ${neonColor}`
                      : undefined,
                    filter: isPlayed
                      ? `drop-shadow(0 0 3px ${neonColor})`
                      : undefined,
                    opacity: isPlayed ? 1 : isHovered ? 0.8 : 0.45
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Optional Time Stamps underneath */}
      {showTimeLabels && (
        <div className="flex justify-between items-center text-[8px] md:text-[9.5px] font-black tracking-widest uppercase text-white/40 font-mono mt-1 px-1">
          <span style={{ color: effectiveProgress > 0 ? neonColor : undefined }}>
            {formatTime(currentTime)}
          </span>
          <span>{formatTime(duration)}</span>
        </div>
      )}
    </div>
  );
};
