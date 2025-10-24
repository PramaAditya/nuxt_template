import { PrismaClient } from '@prisma/client';
// @ts-ignore #logto import error
import { logtoEventHandler } from '#logto';

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

  const messageId = event.context.params?.id;

  if (!messageId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request: Missing messageId',
    });
  }

  const message = await prisma.chatMessage.findFirst({
    where: {
      id: messageId,
      session: {
        userId: user.id,
      },
    },
  });

  if (!message) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Message not found',
    });
  }

  await prisma.chatMessage.updateMany({
    where: {
      sessionId: message.sessionId,
      createdAt: {
        gte: message.createdAt,
      },
    },
    data: {
      isDeleted: true,
    },
  });

  return { success: true };
});