import React, { useState } from 'react';
import { WorshipperType, WORSHIPPER_ORDER } from '../types';
import { X, Terminal, PlusCircle, Unlock, Sparkles, BookOpen } from 'lucide-react';
import { BaseModal } from './BaseModal';

// @ts-ignore
import katex from 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.mjs';

interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
  debugAddWorshippers: (type: WorshipperType, amount: number) => void;
  debugUnlockFeature?: (feature: 'GEMS' | 'VESSELS' | 'END_TIMES' | 'ASSISTANT') => void;
  debugAddSouls?: (amount: number) => void;
}

const MathDisplay: React.FC<{ tex: string; block?: boolean }> = ({ tex, block }) => {
  try {
    const html = katex.renderToString(tex, {
      displayMode: block,
      throwOnError: false,
    });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  } catch (e) {
    return <span>{tex}</span>;
  }
};

export const DeveloperModal: React.FC<DeveloperModalProps> = ({ 
  isOpen, 
  onClose, 
  debugAddWorshippers,
  debugUnlockFeature,
  debugAddSouls
}) => {
  const [amount, setAmount] = useState('1000');
  const [showRules, setShowRules] = useState(false);

  if (!isOpen) return null;

  return (
    <BaseModal onClose={onClose} zIndex={60} containerClassName="max-w-2xl w-full border-eldritch-lilac/50">
      <div className="flex items-center justify-between bg-eldritch-black p-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-eldritch-lilac"><Terminal className="h-5 w-5" /><h2 className="font-mono font-bold text-sm">Developer Console</h2></div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded"><X className="h-5 w-5 text-gray-400" /></button>
      </div>
      <div className="p-6 space-y-6 max-h-[80dvh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          {!showRules ? (
            <>
              <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><PlusCircle className="h-5 w-5 text-green-400" /> Quick Inject</h3>
                  <div className="mb-4">
                      <label className="text-xs text-gray-500 block mb-1">Amount</label>
                      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-black border border-gray-700 rounded p-2 text-white font-mono" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                      {WORSHIPPER_ORDER.map(type => (
                          <button key={type} onClick={() => debugAddWorshippers(type, parseFloat(amount))} className="bg-eldritch-lilac/10 hover:bg-eldritch-lilac/20 text-eldritch-lilac border border-eldritch-lilac/30 rounded p-2 text-xs font-bold transition-colors">
                              + {type}
                          </button>
                      ))}
                      <button 
                        onClick={() => debugAddSouls?.(100)} 
                        className="bg-indigo-900/20 hover:bg-indigo-900/40 text-indigo-300 border border-indigo-500/30 rounded p-2 text-xs font-bold transition-colors"
                      >
                        +100 Souls
                      </button>
                  </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5 text-indigo-400" /> Advanced Controls</h3>
                  <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => debugUnlockFeature?.('GEMS')} 
                        className="flex items-center justify-center gap-2 bg-blue-900/20 hover:bg-blue-900/40 text-blue-300 border border-blue-500/30 rounded p-2 text-xs font-bold transition-colors"
                      >
                        <Unlock className="h-3 w-3" /> Gems
                      </button>
                      <button 
                        onClick={() => debugUnlockFeature?.('VESSELS')} 
                        className="flex items-center justify-center gap-2 bg-amber-900/20 hover:bg-amber-900/40 text-amber-300 border border-amber-500/30 rounded p-2 text-xs font-bold transition-colors"
                      >
                        <Unlock className="h-3 w-3" /> Vessels
                      </button>
                      <button 
                        onClick={() => debugUnlockFeature?.('END_TIMES')} 
                        className="flex items-center justify-center gap-2 bg-red-900/20 hover:bg-red-900/40 text-red-300 border border-red-500/30 rounded p-2 text-xs font-bold transition-colors"
                      >
                        <Unlock className="h-3 w-3" /> End Times
                      </button>
                      <button 
                        onClick={() => debugUnlockFeature?.('ASSISTANT')} 
                        className="flex items-center justify-center gap-2 bg-purple-900/20 hover:bg-purple-900/40 text-purple-300 border border-purple-500/30 rounded p-2 text-xs font-bold transition-colors"
                      >
                        <Unlock className="h-3 w-3" /> Assistant
                      </button>
                  </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                  <button 
                    onClick={() => setShowRules(true)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-gray-900 border border-gray-700 text-gray-400 hover:text-white transition-colors"
                  >
                      <BookOpen className="h-4 w-4" /> View Rules & Formulas
                  </button>
              </div>
            </>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <button 
                onClick={() => setShowRules(false)}
                className="mb-4 text-xs text-eldritch-lilac hover:underline flex items-center gap-1"
              >
                ← Back to Controls
              </button>
              <div className="prose prose-invert max-w-none text-xs sm:text-sm font-sans text-gray-300 space-y-6">
                <section>
                  <h1 className="text-xl font-serif text-eldritch-gold border-b border-eldritch-gold/30 pb-2">Shattered Dogma: The Liturgy of Numbers</h1>
                  <p className="italic mt-2">A definitive guide to the mechanics governing the ascension.</p>
                </section>

                <section>
                  <h2 className="text-lg font-serif text-white border-b border-white/10 pb-1 mb-2">I. Game Overview</h2>
                  <p><strong>Shattered Dogma</strong> is a dark fantasy idle/clicker game where you embody an emerging Eldritch God. Your goal is to amass a cult of worshippers to fuel your eventual ascension through the End of Days.</p>
                </section>

                <section>
                  <h2 className="text-lg font-serif text-white border-b border-white/10 pb-1 mb-2">II. The Flock (Resources)</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong className="text-blue-400">Indolent:</strong> The passive biomass. Required for initial momentum.</li>
                    <li><strong className="text-gray-400">Lowly:</strong> The broken and destitute. Hardworking foundation.</li>
                    <li><strong className="text-green-400">Worldly:</strong> The wealthy and ambitious. Mid-tier influence.</li>
                    <li><strong className="text-red-500">Zealous:</strong> The fanatical vanguard. Potent rituals.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-lg font-serif text-white border-b border-white/10 pb-1 mb-2">III. Core Mechanics</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-eldritch-gold">1. Dark Miracles</h3>
                      <p>Manifesting miracles attracts Indolent worshippers.</p>
                      <ul className="list-disc pl-5">
                        <li>Base Power: <code className="bg-black/50 px-1 rounded">1 + MiracleLevel</code> (modified by multipliers).</li>
                        <li>Rounding: First bulk purchase rounds level up to next multiple of increment.</li>
                        <li>Soul Bonus: Each Soul owned provides +1% bonus to click power.</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-eldritch-gold">2. The Liturgy of Vessels</h3>
                      <p>Vessels generate Worshippers automatically per second.</p>
                      <ul className="list-disc pl-5">
                        <li>Lowly consume Indolent (3/s per output).</li>
                        <li>Worldly consume Lowly (5/s per output).</li>
                        <li>Zealous consume Indolent, Lowly, and Worldly (3/s each per output).</li>
                        <li>Starvation: Production halts if resources are exhausted.</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-serif text-white border-b border-white/10 pb-1 mb-2">IV. The End of Days (Prestige)</h2>
                  <p>Unlock Threshold: 100,000 Zealous Worshippers.</p>
                  <p>Triggering reset preserves Souls and Max Worshipper stats.</p>
                  <div className="bg-black/40 p-3 rounded font-mono text-center my-4 border border-indigo-500/20">
                    <MathDisplay block tex="Souls = \lfloor 10 + 0.01 \times \sqrt[3]{MaxZealous - 100,000} \rfloor" />
                  </div>
                  <p>Each Soul provides a flat +1% bonus to all acquisitions.</p>
                </section>

                <section>
                  <h2 className="text-lg font-serif text-white border-b border-white/10 pb-1 mb-2">V. Mathematics of Ascension</h2>
                  <ul className="space-y-4">
                    <li>
                      <p className="font-bold">Upgrade Cost:</p>
                      <div className="bg-black/40 p-3 rounded font-mono text-center my-2 border border-white/5">
                        <MathDisplay block tex="Cost = \lfloor 25 \times 1.15^{CurrentLevel-1} \rfloor" />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">*Note: Costs double every 10th level.*</p>
                    </li>
                    <li>
                      <p className="font-bold">Output Calculation:</p>
                      <div className="bg-black/40 p-3 rounded font-mono text-center my-2 border border-white/5">
                        <MathDisplay block tex="Output = (BaseOutput \times Level) \times (1 + Souls \times 0.01)" />
                      </div>
                    </li>
                    <li>
                      <p className="font-bold">Click Power:</p>
                      <div className="bg-black/40 p-3 rounded font-mono text-center my-2 border border-white/5">
                        <MathDisplay block tex="Power = (Level \times 1.15^{\lfloor Level/10 \rfloor}) \times (1 + Souls \times 0.01)" />
                      </div>
                    </li>
                  </ul>
                </section>
              </div>
            </div>
          )}
      </div>
    </BaseModal>
  );
};
