import { useState, useEffect, useCallback } from 'react';
import type { WidgetConfig } from '../lib/types';

export interface UseWidgetConfigOptions {
  /** The mount element to read configuration from */
  mountElement?: HTMLElement | null;
  /** Default configuration values */
  defaults?: Partial<WidgetConfig>;
}

export interface UseWidgetConfigReturn {
  config: WidgetConfig | null;
  isValid: boolean;
  errors: string[];
  isLoading: boolean;
}

const DEFAULT_CONFIG: Partial<WidgetConfig> = {
  timeout: 30000,
  themeColor: '#3b82f6', // Default blue
  enableHistory: false,
  debug: false,
};

export function useWidgetConfig({ 
  mountElement, 
  defaults = {} 
}: UseWidgetConfigOptions = {}): UseWidgetConfigReturn {
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stabilize defaults object to prevent infinite re-renders
  const stableDefaults = useState(() => defaults)[0];

  const validateConfig = useCallback((cfg: Partial<WidgetConfig>): { valid: boolean; errors: string[] } => {
    const validationErrors: string[] = [];

    // Required fields
    if (!cfg.baseUrl) {
      validationErrors.push('baseUrl is required (data-api-url attribute)');
    } else {
      try {
        new URL(cfg.baseUrl);
      } catch {
        validationErrors.push('baseUrl must be a valid URL');
      }
    }

    // API key validation - allow empty for same-origin requests
    if (!cfg.apiKey) {
      // Check if this is a same-origin request
      if (cfg.baseUrl) {
        try {
          const apiUrl = new URL(cfg.baseUrl);
          const currentOrigin = window.location.origin;
          
          if (apiUrl.origin === currentOrigin) {
            // Same-origin request - API key is optional
            console.log('🔒 Same-origin API detected - API key not required');
          } else {
            // Cross-origin request - API key is required
            validationErrors.push('apiKey is required for cross-origin requests (data-api-key attribute)');
          }
        } catch {
          // If URL parsing failed, we already caught it above
          validationErrors.push('apiKey is required (data-api-key attribute)');
        }
      } else {
        validationErrors.push('apiKey is required (data-api-key attribute)');
      }
    } else if (cfg.apiKey.length < 10) {
      validationErrors.push('apiKey appears to be too short (minimum 10 characters)');
    }

    // Optional field validation
    if (cfg.timeout !== undefined) {
      if (typeof cfg.timeout !== 'number' || cfg.timeout < 1000 || cfg.timeout > 300000) {
        validationErrors.push('timeout must be between 1000 and 300000 milliseconds');
      }
    }

    if (cfg.themeColor !== undefined) {
      const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!colorRegex.test(cfg.themeColor)) {
        validationErrors.push('themeColor must be a valid hex color (e.g., #3b82f6)');
      }
    }

    return {
      valid: validationErrors.length === 0,
      errors: validationErrors
    };
  }, []);

  const readConfigFromElement = useCallback((element: HTMLElement): Partial<WidgetConfig> => {
    const dataset = element.dataset;
    
    const config: Partial<WidgetConfig> = {};

    // Required configuration
    if (dataset.apiUrl) {
      config.baseUrl = dataset.apiUrl;
    }
    
    if (dataset.apiKey) {
      config.apiKey = dataset.apiKey;
    }

    // Optional configuration
    if (dataset.timeout) {
      const timeout = parseInt(dataset.timeout, 10);
      if (!isNaN(timeout)) {
        config.timeout = timeout;
      }
    }

    if (dataset.themeColor) {
      config.themeColor = dataset.themeColor;
    }

    if (dataset.enableHistory) {
      config.enableHistory = dataset.enableHistory.toLowerCase() === 'true';
    }

    if (dataset.debug) {
      config.debug = dataset.debug.toLowerCase() === 'true';
    }

    return config;
  }, []);

  // Load configuration on mount only
  useEffect(() => {
    setIsLoading(true);
    setErrors([]);

    try {
      let element = mountElement;
      let elementConfig: Partial<WidgetConfig> = {};
      
      // If no mount element provided, try to find it
      if (!element) {
        element = document.getElementById('ai-chatbot-root');
        if (!element) {
          element = document.querySelector('[data-ai-chatbot]') as HTMLElement;
        }
      }

      // If we found an element, read configuration from it
      if (element) {
        elementConfig = readConfigFromElement(element);
      }
      // If no element found and we have defaults, use defaults (development mode)
      else if (stableDefaults && Object.keys(stableDefaults).length > 0) {
        if (import.meta.env.DEV) {
          console.log('🔧 Development mode: Using provided defaults instead of mount element');
        }
        elementConfig = {}; // Use empty config, rely on defaults
      }
      // If no element and no meaningful defaults, show error
      else {
        setErrors(['No mount element found. Expected element with id="ai-chatbot-root" or data-ai-chatbot attribute.']);
        setIsValid(false);
        setConfig(null);
        setIsLoading(false);
        return;
      }

      // Merge with defaults
      const mergedConfig = {
        ...DEFAULT_CONFIG,
        ...stableDefaults,
        ...elementConfig,
      };

      // Validate configuration
      const validation = validateConfig(mergedConfig);
      
      if (validation.valid) {
        setConfig(mergedConfig as WidgetConfig);
        setIsValid(true);
        setErrors([]);
      } else {
        setConfig(null);
        setIsValid(false);
        setErrors(validation.errors);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown configuration error';
      setErrors([`Configuration error: ${errorMessage}`]);
      setIsValid(false);
      setConfig(null);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array - run only once on mount

  return {
    config,
    isValid,
    errors,
    isLoading,
  };
} 