
import React from 'react';
import { Ghost } from 'lucide-react';
import { BaseModal } from './BaseModal';

interface MiracleIntroModalProps {
  onClose: () => void;
  imageUrl?: string;
}

export const MiracleIntroModal: React.FC<MiracleIntroModalProps> = ({ onClose, imageUrl }) => {
  return (
    <BaseModal onClose={onClose} zIndex={110} containerClassName="max-w-lg w-full" backdropClassName="bg-black/95 backdrop-blur-xl">
      <div className="relative h-64 w-full bg-black overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} className="h-full w-full object-cover opacity-60" alt="Dark Miracle" />
        ) : (
          <Ghost className="h-32 w-32 text-blue-500 opacity-20" />
        )}
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-t from-eldritch-dark via-transparent to-transparent" />
      </div>

      <div className="p-8 text-center relative z-10 -mt-10">
        <h2 className="mb-2 font-serif text-3xl font-bold text-white tracking-widest uppercase">Your Dark Miracles</h2>
        <h3 className="mb-6 font-serif text-eldritch-gold italic">"The souls of the Indolent stir."</h3>
        
        <div className="space-y-4 font-serif text-gray-300 text-sm sm:text-base leading-relaxed">
          <p>You have just performed a dark miracle. This miracle can only be perceived by the Indolent, for their minds drift from their life purposes into the aether, where the miracle can be seen.</p>
          <p>Dark Miracles attract the Indolent. The more you tap, the more Indolent will join your cause.</p>
          <p className="text-eldritch-gold/80 font-bold">Upgrade your Dark Miracle to improve its effectiveness.</p>
        </div>

        <button 
          onClick={onClose}
          className="mt-8 w-full rounded-lg bg-eldritch-gold/20 border border-eldritch-gold/40 py-4 font-serif font-bold uppercase tracking-widest text-eldritch-gold hover:bg-eldritch-gold/30 transition-all hover:scale-[1.02] active:scale-95"
        >
          I Command Them
        </button>
      </div>
    </BaseModal>
  );
};
