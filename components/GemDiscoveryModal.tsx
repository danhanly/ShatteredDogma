
import React from 'react';
import { GemType } from '../types';
import { GEM_DEFINITIONS, GEM_DISCOVERY_FLAVOR } from '../constants';
import { Sparkles } from 'lucide-react';
import { BaseModal } from './BaseModal';

interface GemDiscoveryModalProps {
  gem: GemType | null;
  onClose: () => void;
  imageUrl?: string;
}

export const GemDiscoveryModal: React.FC<GemDiscoveryModalProps> = ({ gem, onClose, imageUrl }) => {
  if (!gem) return null;
  const def = GEM_DEFINITIONS[gem];

  return (
    <BaseModal onClose={onClose} zIndex={150} containerClassName="max-w-lg w-full border-eldritch-gold/30" backdropClassName="bg-black/95 backdrop-blur-xl">
      <div className="relative h-64 w-full bg-black overflow-hidden">
        <img src={imageUrl || def.image} className="h-full w-full object-cover opacity-60" alt={def.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-eldritch-dark via-transparent to-transparent" />
      </div>
      <div className="p-8 text-center">
        <div className="flex justify-center mb-4"><Sparkles className="h-8 w-8 text-eldritch-gold animate-pulse" /></div>
        <h2 className="mb-2 font-serif text-3xl font-bold text-white uppercase tracking-widest">{GEM_DISCOVERY_FLAVOR.title}</h2>
        <h3 className="mb-6 font-serif text-xl font-bold italic" style={{ color: def.color }}>{def.name}</h3>
        
        <div className="space-y-4 font-serif text-gray-300 text-sm leading-relaxed mb-8">
          <p>{GEM_DISCOVERY_FLAVOR.description}</p>
          <p className="border-t border-white/10 pt-4 text-white">"{def.description}"</p>
        </div>

        <button 
          onClick={onClose}
          className="w-full rounded-lg bg-eldritch-gold/20 border border-eldritch-gold/40 py-4 font-serif font-bold uppercase tracking-widest text-eldritch-gold hover:bg-eldritch-gold/30 transition-all active:scale-95"
        >
          Thank the Abyss For This Gift
        </button>
      </div>
    </BaseModal>
  );
};
