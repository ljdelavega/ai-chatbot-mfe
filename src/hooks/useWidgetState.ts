import { useState, useCallback, useEffect, useRef } from 'react';
import { getWidgetPreferences, saveWidgetPreferences } from '../lib/storage';

export type WidgetState = 'normal' | 'fullscreen' | 'minimized';

export interface UseWidgetStateOptions {
  /** Initial widget state */
  initialState?: WidgetState;
  /** Whether to persist state preferences */
  enablePersistence?: boolean;
  /** Callback when state changes */
  onStateChange?: (state: WidgetState, previousState: WidgetState) => void;
}

export interface UseWidgetStateReturn {
  state: WidgetState;
  previousState: WidgetState;
  isNormal: boolean;
  isFullscreen: boolean;
  isMinimized: boolean;
  setNormal: () => void;
  setFullscreen: () => void;
  setMinimized: () => void;
  toggleFullscreen: () => void;
  toggleMinimized: () => void;
  restoreFromMinimized: () => void;
}

export function useWidgetState({
  initialState = 'normal',
  enablePersistence = true,
  onStateChange
}: UseWidgetStateOptions = {}): UseWidgetStateReturn {
  // Load initial state from storage if persistence is enabled
  const getInitialState = useCallback((): WidgetState => {
    if (enablePersistence) {
      const preferences = getWidgetPreferences();
      return preferences?.lastState || initialState;
    }
    return initialState;
  }, [initialState, enablePersistence]);

  const [state, setState] = useState<WidgetState>(getInitialState);
  const [previousState, setPreviousState] = useState<WidgetState>('normal');
  
  // Keep track of the state before minimizing for restoration
  const stateBeforeMinimizeRef = useRef<WidgetState>('normal');

  const changeState = useCallback((newState: WidgetState) => {
    setState(prevState => {
      if (prevState === newState) return prevState;

      // Store previous state for restoration
      setPreviousState(prevState);
      
      // If we're minimizing, remember the current state for restoration
      if (newState === 'minimized' && prevState !== 'minimized') {
        stateBeforeMinimizeRef.current = prevState;
      }

      // Save to storage if persistence is enabled
      if (enablePersistence) {
        saveWidgetPreferences({
          lastState: newState === 'fullscreen' ? 'normal' : newState, // Don't save fullscreen state
          rememberState: true
        });
      }

      // Call state change callback
      onStateChange?.(newState, prevState);

      return newState;
    });
  }, [enablePersistence, onStateChange]);

  const setNormal = useCallback(() => {
    changeState('normal');
  }, [changeState]);

  const setFullscreen = useCallback(() => {
    changeState('fullscreen');
  }, [changeState]);

  const setMinimized = useCallback(() => {
    changeState('minimized');
  }, [changeState]);

  const toggleFullscreen = useCallback(() => {
    if (state === 'fullscreen') {
      changeState('normal');
    } else if (state === 'normal') {
      changeState('fullscreen');
    }
    // If minimized, do nothing (can't toggle fullscreen from minimized)
  }, [state, changeState]);

  const toggleMinimized = useCallback(() => {
    if (state === 'minimized') {
      // Restore to the state before minimizing
      changeState(stateBeforeMinimizeRef.current);
    } else {
      changeState('minimized');
    }
  }, [state, changeState]);

  const restoreFromMinimized = useCallback(() => {
    if (state === 'minimized') {
      changeState(stateBeforeMinimizeRef.current);
    }
  }, [state, changeState]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key to exit fullscreen
      if (event.key === 'Escape' && state === 'fullscreen') {
        event.preventDefault();
        setNormal();
      }

      // Ctrl/Cmd + M to toggle minimize (only if not in input field)
      if (
        (event.ctrlKey || event.metaKey) && 
        event.key === 'm' && 
        !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName)
      ) {
        event.preventDefault();
        toggleMinimized();
      }

      // Ctrl/Cmd + F to toggle fullscreen (only if not in input field)
      if (
        (event.ctrlKey || event.metaKey) && 
        event.key === 'f' && 
        !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName) &&
        state !== 'minimized'
      ) {
        event.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state, setNormal, toggleMinimized, toggleFullscreen]);

  // Handle browser resize - exit fullscreen if window becomes too small
  useEffect(() => {
    const handleResize = () => {
      if (state === 'fullscreen' && window.innerWidth < 768) {
        setNormal();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [state, setNormal]);

  return {
    state,
    previousState,
    isNormal: state === 'normal',
    isFullscreen: state === 'fullscreen',
    isMinimized: state === 'minimized',
    setNormal,
    setFullscreen,
    setMinimized,
    toggleFullscreen,
    toggleMinimized,
    restoreFromMinimized,
  };
} 