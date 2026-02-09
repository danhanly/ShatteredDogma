
import React from 'react';
import { GameState, WorshipperType } from '../types';
import { ChevronRight, Lock, TrendingUp, TrendingDown, AlertCircle, AlertTriangle } from 'lucide-react';
import { formatNumber } from '../utils/format';
import { calculateNetIncomeByType, calculateConsumptionByType } from '../services/gameService';

interface WorshipperStatProps {
  type: WorshipperType;
  count: number;
  icon: any;
  colorClass: string;
  textColor: string;
  iconColor: string;
  priorityIndex: number;
  isLast: boolean;
  gameState: GameState; 
  glowingStats: Record<string, boolean>;
  onSelect: (type: WorshipperType) => void;
  setStatBoxRef: (type: string, el: HTMLDivElement | null) => void;
}

export const WorshipperStat: React.FC<WorshipperStatProps> = ({ 
    type, 
    count, 
    icon: Icon, 
    colorClass, 
    textColor, 
    iconColor, 
    priorityIndex, 
    isLast,
    gameState,
    glowingStats,
    onSelect,
    setStatBoxRef
}) => {
    const isGlowing = glowingStats[type];
    const isLocked = gameState.lockedWorshippers.includes(type);
    
    const hasAnyVessel = Object.values(gameState.vesselLevels).some(lvl => (lvl as number) > 0);
    
    const consumption = calculateConsumptionByType(gameState)[type];
    const isStarved = count <= 0 && consumption > 0;
    
    const netIncome = calculateNetIncomeByType(gameState)[type];
    const isNetNegative = netIncome < 0;

    const isPaused = gameState.isPaused[type] && hasAnyVessel;

    // Rebellion Logic
    const isRebelling = gameState.rebellionTimeRemaining > 0 && gameState.rebelCaste === type;

    // Influence Visuals
    const lastInfluence = gameState.lastInfluenceTime[type] || 0;
    const timeSinceInfluence = Date.now() - lastInfluence;
    const isInfluenceGlowing = timeSinceInfluence < 120000; // 2 minutes
    const isInfluenceShaking = timeSinceInfluence < 400; // 400ms

    let opacityClass = isPaused ? 'opacity-40 grayscale filter' : 'opacity-100';
    let scaleClass = isGlowing ? 'scale-110' : 'scale-100';
    let borderClass = colorClass;
    let bgClass = 'bg-black/60';
    let glowShadow = '';
    
    // REBELLION Priority
    if (isRebelling) {
        glowShadow = 'shadow-[0_0_25px_rgba(197,160,89,1)] border-eldritch-gold animate-shake';
        borderClass = 'border-eldritch-gold';
        bgClass = 'bg-eldritch-gold/40';
    }
    // Priority 1: Starvation Glow (Red)
    else if (isStarved) {
        glowShadow = 'shadow-[0_0_20px_rgba(239,68,68,0.8)] border-red-500 animate-pulse';
        borderClass = 'border-red-500';
        bgClass = 'bg-red-950/80';
    } 
    // Priority 2: Net Negative Warning (Dark Red Background + Glow)
    else if (isNetNegative) {
        glowShadow = 'shadow-[0_0_15px_rgba(220,38,38,0.5)] border-red-700';
        borderClass = 'border-red-600';
        bgClass = 'bg-red-950/60';
    }
    // Priority 3: Interaction Glow (Type specific)
    else if (isGlowing) {
        switch(type) {
            case WorshipperType.INDOLENT: glowShadow = 'shadow-[0_0_30px_rgba(96,165,250,0.8)] border-blue-400'; break;
            case WorshipperType.LOWLY: glowShadow = 'shadow-[0_0_30px_rgba(156,163,175,0.8)] border-gray-300'; break;
            case WorshipperType.WORLDLY: glowShadow = 'shadow-[0_0_30px_rgba(74,222,128,0.8)] border-green-400'; break;
            case WorshipperType.ZEALOUS: glowShadow = 'shadow-[0_0_30px_rgba(239,68,68,0.8)] border-red-400'; break;
        }
    } 
    // Priority 4: Passive Influence Glow (Purple)
    else if (isInfluenceGlowing) {
        glowShadow = 'shadow-[0_0_20px_rgba(147,51,234,0.6)] border-purple-500';
    }

    return (
    <div className="flex items-center">
        <div 
            ref={(el) => setStatBoxRef(type, el)}
            onPointerDown={(e) => { e.stopPropagation(); }}
            onClick={(e) => { e.stopPropagation(); onSelect(type); }}
            data-clickable="true"
            className={`group relative flex w-[75px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border ${borderClass} ${bgClass} p-2 backdrop-blur-sm transition-all duration-300 hover:bg-black/80 hover:scale-105 active:scale-95 sm:w-[100px] sm:min-w-[100px] ${opacityClass} ${scaleClass} ${glowShadow} ${isInfluenceShaking ? 'animate-shake' : ''}`}
        >
            <div className="absolute -left-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-eldritch-grey text-[8px] font-bold text-white border border-gray-600 sm:-left-2 sm:-top-2 sm:h-5 sm:w-5 sm:text-[10px]">{priorityIndex}</div>
            
            {isLocked && <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-eldritch-crimson text-white sm:-right-2 sm:-top-2 sm:h-5 sm:w-5"><Lock className="h-3 w-3" /></div>}
            
            {/* Status Indicators */}
            <div className="absolute bottom-1 right-1 flex flex-col gap-0.5">
               {isRebelling ? (
                   <AlertCircle className="h-3 w-3 text-eldritch-gold animate-pulse" />
               ) : isStarved ? (
                   <AlertTriangle className="h-3 w-3 text-red-500 animate-bounce" />
               ) : isPaused ? (
                   <AlertCircle className="h-3 w-3 text-red-500 animate-pulse" />
               ) : (
                   isNetNegative ? <TrendingDown className="h-3 w-3 text-red-400 animate-pulse" /> : (netIncome > 0 ? <TrendingUp className="h-3 w-3 text-green-400" /> : null)
               )}
            </div>

            <Icon className={`h-4 w-4 ${isRebelling ? 'text-eldritch-gold' : (isStarved || isNetNegative ? 'text-red-400' : iconColor)} sm:h-6 w-6 transition-colors`} />
            <span className={`hidden font-serif text-xs ${isRebelling ? 'text-white' : (isStarved || isNetNegative ? 'text-red-300' : textColor)} sm:block transition-colors`}>{type}</span>
            <span className={`block font-serif text-[10px] ${isRebelling ? 'text-white' : (isStarved || isNetNegative ? 'text-red-300' : textColor)} sm:hidden transition-colors`}>{type.slice(0, 3)}</span>
            <span className={`font-mono text-xs font-bold sm:text-lg ${isRebelling ? 'text-white' : (isStarved || isNetNegative ? 'text-red-500' : 'text-white')} transition-colors`}>{formatNumber(count)}</span>
        </div>
        {!isLast && <div className="mx-1 flex items-center justify-center sm:mx-2"><ChevronRight className="h-4 w-4 text-eldritch-gold/50 sm:h-6 w-6 animate-pulse" /></div>}
    </div>
    );
};
