-- AlterTable
ALTER TABLE `bottlemessage` ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    ADD COLUMN `isRead` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `pushEnabled` BOOLEAN NOT NULL DEFAULT true;
