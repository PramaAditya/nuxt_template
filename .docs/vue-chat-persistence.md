# Plan: Implementing Persistent Chat Conversations with a History Dialog

This document outlines the plan to upgrade the existing chat application to support a persistent, linear conversation model with a `shadcn-vue` dialog for browsing chat history.

### Goal

To create a system where:
1.  Chat conversations, including AI tool usage, are saved to a database.
2.  The initial URL of a chat is recorded.
3.  A user can browse their chat history in a dialog.
4.  New chats receive a provisional, timestamp-based title that is later updated by a lightweight AI model.
5.  From the dialog, a user can load a past chat or navigate to its original page.
6.  Users can delete a message and all of its subsequent messages.

---

## 1. Step 1: Database Schema

The Prisma schema will be updated to support a simple, linear conversation history.

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
}

model ChatMessage {
  id         String    @id @default(cuid())
  sessionId  String
  session    ChatSession @relation(fields: [sessionId], references: [id])
  role       String    // 'user' or 'assistant'
  content    Json
  createdAt  DateTime  @default(now())
}
```

---

## 2. Step 2: Backend API Endpoints & Logic

### New `DELETE /api/messages` Endpoint
This endpoint will handle the deletion of a message and all subsequent messages in the session.

**Request Body:** `{ messageId: string, sessionId: string }`

**Logic:**
1.  Receive the `messageId` and `sessionId`.
2.  Find the message to be deleted.
3.  Delete all messages in the same session that were created at or after the specified message.

### `GET /api/chat/[id]` Endpoint Update
This endpoint will fetch the messages for a given chat session in chronological order.

```typescript
// In server/api/chat/[id].get.ts
// ...
const messages = await prisma.chatMessage.findMany({ 
  where: { 
    sessionId: chatId,
  }, 
  orderBy: { createdAt: 'asc' } 
});
// ...
```

---

## 3. Step 3: Frontend Implementation

### `ChatPane.vue` Update
The `handleDelete` function will be changed to call our new API endpoint.

```vue
// In components/ChatPane.vue

const handleDelete = async (messageId: string) => {
  await fetch('/api/messages', {
    method: 'DELETE',
    body: JSON.stringify({ messageId, sessionId: currentSessionId.value }),
  });
  
  // After successful deletion, reload the chat to show the updated state
  loadChat(currentSessionId.value); 
};