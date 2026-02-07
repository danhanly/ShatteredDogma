
import React from 'react';
import { BaseModal } from './BaseModal';
import { User } from 'lucide-react';

interface AbyssAssistantModalProps {
  onClose: () => void;
  imageUrl: string;
}

export const AbyssAssistantModal: React.FC<AbyssAssistantModalProps> = ({ onClose, imageUrl }) => {
  return (
    <BaseModal onClose={onClose} showCloseButton={true} zIndex={60} containerClassName="max-w-md w-full border-eldritch-gold/50">
      <div className="relative h-80 w-full overflow-hidden bg-black flex items-center justify-center">
          {imageUrl ? (
            <div className="absolute inset-0 bg-no-repeat" style={{ backgroundImage: `url('${imageUrl}')`, backgroundSize: 'cover', backgroundPosition: 'top center' }} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black to-eldritch-dark">
              <User className="h-32 w-32 opacity-20 text-eldritch-gold" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-eldritch-dark via-eldritch-dark/20 to-transparent" />
           <div className="absolute bottom-4 left-6 z-10">
               <h2 className="font-serif text-3xl font-bold uppercase tracking-widest drop-shadow-md text-white">Mattelock Verbinsk</h2>
               <p className="text-sm text-eldritch-gold italic">Assistant from the Abyss</p>
          </div>
      </div>
      <div className="p-6">
          <div className="space-y-4 text-gray-300 font-sans leading-relaxed text-sm">
            <p>Nobody knows where Mattelock came from, he just simply appeared one day. He almost didn't seem human, as if he were a corpse walking as a marionette controlled by the powers within the Abyss itself. The way he dressed made him appear as though he were a king from a distant land, but catch him in the right light and you would see his monstrous visage.</p>
            <p>Mattelock insists that he can assist you with your dark miracles, though you remain skeptical.</p>
          </div>
      </div>
    </BaseModal>
  );
};
