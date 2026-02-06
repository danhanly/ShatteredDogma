
import React, { useState } from 'react';
import { GemType, WorshipperType } from '../types';
import { GEM_DEFINITIONS, GEM_DISCOVERY_FLAVOR } from '../constants';
import { Crown, Frown, Ghost, Sword, Sparkles, ArrowRight } from 'lucide-react';

interface GemDiscoveryModalProps {
  gem: GemType | null;
  isFirstGem: boolean;
  onClose: () => void;
}

const ICON_MAP = {
  [WorshipperType.WORLDLY]: Crown,
  [WorshipperType.LOWLY]: Frown,
  [WorshipperType.ZEALOUS]: Sword,
  [WorshipperType.INDOLENT]: Ghost,
};

export const GemDiscoveryModal: React.FC<GemDiscoveryModalProps> = ({ gem, isFirstGem, onClose }) => {
  const [step, setStep] = useState(1);
  
  if (!gem) return null;

  const def = GEM_DEFINITIONS[gem];
  const GemIcon = def.favoredType ? ICON_MAP[def.favoredType] : Sparkles;

  // The visual for the second panel is a hardcoded tutorial example showing the "Indolent" (Sloth Sapphire) resonance.
  const TutorialIcon = Ghost;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-500">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-eldritch-gold/30 bg-eldritch-dark p-8 shadow-[0_0_100px_rgba(197,160,89,0.3)]">
        {/* Particle / Shine effect behind content */}
        <div className={`absolute left-1/2 top-24 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px] opacity-40 ${def.color.split(' ')[0]}`} />
        
        <div className="relative z-10 flex flex-col items-center text-center">
            {step === 1 ? (
                <>
                    <div className={`mb-6 flex h-20 w-20 animate-bounce items-center justify-center rounded-full border-2 ${def.color} shadow-[0_0_30px_rgba(255,255,255,0.2)]`}>
                        <GemIcon className="h-10 w-10 text-white" />
                    </div>

                    <h2 className="mb-2 font-serif text-xl tracking-widest text-eldritch-gold uppercase">
                        {GEM_DISCOVERY_FLAVOR.title}
                    </h2>
                    
                    <h3 className="mb-4 font-serif text-2xl font-bold text-white">
                        {def.name} Discovered
                    </h3>

                    <p className="mb-8 font-sans text-sm italic leading-relaxed text-gray-400">
                        "{GEM_DISCOVERY_FLAVOR.description}"
                    </p>

                    <div className="mb-8 w-full rounded-lg bg-black/50 p-4 border border-white/5 text-left">
                        <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Manifested Potential</div>
                        <div className="text-white font-bold text-sm">{def.description}</div>
                    </div>

                    <button 
                        onClick={isFirstGem ? () => setStep(2) : onClose}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-eldritch-gold/50 bg-gradient-to-b from-eldritch-gold/20 to-eldritch-gold/5 py-3 font-serif font-bold text-eldritch-gold transition-all hover:from-eldritch-gold/30 hover:to-eldritch-gold/10 active:scale-95"
                    >
                        {isFirstGem ? 'Learn the Resonance' : 'Claim the Essence'} {isFirstGem && <ArrowRight className="h-4 w-4" />}
                    </button>
                </>
            ) : (
                <>
                    <div className="mb-6 flex items-center justify-center gap-6">
                         {/* Static Tutorial Orb (Blue) */}
                         <div className={`h-16 w-16 rounded-full bg-gradient-to-br ring-1 ring-white/10 flex items-center justify-center from-blue-900 via-blue-600 to-black shadow-[0_0_30px_rgba(37,99,235,0.6)]`}>
                            <TutorialIcon className="h-6 w-6 text-white/40" />
                         </div>
                         {/* Static Indolent Gem Button Preview */}
                         <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-white/30 bg-black/40 p-2 ring-2 ring-white/20">
                            <TutorialIcon className={`h-8 w-8 text-blue-500`} />
                         </div>
                    </div>

                    <h2 className="mb-4 font-serif text-xl tracking-widest text-eldritch-gold uppercase">
                        The Liturgy of Tuning
                    </h2>

                    <p className="mb-6 font-sans text-sm italic leading-relaxed text-gray-300">
                        "Your miracles now hum with a calculated intent. Embedding this shard into your ritual whispers a specific frequency into the void—a siren song for the chosen flock. It is not a command, for the soul is fickle, but a beckoning that few of their kind can resist."
                    </p>
                    
                    <p className="mb-8 font-sans text-xs leading-relaxed text-gray-400">
                        "Observe the manifestation's core; it shall bleed with the color of your focus. Choose wisely, for even a god cannot sing every song at once."
                    </p>

                    <button 
                        onClick={onClose}
                        className="w-full rounded-lg border border-eldritch-gold/50 bg-gradient-to-b from-eldritch-gold/20 to-eldritch-gold/5 py-3 font-serif font-bold text-eldritch-gold transition-all hover:from-eldritch-gold/30 hover:to-eldritch-gold/10 active:scale-95"
                    >
                        Claim the Essence
                    </button>
                </>
            )}
        </div>
      </div>
    </div>
  );
};
