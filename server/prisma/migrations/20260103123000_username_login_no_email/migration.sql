-- Add username login + remove email verification fields

-- 1) Add username
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- Backfill username from email prefix (safe for existing rows)
UPDATE "User"
SET "username" = LOWER(SPLIT_PART("email", '@', 1))
WHERE "username" IS NULL;

-- Fallback if any rows still missing (shouldn't happen if email existed)
UPDATE "User"
SET "username" = CONCAT('user_', SUBSTRING("id", 1, 8))
WHERE "username" IS NULL;

ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- 2) Email is optional now
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

-- 3) Drop email verification columns (no-email flow)
ALTER TABLE "User" DROP COLUMN IF EXISTS "emailVerified";
ALTER TABLE "User" DROP COLUMN IF EXISTS "emailVerificationTokenHash";
ALTER TABLE "User" DROP COLUMN IF EXISTS "emailVerificationTokenExpiresAt";
ALTER TABLE "User" DROP COLUMN IF EXISTS "emailVerificationSentAt";
