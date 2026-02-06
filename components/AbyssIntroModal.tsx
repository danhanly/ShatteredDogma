
import React, { useState } from 'react';
import { ArrowDown, Ghost, Frown, Crown, Sword, Eye, AlertTriangle, ArrowRight } from 'lucide-react';
import { WorshipperType } from '../types';

interface AbyssIntroModalProps {
  onClose: () => void;
}

const Box: React.FC<{ type: WorshipperType, icon: any, color: string }> = ({ type, icon: Icon, color }) => (
    <div className={`relative flex w-20 sm:w-[100px] flex-col items-center justify-center gap-1 rounded-lg border bg-black/60 p-2 backdrop-blur-sm ${color}`}>
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        <span className="font-serif text-[10px] sm:text-xs">{type}</span>
    </div>
);

export const AbyssIntroModal: React.FC<AbyssIntroModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-purple-900/50 bg-eldritch-dark shadow-[0_0_100px_rgba(88,28,135,0.3)]">
        
        <div className="p-6 sm:p-8 text-center">
            {step === 1 ? (
                <>
                    <div className="flex justify-center mb-4"><Eye className="h-10 w-10 text-purple-500 animate-pulse-slow" /></div>
                    <h2 className="mb-4 font-serif text-xl sm:text-2xl font-bold text-white tracking-widest uppercase">Influence of the Abyss</h2>
                    <p className="mb-6 font-serif text-sm text-gray-400 italic leading-relaxed">
                        "You have reached a depth of fanaticism that allows you to reshape the soul itself. By destroying the vessels that bind them, you can force the evolution of your flock."
                    </p>

                    {/* Mobile-optimized vertical stack */}
                    <div className="flex flex-col items-center gap-2 mb-8 scale-90 sm:scale-100">
                        <Box type={WorshipperType.INDOLENT} icon={Ghost} color="border-blue-900 text-blue-400" />
                        <ArrowDown className="h-4 w-4 text-gray-600" />
                        <Box type={WorshipperType.LOWLY} icon={Frown} color="border-gray-700 text-gray-400" />
                        <ArrowDown className="h-4 w-4 text-gray-600" />
                        <Box type={WorshipperType.WORLDLY} icon={Crown} color="border-green-900 text-green-400" />
                        <ArrowDown className="h-4 w-4 text-gray-600" />
                        <Box type={WorshipperType.ZEALOUS} icon={Sword} color="border-red-900 text-red-500" />
                    </div>
                    
                    <p className="mb-8 font-serif text-xs text-gray-500">
                        Sacrifice an entire tier to promote 50% of them to the next. The vessels binding them will be shattered, but the sudden influx of higher power may be worth the cost.
                    </p>

                    <button 
                        onClick={() => setStep(2)}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-900/30 border border-purple-500/30 py-4 font-serif font-bold uppercase tracking-widest text-purple-300 hover:bg-purple-900/50 hover:text-purple-200 transition-colors shadow-[0_0_20px_rgba(147,51,234,0.1)]"
                    >
                        Understand the Cost <ArrowRight className="h-4 w-4" />
                    </button>
                </>
            ) : (
                <>
                    <div className="flex justify-center mb-4"><AlertTriangle className="h-10 w-10 text-red-500" /></div>
                    <h2 className="mb-4 font-serif text-xl sm:text-2xl font-bold text-red-500 tracking-widest uppercase">The Heavy Price</h2>
                    
                    <div className="bg-black/40 rounded-lg p-4 border border-red-900/30 mb-6 text-left space-y-4">
                        <div className="flex items-start gap-3">
                            <span className="text-red-500 font-bold mt-1">1.</span>
                            <p className="text-sm text-gray-300">
                                <strong className="text-red-400">Total Devastation:</strong> Influencing a tier does not merely damage its vessels; it <span className="text-white font-bold">obliterates</span> them. All Vessel levels of that type will return to <span className="text-white font-bold">0</span>.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-red-500 font-bold mt-1">2.</span>
                            <p className="text-sm text-gray-300">
                                <strong className="text-red-400">Cumulative Decay:</strong> The Abyss remembers. Each time you Influence a specific worshipper type, the cost to upgrade their vessels increases permanently by <span className="text-white font-bold">+2%</span>.
                            </p>
                        </div>
                    </div>

                    <p className="mb-8 font-serif text-xs text-gray-500 italic">
                        "Power earned through sacrifice is volatile. Abuse the Abyss, and you will find your followers harder to tether to reality."
                    </p>

                    <button 
                        onClick={onClose}
                        className="w-full rounded-lg bg-red-900/30 border border-red-500/30 py-4 font-serif font-bold uppercase tracking-widest text-red-300 hover:bg-red-900/50 hover:text-red-200 transition-colors shadow-[0_0_20px_rgba(220,38,38,0.1)]"
                    >
                        Peer into the Abyss
                    </button>
                </>
            )}
        </div>
      </div>
    </div>
  );
};
