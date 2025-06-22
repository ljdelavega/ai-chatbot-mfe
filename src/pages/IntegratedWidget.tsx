import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import Widget from '../components/Widget'
import { useChat, useWidgetConfig, useWidgetState } from '../hooks'
import type { Message } from '../lib/types'

function IntegratedWidget() {
  // Mock configuration for development - in real embedding this would come from data attributes
  const mockConfig = {
    baseUrl: 'http://localhost:8000',
    apiKey: 'demo-api-key-12345678',
    themeColor: '#3b82f6',
    enableHistory: false,
    debug: true
  }

  // Use our new hooks
  const { config, isValid, errors: configErrors } = useWidgetConfig({
    defaults: mockConfig // Use mock config as defaults for development
  })

  const {
    state: widgetState,
    setNormal,
    setFullscreen,
    setMinimized,
    toggleFullscreen,
    toggleMinimized,
    restoreFromMinimized
  } = useWidgetState({
    initialState: 'normal',
    enablePersistence: true,
    onStateChange: (newState, prevState) => {
      console.log(`Widget state changed: ${prevState} → ${newState}`)
    }
  })

  const {
    messages,
    isLoading,
    error: chatError,
    streamingMessageId,
    sendMessage,
    retry,
    clearMessages,
    clearError
  } = useChat({
    config: config || mockConfig, // Fallback to mock config
    onError: (error) => {
      console.error('Chat error:', error)
    }
  })

  // Debug logging for development
  console.log('🔍 Debug Info:', {
    messageCount: messages.length,
    isLoading,
    streamingMessageId,
    hasError: !!chatError,
    config: config?.baseUrl
  })

  // The useChat hook now handles welcome message initialization automatically

  // Handle sending messages
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return
    
    try {
      await sendMessage(content)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }, [sendMessage])

  // Handle widget state changes
  const handleStateChange = useCallback((newState: 'normal' | 'fullscreen' | 'minimized') => {
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
  }, [setNormal, setFullscreen, setMinimized])

  // Handle widget close
  const handleClose = useCallback(() => {
    setMinimized()
  }, [setMinimized])

  // Handle error retry
  const handleErrorRetry = useCallback(() => {
    clearError()
    if (chatError) {
      retry()
    }
  }, [clearError, chatError, retry])

  // Handle error dismiss
  const handleErrorDismiss = useCallback(() => {
    clearError()
  }, [clearError])

  // Show configuration errors if any
  if (!isValid && configErrors.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Configuration Error</h2>
          <div className="space-y-2 mb-4">
            {configErrors.map((error, index) => (
              <p key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </p>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Please check your widget configuration and try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                AI Chatbot Widget Demo
              </h1>
              <span className="text-sm text-gray-500">
                Integrated Experience
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/components"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                Component Tests →
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Our AI Assistant
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience the power of AI conversation with our embeddable chatbot widget. 
            The widget is positioned in the bottom-right corner, ready to help you.
          </p>
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Widget Features
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💬 Real-time Chat</h4>
                <p className="text-sm text-blue-700">
                  Streaming responses with typing indicators for natural conversation flow.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">🔄 Multiple States</h4>
                <p className="text-sm text-green-700">
                  Normal, fullscreen, and minimized modes with smooth transitions.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">⌨️ Keyboard Shortcuts</h4>
                <p className="text-sm text-purple-700">
                  Escape to exit fullscreen, Ctrl+M to minimize, Ctrl+F for fullscreen.
                </p>
              </div>
            </div>
          </div>

          {/* Configuration Status */}
          {config && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
              <h4 className="font-medium text-green-900 mb-2">✅ Configuration Loaded</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>API URL:</strong> {config.baseUrl}</p>
                <p><strong>Debug Mode:</strong> {config.debug ? 'Enabled' : 'Disabled'}</p>
                <p><strong>Theme Color:</strong> {config.themeColor}</p>
              </div>
            </div>
          )}

          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
              <span>Look for the chat widget in the</span>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                bottom-right corner
              </span>
              <span>👉</span>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            How to Use
          </h3>
          <div className="space-y-3 text-gray-600">
            <div className="flex items-start space-x-3">
              <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">1</span>
              <p>Click on the chat widget in the bottom-right corner to start a conversation</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">2</span>
              <p>Use the expand button to enter fullscreen mode for a focused chat experience</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">3</span>
              <p>Click the minimize button to collapse the widget into a bottom bar</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">4</span>
              <p>Try keyboard shortcuts: Escape (exit fullscreen), Ctrl+M (minimize), Ctrl+F (fullscreen)</p>
            </div>
          </div>
        </div>
      </div>

             {/* AI Chatbot Widget */}
       <Widget
         initialState={widgetState}
         onStateChange={handleStateChange}
         onClose={handleClose}
         messages={messages}
         onSendMessage={handleSendMessage}
         isLoading={isLoading}
         streamingMessageId={streamingMessageId || undefined}
         hasNewMessages={false} // We'll implement this later
         networkStatus="online" // We'll implement network status in the hook
         errorState={chatError ? {
           type: 'generic',
           title: 'Chat Error',
           message: chatError,
           onRetry: handleErrorRetry,
           onDismiss: handleErrorDismiss
         } : undefined}
         onNetworkRetry={() => {}} // We'll implement this later
       />
    </div>
  )
}

export default IntegratedWidget 