# System Architecture & Technical Specifications: Embeddable AI Chatbot Widget (MFE)

**Author:** Lester Dela Vega
**Date:** 2025-06-21

-----

## 1\. Architectural Drivers & Decisions (The "Why")

This section covers the technical drivers and high-level architectural decisions that align with the product's goals.

### 1.1. Overview & Business Goals

The primary technical goal is to engineer a **portable, framework-agnostic, client-side Micro-Frontend (MFE)**. This application will serve as the user interface for the headless AI Chat API. It must be self-contained, performant, and designed for dead-simple integration into any host website, thereby providing a scalable solution for adding a chat UI without requiring frontend development from the consumer.

### 1.2. Key Architectural Drivers

#### Constraints

  * **Technical:** The application must be built using a modern JavaScript toolchain (Vite, React, TypeScript). It must compile into a single JavaScript bundle to facilitate easy embedding. The application must be completely stateless, relying on the external API for all business logic.
  * **Budgetary:** The compiled artifact must be deployable on free-tier static hosting platforms or CDNs.
  * **Integration:** Must be able to run on any HTML page, regardless of the host website's framework (or lack thereof).

#### Non-Functional Requirements (NFRs)

  * **Performance:** The initial gzipped bundle size should be under 75kB to ensure a fast load time. The UI must remain responsive and avoid jank, especially while rendering streaming text responses.
  * **Portability:** The widget must not depend on any global variables or libraries (like jQuery) provided by the host page. It must be entirely self-sufficient.
  * **Security:** The widget must not store any long-term secrets. The API key will be received at runtime, held in memory for the duration of the session, and never persisted. All communication with the backend API must be over HTTPS.
  * **Style Encapsulation:** The widget's CSS must not conflict with the host page's styles.

### 1.3. Core Architectural Decisions

  * **Architectural Pattern:** **Micro-Frontend (MFE).** The application is designed as a "guest" that is dynamically loaded and mounted into a "host" webpage. This pattern ensures complete decoupling.
  * **Technology Stack:** **Vite + React + TypeScript**. This stack was chosen for Vite's optimized build tooling that easily produces small bundles, React's powerful ecosystem for building interactive UIs, and TypeScript's robust type safety.
  * **State Management:** For the MVP, state will be managed locally within React components using built-in hooks (`useState`, `useReducer`). The core chat logic will be encapsulated in a custom hook leveraging the Vercel `ai/react` library for efficient handling of streaming state.
  * **Integration Method:** **Dynamic Script Loading with `data-*` attribute configuration.** The host page provides a `<div>` mount point and a `<script>` tag. The script loads the MFE bundle, which then reads its configuration (API URL, key) from the `data-*` attributes on the mount point.

-----

## 2\. High-Level System Design (The "What")

This section provides a visual overview of the MFE's internal structure and its place in the broader system.

### 2.1. Architecture Diagram

This diagram shows the internal components of the MFE and its interaction with the host page and the external API.

```mermaid
graph TD
    subgraph Host Website
        A[HTML Page]
        B(div#ai-chatbot-root)
        C(script tag)
        A -- Contains --> B
        A -- Contains --> C
    end

    subgraph "Chatbot MFE (Loaded by Script)"
        D[Entrypoint/Config Loader]
        E[State Manager <br> (useChat Hook)]
        F[UI Components <br> (ChatWindow, MessageList, etc.)]
        G[API Client <br> (fetch)]

        D -- Reads config from --> B
        D -- Initializes --> E
        E -- Provides state to --> F
        F -- Triggers actions in --> E
        E -- Makes calls via --> G
    end
    
    subgraph External Services
        H[Headless AI Chat API]
    end

    C -- Loads --> D
    G -- HTTPS Request --> H

```

*Diagram shows the Host Website containing the mount `div` and `script` tag. The script loads the MFE, which reads its configuration from the `div`, initializes its state manager and UI, and communicates with the external Headless API.*

### 2.2. System Workflow Example: End-User Sends a Message

This sequence diagram details the internal and external interactions when a user sends a message.

```mermaid
sequenceDiagram
    participant User
    participant ChatInput as UI: Chat Input
    participant StateManager as State: useChat Hook
    participant APIClient as API Client
    participant HeadlessAPI as External: Headless AI Chat API

    User->>ChatInput: Types "Hello" and clicks Send
    ChatInput->>StateManager: Calls sendMessage("Hello")
    StateManager->>StateManager: Adds user message to local state
    StateManager->>APIClient: POST request with message history
    APIClient->>HeadlessAPI: POST /api/v1/chat/stream
    HeadlessAPI-->>APIClient: Begins streaming response chunks
    APIClient-->>StateManager: Forwards stream chunks
    StateManager-->>StateManager: Appends chunks to assistant message in local state
    Note right of User: User sees the AI's reply typing out in real-time
```

*Workflow demonstrates the flow from user input to state update, the API call, and the real-time rendering of the streaming response.*

-----

## 3\. Technology & Environment (The "With")

This section details the specific technologies used and the development environment.

### 3.1. Development Environment Setup

  * **Node.js:** `v20.x` or later.
  * **Package Management:** `pnpm` is the recommended package manager.
  * **Git:** For version control.

### 3.2. Technology Stack

| Category | Technology | Rationale & Usage Notes |
| :--- | :--- | :--- |
| **Build Tool** | `Vite` | Chosen for its fast development server and optimized build outputs for libraries/MFEs. |
| **UI Framework** | `React` | Industry-standard for building complex, stateful user interfaces. |
| **Language** | `TypeScript` | For end-to-end type safety from API client to UI components. |
| **Styling** | `Tailwind CSS` | Utility-first for rapid development. Will be configured with a prefix to prevent style collisions. |
| **State Management** | Vercel `ai/react` SDK | Provides the `useChat` hook for robust, out-of-the-box management of streaming chat state. |
| **API Communication** | `fetch` API | The `useChat` hook uses the browser-native `fetch` API internally. |
| **Hosting** | Static CDN | The final build artifact is a single JS file, hostable on any CDN or static hosting platform. |

-----

## 4\. Detailed Technical Implementation (The "How")

This section provides granular details on implementation patterns and conventions.

### 4.1. Key Implementation Decisions

  * **Embedding & Configuration:** The application's main entry point (`main.tsx`) will be responsible for finding the mount `div` (e.g., `#ai-chatbot-root`) and extracting the `data-api-url` and `data-api-key` from its dataset attributes. These values will be passed as configuration to the main React `App` component.
  * **Streaming Logic:** The Vercel AI SDK's `useChat` hook will be the core of the chat functionality. It will be configured at initialization with the `apiUrl` and `headers` (containing the `X-API-Key`) read from the embedding configuration. This decision mitigates the risk of implementing complex streaming logic manually.
  * **Fullscreen Mode:** A simple React state (`const [isFullscreen, setIsFullscreen] = useState(false)`) will be used. When `isFullscreen` is `true`, a CSS class will be conditionally applied to the widget's root element. This class will apply `position: fixed`, `inset: 0`, `z-index: 9999`, and other styles to make it cover the viewport.
  * **Style Encapsulation:** To prevent CSS conflicts with host websites, the `tailwind.config.js` file will be configured with a `prefix`. For example, setting `prefix: 'aicb-'` will transform utilities like `bg-blue-500` into `aicb-bg-blue-500`, guaranteeing style isolation.

### 4.2. Design Patterns & Coding Conventions

  * **Folder Structure:** A standard feature-based React project structure will be used:
    ```
    /src
        /components  # Generic, reusable UI (Button, Icon, etc.)
        /features    # Feature-specific components (ChatWindow, MessageList)
        /hooks       # Custom hooks (e.g., useFullscreenToggle)
        /lib         # Utility functions
        main.tsx     # Application entry point
    ```
  * **Component Design:** Components will be small and follow the single-responsibility principle. Headless component libraries (e.g., Radix UI) may be used as a base for UI elements like dialogs to ensure high quality and accessibility.
  * **Custom Hooks:** All non-trivial stateful logic will be extracted into custom hooks to promote reusability and separation of concerns (e.g., `useWidgetConfig` to read `data-*` attributes).

### 4.3. Technical Constraints

  * The final build output must be a single JavaScript file. Vite's library mode will be configured to achieve this.
  * The application must not rely on any global variables or libraries (like jQuery or even React) from the host page. React will be bundled into the application.
  * The application must gracefully handle and display network errors or non-200 status codes from the API, informing the user that the service is unavailable.

-----

## 5\. Future Considerations

  * **Theming:** To support the "theme customization" feature, the `useWidgetConfig` hook would be extended to read additional `data-theme-primary-color` attributes. These values would then be applied to the root element as CSS variables, allowing for easy themeing.
  * **`localStorage` History:** To support conversation persistence, the `useChat` hook can be wrapped in another custom hook that synchronizes its `messages` state with `localStorage` on change. An initial configuration `data-enable-history="true"` would be used to enable this feature.
  * **Testing Strategy:** The project will include unit tests for hooks and components using `Vitest`. End-to-end testing of the embedding mechanism will be done using a simple `index.html` file within a `/test-harness` directory.