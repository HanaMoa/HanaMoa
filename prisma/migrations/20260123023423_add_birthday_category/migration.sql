/*
  Warnings:

  - You are about to drop the column `relation` on the `eventHost` table. All the data in the column will be lost.
  - Added the required column `relation` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `eventHost` DROP COLUMN `relation`;

-- AlterTable
ALTER TABLE `events` ADD COLUMN `category` ENUM('WEDDING', 'FUNERAL', 'BIRTHDAY') NOT NULL DEFAULT 'WEDDING',
    ADD COLUMN `name` VARCHAR(191) NOT NULL DEFAULT '이벤트',
    MODIFY `location` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `relation` VARCHAR(191) NOT NULL;
