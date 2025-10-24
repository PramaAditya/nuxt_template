/*
  Warnings:

  - You are about to drop the column `parentId` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `activeMessageId` on the `ChatSession` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ChatMessage" DROP CONSTRAINT "ChatMessage_parentId_fkey";

-- AlterTable
ALTER TABLE "public"."ChatMessage" DROP COLUMN "parentId";

-- AlterTable
ALTER TABLE "public"."ChatSession" DROP COLUMN "activeMessageId";
