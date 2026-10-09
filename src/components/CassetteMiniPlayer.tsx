import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  X, 
  Maximize2,
  Disc
} from 'lucide-react';
import { WaveformTrack } from './WaveformTrack';

interface CassetteMiniPlayerProps {
  currentSong: any;
  isPlaying: boolean;
  setIsPlaying: (p: boolean) => void;
  progress: number;
  onSeek: (val: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  isShuffle: boolean;
  toggleShuffle: () => void;
  repeatMode: 'none' | 'one' | 'all';
  toggleRepeat: () => void;
  theme?: 'green' | 'orange';
  neonColor?: string;
  onOpenPlayer?: () => void;
}

export const CassetteMiniPlayer: React.FC<CassetteMiniPlayerProps> = ({
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
  neonColor = '#00FF66',
  onOpenPlayer
}) => {
  // Mechanical 3-digit tape counter (000 to 999) based on progress
  const tapeCounter = Math.min(999, Math.floor((progress / 100) * 840) + 12);
  const counterStr = String(tapeCounter).padStart(3, '0');

  // Spool rotation angles driven by requestAnimationFrame for silk-smooth motion
  const leftSpoolRef = useRef<HTMLDivElement>(null);
  const rightSpoolRef = useRef<HTMLDivElement>(null);
  const spoolAngleRef = useRef<number>(0);
  const spoolVelocityRef = useRef<number>(0);

  // Analog VU meter needles physics simulation
  const needleLRef = useRef<HTMLDivElement>(null);
  const needleRRef = useRef<HTMLDivElement>(null);
  const peakLedRef = useRef<HTMLDivElement>(null);

  const needleAngleL = useRef<number>(-36); // Rest position (-20dB)
  const needleAngleR = useRef<number>(-36);
  const targetAngleL = useRef<number>(-36);
  const targetAngleR = useRef<number>(-36);

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let pulseTimer = 0;

    const updatePhysics = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      pulseTimer += dt;

      // 1. Spool rotation physics (Tape motor acceleration & friction decay)
      if (isPlaying) {
        spoolVelocityRef.current += (240 - spoolVelocityRef.current) * 0.1;
      } else {
        spoolVelocityRef.current *= 0.94;
        if (spoolVelocityRef.current < 0.2) spoolVelocityRef.current = 0;
      }
      spoolAngleRef.current = (spoolAngleRef.current + spoolVelocityRef.current * dt) % 360;

      if (leftSpoolRef.current) {
        leftSpoolRef.current.style.transform = `rotate(${spoolAngleRef.current}deg)`;
      }
      if (rightSpoolRef.current) {
        rightSpoolRef.current.style.transform = `rotate(${spoolAngleRef.current}deg)`;
      }

      // 2. Analog VU Meter Ballistics
      // Standard VU response: Rapid rise (attack ~25ms), smooth overshoot and damped fall (~300ms)
      if (isPlaying) {
        // Generate simulated dynamic audio transients with beat rhythmic cadence
        if (pulseTimer > 0.09) {
          pulseTimer = 0;
          // Dynamic swing between -14dB (approx -20 deg) and +2dB (+24 deg)
          const beatKick = Math.random() > 0.65 ? Math.random() * 26 + 6 : Math.random() * 16 - 10;
          const jitterL = (Math.random() - 0.5) * 8;
          const jitterR = (Math.random() - 0.5) * 8;

          targetAngleL.current = Math.min(34, Math.max(-36, beatKick + jitterL));
          targetAngleR.current = Math.min(34, Math.max(-36, beatKick + jitterR));
        }

        // Fast attack (reacts instantaneously)
        if (targetAngleL.current > needleAngleL.current) {
          needleAngleL.current += (targetAngleL.current - needleAngleL.current) * 0.45;
        } else {
          // Controlled decay
          needleAngleL.current += (targetAngleL.current - needleAngleL.current) * 0.15;
        }

        if (targetAngleR.current > needleAngleR.current) {
          needleAngleR.current += (targetAngleR.current - needleAngleR.current) * 0.45;
        } else {
          needleAngleR.current += (targetAngleR.current - needleAngleR.current) * 0.15;
        }
      } else {
        // Return gently to mechanical zero stop (-36 degrees)
        needleAngleL.current += (-36 - needleAngleL.current) * 0.12;
        needleAngleR.current += (-36 - needleAngleR.current) * 0.12;
      }

      // Apply needle transforms
      if (needleLRef.current) {
        needleLRef.current.style.transform = `rotate(${needleAngleL.current}deg)`;
      }
      if (needleRRef.current) {
        needleRRef.current.style.transform = `rotate(${needleAngleR.current}deg)`;
      }

      // Peak LED glows red when either needle pushes into red zone (> 12 deg / 0dB)
      if (peakLedRef.current) {
        const isPeaking = isPlaying && (needleAngleL.current > 10 || needleAngleR.current > 10);
        peakLedRef.current.style.opacity = isPeaking ? '1' : '0.15';
        peakLedRef.current.style.boxShadow = isPeaking ? '0 0 8px #ef4444' : 'none';
      }

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Tape roll thickness calculations (left depletes as right fills up)
  const leftTapeRadius = 17 - (progress / 100) * 6; // 17px down to 11px
  const rightTapeRadius = 11 + (progress / 100) * 6; // 11px up to 17px

  return (
    <motion.div
      initial={{ y: 90, opacity: 0, scale: 0.98 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 90, opacity: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className="fixed bottom-[88px] sm:bottom-[92px] left-2.5 sm:left-4 right-2.5 sm:right-4 z-40 max-w-xl mx-auto select-none"
    >
      {/* WALKMAN / CASSETTE CHASSIS */}
      <div 
        className="relative rounded-2xl p-2.5 sm:p-3 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-white/15"
        style={{
          background: 'linear-gradient(175deg, rgba(28,30,34,0.96) 0%, rgba(18,20,23,0.97) 50%, rgba(10,11,13,0.98) 100%)',
          backdropFilter: 'blur(24px)'
        }}
      >
        {/* Subtle Brushed Metal & Polycarbonate Sheen */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        {/* TOP HARDWARE RAIL: Screws, Walkman Logo, Mechanical Counter & Eject/Close */}
        <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08] text-[9px] font-mono">
          {/* Left: Top Screw + Walkman Branding */}
          <div className="flex items-center gap-2">
            {/* Corner Screw */}
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/80 border border-white/20 flex items-center justify-center shadow-inner">
              <span className="text-[7px] text-zinc-400 font-black leading-none">+</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-black text-white/90 tracking-wider text-[8.5px] uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/90 shadow-[0_0_6px_rgba(251,191,36,0.8)] inline-block" />
                WALKMAN
              </span>
              <span className="text-[7.5px] text-zinc-400 tracking-widest hidden sm:inline font-sans font-bold">
                AUTO REVERSE
              </span>
            </div>
          </div>

          {/* Center: Tape Type Badge */}
          <div className="hidden xs:flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[7px] font-black uppercase tracking-widest text-zinc-300">
            <span className="text-amber-400 font-bold">CrO₂</span>
            <span>•</span>
            <span className="text-zinc-400">TYPE II</span>
            <span>•</span>
            <span style={{ color: neonColor }}>HIGH BIAS</span>
          </div>

          {/* Right: Mechanical 3-Digit Tape Counter + Eject / Close */}
          <div className="flex items-center gap-2">
            {/* Mechanical Counter Display */}
            <div 
              className="flex items-center px-1.5 py-0.5 rounded bg-black/80 border border-zinc-700/80 shadow-inner font-mono text-[8px] font-black tracking-widest text-amber-300/90"
              title="Contador Mecânico de Fita"
            >
              <span className="text-[6.5px] text-zinc-500 mr-1 uppercase">TAPE</span>
              <span className="bg-zinc-900 px-0.5 rounded text-white">{counterStr[0]}</span>
              <span className="bg-zinc-900 px-0.5 rounded text-white mx-[1px]">{counterStr[1]}</span>
              <span className="bg-zinc-900 px-0.5 rounded text-white">{counterStr[2]}</span>
            </div>

            {/* Quick Turntable Expand Button */}
            <button
              onClick={() => onOpenPlayer?.()}
              className="p-1 rounded bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-white/10 flex items-center gap-1 text-[7.5px] font-bold uppercase tracking-wider"
              title="Abrir Toca-Discos / Vinil Completo"
            >
              <Disc className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Vinil</span>
            </button>

            {/* Close / Eject button */}
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="p-1 rounded-full text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Fechar Mini Player (Eject)"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Top Right Screw */}
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/80 border border-white/20 flex items-center justify-center shadow-inner">
              <span className="text-[7px] text-zinc-400 font-black leading-none">+</span>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: Track Info + Translucent Cassette Window + Mini-VU Meter */}
        <div className="grid grid-cols-12 gap-2 sm:gap-2.5 items-center my-2">
          
          {/* TRACK INFO / CASSETTE J-CARD LABEL (Cols 1-4 sm: 1-4) */}
          <div 
            onClick={() => onOpenPlayer?.()}
            className="col-span-5 sm:col-span-4 flex items-center gap-2 cursor-pointer group/tapelabel min-w-0"
            title="Toque para abrir vinil em alta fidelidade"
          >
            {/* Album Cover stylized as Cassette Insert */}
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden border border-white/20 flex-shrink-0 shadow-md group-hover/tapelabel:border-brand-neon transition-all">
              <img 
                src={currentSong.image} 
                alt="" 
                className="w-full h-full object-cover group-hover/tapelabel:scale-105 transition-transform duration-300" 
              />
              {/* Cassette Tape "SIDE A" corner stamp */}
              <div className="absolute top-0 left-0 bg-black/85 text-[6.5px] font-black text-amber-400 px-1 py-0.2 rounded-br font-mono border-r border-b border-white/20">
                SIDE A
              </div>
              {/* Status LED over album */}
              {isPlaying && (
                <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: neonColor }} />
                  <span className="absolute w-1.5 h-1.5 rounded-full" style={{ backgroundColor: neonColor }} />
                </div>
              )}
            </div>

            {/* Song Meta */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest font-mono">DOGGBITE</span>
                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                <span className="text-[6.5px] font-bold text-amber-400/90 uppercase font-mono">C-60</span>
              </div>
              <h6 className="text-[10.5px] sm:text-[11px] font-black text-white uppercase tracking-wider truncate group-hover/tapelabel:text-brand-neon transition-colors leading-tight mt-0.5">
                {currentSong.title}
              </h6>
              <p className="text-[7.5px] font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: isPlaying ? neonColor : '#52525b' }} />
                <span>{isPlaying ? 'REPRODUZINDO' : 'PAUSADO'}</span>
              </p>
            </div>
          </div>

          {/* CASSETTE TAPE WINDOW WITH ROTATING SPOOLS (Cols 5-8 sm: 5-8) */}
          <div 
            onClick={() => onOpenPlayer?.()}
            className="col-span-4 sm:col-span-5 h-11 sm:h-12 rounded-lg bg-black/75 border border-white/15 px-2 relative overflow-hidden flex items-center justify-between cursor-pointer group/window shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]"
            title="Mecanismo de Fita Cassete • Toque para abrir vinil"
          >
            {/* Smoked glass reflection glare */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none" />
            
            {/* Center Tape Guide Tick Scale (100 - 50 - 0) */}
            <div className="absolute left-1/2 top-1 -translate-x-1/2 flex items-center gap-1.5 text-[5.5px] font-mono text-zinc-500 font-bold pointer-events-none">
              <span>100</span>
              <span className="w-1 h-0.5 bg-zinc-600" />
              <span>50</span>
              <span className="w-1 h-0.5 bg-zinc-600" />
              <span>0</span>
            </div>

            {/* Horizontal Magnetic Tape Strip connecting spools */}
            <div className="absolute bottom-2.5 left-6 right-6 h-[2px] bg-gradient-to-r from-[#2a1b12] via-[#3b2416] to-[#2a1b12] pointer-events-none opacity-80" />

            {/* LEFT CASSETTE SPOOL (Supply reel) */}
            <div className="relative flex items-center justify-center z-10">
              {/* Wound brown magnetic tape pack */}
              <div 
                className="absolute rounded-full bg-gradient-to-br from-[#3b2315] via-[#24150b] to-[#402617] border border-[#52331f]/50 transition-all duration-300"
                style={{ width: `${leftTapeRadius * 2}px`, height: `${leftTapeRadius * 2}px` }}
              />

              {/* White Geared Spool Cog (6 teeth) */}
              <div 
                ref={leftSpoolRef}
                className="w-5 h-5 rounded-full bg-zinc-200 border border-zinc-400 flex items-center justify-center relative shadow-sm"
              >
                {/* 6 Gear Teeth / Spokes */}
                <div className="absolute w-full h-[2px] bg-zinc-500/70" />
                <div className="absolute w-full h-[2px] bg-zinc-500/70 rotate-60" />
                <div className="absolute w-full h-[2px] bg-zinc-500/70 -rotate-60" />
                {/* Spindle drive center hole */}
                <div className="w-2 h-2 rounded-full bg-black border border-zinc-600 z-10" />
              </div>
            </div>

            {/* Tape Chamber Center Label */}
            <div className="z-10 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-5 h-2 rounded-sm bg-zinc-900 border border-zinc-700/80 flex items-center justify-center">
                <span className="text-[5.5px] font-black text-amber-400 font-mono tracking-tighter">CrO₂</span>
              </div>
            </div>

            {/* RIGHT CASSETTE SPOOL (Take-up reel) */}
            <div className="relative flex items-center justify-center z-10">
              {/* Wound brown magnetic tape pack */}
              <div 
                className="absolute rounded-full bg-gradient-to-br from-[#3b2315] via-[#24150b] to-[#402617] border border-[#52331f]/50 transition-all duration-300"
                style={{ width: `${rightTapeRadius * 2}px`, height: `${rightTapeRadius * 2}px` }}
              />

              {/* White Geared Spool Cog (6 teeth) */}
              <div 
                ref={rightSpoolRef}
                className="w-5 h-5 rounded-full bg-zinc-200 border border-zinc-400 flex items-center justify-center relative shadow-sm"
              >
                {/* 6 Gear Teeth / Spokes */}
                <div className="absolute w-full h-[2px] bg-zinc-500/70" />
                <div className="absolute w-full h-[2px] bg-zinc-500/70 rotate-60" />
                <div className="absolute w-full h-[2px] bg-zinc-500/70 -rotate-60" />
                {/* Spindle drive center hole */}
                <div className="w-2 h-2 rounded-full bg-black border border-zinc-600 z-10" />
              </div>
            </div>

            {/* Guide Rollers at bottom corners */}
            <div className="absolute bottom-1 left-2 w-1.5 h-1.5 rounded-full bg-zinc-500 border border-zinc-300 shadow-inner" />
            <div className="absolute bottom-1 right-2 w-1.5 h-1.5 rounded-full bg-zinc-500 border border-zinc-300 shadow-inner" />
          </div>

          {/* MINI-VU METER ANALÓGICO COM AGULHAS PULSANTES (Cols 9-12 sm: 9-12) */}
          <div 
            className="col-span-3 sm:col-span-3 h-11 sm:h-12 rounded-lg border border-white/15 p-1 relative overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.85)] flex flex-col justify-between"
            style={{
              background: 'radial-gradient(circle at 50% 120%, rgba(35,26,16,0.95) 0%, rgba(15,13,11,0.98) 100%)',
            }}
            title="VU Meter Analógico Estéreo"
          >
            {/* Vintage Warm Backlight Glow */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-300"
              style={{
                background: isPlaying 
                  ? 'radial-gradient(circle at 50% 80%, rgba(245,158,11,0.3) 0%, transparent 80%)' 
                  : 'radial-gradient(circle at 50% 80%, rgba(245,158,11,0.08) 0%, transparent 80%)'
              }}
            />

            {/* Header: "VU" label + dB Scale + PEAK LED */}
            <div className="flex items-center justify-between z-10 px-0.5">
              <div className="flex items-center gap-1">
                <span className="text-[7px] font-black font-mono text-amber-200/90 tracking-tighter">VU</span>
                <span className="text-[5.5px] font-mono text-zinc-400">dB</span>
              </div>

              {/* Red PEAK LED */}
              <div className="flex items-center gap-0.5">
                <span className="text-[5px] font-mono font-bold text-zinc-400">PK</span>
                <div 
                  ref={peakLedRef}
                  className="w-1.5 h-1.5 rounded-full bg-rose-500 transition-all duration-75 border border-rose-300/60"
                  style={{ opacity: 0.15 }}
                />
              </div>
            </div>

            {/* Curved Printed Calibration Arc */}
            <div className="relative w-full h-4 sm:h-5 z-10 overflow-hidden">
              {/* Printed dB ticks (-20, -10, -5, 0, +3) */}
              <div className="absolute top-0 inset-x-0 flex justify-between text-[4.5px] font-mono font-bold px-1 text-zinc-400 select-none">
                <span>-20</span>
                <span>-10</span>
                <span>-5</span>
                <span className="text-amber-300">0</span>
                <span className="text-rose-500 font-black">+3</span>
              </div>

              {/* Calibration Arc line (Safe in white/amber, danger in red) */}
              <svg className="w-full h-full" viewBox="0 0 100 28" fill="none">
                {/* Safe zone arc */}
                <path d="M 12 18 Q 50 6 74 12" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeDasharray="1 1.5" />
                {/* Over-level red zone */}
                <path d="M 74 12 Q 86 16 92 19" stroke="#ef4444" strokeWidth="1.5" />
              </svg>

              {/* Physical Needle Left (CH-L: Amber/Black) */}
              <div 
                ref={needleLRef}
                className="absolute bottom-0 left-1/2 w-[1px] h-[22px] origin-bottom rounded-t pointer-events-none"
                style={{
                  transform: 'rotate(-36deg)',
                  background: 'linear-gradient(to top, #000 0%, #1f2937 40%, #fbbf24 85%, #f59e0b 100%)',
                  boxShadow: '0 0 2px rgba(0,0,0,0.8)'
                }}
              />

              {/* Physical Needle Right (CH-R: Neon/Red) */}
              <div 
                ref={needleRRef}
                className="absolute bottom-0 left-1/2 w-[1px] h-[22px] origin-bottom rounded-t pointer-events-none"
                style={{
                  transform: 'rotate(-36deg)',
                  background: 'linear-gradient(to top, #000 0%, #1f2937 40%, #ef4444 85%, #dc2626 100%)',
                  boxShadow: '0 0 2px rgba(0,0,0,0.8)'
                }}
              />

              {/* Pivot Mechanical Center Cap */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gradient-to-t from-zinc-800 to-zinc-600 border border-zinc-500 shadow-md z-20 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-black" />
              </div>
            </div>

            {/* Channel Labels (L / R) */}
            <div className="flex justify-between items-center text-[5px] font-mono text-zinc-500 px-1 z-10">
              <span className="text-amber-400 font-bold">L</span>
              <span className="text-rose-400 font-bold">R</span>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Tactile Walkman Mechanical Keys + Magnetic Waveform Scrub Track */}
        <div className="flex flex-col gap-1.5 pt-1 border-t border-white/[0.08]">
          
          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-1">
            
            {/* Status Indicator */}
            <div className="flex items-center gap-1.5 pl-0.5">
              <span 
                className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: isPlaying ? neonColor : '#52525b',
                  boxShadow: isPlaying ? `0 0 8px ${neonColor}` : 'none'
                }}
              />
              <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-zinc-400 hidden xs:inline">
                TAPE RUN
              </span>
            </div>

            {/* Walkman Piano-Key Buttons */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Shuffle Toggle */}
              <button 
                onClick={(e) => { e.stopPropagation(); toggleShuffle(); }}
                className={`p-1.5 rounded-lg border transition-all text-zinc-400 hover:text-white cursor-pointer ${
                  isShuffle 
                    ? 'bg-white/10 text-brand-neon border-brand-neon/40 shadow-[0_0_8px_rgba(158,255,0,0.2)]' 
                    : 'bg-black/40 border-white/10 hover:bg-white/5'
                }`}
                title="Embaralhar faixas"
              >
                <Shuffle className="w-3.5 h-3.5" style={{ color: isShuffle ? neonColor : undefined }} />
              </button>

              {/* Rewind / Previous */}
              <button 
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                className="p-1.5 rounded-lg bg-black/40 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer shadow-sm"
                title="Faixa Anterior (Rewind)"
              >
                <SkipBack className="w-3.5 h-3.5 fill-current" />
              </button>

              {/* Main PLAY / PAUSE Walkman Key */}
              <button 
                onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
                className="px-3.5 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 text-black active:scale-95 transition-all cursor-pointer shadow-lg relative group/playkey"
                style={{
                  backgroundColor: neonColor,
                  boxShadow: `0 0 16px ${neonColor}60, inset 0 1px 1px rgba(255,255,255,0.6)`
                }}
                title={isPlaying ? "Pausar Fita" : "Reproduzir Fita"}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span className="text-[8.5px] font-black uppercase tracking-wider hidden sm:inline">PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    <span className="text-[8.5px] font-black uppercase tracking-wider hidden sm:inline">PLAY</span>
                  </>
                )}
              </button>

              {/* Fast-Forward / Next */}
              <button 
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="p-1.5 rounded-lg bg-black/40 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer shadow-sm"
                title="Próxima Faixa (Fast Forward)"
              >
                <SkipForward className="w-3.5 h-3.5 fill-current" />
              </button>

              {/* Repeat Toggle */}
              <button 
                onClick={(e) => { e.stopPropagation(); toggleRepeat(); }}
                className={`p-1.5 rounded-lg border transition-all text-zinc-400 hover:text-white cursor-pointer ${
                  repeatMode !== 'none' 
                    ? 'bg-white/10 text-brand-neon border-brand-neon/40 shadow-[0_0_8px_rgba(158,255,0,0.2)]' 
                    : 'bg-black/40 border-white/10 hover:bg-white/5'
                }`}
                title="Repetir faixa"
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-3.5 h-3.5" style={{ color: neonColor }} />
                ) : (
                  <Repeat className="w-3.5 h-3.5" style={{ color: repeatMode === 'all' ? neonColor : undefined }} />
                )}
              </button>
            </div>

            {/* Corner Screw */}
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/80 border border-white/20 flex items-center justify-center shadow-inner pr-0.5">
              <span className="text-[7px] text-zinc-400 font-black leading-none">+</span>
            </div>
          </div>

          {/* Magnetic Tape Waveform Scrubber Track */}
          <div 
            className="w-full pt-1 px-1 bg-black/40 rounded-lg border border-white/[0.06]"
            onPointerDown={(e) => e.stopPropagation()}
            title="Cabeçote de Leitura Magnética • Arraste para navegar"
          >
            <WaveformTrack 
              songTitle={currentSong?.title}
              progress={progress}
              isPlaying={isPlaying}
              onSeek={onSeek}
              neonColor={neonColor}
              variant="mini"
            />
          </div>
        </div>

      </div>
    </motion.div>
  );
};
