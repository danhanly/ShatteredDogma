import React from 'react';

export type IncrementType = 1 | 5 | 10 | 25 | 100 | 'MAX';

interface IncrementSelectorProps {
  current: IncrementType;
  onChange: (value: IncrementType) => void;
}

const OPTIONS: IncrementType[] = [1, 5, 10, 25, 100, 'MAX'];

export const IncrementSelector: React.FC<IncrementSelectorProps> = ({ current, onChange }) => {
  return (
    <div className="flex w-full items-center justify-between gap-1 rounded-lg bg-black/40 p-1 mb-4 border border-white/5">
      {OPTIONS.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`flex-1 rounded px-1 py-1.5 text-xs font-bold transition-all
            ${current === opt 
              ? 'bg-eldritch-gold text-black shadow-[0_0_10px_rgba(197,160,89,0.4)]' 
              : 'text-gray-500 hover:bg-white/10 hover:text-gray-300'
            }`}
        >
          {typeof opt === 'number' ? `x${opt}` : opt}
        </button>
      ))}
    </div>
  );
};