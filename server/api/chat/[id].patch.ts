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

  const sessionId = event.context.params?.id;

  if (!sessionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request: Missing sessionId',
    });
  }

  const { title } = await readBody(event);

  if (!title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request: Missing title',
    });
  }

  const updatedSession = await prisma.chatSession.update({
    where: {
      id: sessionId,
      userId: user.id,
    },
    data: {
      title,
    },
  });

  return updatedSession;
});