import { PrismaClient } from '@prisma/client';
// @ts-ignore #logto import error
import { logtoEventHandler } from '#logto';
import { google } from '@ai-sdk/google';
import { streamText, UIMessage, convertToModelMessages, tool, stepCountIs } from 'ai';
import { canUserChat } from '~/server/utils/chat-validation';
import { tools } from '~/server/tools';
import { renderTemplate } from '~/server/utils/templating';
import { readFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
import { create, all } from 'mathjs';

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

  const { messages, model: requestedModel }: { messages: UIMessage[], model: 'free' | 'premium' } = await readBody(event);

  if (!canUserChat(user, requestedModel)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    });
  }

  const modelName = requestedModel === 'premium'
    ? config.public.ai.premiumModel
    : config.public.ai.freeModel;

  const systemPromptTemplate = readFileSync(join(process.cwd(), 'server/chat-modes/default.md'), 'utf-8');
  const systemPrompt = renderTemplate(systemPromptTemplate, {
    datetime: new Date().toISOString(),
  });

  const result = await streamText({
    model: google(modelName),
    system: systemPrompt,
    messages: convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(5),
    onFinish: ({ usage }) => {
      console.debug('[chat.post.ts] Token usage:', usage);
    },
  });

  return result.toUIMessageStreamResponse();
});