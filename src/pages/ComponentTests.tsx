import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Icon, LoadingSpinner, Avatar } from '../components'
import MessageBubble from '../components/MessageBubble'
import MessageList from '../components/MessageList'
import MessageInput from '../components/MessageInput'
import ChatHeader from '../components/ChatHeader'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'
import NetworkStatus from '../components/NetworkStatus'
import MinimizeBar from '../components/MinimizeBar'
import Widget from '../components/Widget'
import type { Message } from '../lib/types'
import type { WidgetState } from '../components/WidgetContainer'

function ComponentTests() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [widgetState] = useState<WidgetState>('normal')
  const [showMinimizeBar, setShowMinimizeBar] = useState(false)

  const handleAsyncAction = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
    setCount(count + 1)
  }

  const handleSendMessage = (message: string) => {
    console.log('Message sent:', message)
    alert(`Message sent: "${message}"`)
  }

  const handleMinimize = () => {
    console.log('Minimize clicked')
    alert('Minimize clicked!')
  }

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    console.log('Fullscreen toggled:', !isFullscreen)
  }

  const handleClose = () => {
    console.log('Close clicked')
    alert('Close clicked!')
  }

  const handleMinimizeBarClick = () => {
    setShowMinimizeBar(false)
    alert('MinimizeBar clicked - widget restored!')
  }

  // Mock messages for testing
  const mockMessages: Message[] = [
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! Welcome to the AI Chatbot. How can I help you today?',
      timestamp: new Date(Date.now() - 10000),
      status: 'complete'
    },
    {
      id: '2',
      role: 'user',
      content: 'Hi there! Can you help me understand how this widget works?',
      timestamp: new Date(Date.now() - 8000),
      status: 'complete'
    },
    {
      id: '3',
      role: 'assistant',
      content: 'Of course! This is an embeddable AI chatbot widget built with React and TypeScript.',
      timestamp: new Date(Date.now() - 5000),
      status: 'complete'
    },
    {
      id: '4',
      role: 'user',
      content: 'That sounds great! What features does it have?',
      timestamp: new Date(Date.now() - 3000),
      status: 'sending'
    },
    {
      id: '5',
      role: 'assistant',
      content: 'The widget includes fullscreen mode, minimize functionality, and responsive design...',
      timestamp: new Date(),
      status: 'complete'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Integrated Widget
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-semibold text-gray-900">Component Tests</h1>
              <span className="text-sm text-gray-500">All components with testing scenarios</span>
            </div>
            <div className="text-sm text-gray-600">
              14 Components • React + TypeScript
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          
          {/* Complete Widget System Tests */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Widget System Tests</h2>
            
            <div className="grid grid-cols-1 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Widget with All States</h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-4">
                    This demonstrates the complete widget system with normal, fullscreen, and minimize states.
                    Try the minimize and fullscreen buttons!
                  </p>
                  <div className="relative h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden">
                    <Widget
                      messages={mockMessages}
                      onSendMessage={handleSendMessage}
                      isLoading={loading}
                      streamingMessageId="5"
                      title="Complete Widget Demo"
                      subtitle="All features working"
                      onClose={handleClose}
                      initialState={widgetState}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Button Component Tests */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Button Component Tests</h2>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-6">
                <div className="flex gap-4 items-center flex-wrap">
                  <Button onClick={() => setCount(count + 1)}>
                    <Icon name="user" size={16} className="mr-2" />
                    Primary Button (count: {count})
                  </Button>
                  <Button variant="secondary" onClick={() => setCount(count - 1)}>
                    <Icon name="bot" size={16} className="mr-2" />
                    Secondary Button
                  </Button>
                </div>
                
                <div className="flex gap-4 items-center flex-wrap">
                  <Button size="sm">
                    <Icon name="send" size={14} className="mr-1" />
                    Small
                  </Button>
                  <Button size="md">
                    <Icon name="expand" size={16} className="mr-2" />
                    Medium
                  </Button>
                  <Button size="lg">
                    <Icon name="close" size={18} className="mr-2" />
                    Large
                  </Button>
                </div>
                
                <div className="flex gap-4 items-center flex-wrap">
                  <Button loading={loading} onClick={handleAsyncAction}>
                    {loading ? 'Loading...' : 'Async Action'}
                  </Button>
                  <Button disabled>
                    <Icon name="minimize" size={16} className="mr-2" />
                    Disabled
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Icon Component Tests */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Icon Component Tests</h2>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50 transition-colors">
                  <Icon name="send" />
                  <span>Send</span>
                </div>
                <div className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50 transition-colors">
                  <Icon name="expand" />
                  <span>Expand</span>
                </div>
                <div className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50 transition-colors">
                  <Icon name="close" />
                  <span>Close</span>
                </div>
                <div className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50 transition-colors">
                  <Icon name="minimize" />
                  <span>Minimize</span>
                </div>
                <div className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50 transition-colors">
                  <Icon name="user" />
                  <span>User</span>
                </div>
                <div className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50 transition-colors">
                  <Icon name="bot" />
                  <span>Bot</span>
                </div>
                <div className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50 transition-colors">
                  <Icon name="loading" className="animate-pulse" />
                  <span>Loading</span>
                </div>
                <div className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50 transition-colors">
                  <Icon name="chevron-down" />
                  <span>Chevron Down</span>
                </div>
                <div className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50 transition-colors">
                  <Icon name="chevron-up" />
                  <span>Chevron Up</span>
                </div>
              </div>
            </div>
          </section>

          {/* MessageBubble Component Tests */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">MessageBubble Component Tests</h2>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-4 bg-gray-50 p-6 rounded-lg max-w-2xl mx-auto">
                {mockMessages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isStreaming={message.id === '5'}
                  />
                ))}
                
                {/* Test error state */}
                <MessageBubble
                  message={{
                    id: '6',
                    role: 'user',
                    content: 'This message failed to send',
                    timestamp: new Date(),
                    status: 'error'
                  }}
                />
              </div>
            </div>
          </section>

          {/* MessageList Component Tests */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">MessageList Component Tests</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">With Messages</h3>
                <div className="border rounded-lg h-80 bg-white overflow-hidden">
                  <MessageList 
                    messages={mockMessages}
                    streamingMessageId="5"
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Empty State</h3>
                <div className="border rounded-lg h-80 bg-white overflow-hidden">
                  <MessageList messages={[]} />
                </div>
              </div>
            </div>
          </section>

          {/* MessageInput Component Tests */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">MessageInput Component Tests</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Normal Input</h3>
                <div className="border rounded-lg bg-white overflow-hidden">
                  <MessageInput 
                    onSendMessage={handleSendMessage}
                    placeholder="Type your message here..."
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Disabled Input</h3>
                <div className="border rounded-lg bg-white overflow-hidden">
                  <MessageInput 
                    onSendMessage={handleSendMessage}
                    disabled={true}
                    placeholder="Input is disabled..."
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8 bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h4 className="font-semibold text-blue-900 mb-2">Usage Instructions:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Press Enter to send a message</li>
                <li>• Press Shift+Enter for new line</li>
                <li>• Character count appears when approaching limit</li>
                <li>• Send button is disabled when input is empty</li>
              </ul>
            </div>
          </section>

          {/* ChatHeader Component Tests */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">ChatHeader Component Tests</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Header</h3>
                <div className="border rounded-lg bg-white overflow-hidden">
                  <ChatHeader 
                    onMinimize={handleMinimize}
                    onToggleFullscreen={handleToggleFullscreen}
                    onClose={handleClose}
                    isFullscreen={isFullscreen}
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Title & Subtitle</h3>
                <div className="border rounded-lg bg-white overflow-hidden">
                  <ChatHeader 
                    title="Support Assistant"
                    subtitle="Online now"
                    onMinimize={handleMinimize}
                    onToggleFullscreen={handleToggleFullscreen}
                    onClose={handleClose}
                    isFullscreen={isFullscreen}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8 bg-green-50 rounded-xl border border-green-200 p-6">
              <h4 className="font-semibold text-green-900 mb-2">Interactive Demo:</h4>
              <p className="text-sm text-green-800 mb-4">
                Click the buttons to test functionality. Fullscreen state: <strong>{isFullscreen ? 'ON' : 'OFF'}</strong>
              </p>
              <div className="border rounded-lg bg-white overflow-hidden">
                <ChatHeader 
                  title="Interactive Demo"
                  subtitle="Click the buttons!"
                  onMinimize={handleMinimize}
                  onToggleFullscreen={handleToggleFullscreen}
                  onClose={handleClose}
                  isFullscreen={isFullscreen}
                />
              </div>
            </div>
          </section>

          {/* MinimizeBar Component Tests */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">MinimizeBar Component Tests</h2>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Interactive MinimizeBar</h4>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => setShowMinimizeBar(!showMinimizeBar)}
                    className="mb-3"
                  >
                    {showMinimizeBar ? 'Hide' : 'Show'} MinimizeBar
                  </Button>
                  
                  {showMinimizeBar && (
                    <div className="relative h-24 bg-gray-100 rounded-lg overflow-hidden border">
                      <p className="text-xs text-gray-600 p-2">MinimizeBar shown in bottom-right</p>
                      <MinimizeBar
                        title="Test MinimizeBar"
                        subtitle="Click to restore"
                        onClick={handleMinimizeBarClick}
                        position="bottom-right"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Error & State Components Tests */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Error & State Components Tests</h2>
            
            <div className="space-y-8">
              {/* ErrorMessage Tests */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ErrorMessage Component</h3>
                <div className="space-y-4">
                  <ErrorMessage 
                    type="network"
                    onRetry={() => alert('Network retry clicked')}
                    onDismiss={() => alert('Error dismissed')}
                  />
                  <ErrorMessage 
                    type="api"
                    title="Custom API Error"
                    message="This is a custom error message for API failures."
                    onRetry={() => alert('API retry clicked')}
                  />
                  <ErrorMessage 
                    type="timeout"
                    onRetry={() => alert('Timeout retry clicked')}
                  />
                  <ErrorMessage 
                    type="rate-limit"
                    onDismiss={() => alert('Rate limit dismissed')}
                  />
                  <ErrorMessage 
                    type="auth"
                    title="Authentication Required"
                    message="Please check your API key configuration."
                  />
                </div>
              </div>

              {/* EmptyState Tests */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">EmptyState Component</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4 h-64 bg-gray-50">
                    <EmptyState 
                      type="welcome"
                      onAction={() => alert('Welcome action clicked')}
                    />
                  </div>
                  <div className="border rounded-lg p-4 h-64 bg-gray-50">
                    <EmptyState 
                      type="no-messages"
                      onAction={() => alert('No messages action clicked')}
                    />
                  </div>
                  <div className="border rounded-lg p-4 h-64 bg-gray-50">
                    <EmptyState 
                      type="disconnected"
                      onAction={() => alert('Reconnect clicked')}
                    />
                  </div>
                  <div className="border rounded-lg p-4 h-64 bg-gray-50">
                    <EmptyState 
                      type="loading"
                    />
                  </div>
                </div>
              </div>

              {/* NetworkStatus Tests */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">NetworkStatus Component</h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <NetworkStatus 
                      status="online"
                      autoHide={false}
                    />
                    <NetworkStatus 
                      status="offline"
                      onRetry={() => alert('Offline retry clicked')}
                    />
                    <NetworkStatus 
                      status="reconnecting"
                    />
                    <NetworkStatus 
                      status="error"
                      onRetry={() => alert('Error retry clicked')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* LoadingSpinner & Avatar Tests */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">LoadingSpinner & Avatar Tests</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">LoadingSpinner</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span>Small</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="md" />
                      <span>Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="lg" />
                      <span>Large</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Avatar</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Avatar type="user" size="sm" />
                      <span>User</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar type="bot" size="md" />
                      <span>Bot</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar type="user" size="lg" />
                      <span>Large</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}

export default ComponentTests 