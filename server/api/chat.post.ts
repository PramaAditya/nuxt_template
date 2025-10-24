import { PrismaClient } from '@prisma/client';
// @ts-ignore #logto import error
import { logtoEventHandler } from '#logto';
import { google } from '@ai-sdk/google';
import { streamText, UIMessage, convertToModelMessages, tool, stepCountIs, createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import { canUserChat } from '~/server/utils/chat-validation';
import { renderTemplate } from '~/server/utils/templating';
import { getChatMode } from '~/server/ai-chat/modes';
import { generateTitle } from '~/server/utils/title-generator';
import { z } from 'zod';
import { create, all } from 'mathjs';
import { pathToFileURL } from 'url';

const math = create(all);
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  await logtoEventHandler(event, config);

  const logtoClient = event.context.logtoClient;

  if (!logtoClient || !await logtoClient.isAuthenticated()) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const claims = await logtoClient.getIdTokenClaims();
  const logtoId = claims.sub;

  if (!logtoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request: Missing logtoId',
    });
  }

  const user = await prisma.user.findUnique({
    where: { logtoId },
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    });
  }

  const {
    messages,
    model: requestedModel,
    mode = 'default',
    sessionId: clientSessionId,
    sourceUrl,
  }: {
    messages: UIMessage[];
    model: 'free' | 'premium';
    mode?: string;
    sessionId?: string | null;
    sourceUrl?: string;
  } = await readBody(event);

  let sessionId = clientSessionId;

  console.debug(
    '[server/api/chat.post.ts] chat request:',
    {
      mode,
      model: requestedModel,
      userText: messages.at(-1)?.parts,
      sessionId,
      sourceUrl,
    }
  );

  if (!canUserChat(user, requestedModel)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    });
  }

  const modelName = requestedModel === 'premium'
    ? config.public.ai.premiumModel
    : config.public.ai.freeModel;

  const chatMode = getChatMode(mode);

  if (!chatMode) {
    throw createError({
      statusCode: 400,
      statusMessage: `Bad Request: Invalid chat mode "${mode}"`,
    });
  }

  const systemPrompt = renderTemplate(chatMode.systemPrompt, {
    datetime: new Date().toISOString(),
  });

  const toolsURL = pathToFileURL(chatMode.toolsPath).href;
  const { tools } = await import(toolsURL);

  // Ensure a session exists
  if (!sessionId) {
    const newSession = await prisma.chatSession.create({
      data: {
        userId: user.id,
        sourceUrl,
        title: `New Chat ${new Date().toLocaleString()}`,
      },
    });
    sessionId = newSession.id;
  }

  const sessionHistory = await prisma.chatMessage.findMany({
    where: {
      sessionId,
      isDeleted: false,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const history = sessionHistory.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content as any,
  }));

  const stream = createUIMessageStream({
    async execute({ writer }) {
      writer.write({
        type: 'data-custom',
        data: { sessionId },
      });

      const result = await streamText({
        model: google(modelName),
        system: systemPrompt,
        messages: [
          ...history,
          ...convertToModelMessages(messages),
        ],
        tools,
        stopWhen: stepCountIs(5),
        onFinish: async ({ usage, finishReason, text }) => {
          console.debug('[server/api/chat.post.ts] Token usage:', usage);

          const userMessage = messages.at(-1);
          if (userMessage) {
            const userMessageRecord = await prisma.chatMessage.create({
              data: {
                sessionId: sessionId!,
                role: 'user',
                content: userMessage.parts as any,
              },
            });

            const assistantMessageRecord = await prisma.chatMessage.create({
              data: {
                sessionId: sessionId!,
                role: 'assistant',
                content: [{ type: 'text', text }] as any,
              },
            });

            // Generate title only for the first exchange in a new chat
            if (history.length === 0) {
              const newTitle = await generateTitle([userMessageRecord, assistantMessageRecord]);
              await prisma.chatSession.update({
                where: { id: sessionId! },
                data: { title: newTitle },
              });
            }
          } else {
            // Should not happen in a normal flow, but handle it just in case
            await prisma.chatMessage.create({
              data: {
                sessionId: sessionId!,
                role: 'assistant',
                content: [{ type: 'text', text }] as any,
              },
            });
          }
        },
      });

      writer.merge(result.toUIMessageStream());
    },
  });

  return createUIMessageStreamResponse({ stream });
});