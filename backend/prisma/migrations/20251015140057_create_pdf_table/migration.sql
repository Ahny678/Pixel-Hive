-- CreateTable
CREATE TABLE "PdfJob" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "inputData" JSONB NOT NULL,
    "outputUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "errorMsg" TEXT,

    CONSTRAINT "PdfJob_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PdfJob" ADD CONSTRAINT "PdfJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
