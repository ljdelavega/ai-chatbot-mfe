import { useState } from 'react'
import { Button, Icon, LoadingSpinner, Avatar } from './components'
import MessageBubble from './components/MessageBubble'
import MessageList from './components/MessageList'
import MessageInput from './components/MessageInput'
import ChatHeader from './components/ChatHeader'
import type { Message } from './lib/types'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [inputDisabled, setInputDisabled] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleAsyncAction = async () => {
    setLoading(true)
    // Simulate async operation
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
      content: 'Of course! This is an embeddable AI chatbot widget built with React and TypeScript. It supports real-time streaming responses and can be easily integrated into any website.',
      timestamp: new Date(Date.now() - 5000),
      status: 'complete'
    },
    {
      id: '4',
      role: 'user',
      content: 'That sounds great! What features does it have?',
      timestamp: new Date(Date.now() - 3000),
      status: 'loading'
    },
    {
      id: '5',
      role: 'assistant',
      content: 'The widget includes fullscreen mode, minimize functionality, and responsive design...',
      timestamp: new Date(),
      status: 'complete'
    }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">AI Chatbot Widget - Component Testing</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">ChatHeader Component Tests</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Default ChatHeader */}
            <div className="space-y-2">
              <h3 className="font-medium">Default Header</h3>
              <div className="border rounded-lg bg-white">
                <ChatHeader 
                  onMinimize={handleMinimize}
                  onToggleFullscreen={handleToggleFullscreen}
                  onClose={handleClose}
                  isFullscreen={isFullscreen}
                />
              </div>
            </div>
            
            {/* Custom title and subtitle */}
            <div className="space-y-2">
              <h3 className="font-medium">Custom Title & Subtitle</h3>
              <div className="border rounded-lg bg-white">
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
            
            {/* Minimal controls */}
            <div className="space-y-2">
              <h3 className="font-medium">Minimal Controls (Close only)</h3>
              <div className="border rounded-lg bg-white">
                <ChatHeader 
                  title="Simple Chat"
                  showMinimize={false}
                  showFullscreen={false}
                  showClose={true}
                  onClose={handleClose}
                />
              </div>
            </div>
            
            {/* No controls */}
            <div className="space-y-2">
              <h3 className="font-medium">No Controls</h3>
              <div className="border rounded-lg bg-white">
                <ChatHeader 
                  title="Fixed Chat"
                  subtitle="Cannot be closed"
                  showMinimize={false}
                  showFullscreen={false}
                  showClose={false}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Interactive Demo:</h4>
            <p className="text-sm text-green-800 mb-3">
              Click the buttons to test functionality. Fullscreen state: <strong>{isFullscreen ? 'ON' : 'OFF'}</strong>
            </p>
            <div className="border rounded-lg bg-white">
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

        <section>
          <h2 className="text-xl font-semibold mb-4">Complete Chat Interface Demo</h2>
          
          <div className="border rounded-lg bg-white max-w-2xl h-96 flex flex-col">
            <ChatHeader 
              title="Complete Demo"
              subtitle="All components together"
              onMinimize={handleMinimize}
              onToggleFullscreen={handleToggleFullscreen}
              onClose={handleClose}
              isFullscreen={isFullscreen}
            />
            <MessageList 
              messages={mockMessages.slice(0, 3)}
              streamingMessageId="3"
            />
            <MessageInput 
              onSendMessage={handleSendMessage}
              placeholder="Type your message..."
            />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">MessageInput Component Tests</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Normal MessageInput */}
            <div className="space-y-2">
              <h3 className="font-medium">Normal Input</h3>
              <div className="border rounded-lg bg-white">
                <MessageInput 
                  onSendMessage={handleSendMessage}
                  placeholder="Type your message here..."
                />
              </div>
            </div>
            
            {/* Disabled MessageInput */}
            <div className="space-y-2">
              <h3 className="font-medium">Disabled Input</h3>
              <div className="border rounded-lg bg-white">
                <MessageInput 
                  onSendMessage={handleSendMessage}
                  disabled={true}
                  placeholder="Input is disabled..."
                />
              </div>
            </div>
            
            {/* MessageInput with character limit */}
            <div className="space-y-2">
              <h3 className="font-medium">With Character Limit (100)</h3>
              <div className="border rounded-lg bg-white">
                <MessageInput 
                  onSendMessage={handleSendMessage}
                  maxLength={100}
                  placeholder="Try typing a long message..."
                />
              </div>
            </div>
            
            {/* MessageInput with toggle */}
            <div className="space-y-2">
              <h3 className="font-medium">Toggle Disabled State</h3>
              <div className="space-y-2">
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => setInputDisabled(!inputDisabled)}
                >
                  {inputDisabled ? 'Enable' : 'Disable'} Input
                </Button>
                <div className="border rounded-lg bg-white">
                  <MessageInput 
                    onSendMessage={handleSendMessage}
                    disabled={inputDisabled}
                    placeholder="Toggle the button above..."
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Usage Instructions:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Press Enter to send a message</li>
              <li>• Press Shift+Enter for new line</li>
              <li>• Character count appears when approaching limit</li>
              <li>• Send button is disabled when input is empty</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">MessageList Component Tests</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* MessageList with messages */}
            <div className="space-y-2">
              <h3 className="font-medium">With Messages</h3>
              <div className="border rounded-lg h-80 bg-white">
                <MessageList 
                  messages={mockMessages}
                  streamingMessageId="5"
                />
              </div>
            </div>
            
            {/* Empty MessageList */}
            <div className="space-y-2">
              <h3 className="font-medium">Empty State</h3>
              <div className="border rounded-lg h-80 bg-white">
                <MessageList messages={[]} />
              </div>
            </div>
            
            {/* Loading state */}
            <div className="space-y-2">
              <h3 className="font-medium">Loading State</h3>
              <div className="border rounded-lg h-80 bg-white">
                <MessageList 
                  messages={mockMessages.slice(0, 3)}
                  isLoading={true}
                />
              </div>
            </div>
            
            {/* Short message list */}
            <div className="space-y-2">
              <h3 className="font-medium">Short Conversation</h3>
              <div className="border rounded-lg h-80 bg-white">
                <MessageList 
                  messages={mockMessages.slice(0, 2)}
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">MessageBubble Component Tests</h2>
          
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg max-w-2xl">
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
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Button Component Tests</h2>
          
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <Button onClick={() => setCount(count + 1)}>
                <Icon name="user" size={16} className="mr-2" />
                Primary Button (count: {count})
              </Button>
              <Button variant="secondary" onClick={() => setCount(count - 1)}>
                <Icon name="bot" size={16} className="mr-2" />
                Secondary Button
              </Button>
            </div>
            
            <div className="flex gap-4 items-center">
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
            
            <div className="flex gap-4 items-center">
              <Button loading={loading} onClick={handleAsyncAction}>
                {loading ? 'Loading...' : 'Async Action'}
              </Button>
              <Button disabled>
                <Icon name="minimize" size={16} className="mr-2" />
                Disabled
              </Button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Icon Component Tests</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 border rounded">
              <Icon name="send" />
              <span>Send</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded">
              <Icon name="expand" />
              <span>Expand</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded">
              <Icon name="close" />
              <span>Close</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded">
              <Icon name="minimize" />
              <span>Minimize</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded">
              <Icon name="user" />
              <span>User</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded">
              <Icon name="bot" />
              <span>Bot</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded">
              <Icon name="loading" className="animate-pulse" />
              <span>Loading</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded">
              <Icon name="chevron-down" />
              <span>Chevron Down</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded">
              <Icon name="chevron-up" />
              <span>Chevron Up</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">LoadingSpinner Component Tests</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
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
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <LoadingSpinner variant="primary" />
                <span>Primary</span>
              </div>
              <div className="flex items-center gap-2">
                <LoadingSpinner variant="secondary" />
                <span>Secondary</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-800 p-2 rounded">
                <LoadingSpinner variant="white" />
                <span className="text-white">White</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button disabled={loading}>
                {loading && <LoadingSpinner size="sm" variant="white" className="mr-2" />}
                {loading ? 'Processing...' : 'Button with Spinner'}
              </Button>
              <div className="flex items-center gap-2 p-3 border rounded">
                <LoadingSpinner size="sm" variant="secondary" />
                <span>Loading message...</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Avatar Component Tests</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Avatar type="user" size="sm" />
                <span>Small User</span>
              </div>
              <div className="flex items-center gap-2">
                <Avatar type="user" size="md" />
                <span>Medium User</span>
              </div>
              <div className="flex items-center gap-2">
                <Avatar type="user" size="lg" />
                <span>Large User</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Avatar type="bot" size="sm" />
                <span>Small Bot</span>
              </div>
              <div className="flex items-center gap-2">
                <Avatar type="bot" size="md" />
                <span>Medium Bot</span>
              </div>
              <div className="flex items-center gap-2">
                <Avatar type="bot" size="lg" />
                <span>Large Bot</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
