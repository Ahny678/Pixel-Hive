-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('IMAGE', 'VIDEO', 'PDF');

-- CreateEnum
CREATE TYPE "WatermarkType" AS ENUM ('TEXT', 'IMAGE');

-- CreateTable
CREATE TABLE "watermark_jobs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'pending',
    "errorMsg" TEXT,
    "inputFileUrl" TEXT NOT NULL,
    "inputFileType" "FileType" NOT NULL,
    "watermarkType" "WatermarkType" NOT NULL,
    "textContent" TEXT,
    "watermarkImageUrl" TEXT,
    "opacity" DOUBLE PRECISION,
    "position" TEXT,
    "fontSize" INTEGER,
    "outputFileUrl" TEXT,

    CONSTRAINT "watermark_jobs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "watermark_jobs" ADD CONSTRAINT "watermark_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
