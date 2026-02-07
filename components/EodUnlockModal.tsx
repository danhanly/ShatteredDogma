
import React from 'react';
import { BaseModal } from './BaseModal';

interface EodUnlockModalProps {
  endOfDaysUrl: string;
  onClose: () => void;
}

export const EodUnlockModal: React.FC<EodUnlockModalProps> = ({ endOfDaysUrl, onClose }) => (
  <BaseModal onClose={onClose} zIndex={110} containerClassName="max-w-lg w-full border-indigo-500/30" backdropClassName="bg-black/95 backdrop-blur-xl">
    <img src={endOfDaysUrl} className="h-64 w-full object-cover opacity-60" alt="Apocalypse" />
    <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-t from-eldritch-dark via-transparent to-transparent" />
    <div className="p-8 text-center">
        <h2 className="mb-4 font-serif text-3xl font-bold text-white tracking-widest uppercase">Herald the End Times</h2>
        <p className="mb-8 font-serif text-gray-400 italic">"The population has reached a critical density. The threshold is met. You may now burn this reality to forge a path to eternal ascension."</p>
        <button 
          onClick={onClose}
          className="w-full rounded-lg bg-indigo-900 py-4 font-serif font-bold uppercase tracking-widest text-white hover:bg-indigo-800 transition-colors"
        >
          Ascend Further
        </button>
    </div>
  </BaseModal>
);
