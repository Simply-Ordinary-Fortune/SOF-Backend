-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sourceFile` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `syncStatus` VARCHAR(191) NOT NULL DEFAULT 'SUCCESS',
    `pushEnabled` BOOLEAN NOT NULL DEFAULT true,
    `guestId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_guestId_key`(`guestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Record` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sourceFile` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `syncStatus` VARCHAR(191) NOT NULL DEFAULT 'SUCCESS',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bottlemessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `senderId` INTEGER NOT NULL,
    `receiverId` INTEGER NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sourceFile` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `syncStatus` VARCHAR(191) NOT NULL DEFAULT 'SUCCESS',
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `imageUrl` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Record` ADD CONSTRAINT `Record_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bottlemessage` ADD CONSTRAINT `bottlemessage_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bottlemessage` ADD CONSTRAINT `bottlemessage_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
