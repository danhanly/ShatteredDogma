import React, { useState, useRef, useEffect } from 'react';
import { GameState, WorshipperType, ClickEffect, WORSHIPPER_ORDER, GemType } from '../types';
import { Crown, Ghost, Frown, Sword } from 'lucide-react';
import { WorshipperModal } from './WorshipperModal';
import { formatNumber } from '../utils/format';
import { WorshipperStat } from './WorshipperStat';
import { ZipParticleElement, ZipParticle } from './ZipParticleElement';
import { GEM_DEFINITIONS } from '../constants';

interface MainScreenProps {
  gameState: GameState;
  onTap: (x: number, y: number) => { power: number, type: WorshipperType };
  autoClickTrigger?: { power: number, type: WorshipperType, timestamp: number } | null;
  worshipperImages: Record<WorshipperType, string>;
  bgUrl: string;
  onToggleAllVessels: (caste: WorshipperType, imprison: boolean) => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({ gameState, onTap, autoClickTrigger, worshipperImages, bgUrl, onToggleAllVessels }) => {
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([]);
  const [zipParticles, setZipParticles] = useState<ZipParticle[]>([]);
  const [glowingStats, setGlowingStats] = useState<Record<string, boolean>>({});
  const [selectedWorshipper, setSelectedWorshipper] = useState<WorshipperType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const statBoxRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const getTypeColorClass = (type: WorshipperType) => {
    switch(type) {
      case WorshipperType.INDOLENT: return 'text-blue-400';
      case WorshipperType.LOWLY: return 'text-gray-400';
      case WorshipperType.WORLDLY: return 'text-green-500';
      case WorshipperType.ZEALOUS: return 'text-red-500';
      default: return 'text-eldritch-gold';
    }
  };

  const triggerVisuals = (x: number, y: number, power: number, type: WorshipperType) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    const effectId = performance.now() + Math.random();
    setClickEffects(prev => [...prev, { id: effectId, x, y, value: power, type }]);
    setTimeout(() => {
      setClickEffects(prev => prev.filter(e => e.id !== effectId));
    }, 1000);
    
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
        setTimeout(() => setGlowingStats(prev => ({ ...prev, [type]: false })), 200);

        const newParticle: ZipParticle = { id: effectId, startX: x, startY: y, endX, endY, color: particleColor };
        setZipParticles(prev => [...prev, newParticle]);
        setTimeout(() => setZipParticles(prev => prev.filter(p => p.id !== newParticle.id)), 800);
    }

    if (orbRef.current) {
        orbRef.current.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }], { duration: 150, easing: 'ease-out' });
    }
  };

  const handleInteraction = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const { power, type } = onTap(x, y);
    triggerVisuals(x, y, power, type);
  };

  useEffect(() => {
    if (autoClickTrigger && containerRef.current && orbRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const orbRect = orbRef.current.getBoundingClientRect();
        
        // Find exact center of orb relative to container
        const centerX = (orbRect.left - rect.left) + orbRect.width / 2;
        const centerY = (orbRect.top - rect.top) + orbRect.height / 2;
        
        // Add slight jitter for more organic feel
        const offsetX = (Math.random() - 0.5) * 60;
        const offsetY = (Math.random() - 0.5) * 60;
        
        triggerVisuals(centerX + offsetX, centerY + offsetY, autoClickTrigger.power, autoClickTrigger.type);
    }
  }, [autoClickTrigger]);

  const commonStatProps = {
      gameState,
      glowingStats,
      onSelect: setSelectedWorshipper,
      setStatBoxRef: (type: string, el: HTMLDivElement | null) => { statBoxRefs.current[type] = el; }
  };

  const activeGemDef = gameState.activeGem ? GEM_DEFINITIONS[gameState.activeGem] : null;
  
  // Frenzy Orb Visual: Gold
  const frenzyActive = gameState.frenzyTimeRemaining > 0;
  const orbColor = frenzyActive ? '#c5a059' : (activeGemDef ? activeGemDef.color : '#9333ea'); 
  const orbLabel = frenzyActive ? 'FRENZY' : (activeGemDef ? activeGemDef.type : 'Worshippers');
  const orbValue = activeGemDef ? gameState.worshippers[activeGemDef.type] : gameState.totalWorshippers;

  return (
    <>
    <div ref={containerRef} className="relative flex flex-1 w-full shrink-0 select-none flex-col items-center justify-between overflow-hidden bg-black p-4 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] lg:h-full lg:flex-1 touch-none" onPointerDown={(e) => {
      if (!(e.target as HTMLElement).closest('button') && !(e.target as HTMLElement).closest('[data-clickable="true"]')) handleInteraction(e.clientX, e.clientY);
    }}>
      <div className="absolute inset-0 z-0 bg-cover bg-center opacity-70 grayscale-[50%] blur-sm" style={{ backgroundImage: `url('${bgUrl}')` }} />
      <div className="relative z-10 mt-2 flex w-full justify-center">
        <WorshipperStat type={WorshipperType.INDOLENT} count={gameState.worshippers[WorshipperType.INDOLENT]} icon={Ghost} colorClass="border-blue-900/30 hover:border-blue-500" textColor="text-blue-200" iconColor="text-blue-400" priorityIndex={1} isLast={false} {...commonStatProps} />
        <WorshipperStat type={WorshipperType.LOWLY} count={gameState.worshippers[WorshipperType.LOWLY]} icon={Frown} colorClass="border-gray-700/30 hover:border-gray-400" textColor="text-gray-300" iconColor="text-gray-400" priorityIndex={2} isLast={false} {...commonStatProps} />
        <WorshipperStat type={WorshipperType.WORLDLY} count={gameState.worshippers[WorshipperType.WORLDLY]} icon={Crown} colorClass="border-green-900/30 hover:border-green-500" textColor="text-green-200" iconColor="text-green-500" priorityIndex={3} isLast={false} {...commonStatProps} />
        <WorshipperStat type={WorshipperType.ZEALOUS} count={gameState.worshippers[WorshipperType.ZEALOUS]} icon={Sword} colorClass="border-red-900/30 hover:border-red-500" textColor="text-red-200" iconColor="text-red-500" priorityIndex={4} isLast={true} {...commonStatProps} />
      </div>
      <div className="pointer-events-none relative z-10 flex flex-1 items-center justify-center">
        <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 animate-pulse-slow rounded-full blur-[60px]" style={{ backgroundColor: `${orbColor}44` }} />
            <div ref={orbRef} className="relative flex h-40 w-40 animate-float items-center justify-center rounded-full bg-gradient-to-br from-black to-transparent shadow-2xl sm:h-48 sm:w-48 lg:h-64 lg:w-64" style={{ boxShadow: `0 0 30px ${orbColor}66`, border: `2px solid ${orbColor}33`, background: `radial-gradient(circle at center, ${orbColor}22 0%, #000 100%)` }}>
                <div className="z-20 flex flex-col items-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  <span className="font-mono text-2xl font-black text-white sm:text-3xl lg:text-4xl">{formatNumber(orbValue)}</span>
                  <span className="font-serif text-[10px] uppercase tracking-widest text-eldritch-gold/80 sm:text-xs">{orbLabel}</span>
                </div>
            </div>
        </div>
      </div>
      <div className="pointer-events-none relative z-10 text-center opacity-40"><p className="font-serif text-xs italic text-white sm:text-sm">Tap empty space to perform Miracles</p></div>
      {clickEffects.map((effect) => (
        <div key={effect.id} className={`pointer-events-none absolute z-20 animate-fade-out-up font-serif text-2xl font-bold ${getTypeColorClass(effect.type)}`} style={{ left: effect.x, top: effect.y, textShadow: '0 0 10px rgba(0,0,0,0.8)' }}>
          +{formatNumber(effect.value)}
        </div>
      ))}
      {zipParticles.map(particle => <ZipParticleElement key={particle.id} particle={particle} />)}
    </div>
    <WorshipperModal 
      type={selectedWorshipper} 
      count={selectedWorshipper ? gameState.worshippers[selectedWorshipper] : 0} 
      onClose={() => setSelectedWorshipper(null)} 
      imageUrl={selectedWorshipper ? worshipperImages[selectedWorshipper] : ''} 
      gameState={gameState}
      onToggleVessels={onToggleAllVessels}
    />
    </>
  );
};