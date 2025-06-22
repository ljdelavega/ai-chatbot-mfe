import { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Widget from '../components/Widget'
import type { Message } from '../lib/types'
import type { WidgetState } from '../components/WidgetContainer'

function IntegratedWidget() {
  // Widget state management
  const [widgetState, setWidgetState] = useState<WidgetState>('normal')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome-1',
      role: 'assistant',
      content: 'Hello! Welcome to the AI Chatbot. How can I help you today?',
      timestamp: new Date(),
      status: 'complete'
    }
    setMessages([welcomeMessage])
  }, [])

  // Handle sending messages
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      status: 'complete'
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Add assistant message with streaming simulation
    const assistantMessageId = `assistant-${Date.now()}`
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      status: 'loading'
    }

    setMessages(prev => [...prev, assistantMessage])
    setStreamingMessageId(assistantMessageId)
    setIsLoading(false)

    // Simulate streaming response
    const fullResponse = getSimulatedResponse(content)
    let currentContent = ''

    for (let i = 0; i < fullResponse.length; i++) {
      currentContent += fullResponse[i]
      
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: currentContent, status: 'loading' }
          : msg
      ))

      // Random delay between 20-100ms for realistic typing effect
      const delay = Math.random() * 80 + 20
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    // Mark as complete
    setMessages(prev => prev.map(msg => 
      msg.id === assistantMessageId 
        ? { ...msg, status: 'complete' }
        : msg
    ))
    setStreamingMessageId(null)
  }, [])

  // Handle widget state changes
  const handleStateChange = useCallback((newState: WidgetState) => {
    setWidgetState(newState)
    
    // Save state to sessionStorage for persistence
    try {
      sessionStorage.setItem('chatbot-widget-state', newState)
    } catch (error) {
      console.warn('Failed to save widget state to sessionStorage:', error)
    }
  }, [])

  // Handle widget close
  const handleClose = useCallback(() => {
    // In a real application, this might hide the widget entirely
    // For now, we'll just minimize it
    handleStateChange('minimized')
  }, [handleStateChange])

  // Load saved state from sessionStorage
  useEffect(() => {
    try {
      const savedState = sessionStorage.getItem('chatbot-widget-state')
      if (savedState && ['normal', 'fullscreen', 'minimized'].includes(savedState)) {
        setWidgetState(savedState as WidgetState)
      }
    } catch (error) {
      console.warn('Failed to load widget state from sessionStorage:', error)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key to exit fullscreen
      if (event.key === 'Escape' && widgetState === 'fullscreen') {
        handleStateChange('normal')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [widgetState, handleStateChange])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-gray-900">AI Chatbot Widget</h1>
              <span className="text-sm text-gray-500">Integrated Experience</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/components" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
              >
                Component Tests
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m-7 7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        {/* Content Area */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to the AI Chatbot Experience
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              This is a fully integrated AI chatbot widget with real-time streaming, 
              fullscreen mode, and minimize functionality. Look for the chat widget in the bottom-right corner!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Real-time streaming responses
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Fullscreen mode for focused conversations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Minimize to bottom bar
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Responsive design
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Session persistence
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Use</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="font-medium text-blue-600">1.</span>
                  Look for the chat widget in the bottom-right corner
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-blue-600">2.</span>
                  Click to open and start a conversation
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-blue-600">3.</span>
                  Try the fullscreen and minimize buttons
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-blue-600">4.</span>
                  Watch responses stream in real-time
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-blue-600">5.</span>
                  Minimize to keep it accessible while browsing
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Try the Chat Widget! 👉
            </h3>
            <p className="text-gray-600 mb-6">
              The AI Assistant is positioned in the bottom-right corner of your screen, 
              just like you'd see on a real website. Click it to start chatting!
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat widget is active in bottom-right corner
            </div>
          </div>
        </div>
      </div>

      {/* Widget positioned in bottom-right - starts normal */}
      <Widget
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        streamingMessageId={streamingMessageId || undefined}
        title="AI Assistant"
        subtitle="Always here to help"
        initialState="normal"
        onStateChange={handleStateChange}
        onClose={handleClose}
      />
    </div>
  )
}

// Simulate different AI responses based on user input
function getSimulatedResponse(userInput: string): string {
  const input = userInput.toLowerCase()
  
  if (input.includes('hello') || input.includes('hi')) {
    return "Hello! It's great to meet you. I'm here to help answer your questions and assist with any tasks you might have. What would you like to know about?"
  }
  
  if (input.includes('help') || input.includes('what can you do')) {
    return "I can help you with a variety of tasks! I can answer questions, provide explanations, help with problem-solving, offer suggestions, and engage in conversations on many topics. What specific area would you like assistance with?"
  }
  
  if (input.includes('widget') || input.includes('chatbot')) {
    return "This chatbot widget is built with React and TypeScript, featuring real-time streaming responses, fullscreen mode, and minimize functionality. It's designed to be easily embedded into any website with just a script tag and configuration attributes."
  }
  
  if (input.includes('features') || input.includes('functionality')) {
    return "Key features include:\n\n• Real-time streaming responses for engaging conversations\n• Fullscreen mode for focused interactions\n• Minimize to bottom bar for unobtrusive access\n• Responsive design for mobile and desktop\n• Smooth animations and professional UI\n• Easy embedding with simple configuration\n\nWould you like me to demonstrate any of these features?"
  }
  
  if (input.includes('code') || input.includes('programming')) {
    return "I can help with programming questions! Here's a simple example:\n\n```javascript\nfunction greetUser(name) {\n  return `Hello, ${name}! Welcome to our chatbot.`;\n}\n\nconsole.log(greetUser('Developer'));\n```\n\nWhat programming topic would you like to explore?"
  }
  
  if (input.includes('fullscreen') || input.includes('expand')) {
    return "You can enter fullscreen mode by clicking the expand icon in the header. This gives you a larger, more focused view of our conversation. Try it out! Press Escape or click the collapse icon to return to normal size."
  }
  
  if (input.includes('minimize') || input.includes('hide')) {
    return "You can minimize this chat widget by clicking the minimize icon in the header. It will collapse into a small bottom bar that you can click to restore the full interface. This keeps the chat accessible without taking up screen space."
  }
  
  // Default responses for general queries
  const defaultResponses = [
    "That's an interesting question! Let me think about that for a moment. Could you provide a bit more context or detail about what you're looking for?",
    "I'd be happy to help you with that. Can you tell me more about what specific aspect you're most interested in?",
    "Great question! There are several ways to approach this. What's your main goal or what outcome are you hoping to achieve?",
    "Thanks for asking! I can definitely assist with that. What would be most helpful for you to know first?",
    "I appreciate you reaching out. To give you the most relevant information, could you share a bit more about your specific situation or needs?"
  ]
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
}

export default IntegratedWidget 