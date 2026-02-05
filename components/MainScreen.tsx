import React, { useState, useRef } from 'react';
import { GameState, WorshipperType, ClickEffect, GemType } from '../types';
import { Crown, Ghost, Frown, ChevronRight, Sword } from 'lucide-react';
import { WorshipperModal } from './WorshipperModal';

interface MainScreenProps {
  gameState: GameState;
  milestoneState: { isMilestone: boolean, definition?: any };
  onTap: (x: number, y: number) => number;
  worshipperImages: Record<WorshipperType, string>;
  bgUrl: string;
}

export const MainScreen: React.FC<MainScreenProps> = ({ gameState, milestoneState, onTap, worshipperImages, bgUrl }) => {
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([]);
  const [selectedWorshipper, setSelectedWorshipper] = useState<WorshipperType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  const handleInteraction = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const power = onTap(x, y);

    const newEffect: ClickEffect = {
      id: Date.now() + Math.random(),
      x,
      y,
      value: power
    };

    setClickEffects(prev => [...prev, newEffect]);
    
    if (orbRef.current) {
        orbRef.current.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.1)' },
            { transform: 'scale(1)' }
        ], {
            duration: 150,
            easing: 'ease-out'
        });
    }

    setTimeout(() => {
      setClickEffects(prev => prev.filter(e => e.id !== newEffect.id));
    }, 1000);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[data-clickable="true"]')) {
       return;
    }
    handleInteraction(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[data-clickable="true"]')) {
       return; 
    }
    e.preventDefault();

    Array.from(e.changedTouches).forEach((touch: React.Touch) => {
        handleInteraction(touch.clientX, touch.clientY);
    });
  };

  const getOrbStyles = (gem: GemType) => {
    switch (gem) {
        case GemType.GREED_STONE:
            return {
                glow: "bg-green-600",
                gradient: "via-green-900",
                shadow: "shadow-[0_0_30px_rgba(22,163,74,0.6)]"
            };
        case GemType.POOR_MANS_TEAR:
            return {
                glow: "bg-gray-500",
                gradient: "via-gray-700",
                shadow: "shadow-[0_0_30px_rgba(107,114,128,0.6)]"
            };
        case GemType.BLOOD_RUBY:
             return {
                glow: "bg-red-700",
                gradient: "via-red-900",
                shadow: "shadow-[0_0_30px_rgba(220,38,38,0.6)]"
            };
        case GemType.SLOTH_SAPPHIRE:
             return {
                glow: "bg-blue-600",
                gradient: "via-blue-900",
                shadow: "shadow-[0_0_30px_rgba(37,99,235,0.6)]"
            };
        case GemType.NONE:
        default:
            return {
                glow: "bg-purple-800",
                gradient: "via-eldritch-purple",
                shadow: "shadow-[0_0_30px_rgba(147,51,234,0.6)]"
            };
    }
  };

  const orbStyles = getOrbStyles(gameState.equippedGem);

  const WorshipperStat = ({ 
    type, 
    count, 
    icon: Icon, 
    colorClass, 
    textColor, 
    iconColor,
    priorityIndex,
    isLast
  }: { 
    type: WorshipperType, 
    count: number, 
    icon: any, 
    colorClass: string, 
    textColor: string, 
    iconColor: string,
    priorityIndex: number,
    isLast: boolean
  }) => {
    let opacityClass = 'opacity-100';
    let scaleClass = 'scale-100';
    let ringClass = '';

    if (milestoneState.isMilestone && milestoneState.definition) {
        if (milestoneState.definition.type === type) {
            opacityClass = 'opacity-100';
            scaleClass = 'scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]';
            ringClass = `ring-2 ${textColor.replace('text-', 'ring-')}`;
        } else {
            opacityClass = 'opacity-30 grayscale';
        }
    }

    return (
    <div className="flex items-center">
        <div 
            onClick={(e) => {
                e.stopPropagation();
                setSelectedWorshipper(type);
            }}
            data-clickable="true"
            className={`group relative flex w-[70px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border ${colorClass} bg-black/60 p-2 backdrop-blur-sm transition-all duration-300 hover:bg-black/80 hover:scale-105 active:scale-95 sm:w-[100px] sm:min-w-[100px] ${opacityClass} ${scaleClass} ${ringClass}`}
        >
            <div className="absolute -left-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-eldritch-grey text-[8px] font-bold text-white border border-gray-600 sm:-left-2 sm:-top-2 sm:h-5 sm:w-5 sm:text-[10px]">
                {priorityIndex}
            </div>
            <Icon className={`h-4 w-4 ${iconColor} sm:h-6 sm:w-6`} />
            <span className={`hidden font-serif text-xs ${textColor} sm:block`}>{type}</span>
            <span className={`block font-serif text-[10px] ${textColor} sm:hidden`}>{type.slice(0, 3)}</span>
            <span className="font-mono text-xs font-bold text-white sm:text-lg">
                {count.toLocaleString()}
            </span>
        </div>
        {!isLast && (
             <div className="mx-1 flex items-center justify-center sm:mx-2">
                 <ChevronRight className="h-4 w-4 text-eldritch-gold/50 sm:h-6 sm:w-6 animate-pulse" />
             </div>
        )}
    </div>
    );
  };

  return (
    <>
    <div 
      ref={containerRef}
      className="relative flex flex-1 w-full shrink-0 select-none flex-col items-center justify-between overflow-hidden bg-black p-4 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] lg:h-full lg:flex-1"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-70 grayscale-[50%] blur-sm"
        style={{ backgroundImage: `url('${bgUrl}')` }}
      />
      <div className="pointer-events-none absolute inset-0 z-0 bg-black/30" />

      <div className="relative z-10 mt-2 flex w-full justify-center">
        <WorshipperStat 
          type={WorshipperType.INDOLENT}
          count={gameState.worshippers[WorshipperType.INDOLENT]} 
          icon={Ghost} 
          colorClass="border-blue-900/30 hover:border-blue-500" 
          textColor="text-blue-200"
          iconColor="text-blue-400"
          priorityIndex={1}
          isLast={false}
        />
        <WorshipperStat 
          type={WorshipperType.LOWLY}
          count={gameState.worshippers[WorshipperType.LOWLY]} 
          icon={Frown} 
          colorClass="border-gray-700/30 hover:border-gray-400" 
          textColor="text-gray-300"
          iconColor="text-gray-400"
          priorityIndex={2}
          isLast={false}
        />
        <WorshipperStat 
          type={WorshipperType.WORLDLY}
          count={gameState.worshippers[WorshipperType.WORLDLY]} 
          icon={Crown} 
          colorClass="border-green-900/30 hover:border-green-500" 
          textColor="text-green-200"
          iconColor="text-green-500"
          priorityIndex={3}
          isLast={false}
        />
        <WorshipperStat 
          type={WorshipperType.ZEALOUS}
          count={gameState.worshippers[WorshipperType.ZEALOUS]} 
          icon={Sword} 
          colorClass="border-red-900/30 hover:border-red-500" 
          textColor="text-red-200"
          iconColor="text-red-500"
          priorityIndex={4}
          isLast={true}
        />
      </div>

      <div className="pointer-events-none relative z-10 flex flex-1 items-center justify-center">
        <div className="relative flex items-center justify-center">
            <div className={`absolute inset-0 animate-pulse-slow rounded-full blur-[60px] ${orbStyles.glow}`} />
            <div 
                ref={orbRef}
                className={`relative flex h-40 w-40 animate-float items-center justify-center rounded-full bg-gradient-to-br from-black ${orbStyles.gradient} to-black ${orbStyles.shadow} ring-1 ring-white/10 sm:h-48 sm:w-48 lg:h-64 lg:w-64`}
            >
                <div className="absolute inset-0 rounded-full opacity-50 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent)]" />
                <div className="z-20 flex flex-col items-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  <span className="font-mono text-2xl font-black text-white sm:text-3xl lg:text-4xl">
                    {gameState.totalWorshippers.toLocaleString()}
                  </span>
                  <span className="font-serif text-[10px] uppercase tracking-widest text-eldritch-gold/80 sm:text-xs">
                    Worshippers
                  </span>
                </div>
            </div>
        </div>
      </div>

      <div className="pointer-events-none relative z-10 text-center opacity-40">
        <p className="font-serif text-xs italic text-white sm:text-sm">Tap empty space to perform Miracles</p>
      </div>

      {clickEffects.map(effect => (
        <div
          key={effect.id}
          className="pointer-events-none absolute z-20 animate-fade-out-up font-serif text-2xl font-bold text-red-500 text-shadow-glow"
          style={{ 
            left: effect.x, 
            top: effect.y,
            textShadow: '0 0 10px rgba(255,0,0,0.8)'
          }}
        >
          +{effect.value}
        </div>
      ))}
    </div>

    <WorshipperModal 
        type={selectedWorshipper} 
        count={selectedWorshipper ? gameState.worshippers[selectedWorshipper] : 0} 
        onClose={() => setSelectedWorshipper(null)} 
        imageUrl={selectedWorshipper ? worshipperImages[selectedWorshipper] : ''}
    />
    </>
  );
};