-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "logtoId" TEXT NOT NULL,
    "name" TEXT,
    "picture" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_logtoId_key" ON "public"."User"("logtoId");
