/*
  Warnings:

  - Added the required column `role` to the `eventHost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `eventHost` ADD COLUMN `role` ENUM('DEAD', 'CHIEF_MOURNER', 'MOURNER', 'GROOM', 'BRIDE', 'GROOM_FATHER', 'GROOM_MOTHER', 'BRIDE_FATHER', 'BRIDE_MOTHER') NOT NULL;
