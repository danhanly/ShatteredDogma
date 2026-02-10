
import React, { useState } from 'react';
import { Ghost, Frown, Crown, Sword, Loader2, ArrowRight, Activity, Sparkles } from 'lucide-react';
import { BaseModal } from './BaseModal';
import { VESSEL_DEFINITIONS } from '../constants';

interface SplashIntroProps {
  bgUrl: string;
  onStart: () => void;
  progress: number;
  isLoaded: boolean;
}

export const SplashIntro: React.FC<SplashIntroProps> = ({ bgUrl, onStart, progress, isLoaded }) => {
  const [step, setStep] = useState(1);

  // Find Zealous T3 for mock display (The Icon of Aether is T4, text says "Tier 3", usually "Commander Thraxton" but prompt says "Tier 3 Zealous Worshipper, as if it were level 50".)
  // Let's use Commander Thraxton (T3)
  const zealousDef = VESSEL_DEFINITIONS.find(v => v.id === 'ZEALOUS_3') || VESSEL_DEFINITIONS.find(v => v.type === 'Zealous');

  return (
  <BaseModal zIndex={100} containerClassName="max-w-2xl w-full border-white/5" backdropClassName="bg-black">
    <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
        {bgUrl && <img src={bgUrl} className="h-full w-full object-cover grayscale opacity-30 blur-sm animate-fade-in" alt="Background" />}
    </div>
    
    <div className="relative z-10 p-8 text-center bg-black/60 backdrop-blur-sm">
      <h1 className="mb-6 font-gothic text-6xl font-black uppercase tracking-widest text-eldritch-gold drop-shadow-2xl">Shattered Dogma</h1>
      
      {step === 1 ? (
        <>
          <div className="mb-8 space-y-4 font-serif text-lg leading-relaxed text-gray-300">
            <p>"In the void between the stars, a silence yearns to be filled. You are the echo that answers. The veil has thinned, and the mortal cattle drift aimlessly, seeking a master."</p>
            
            <div className="grid grid-cols-2 gap-4 pt-4 text-xs tracking-wider border-t border-white/10">
              <div className="flex items-center gap-2 text-blue-400"><Ghost className="h-4 w-4" /> Indolent</div>
              <div className="flex items-center gap-2 text-gray-400"><Frown className="h-4 w-4" /> Lowly</div>
              <div className="flex items-center gap-2 text-green-400"><Crown className="h-4 w-4" /> Worldly</div>
              <div className="flex items-center gap-2 text-red-500"><Sword className="h-4 w-4" /> Zealous</div>
            </div>
          </div>

          <div className="mb-8 space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-eldritch-gold/60">
              <span>{isLoaded ? 'Ritual Prepared' : 'Summoning Assets...'}</span>
              <span className="font-mono">{Math.floor(progress)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5 border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-yellow-900 via-eldritch-gold to-yellow-600 shadow-[0_0_15px_rgba(197,160,89,0.5)] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <button 
            onClick={() => isLoaded && setStep(2)}
            disabled={!isLoaded}
            className={`group relative w-full rounded-full border-2 px-8 py-4 font-serif text-lg font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap
              ${isLoaded 
                ? 'border-eldritch-gold/50 bg-black/40 text-eldritch-gold hover:bg-eldritch-gold/20 hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(197,160,89,0.2)]' 
                : 'border-gray-800 bg-gray-900/40 text-gray-600 cursor-not-allowed'
              }`}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {!isLoaded && <Loader2 className="h-5 w-5 animate-spin" />}
              {isLoaded ? <><span className="mr-1">Begin Ascension</span> <ArrowRight className="h-4 w-4" /></> : 'Weaving Reality...'}
            </span>
          </button>
        </>
      ) : step === 2 ? (
        <div className="animate-fade-in text-left">
           <p className="text-center font-serif text-gray-300 italic mb-6">"Create Dark Miracles to entice worshippers to join your cult."</p>

           <div className="flex flex-col items-center justify-center mb-8 gap-6">
               <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 animate-pulse-slow rounded-full blur-[40px] bg-purple-600/30" />
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-black to-transparent shadow-2xl" style={{ boxShadow: `0 0 20px #9333ea66`, border: `2px solid #9333ea33`, background: `radial-gradient(circle at center, #9333ea22 0%, #000 100%)` }}>
                        <div className="z-20 flex flex-col items-center">
                             <Sparkles className="h-8 w-8 text-white mb-1" />
                             <span className="font-serif text-[10px] uppercase tracking-widest text-eldritch-gold/80">Miracle</span>
                        </div>
                    </div>
               </div>

               <div className="space-y-4 font-serif text-sm text-gray-300 max-w-lg text-center">
                   <p>Dark Miracles are only attractive to the <span className="text-blue-400 font-bold">Indolent</span>, and so each click/tap attracts more and more of this caste to worship the Abyss.</p>
                   <p>Upgrade your Dark Miracle to improve its effectiveness, attracting ever more of the Indolent.</p>
                   <p className="text-eldritch-gold/80">With a big enough hoard of Indolent Worshippers, surely the other castes can no longer ignore the call of the Abyss... Perhaps a way forward will reveal itself.</p>
               </div>
           </div>

           <button 
             onClick={() => setStep(3)}
             className="w-full rounded-full border-2 border-purple-500/50 bg-gradient-to-r from-purple-900/40 to-eldritch-dark/40 px-8 py-4 font-serif text-lg font-bold uppercase tracking-[0.2em] transition-all hover:bg-eldritch-gold/10 hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(147,51,234,0.2)] text-white flex items-center justify-center gap-2"
           >
             Understand the Call <ArrowRight className="h-4 w-4" />
           </button>
        </div>
      ) : (
        <div className="animate-fade-in text-left">
           <p className="text-center font-serif text-gray-300 italic mb-6">"Cults live by the Zealous and die by the Apathetic."</p>
           
           <div className="flex flex-col md:flex-row gap-6 items-center justify-center mb-8">
               <div className="flex-1 space-y-4 font-serif text-sm text-gray-300">
                   <p>If you want your cult to succeed, you must find a way to attract <span className="text-red-500 font-bold">Zealous</span> worshippers, but Zealous Worshippers require great effort to support.</p>
                   <p>The Abyss only wishes to taste the souls of those whose fire burns bright.</p>
                   <p className="text-eldritch-gold">The more Zealous Worshippers you create, the more Souls you are granted as reward.</p>
               </div>

               {/* Mock Card */}
               <div className="relative rounded-xl border border-red-900 bg-eldritch-dark p-3 max-w-[280px] w-full shrink-0 opacity-90 pointer-events-none select-none">
                    <div className="absolute -top-1.5 -right-1.5 z-20 flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-black font-serif text-[10px] font-bold text-eldritch-gold shadow-lg ring-1 ring-white/5">
                        III
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 border-red-900 bg-black overflow-hidden">
                             <Sword className="h-8 w-8 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-serif text-sm font-bold text-red-500 truncate">{zealousDef?.name || "Commander Thraxton"}</h4>
                            <div className="mt-1 flex flex-col gap-0.5 text-[10px] uppercase tracking-wider text-gray-400">
                                <div className="flex items-center gap-1 relative">
                                    <Activity className="h-3 w-3 text-green-500" />
                                    <span className="text-gray-300">Prod:</span>
                                    <span className="font-mono text-green-400 font-bold">+2.25e7/s</span>
                                </div>
                            </div>
                        </div>
                        <div className="shrink-0 flex flex-col items-center justify-center rounded-lg bg-black/50 border border-eldritch-gold/30 px-3 py-1 ml-1">
                             <span className="text-[9px] font-serif font-bold uppercase tracking-widest text-gray-500">Level</span>
                             <span className="font-mono text-xl font-bold text-eldritch-gold leading-none">50</span>
                        </div>
                    </div>
               </div>
           </div>

           <button 
            onClick={onStart}
            className="w-full rounded-full border-2 border-eldritch-gold/50 bg-gradient-to-r from-red-900/40 to-eldritch-dark/40 px-8 py-4 font-serif text-lg font-bold uppercase tracking-[0.2em] transition-all hover:bg-eldritch-gold/10 hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(239,68,68,0.2)] text-white"
          >
            I Understand My Purpose
          </button>
        </div>
      )}
    </div>
  </BaseModal>
  );
};
