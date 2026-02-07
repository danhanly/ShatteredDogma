
import React, { useState } from 'react';
import { GameState } from '../../types';
import { calculateSoulsEarned } from '../../services/gameService';
import { formatNumber } from '../../utils/format';
import { Skull, Orbit, AlertTriangle, Construction } from 'lucide-react';

interface EndTimesTabProps {
  gameState: GameState;
  eodUnlocked: boolean;
  endOfDaysUrl: string;
  onPrestige: () => void;
}

export const EndTimesTab: React.FC<EndTimesTabProps> = ({ gameState, eodUnlocked, endOfDaysUrl, onPrestige }) => {
  const [confirmStep, setConfirmStep] = useState(0);

  if (!eodUnlocked) return null;
  const soulsToEarn = calculateSoulsEarned(gameState);

  const handlePrestigeClick = () => {
    if (confirmStep === 0) {
      setConfirmStep(1);
    } else {
      onPrestige();
      setConfirmStep(0);
    }
  };

  return (
    <div className="flex flex-col gap-6">
        <div className="relative w-full rounded-xl overflow-hidden border border-indigo-900/50 shadow-[0_0_30px_rgba(49,46,129,0.3)]">
            <div className="aspect-video w-full bg-black relative">
                {endOfDaysUrl ? <img src={endOfDaysUrl} alt="End of Days" className="w-full h-full object-cover opacity-80" /> : <div className="w-full h-full flex items-center justify-center bg-indigo-950"><Skull className="h-16 w-16 text-indigo-500 opacity-50" /></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-eldritch-black via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4"><h2 className="font-serif text-2xl font-bold text-white drop-shadow-md">Herald the End Times</h2></div>
            </div>
            
            <div className="p-4 bg-eldritch-dark">
                {/* Developmental Warning Box */}
                <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                    <Construction className="h-5 w-5 shrink-0 text-amber-500" />
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Divine Development</p>
                        <p className="text-[11px] text-amber-200/80 leading-relaxed">System in active development, shortly there will be many interesting ways for you to spend your Souls. Currently, each soul provides a permanent +1% bonus to all worshipper acquisitions.</p>
                    </div>
                </div>

                <p className="text-sm text-gray-300 italic mb-4 leading-relaxed">"To begin again is the only way to truly ascend. Sacrifice the flock you have gathered to forge a path to eternal ascension."</p>
                <div className="flex items-center justify-between rounded-lg bg-black/40 p-3 border border-indigo-500/20 mb-4">
                    <span className="text-gray-400 text-sm">Souls to Harvest:</span>
                    <div className="flex items-center gap-2"><Orbit className="h-5 w-5 text-indigo-400" /><span className="font-mono text-xl font-bold text-indigo-300">+{formatNumber(soulsToEarn)}</span></div>
                </div>
                
                <button 
                  onClick={handlePrestigeClick} 
                  disabled={soulsToEarn <= 0} 
                  className={`w-full py-4 rounded-lg font-serif font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2
                    ${soulsToEarn > 0 
                      ? (confirmStep === 1 
                        ? 'bg-red-700 text-white animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.5)] scale-[1.02]' 
                        : 'bg-gradient-to-r from-indigo-900 to-purple-900 hover:from-indigo-800 hover:to-purple-800 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]') 
                      : 'bg-gray-900 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {confirmStep === 1 ? (
                    <>
                      <AlertTriangle className="h-5 w-5" /> Confirm Apocalypse?
                    </>
                  ) : (
                    soulsToEarn > 0 ? 'Trigger The Apocalypse' : 'Not Enough Souls'
                  )}
                </button>
                
                {confirmStep === 1 && (
                  <button 
                    onClick={() => setConfirmStep(0)}
                    className="w-full mt-2 py-2 text-xs font-serif text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Wait, not yet...
                  </button>
                )}
            </div>
        </div>
        <div className="p-4 text-center text-gray-500 text-xs italic">
          "Relic manifestation is currently dormant. Souls serve as a measure of your divine presence across eras."
        </div>
    </div>
  );
};
