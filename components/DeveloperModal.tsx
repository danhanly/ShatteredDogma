
import React, { useState } from 'react';
import { WorshipperType, WORSHIPPER_ORDER } from '../types';
import { X, Terminal, PlusCircle, Unlock, Sparkles, BookOpen } from 'lucide-react';
import { BaseModal } from './BaseModal';

declare const katex: any;

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
                      <div className="flex gap-2 col-span-2">
                        <button 
                            onClick={() => debugAddSouls?.(100)} 
                            className="flex-1 bg-indigo-900/20 hover:bg-indigo-900/40 text-indigo-300 border border-indigo-500/30 rounded p-2 text-xs font-bold transition-colors"
                        >
                            +100 Souls
                        </button>
                        <button 
                            onClick={() => debugAddSouls?.(10000)} 
                            className="flex-1 bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-100 border border-indigo-400 rounded p-2 text-xs font-bold transition-colors"
                        >
                            +10,000 Souls
                        </button>
                      </div>
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
              <div className="prose prose-invert max-w-none text-xs sm:text-sm font-sans text-gray-300 space-y-6 pb-8">
                <section>
                  <h1 className="text-xl font-serif text-eldritch-gold border-b border-eldritch-gold/30 pb-2 uppercase tracking-widest text-center">The Liturgy of Ascension</h1>
                  <p className="italic mt-4 text-gray-400 text-center">"In the silent spaces between stars, an ancient hunger stirs. You are the hunger..."</p>
                </section>

                <section>
                  <h2 className="text-lg font-serif text-white border-b border-white/10 pb-1 mb-2 uppercase">I. Active Miracles</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="font-bold text-eldritch-gold mb-1 underline">Upgrade Cost</p>
                      <div className="bg-black/40 p-3 rounded border border-white/5">
                        <MathDisplay block tex="C_n = \lfloor 50 \times 1.5^n \rfloor" />
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-eldritch-gold mb-1 underline">Miracle Power</p>
                      <div className="bg-black/40 p-3 rounded border border-white/5">
                        <MathDisplay block tex="P = (10 + 5n) \times (1 + \text{Bonuses})" />
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-eldritch-gold mb-1 underline">Mattelock (Assistant) Rate</p>
                      <p className="mb-2 text-xs">Base interval for auto-clicks:</p>
                      <div className="bg-black/40 p-3 rounded border border-white/5">
                        <MathDisplay block tex="\text{Interval} = \frac{2000}{2^{L-1}} \text{ ms}" />
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-serif text-white border-b border-white/10 pb-1 mb-2 uppercase">II. The Liturgy of Vessels</h2>
                  <p className="mb-4">Parasites consume lower castes to produce higher ones. Consumption can be halted via <strong>Imprisonment</strong>.</p>
                  <div className="space-y-4">
                    <div>
                      <p className="font-bold text-eldritch-gold mb-1 underline">Vessel Output</p>
                      <div className="bg-black/40 p-3 rounded border border-white/5">
                        <MathDisplay block tex="O = \lfloor \text{BaseOutput} \times L \times M_{milestone} \times \phi \rfloor" />
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-eldritch-gold mb-1 underline">Efficiency Modifier ($\phi$)</p>
                      <p className="mb-2 text-xs">Scales based on available resource supply:</p>
                      <div className="bg-black/40 p-3 rounded border border-white/5">
                        <MathDisplay block tex="\phi = \min(1.0, \frac{\text{Stored}}{\text{Required}})" />
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-serif text-white border-b border-white/10 pb-1 mb-2 uppercase">III. Focus Gems</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong className="text-blue-400">Lapis:</strong> <MathDisplay tex="2\times" /> Click Power.</li>
                    <li><strong className="text-gray-400">Quartz:</strong> <MathDisplay tex="1:1" /> Lowly conversion.</li>
                    <li><strong className="text-green-400">Emerald:</strong> <MathDisplay tex="1:4" /> Worldly conversion.</li>
                    <li><strong className="text-red-500">Ruby:</strong> <MathDisplay tex="1:10" /> Zealous conversion.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-lg font-serif text-white border-b border-white/10 pb-1 mb-2 uppercase">IV. Ascension (Prestige)</h2>
                  <p className="mb-2">Harvesting <strong>Souls</strong> based on Zealous Production rate and Eye of the Abyss bonus (L_harvest):</p>
                  <div className="bg-black/40 p-3 rounded border border-indigo-500/20">
                    <MathDisplay block tex="Souls = \lfloor \text{Zealous}/s \times (1 + L_{\text{harvest}} \times 0.05) \rfloor" />
                  </div>
                  <p className="mt-2 text-xs text-green-400">First Ascension grants a bonus of +9 Souls.</p>
                </section>

                <section className="bg-indigo-950/20 p-4 rounded-lg border border-indigo-500/30">
                  <h2 className="text-lg font-serif text-white border-b border-white/10 pb-1 mb-2 uppercase">V. Permanent Relics</h2>
                  <ul className="list-disc pl-5 space-y-2 text-xs">
                    <li><strong>Chalice of Gluttony:</strong> $-5\%$ consumption / level.</li>
                    <li><strong>Dagger of Betrayal:</strong> $-10s$ gem cooldown / level.</li>
                    <li><strong>Mattelock's Contract:</strong> $+25\%$ Mattelock power / level.</li>
                    <li><strong>Void Catalyst:</strong> Gem consumption $-50\%$.</li>
                    <li><strong>The Frenzied Heart:</strong> Enables quad-speed frenzy.</li>
                    <li><strong>Martyr's Defiance:</strong> Enables periodic 30s caste rebellion (zero consumption).</li>
                    <li><strong>Eye of the Abyss:</strong> Endless $+5\%$ Soul gain / level.</li>
                  </ul>
                </section>
              </div>
            </div>
          )}
      </div>
    </BaseModal>
  );
};
