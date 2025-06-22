# AI Chatbot Widget (MFE)

A framework-agnostic, embeddable AI chatbot widget with real-time streaming support. Built with React, TypeScript, and Vite for maximum portability and performance.

## 🚀 Features

- **Zero Configuration**: Drop-in widget with simple `script` tag embedding
- **Real-time Streaming**: Progressive text rendering as AI responds
- **Fullscreen Mode**: Expandable interface for better conversation experience
- **Framework Agnostic**: Works with any website (React, Vue, plain HTML, etc.)
- **Style Isolated**: CSS scoped to prevent conflicts with host page
- **Mobile Responsive**: Optimized for all device sizes

## ⚡ Quick Embed

Add this to any HTML page:

```html
<!-- 1. Add the mount point with configuration -->
<div 
  id="ai-chatbot-root" 
  data-api-url="https://your-api-domain.com"
  data-api-key="your-api-key">
</div>

<!-- 2. Load the widget script -->
<script src="https://cdn.yourdomain.com/chatbot-widget.js"></script>
```

**That's it!** The widget will automatically initialize and be ready for conversations.

## 📋 Configuration Options

Configure the widget using `data-*` attributes on the mount div:

| Attribute | Description | Required | Example |
|-----------|-------------|----------|---------|
| `data-api-url` | Your AI Chat API endpoint | ✅ | `https://api.yourdomain.com` |
| `data-api-key` | API authentication key | ✅ | `your-secret-api-key` |
| `data-theme-color` | Primary color (future) | No | `#3b82f6` |
| `data-enable-history` | Persist chat history (future) | No | `true` |

### Example with Configuration

```html
<div 
  id="ai-chatbot-root" 
  data-api-url="https://my-ai-api.vercel.app"
  data-api-key="sk-1234567890abcdef"
  data-theme-color="#10b981">
</div>
<script src="https://cdn.example.com/chatbot-widget.js"></script>
```

## 🏗️ Integration Examples

### React/Next.js

```jsx
// In your React component
export default function HomePage() {
  useEffect(() => {
    // Widget script will auto-initialize when it finds the div
    const script = document.createElement('script');
    script.src = 'https://cdn.yourdomain.com/chatbot-widget.js';
    document.head.appendChild(script);
    
    return () => document.head.removeChild(script);
  }, []);

  return (
    <div>
      <h1>Welcome to My Site</h1>
      
      {/* Widget mount point */}
      <div 
        id="ai-chatbot-root"
        data-api-url={process.env.NEXT_PUBLIC_API_URL}
        data-api-key={process.env.NEXT_PUBLIC_API_KEY}>
      </div>
    </div>
  );
}
```

### Vue.js

```vue
<template>
  <div>
    <h1>Welcome to My Site</h1>
    
    <!-- Widget mount point -->
    <div 
      id="ai-chatbot-root"
      :data-api-url="apiUrl"
      :data-api-key="apiKey">
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      apiUrl: process.env.VUE_APP_API_URL,
      apiKey: process.env.VUE_APP_API_KEY
    }
  },
  mounted() {
    const script = document.createElement('script');
    script.src = 'https://cdn.yourdomain.com/chatbot-widget.js';
    document.head.appendChild(script);
  }
}
</script>
```

### Plain HTML

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <h1>Welcome to My Site</h1>
    
    <!-- Widget mount point -->
    <div 
      id="ai-chatbot-root"
      data-api-url="https://my-ai-api.vercel.app"
      data-api-key="your-api-key">
    </div>
    
    <!-- Widget script -->
    <script src="https://cdn.yourdomain.com/chatbot-widget.js"></script>
</body>
</html>
```

## 🎨 Widget Features

### Chat Interface
- **Message History**: Displays conversation with clear user/assistant distinction
- **Typing Indicators**: Shows when AI is processing
- **Error Handling**: Graceful error messages for API issues
- **Auto-scroll**: Keeps latest messages visible

### Fullscreen Mode
- **Expand Toggle**: Click the expand icon to enter fullscreen
- **Mobile Optimized**: Better experience on small screens
- **Keyboard Shortcuts**: `Esc` to exit fullscreen (future)

### Streaming Responses
- **Real-time Rendering**: Text appears as AI generates it
- **Smooth Animation**: Natural typing effect
- **Chunk Processing**: Handles streaming data efficiently

## 🛠️ Development

### Prerequisites

- **Node.js**: v20.x or later
- **pnpm**: Recommended package manager
- **TypeScript**: For type safety

### Local Development

```bash
# Clone and setup
git clone <repository-url>
cd ai-chatbot-mfe
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Project Structure

```
ai-chatbot-mfe/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Icon.tsx
│   │   └── LoadingSpinner.tsx
│   ├── features/           # Chat-specific components
│   │   ├── ChatWindow.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   └── FullscreenToggle.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useChat.ts
│   │   ├── useWidgetConfig.ts
│   │   └── useFullscreen.ts
│   ├── lib/                # Utilities
│   │   ├── api.ts
│   │   └── utils.ts
│   ├── styles/             # Global styles
│   └── main.tsx           # Application entry point
├── public/                 # Static assets
├── dist/                   # Build output
└── docs/                   # Documentation
```

### Build Configuration

The widget builds to a single JavaScript bundle:

```bash
# Production build creates:
dist/chatbot-widget.js     # Main bundle
dist/chatbot-widget.css    # Scoped styles (if needed)
```

### Testing

```bash
# Run unit tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Test embedding with local server
pnpm test:embed
```

## 📡 API Requirements

The widget requires a compatible AI Chat API with these endpoints:

### Required Endpoints

#### `POST /api/v1/chat/stream`
Streaming chat endpoint for real-time responses.

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "Hello!"}
  ]
}
```

**Headers:**
```
Content-Type: application/json
X-API-Key: your-api-key
```

**Response:** Server-sent events with text chunks

#### `GET /api/v1/health` (Optional)
Health check for connection status.

**Response:**
```json
{"status": "healthy", "timestamp": "2025-06-22T10:30:00Z"}
```

### Compatible APIs

This widget is designed to work with:
- **AI Chatbot API** (from this repository)
- Any API implementing the same streaming chat interface

## 🔒 Security

### API Key Handling
- **Runtime Only**: API keys are never persisted to localStorage
- **Memory Storage**: Keys held in component state during session
- **HTTPS Required**: All API communication over secure connections

### Style Isolation
- **CSS Prefixing**: All styles prefixed with `aicb-` to prevent conflicts
- **Scoped Styles**: Widget styles don't affect host page
- **Shadow DOM**: (Future enhancement for complete isolation)

## 🚀 Deployment

### CDN Hosting

Deploy the built widget to any static hosting:

```bash
# Build the widget
pnpm build

# Upload dist/chatbot-widget.js to your CDN
# Examples:
# - Vercel: vercel --prod
# - Netlify: netlify deploy --prod
# - AWS S3: aws s3 sync dist/ s3://your-bucket
# - Cloudflare Pages: wrangler pages publish dist
```

### Version Management

```html
<!-- Specific version -->
<script src="https://cdn.yourdomain.com/chatbot-widget@1.0.0.js"></script>

<!-- Latest version -->
<script src="https://cdn.yourdomain.com/chatbot-widget.js"></script>
```

## 📊 Performance

### Bundle Size Targets
- **Gzipped Bundle**: < 75kB
- **Initial Load**: < 500ms on 3G
- **Time to Interactive**: < 1s

### Optimization Features
- **Code Splitting**: Lazy load non-critical components
- **Tree Shaking**: Remove unused dependencies
- **Compression**: Gzip/Brotli compression
- **Caching**: Aggressive CDN caching headers

## 🧪 Testing Integration

### Test Your Embedding

Create a test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Widget Test</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>AI Chatbot Widget Test</h1>
        <p>The widget should appear below:</p>
        
        <!-- Test your widget here -->
        <div 
          id="ai-chatbot-root"
          data-api-url="http://localhost:8000"
          data-api-key="test-api-key">
        </div>
    </div>
    
    <script src="./dist/chatbot-widget.js"></script>
</body>
</html>
```

## 🔄 Troubleshooting

### Common Issues

**Widget doesn't appear:**
- Check browser console for errors
- Verify the mount div has correct `id="ai-chatbot-root"`
- Ensure script loads successfully (check Network tab)

**API connection fails:**
- Verify `data-api-url` points to correct endpoint
- Check `data-api-key` is valid
- Ensure API supports CORS for your domain

**Styling conflicts:**
- All widget styles are prefixed with `aicb-`
- Check for CSS specificity issues
- Try adding `!important` to host page styles if needed

**Performance issues:**
- Check bundle size in Network tab
- Verify CDN is serving compressed files
- Consider lazy loading the widget script

### Debug Mode

Enable debug logging:

```html
<div 
  id="ai-chatbot-root"
  data-api-url="https://your-api.com"
  data-api-key="your-key"
  data-debug="true">
</div>
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
