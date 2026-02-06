
import React, { useState } from 'react';
import { WorshipperType } from '../types';
import { X, Book, Terminal, PlusCircle } from 'lucide-react';

const RULES_CONTENT = `
# Shattered Dogma: The Liturgy of Numbers

*A definitive guide to the mechanics governing the ascension.*

## I. Game Overview

**Shattered Dogma** is an idle/clicker game where you embody an emerging Eldritch God. Your goal is to amass a cult of followers to fuel your ascension.

The core loop revolves around:
1.  **Manifesting Dark Miracles** (Active Clicking) to attract worshippers.
2.  **Bind Vessels** (Passive Income) to automate the gathering of souls.
3.  **Equipping Focus Gems** to manipulate the type of worshippers you attract.
4.  **Triggering The End of Days** (Prestige) to reset your cult in exchange for **Souls**, which purchase permanent artifacts (Relics).

---

## II. The Flock (Resources)

Your power is measured by **Worshippers**. However, not all souls are equal. The mortal coil is divided into four distinct castes, each serving as a currency for specific upgrades and vessels:

1.  **Indolent (Blue):** The passive biomass. Used for early-game vessels and bulk upgrades.
2.  **Lowly (Grey):** The broken and destitute. The foundation of your hierarchy.
3.  **Worldly (Green):** The wealthy and ambitious. Harder to acquire, used for mid-tier power.
4.  **Zealous (Red):** The fanatical vanguard. Rare and potent, required for apex vessels.

---

## III. Core Mechanics

### 1. Dark Miracles (Active Clicking)
Performing a miracle (tapping) grants Worshippers immediately.
*   **Base Gain:** \`1 + MiracleLevel\`
*   **RNG:** Each click randomly awards *one* specific type of Worshipper based on probability weights.
*   **Focus Gems:** Unlocked via milestones. Equipping a gem increases the probability weight of its favored Worshipper type (Base: 2x), allowing you to target specific resources. This effectiveness can be boosted by Relics.

### 2. The Liturgy of Vessels (Passive Income)
Vessels are permanent anchors in reality that generate Worshippers automatically every second.
*   There are **4 Tiers** of vessels.
*   Vessels cost the specific Worshipper type they belong to (e.g., *Mudge the Slumbering* costs Indolent followers).
*   **Output:** Vessels generate followers of their own type.

### 3. Milestones
Upgrading your Miracle Level hits a "Milestone" at levels 5, 10, 25, 50, 75, 100, etc.
*   **Cost:** Milestones cost significantly more and require a specific type of Worshipper to unlock.
*   **Milestone Multipliers:** The base cost is multiplied based on the soul type required:
    *   **Indolent:** 5x
    *   **Lowly:** 2.5x
    *   **Worldly:** 1.75x
    *   **Zealous:** 1.25x
*   **Reward:** Unlocking a milestone grants access to **Focus Gems**.

---

## IV. The End of Days (Prestige)

**Unlock Threshold:** 1,000,000 Total Worshippers.

Triggering the Apocalypse resets the world to forge a stronger one.
*   **RESET:** Worshippers, Miracle Levels, Vessel Levels, Unlocked Gems.
*   **KEPT:** Souls, Relics, Historical Stats (Max Worshippers).

### Souls
Souls are the prestige currency used to buy Relics.
**Formula:**
$$Souls = \\lfloor 1 + 0.01 \\times \\sqrt[3]{TotalWorshippers - 1,000,000} \\rfloor$$
*(You gain 1 Soul exactly at 1M worshippers, with diminishing returns thereafter.)*

### Relics
Permanent upgrades purchased with Souls.
1.  **Hand of the Void:** Increases Click Power by +5% per level.
2.  **Shepherd's Crook:** Increases Indolent Vessel output by +5% per level.
3.  **Chain of Binding:** Increases Lowly Vessel output by +5% per level.
4.  **Coin of Charon:** Increases Worldly Vessel output by +5% per level.
5.  **Blade of the Martyr:** Increases Zealous Vessel output by +5% per level.
6.  **Crown of Eternity:** Increases ALL Vessel output by +2% per level.
7.  **Hourglass of the Sleeper:** Increases max offline time by +5 minutes per level (Base: 30m).
8.  **Prism of Desire:** Focus Gems are +50% more effective at attracting their target per level.

---

## V. The Mathematics of Ascension

### 1. Miracle Upgrade Cost
$$Cost = \\lfloor 25 \\times 1.15^{CurrentLevel} \\rfloor$$

### 2. Vessel Costs
Vessel costs scale exponentially based on their Tier to create rising difficulty curves.
*   **Tier 1:** $Base \\times 1.15^{Level}$
*   **Tier 2:** $Base \\times 1.1675^{Level}$
*   **Tier 3:** $Base \\times 1.175^{Level}$
*   **Tier 4:** $Base \\times 1.20^{Level}$

### 3. Vessel Output Calculation
$$Output = (BaseOutput \\times Level) \\times (1 + Relic_{Type} \\times 0.05) \\times (1 + Relic_{All} \\times 0.02)$$

### 4. Click Power Calculation
$$Power = (1 + MiracleLevel) \\times (1 + Relic_{Miracle} \\times 0.05)$$

---
*Documented by the Disgraced Scholars of the First Rift.*
`;

interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
  debugAddWorshippers: (type: WorshipperType, amount: number) => void;
}

export const DeveloperModal: React.FC<DeveloperModalProps> = ({ isOpen, onClose, debugAddWorshippers }) => {
  const [viewRules, setViewRules] = useState(false);
  const [inputs, setInputs] = useState<Record<WorshipperType, { mantissa: string, exponent: string }>>({
    [WorshipperType.INDOLENT]: { mantissa: '0', exponent: '0' },
    [WorshipperType.LOWLY]: { mantissa: '0', exponent: '0' },
    [WorshipperType.WORLDLY]: { mantissa: '0', exponent: '0' },
    [WorshipperType.ZEALOUS]: { mantissa: '0', exponent: '0' },
  });

  if (!isOpen) return null;

  const handleInputChange = (type: WorshipperType, field: 'mantissa' | 'exponent', value: string) => {
    setInputs(prev => ({
        ...prev,
        [type]: { ...prev[type], [field]: value }
    }));
  };

  const handleInject = (type: WorshipperType) => {
      const { mantissa, exponent } = inputs[type];
      const m = parseFloat(mantissa);
      const e = parseFloat(exponent);
      if (!isNaN(m) && !isNaN(e)) {
          const amount = m * Math.pow(10, e);
          debugAddWorshippers(type, amount);
          alert(`Injected ${amount.toExponential(2)} ${type}`);
      }
  };

  const parseMarkdown = (text: string) => {
    // Basic parser for specific markdown features used in Rules.md
    if (!text) return '';
    let html = text
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-eldritch-gold mt-4 mb-2">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-eldritch-gold mt-6 mb-3 border-b border-white/10 pb-1">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-eldritch-gold mb-4 text-center">$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong class="text-white">$1</strong>')
        .replace(/\*(.*)\*/gim, '<em class="text-gray-400">$1</em>')
        .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc text-gray-300">$1</li>')
        .replace(/^\d\. (.*$)/gim, '<li class="ml-4 list-decimal text-gray-300">$1</li>')
        .replace(/\$\\$(.*?)\\$\$/gs, '<div class="bg-black/40 p-2 my-2 font-mono text-center text-green-400 text-xs rounded border border-white/5">$1</div>') // Block Math
        .replace(/\$(.*?)\$/gim, '<span class="font-mono text-green-400 text-xs bg-black/30 px-1 rounded">$1</span>') // Inline Math
        .replace(/\n/gim, '<br />')
        .replace(/---/gim, '<hr class="border-white/10 my-4" />');
    return html;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="flex w-full max-w-4xl h-[95vh] sm:h-[90vh] flex-col rounded-xl border border-eldritch-lilac/50 bg-eldritch-dark shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-eldritch-black p-4 border-b border-white/10">
            <div className="flex items-center gap-2 text-eldritch-lilac">
                <Terminal className="h-5 w-5" />
                <h2 className="font-mono font-bold text-sm sm:text-base">Developer Console</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors"><X className="h-5 w-5 text-gray-400" /></button>
        </div>

        {/* Top Tabs */}
        <div className="flex bg-black/30 border-b border-white/5">
            <button 
                onClick={() => setViewRules(false)} 
                className={`flex-1 px-4 py-3 text-sm font-bold transition-all border-b-2 ${!viewRules ? 'bg-eldritch-lilac/10 text-eldritch-lilac border-eldritch-lilac' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
            >
                Resources
            </button>
            <button 
                onClick={() => setViewRules(true)} 
                className={`flex-1 px-4 py-3 text-sm font-bold transition-all border-b-2 ${viewRules ? 'bg-eldritch-lilac/10 text-eldritch-lilac border-eldritch-lilac' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
            >
                Rules
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-eldritch-dark scrollbar-thin scrollbar-thumb-white/10">
            {!viewRules ? (
                <div className="max-w-xl mx-auto">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-2"><PlusCircle className="h-5 w-5 text-green-400" /> Inject Worshippers</h3>
                    <div className="space-y-4 sm:space-y-6">
                        {(Object.keys(inputs) as WorshipperType[]).map(type => (
                            <div key={type} className="bg-black/40 p-4 rounded-lg border border-white/5">
                                <div className="mb-3 font-bold text-gray-300 text-sm sm:text-base border-b border-white/5 pb-1">{type}</div>
                                <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-2">
                                    <div className="flex-1">
                                        <label className="text-[10px] uppercase text-gray-500 block mb-1">Mantissa (0-9)</label>
                                        <input 
                                            type="number" 
                                            min="0" max="9" 
                                            value={inputs[type].mantissa}
                                            onChange={(e) => handleInputChange(type, 'mantissa', e.target.value)}
                                            className="w-full bg-black border border-gray-700 rounded p-2 text-white font-mono focus:border-eldritch-lilac outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="hidden sm:block pb-3 font-mono text-gray-500 text-xs">x 10^</div>
                                    <div className="flex-1">
                                        <label className="text-[10px] uppercase text-gray-500 block mb-1">Exponent</label>
                                        <div className="flex items-center gap-2">
                                            <span className="sm:hidden font-mono text-gray-500 text-xs">x 10^</span>
                                            <input 
                                                type="number" 
                                                value={inputs[type].exponent}
                                                onChange={(e) => handleInputChange(type, 'exponent', e.target.value)}
                                                className="w-full bg-black border border-gray-700 rounded p-2 text-white font-mono focus:border-eldritch-lilac outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleInject(type)}
                                        className="sm:h-[42px] px-6 py-2 sm:py-0 bg-eldritch-lilac/20 hover:bg-eldritch-lilac/30 text-eldritch-lilac border border-eldritch-lilac/50 rounded-lg font-bold text-sm transition-colors active:scale-95"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="mt-2 text-[10px] sm:text-xs text-gray-500 font-mono text-right">
                                    Preview: {(parseFloat(inputs[type].mantissa) || 0) * Math.pow(10, parseFloat(inputs[type].exponent) || 0)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="prose prose-invert max-w-none px-2 sm:px-4">
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                        < Book className="h-5 w-5 text-gray-400" />
                        <span className="font-mono text-xs sm:text-sm text-gray-500">RULES.md</span>
                    </div>
                    <div 
                        className="text-gray-300 font-sans leading-relaxed text-sm sm:text-base"
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(RULES_CONTENT) }}
                    />
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
