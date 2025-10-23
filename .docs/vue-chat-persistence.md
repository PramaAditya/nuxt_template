# Plan: Implementing Persistent, Branching Conversations with a History Dialog

This document outlines the plan to upgrade the existing chat application to support a persistent, tree-based conversation model with a `shadcn-vue` dialog for browsing chat history and in-line controls for navigating between conversation branches.

### Goal

To create a system where:
1.  Chat conversations, including AI tool usage, are saved to a database with branching support.
2.  The initial URL of a chat is recorded.
3.  The last active branch of a conversation is remembered and restored automatically.
4.  A user can browse their chat history in a dialog.
5.  New chats receive a provisional, timestamp-based title that is later updated by a lightweight AI model.
6.  From the dialog, a user can load a past chat or navigate to its original page.
7.  Users can navigate between different conversation branches using a pagination-style control (`< 1/3 >`).

---

## 1. Step 1: Database Schema

The Prisma schema will be updated with more descriptive model names and all necessary fields.

```prisma
// In your prisma/schema.prisma

model User {
  // ... existing User fields
  chatSessions ChatSession[]
}

model ChatSession {
  id        String    @id @default(cuid())
  title     String?
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  messages  ChatMessage[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  sourceUrl String?
  activeMessageId String?
}

model ChatMessage {
  id         String    @id @default(cuid())
  sessionId  String
  session    ChatSession @relation(fields: [sessionId], references: [id])
  parentId   String?
  parent     ChatMessage?  @relation("MessageChildren", fields: [parentId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  children   ChatMessage[] @relation("MessageChildren")
  role       String    // 'user' or 'assistant'
  content    Json
  createdAt  DateTime  @default(now())
}
```

---

## 2. Step 2: Backend API Endpoints & Logic

### Data Flow Diagrams

#### New Chat & Branching Flow
```mermaid
sequenceDiagram
    actor User
    participant ChatPaneVue as [ChatPane.vue Client]
    participant ChatPostAPI as [POST /api/chat]
    participant PrismaDB as [Prisma / Database]
    participant AISDK as [AI SDK / Google AI]

    %% New Chat Flow
    User->>ChatPaneVue: Sends first message
    activate ChatPaneVue
    ChatPaneVue->>ChatPaneVue: Generates provisional title
    ChatPaneVue->>ChatPostAPI: POST /api/chat {sessionId: null, parentId: null, message, ...}
    deactivate ChatPaneVue
    activate ChatPostAPI

    ChatPostAPI->>PrismaDB: Create new ChatSession record
    activate PrismaDB
    PrismaDB-->>ChatPostAPI: Returns new sessionId
    deactivate PrismaDB

    ChatPostAPI->>AISDK: streamText(...)
    activate AISDK
    AISDK-->>ChatPostAPI: Streams response
    deactivate AISDK
    
    Note right of ChatPostAPI: Server sends new sessionId back to client
    ChatPostAPI-->>ChatPaneVue: Streams UI response (incl. new sessionId)
    activate ChatPaneVue
    ChatPaneVue->>ChatPaneVue: Stores the new sessionId
    deactivate ChatPaneVue

    Note over ChatPostAPI: onFinish: save messages, update activeMessageId
    deactivate ChatPostAPI
    
    %% Existing Chat / Branching Flow
    User->>ChatPaneVue: Edits a message
    activate ChatPaneVue
    ChatPaneVue->>ChatPostAPI: POST /api/chat {sessionId, parentId, ...}
    deactivate ChatPaneVue
    activate ChatPostAPI
    ChatPostAPI->>PrismaDB: Reconstruct history from parentId
    activate PrismaDB
    PrismaDB-->>ChatPostAPI: Returns linear history
    deactivate PrismaDB
    ChatPostAPI->>AISDK: streamText(...)
    activate AISDK
    AISDK-->>ChatPostAPI: Streams response
    deactivate AISDK
    ChatPostAPI-->>ChatPaneVue: Streams UI response
    activate ChatPaneVue
    Note over ChatPostAPI: onFinish: save messages, update activeMessageId, trigger title gen
    deactivate ChatPostAPI
    deactivate ChatPaneVue
```

#### Loading & Navigation Flow
```mermaid
sequenceDiagram
    actor User
    participant ChatPaneVue as [ChatPane.vue Client]
    participant ChatGetAPI as [GET /api/chat/[id]]
    participant PrismaDB as [Prisma / Database]

    %% Load Chat History Flow
    User->>ChatPaneVue: Clicks 'Open Chat' for Session ID 'XYZ'
    activate ChatPaneVue
    ChatPaneVue->>ChatGetAPI: GET /api/chat/XYZ
    activate ChatGetAPI
    ChatGetAPI->>PrismaDB: Find session and all related messages
    activate PrismaDB
    PrismaDB-->>ChatGetAPI: Return session and flat message list
    deactivate PrismaDB
    ChatGetAPI->>ChatGetAPI: buildTree utility processes messages
    ChatGetAPI-->>ChatPaneVue: Return { tree, activeMessageId }
    deactivate ChatGetAPI
    ChatPaneVue->>ChatPaneVue: Stores tree and determines active branch from activeMessageId
    ChatPaneVue-->>User: Displays the loaded chat session
    deactivate ChatPaneVue

    %% Change Branch Flow (Client-Side Only)
    User->>ChatPaneVue: Clicks branch navigation '<' or '>' on a message
    activate ChatPaneVue
    ChatPaneVue->>ChatPaneVue: Updates its internal 'activeChildren' map
    Note right of ChatPaneVue: The 'visibleMessages' computed property reactively updates
    ChatPaneVue-->>User: Displays the newly selected branch
    deactivate ChatPaneVue
```

### API Endpoint Details
- **`POST /api/chat`**: Handles creating/continuing conversations.
- **`GET /api/chats`**: Fetches the list of all `ChatSession` records for the user.
- **`GET /api/chat/[id]`**: Fetches a single `ChatSession` and its full message tree.

---

## 3. Step 3: Frontend Implementation

- **`ChatPane.vue`**: Will be refactored to manage the full message tree state, handle the history dialog, and manage the provisional title logic.
- **`HistoryDialog.vue`**: A new component to display the list of chat sessions.
- **`Message.vue`**: Will be updated to display the `< 1/3 >` branch navigation controls.

This fully detailed plan now covers the complete data flow, error conditions, and utility function signatures, making it a clear guide for implementation.