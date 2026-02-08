
import React from 'react';
import { Ghost, Frown, Crown, Sword, Loader2 } from 'lucide-react';
import { BaseModal } from './BaseModal';

interface SplashIntroProps {
  bgUrl: string;
  onStart: () => void;
  progress: number;
  isLoaded: boolean;
}

export const SplashIntro: React.FC<SplashIntroProps> = ({ bgUrl, onStart, progress, isLoaded }) => (
  <BaseModal zIndex={100} containerClassName="max-w-xl w-full border-white/5" backdropClassName="bg-black">
    <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
        {bgUrl && <img src={bgUrl} className="h-full w-full object-cover grayscale opacity-30 blur-sm animate-fade-in" alt="Background" />}
    </div>
    <div className="relative z-10 p-8 text-center bg-black/60 backdrop-blur-sm">
      <h1 className="mb-6 font-gothic text-6xl font-black uppercase tracking-widest text-eldritch-gold drop-shadow-2xl">Shattered Dogma</h1>
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
        onClick={onStart}
        disabled={!isLoaded}
        className={`group relative w-full rounded-full border-2 px-8 py-4 font-serif text-lg font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap
          ${isLoaded 
            ? 'border-eldritch-gold/50 bg-black/40 text-eldritch-gold hover:bg-eldritch-gold/20 hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(197,160,89,0.2)]' 
            : 'border-gray-800 bg-gray-900/40 text-gray-600 cursor-not-allowed'
          }`}
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          {!isLoaded && <Loader2 className="h-5 w-5 animate-spin" />}
          {isLoaded ? 'Build Your Eldritch Cult' : 'Weaving Reality...'}
        </span>
        {isLoaded && <div className="absolute inset-0 -z-10 animate-pulse bg-eldritch-gold/5" />}
      </button>
    </div>
  </BaseModal>
);
