
import React from 'react';
import { GameState } from '../../types';
import { RELIC_DEFINITIONS } from '../../constants';
import { calculateSoulsEarned, calculateRelicCost } from '../../services/gameService';
import { formatNumber } from '../../utils/format';
import { Skull, Orbit } from 'lucide-react';

interface EndTimesTabProps {
  gameState: GameState;
  eodUnlocked: boolean;
  endOfDaysUrl: string;
  onPrestige: () => void;
  onPurchaseRelic: (relicId: string) => void;
}

export const EndTimesTab: React.FC<EndTimesTabProps> = ({ gameState, eodUnlocked, endOfDaysUrl, onPrestige, onPurchaseRelic }) => {
  if (!eodUnlocked) return null;

  const soulsToEarn = calculateSoulsEarned(gameState.totalAccruedWorshippers);

  const handlePrestigeClick = () => {
      if (window.confirm("Are you sure? This will wipe your worshippers and vessels to grant you Souls based on your total accrued population for this era.")) {
          onPrestige();
      }
  };

  return (
    <div className={`flex flex-col gap-6 animate-in fade-in duration-700`}>
        <div className="relative w-full rounded-xl overflow-hidden border border-indigo-900/50 shadow-[0_0_30px_rgba(49,46,129,0.3)]">
            <div className="aspect-video w-full bg-black relative">
                {endOfDaysUrl ? <img src={endOfDaysUrl} alt="End of Days" className="w-full h-full object-cover opacity-80" /> : <div className="w-full h-full flex items-center justify-center bg-indigo-950"><Skull className="h-16 w-16 text-indigo-500 opacity-50" /></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-eldritch-black via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4"><h2 className="font-serif text-2xl font-bold text-white drop-shadow-md">Herald the End Times</h2></div>
            </div>
            <div className="p-4 bg-eldritch-dark">
                <p className="text-sm text-gray-300 italic mb-4 leading-relaxed">"To begin again is the only way to truly ascend. Burn the world you have built, sacrifice the flock you have gathered, and reap the Souls of the faithful to forge artifacts of eternal power."</p>
                <div className="flex items-center justify-between rounded-lg bg-black/40 p-3 border border-indigo-500/20 mb-4">
                    <span className="text-gray-400 text-sm">Souls to Reap:</span>
                    <div className="flex items-center gap-2"><Orbit className="h-5 w-5 text-indigo-400" /><span className="font-mono text-xl font-bold text-indigo-300">+{formatNumber(soulsToEarn)}</span></div>
                </div>
                <button onClick={handlePrestigeClick} disabled={soulsToEarn <= 0} className={`w-full py-3 rounded-lg font-serif font-bold uppercase tracking-widest transition-all ${soulsToEarn > 0 ? 'bg-gradient-to-r from-indigo-900 to-purple-900 hover:from-indigo-800 hover:to-purple-800 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'bg-gray-900 text-gray-500 cursor-not-allowed'}`}>{soulsToEarn > 0 ? 'Trigger The Apocalypse' : 'Not Enough Souls'}</button>
            </div>
        </div>
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2"><h3 className="font-serif text-lg text-indigo-300">Relic Shop</h3><div className="h-px flex-1 bg-indigo-900/50" /></div>
            {RELIC_DEFINITIONS.map(relic => {
                const level = gameState.relicLevels[relic.id] || 0;
                const cost = calculateRelicCost(relic.id, level);
                const canAfford = gameState.souls >= cost;
                return (
                    <div key={relic.id} className="relative rounded-lg border border-indigo-900/30 bg-black/40 p-3 hover:border-indigo-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div><h4 className="font-serif text-sm font-bold text-indigo-200">{relic.name}</h4><p className="text-xs text-gray-500">{relic.description}</p></div>
                            <div className="bg-indigo-950/50 px-2 py-1 rounded border border-indigo-500/20"><span className="text-[10px] font-bold text-indigo-300">Lvl {level}</span></div>
                        </div>
                        <button onClick={() => onPurchaseRelic(relic.id)} disabled={!canAfford} className={`flex w-full items-center justify-between rounded px-3 py-2 mt-2 transition-all ${canAfford ? 'bg-indigo-900/40 hover:bg-indigo-900/60 border border-indigo-500/30 cursor-pointer' : 'bg-gray-900/50 border border-transparent cursor-not-allowed opacity-50'}`}><span className={`text-xs font-bold ${canAfford ? 'text-indigo-200' : 'text-gray-500'}`}>Purchase</span><div className="flex items-center gap-1"><span className={`font-mono text-sm font-bold ${canAfford ? 'text-white' : 'text-gray-500'}`}>{formatNumber(cost)}</span><Orbit className={`h-3 w-3 ${canAfford ? 'text-indigo-400' : 'text-gray-600'}`} /></div></button>
                    </div>
                );
            })}
        </div>
    </div>
  );
};
