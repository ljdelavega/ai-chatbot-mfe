import { useState } from 'react'
import { Button, Icon, LoadingSpinner, Avatar } from './components'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleAsyncAction = async () => {
    setLoading(true)
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
    setCount(count + 1)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">AI Chatbot Widget - Component Testing</h1>
      
      <div className="space-y-6">
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
            
            <div className="space-y-2">
              <h3 className="font-medium">Chat Message Examples:</h3>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                <Avatar type="user" />
                <div className="flex-1">
                  <div className="bg-blue-600 text-white p-2 rounded-lg rounded-bl-none max-w-xs">
                    Hello! How can I help you today?
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                <Avatar type="bot" />
                <div className="flex-1">
                  <div className="bg-white border p-2 rounded-lg rounded-bl-none max-w-xs">
                    Hi there! I'm here to assist you. What would you like to know?
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
