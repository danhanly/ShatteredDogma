
import React from 'react';
import { VesselDefinition, WorshipperType } from '../types';
import { User, Crown, Frown, Ghost, Sword } from 'lucide-react';
import { calculateVesselOutput } from '../services/gameService';
import { formatNumber } from '../utils/format';
import { BaseModal } from './BaseModal';

interface VesselModalProps {
  vessel: VesselDefinition | null;
  level: number;
  onClose: () => void;
  imageUrl?: string;
}

const ICON_MAP = {
  [WorshipperType.WORLDLY]: Crown,
  [WorshipperType.LOWLY]: Frown,
  [WorshipperType.ZEALOUS]: Sword,
  [WorshipperType.INDOLENT]: Ghost,
};

export const VesselModal: React.FC<VesselModalProps> = ({ vessel, level, onClose, imageUrl }) => {
  if (!vessel) return null;
  const currentOutput = calculateVesselOutput(vessel.id, level);
  const nextOutput = calculateVesselOutput(vessel.id, level + 1);
  const TypeIcon = ICON_MAP[vessel.type];
  const typeColor = vessel.type === WorshipperType.WORLDLY ? 'text-green-400 border-green-900 bg-green-950' : vessel.type === WorshipperType.ZEALOUS ? 'text-red-500 border-red-900 bg-red-950' : vessel.type === WorshipperType.INDOLENT ? 'text-blue-400 border-blue-900 bg-blue-950' : 'text-gray-400 border-gray-700 bg-gray-900';

  return (
    <BaseModal onClose={onClose} showCloseButton={true} zIndex={60} containerClassName={`max-w-md w-full ${typeColor.split(' ')[1]}`}>
      <div className="relative h-80 w-full overflow-hidden bg-black flex items-center justify-center">
          {imageUrl ? <div className="absolute inset-0 bg-no-repeat" style={{ backgroundImage: `url('${imageUrl}')`, backgroundSize: 'cover', backgroundPosition: 'top center' }} /> : <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black to-eldritch-dark"><User className={`h-32 w-32 opacity-20 ${typeColor.split(' ')[0]}`} /></div>}
          <div className="absolute inset-0 bg-gradient-to-t from-eldritch-dark via-eldritch-dark/20 to-transparent" />
           <div className="absolute bottom-4 left-6 z-10">
               <div className="flex items-center gap-2 mb-1"><TypeIcon className={`h-4 w-4 ${typeColor.split(' ')[0]}`} /><span className={`text-xs uppercase tracking-widest font-bold ${typeColor.split(' ')[0]}`}>{vessel.type} Vessel</span></div>
               <h2 className="font-serif text-3xl font-bold uppercase tracking-widest drop-shadow-md text-white">{vessel.name}</h2>
               <p className="text-sm text-gray-300 italic">{vessel.subtitle}</p>
          </div>
      </div>
      <div className="p-6">
          <div className="mt-2 mb-6 grid grid-cols-2 gap-3">
              <div className="rounded bg-black/40 p-3 border border-white/5 text-center">
                  <div className="text-[10px] uppercase text-gray-500">Current Output</div>
                  <div className="font-mono text-lg font-bold text-white">+{formatNumber(currentOutput)}/s</div>
              </div>
              <div className="rounded bg-black/40 p-3 border border-white/5 text-center">
                  <div className="text-[10px] uppercase text-gray-500">Next Level</div>
                  <div className={`font-mono text-lg font-bold ${typeColor.split(' ')[0]}`}>+{formatNumber(nextOutput)}/s</div>
              </div>
          </div>
          <div className="space-y-4 text-gray-300 font-sans leading-relaxed text-sm"><p>{vessel.lore}</p></div>
      </div>
    </BaseModal>
  );
};
