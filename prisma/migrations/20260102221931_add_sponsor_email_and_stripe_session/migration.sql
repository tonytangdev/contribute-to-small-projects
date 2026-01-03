-- AlterTable
ALTER TABLE "sponsors" ADD COLUMN "email" TEXT;
ALTER TABLE "sponsors" ADD COLUMN "stripe_session_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "sponsors_stripe_session_id_key" ON "sponsors"("stripe_session_id");
