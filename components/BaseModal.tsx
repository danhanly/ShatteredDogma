
import React from 'react';
import { X } from 'lucide-react';

interface BaseModalProps {
  onClose?: () => void;
  children: React.ReactNode;
  containerClassName?: string;
  showCloseButton?: boolean;
  zIndex?: number;
  backdropClassName?: string;
}

export const BaseModal: React.FC<BaseModalProps> = ({ 
  onClose, 
  children, 
  containerClassName = "max-w-md w-full",
  showCloseButton = false,
  zIndex = 50,
  backdropClassName = "bg-black/60 backdrop-blur-sm"
}) => {
  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center p-4 animate-fade-in ${backdropClassName}`}
      style={{ zIndex }}
    >
      <div 
        className={`relative overflow-hidden rounded-xl border-2 bg-eldritch-dark shadow-2xl animate-pop-shake ${containerClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && onClose && (
          <button 
            onClick={onClose} 
            className="absolute right-2 top-2 z-[70] rounded-full bg-black/50 p-2 text-white hover:bg-black hover:text-red-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
};