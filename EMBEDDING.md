# AI Chatbot Widget - Embedding Guide

A modern, framework-agnostic AI chatbot widget that can be embedded into any website with just two lines of code.

## 🚀 Quick Start

### 1. Add the Mount Element

Add this div to your HTML where you want the widget to appear (it will position itself in the bottom-right corner):

```html
<div id="ai-chatbot-root" 
     data-api-url="https://your-api-domain.com"
     data-api-key="your-secure-api-key-here"></div>
```

### 2. Load the Widget

Add the script and stylesheet to your HTML:

```html
<script src="https://cdn.your-domain.com/chatbot-widget.umd.js"></script>
<link rel="stylesheet" href="https://cdn.your-domain.com/ai-chatbot-mfe.css">
```

**That's it!** Your AI chatbot widget is now live on your website.

---

## 📋 Configuration Options

All configuration is done through `data-*` attributes on the mount element:

| Attribute | Required | Default | Description |
|-----------|----------|---------|-------------|
| `data-api-url` | ✅ Yes | - | Your AI Chatbot API endpoint |
| `data-api-key` | ✅ Yes | - | Your API authentication key |
| `data-theme-color` | ❌ No | `#3b82f6` | Primary color for the widget |
| `data-enable-history` | ❌ No | `false` | Enable conversation persistence |
| `data-debug` | ❌ No | `false` | Enable debug logging |

### Example with All Options

```html
<div id="ai-chatbot-root" 
     data-api-url="https://api.example.com"
     data-api-key="sk-1234567890abcdef"
     data-theme-color="#667eea"
     data-enable-history="true"
     data-debug="false"></div>
```

---

## 🛠️ API Requirements

Your AI Chatbot API must support:

### Required Endpoint
- `POST /api/v1/chat/stream` - Streaming chat endpoint

### Authentication
- `X-API-Key` header with your API key

### Request Format
```json
{
  "messages": [
    {
      "role": "system|user|assistant",
      "content": "message content"
    }
  ]
}
```

### Response Format
Server-Sent Events with `data: ` prefixed chunks:
```
data: Hello
data:  there!
data:  How can I help you?
```

---

## 🎨 Widget Features

### Multiple States
- **Normal**: Standard chat window in bottom-right corner
- **Fullscreen**: Expanded view for focused conversations
- **Minimized**: Collapsed to a bottom bar with "AI Chatbot" text

### User Interactions
- Click widget to start chatting
- Expand button for fullscreen mode
- Minimize button to collapse to bottom bar
- Close button to hide widget

### Keyboard Shortcuts
- `Escape`: Exit fullscreen mode
- `Ctrl+M`: Toggle minimize
- `Ctrl+F`: Toggle fullscreen
- `Ctrl+Enter`: Send message (when typing)

### Advanced Features
- Real-time streaming responses
- Message retry on failures
- Error handling with user-friendly messages
- Responsive design for mobile and desktop
- Smooth animations and transitions

---

## 🌐 Framework Compatibility

The widget works with any website or framework:

### ✅ Supported Environments
- Plain HTML websites
- React applications
- Vue.js applications
- Angular applications
- WordPress sites
- Shopify stores
- Any CMS or website builder

### Example Integrations

#### React
```jsx
export default function MyPage() {
  useEffect(() => {
    // Widget will auto-initialize when the div is found
  }, []);

  return (
    <div>
      <h1>My React App</h1>
      <div id="ai-chatbot-root" 
           data-api-url="https://api.example.com"
           data-api-key="your-key"></div>
    </div>
  );
}
```

#### Vue.js
```vue
<template>
  <div>
    <h1>My Vue App</h1>
    <div id="ai-chatbot-root" 
         :data-api-url="apiUrl"
         :data-api-key="apiKey"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      apiUrl: 'https://api.example.com',
      apiKey: 'your-key'
    }
  }
}
</script>
```

#### WordPress
Add to your theme's `footer.php` or use a plugin to inject the code:

```html
<div id="ai-chatbot-root" 
     data-api-url="https://api.example.com"
     data-api-key="your-key"></div>
<script src="https://cdn.your-domain.com/chatbot-widget.umd.js"></script>
<link rel="stylesheet" href="https://cdn.your-domain.com/ai-chatbot-mfe.css">
```

---

## 🔧 Troubleshooting

### Widget Not Appearing
1. Check browser console for JavaScript errors
2. Verify the script and CSS files are loading correctly
3. Ensure the mount div has the correct `id="ai-chatbot-root"`
4. Check that `data-api-url` and `data-api-key` are provided

### Configuration Errors
The widget will show a red error message if:
- Missing required `data-api-url` or `data-api-key`
- Invalid API endpoint
- Network connectivity issues

### API Connection Issues
- Verify your API is running and accessible
- Check CORS settings on your API server
- Ensure the API key is valid and has proper permissions
- Test the API endpoint directly with curl or Postman

### Common Console Errors

**"Mount element not found"**
```html
<!-- Make sure you have this div -->
<div id="ai-chatbot-root" data-api-url="..." data-api-key="..."></div>
```

**"Missing required configuration"**
```html
<!-- Both api-url and api-key are required -->
<div id="ai-chatbot-root" 
     data-api-url="https://api.example.com"
     data-api-key="your-key"></div>
```

**"Failed to load script"**
```html
<!-- Check the script URL is correct and accessible -->
<script src="https://cdn.your-domain.com/chatbot-widget.umd.js"></script>
```

---

## 📦 Bundle Information

- **JavaScript Bundle**: ~640KB (189KB gzipped)
- **CSS Bundle**: ~36KB (8KB gzipped)
- **Total Size**: ~676KB (197KB gzipped)
- **Dependencies**: Self-contained (no external dependencies required)

---

## 🔒 Security Considerations

### API Key Management
- Never expose API keys in client-side code for production
- Use environment variables or server-side configuration
- Consider implementing a proxy endpoint for additional security

### CORS Configuration
Your API server must allow requests from your website domain:

```javascript
// Example Express.js CORS setup
app.use(cors({
  origin: ['https://your-website.com'],
  credentials: true
}));
```

### Content Security Policy
If you use CSP, you may need to add:

```html
<meta http-equiv="Content-Security-Policy" 
      content="script-src 'self' https://cdn.your-domain.com; 
               style-src 'self' https://cdn.your-domain.com;">
```

---

## 📞 Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your API endpoint is working with curl/Postman
3. Test with the provided `test-embedding.html` file
4. Review this documentation for common solutions

---

## 🎉 You're All Set!

Your AI chatbot widget is now ready to engage with your website visitors. The widget will appear in the bottom-right corner and provide a seamless chat experience with your AI assistant.

**Happy chatting!** 🤖💬 