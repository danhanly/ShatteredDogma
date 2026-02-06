
import React, { useState, useRef } from 'react';
import { GameState, WorshipperType, ClickEffect, GemType, WORSHIPPER_ORDER } from '../types';
import { GEM_DEFINITIONS } from '../constants';
import { Crown, Ghost, Frown, Sword, Lock } from 'lucide-react';
import { WorshipperModal } from './WorshipperModal';
import { formatNumber } from '../utils/format';
import { WorshipperStat } from './WorshipperStat';
import { ZipParticleElement, ZipParticle } from './ZipParticleElement';

interface MainScreenProps {
  gameState: GameState;
  milestoneState: { isMilestone: boolean, definition?: any };
  onTap: (x: number, y: number) => { power: number, type: WorshipperType };
  worshipperImages: Record<WorshipperType, string>;
  bgUrl: string;
  toggleWorshipperLock: (type: WorshipperType) => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({ gameState, milestoneState, onTap, worshipperImages, bgUrl, toggleWorshipperLock }) => {
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([]);
  const [zipParticles, setZipParticles] = useState<ZipParticle[]>([]);
  const [glowingStats, setGlowingStats] = useState<Record<string, boolean>>({});
  const [selectedWorshipper, setSelectedWorshipper] = useState<WorshipperType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  
  // Refs for each worshipper box to track their screen position
  const statBoxRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleInteraction = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const result = onTap(x, y);
    const power = result.power;
    const type = result.type;

    // Create the "+Value" text effect
    const newEffect: ClickEffect = { id: Date.now() + Math.random(), x, y, value: power };
    setClickEffects(prev => [...prev, newEffect]);
    
    // Create the Zip Particle effect
    const targetBox = statBoxRefs.current[type];
    if (targetBox) {
        const boxRect = targetBox.getBoundingClientRect();
        const endX = boxRect.left + boxRect.width / 2 - rect.left;
        const endY = boxRect.top + boxRect.height / 2 - rect.top;
        
        let particleColor = 'bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.9)]';
        if (type === WorshipperType.WORLDLY) particleColor = 'bg-green-500 shadow-[0_0_15px_rgba(74,222,128,0.9)]';
        else if (type === WorshipperType.LOWLY) particleColor = 'bg-gray-400 shadow-[0_0_15px_rgba(156,163,175,0.9)]';
        else if (type === WorshipperType.ZEALOUS) particleColor = 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.9)]';

        setGlowingStats(prev => ({ ...prev, [type]: true }));
        setTimeout(() => {
            setGlowingStats(prev => ({ ...prev, [type]: false }));
        }, 200); // Glow duration

        const newParticle: ZipParticle = {
            id: Date.now() + Math.random(),
            startX: x,
            startY: y,
            endX,
            endY,
            color: particleColor
        };
        setZipParticles(prev => [...prev, newParticle]);


        // Remove particle after full animation (1s transition + small buffer)
        setTimeout(() => {
            setZipParticles(prev => prev.filter(p => p.id !== newParticle.id));
        }, 800);
    }

    if (orbRef.current) {
        orbRef.current.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }], { duration: 150, easing: 'ease-out' });
    }
    
    setTimeout(() => { setClickEffects(prev => prev.filter(e => e.id !== newEffect.id)); }, 1000);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[data-clickable="true"]')) return;
    handleInteraction(e.clientX, e.clientY);
  };

  const getOrbStyles = (gem: GemType) => {
    switch (gem) {
        case GemType.GREED_STONE: return { glow: "bg-green-600", gradient: "via-green-900", shadow: "shadow-[0_0_30px_rgba(22,163,74,0.6)]" };
        case GemType.POOR_MANS_TEAR: return { glow: "bg-gray-500", gradient: "via-gray-700", shadow: "shadow-[0_0_30px_rgba(107,114,128,0.6)]" };
        case GemType.BLOOD_RUBY: return { glow: "bg-red-700", gradient: "via-red-900", shadow: "shadow-[0_0_30px_rgba(220,38,38,0.6)]" };
        case GemType.SLOTH_SAPPHIRE: return { glow: "bg-blue-600", gradient: "via-blue-900", shadow: "shadow-[0_0_30px_rgba(37,99,235,0.6)]" };
        default: return { glow: "bg-purple-800", gradient: "via-eldritch-purple", shadow: "shadow-[0_0_30px_rgba(147,51,234,0.6)]" };
    }
  };

  const orbStyles = getOrbStyles(gameState.equippedGem);

  // Dynamic Orb Display Logic
  let displayValue = gameState.totalWorshippers;
  let displayLabel = "Worshippers";
  let isAdjusted = false;

  const hasLocks = gameState.lockedWorshippers.length > 0;
  const availableTotal = WORSHIPPER_ORDER
     .filter(t => !gameState.lockedWorshippers.includes(t))
     .reduce((sum, t) => sum + gameState.worshippers[t], 0);

  if (milestoneState.isMilestone && milestoneState.definition) {
    const type = milestoneState.definition.type as WorshipperType;
    displayValue = gameState.worshippers[type];
    displayLabel = `${type}`;
  } else if (gameState.equippedGem !== GemType.NONE) {
    const favoredType = GEM_DEFINITIONS[gameState.equippedGem].favoredType;
    if (favoredType) {
        displayValue = gameState.worshippers[favoredType];
        displayLabel = `${favoredType}`;
    }
  } else if (hasLocks) {
      displayValue = availableTotal;
      displayLabel = "Adjusted Total";
      isAdjusted = true;
  }

  const commonStatProps = {
      gameState,
      milestoneState,
      glowingStats,
      onSelect: setSelectedWorshipper,
      setStatBoxRef: (type: string, el: HTMLDivElement | null) => { statBoxRefs.current[type] = el; }
  };

  return (
    <>
    <div 
      ref={containerRef} 
      className="relative flex flex-1 w-full shrink-0 select-none flex-col items-center justify-between overflow-hidden bg-black p-4 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] lg:h-full lg:flex-1 touch-none" 
      onPointerDown={handlePointerDown}
    >
      <div className="absolute inset-0 z-0 bg-cover bg-center opacity-70 grayscale-[50%] blur-sm" style={{ backgroundImage: `url('${bgUrl}')` }} />
      <div className="pointer-events-none absolute inset-0 z-0 bg-black/30" />
      <div className="relative z-10 mt-2 flex w-full justify-center">
        <WorshipperStat type={WorshipperType.INDOLENT} count={gameState.worshippers[WorshipperType.INDOLENT]} icon={Ghost} colorClass="border-blue-900/30 hover:border-blue-500" textColor="text-blue-200" iconColor="text-blue-400" priorityIndex={1} isLast={false} {...commonStatProps} />
        <WorshipperStat type={WorshipperType.LOWLY} count={gameState.worshippers[WorshipperType.LOWLY]} icon={Frown} colorClass="border-gray-700/30 hover:border-gray-400" textColor="text-gray-300" iconColor="text-gray-400" priorityIndex={2} isLast={false} {...commonStatProps} />
        <WorshipperStat type={WorshipperType.WORLDLY} count={gameState.worshippers[WorshipperType.WORLDLY]} icon={Crown} colorClass="border-green-900/30 hover:border-green-500" textColor="text-green-200" iconColor="text-green-500" priorityIndex={3} isLast={false} {...commonStatProps} />
        <WorshipperStat type={WorshipperType.ZEALOUS} count={gameState.worshippers[WorshipperType.ZEALOUS]} icon={Sword} colorClass="border-red-900/30 hover:border-red-500" textColor="text-red-200" iconColor="text-red-500" priorityIndex={4} isLast={true} {...commonStatProps} />
      </div>
      <div className="pointer-events-none relative z-10 flex flex-1 items-center justify-center">
        <div className="relative flex items-center justify-center">
            <div className={`absolute inset-0 animate-pulse-slow rounded-full blur-[60px] ${orbStyles.glow}`} />
            <div ref={orbRef} className={`relative flex h-40 w-40 animate-float items-center justify-center rounded-full bg-gradient-to-br from-black ${orbStyles.gradient} to-black ${orbStyles.shadow} ring-1 ring-white/10 sm:h-48 sm:w-48 lg:h-64 lg:w-64`}>
                <div className="absolute inset-0 rounded-full opacity-50 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent)]" />
                <div className="z-20 flex flex-col items-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  <span className="font-mono text-2xl font-black text-white sm:text-3xl lg:text-4xl">{formatNumber(displayValue)}</span>
                  <div className="flex items-center gap-1">
                      {isAdjusted && <Lock className="h-3 w-3 text-eldritch-crimson" />}
                      <span className="font-serif text-[10px] uppercase tracking-widest text-eldritch-gold/80 sm:text-xs">{displayLabel}</span>
                  </div>
                </div>
            </div>
        </div>
      </div>
      <div className="pointer-events-none relative z-10 text-center opacity-40"><p className="font-serif text-xs italic text-white sm:text-sm">Tap empty space to perform Miracles</p></div>
      
      {/* Click Value Effects */}
      {clickEffects.map(effect => (
        <div key={effect.id} className="pointer-events-none absolute z-20 animate-fade-out-up font-serif text-2xl font-bold text-red-500 text-shadow-glow" style={{ left: effect.x, top: effect.y, textShadow: '0 0 10px rgba(255,0,0,0.8)' }}>
          +{formatNumber(effect.value)}
        </div>
      ))}

      {/* Zip Particles */}
      {zipParticles.map(particle => (
          <ZipParticleElement key={particle.id} particle={particle} />
      ))}
    </div>
    <WorshipperModal 
        type={selectedWorshipper} 
        count={selectedWorshipper ? gameState.worshippers[selectedWorshipper] : 0} 
        onClose={() => setSelectedWorshipper(null)} 
        imageUrl={selectedWorshipper ? worshipperImages[selectedWorshipper] : ''}
        gameState={gameState}
        toggleWorshipperLock={toggleWorshipperLock}
    />
    </>
  );
};
