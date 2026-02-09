
import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Lock, ZapOff } from 'lucide-react';
import { BaseModal } from './BaseModal';

interface IntroModalProps {
  onClose: () => void;
  imageUrl?: string;
}

export const LowlyModal: React.FC<IntroModalProps> = ({ onClose, imageUrl }) => (
  <BaseModal onClose={onClose} zIndex={120} containerClassName="max-w-lg w-full border-gray-600" backdropClassName="bg-black/95 backdrop-blur-xl">
    <div className="h-64 w-full bg-black overflow-hidden relative">
      <img src={imageUrl || "img/vessels/lowly/1.jpeg"} className="h-full w-full object-cover opacity-60" alt="Lowly" />
      <div className="absolute inset-0 bg-gradient-to-t from-eldritch-dark via-transparent to-transparent" />
    </div>
    <div className="p-8 text-center">
      <h2 className="mb-2 font-serif text-3xl font-bold text-white uppercase">The Lowly Must Feed</h2>
      <h3 className="mb-6 font-serif text-gray-400 italic">"The Lowly look upon the Indolent with disgust."</h3>
      <p className="mb-4 text-gray-300 text-sm leading-relaxed">The Lowly are worked to the bone and exhausted, yet they still rise each morning to work hard for the benefit of the Abyss. The Lowly look upon the Indolent with utter disdain.</p>
      <div className="rounded-lg bg-black/40 p-4 border border-blue-900/30 mb-8">
          <p className="text-blue-400 text-xs font-bold uppercase mb-1">Consumption Mechanics</p>
          <p className="text-gray-400 text-xs">Lowly worshippers now consume the souls of the Indolent to sustain themselves. Manage your supply of Indolent if you wish to grow the Lowly.</p>
      </div>
      <button onClick={onClose} className="w-full flex items-center justify-center gap-2 rounded-lg bg-gray-700/50 border border-gray-500 py-4 font-serif font-bold uppercase tracking-widest text-white hover:bg-gray-600/50 transition-colors">
        Feed from the Indolent <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  </BaseModal>
);

export const WorldlyModal: React.FC<IntroModalProps> = ({ onClose, imageUrl }) => (
  <BaseModal onClose={onClose} zIndex={120} containerClassName="max-w-lg w-full border-green-900" backdropClassName="bg-black/95 backdrop-blur-xl">
    <div className="h-64 w-full bg-black overflow-hidden relative">
      <img src={imageUrl || "img/vessels/worldly/1.jpeg"} className="h-full w-full object-cover opacity-60" alt="Worldly" />
      <div className="absolute inset-0 bg-gradient-to-t from-eldritch-dark via-transparent to-transparent" />
    </div>
    <div className="p-8 text-center">
      <h2 className="mb-2 font-serif text-3xl font-bold text-white uppercase">The Worldly Exploit the Lowly</h2>
      <h3 className="mb-6 font-serif text-green-500 italic">"The Worldly consume the Lowly… as is their place in this world."</h3>
      <p className="mb-4 text-gray-300 text-sm leading-relaxed">Since time immemorial have the Worldly exploited the Lowly, but since peering into the Abyss, the Worldly have found new and terrifying ways to exploit their lowers.</p>
      <div className="rounded-lg bg-black/40 p-4 border border-gray-700 mb-8">
          <p className="text-gray-400 text-xs font-bold uppercase mb-1">Consumption Mechanics</p>
          <p className="text-gray-400 text-xs">Worldly worshippers now consume the souls of the Lowly to sustain themselves. Manage your supply of Lowly if you wish to grow the Worldly.</p>
      </div>
      <button onClick={onClose} className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-900/20 border border-green-700 py-4 font-serif font-bold uppercase tracking-widest text-green-400 hover:bg-green-900/30 transition-colors">
        Exploit the Lowly <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  </BaseModal>
);

export const ZealousModal: React.FC<IntroModalProps> = ({ onClose, imageUrl }) => (
  <BaseModal onClose={onClose} zIndex={120} containerClassName="max-w-lg w-full border-red-900" backdropClassName="bg-black/95 backdrop-blur-xl">
    <div className="h-64 w-full bg-black overflow-hidden relative">
      <img src={imageUrl || "img/vessels/zealous/1.jpeg"} className="h-full w-full object-cover opacity-60" alt="Zealous" />
      <div className="absolute inset-0 bg-gradient-to-t from-eldritch-dark via-transparent to-transparent" />
    </div>
    <div className="p-8 text-center">
      <h2 className="mb-2 font-serif text-3xl font-bold text-white uppercase">The Zealous Inflame the Populace</h2>
      <h3 className="mb-6 font-serif text-red-500 italic">"The ferocity of their zeal consumes all"</h3>
      <p className="mb-4 text-gray-300 text-sm leading-relaxed">The Zealots brook no laxity for Worshippers of the Abyss. Wherever they look they see a potential heretic, an unbeliever, a posturer, and they can stand nothing but total orthodoxy.</p>
      <div className="rounded-lg bg-black/40 p-4 border border-red-900/30 mb-8">
          <p className="text-red-400 text-xs font-bold uppercase mb-1">Consumption Mechanics</p>
          <p className="text-gray-400 text-xs">Zealot worshippers now consume the souls of the Worldly to sustain themselves. Manage your supply of Worldly worshippers if you wish to grow the Zealots.</p>
      </div>
      <button onClick={onClose} className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-900/20 border border-red-700 py-4 font-serif font-bold uppercase tracking-widest text-red-500 hover:bg-red-900/30 transition-colors">
        Stoke the Fires of Zeal <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  </BaseModal>
);

export const ProductionStarvedModal: React.FC<IntroModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);

  return (
    <BaseModal onClose={onClose} zIndex={130} containerClassName="max-w-lg w-full border-eldritch-crimson shadow-[0_0_50px_rgba(255,0,0,0.3)]" backdropClassName="bg-black/95 backdrop-blur-xl">
      <div className="h-56 w-full bg-black overflow-hidden relative flex items-center justify-center bg-gradient-to-b from-red-950 to-black">
         <div className="relative">
             <AlertCircle className="h-24 w-24 text-red-500 animate-pulse" />
             <ZapOff className="absolute -bottom-4 -right-4 h-12 w-12 text-red-300" />
         </div>
      </div>
      
      {step === 1 ? (
          <div className="p-8 text-center">
            <h2 className="mb-2 font-serif text-3xl font-bold text-white uppercase">The Abyss Starves</h2>
            <h3 className="mb-6 font-serif text-eldritch-crimson italic">"Net production has collapsed."</h3>
            <p className="mb-6 text-gray-300 text-sm leading-relaxed">Your consumption has outpaced your production. A caste is being drained faster than it can be replenished. If this continues, your economy will crumble.</p>
            <div className="rounded-lg bg-red-950/40 p-4 border border-red-800/30 mb-8">
                <p className="text-red-500 text-xs font-bold uppercase mb-1">Warning: Net Negative</p>
                <p className="text-gray-400 text-xs">When a resource bar glows red, it means you are losing more than you are gaining. You must act to balance the Liturgy.</p>
            </div>
            <button onClick={() => setStep(2)} className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-900/20 border border-red-700 py-4 font-serif font-bold uppercase tracking-widest text-red-500 hover:bg-red-900/30 transition-colors">
              How do I fix this? <ArrowRight className="h-4 w-4" />
            </button>
          </div>
      ) : (
          <div className="p-8 text-center">
            <h2 className="mb-2 font-serif text-2xl font-bold text-white uppercase">Imprison the Gluttonous</h2>
            <p className="mb-6 text-gray-300 text-sm leading-relaxed">You have the power to <strong>Imprison</strong> any vessel. This halts both their production and their consumption instantly.</p>
            
            <div className="flex justify-center mb-8">
                <div className="flex items-center gap-2 px-6 py-3 rounded bg-red-900 border border-red-500 text-white font-bold uppercase text-sm pointer-events-none opacity-90 shadow-lg">
                    <Lock className="h-4 w-4" /> Imprison Vessel
                </div>
            </div>

            <p className="mb-8 text-xs text-gray-500 italic">Use this power to punish over-consumption until your lower castes have recovered their numbers.</p>

            <button onClick={onClose} className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-900/20 border border-red-700 py-4 font-serif font-bold uppercase tracking-widest text-red-500 hover:bg-red-900/30 transition-colors">
              I Understand My Power
            </button>
          </div>
      )}
    </BaseModal>
  );
};
