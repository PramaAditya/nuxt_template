import { PrismaClient } from '@prisma/client';
// @ts-ignore #logto import error
import { logtoEventHandler } from '#logto';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  await logtoEventHandler(event, config);

  const logtoClient = event.context.logtoClient;

  if (logtoClient) {
    try {
      const claims = await logtoClient.getIdTokenClaims();

      if (claims && claims.sub) {
        // Check if the user already exists to avoid unnecessary writes
        const user = await prisma.user.findUnique({
          where: { logtoId: claims.sub },
        });

        // If the user does not exist, create them.
        if (!user) {
          console.log(`Creating new user with logtoId: ${claims.sub}`);
          // @ts-ignore
          await prisma.user.create({
            data: {
              logtoId: claims.sub,
              name: claims.name,
              picture: claims.picture,
            },
          });
        }
        else {
          console.log(`User with logtoId: ${claims.sub} already exists.`);
        }
      }
    }
    catch (error: any) {
      // logtoClient.getIdTokenClaims() throws an error if the user is not authenticated.
      // We can safely ignore this error.
      if (error.message !== 'Not authenticated.') {
        console.error('Failed to sync user with database:', error);
      }
    }
  }
});