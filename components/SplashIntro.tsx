
import React from 'react';
import { Ghost, Frown, Crown, Sword } from 'lucide-react';
import { BaseModal } from './BaseModal';

interface SplashIntroProps {
  bgUrl: string;
  onStart: () => void;
}

export const SplashIntro: React.FC<SplashIntroProps> = ({ bgUrl, onStart }) => (
  <BaseModal zIndex={100} containerClassName="max-w-xl w-full border-white/5" backdropClassName="bg-black">
    <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
        <img src={bgUrl} className="h-full w-full object-cover grayscale opacity-30 blur-sm" alt="Background" />
    </div>
    <div className="relative z-10 p-8 text-center bg-black/60 backdrop-blur-sm">
      <h1 className="mb-6 font-gothic text-6xl font-black uppercase tracking-widest text-eldritch-gold drop-shadow-2xl">Shattered Dogma</h1>
      <div className="mb-8 space-y-4 font-serif text-lg leading-relaxed text-gray-300">
        <p>"In the void between the stars, a silence yearns to be filled. You are the echo that answers. The veil has thinned, and the mortal cattle drift aimlessly, seeking a master to harness their ephemeral souls."</p>
        <p className="text-sm border-t border-white/10 pt-4 text-eldritch-gold/80 italic">
          Creating dark miracles attracts seekers from four distinct walks of life. Each miracle manifestation resonates with the essence of a soul type. Upgrade your miracle to strengthen this resonance and draw ever-increasing throngs to your shadow.
        </p>
        <div className="grid grid-cols-2 gap-4 pt-4 text-xs tracking-wider">
          <div className="flex items-center gap-2 text-blue-400"><Ghost className="h-4 w-4" /> Indolent: The biomass</div>
          <div className="flex items-center gap-2 text-gray-400"><Frown className="h-4 w-4" /> Lowly: The foundation</div>
          <div className="flex items-center gap-2 text-green-400"><Crown className="h-4 w-4" /> Worldly: The tethers</div>
          <div className="flex items-center gap-2 text-red-500"><Sword className="h-4 w-4" /> Zealous: The fury</div>
        </div>
      </div>
      <button 
        onClick={onStart}
        className="group relative rounded-full border-2 border-eldritch-gold/50 bg-black/40 px-8 py-4 font-serif text-lg font-bold uppercase tracking-widest text-eldritch-gold transition-all hover:bg-eldritch-gold/20 hover:scale-105 active:scale-95 whitespace-nowrap"
      >
        <span className="relative z-10">Build Your Eldritch Cult</span>
        <div className="absolute inset-0 -z-10 animate-pulse bg-eldritch-gold/5" />
      </button>
    </div>
  </BaseModal>
);
