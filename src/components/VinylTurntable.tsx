import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause } from 'lucide-react';

interface VinylTurntableProps {
  currentSong: {
    title: string;
    image: string;
    duration?: string;
  };
  isPlaying: boolean;
  onTogglePlay?: () => void;
  neonColor?: string;
  theme?: 'green' | 'orange';
}

export const VinylTurntable: React.FC<VinylTurntableProps> = ({
  currentSong,
  isPlaying,
  onTogglePlay,
  neonColor = '#00FF66',
  theme = 'green'
}) => {
  const vinylDiscRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Realistic 33⅓ RPM turntable physics simulation with inertia
  // 33.3333 RPM = 200 degrees per second
  const TARGET_SPEED_DEG_PER_SEC = 200;

  useEffect(() => {
    let active = true;

    const animateTurntable = (now: number) => {
      if (!active) return;

      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1); // clamp delta time to avoid jumps
      lastTimeRef.current = now;

      if (isPlaying) {
        // Motor engages: rapid, smooth torque acceleration to 33⅓ RPM
        velocityRef.current += (TARGET_SPEED_DEG_PER_SEC - velocityRef.current) * 0.08;
      } else {
        // Motor disengages: real platter mass inertia deceleration (friction decay)
        velocityRef.current *= 0.962; // friction deceleration factor
        if (velocityRef.current <= 0.05) {
          velocityRef.current = 0;
        }
      }

      // Accumulate rotation angle
      angleRef.current = (angleRef.current + velocityRef.current * dt) % 360;

      // Apply transform directly to avoid re-rendering React tree at 60/120fps
      if (vinylDiscRef.current) {
        vinylDiscRef.current.style.transform = `rotate(${angleRef.current}deg)`;
      }

      // Continue animation if playing or still decelerating with inertia
      if (isPlaying || velocityRef.current > 0.05) {
        animFrameRef.current = requestAnimationFrame(animateTurntable);
      }
    };

    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(animateTurntable);

    return () => {
      active = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="relative w-full max-w-lg mx-auto flex flex-col items-center justify-center select-none py-1">
      {/* Analog Turntable Stage Container */}
      <div 
        onClick={onTogglePlay}
        className="relative w-full max-w-[440px] sm:max-w-[480px] h-[175px] sm:h-[200px] md:h-[220px] flex items-center justify-center cursor-pointer group/turntable"
        title={isPlaying ? "Clique para pausar o vinil" : "Clique para reproduzir o vinil"}
      >
        {/* Ambient Backlight Glow under turntable stage */}
        <div 
          className="absolute inset-x-8 -inset-y-2 rounded-full blur-[40px] opacity-20 transition-all duration-700 pointer-events-none"
          style={{ 
            backgroundColor: neonColor,
            opacity: isPlaying ? 0.35 : 0.12
          }}
        />

        {/* ========================================================================= */}
        {/* 1. AGED CARDBOARD RECORD SLEEVE (Capa de Vinil de Papelão Envelhecido)     */}
        {/* ========================================================================= */}
        <motion.div 
          animate={{
            x: isPlaying ? -42 : 0,
            rotate: isPlaying ? -1.5 : 0
          }}
          transition={{
            type: "spring",
            stiffness: 90,
            damping: 18,
            mass: 1.1
          }}
          className="relative z-20 w-[140px] h-[140px] sm:w-[170px] sm:h-[170px] md:w-[190px] md:h-[190px] rounded-xl overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.85)] border border-amber-950/30 flex-shrink-0 bg-[#141211]"
          style={{
            boxShadow: `0 14px 34px rgba(0,0,0,0.85), inset 0 0 0 1px rgba(255,255,255,0.08)`
          }}
        >
          {/* Album Cover Artwork */}
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentSong.title}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35 }}
              src={currentSong.image} 
              alt={currentSong.title} 
              className="w-full h-full object-cover filter contrast-[1.05]"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>

          {/* Vintage Cardboard Ringwear Overlay (Marca circular de vinil prensado pelo tempo) */}
          <div 
            className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40 sm:opacity-50"
            style={{
              background: `radial-gradient(circle at 50% 50%, transparent 35%, rgba(255,255,255,0.18) 52%, rgba(255,255,255,0.28) 55%, rgba(0,0,0,0.65) 64%, transparent 72%)`
            }}
          />

          {/* Aged Paper Grain Texture & Corner Scuffs */}
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-950/25 via-transparent to-white/10 pointer-events-none mix-blend-soft-light" />
          <div className="absolute inset-0 border border-white/10 rounded-xl pointer-events-none" />

          {/* Left Spine Crease (Lombada física do vinil) */}
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/80 via-black/30 to-transparent border-r border-white/10 flex items-center justify-center">
            <div className="h-28 w-[1px] bg-white/20" />
          </div>

          {/* Die-Cut Sleeve Notch Opening (Corte semicircular da boca da capa na direita) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-12 bg-black/85 rounded-l-full border-l border-white/15 shadow-[inset_4px_0_8px_rgba(0,0,0,0.9)] flex items-center justify-end pr-0.5">
            <div className="w-1.5 h-6 rounded-l-full bg-white/10" />
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 2. SLIDING & ROTATING VINYL RECORD (Disco Negro com Ranhuras e Reflexo)   */}
        {/* ========================================================================= */}
        <motion.div
          animate={{
            x: isPlaying ? 42 : 8,
            scale: isPlaying ? 1 : 0.96
          }}
          transition={{
            type: "spring",
            stiffness: 85,
            damping: 17,
            mass: 1.2
          }}
          className="absolute z-10 w-[134px] h-[134px] sm:w-[164px] sm:h-[164px] md:w-[184px] md:h-[184px] flex items-center justify-center flex-shrink-0"
        >
          {/* Inner Platter Shadow to create 3D depth */}
          <div className="absolute inset-0 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.95)]" />

          {/* The Spinning Vinyl Platter Element (Rotated by physics loop) */}
          <div
            ref={vinylDiscRef}
            className="relative w-full h-full rounded-full border-[2.5px] border-[#1e1e24] shadow-[0_0_20px_rgba(0,0,0,0.85)] will-change-transform flex items-center justify-center overflow-hidden"
            style={{
              backgroundColor: '#0a0a0c',
              backgroundImage: `
                radial-gradient(circle at 50% 50%, 
                  #0a0a0d 0%, 
                  #0c0c0f 34%, 
                  #16161b 35%, 
                  #0b0b0e 36%, 
                  #18181f 39%, 
                  #09090c 41%, 
                  #1a1a22 45%, 
                  #0a0a0d 48%, 
                  #181820 52%, 
                  #09090b 56%, 
                  #1b1b24 61%, 
                  #0b0b0e 65%, 
                  #1a1a23 69%, 
                  #0a0a0c 74%, 
                  #191921 78%, 
                  #0c0c0f 83%, 
                  #17171f 87%, 
                  #0a0a0c 91%, 
                  #1a1a24 95%, 
                  #070709 98%, 
                  #1f1f2a 100%
                )
              `
            }}
          >
            {/* SVG Precision Concentric Sound Grooves (Microsulcos analógicos nítidos) */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none opacity-45"
              viewBox="0 0 200 200"
            >
              <circle cx="100" cy="100" r="96" fill="none" stroke="#ffffff" strokeWidth="0.35" strokeOpacity="0.18" />
              <circle cx="100" cy="100" r="92" fill="none" stroke="#ffffff" strokeWidth="0.25" strokeOpacity="0.12" />
              <circle cx="100" cy="100" r="88" fill="none" stroke="#000000" strokeWidth="0.6" strokeOpacity="0.7" />
              <circle cx="100" cy="100" r="84" fill="none" stroke="#ffffff" strokeWidth="0.3" strokeOpacity="0.15" />
              <circle cx="100" cy="100" r="80" fill="none" stroke="#ffffff" strokeWidth="0.25" strokeOpacity="0.1" />
              <circle cx="100" cy="100" r="76" fill="none" stroke="#ffffff" strokeWidth="0.3" strokeOpacity="0.16" />
              <circle cx="100" cy="100" r="72" fill="none" stroke="#000000" strokeWidth="0.5" strokeOpacity="0.6" />
              <circle cx="100" cy="100" r="68" fill="none" stroke="#ffffff" strokeWidth="0.25" strokeOpacity="0.14" />
              <circle cx="100" cy="100" r="64" fill="none" stroke="#ffffff" strokeWidth="0.3" strokeOpacity="0.18" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="#ffffff" strokeWidth="0.25" strokeOpacity="0.12" />
              <circle cx="100" cy="100" r="56" fill="none" stroke="#ffffff" strokeWidth="0.35" strokeOpacity="0.2" />
              <circle cx="100" cy="100" r="52" fill="none" stroke="#000000" strokeWidth="0.7" strokeOpacity="0.8" />
              <circle cx="100" cy="100" r="48" fill="none" stroke="#ffffff" strokeWidth="0.3" strokeOpacity="0.16" />
              <circle cx="100" cy="100" r="44" fill="none" stroke="#ffffff" strokeWidth="0.25" strokeOpacity="0.12" />
              <circle cx="100" cy="100" r="40" fill="none" stroke="#ffffff" strokeWidth="0.35" strokeOpacity="0.22" />
            </svg>

            {/* Realistic Conic Optical Light Sheen (Reflexo de luz angular em gravata-borboleta) */}
            <div 
              className="absolute inset-0 rounded-full pointer-events-none opacity-60 mix-blend-screen"
              style={{
                background: `
                  conic-gradient(
                    from 35deg at 50% 50%,
                    transparent 0deg,
                    rgba(255, 255, 255, 0.15) 30deg,
                    rgba(255, 255, 255, 0.28) 45deg,
                    rgba(255, 255, 255, 0.12) 60deg,
                    transparent 90deg,
                    transparent 180deg,
                    rgba(255, 255, 255, 0.15) 210deg,
                    rgba(255, 255, 255, 0.28) 225deg,
                    rgba(255, 255, 255, 0.12) 240deg,
                    transparent 270deg,
                    transparent 360deg
                  )
                `
              }}
            />

            {/* Run-Out Groove Zone & Dead Wax Matrix */}
            <div className="absolute inset-[32%] rounded-full border border-white/10 pointer-events-none" />

            {/* ============================================================== */}
            {/* Center Label (Arte do Álbum no Selo Central do Vinil)           */}
            {/* ============================================================== */}
            <div 
              className="relative w-[40%] h-[40%] rounded-full flex items-center justify-center shadow-[0_3px_12px_rgba(0,0,0,0.9),inset_0_0_0_1.5px_rgba(255,255,255,0.2)] overflow-hidden"
              style={{
                backgroundColor: '#121216',
                border: `2px solid ${neonColor}90`,
                boxShadow: `0 0 14px ${neonColor}30, inset 0 0 8px rgba(0,0,0,0.7)`
              }}
            >
              {/* Full Color Album Art in Vinyl Center */}
              <img 
                src={currentSong.image} 
                alt={currentSong.title}
                className="absolute inset-0 w-full h-full object-cover filter contrast-[1.08] saturate-[1.12]"
                referrerPolicy="no-referrer"
              />

              {/* Fine Circular Vinyl Label Border & Texture Sheen */}
              <div className="absolute inset-0 rounded-full border border-black/40 pointer-events-none" />
              <div 
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 45% 40%, rgba(255,255,255,0.22) 0%, transparent 60%, rgba(0,0,0,0.4) 100%)`
                }}
              />

              {/* Spindle Center Hole (Furo do pino do toca-discos com anel de metal usinado) */}
              <div className="relative z-20 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-zinc-200 via-zinc-600 to-black p-[1px] shadow-[0_2px_6px_rgba(0,0,0,0.9)] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-950 border border-white/30 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-black shadow-inner" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 3. TURNTABLE TONEARM & STYLUS NEEDLE (Braço Fonocaptor e Agulha Realista)  */}
        {/* ========================================================================= */}
        <div className="absolute right-3 sm:right-6 md:right-8 top-1.5 sm:top-2 w-[76px] sm:w-[88px] md:w-[98px] h-[135px] sm:h-[155px] md:h-[170px] pointer-events-none z-30 flex items-start justify-end">
          {/* Tonearm Sub-Assembly Stage */}
          <div className="relative w-full h-full">
            {/* Stationary Gimbal Base & Knurled Pivot Mount in Turntable Chassis */}
            <div className="absolute top-1 right-2 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-zinc-700 via-zinc-900 to-black border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.85)] flex items-center justify-center z-10">
              <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr from-zinc-800 via-zinc-600 to-zinc-900 border border-zinc-500/40 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-zinc-300 shadow-inner" />
              </div>
              {/* Anti-skating dial */}
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-zinc-800 border border-white/30" />
            </div>

            {/* Rear Counterweight (Contrapeso cilíndrico traseiro graduado) */}
            <div className="absolute -top-1.5 right-3.5 sm:right-5 w-4 h-3 rounded bg-gradient-to-r from-zinc-600 via-zinc-400 to-zinc-800 border border-zinc-950 shadow-sm z-10">
              <div className="w-full h-[1px] bg-white/30 my-0.5" />
            </div>

            {/* Armrest / Cueing Support Cradle (Suporte de descanso da agulha quando pausado) */}
            <div className="absolute top-[52px] sm:top-[60px] right-5 sm:right-7 w-2.5 h-3 flex flex-col items-center justify-end z-10 opacity-75">
              <div className="w-2.5 h-1 rounded-sm bg-zinc-700 border border-white/20" />
              <div className="w-[1.5px] h-2 bg-zinc-600" />
            </div>

            {/* Articulated Tonearm Wand (Braço mecânico com rotação física precisa) */}
            <motion.div
              initial={false}
              animate={{
                rotate: isPlaying ? 22 : 0,
                y: isPlaying ? 3 : -2,
                scale: isPlaying ? 1 : 0.98
              }}
              transition={{
                type: "spring",
                stiffness: 75,
                damping: 15,
                mass: 0.85
              }}
              style={{
                transformOrigin: "calc(100% - 15px) 15px" // Pivots precisely around center of gimbal base
              }}
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              <svg 
                className="w-full h-full overflow-visible filter drop-shadow-[0_8px_10px_rgba(0,0,0,0.7)]"
                viewBox="0 0 85 140"
              >
                {/* S-Shaped Curved Aluminum Tonearm Tube */}
                <path
                  d="M 70 15 L 68 45 Q 65 72 56 94 L 46 112"
                  fill="none"
                  stroke="#d4d4d8"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M 70 15 L 68 45 Q 65 72 56 94 L 46 112"
                  fill="none"
                  stroke="#52525b"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />

                {/* Headshell / Cartridge Housing (Cápsula fonocaptora angular) */}
                <g transform="translate(46, 112) rotate(24)">
                  {/* Cartridge Body */}
                  <rect 
                    x="-4" 
                    y="0" 
                    width="11" 
                    height="17" 
                    rx="2" 
                    fill="#18181b" 
                    stroke="#52525b" 
                    strokeWidth="1" 
                  />
                  {/* Neon Accent Stripe on Cartridge */}
                  <rect 
                    x="-2" 
                    y="3" 
                    width="7" 
                    height="2" 
                    fill={neonColor} 
                    opacity={isPlaying ? 1 : 0.4} 
                  />
                  {/* Stylus Cantilever & Diamond Tip */}
                  <path 
                    d="M 1.5 17 L 0.5 22" 
                    stroke="#f4f4f5" 
                    strokeWidth="1.2" 
                    strokeLinecap="round" 
                  />
                  <circle 
                    cx="0.5" 
                    cy="22" 
                    r="1.2" 
                    fill={isPlaying ? neonColor : "#ffffff"} 
                  />

                  {/* Locked Stylus Contact Glow (Reflexo e micro-luz da agulha tocando as ranhuras) */}
                  {isPlaying && (
                    <g>
                      <circle 
                        cx="0.5" 
                        cy="22" 
                        r="3.5" 
                        fill={neonColor} 
                        opacity="0.6" 
                        className="animate-pulse"
                      />
                      <circle 
                        cx="0.5" 
                        cy="22" 
                        r="7" 
                        fill={neonColor} 
                        opacity="0.25" 
                        className="animate-ping"
                      />
                    </g>
                  )}
                </g>
              </svg>
            </motion.div>
          </div>
        </div>

        {/* Play/Pause Hover Badge Overlay on Turntable */}
        <div className="absolute bottom-1 right-2 sm:right-4 z-35 opacity-0 group-hover/turntable:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-md border border-white/15 text-[8.5px] font-black uppercase tracking-wider text-white shadow-lg">
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3" style={{ color: neonColor }} />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" style={{ color: neonColor }} />
                <span>Reproduzir</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
