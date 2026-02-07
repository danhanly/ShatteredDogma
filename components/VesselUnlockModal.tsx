
import React, { useState } from 'react';
import { Sparkles, ArrowRight, User, Ghost } from 'lucide-react';
import { BaseModal } from './BaseModal';

interface VesselUnlockModalProps {
  zealotVesselUrl: string;
  mudgeUrl: string;
  onClose: () => void;
}

export const VesselUnlockModal: React.FC<VesselUnlockModalProps> = ({ zealotVesselUrl, mudgeUrl, onClose }) => {
  const [step, setStep] = useState(1);

  return (
    <BaseModal onClose={onClose} zIndex={110} containerClassName="max-w-lg w-full" backdropClassName="bg-black/95 backdrop-blur-xl">
      <div className="relative h-64 w-full bg-black overflow-hidden">
           {step === 1 ? (
               <img src={zealotVesselUrl} className="h-full w-full object-cover opacity-60" alt="Apex Vessel" />
           ) : (
               mudgeUrl ? (
                  <img src={mudgeUrl} className="h-full w-full object-cover opacity-60" alt="Mudge the Slumbering" />
               ) : (
                  <div className="h-full w-full bg-gradient-to-b from-blue-950 to-eldritch-dark flex items-center justify-center">
                      <Ghost className="text-blue-500 h-32 w-32 opacity-20 absolute" />
                  </div>
               )
           )}
           <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-t from-eldritch-dark via-transparent to-transparent" />
      </div>

      <div className="p-8 text-center relative z-10 -mt-10">
          {step === 1 ? (
              <>
                  <div className="flex justify-center mb-4"><Sparkles className="h-8 w-8 text-eldritch-gold animate-pulse" /></div>
                  <h2 className="mb-4 font-serif text-3xl font-bold text-white tracking-widest uppercase">The Liturgy of Vessels</h2>
                  <p className="mb-6 font-serif text-gray-400 italic">"Your influence crystallizes. No longer are you merely a passive observer. You have gathered enough hollow spirits to begin inhabiting permanent vessels."</p>
                  <p className="mb-8 font-serif text-eldritch-gold/70 text-sm">
                      These vessels proselytise to the masses with a voice that is not theirs, attracting worshippers across the city without the need for your direct miracle manifestations.
                  </p>
                  <button 
                      onClick={() => setStep(2)}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-eldritch-gold/20 border border-eldritch-gold/40 py-4 font-serif font-bold uppercase tracking-widest text-eldritch-gold hover:bg-eldritch-gold/30 transition-colors"
                  >
                      Next <ArrowRight className="h-4 w-4" />
                  </button>
              </>
          ) : (
              <>
                   {/* Preview Mudge Card */}
                   <div className="mx-auto mb-6 max-w-[280px] rounded-xl border border-blue-900 bg-eldritch-dark p-3 text-left shadow-lg opacity-80 scale-90 sm:scale-100">
                      <div className="flex items-center gap-3">
                          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 border-blue-900 bg-black overflow-hidden">
                              {mudgeUrl ? <img src={mudgeUrl} alt="Mudge" className="h-full w-full object-cover object-top scale-125" /> : <User className="h-8 w-8 text-blue-900" />}
                          </div>
                          <div className="flex-1 min-w-0">
                              <h4 className="font-serif text-sm font-bold text-blue-400">Mudge the Slumbering</h4>
                              <p className="text-xs text-gray-500">The Drifter</p>
                          </div>
                      </div>
                  </div>

                  <p className="mb-8 font-serif text-gray-400 italic">"Unlock the first vessel, Mudge the Slumbering, to allow him to begin his work at converting the Indolent to your cause."</p>
                  
                  <button 
                      onClick={onClose}
                      className="w-full rounded-lg bg-eldritch-gold/20 border border-eldritch-gold/40 py-4 font-serif font-bold uppercase tracking-widest text-eldritch-gold hover:bg-eldritch-gold/30 transition-colors"
                  >
                      Bind the Vessels
                  </button>
              </>
          )}
      </div>
    </BaseModal>
  );
};
