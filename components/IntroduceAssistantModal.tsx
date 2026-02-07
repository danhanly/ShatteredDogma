
import React from 'react';
import { BaseModal } from './BaseModal';
import { Sparkles } from 'lucide-react';

interface IntroduceAssistantModalProps {
  onClose: () => void;
  imageUrl: string;
}

export const IntroduceAssistantModal: React.FC<IntroduceAssistantModalProps> = ({ onClose, imageUrl }) => {
  return (
    <BaseModal onClose={onClose} zIndex={110} containerClassName="max-w-lg w-full" backdropClassName="bg-black/95 backdrop-blur-xl">
      <div className="relative h-64 w-full bg-black overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} className="h-full w-full object-cover opacity-60" alt="Mattelock Verbinsk" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-purple-900/40 to-black flex items-center justify-center">
            <Sparkles className="h-16 w-16 text-eldritch-gold opacity-30" />
          </div>
        )}
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-t from-eldritch-dark via-transparent to-transparent" />
      </div>

      <div className="p-8 text-center relative z-10 -mt-10">
        <h2 className="mb-2 font-serif text-3xl font-bold text-white tracking-widest uppercase">You need a hand…</h2>
        <h3 className="mb-6 font-serif text-eldritch-gold italic">“…and the Abyss sent me to take it.”</h3>
        
        <div className="space-y-4 font-serif text-gray-300 text-sm sm:text-base leading-relaxed">
          <p>The Abyss has seen fit to assign you an assistant. This is Mattelock Verbinsk, use him well for he is a valuable resource.</p>
          <p>Recruit Mattelock Verbinsk to ease the burden on your fingers...</p>
        </div>

        <button 
          onClick={onClose}
          className="mt-8 w-full rounded-lg bg-eldritch-gold/20 border border-eldritch-gold/40 py-4 font-serif font-bold uppercase tracking-widest text-eldritch-gold hover:bg-eldritch-gold/30 transition-all hover:scale-[1.02] active:scale-95"
        >
          Show Me What You Can Do
        </button>
      </div>
    </BaseModal>
  );
};
