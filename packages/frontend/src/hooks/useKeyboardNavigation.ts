import { useEffect } from 'react';
import { Variant } from '../models/chess.models';

interface UseKeyboardNavigationProps {
  next: () => void;
  nextFollowingVariant: () => void;
  prev: () => void;
  hasNext: () => boolean;
  hasPrev: () => boolean;
  selectedVariant: Variant | null;
}

export const useKeyboardNavigation = ({
  next,
  nextFollowingVariant,
  prev,
  hasNext,
  hasPrev,
  selectedVariant,
}: UseKeyboardNavigationProps) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          if (hasPrev()) prev();
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (hasNext()) {
            if (selectedVariant) {
              nextFollowingVariant();
            } else {
              next();
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [next, nextFollowingVariant, prev, hasNext, hasPrev, selectedVariant]);
};
