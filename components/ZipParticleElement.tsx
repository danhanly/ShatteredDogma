
import React, { useState, useEffect } from 'react';

export interface ZipParticle {
    id: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    color: string;
}

export const ZipParticleElement: React.FC<{ particle: ZipParticle }> = ({ particle }) => {
    const [style, setStyle] = useState<React.CSSProperties>({
        left: particle.startX,
        top: particle.startY,
        opacity: 1,
        transform: 'scale(1)',
    });

    useEffect(() => {
        // Trigger the transition immediately after mount
        const timer = requestAnimationFrame(() => {
            setStyle({
                left: particle.endX,
                top: particle.endY,
                opacity: 0,
                transform: 'scale(0.5)',
                transition: 'all 1.0s cubic-bezier(0.2, 0, 0.2, 1)',
            });
        });
        return () => cancelAnimationFrame(timer);
    }, [particle]);

    return (
        <div 
            className={`pointer-events-none absolute z-30 h-4 w-4 rounded-full ${particle.color}`}
            style={style}
        />
    );
};
