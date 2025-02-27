-- MySQL dump 10.13  Distrib 8.0.37, for Win64 (x86_64)
--
-- Host: sof-backend-db.cpsc8mo0gxdg.ap-southeast-2.rds.amazonaws.com    Database: SOFBackendDB
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `bottlemessage`
--

DROP TABLE IF EXISTS `bottlemessage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bottlemessage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `senderId` int NOT NULL,
  `receiverId` int NOT NULL,
  `message` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sentAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `sourceFile` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL,
  `syncStatus` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SUCCESS',
  `imageUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `BottleMessage_receiverId_fkey` (`receiverId`),
  KEY `BottleMessage_senderId_fkey` (`senderId`),
  CONSTRAINT `BottleMessage_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `BottleMessage_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bottlemessage`
--

LOCK TABLES `bottlemessage` WRITE;
/*!40000 ALTER TABLE `bottlemessage` DISABLE KEYS */;
INSERT INTO `bottlemessage` VALUES (1,1,2,'1번이 보내는 편지','2025-02-11 04:10:42.980',NULL,'2025-02-10 19:15:08.236','SUCCESS','image1.png',1),(2,1,3,'키키','2024-02-11 04:10:42.980',NULL,'2025-02-10 19:16:07.386','SUCCESS','image2.png',1),(3,1,2,'1번이 보내는 편지','2025-05-11 04:12:14.849',NULL,'2025-02-10 19:16:07.386','SUCCESS','image1.png',1),(4,1,2,'키키2','2025-02-11 04:12:14.849',NULL,'2025-02-10 19:15:08.236','SUCCESS','image2.png',1);
/*!40000 ALTER TABLE `bottlemessage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `record`
--

DROP TABLE IF EXISTS `record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `record` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `content` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `sourceFile` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL,
  `syncStatus` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SUCCESS',
  `tags` json DEFAULT NULL,
  `imageUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Record_userId_fkey` (`userId`),
  CONSTRAINT `Record_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `record`
--

LOCK TABLES `record` WRITE;
/*!40000 ALTER TABLE `record` DISABLE KEYS */;
INSERT INTO `record` VALUES (1,1,'1번이 보내는 편지','2025-02-09 12:00:00.000',NULL,'2024-02-10 12:00:00.000','SUCCESS',NULL,'image1.png'),(2,1,'키키','2025-02-09 13:00:00.000',NULL,'2024-02-10 13:00:00.000','SUCCESS',NULL,'image2.png');
/*!40000 ALTER TABLE `record` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `sourceFile` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updatedAt` datetime(3) DEFAULT NULL,
  `syncStatus` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SUCCESS',
  `pushEnabled` tinyint(1) NOT NULL DEFAULT '1',
  `guestId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_guestId_key` (`guestId`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,NULL,NULL,'2025-02-10 18:38:24.844',NULL,'2025-02-11 18:38:24.844','SUCCESS',1,'6dfbea51-17db-4029-9e28-8472016d62ac'),(2,NULL,NULL,'2025-02-10 18:38:56.852',NULL,'2025-02-11 19:01:56.035','SUCCESS',0,'edcfcfd8-8a84-496d-9d08-2909980d2a42'),(3,NULL,NULL,'2025-02-10 19:02:42.042',NULL,'2025-02-10 19:02:42.042','SUCCESS',1,'99207aaf-a44c-4c20-b28c-1a3b7daeff53'),(4,NULL,NULL,'2025-02-10 19:02:42.042',NULL,'2025-02-10 19:02:42.042','SUCCESS',1,'1234');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-12  0:28:52
