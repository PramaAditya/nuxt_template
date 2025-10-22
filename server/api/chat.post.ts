import { PrismaClient } from '@prisma/client';
// @ts-ignore #logto import error
import { logtoEventHandler } from '#logto';
import { google } from '@ai-sdk/google';
import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { canUserChat } from '~/server/utils/chat-validation';

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

  const result = await streamText({
    model: google(modelName),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
});