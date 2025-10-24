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
8.  Users can delete a message and all of its subsequent messages in a branch.

---

## 1. Step 1: Database Schema

The Prisma schema will be updated to include a soft-delete flag on messages.

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

  // New field for soft deletion
  isDeleted  Boolean   @default(false)
}
```

---

## 2. Step 2: Backend API Endpoints & Logic

### New `DELETE /api/chat-messages` Endpoint
This endpoint will handle the soft deletion of a message and its entire branch of descendants.

**Request Body:** `{ messageId: string }`

**Logic:**
1.  Receive the `messageId` to be deleted.
2.  Create a recursive function that finds all children, grandchildren, etc., of that message.
3.  Update all found message records, setting `isDeleted` to `true`.

### `GET /api/chat-sessions/[id]` Endpoint Update
This endpoint must now filter out deleted messages before building the tree.

```typescript
// In server/api/chat-sessions/[id].get.ts
// ...
const messages = await prisma.chatMessage.findMany({ 
  where: { 
    sessionId: chatId,
    isDeleted: false // Filter out deleted messages
  }, 
  orderBy: { createdAt: 'asc' } 
});
// ...
```

---

## 3. Step 3: Frontend Implementation

### `ChatPane.vue` & `HistoryDialog.vue` Updates

#### Deleting a Message Branch
The `handleDelete` function will be changed to call our new API endpoint.

```vue
// In components/ChatPane.vue

const handleDelete = async (messageId: string) => {
  await fetch('/api/chat-messages', {
    method: 'DELETE',
    body: JSON.stringify({ messageId }),
  });
  
  // After successful deletion, reload the chat to show the updated state
  // This will call the GET /api/chat-sessions/[id] endpoint again
  loadChat(currentSessionId.value);
};
```

#### Loading a Conversation from History
The mechanism for loading a past conversation will follow the existing pattern in the application, where `HistoryDialog.vue` emits an event that `ChatPane.vue` listens for.

1.  **`HistoryDialog.vue`**: When a user selects a conversation, it will emit a `loadChat` event with the array of messages for that conversation.
2.  **`ChatPane.vue`**: A listener for the `loadChat` event (`handleLoadChat`) will clear the current messages from the `chat` instance and replace them with the messages from the selected conversation.

This keeps the components decoupled and reuses the existing Vercel AI `chat` instance without needing to re-instantiate it.

```vue
// In components/ChatPane.vue
function handleLoadChat(messages: UIMessage[]) {
  // Clear existing messages from the Vercel AI chat instance
  chat.messages.splice(0, chat.messages.length);
  // Push the loaded messages
  chat.messages.push(...messages);
}
```

This ensures that deletions and conversation loading are handled persistently and correctly within our branching data model.