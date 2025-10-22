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

  if (event.node.req.method === 'GET') {
    const user = await prisma.user.findUnique({
      where: { logtoId },
      select: {
        name: true,
        picture: true,
      },
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      });
    }

    return user;
  }

  if (event.node.req.method === 'PUT') {
    const body = await readBody(event);
    const { name, picture } = body;

    const updatedUser = await prisma.user.update({
      where: { logtoId },
      data: {
        name,
        picture,
      },
      select: {
        name: true,
        picture: true,
      },
    });

    return updatedUser;
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed',
  });
});