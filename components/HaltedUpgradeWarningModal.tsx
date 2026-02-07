
import React from 'react';
import { BaseModal } from './BaseModal';
import { AlertTriangle, ZapOff } from 'lucide-react';

interface HaltedUpgradeWarningModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  vesselName: string;
}

export const HaltedUpgradeWarningModal: React.FC<HaltedUpgradeWarningModalProps> = ({ onConfirm, onCancel, vesselName }) => {
  return (
    <BaseModal onClose={onCancel} zIndex={150} containerClassName="max-w-md w-full border-eldritch-crimson shadow-[0_0_50px_rgba(255,0,0,0.4)]" backdropClassName="bg-black/90 backdrop-blur-md">
      <div className="p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <ZapOff className="h-16 w-16 text-red-600 animate-pulse" />
            <AlertTriangle className="absolute -bottom-2 -right-2 h-8 w-8 text-red-400" />
          </div>
        </div>
        
        <h2 className="mb-4 font-serif text-2xl font-bold text-white uppercase tracking-widest">A Halted Vessel</h2>
        <div className="space-y-4 font-serif text-gray-300 text-sm leading-relaxed mb-8">
          <p className="italic">"You seek to enhance {vesselName}, yet its essence is currently dormant. Your cult does not have enough worshippers of the necessary type to sustain its dark work."</p>
          <p className="text-red-400/80">While you may upgrade this vessel, it will remain inert until its starvation is corrected. Do you wish to proceed with the ritual anyway?</p>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onConfirm}
            className="w-full rounded-lg bg-red-900/40 border border-red-700 py-3 font-serif font-bold uppercase tracking-widest text-white hover:bg-red-900/60 transition-all active:scale-95"
          >
            Enhance Anyway
          </button>
          <button 
            onClick={onCancel}
            className="w-full rounded-lg bg-gray-900 border border-gray-700 py-3 font-serif font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-all active:scale-95"
          >
            Halt the Ritual
          </button>
        </div>
      </div>
    </BaseModal>
  );
};