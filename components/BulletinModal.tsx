
import React from 'react';
import { Bulletin } from '../types';
import { formatNumber } from '../utils/format';
import { Newspaper } from 'lucide-react';

interface BulletinModalProps {
  bulletin: Bulletin;
  onAccept: () => void;
}

export const BulletinModal: React.FC<BulletinModalProps> = ({ bulletin, onAccept }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="relative w-full max-w-lg overflow-hidden rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] rotate-1 hover:rotate-0 transition-transform duration-300">
        
        {/* Paper Texture Background */}
        <div className="absolute inset-0 bg-[#f0e6d2] z-0" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`,
            filter: 'contrast(120%) sepia(30%)'
        }} />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col items-center text-eldritch-black">
            
            {/* Masthead */}
            <div className="w-full border-b-2 border-black pb-2 mb-2 text-center">
                <div className="font-gothic text-4xl sm:text-5xl font-black uppercase tracking-tight leading-none mb-1">The Eldritch Times</div>
                <div className="flex justify-between items-center text-[10px] sm:text-xs font-serif font-bold uppercase border-t border-black pt-1">
                    <span>Vol. {bulletin.volume}</span>
                    <span>{bulletin.date}</span>
                    <span>Price: 1 Soul</span>
                </div>
            </div>

            {/* Headline */}
            <h2 className="font-serif font-black text-2xl sm:text-3xl uppercase text-center leading-tight mb-4 mt-2">
                {bulletin.title}
            </h2>

            {/* Body with decorative initial cap */}
            <div className="w-full font-serif text-sm sm:text-base leading-relaxed text-justify mb-6 border-b border-black pb-6 columns-1 sm:columns-2 gap-6">
               <p className="first-letter:text-4xl first-letter:font-black first-letter:float-left first-letter:mr-2 first-letter:mt-[-6px]">
                   {bulletin.body}
               </p>
               <p className="mt-4 sm:mt-0 italic text-xs text-gray-600">
                   Witnesses claim the event was unforeseen, yet highly profitable for those with the will to seize it. Local authorities advise staying indoors, but the flock continues to grow.
               </p>
            </div>

            {/* Reward Section */}
            <div className="w-full bg-black/5 border-2 border-black p-4 flex flex-col items-center gap-2 mb-2">
                <div className="font-sans text-xs font-bold uppercase tracking-widest text-gray-700">Recruitment Opportunity</div>
                <div className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5" />
                    <span className="font-mono text-xl sm:text-2xl font-black">+{formatNumber(bulletin.rewardAmount)} {bulletin.rewardType}</span>
                </div>
            </div>

            <button 
                onClick={onAccept}
                className="mt-4 font-serif font-bold text-lg uppercase underline decoration-2 underline-offset-4 hover:text-red-700 transition-colors"
            >
                Accept Offer
            </button>

        </div>
      </div>
    </div>
  );
};
