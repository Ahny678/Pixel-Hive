-- CreateTable
CREATE TABLE "VideoJob" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "thumbnails" JSONB,
    "timestamps" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "errorMsg" TEXT,

    CONSTRAINT "VideoJob_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VideoJob" ADD CONSTRAINT "VideoJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
