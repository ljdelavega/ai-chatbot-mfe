# Product Requirements Document: Embeddable AI Chatbot Widget (MFE)

**Author:** Lester Dela Vega
**Date:** 2025-06-21

---

## 1. Overview
This document outlines the product requirements for a framework-agnostic, embeddable AI Chatbot Widget. This product is a client-side micro-frontend (MFE) designed to provide a clean, modern, and user-friendly interface for the **Headless AI Chat API**.

The core problem this product solves is the significant time and effort required for developers to build a high-quality, real-time chat interface from scratch. This product is for **any developer (the "Embedder")** who has deployed the Headless AI Chat API and wants to quickly add a polished chat UI to their website without deep frontend expertise. For the website's **end-users**, it provides an intuitive and responsive chat experience.

---

## 2. Core Features
The product's features are focused on providing a seamless user experience and dead-simple integration for developers.

### Feature 1: Simple & Portable Embedding
* **Description:** The entire chat application will be compiled into a single JavaScript bundle, allowing it to be embedded into any website (Next.js, Vue, plain HTML, etc.) with a standard `script` tag and a `div` element. Configuration, such as the API endpoint and required API key, will be passed via `data-*` attributes on the mount `div`.
* **Value:** This provides maximum portability and a near-zero configuration setup for the embedding developer, drastically lowering the barrier to entry.
* **High-Level Functionality:** The developer adds `<div id="ai-chatbot-root" data-api-url="..." data-api-key="..."></div>` and a `<script>` tag to their HTML. The script will automatically find this `div`, read the configuration, and render the chat widget inside it.

### Feature 2: Real-time Streaming Interface
* **Description:** The user interface is built from the ground up to handle streaming text responses. When the backend API streams a response, the UI will render the text token-by-token in real-time, providing an engaging "typing" effect.
* **Value:** This provides a state-of-the-art user experience that feels fluid and responsive, keeping the end-user engaged while the full AI response is generated.
* **High-Level Functionality:** The widget calls the `POST /api/v1/chat/stream` endpoint. As chunks of text data are received over the HTTP connection, they are immediately appended to the assistant's message bubble in the UI.

### Feature 3: Immersive Fullscreen Mode
* **Description:** The chat widget will include a UI control (e.g., an "expand" icon) that allows the end-user to toggle a fullscreen mode. In this mode, the chat interface will expand to fill the browser's entire viewport for a more focused experience.
* **Value:** Improves usability and accessibility, especially on mobile devices where screen real estate is limited. It's ideal for longer, more complex conversations.
* **High-Level Functionality:** A user clicks the "expand" icon. The widget uses CSS to animate its `position`, `width`, and `height` to fill the viewport. The icon changes to a "collapse" icon to allow the user to return to the standard widget view.

---

## 3. User Experience
The experience is designed for two distinct users: the developer embedding the widget and the end-user interacting with it.

### User Personas
* **Devin, the Developer:** Devin has just deployed the Headless AI Chat API. He wants to add a functional UI to his existing website immediately to demo the functionality. He values clear documentation, a simple embedding process, and a professional-looking result without having to write any CSS.
* **Maria, the End-User:** Maria is visiting Devin's website. She sees the chat icon and has a question. She expects the interface to be as intuitive and fluid as modern messaging apps like WhatsApp or Messenger.

### Key User Flows
* **Flow 1 - Developer: Embedding the Widget**
    1.  Devin reads the widget's `README.md` file.
    2.  He copies the `<div>` snippet into his website's HTML.
    3.  He updates the `data-api-url` attribute to point to his deployed API and the `data-api-key` attribute with his secret key.
    4.  He copies the `<script>` tag into his HTML.
    5.  He reloads his website and sees the chat widget appear. The task is complete.
* **Flow 2 - End-User: Having a Conversation**
    1.  Maria clicks on the chat icon. The chat window opens with a welcome message.
    2.  She types "What is this project about?" and hits Enter. She sees a subtle "thinking" animation.
    3.  The assistant's reply appears and types itself out in real-time. The response contains a code block.
    4.  She clicks the "Fullscreen" icon to see the code block more clearly.
    5.  She finishes her conversation and clicks the "close" button on the widget.

### Developer Experience (DX) & API Design Principles
* **Minimal Configuration:** The widget should work out-of-the-box with only the API URL and key.
* **Scoped Styling:** All CSS will be scoped or prefixed to ensure the widget's styles do not conflict with the host page's styles.
* **Clear Error States:** If the API call fails or the API key is invalid, the UI must display a clear, user-friendly error message (e.g., "Sorry, I'm having trouble connecting.").

---

## 4. Technical Architecture

### System Components
* **Frontend:** `Vite` + `React` + `TypeScript`, built as a single embeddable JavaScript bundle.
* **Backend:** `N/A` (The widget is a client-only application that communicates with the external Headless AI Chat API).
* **Database:** `N/A`.
* **Authentication:** `N/A` (The widget is stateless and does not authenticate users. It simply uses the API key provided to it to access the backend).

### Data Models
* **Message (Client-side state):** `{ id: string, role: 'user' | 'assistant', content: string, status?: 'loading' | 'error' }`
* **WidgetConfig (Read from `data-*` attributes):** `{ apiUrl: string, apiKey: string, themeColor?: string }`

### APIs and Integrations
* **External API (Consumed):** The widget's primary integration is with the **Headless AI Chat API**.
    * It **must** call `POST /api/v1/chat/stream` to send message history and receive a streaming response.
    * It **should** periodically call `GET /api/v1/health` to determine connection status (Future Enhancement).

### Infrastructure Requirements
* **Hosting:** A static hosting provider or CDN to serve the `chatbot-bundle.js` file (e.g., Vercel, Netlify, Cloudflare Pages, AWS S3/CloudFront).
* **CI/CD:** A standard pipeline that builds the React application and deploys the resulting bundle upon commits to the main branch.

---

## 5. Development Roadmap

### MVP (Minimum Viable Product) Requirements
The goal of the MVP is to deliver a functional, embeddable chat widget that fulfills the core promise of the product.
* **Feature A: Core Chat Interface:** A functional UI with a message list, text input area, and send button.
* **Feature B: Streaming API Integration:** The widget must successfully call the external streaming API endpoint using the provided URL and key, and render the response token-by-token.
* **Feature C: Functional Fullscreen Mode:** The UI toggle to enter and exit the fullscreen view must be implemented.
* **Feature D: Embeddable Build Output:** The Vite build process must be configured to produce a single, portable JavaScript bundle.
* **Feature E: Embedding Documentation:** A `README.md` that clearly explains how a developer can embed the widget on their site.

### Future Enhancements (Post-MVP)
* **Phase 2:**
    * Implement `localStorage` to offer optional conversation history persistence across browser reloads.
    * Support basic UI theme customization via `data-theme-color` attributes.
    * Add a "Copy" button to code blocks rendered in the chat.
* **Phase 3:**
    * Add support for rendering Markdown in responses for richer formatting (links, lists, bolding).
    * Implement an optional backend health status indicator that pings the `/health` endpoint.

---

## 6. Logical Dependency Chain

1.  **Foundation (Static UI):**
    * Set up the Vite + React project.
    * Build all the UI components (message bubbles, input bar, header) with mock, static data.
    * Ensure the UI is fully responsive and the fullscreen toggle works on the static components.
2.  **Core Usable Feature (API Integration):**
    * Implement the client-side logic to call the external API's `/chat/stream` endpoint.
    * Integrate the logic to handle the streaming response and update the component state in real-time. This is the most critical technical task.
3.  **Integration & Embedding:**
    * Implement the logic to read configuration from `data-*` attributes on the mount div.
    * Finalize the Vite build configuration to produce the distributable bundle.
    * Write the embedding instructions and test the complete flow on a simple `index.html` page.

---

## 7. Risks and Mitigations

### Technical Challenges
* **Risk:** Ensuring the widget's CSS does not conflict with any host website's existing styles.
* **Mitigation:** Enforce strict style scoping. This can be achieved by using a CSS-in-JS library, CSS Modules, or automatically prefixing all Tailwind CSS classes during the build process to make them unique.
* **Risk:** Handling streaming responses performantly and reliably within a React component can lead to excessive re-renders if not managed carefully.
* **Mitigation:** Leverage a battle-tested library designed for this purpose, such as the Vercel `ai/react` SDK's `useChat` hook, which can be configured to point to any API endpoint and handles streaming state management internally.

### MVP Scope Creep
* **Risk:** The desire to add multiple themes, markdown rendering, or other nice-to-have UI features to the initial version.
* **Mitigation:** This PRD clearly defines the MVP feature set. All additional UI enhancements are logged in the "Future Enhancements" backlog for later consideration.

---

## 8. Appendix

* **API Documentation:** [Link to the live, auto-generated Swagger UI for the Headless AI Chat API]
* **Design Mockups:** [Link to Figma/Sketch files for the widget's UI/UX]