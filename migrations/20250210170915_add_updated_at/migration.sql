/*
  Warnings:

  - A unique constraint covering the columns `[guestId]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `guestId` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `bottlemessage` DROP FOREIGN KEY `bottlemessage_receiverId_fkey`;

-- DropForeignKey
ALTER TABLE `bottlemessage` DROP FOREIGN KEY `bottlemessage_senderId_fkey`;

-- DropIndex
DROP INDEX `User_email_key` ON `user`;

-- AlterTable
ALTER TABLE `bottlemessage` ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    ADD COLUMN `isRead` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `guestId` VARCHAR(191) NOT NULL,
    ADD COLUMN `pushEnabled` BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX `user_guestId_key` ON `user`(`guestId`);

-- AddForeignKey
ALTER TABLE `bottlemessage` ADD CONSTRAINT `BottleMessage_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bottlemessage` ADD CONSTRAINT `BottleMessage_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `bottlemessage` RENAME INDEX `bottlemessage_receiverId_fkey` TO `BottleMessage_receiverId_fkey`;

-- RenameIndex
ALTER TABLE `bottlemessage` RENAME INDEX `bottlemessage_senderId_fkey` TO `BottleMessage_senderId_fkey`;
