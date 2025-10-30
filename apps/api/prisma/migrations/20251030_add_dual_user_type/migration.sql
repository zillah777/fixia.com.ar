-- AlterEnum: Add 'dual' to UserType enum
ALTER TYPE "UserType" ADD VALUE IF NOT EXISTS 'dual';
