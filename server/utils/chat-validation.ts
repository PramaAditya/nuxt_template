import type { User } from '@prisma/client';

export function canUserChat(user: User, model: 'free' | 'premium'): boolean {
  // TODO: Implement your business logic here.
  // For example, you could check if the user has enough credits
  // to use the requested model.
  console.log(`User ${user.id} is requesting to use the ${model} model.`);
  return true;
}