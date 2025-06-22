// Storage utilities for widget state persistence

const STORAGE_KEYS = {
  WIDGET_STATE: 'ai-chatbot-widget-state',
  WIDGET_PREFERENCES: 'ai-chatbot-widget-preferences',
} as const;

export interface WidgetPreferences {
  lastState: 'normal' | 'minimized'; // Never save fullscreen state
  rememberState: boolean;
  lastPosition?: {
    x: number;
    y: number;
  };
}

// Safe storage operations with error handling
export const storage = {
  // Get widget state from session storage
  getWidgetState(): 'normal' | 'fullscreen' | 'minimized' | null {
    try {
      const state = sessionStorage.getItem(STORAGE_KEYS.WIDGET_STATE);
      // Only allow 'normal' or 'minimized' - never restore to fullscreen
      if (state && ['normal', 'minimized'].includes(state)) {
        return state as 'normal' | 'minimized';
      }
    } catch (error) {
      console.warn('Failed to read widget state from storage:', error);
    }
    return null;
  },

  // Save widget state to session storage
  setWidgetState(state: 'normal' | 'fullscreen' | 'minimized'): void {
    try {
      // Don't save fullscreen state - always save as normal instead
      const stateToSave = state === 'fullscreen' ? 'normal' : state;
      sessionStorage.setItem(STORAGE_KEYS.WIDGET_STATE, stateToSave);
    } catch (error) {
      console.warn('Failed to save widget state to storage:', error);
    }
  },

  // Get widget preferences from local storage
  getWidgetPreferences(): WidgetPreferences | null {
    try {
      const preferences = localStorage.getItem(STORAGE_KEYS.WIDGET_PREFERENCES);
      if (preferences) {
        return JSON.parse(preferences);
      }
    } catch (error) {
      console.warn('Failed to read widget preferences from storage:', error);
    }
    return null;
  },

  // Save widget preferences to local storage
  setWidgetPreferences(preferences: WidgetPreferences): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WIDGET_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save widget preferences to storage:', error);
    }
  },

  // Clear all widget storage
  clearWidgetStorage(): void {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.WIDGET_STATE);
      localStorage.removeItem(STORAGE_KEYS.WIDGET_PREFERENCES);
    } catch (error) {
      console.warn('Failed to clear widget storage:', error);
    }
  },

  // Check if storage is available
  isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
};

// Convenience functions for backward compatibility
export const getWidgetPreferences = storage.getWidgetPreferences;
export const saveWidgetPreferences = storage.setWidgetPreferences;

export default storage; 