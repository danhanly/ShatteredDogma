
import React from 'react';
import { GameState, VesselDefinition, WorshipperType, VesselId } from '../types';
import { User, Crown, Frown, Ghost, Sword, Lock, Unlock, Activity, Utensils, Zap } from 'lucide-react';
import { calculateVesselOutput, calculateSingleVesselConsumption, calculateVesselPotentialEfficiency, calculateMilestoneMultiplier } from '../services/gameService';
import { formatNumber } from '../utils/format';
import { BaseModal } from './BaseModal';

interface VesselModalProps {
  vessel: VesselDefinition | null;
  level: number;
  isImprisoned: boolean;
  onToggle: () => void;
  onClose: () => void;
  imageUrl?: string;
  gameState: GameState;
}

const ICON_MAP = {
  [WorshipperType.WORLDLY]: Crown,
  [WorshipperType.LOWLY]: Frown,
  [WorshipperType.ZEALOUS]: Sword,
  [WorshipperType.INDOLENT]: Ghost,
};

const ROMAN_NUMERALS: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV'
};

export const VesselModal: React.FC<VesselModalProps> = ({ vessel, level, isImprisoned, onToggle, onClose, imageUrl, gameState }) => {
  if (!vessel) return null;
  
  const potentialOutput = calculateVesselOutput(vessel.id, level, gameState);
  const efficiency = calculateVesselPotentialEfficiency(gameState, vessel.id as VesselId);
  const currentOutput = Math.floor(potentialOutput * efficiency);
  const consumption = calculateSingleVesselConsumption(gameState, vessel.id as VesselId, level);
  const multiplier = calculateMilestoneMultiplier(level);

  const TypeIcon = ICON_MAP[vessel.type];
  const typeColor = vessel.type === WorshipperType.WORLDLY ? 'text-green-400 border-green-900 bg-green-950' : vessel.type === WorshipperType.ZEALOUS ? 'text-red-500 border-red-900 bg-red-950' : vessel.type === WorshipperType.INDOLENT ? 'text-blue-400 border-blue-900 bg-blue-950' : 'text-gray-400 border-gray-700 bg-gray-900';

  const canImprison = !vessel.isGenerator;

  return (
    <BaseModal onClose={onClose} showCloseButton={true} zIndex={60} containerClassName={`max-w-md w-full ${typeColor.split(' ')[1]}`}>
      <div className="relative h-64 w-full overflow-hidden bg-black flex items-center justify-center">
          {imageUrl ? <div className="absolute inset-0 bg-no-repeat" style={{ backgroundImage: `url('${imageUrl}')`, backgroundSize: 'cover', backgroundPosition: 'top center' }} /> : <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black to-eldritch-dark"><User className={`h-32 w-32 opacity-20 ${typeColor.split(' ')[0]}`} /></div>}
          <div className="absolute inset-0 bg-gradient-to-t from-eldritch-dark via-eldritch-dark/20 to-transparent" />
          
          {/* Tier Indicator */}
          <div className="absolute top-4 left-4 z-20 flex h-8 w-8 items-center justify-center rounded-md border border-white/20 bg-black/60 font-serif text-sm font-bold text-eldritch-gold shadow-lg backdrop-blur-sm">
              {ROMAN_NUMERALS[vessel.tier]}
          </div>

           <div className="absolute bottom-4 left-6 z-10 text-left">
               <div className="flex items-center gap-2 mb-1"><TypeIcon className={`h-4 w-4 ${typeColor.split(' ')[0]}`} /><span className={`text-xs uppercase tracking-widest font-bold ${typeColor.split(' ')[0]}`}>{vessel.type} Vessel</span></div>
               <h2 className="font-serif text-3xl font-bold uppercase tracking-widest drop-shadow-md text-white">{vessel.name}</h2>
               <p className="text-sm text-gray-300 italic">{vessel.subtitle}</p>
          </div>
      </div>
      <div className="p-6">
          <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-black/40 border border-white/5">
              <div className="text-left">
                  <div className="text-[10px] uppercase text-gray-500">Operation Status</div>
                  <div className={`font-serif text-lg font-bold ${isImprisoned ? 'text-red-500' : 'text-green-500'}`}>{isImprisoned ? 'Imprisoned' : 'Active'}</div>
              </div>
              {canImprison && (
                <button 
                  onClick={onToggle}
                  className={`flex items-center gap-2 px-4 py-2 rounded font-bold uppercase text-xs transition-colors ${isImprisoned ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
                >
                  {isImprisoned ? <><Unlock className="h-4 w-4" /> Release</> : <><Lock className="h-4 w-4" /> Imprison</>}
                </button>
              )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
              <div className={`flex flex-col p-3 rounded bg-black/30 border border-green-900/30 transition-all ${isImprisoned ? 'opacity-40 grayscale' : ''}`}>
                  <div className="flex items-center gap-2 text-green-400 mb-1">
                      <Activity className="h-4 w-4" />
                      <span className="text-[10px] uppercase font-bold">Production</span>
                  </div>
                  <span className="font-mono text-lg font-bold text-green-300">+{formatNumber(currentOutput)}</span>
              </div>
              {consumption && consumption.amount > 0 && (
                <div className={`flex flex-col p-3 rounded bg-black/30 border border-red-900/30 transition-all ${isImprisoned ? 'opacity-40 grayscale' : ''}`}>
                    <div className="flex items-center gap-2 text-red-400 mb-1">
                        <Utensils className="h-4 w-4" />
                        <span className="text-[10px] uppercase font-bold">Consumption</span>
                    </div>
                    <span className="font-mono text-lg font-bold text-red-300">-{formatNumber(consumption.amount)}</span>
                </div>
              )}
          </div>

          {multiplier > 1 && (
              <div className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-yellow-950/20 p-3 border border-yellow-700/30 animate-pulse">
                  <Zap className="h-4 w-4 text-eldritch-gold" />
                  <span className="text-xs font-bold uppercase tracking-widest text-eldritch-gold">Milestone Bonus Active: {multiplier}x Efficiency</span>
              </div>
          )}

          <div className="space-y-4 text-gray-300 font-sans leading-relaxed text-sm mb-4"><p>{vessel.lore}</p></div>
          {canImprison && <div className="text-xs text-gray-500">Imprisoning a vessel halts both its production and its consumption of lower castes. Use this to stabilize your cult's foundation.</div>}
      </div>
    </BaseModal>
  );
};
