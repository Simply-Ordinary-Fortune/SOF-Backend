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
    `imageUrl` VARCHAR(191) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,

    INDEX `BottleMessage_receiverId_fkey`(`receiverId`),
    INDEX `BottleMessage_senderId_fkey`(`senderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sourceFile` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `syncStatus` VARCHAR(191) NOT NULL DEFAULT 'SUCCESS',

    INDEX `Record_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sourceFile` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `syncStatus` VARCHAR(191) NOT NULL DEFAULT 'SUCCESS',
    `pushEnabled` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bottlemessage` ADD CONSTRAINT `BottleMessage_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bottlemessage` ADD CONSTRAINT `BottleMessage_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record` ADD CONSTRAINT `Record_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
