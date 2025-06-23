import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Widget from './components/Widget'
import { useWidgetConfig, useWidgetState, useChat } from './hooks'

// Global flag to prevent multiple initializations
let isInitialized = false;

// Embedding entry point for the AI Chatbot Widget
function EmbeddedWidget() {
  // Read configuration from the mount element's data attributes
  const { config, isValid, errors } = useWidgetConfig()
  
  const {
    state: widgetState,
    setNormal,
    setFullscreen,
    setMinimized,
  } = useWidgetState({
    initialState: 'normal',
    enablePersistence: true,
  })

  const {
    messages,
    isLoading,
    error: chatError,
    streamingMessageId,
    sendMessage,
    retryMessage,
    clearError
  } = useChat({
    config: config || {
      baseUrl: window.location.origin,
      apiKey: '', // Empty string instead of null for TypeScript compatibility
      themeColor: '#3b82f6',
      enableHistory: false,
      debug: false,
      timeout: 30000
    },
    onError: (error) => {
      console.error('Chat error:', error)
    }
  })

  // Show configuration errors if any
  if (!isValid && errors.length > 0) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-sm">
        <strong className="font-bold">Widget Error: </strong>
        <span className="block sm:inline">{errors[0]}</span>
      </div>
    )
  }

  return (
    <Widget
      messages={messages}
      isLoading={isLoading}
      errorState={chatError ? {
        type: 'generic',
        message: chatError,
        onRetry: () => clearError(),
        onDismiss: () => clearError()
      } : undefined}
      streamingMessageId={streamingMessageId || undefined}
      initialState={widgetState}
      onSendMessage={sendMessage}
      onRetryMessage={retryMessage}
      onStateChange={(newState) => {
        switch (newState) {
          case 'normal':
            setNormal()
            break
          case 'fullscreen':
            setFullscreen()
            break
          case 'minimized':
            setMinimized()
            break
        }
      }}
      onClose={() => setMinimized()}
    />
  )
}

// Auto-initialize when script loads
function initializeWidget() {
  // Prevent multiple initialization
  if (isInitialized) {
    console.log('AI Chatbot Widget: Already initialized, skipping');
    return;
  }

  // Find the mount element
  const mountElement = document.getElementById('ai-chatbot-root')
  
  if (!mountElement) {
    console.error('AI Chatbot Widget: Mount element with id="ai-chatbot-root" not found');
    return;
  }

  // Check if already has React content
  if (mountElement.hasChildNodes() && mountElement.children.length > 0) {
    console.log('AI Chatbot Widget: Mount element already has content, skipping initialization');
    return;
  }

  try {
    // Mark as initialized before creating root to prevent race conditions
    isInitialized = true;
    
    // Create React root and render the widget
    const root = createRoot(mountElement)
    root.render(
      <StrictMode>
        <EmbeddedWidget />
      </StrictMode>
    )
    
    console.log('AI Chatbot Widget initialized successfully')
  } catch (error) {
    console.error('Failed to initialize AI Chatbot Widget:', error)
    isInitialized = false; // Reset flag on error
  }
}

// Initialize with multiple strategies to handle different environments
function safeInitialize() {
  try {
    initializeWidget();
  } catch (error) {
    console.error('Widget initialization error:', error);
    // Retry after a short delay
    setTimeout(initializeWidget, 100);
  }
}

// Initialize immediately if DOM is ready, otherwise wait
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInitialize);
  } else {
    // DOM is already ready, initialize immediately
    safeInitialize();
  }
}

// Also expose global initialization function for manual initialization
if (typeof window !== 'undefined') {
  (window as any).initAIChatbotWidget = initializeWidget;
} 