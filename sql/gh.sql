-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 18.143.141.150    Database: movie_ticket_sales
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `booking_id` int NOT NULL AUTO_INCREMENT,
  `booking_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int DEFAULT NULL,
  `showtime_id` int NOT NULL,
  `customer_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `booking_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `total_seats` int NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `service_fee` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('PENDING','CONFIRMED','PAID','CANCELLED','REFUNDED','COMPLETED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `payment_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_status` enum('PENDING','PROCESSING','COMPLETED','FAILED','REFUNDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `payment_reference` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `hold_expires_at` timestamp NULL DEFAULT NULL,
  `qr_code` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invoice_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invoice_issued_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `points_used` int DEFAULT '0',
  PRIMARY KEY (`booking_id`),
  UNIQUE KEY `booking_code` (`booking_code`),
  KEY `idx_booking_code` (`booking_code`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_showtime_id` (`showtime_id`),
  KEY `idx_status` (`status`),
  KEY `idx_booking_date` (`booking_date`),
  KEY `idx_bookings_date_status` (`booking_date`,`status`),
  KEY `idx_bookings_points_used` (`points_used`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`showtime_id`) REFERENCES `showtimes` (`showtime_id`),
  CONSTRAINT `chk_booking_amounts` CHECK (((`total_amount` >= 0) and (`subtotal` >= 0)))
) ENGINE=InnoDB AUTO_INCREMENT=132 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (95,'BK202512080357396119',10,16,'Nguyễn Đoàn Duy Khánh','khanhkhoi08@gmail.com','0915232119','2025-12-07 20:57:40',2,90000.00,0.00,9000.00,10000.00,279500.00,'COMPLETED','BANK_TRANSFER','COMPLETED','TXN2D024504','2025-12-07 20:58:08','2025-12-07 21:12:40','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/qr-codes/QR_BK202512080357396119_be425c71-9d49-4d06-91bc-b2032bd6a768.png','INV1765141088663','2025-12-07 20:58:09','2025-12-07 20:57:40','2025-12-07 21:00:29',0),(96,'BK202512080411566085',10,16,'Nguyễn Đoàn Duy Khánh','khanhkhoi08@gmail.com','0915232119','2025-12-07 21:11:57',2,90000.00,54000.00,9000.00,10000.00,187000.00,'PAID','BANK_TRANSFER','COMPLETED','TXN36D3EC94','2025-12-07 21:12:24','2025-12-07 21:26:57','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/qr-codes/QR_BK202512080411566085_9713b23d-1e47-4497-bfb0-4620cb299232.png','INV1765141944602','2025-12-07 21:12:25','2025-12-07 21:11:57','2025-12-07 21:12:24',54),(97,'BK202512080713332764',10,16,'Nguyễn Đoàn Duy Khánh','khanhkhoi08@gmail.com','0915232119','2025-12-08 00:13:34',2,90000.00,54000.00,9000.00,10000.00,302500.00,'CANCELLED','BANK_TRANSFER','PENDING',NULL,NULL,'2025-12-08 00:28:34',NULL,NULL,NULL,'2025-12-08 00:13:34','2025-12-08 00:29:07',54),(98,'BK202512080732386335',10,16,'Nguyễn Đoàn Duy Khánh','khanhkhoi08@gmail.com','0915232119','2025-12-08 00:32:39',2,90000.00,54000.00,9000.00,10000.00,192500.00,'CANCELLED','BANK_TRANSFER','PENDING',NULL,NULL,'2025-12-08 00:47:39',NULL,NULL,NULL,'2025-12-08 00:32:39','2025-12-08 00:48:07',54),(99,'BK202512080743488444',10,16,'Nguyễn Đoàn Duy Khánh','khanhkhoi08@gmail.com','0915232119','2025-12-08 00:43:49',2,90000.00,0.00,9000.00,10000.00,191500.00,'CANCELLED','BANK_TRANSFER','PENDING',NULL,NULL,'2025-12-08 00:58:49',NULL,NULL,NULL,'2025-12-08 00:43:49','2025-12-08 00:59:06',0),(100,'BK202512080744392266',10,16,'Nguyễn Đoàn Duy Khánh','khanhkhoi08@gmail.com','0915232119','2025-12-08 00:44:39',1,45000.00,27000.00,4500.00,5000.00,55000.00,'CANCELLED','BANK_TRANSFER','PENDING',NULL,NULL,'2025-12-08 00:59:39',NULL,NULL,NULL,'2025-12-08 00:44:39','2025-12-08 00:59:54',27),(101,'BK202512080751583235',10,16,'Nguyễn Đoàn Duy Khánh','khanhkhoi08@gmail.com','0915232119','2025-12-08 00:51:58',1,45000.00,52000.00,4500.00,5000.00,52500.00,'CANCELLED','BANK_TRANSFER','PENDING',NULL,NULL,'2025-12-08 01:06:58',NULL,NULL,NULL,'2025-12-08 00:51:58','2025-12-08 00:59:42',52),(102,'BK202512080753311941',10,16,'Nguyễn Đoàn Duy Khánh','khanhkhoi08@gmail.com','0915232119','2025-12-08 00:53:31',6,270000.00,225000.00,27000.00,30000.00,302000.00,'CANCELLED','BANK_TRANSFER','PENDING',NULL,NULL,'2025-12-08 01:08:31',NULL,NULL,NULL,'2025-12-08 00:53:31','2025-12-08 00:59:24',225),(103,'BK202512080803135544',10,16,'Nguyễn Đoàn Duy Khánh','khanhkhoi08@gmail.com','0915232119','2025-12-08 01:03:13',2,90000.00,0.00,9000.00,10000.00,109000.00,'CANCELLED','BANK_TRANSFER','PENDING',NULL,NULL,'2025-12-08 01:18:13',NULL,NULL,NULL,'2025-12-08 01:03:13','2025-12-08 01:03:27',0),(104,'BK202512080804008335',10,16,'Nguyễn Đoàn Duy Khánh','khanhkhoi08@gmail.com','0915232119','2025-12-08 01:04:01',2,90000.00,0.00,9000.00,10000.00,159000.00,'CANCELLED','BANK_TRANSFER','PENDING',NULL,NULL,'2025-12-08 01:19:01',NULL,NULL,NULL,'2025-12-08 01:04:01','2025-12-08 01:19:06',0),(105,'BK202512080821135714',10,16,'Nguyễn Đoàn Duy Khánh','khanhkhoi08@gmail.com','0915232119','2025-12-08 01:21:14',2,90000.00,0.00,9000.00,10000.00,159000.00,'CANCELLED','BANK_TRANSFER','PENDING',NULL,NULL,'2025-12-08 01:36:14',NULL,NULL,NULL,'2025-12-08 01:21:14','2025-12-08 01:36:43',0),(106,'BK202512080832556393',10,16,'Nguyễn Đoàn Duy Khánh','khanhkhoi08@gmail.com','0915232119','2025-12-08 01:32:56',2,90000.00,0.00,9000.00,10000.00,309000.00,'CANCELLED','BANK_TRANSFER','PENDING',NULL,NULL,'2025-12-08 01:37:56',NULL,NULL,NULL,'2025-12-08 01:32:56','2025-12-08 01:57:12',0),(107,'BK202512080933460231',10,16,'Nguyễn Đoàn Duy Khánh','khanhkhoi08@gmail.com','0915232119','2025-12-08 02:33:47',4,180000.00,0.00,18000.00,20000.00,243000.00,'COMPLETED','BANK_TRANSFER','COMPLETED','TXNC90BAE47','2025-12-08 02:34:11','2025-12-08 02:38:47','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/qr-codes/QR_BK202512080933460231_5a84bdeb-8400-4ee6-87ba-244e7f396de1.png','INV1765161251958','2025-12-08 02:34:12','2025-12-08 02:33:47','2025-12-08 02:36:16',0),(108,'BK202512080955213406',14,18,'Nguyễn Hồ Duy Khánh','khanh115432@gmail.com','0333756779','2025-12-08 02:55:21',3,195000.00,0.00,19500.00,15000.00,829500.00,'COMPLETED','BANK_TRANSFER','COMPLETED','TXN3845B98E','2025-12-08 02:55:51','2025-12-08 03:00:21','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/qr-codes/QR_BK202512080955213406_6a043612-a021-4714-84fe-3b047f4d6355.png','INV1765162551521','2025-12-08 02:55:52','2025-12-08 02:55:21','2025-12-08 02:57:26',0),(109,'BK202512080958469833',14,18,'Nguyễn Hồ Duy Khánh','khanh115432@gmail.com','0333756779','2025-12-08 02:58:46',1,65000.00,50000.00,6500.00,5000.00,51500.00,'COMPLETED','BANK_TRANSFER','COMPLETED','TXN6CF8A3AA','2025-12-08 02:58:58','2025-12-08 03:03:46','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/qr-codes/QR_BK202512080958469833_fc25c2f7-99df-4291-9b04-6efabed00a38.png','INV1765162738574','2025-12-08 02:58:59','2025-12-08 02:58:46','2025-12-08 03:02:10',50),(110,'BK202512081051480946',12,18,'Nguyễn Quốc','nguyenvanwuoc11112004@gmail.com','0877999484','2025-12-08 03:51:48',2,130000.00,0.00,13000.00,10000.00,253000.00,'PAID','BANK_TRANSFER','COMPLETED','TXNECEFA54C','2025-12-08 03:53:20','2025-12-08 03:56:48','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/qr-codes/QR_BK202512081051480946_1ea42f6c-e56d-4f84-9b7d-3c5619b5d578.png','INV1765166000594','2025-12-08 03:53:21','2025-12-08 03:51:48','2025-12-08 03:53:20',0),(111,'BK202512081101032420',10,18,'Nguyễn Đoàn Duy Khánh','khanhkhoi08@gmail.com','0915232119','2025-12-08 04:01:04',2,130000.00,0.00,13000.00,10000.00,368000.00,'PAID','BANK_TRANSFER','COMPLETED','TXNC0B6E42C','2025-12-08 04:02:08','2025-12-08 04:06:04','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/qr-codes/QR_BK202512081101032420_c09bb92d-675c-4cf4-b291-e786f82403f7.png','INV1765166529263','2025-12-08 04:02:09','2025-12-08 04:01:04','2025-12-08 04:02:08',0),(112,'BK202512081121310207',10,18,'Nguyễn Đoàn Duy Khánh','khanhkhoi08@gmail.com','0915232119','2025-12-08 04:21:32',2,130000.00,196000.00,13000.00,10000.00,197000.00,'PAID','BANK_TRANSFER','COMPLETED','TXND2D75DA8','2025-12-08 04:21:44','2025-12-08 04:26:32','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/qr-codes/QR_BK202512081121310207_e9f281da-ce1d-4bea-92f6-4f23e3324740.png','INV1765167705553','2025-12-08 04:21:46','2025-12-08 04:21:32','2025-12-08 04:21:44',196),(113,'BK202512081125570542',10,18,'Nguyễn Đoàn Duy Khánh','khanhkhoi08@gmail.com','0915232119','2025-12-08 04:25:58',1,65000.00,110000.00,6500.00,5000.00,111500.00,'PAID','BANK_TRANSFER','COMPLETED','TXN2C53EBFE','2025-12-08 04:26:20','2025-12-08 04:30:58','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/qr-codes/QR_BK202512081125570542_f712c5e7-7629-4de1-b869-8e8b5ca795f5.png','INV1765167981359','2025-12-08 04:26:21','2025-12-08 04:25:58','2025-12-08 04:26:20',110),(114,'BK202512081129431751',10,18,'Nguyễn Đoàn Duy Khánh','khanhkhoi08@gmail.com','0915232119','2025-12-08 04:29:43',2,130000.00,0.00,13000.00,10000.00,188000.00,'PAID','BANK_TRANSFER','COMPLETED','TXN75D78A3E','2025-12-08 04:30:53','2025-12-08 04:34:43','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/qr-codes/QR_BK202512081129431751_a66523b5-4252-4f41-9109-6178ff5eeb0b.png','INV1765168253751','2025-12-08 04:30:54','2025-12-08 04:29:43','2025-12-08 04:30:53',0),(115,'BK202512081133310650',10,18,'Nguyễn Đoàn Duy Khánh','khanhkhoi08@gmail.com','0915232119','2025-12-08 04:33:32',2,130000.00,214000.00,13000.00,10000.00,214000.00,'PAID','BANK_TRANSFER','COMPLETED','TXN3AF843C0','2025-12-08 04:34:29','2025-12-08 04:38:32','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/qr-codes/QR_BK202512081133310650_5c867354-8cdf-4a57-b31d-9276362e574a.png','INV1765168469717','2025-12-08 04:34:30','2025-12-08 04:33:32','2025-12-08 04:34:29',214),(116,'BK202512081143585795',10,18,'Nguyễn Đoàn Duy Khánh','khanhkhoi08@gmail.com','0915232119','2025-12-08 04:43:59',2,130000.00,244000.00,13000.00,10000.00,244000.00,'PAID','BANK_TRANSFER','COMPLETED','TXN555096E9','2025-12-08 04:44:18','2025-12-08 04:48:59','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/qr-codes/QR_BK202512081143585795_de3caa83-61cb-424e-900c-9b9323c5d3d6.png','INV1765169059433','2025-12-08 04:44:19','2025-12-08 04:43:59','2025-12-08 04:44:18',244),(117,'BK202512081200426008',10,19,'Nguyễn Đoàn Duy Khánh','khanhkhoi08@gmail.com','0915232119','2025-12-08 05:00:42',2,100000.00,180000.00,10000.00,10000.00,180000.00,'COMPLETED','BANK_TRANSFER','COMPLETED','TXNF9CBC6DA','2025-12-08 05:01:30','2025-12-08 05:05:42','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/qr-codes/QR_BK202512081200426008_a3d2b1e4-e2ce-441a-a0c6-8b34562717e4.png','INV1765170091297','2025-12-08 05:01:31','2025-12-08 05:00:42','2025-12-08 05:40:41',180),(118,'BK202512081727417375',14,19,'Nguyễn Hồ Duy Khánh','khanh115432@gmail.com','0333756779','2025-12-08 10:27:41',2,100000.00,360000.00,10000.00,10000.00,360000.00,'CANCELLED','BANK_TRANSFER','PENDING',NULL,NULL,'2025-12-08 10:32:41',NULL,NULL,NULL,'2025-12-08 10:27:41','2025-12-08 10:33:02',360),(119,'BK202512081910175784',14,18,'Nguyễn Hồ Duy Khánh','khanh115432@gmail.com','0333756779','2025-12-08 12:10:18',1,65000.00,0.00,6500.00,5000.00,136500.00,'CANCELLED','BANK_TRANSFER','PENDING',NULL,NULL,'2025-12-08 12:15:18',NULL,NULL,NULL,'2025-12-08 12:10:18','2025-12-08 12:16:15',0),(120,'BK202512081912526654',14,19,'Nguyễn Hồ Duy Khánh','khanh115432@gmail.com','0333756779','2025-12-08 12:12:53',2,100000.00,0.00,10000.00,10000.00,180000.00,'COMPLETED','BANK_TRANSFER','COMPLETED','TXND5107F8C','2025-12-08 12:16:33','2025-12-08 12:17:53','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/qr-codes/QR_BK202512081912526654_1a36d27f-4bd2-42f1-8a63-7bd038b710a9.png','INV1765196194267','2025-12-08 12:16:34','2025-12-08 12:12:53','2025-12-08 12:20:49',0),(121,'BK202512082054464301',11,19,'Quốc Bry','nguyenvanquoc11112004@gmail.com','0337048570','2025-12-08 13:54:46',2,100000.00,0.00,10000.00,10000.00,145000.00,'COMPLETED','BANK_TRANSFER','COMPLETED','TXNEFADB645','2025-12-08 13:56:23','2025-12-08 13:59:46','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/qr-codes/QR_BK202512082054464301_2c0e559e-8e24-4934-b460-31daef6d5a87.png','INV1765202183425','2025-12-08 13:56:23','2025-12-08 13:54:46','2025-12-08 13:57:20',0),(122,'BK202512082055587916',11,19,'Quốc Bry','nguyenvanquoc11112004@gmail.com','0337048570','2025-12-08 13:55:59',2,100000.00,0.00,10000.00,10000.00,155000.00,'COMPLETED','BANK_TRANSFER','COMPLETED','TXNB2415EFC','2025-12-08 13:56:15','2025-12-08 14:00:59','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/qr-codes/QR_BK202512082055587916_eb398206-9b12-4e80-8d1e-513be15de42a.png','INV1765202175795','2025-12-08 13:56:16','2025-12-08 13:55:59','2025-12-08 13:57:08',0),(123,'BK202512082246325972',14,19,'Nguyễn Hồ Duy Khánh','khanh115432@gmail.com','0333756779','2025-12-08 15:46:32',10,500000.00,0.00,50000.00,50000.00,1200000.00,'PAID','BANK_TRANSFER','COMPLETED','TXN0647E9DA','2025-12-08 15:46:46','2025-12-08 15:51:32','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/qr-codes/QR_BK202512082246325972_f6d0e371-46d7-438c-9ac8-8a00d7831925.png','INV1765208806934','2025-12-08 15:46:47','2025-12-08 15:46:32','2025-12-08 15:46:46',0),(124,'BK202512082342309933',14,19,'Nguyễn Hồ Duy Khánh','khanh115432@gmail.com','0836237476','2025-12-08 16:42:31',3,150000.00,210000.00,15000.00,15000.00,210000.00,'COMPLETED','BANK_TRANSFER','COMPLETED','TXN6CE1D9CD','2025-12-08 16:43:05','2025-12-08 16:47:31','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/qr-codes/QR_BK202512082342309933_7672216e-eace-4983-bfb6-d0ed66a86679.png','INV1765212186042','2025-12-08 16:43:06','2025-12-08 16:42:31','2025-12-08 16:43:57',210),(125,'BK202512082351439352',14,19,'Nguyễn Hồ Duy Khánh','khanh115432@gmail.com','0836237476','2025-12-08 16:51:44',1,50000.00,0.00,5000.00,5000.00,60000.00,'PAID','BANK_TRANSFER','COMPLETED','TXN68D93B27','2025-12-08 16:51:57','2025-12-08 16:56:44','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/qr-codes/QR_BK202512082351439352_a2142286-47a9-433d-8f56-f9e42e8c2bf9.png','INV1765212716928','2025-12-08 16:51:57','2025-12-08 16:51:44','2025-12-08 16:51:57',0),(126,'BK202512090058322084',11,20,'Quốc Bry','nguyenvanquoc11112004@gmail.com','0337048570','2025-12-08 17:58:32',2,190000.00,0.00,19000.00,10000.00,269000.00,'PAID','BANK_TRANSFER','COMPLETED','TXN0B2761B6','2025-12-08 18:02:08','2025-12-08 18:03:32','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/qr-codes/QR_BK202512090058322084_74bdfc39-a379-4b1e-ae54-0309b6c64211.png','INV1765216928026','2025-12-08 18:02:08','2025-12-08 17:58:32','2025-12-08 18:02:08',0),(127,'BK202512090101488212',11,26,'Quốc Bry','nguyenvanquoc11112004@gmail.com','0337048570','2025-12-08 18:01:49',2,90000.00,0.00,9000.00,10000.00,109000.00,'PAID','BANK_TRANSFER','COMPLETED','TXNA34FF786','2025-12-08 18:01:54','2025-12-08 18:06:49','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/qr-codes/QR_BK202512090101488212_b3992ede-6a6b-47d5-8986-800498a0e876.png','INV1765216915353','2025-12-08 18:01:55','2025-12-08 18:01:49','2025-12-08 18:01:54',0),(128,'BK202512090114269160',11,33,'Quốc Bry','nguyenvanquoc11112004@gmail.com','0337048570','2025-12-08 18:14:26',2,90000.00,0.00,9000.00,10000.00,109000.00,'CANCELLED','BANK_TRANSFER','PENDING',NULL,NULL,'2025-12-08 18:19:26',NULL,NULL,NULL,'2025-12-08 18:14:26','2025-12-08 18:20:16',0),(129,'BK202512090208316045',11,19,'Quốc Bry','nguyenvanquoc11112004@gmail.com','0337048570','2025-12-08 19:08:32',2,100000.00,0.00,10000.00,10000.00,180000.00,'CANCELLED','BANK_TRANSFER','PENDING',NULL,NULL,'2025-12-08 19:13:32',NULL,NULL,NULL,'2025-12-08 19:08:32','2025-12-08 19:13:44',0),(130,'BK202512090430022745',11,19,'Quốc Bry','nguyenvanquoc11112004@gmail.com','0337048570','2025-12-08 21:30:02',2,100000.00,0.00,10000.00,10000.00,180000.00,'COMPLETED','BANK_TRANSFER','COMPLETED','TXN046832B8','2025-12-08 21:30:27','2025-12-08 21:35:02','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/qr-codes/QR_BK202512090430022745_f706370c-e320-4684-a733-ce5725dab353.png','INV1765229428565','2025-12-08 21:30:29','2025-12-08 21:30:02','2025-12-08 21:31:18',0),(131,'BK202512090443288493',11,25,'Quốc Bry','nguyenvanquoc11112004@gmail.com','0337048570','2025-12-08 21:43:28',2,90000.00,0.00,9000.00,10000.00,459000.00,'COMPLETED','BANK_TRANSFER','COMPLETED','TXN7F46D936','2025-12-08 21:43:40','2025-12-08 21:48:28','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/qr-codes/QR_BK202512090443288493_14bf0382-63d1-4ad4-9dd9-16785e369347.png','INV1765230220739','2025-12-08 21:43:41','2025-12-08 21:43:28','2025-12-08 21:44:04',0);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cinema_chains`
--

DROP TABLE IF EXISTS `cinema_chains`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cinema_chains` (
  `chain_id` int NOT NULL AUTO_INCREMENT,
  `chain_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`chain_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cinema_chains`
--

LOCK TABLES `cinema_chains` WRITE;
/*!40000 ALTER TABLE `cinema_chains` DISABLE KEYS */;
INSERT INTO `cinema_chains` VALUES (1,'CGV Cinemas','','','Chuỗi rạp chiếu phim CGV',1,'2025-12-03 04:37:43','2025-12-08 21:36:44'),(2,'Galaxy Cinema',NULL,NULL,'Chuỗi rạp chiếu phim Galaxy',1,'2025-12-03 04:37:43','2025-12-03 04:37:43'),(3,'Lotte Cinema',NULL,NULL,'Chuỗi rạp chiếu phim Lotte',1,'2025-12-03 04:37:43','2025-12-03 04:37:43'),(4,'BHD Star Cineplex','','','Chuỗi rạp chiếu phim BHD Star',1,'2025-12-03 04:37:43','2025-12-08 16:58:07'),(10,'Cinestar','','','Chuỗi rạp chiếu phim Cinestar',0,'2025-12-08 16:57:20','2025-12-08 19:11:35');
/*!40000 ALTER TABLE `cinema_chains` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cinema_concession_items`
--

DROP TABLE IF EXISTS `cinema_concession_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cinema_concession_items` (
  `cinema_item_id` int NOT NULL AUTO_INCREMENT,
  `cinema_id` int NOT NULL,
  `item_id` int NOT NULL,
  `cinema_price` decimal(10,2) DEFAULT NULL COMMENT 'Giá bán tại rạp này (NULL = dùng giá mặc định)',
  `cinema_cost_price` decimal(10,2) DEFAULT NULL COMMENT 'Giá vốn tại rạp này',
  `stock_quantity` int DEFAULT '0' COMMENT 'Số lượng tồn kho',
  `is_available` tinyint(1) DEFAULT '1' COMMENT 'Có bán tại rạp này không',
  `display_order` int DEFAULT '0' COMMENT 'Thứ tự hiển thị',
  `notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ghi chú riêng cho rạp',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cinema_item_id`),
  UNIQUE KEY `uq_cinema_item` (`cinema_id`,`item_id`),
  KEY `fk_cinema_concession_item` (`item_id`),
  KEY `idx_cinema_available` (`cinema_id`,`is_available`),
  KEY `idx_stock` (`cinema_id`,`stock_quantity`),
  CONSTRAINT `fk_cinema_concession_cinema` FOREIGN KEY (`cinema_id`) REFERENCES `cinemas` (`cinema_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cinema_concession_item` FOREIGN KEY (`item_id`) REFERENCES `concession_items` (`item_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quản lý giá và tồn kho bắp nước theo từng rạp';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cinema_concession_items`
--

LOCK TABLES `cinema_concession_items` WRITE;
/*!40000 ALTER TABLE `cinema_concession_items` DISABLE KEYS */;
INSERT INTO `cinema_concession_items` VALUES (3,18,2,25000.00,NULL,76,1,0,NULL,'2025-12-07 20:55:46','2025-12-08 17:58:32'),(4,18,3,25000.00,NULL,72,1,0,NULL,'2025-12-07 20:55:58','2025-12-08 17:58:33'),(5,19,2,35000.00,NULL,35,1,0,NULL,'2025-12-08 02:53:53','2025-12-08 21:30:03'),(6,19,3,25000.00,NULL,33,1,0,NULL,'2025-12-08 02:53:59','2025-12-08 21:30:03'),(7,23,2,35000.00,NULL,90,1,0,NULL,'2025-12-08 18:29:34','2025-12-08 21:43:29');
/*!40000 ALTER TABLE `cinema_concession_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cinema_halls`
--

DROP TABLE IF EXISTS `cinema_halls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cinema_halls` (
  `hall_id` int NOT NULL AUTO_INCREMENT,
  `cinema_id` int NOT NULL,
  `hall_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `hall_type` enum('2D','3D','IMAX','4DX','SCREENX') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '2D',
  `total_seats` int NOT NULL,
  `rows_count` int NOT NULL,
  `seats_per_row` int NOT NULL,
  `seat_layout` json DEFAULT NULL,
  `screen_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sound_system` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `seat_map_json` json DEFAULT NULL COMMENT 'Flexible JSON column for seat map visualization and configuration',
  PRIMARY KEY (`hall_id`),
  KEY `idx_cinema_id` (`cinema_id`),
  CONSTRAINT `cinema_halls_ibfk_1` FOREIGN KEY (`cinema_id`) REFERENCES `cinemas` (`cinema_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cinema_halls`
--

LOCK TABLES `cinema_halls` WRITE;
/*!40000 ALTER TABLE `cinema_halls` DISABLE KEYS */;
INSERT INTO `cinema_halls` VALUES (13,18,'Phòng 1',NULL,50,5,10,'{\"B2\": \"WHEELCHAIR\", \"B3\": \"WHEELCHAIR\", \"B4\": \"COUPLE\", \"B5\": \"COUPLE\", \"B6\": \"COUPLE\", \"B7\": \"COUPLE\", \"VIP_Rows\": [\"C\", \"D\"], \"verticalAisles\": [\"3-4\"]}','Laser Screen','Dolby Atmos 7.1',1,'2025-12-07 20:42:50','2025-12-07 20:47:01',NULL),(14,18,'Phòng 2',NULL,80,10,8,'{\"B1\": \"WHEELCHAIR\", \"B2\": \"WHEELCHAIR\", \"B3\": \"WHEELCHAIR\", \"aisles\": [\"B-C\"], \"VIP_Rows\": [\"C\", \"D\"], \"verticalAisles\": [\"5-6\"]}','Laser 4K','Dolby Atmos 7.1',1,'2025-12-07 20:45:16','2025-12-07 20:45:16',NULL),(15,18,'Phòng 3',NULL,30,3,10,'{\"B6\": \"COUPLE\", \"B7\": \"COUPLE\", \"VIP_Rows\": [\"A\"]}','Laser 4K','Dolby Atmos 7.1',1,'2025-12-07 20:48:13','2025-12-07 20:48:37',NULL),(16,19,'Phòng 1',NULL,50,5,10,'{\"VIP_Rows\": [\"A\"], \"COUPLE_Rows\": [\"B\"], \"WHEELCHAIR_Rows\": [\"C\"]}','Laser Screen','Dolby Atmos 7.1',1,'2025-12-08 02:49:17','2025-12-08 17:47:14',NULL),(17,21,'Room A01',NULL,50,10,10,'{\"D5\": \"VIP\", \"D6\": \"VIP\", \"D7\": \"VIP\", \"E5\": \"COUPLE\", \"E6\": \"COUPLE\", \"aisles\": [\"B-C\"], \"VIP_Rows\": [\"A\", \"B\"], \"COUPLE_Rows\": [\"C\"], \"verticalAisles\": [\"5-6\"], \"WHEELCHAIR_Rows\": [\"E\"]}','màn hình 4k','tổ hợp thiết bị thu, xử lý, khuếch đại và phát âm thanh',1,'2025-12-08 15:03:45','2025-12-08 15:03:45',NULL),(18,20,'Room A01',NULL,80,10,10,'{\"aisles\": [\"B-C\"], \"VIP_Rows\": [\"A\", \"B\"], \"COUPLE_Rows\": [\"C\"], \"verticalAisles\": [\"5-6\"], \"WHEELCHAIR_Rows\": [\"E\"]}','Full HD','Tổ hợp thiết bị thu, xử lý, khuếch đại và phát âm thanh',1,'2025-12-08 15:04:48','2025-12-08 15:04:48',NULL),(19,23,'Room A01',NULL,100,5,5,'{\"aisles\": [\"B-C\"], \"VIP_Rows\": [\"A\", \"B\"], \"COUPLE_Rows\": [\"C\"], \"verticalAisles\": [\"5-6\"], \"WHEELCHAIR_Rows\": [\"E\"]}','Màn hình Laser 4K','IMAX Laser 4K',1,'2025-12-08 15:10:51','2025-12-08 15:10:51',NULL),(20,22,'KTXB12',NULL,50,5,5,'{\"aisles\": [\"D-E\"], \"VIP_Rows\": [\"A\", \"B\"], \"COUPLE_Rows\": [\"C\"], \"verticalAisles\": [\"3-4\"], \"WHEELCHAIR_Rows\": [\"E\"]}','Laser 4K','IMAX Laser 4K',1,'2025-12-08 15:11:35','2025-12-08 15:11:35',NULL),(21,25,'SSYE',NULL,39,2,2,'{\"D5\": \"VIP\", \"D6\": \"VIP\", \"D7\": \"VIP\", \"E5\": \"COUPLE\", \"E6\": \"COUPLE\", \"aisles\": [\"D-E\"], \"VIP_Rows\": [\"A\", \"B\"], \"COUPLE_Rows\": [\"C\"], \"verticalAisles\": [\"3-4\"], \"WHEELCHAIR_Rows\": [\"E\"]}','Laser 4K','IMAX Laser 4K',1,'2025-12-08 15:14:26','2025-12-08 17:38:34',NULL),(22,24,'TTTX',NULL,100,10,10,'{\"aisles\": [\"C-D\"], \"VIP_Rows\": [\"A\", \"B\"], \"COUPLE_Rows\": [\"C\"], \"verticalAisles\": [\"4-5\"], \"WHEELCHAIR_Rows\": [\"E\"]}','Laser 4K','IMAX Laser 4K',1,'2025-12-08 15:15:03','2025-12-08 15:15:03',NULL),(23,26,'Phòng 1',NULL,50,5,10,'{\"aisles\": [\"B-C\"], \"VIP_Rows\": [\"A\", \"B\"], \"COUPLE_Rows\": [\"C\"], \"verticalAisles\": [\"5-6\"], \"WHEELCHAIR_Rows\": [\"E\"]}','Laser Screen','Dolby Atmos 7.1',1,'2025-12-08 17:02:02','2025-12-08 17:40:50',NULL),(24,21,'a2',NULL,39,4,10,'{\"D5\": \"VIP\", \"D6\": \"VIP\", \"D7\": \"VIP\", \"E5\": \"COUPLE\", \"E6\": \"COUPLE\", \"aisles\": [\"B-C\"], \"VIP_Rows\": [\"A\", \"B\"], \"COUPLE_Rows\": [\"C\"], \"verticalAisles\": [\"5-6\"], \"WHEELCHAIR_Rows\": [\"E\"]}','Màn hình Laser 4K','tổ hợp thiết bị thu, xử lý, khuếch đại và phát âm thanh',1,'2025-12-08 18:00:19','2025-12-08 18:00:19',NULL);
/*!40000 ALTER TABLE `cinema_halls` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cinema_staffs`
--

DROP TABLE IF EXISTS `cinema_staffs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cinema_staffs` (
  `cinema_staff_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `cinema_id` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `position` varchar(100) DEFAULT NULL,
  `start_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `end_date` timestamp NULL DEFAULT NULL,
  `assigned_by` int DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cinema_staff_id`),
  UNIQUE KEY `unique_user_cinema` (`user_id`,`cinema_id`),
  KEY `assigned_by` (`assigned_by`),
  KEY `idx_cinema_id` (`cinema_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `cinema_staffs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `cinema_staffs_ibfk_2` FOREIGN KEY (`cinema_id`) REFERENCES `cinemas` (`cinema_id`) ON DELETE CASCADE,
  CONSTRAINT `cinema_staffs_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cinema_staffs`
--

LOCK TABLES `cinema_staffs` WRITE;
/*!40000 ALTER TABLE `cinema_staffs` DISABLE KEYS */;
INSERT INTO `cinema_staffs` VALUES (1,12,19,1,'CONCESSION','2025-12-08 03:40:38',NULL,10,'','2025-12-08 03:40:38','2025-12-08 03:40:38'),(2,15,18,1,'TICKET_CHECKER','2025-12-08 04:20:37',NULL,10,'','2025-12-08 04:20:37','2025-12-08 04:20:37'),(3,16,24,1,'TICKET_CHECKER','2025-12-08 15:22:33',NULL,11,'','2025-12-08 15:22:33','2025-12-08 15:22:33'),(4,17,25,1,'TICKET_CHECKER','2025-12-08 15:22:49',NULL,11,'','2025-12-08 15:22:49','2025-12-08 15:22:49'),(5,18,21,1,'TICKET_CHECKER','2025-12-08 15:23:10',NULL,11,'','2025-12-08 15:23:10','2025-12-08 15:23:10'),(6,19,20,1,'TICKET_CHECKER','2025-12-08 15:23:19',NULL,11,'','2025-12-08 15:23:19','2025-12-08 15:23:19'),(7,20,22,1,'TICKET_CHECKER','2025-12-08 15:23:29',NULL,11,'','2025-12-08 15:23:29','2025-12-08 15:23:29'),(8,21,23,1,'TICKET_CHECKER','2025-12-08 15:27:24',NULL,11,'','2025-12-08 15:27:24','2025-12-08 15:27:24');
/*!40000 ALTER TABLE `cinema_staffs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cinemas`
--

DROP TABLE IF EXISTS `cinemas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cinemas` (
  `cinema_id` int NOT NULL AUTO_INCREMENT,
  `chain_id` int DEFAULT NULL,
  `cinema_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `district` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `legal_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `opening_hours` json DEFAULT NULL,
  `facilities` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `manager_id` int DEFAULT NULL,
  PRIMARY KEY (`cinema_id`),
  KEY `idx_city` (`city`),
  KEY `idx_chain_id` (`chain_id`),
  KEY `idx_cinema_manager_id` (`manager_id`),
  KEY `idx_cinema_manager_chain` (`manager_id`,`chain_id`),
  CONSTRAINT `cinemas_ibfk_1` FOREIGN KEY (`chain_id`) REFERENCES `cinema_chains` (`chain_id`),
  CONSTRAINT `fk_cinema_manager` FOREIGN KEY (`manager_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cinemas`
--

LOCK TABLES `cinemas` WRITE;
/*!40000 ALTER TABLE `cinemas` DISABLE KEYS */;
INSERT INTO `cinemas` VALUES (18,1,'CGV Thạch Vịnh','Tang Nhon Phu A, District 9','Ho Chi Minh City','Quan 9','0915232119','khanhkhoi08@gmail.com',NULL,NULL,NULL,NULL,'{\"Mon-Fri\": \"09:00 - 23:00\", \"Sat-Sun\": \"08:00 - 00:00\"}','{\"parking\": true, \"3D_support\": true, \"VIP_lounge\": true, \"4DX_support\": true, \"IMAX_support\": true, \"wheelchairAccess\": true}',1,'2025-12-07 20:40:48','2025-12-07 21:15:36',13),(19,1,'CGV Lê Văn Việt','Huyện Tuy Đức','Tỉnh Đắk Nông','Tuy Đức','0987678921','khanhkhoi08@gmail.com',NULL,NULL,NULL,NULL,'{\"Mon-Fri\": \"09:00 - 23:00\", \"Sat-Sun\": \"08:00 - 00:00\"}','{\"parking\": false, \"3D_support\": false, \"VIP_lounge\": false, \"4DX_support\": false, \"IMAX_support\": false, \"wheelchairAccess\": false}',1,'2025-12-07 22:30:41','2025-12-08 20:43:43',14),(20,2,'Galaxy Cinema Quận 12','Huyện Tuy Đức','tp HCM','Quận 12','0337048570','nguyenvanquoc11112004@gmail.com',NULL,'Khanh Nguyen',NULL,NULL,'{\"Mon-Fri\": \"09:00 - 23:00\", \"Sat-Sun\": \"08:00 - 00:00\"}','{\"parking\": true, \"3D_support\": true, \"VIP_lounge\": true, \"4DX_support\": true, \"IMAX_support\": true, \"wheelchairAccess\": true}',1,'2025-12-08 15:00:57','2025-12-08 15:00:57',NULL),(21,2,'Galaxy Cinema Bình thạnh','Galaxy Nguyễn Du, 116 Nguyễn Du, Phường Bến Thành, Quận 1, Thành phố Hồ Chí Minh 700000, Việt Nam','tp HCM','City','0836237476','nguyenvanquoc11112004@gmail.com','70000','Khanh nguyen',10.77700000,6.55550000,'{\"Mon-Fri\": \"09:00 - 23:00\", \"Sat-Sun\": \"08:00 - 00:00\"}','{\"parking\": true, \"3D_support\": true, \"VIP_lounge\": false, \"4DX_support\": false, \"IMAX_support\": false, \"wheelchairAccess\": false}',1,'2025-12-08 15:02:16','2025-12-08 18:31:05',NULL),(22,3,'Lotte Cinema Quang Trung ',' Tầng 3, TTTM Lotte, số 469 đường Nguyễn Hữu Thọ, Phường Tân Hưng, TPHCM, Việt Nam','tp HCM',NULL,'0337048570','nguyenvanquoc11112004@gmail.com',NULL,'Nguyễn Thị Hà',NULL,NULL,'{\"Mon-Fri\": \"09:00 - 23:00\", \"Sat-Sun\": \"08:00 - 00:00\"}','{\"parking\": true, \"3D_support\": true, \"VIP_lounge\": false, \"4DX_support\": true, \"IMAX_support\": true, \"wheelchairAccess\": false}',1,'2025-12-08 15:08:58','2025-12-08 15:08:58',NULL),(23,3,'Lotte Cinema Quang Vinh','11/7 Quang Vinh,  TP.HCM','tp HCM',NULL,'0337048570','nguyenvanquoc11112004@gmail.com',NULL,'Nguyễn thị Diệu Linh',NULL,NULL,'{\"Mon-Fri\": \"09:00 - 23:00\", \"Sat-Sun\": \"08:00 - 00:00\"}','{\"parking\": true, \"3D_support\": true, \"VIP_lounge\": true, \"4DX_support\": true, \"IMAX_support\": false, \"wheelchairAccess\": true}',1,'2025-12-08 15:10:07','2025-12-08 15:10:07',NULL),(24,4,'BHD Star Cineplex','Gò Vấp, TP.HCM','tp Thu Duc','Gò Vấp','01254785474','khanh115432@gmail.com',NULL,'DIệu Ly',NULL,NULL,'{\"Mon-Fri\": \"09:00 - 23:00\", \"Sat-Sun\": \"08:00 - 23:50\"}','{\"parking\": true, \"3D_support\": true, \"VIP_lounge\": false, \"4DX_support\": false, \"IMAX_support\": false, \"wheelchairAccess\": false}',1,'2025-12-08 15:12:59','2025-12-08 15:12:59',NULL),(25,4,'BTTX','Dĩ An','Bình Dương','Dĩ An','0123522239','An@gmail.com',NULL,'Bình Gà',NULL,NULL,'{\"Mon-Fri\": \"09:00 - 23:00\", \"Sat-Sun\": \"08:00 - 00:00\"}','{\"parking\": true, \"3D_support\": true, \"VIP_lounge\": false, \"4DX_support\": true, \"IMAX_support\": true, \"wheelchairAccess\": true}',1,'2025-12-08 15:13:52','2025-12-08 15:13:52',NULL),(26,1,'CGV Vạn Hạnh','Tang Nhon Phu A, District 9','Ho Chi Minh City','Quan 9','0915232119','khanhkhoi08@gmail.com',NULL,NULL,NULL,NULL,'{\"Mon-Fri\": \"09:00 - 23:00\", \"Sat-Sun\": \"08:00 - 00:00\"}','{\"parking\": false, \"3D_support\": false, \"VIP_lounge\": false, \"4DX_support\": false, \"IMAX_support\": false, \"wheelchairAccess\": false}',0,'2025-12-08 17:01:35','2025-12-08 21:37:00',13);
/*!40000 ALTER TABLE `cinemas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `concession_categories`
--

DROP TABLE IF EXISTS `concession_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `concession_categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `concession_categories`
--

LOCK TABLES `concession_categories` WRITE;
/*!40000 ALTER TABLE `concession_categories` DISABLE KEYS */;
INSERT INTO `concession_categories` VALUES (1,'Combo Bắp Nước','Các combo bắp rang bơ và nước uống',1,1,'2025-12-03 04:37:43','2025-12-08 18:07:11'),(2,'Đồ uống','Nước ngọt, nước ép, trà sữa',2,1,'2025-12-03 04:37:43','2025-12-03 04:37:43'),(3,'Snacks','Kẹo, bánh kẹo các loại',3,1,'2025-12-03 04:37:43','2025-12-03 04:37:43'),(4,'Thức ăn nhanh','Hotdog, bánh mì, nachos',4,1,'2025-12-03 04:37:43','2025-12-03 04:37:43'),(5,'Combo Ưu Đãi 22','Các combo tiết kiệm cho gia đình',1,1,'2025-12-07 08:28:28','2025-12-07 08:28:28');
/*!40000 ALTER TABLE `concession_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `concession_items`
--

DROP TABLE IF EXISTS `concession_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `concession_items` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `item_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `size` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `calories` int DEFAULT NULL,
  `ingredients` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `stock_quantity` int DEFAULT '0',
  `low_stock_threshold` int DEFAULT '5',
  `is_combo` tinyint(1) DEFAULT '0',
  `combo_items` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_available` tinyint(1) DEFAULT '1',
  `available_cinemas` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`item_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_is_available` (`is_available`),
  CONSTRAINT `concession_items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `concession_categories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `concession_items`
--

LOCK TABLES `concession_items` WRITE;
/*!40000 ALTER TABLE `concession_items` DISABLE KEYS */;
INSERT INTO `concession_items` VALUES (2,1,'Bắp rang bơ','Ngon từng kẽ răng','https://truyencotich.top/storage/img/QtoTQx7O4s8HCQykgmPWpwDlEpa4xeSuDxXs1LcZ.jpeg',35000.00,20000.00,'M',NULL,'',NULL,NULL,0,'',1,NULL,1,'2025-12-07 20:52:47','2025-12-08 18:21:54'),(3,1,'Coca 70oZ','Sảng khoái, mát lạnh','https://mir-s3-cdn-cf.behance.net/project_modules/max_1200_webp/6a86f876926957.5c78192aab62a.png',25000.00,5000.00,'M',NULL,'',NULL,NULL,0,'',1,NULL,2,'2025-12-07 20:55:23','2025-12-08 18:21:57');
/*!40000 ALTER TABLE `concession_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `concession_order_items`
--

DROP TABLE IF EXISTS `concession_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `concession_order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `concession_order_id` int NOT NULL,
  `item_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `customization_notes` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_item_id`),
  KEY `idx_concession_order_id` (`concession_order_id`),
  KEY `idx_item_id` (`item_id`),
  CONSTRAINT `concession_order_items_ibfk_1` FOREIGN KEY (`concession_order_id`) REFERENCES `concession_orders` (`concession_order_id`) ON DELETE CASCADE,
  CONSTRAINT `concession_order_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `concession_items` (`item_id`)
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `concession_order_items`
--

LOCK TABLES `concession_order_items` WRITE;
/*!40000 ALTER TABLE `concession_order_items` DISABLE KEYS */;
INSERT INTO `concession_order_items` VALUES (18,18,2,3,35000.00,105000.00,NULL,NULL),(19,18,3,2,25000.00,50000.00,NULL,NULL),(20,19,2,2,35000.00,70000.00,NULL,NULL),(21,19,3,2,25000.00,50000.00,NULL,NULL),(22,20,2,5,25000.00,125000.00,NULL,NULL),(23,20,3,4,25000.00,100000.00,NULL,NULL),(24,21,2,3,25000.00,75000.00,NULL,NULL),(25,21,3,2,25000.00,50000.00,NULL,NULL),(26,22,3,3,25000.00,75000.00,NULL,NULL),(27,23,3,1,25000.00,25000.00,NULL,NULL),(28,24,3,2,25000.00,50000.00,NULL,NULL),(29,25,2,4,25000.00,100000.00,NULL,NULL),(30,25,3,4,25000.00,100000.00,NULL,NULL),(31,26,2,1,25000.00,25000.00,NULL,NULL),(32,26,3,1,25000.00,25000.00,NULL,NULL),(33,27,2,1,25000.00,25000.00,NULL,NULL),(34,27,3,1,25000.00,25000.00,NULL,NULL),(35,28,2,4,25000.00,100000.00,NULL,NULL),(36,28,3,4,25000.00,100000.00,NULL,NULL),(37,29,3,1,25000.00,25000.00,NULL,NULL),(38,30,2,10,35000.00,350000.00,NULL,NULL),(39,30,3,10,25000.00,250000.00,NULL,NULL),(40,31,3,1,25000.00,25000.00,NULL,NULL),(41,32,3,4,25000.00,100000.00,NULL,NULL),(42,33,2,4,35000.00,140000.00,NULL,NULL),(43,33,3,3,25000.00,75000.00,NULL,NULL),(44,34,2,4,35000.00,140000.00,NULL,NULL),(45,34,3,4,25000.00,100000.00,NULL,NULL),(46,35,2,2,35000.00,70000.00,NULL,NULL),(47,35,3,3,25000.00,75000.00,NULL,NULL),(48,36,2,1,35000.00,35000.00,NULL,NULL),(49,37,2,5,35000.00,175000.00,NULL,NULL),(50,37,3,4,25000.00,100000.00,NULL,NULL),(51,38,2,6,35000.00,210000.00,NULL,NULL),(52,38,3,5,25000.00,125000.00,NULL,NULL),(53,39,2,4,35000.00,140000.00,NULL,NULL),(54,39,3,4,25000.00,100000.00,NULL,NULL),(55,40,2,10,35000.00,350000.00,NULL,NULL),(56,40,3,10,25000.00,250000.00,NULL,NULL),(57,41,2,1,35000.00,35000.00,NULL,NULL),(58,41,3,1,25000.00,25000.00,NULL,NULL),(59,42,2,1,35000.00,35000.00,NULL,NULL),(60,42,3,1,25000.00,25000.00,NULL,NULL),(61,43,3,1,25000.00,25000.00,NULL,NULL),(62,44,2,1,35000.00,35000.00,NULL,NULL),(63,45,2,10,35000.00,350000.00,NULL,NULL),(64,45,3,10,25000.00,250000.00,NULL,NULL),(65,46,2,4,35000.00,140000.00,NULL,NULL),(66,46,3,4,25000.00,100000.00,NULL,NULL),(67,47,2,1,25000.00,25000.00,NULL,NULL),(68,47,3,1,25000.00,25000.00,NULL,NULL),(69,48,2,1,35000.00,35000.00,NULL,NULL),(70,48,3,1,25000.00,25000.00,NULL,NULL),(71,49,2,1,35000.00,35000.00,NULL,NULL),(72,49,3,1,25000.00,25000.00,NULL,NULL),(73,50,2,10,35000.00,350000.00,NULL,NULL);
/*!40000 ALTER TABLE `concession_order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `concession_orders`
--

DROP TABLE IF EXISTS `concession_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `concession_orders` (
  `concession_order_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `order_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cinema_id` int NOT NULL,
  `pickup_time` timestamp NULL DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('PENDING','CONFIRMED','PREPARING','READY','COMPLETED','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `payment_status` enum('PENDING','PAID','REFUNDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `notes` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`concession_order_id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_order_number` (`order_number`),
  KEY `idx_booking_id` (`booking_id`),
  KEY `idx_cinema_id` (`cinema_id`),
  KEY `idx_status` (`status`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `concession_orders_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`),
  CONSTRAINT `concession_orders_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `concession_orders_ibfk_3` FOREIGN KEY (`cinema_id`) REFERENCES `cinemas` (`cinema_id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `concession_orders`
--

LOCK TABLES `concession_orders` WRITE;
/*!40000 ALTER TABLE `concession_orders` DISABLE KEYS */;
INSERT INTO `concession_orders` VALUES (18,95,10,'CON17651410601940370',18,'2025-12-07 21:19:10',155000.00,15500.00,0.00,170500.00,'READY',NULL,NULL,'2025-12-07 20:57:40','2025-12-07 21:19:10'),(19,96,10,'CON17651419171537464',18,'2025-12-07 21:19:08',120000.00,12000.00,0.00,132000.00,'READY',NULL,NULL,'2025-12-07 21:11:57','2025-12-07 21:19:08'),(20,97,10,'CON17651528140522902',18,NULL,225000.00,22500.00,0.00,247500.00,'PENDING',NULL,NULL,'2025-12-08 00:13:34','2025-12-08 00:13:34'),(21,98,10,'CON17651539593006240',18,NULL,125000.00,12500.00,0.00,137500.00,'PENDING',NULL,NULL,'2025-12-08 00:32:39','2025-12-08 00:32:40'),(22,99,10,'CON17651546291272975',18,NULL,75000.00,7500.00,0.00,82500.00,'PENDING',NULL,NULL,'2025-12-08 00:43:49','2025-12-08 00:43:49'),(23,100,10,'CON17651546793823373',18,NULL,25000.00,2500.00,0.00,27500.00,'PENDING',NULL,NULL,'2025-12-08 00:44:39','2025-12-08 00:44:39'),(24,101,10,'CON17651551183087089',18,NULL,50000.00,0.00,0.00,50000.00,'PENDING',NULL,NULL,'2025-12-08 00:51:58','2025-12-08 00:51:58'),(25,102,10,'CON17651552118455672',18,NULL,200000.00,0.00,0.00,200000.00,'PENDING',NULL,NULL,'2025-12-08 00:53:32','2025-12-08 00:53:32'),(26,104,10,'CON17651558409001846',18,NULL,50000.00,0.00,0.00,50000.00,'PENDING',NULL,NULL,'2025-12-08 01:04:01','2025-12-08 01:04:01'),(27,105,10,'CON17651568742958724',18,NULL,50000.00,0.00,0.00,50000.00,'PENDING',NULL,NULL,'2025-12-08 01:21:14','2025-12-08 01:21:15'),(28,106,10,'CON17651575762934974',18,NULL,200000.00,0.00,0.00,200000.00,'PENDING',NULL,NULL,'2025-12-08 01:32:56','2025-12-08 01:32:57'),(29,107,10,'CON17651612280396343',18,NULL,25000.00,0.00,0.00,25000.00,'PENDING',NULL,NULL,'2025-12-08 02:33:48','2025-12-08 02:33:48'),(30,108,14,'CON17651625217766694',19,'2025-12-08 03:00:03',600000.00,0.00,0.00,600000.00,'COMPLETED',NULL,NULL,'2025-12-08 02:55:22','2025-12-08 03:00:17'),(31,109,14,'CON17651627266581317',19,'2025-12-08 02:59:45',25000.00,0.00,0.00,25000.00,'COMPLETED',NULL,NULL,'2025-12-08 02:58:47','2025-12-08 02:59:54'),(32,110,12,'CON17651659086439127',19,'2025-12-08 04:00:20',100000.00,0.00,0.00,100000.00,'COMPLETED',NULL,NULL,'2025-12-08 03:51:49','2025-12-08 04:00:23'),(33,111,10,'CON17651664638148038',19,'2025-12-08 04:05:42',215000.00,0.00,0.00,215000.00,'COMPLETED',NULL,'Hết bắp','2025-12-08 04:01:04','2025-12-08 04:11:04'),(34,112,10,'CON17651676919802672',19,NULL,240000.00,0.00,0.00,240000.00,'PENDING',NULL,NULL,'2025-12-08 04:21:32','2025-12-08 04:21:32'),(35,113,10,'CON17651679577663755',19,NULL,145000.00,0.00,0.00,145000.00,'CONFIRMED',NULL,NULL,'2025-12-08 04:25:58','2025-12-08 04:30:35'),(36,114,10,'CON17651681834889217',19,NULL,35000.00,0.00,0.00,35000.00,'PENDING',NULL,NULL,'2025-12-08 04:29:43','2025-12-08 04:29:44'),(37,115,10,'CON17651684122484471',19,NULL,275000.00,0.00,0.00,275000.00,'PENDING',NULL,NULL,'2025-12-08 04:33:32','2025-12-08 04:33:33'),(38,116,10,'CON17651690392655773',19,NULL,335000.00,0.00,0.00,335000.00,'PENDING',NULL,NULL,'2025-12-08 04:43:59','2025-12-08 04:44:00'),(39,117,10,'CON17651700423859783',19,NULL,240000.00,0.00,0.00,240000.00,'PENDING',NULL,NULL,'2025-12-08 05:00:42','2025-12-08 05:00:43'),(40,118,14,'CON17651896616964173',19,NULL,600000.00,0.00,0.00,600000.00,'PENDING',NULL,NULL,'2025-12-08 10:27:42','2025-12-08 10:27:42'),(41,119,14,'CON17651958178161136',19,NULL,60000.00,0.00,0.00,60000.00,'PENDING',NULL,NULL,'2025-12-08 12:10:18','2025-12-08 12:10:18'),(42,120,14,'CON17651959732724440',19,'2025-12-08 16:45:50',60000.00,0.00,0.00,60000.00,'READY',NULL,NULL,'2025-12-08 12:12:53','2025-12-08 16:45:50'),(43,121,11,'CON17652020864709334',19,'2025-12-08 16:45:45',25000.00,0.00,0.00,25000.00,'READY',NULL,NULL,'2025-12-08 13:54:46','2025-12-08 16:45:45'),(44,122,11,'CON17652021591860525',19,NULL,35000.00,0.00,0.00,35000.00,'PENDING',NULL,NULL,'2025-12-08 13:55:59','2025-12-08 13:55:59'),(45,123,14,'CON17652087931591711',19,'2025-12-08 16:45:38',600000.00,0.00,0.00,600000.00,'READY',NULL,NULL,'2025-12-08 15:46:33','2025-12-08 16:45:38'),(46,124,14,'CON17652121512719552',19,'2025-12-08 16:44:57',240000.00,0.00,0.00,240000.00,'READY',NULL,NULL,'2025-12-08 16:42:31','2025-12-08 16:44:57'),(47,126,11,'CON17652167123237260',18,NULL,50000.00,0.00,0.00,50000.00,'PENDING',NULL,NULL,'2025-12-08 17:58:32','2025-12-08 17:58:33'),(48,129,11,'CON17652209120968349',19,NULL,60000.00,0.00,0.00,60000.00,'PENDING',NULL,NULL,'2025-12-08 19:08:32','2025-12-08 19:08:32'),(49,130,11,'CON17652294025530367',19,NULL,60000.00,0.00,0.00,60000.00,'PENDING',NULL,NULL,'2025-12-08 21:30:03','2025-12-08 21:30:03'),(50,131,11,'CON17652302083083821',23,NULL,350000.00,0.00,0.00,350000.00,'PENDING',NULL,NULL,'2025-12-08 21:43:28','2025-12-08 21:43:28');
/*!40000 ALTER TABLE `concession_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `membership_tiers`
--

DROP TABLE IF EXISTS `membership_tiers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `membership_tiers` (
  `tier_id` int NOT NULL AUTO_INCREMENT,
  `tier_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tier_name_display` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_annual_spending` decimal(12,2) DEFAULT '0.00',
  `min_visits_per_year` int DEFAULT '0',
  `points_earn_rate` decimal(5,2) DEFAULT '1.00',
  `birthday_gift_description` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `discount_percentage` decimal(5,2) DEFAULT '0.00',
  `free_tickets_per_year` int DEFAULT '0',
  `priority_booking` tinyint(1) DEFAULT '0',
  `free_upgrades` tinyint(1) DEFAULT '0',
  `tier_level` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`tier_id`),
  UNIQUE KEY `tier_name` (`tier_name`),
  KEY `idx_tier_level` (`tier_level`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `membership_tiers`
--

LOCK TABLES `membership_tiers` WRITE;
/*!40000 ALTER TABLE `membership_tiers` DISABLE KEYS */;
INSERT INTO `membership_tiers` VALUES (6,'BRONZE','Bronze Member',0.00,0,1.00,NULL,0.00,0,0,0,1,1,'2025-12-07 20:26:18','2025-12-07 20:26:18'),(7,'SILVER','Silver Member',2000000.00,0,1.20,'Combo bap nuoc + 1 ve 2D',0.00,1,0,0,2,1,'2025-12-08 16:11:31','2025-12-08 16:11:31'),(8,'GOLD','Gold Member',5000000.00,0,1.50,'Combo bap nuoc + 2 ve 2D/3D',0.00,2,0,0,3,1,'2025-12-08 16:11:31','2025-12-08 16:11:31'),(9,'PLATINUM','Platinum Member',10000000.00,0,2.00,'Combo bap nuoc + 3 ve moi dinh dang',0.00,4,0,0,4,1,'2025-12-08 16:11:31','2025-12-08 16:11:31'),(10,'DIAMOND','Diamond Member',20000000.00,0,2.50,'Combo bap nuoc + 5 ve + uu tien dat cho',0.00,6,0,0,5,1,'2025-12-08 16:11:31','2025-12-08 16:11:31');
/*!40000 ALTER TABLE `membership_tiers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `memberships`
--

DROP TABLE IF EXISTS `memberships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `memberships` (
  `membership_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `membership_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tier_id` int NOT NULL,
  `total_points` int DEFAULT '0',
  `available_points` int DEFAULT '0',
  `lifetime_spending` decimal(12,2) DEFAULT '0.00',
  `annual_spending` decimal(12,2) DEFAULT '0.00',
  `total_visits` int DEFAULT '0',
  `tier_start_date` date DEFAULT NULL,
  `next_tier_review_date` date DEFAULT NULL,
  `status` enum('ACTIVE','SUSPENDED','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`membership_id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `membership_number` (`membership_number`),
  KEY `idx_membership_number` (`membership_number`),
  KEY `idx_tier_id` (`tier_id`),
  CONSTRAINT `memberships_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `memberships_ibfk_2` FOREIGN KEY (`tier_id`) REFERENCES `membership_tiers` (`tier_id`),
  CONSTRAINT `chk_membership_points` CHECK (((`available_points` >= 0) and (`total_points` >= `available_points`)))
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `memberships`
--

LOCK TABLES `memberships` WRITE;
/*!40000 ALTER TABLE `memberships` DISABLE KEYS */;
INSERT INTO `memberships` VALUES (10,10,'MB000000010',7,2211,801,2212000.00,2212000.00,10,'2025-12-08','2026-12-08','ACTIVE','2025-12-07 20:26:18','2025-12-08 16:27:58'),(11,11,'MB000000011',6,1317,1317,1317000.00,1317000.00,6,'2025-12-08','2026-12-08','ACTIVE','2025-12-07 20:34:23','2025-12-08 21:43:45'),(12,12,'MB000000012',6,253,253,253000.00,253000.00,1,'2025-12-08','2026-12-08','ACTIVE','2025-12-07 20:39:07','2025-12-08 03:53:24'),(13,13,'MB000000013',6,0,0,0.00,0.00,0,'2025-12-08','2026-12-08','ACTIVE','2025-12-07 20:39:09','2025-12-07 20:39:09'),(14,14,'MB000000014',7,2584,1964,2531000.00,2531000.00,6,'2025-12-08','2026-12-08','ACTIVE','2025-12-07 22:25:32','2025-12-08 16:52:01'),(15,15,'MB000000015',6,0,0,0.00,0.00,0,'2025-12-08','2026-12-08','ACTIVE','2025-12-08 04:18:56','2025-12-08 04:18:56'),(16,16,'MB000000016',6,0,0,0.00,0.00,0,'2025-12-08','2026-12-08','ACTIVE','2025-12-08 15:17:39','2025-12-08 15:17:39'),(17,17,'MB000000017',6,0,0,0.00,0.00,0,'2025-12-08','2026-12-08','ACTIVE','2025-12-08 15:18:18','2025-12-08 15:18:18'),(18,18,'MB000000018',6,0,0,0.00,0.00,0,'2025-12-08','2026-12-08','ACTIVE','2025-12-08 15:18:49','2025-12-08 15:18:49'),(19,19,'MB000000019',6,0,0,0.00,0.00,0,'2025-12-08','2026-12-08','ACTIVE','2025-12-08 15:19:17','2025-12-08 15:19:17'),(20,20,'MB000000020',6,0,0,0.00,0.00,0,'2025-12-08','2026-12-08','ACTIVE','2025-12-08 15:19:46','2025-12-08 15:19:46'),(21,21,'MB000000021',6,0,0,0.00,0.00,0,'2025-12-08','2026-12-08','ACTIVE','2025-12-08 15:24:34','2025-12-08 15:24:34');
/*!40000 ALTER TABLE `memberships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movie_genre_mapping`
--

DROP TABLE IF EXISTS `movie_genre_mapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movie_genre_mapping` (
  `movie_id` int NOT NULL,
  `genre_id` int NOT NULL,
  PRIMARY KEY (`movie_id`,`genre_id`),
  KEY `genre_id` (`genre_id`),
  CONSTRAINT `movie_genre_mapping_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`movie_id`) ON DELETE CASCADE,
  CONSTRAINT `movie_genre_mapping_ibfk_2` FOREIGN KEY (`genre_id`) REFERENCES `movie_genres` (`genre_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movie_genre_mapping`
--

LOCK TABLES `movie_genre_mapping` WRITE;
/*!40000 ALTER TABLE `movie_genre_mapping` DISABLE KEYS */;
/*!40000 ALTER TABLE `movie_genre_mapping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movie_genres`
--

DROP TABLE IF EXISTS `movie_genres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movie_genres` (
  `genre_id` int NOT NULL AUTO_INCREMENT,
  `genre_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `genre_name_en` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`genre_id`),
  UNIQUE KEY `genre_name` (`genre_name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movie_genres`
--

LOCK TABLES `movie_genres` WRITE;
/*!40000 ALTER TABLE `movie_genres` DISABLE KEYS */;
/*!40000 ALTER TABLE `movie_genres` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movies`
--

DROP TABLE IF EXISTS `movies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movies` (
  `movie_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_en` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `age_rating` enum('P','K','T13','T16','T18') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_warning` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `synopsis` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `synopsis_en` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `duration_minutes` int NOT NULL,
  `release_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `language` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtitle_language` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `director` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cast` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `producer` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `poster_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `backdrop_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trailer_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('COMING_SOON','NOW_SHOWING','END_SHOWING') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'COMING_SOON',
  `is_featured` tinyint(1) DEFAULT '0',
  `imdb_rating` decimal(3,1) DEFAULT NULL,
  `imdb_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Timestamp when movie was soft deleted',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Flag indicating if movie is soft deleted',
  PRIMARY KEY (`movie_id`),
  KEY `idx_status` (`status`),
  KEY `idx_release_date` (`release_date`),
  KEY `idx_age_rating` (`age_rating`),
  KEY `idx_movies_is_deleted` (`is_deleted`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movies`
--

LOCK TABLES `movies` WRITE;
/*!40000 ALTER TABLE `movies` DISABLE KEYS */;
INSERT INTO `movies` VALUES (3,'Mai','Mai','T16','Không phù hợp trẻ dưới 16 tuổi.','\"Mai\" kể về hành trình chữa lành của một người phụ nữ mang nhiều tổn thương trong quá khứ, nỗ lực tìm lại niềm tin vào cuộc sống và tình yêu.','A Vietnamese drama exploring trauma, healing, and the journey of rediscovering hope.',150,'2024-02-01',NULL,'Việt Nam','Tiếng Việt','Tiếng Việt, Tiếng Anh','Trấn Thành','Trấn Thành, Phương Anh Đào, Uyển Ân','Trấn Thành Film','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/posters/25931ad7-3475-48a6-a7a5-aec33c76564b.jpg','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/backdrops/a97fdee8-2d1a-47d1-870a-43f3de6e4fbb.webp','https://www.youtube.com/embed/VCwqIuAgl9c','NOW_SHOWING',1,6.1,'ttxxxxxxx',NULL,NULL,NULL,0),(4,'28 Years Later: Đền thờ Xương','28 Years Later: The Bone Temple','T18','Có cảnh bạo lực và kinh dị (không phù hợp trẻ em).','Sau khi thảm họa biến đổi hành tinh, một nhóm nhỏ những người sống sót tìm đường đến “Đền thờ Xương” — nơi được cho là chứa bí mật giúp cứu lấy loài người. Nhưng khi họ đến, mọi thứ không như tưởng tượng: những thế lực bí ẩn, zombie/thế lực đen tối — hay chính nỗi sợ hãi — đang chờ sẵn. Hành trình trở thành cuộc chiến sinh tồn, khi ranh giới giữa sống và chết ngày càng mong manh.','After a global catastrophe, a small band of survivors seek out the “Bone Temple,” rumored to hold the secret to humanity’s salvation. But upon arrival, they discover dark forces and horrors — mayhem, undead, and existential terror. Their mission becomes a fight for survival as they face nightmares beyond imagination.',120,'2026-01-16',NULL,'Mỹ / Quốc tế','English','Tiếng Việt','Nguyễn Hồ Duy Khánh (Chuyên gia)','Quốc 36, Khánh 29','Khánh 37','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/posters/d21f521e-8410-4c64-8daf-3c57b0b6690c.jpg','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/backdrops/d347aa31-34da-4b3b-bb6c-0c955516053a.jpg','https://www.youtube.com/watch?v=QlF68NIz8dg','COMING_SOON',1,0.1,'TT1111111',NULL,NULL,NULL,0),(5,'Lật Mặt 7: Một Điều Ước','Face Off 7: One Wish','T13','Một số cảnh hành động có thể không phù hợp cho trẻ nhỏ.','Phần 7 của series “Lật Mặt” mang đến câu chuyện cảm động về một gia đình phải đối mặt với biến cố bất ngờ. Trọng tâm phim là hành trình thực hiện một điều ước cuối cùng chứa đựng nhiều cảm xúc. Xen lẫn giữa những phân cảnh hành động kịch tính là thông điệp về tình thân và lòng trắc ẩn.','The seventh installment of the “Face Off” series follows a family navigating emotional and physical challenges after an unexpected event. Blending action with heartfelt moments, the film highlights love, sacrifice, and the pursuit of a final meaningful wish.',120,'2024-04-26',NULL,'Việt Nam','Tiếng Việt','Tiếng Việt','Lý Hải','Lý Hải, Võ Thành Tâm, Hứa Minh Đạt','Lý Hải Production','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/posters/d7c1de81-07d7-485b-a477-3abbb1790fb6.webp','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/backdrops/f97d3719-1641-4982-a1a5-7e435bb6795c.png','https://www.youtube.com/embed/3PGPGcG5y1M','NOW_SHOWING',0,6.0,'ttxxxxxxx',NULL,NULL,NULL,0),(6,'Hãy Cứu Tôi','Send Help','T18','Có yếu tố rượt đuổi, kinh dị, cảnh gây giật mình.','Một nhóm người bị mắc kẹt trong một khu vực hoang vắng sau một sự cố kỳ lạ. Họ không thể liên lạc với thế giới bên ngoài và dần nhận ra rằng có một thực thể bí ẩn đang truy đuổi. Khi từng người lần lượt biến mất, cuộc đấu tranh sinh tồn trở nên căng thẳng hơn bao giờ hết.','A stranded group tries to survive when an unknown force isolates them from the outside world. As mysterious disappearances begin, their desperation grows, revealing the horrifying truth behind their location.',120,'2026-01-30',NULL,'Mỹ / Anh (dự kiến)','English','Tiếng việt','Khánh 37','Quốc 36, Khánh 29','Khánh37','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/posters/e00193b4-6dd3-4f11-b69f-d4cd35b4de9f.jpg','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/backdrops/a6d2a8fa-067c-4eb9-a377-ec240ee4572d.jpg','https://www.youtube.com/watch?v=R4wiXj9NmEE','COMING_SOON',0,9.0,'ew23263',NULL,NULL,NULL,0),(7,'Công Tử Bạc Liêu','The Prince of Bac Lieu','T13','Có yếu tố hút thuốc và rượu bia.','Bộ phim tái hiện cuộc đời xa hoa và nổi tiếng của Trần Trinh Huy – người được mệnh danh là Công tử Bạc Liêu. Phim khai thác những giai thoại thú vị, những cuộc chơi đắt đỏ và góc nhìn sâu sắc hơn về con người thật phía sau hình tượng ấy. Đây vừa là tác phẩm giải trí, vừa là lát cắt văn hóa Nam Bộ.','A biographical comedy recounting the legendary life of Trần Trinh Huy, known as the Prince of Bac Lieu. The film portrays his extravagant lifestyle while exploring the deeper layers of his personality and cultural influence in Southern Vietnam.',106,'2024-12-20',NULL,'Việt Nam','Tiếng Việt','Tiếng Việt','Nguyễn Quang Dũng','Quốc Bry, Khánh butterfly, Khánh Dog','Quốc Bry','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/posters/15f4d929-0ecf-4764-9af0-bad347a2855f.jpg','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/backdrops/a53ac465-cbcc-422b-b6b1-4c1c59fc133c.jpg','https://www.youtube.com/embed/s3j5Ow0VJww','NOW_SHOWING',0,6.0,'ttxxxxxxx',NULL,NULL,NULL,0),(8,'Khu Ẩn Náu','Shelter','T16','Không phù hợp trẻ em.','Một người phụ nữ lẩn trốn khỏi quá khứ đen tối và tìm đến một khu nhà dưỡng ẩn bí ẩn. Tuy nhiên, nơi này không như quảng cáo – mọi người ở đây đều có câu chuyện đáng sợ, và dường như có ai đó theo dõi họ mỗi đêm.','A woman escaping her dark past hides in a remote shelter. However, the residents share disturbing histories, and strange events occur every night, forcing her to uncover the truth.',120,'2026-01-30',NULL,'Quốc tế','English','','Khánh 37','Quốc 36, Khánh 29 và Dàn diễn viên nữ nhật bản','Hà','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/posters/e318f733-3e92-4d2f-b86a-1d3942607532.jpg','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/backdrops/8ed49d14-eae9-4a03-be30-559698f13824.jpg','https://www.youtube.com/watch?v=ISOoDwsryPc','COMING_SOON',1,10.0,'tt1111',NULL,NULL,NULL,0),(9,'Hành Trình Diệu Kỳ','Olivia ','P','','Olivia – một cô bé thuộc vương quốc diệu kỳ – bắt đầu hành trình tìm lại nguồn ánh sáng đã biến mất khỏi quê hương. Trên đường đi, cô gặp nhiều sinh vật kỳ thú và phát hiện sức mạnh bên trong mình.','A young girl named Olivia ventures to restore the magical light that has vanished from her homeland. Along the way, she meets fantastical creatures and discovers her hidden power.',138,'2026-01-21',NULL,'USA','Vietnamese','','Khanh 37','Quốc 36, Khánh 29 và các diễn viên nữ nhật bản','Khánh 37 và Steven Spielberg','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/posters/96d71dad-9ff4-4e52-b3e1-870838b0f3e1.jpg','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/backdrops/86ad394d-5d77-49a3-a226-d1f0e71c7f72.jpg','https://www.youtube.com/watch?v=5nmWKFHHjqg','COMING_SOON',0,10.0,'sad1425',NULL,NULL,NULL,0),(10,'Anh Trai Tôi','Ma frère','T16','Có yếu tố tâm lý nhạy cảm.','Câu chuyện xoay quanh mối quan hệ phức tạp giữa hai anh em – một người sống thành đạt, một người rơi vào bế tắc. Mâu thuẫn gia đình, tổn thương quá khứ và những bí mật lâu năm dần được mở ra.','A dramatic story about two brothers whose relationship is fractured by past mistakes, family conflicts, and buried secrets resurfacing over time.',120,'2026-01-07',NULL,'Pháp','Pháp','Pháp','Mỹ','Dàn diễn viên Pháp','Pháp','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/posters/089ef012-3185-4268-8773-22070961d05f.jpg','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/backdrops/3365503e-e981-4b9b-be93-809cfff29476.jpg','https://www.youtube.com/watch?v=rXmW0r9I-Rw','COMING_SOON',0,10.0,'tt123456',NULL,NULL,NULL,0),(11,'Ella McCay – Ước Mơ Lớn','Ella McCay','P','Không.','Phim kể về tuổi trẻ của Ella – cô gái có ước mơ thay đổi môi trường sống và giúp gia đình vượt qua khó khăn. Bộ phim mang nhiều cảm hứng, nhẹ nhàng, phù hợp mọi lứa tuổi.','The story focuses on Ella, a determined young girl hoping to improve her family\'s life and find her purpose, presented through gentle, uplifting events.',120,'2026-01-07',NULL,'châu Âu','châu Âu','châu Âu','','','Quốc tế','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/posters/58afa7fd-8978-4068-b565-caa2ee65402a.jpg','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/backdrops/b9d92f86-e460-4e7e-b8f1-3554a9631635.jpg','https://www.youtube.com/watch?v=hJYPGhJDjaU','COMING_SOON',1,NULL,'Vip14758',NULL,NULL,NULL,0),(12,'Cha Mẹ Anh Chị Em','Father Mother Sister Brother','T13','Không.','Bộ phim mô tả đời sống của một gia đình có nhiều tính cách trái ngược. Những xung đột nhỏ, sự hài hước trong sinh hoạt và tình cảm ruột thịt tạo nên câu chuyện gần gũi, cảm động.','A family dramedy portraying the contrast in personality among members, combining humor, family emotion, and warm storytelling.',135,'2026-01-07',NULL,'Quốc tế (châu Âu)','Quốc tế (châu Âu)','','','','','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/posters/fb2c67b2-ed1c-490f-a102-5f5a0a727087.jpg','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/backdrops/c3f3ccef-4765-454c-95ee-c23ee423a3de.jpg','https://www.youtube.com/watch?v=PA07EmbZ0b0','COMING_SOON',0,NULL,'ns475814',NULL,NULL,NULL,0),(13,'Greenland: Di Cư','Greenland: Migration','T16','Có cảnh nguy hiểm, thảm họa.','Trong hậu quả của thiên thạch tàn phá Trái đất, các cộng đồng người sống sót bắt đầu di chuyển đến vùng đất mới. Xung đột tài nguyên, nguy hiểm tự nhiên và sự tan vỡ gia đình khiến hành trình trở nên khốc liệt.','After the catastrophic comet event, surviving groups begin a dangerous migration to safer territories. Resource tensions, harsh conditions, and emotional collapse turn their journey into a fight for survival.',100,'2026-01-14',NULL,'Mỹ','Mỹ','','','','Quốc tế','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/posters/f58f9601-671c-45a3-9930-87a50ca50276.jpg','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/backdrops/914cfe66-f456-44a5-866a-55a9dd1aa950.jpg','https://www.youtube.com/watch?v=H8ieN10lX40','COMING_SOON',0,NULL,'',NULL,NULL,NULL,0),(14,'Làm Giàu Với Ma','Betting with Ghost','T16','Yếu tố tâm linh, miêu tả hồn ma, vài cảnh hù doạ trẻ em; chủ đề về cái chết','Một gia đình nghèo, làm ăn thất bát bỗng “hợp tác” với một hồn ma để tìm cách đổi đời. Những phi vụ “làm giàu với ma” ban đầu tưởng chỉ là trò đùa nhưng dần kéo theo vô số rắc rối, khi lòng tham, bí mật quá khứ và tình thân bị đẩy tới giới hạn. Phim vừa khai thác yếu tố tâm linh, vừa giữ chất hài duyên dáng, mang thông điệp: tiền bạc không thể đánh đổi mọi thứ.','A struggling family accidentally makes a deal with a ghost in hopes of striking it rich. Their “business with the dead” seems fun and harmless at first, but greed and buried secrets soon spiral out of control. Blending supernatural elements with comedy, the film shows that no amount of money is worth sacrificing family and humanity.',113,'2024-08-30',NULL,'Việt Nam','Tiếng Việt','Tuỳ nền tảng (thường không phụ đề khi chiếu rạp trong nước)','Nhất Trung','Huỳnh Lập, Quốc Khánh, Khả Như, Ngân Quỳnh, Đại Nghĩa…','Galaxy Studio & đối tác','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/posters/5a05f893-18c9-4b3f-b139-303745bbef5e.jpg','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/backdrops/7d02a254-4a12-425b-916b-1778fbfbc0b6.jpg','https://www.youtube.com/embed/4G7ONydMU98','NOW_SHOWING',0,5.9,'ttxxxxxxx',NULL,NULL,NULL,0),(15,'Yêu Nhầm Bạn Thân','Friend Zone (Vietnamese remake)','T13','Tình huống tình cảm tay ba, hôn hít, ghen tuông – không phù hợp trẻ nhỏ.','An (Kaity Nguyễn) và Toàn (Trần Ngọc Vàng) là đôi bạn thân khác giới gắn bó nhiều năm, luôn ở cạnh nhau mỗi khi “drama tình ái” xảy ra. An đang yêu Vũ Trần (Thanh Sơn) – một đạo diễn đào hoa, trong khi Toàn giấu kín tình cảm dành cho An vì sợ mất đi tình bạn. Những chuyến đi xuyên Việt, những lần lỡ nhịp liên tiếp buộc cả ba phải đối mặt với cảm xúc thật và định nghĩa lại ranh giới giữa “bạn” và “người yêu”.','An and Toan have been best friends for years, always there for each other whenever love disasters strike. An is happily dating the charming director Vu Tran, while Toan quietly hides his feelings for her. As they travel across Vietnam together and secrets surface, all three must confront what they truly want and whether friendship can survive once the line to romance is crossed.',106,'2025-01-29',NULL,'Việt Nam','Tiếng Việt','Một số suất có phụ đề tiếng Anh (đặc biệt ở thị trường quốc tế)','Nguyễn Quang Dũng, Diệp Thế Vinh','Kaity Nguyễn, Trần Ngọc Vàng, Thanh Sơn…','BHD, CJ và đối tác','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/posters/e84f9370-b606-4b1b-ae50-862616cc9e9d.jpg','https://movie-ticket-image.s3.ap-southeast-1.amazonaws.com/movies/backdrops/ad1829a0-9cef-4094-82bf-1193b2366726.jpg','https://www.youtube.com/embed/q4TodpM3I3c','NOW_SHOWING',0,7.0,'ttxxxxxxx',NULL,NULL,NULL,0);
/*!40000 ALTER TABLE `movies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `notification_type` enum('INFO','SUCCESS','WARNING','ERROR','PROMOTIONAL') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'INFO',
  `channels` json DEFAULT NULL,
  `template_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `template_data` json DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  `email_sent` tinyint(1) DEFAULT '0',
  `sms_sent` tinyint(1) DEFAULT '0',
  `push_sent` tinyint(1) DEFAULT '0',
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_notification_type` (`notification_type`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `is_used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_email_code` (`email`,`code`),
  KEY `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
INSERT INTO `password_reset_tokens` VALUES (1,'khanhkhoi08@gmail.com','741576','2025-12-08 06:25:44',1,'2025-12-08 06:10:44'),(2,'nguyenvanquoc11112004@gmail.com','617622','2025-12-08 11:49:42',0,'2025-12-08 11:34:42'),(3,'khanhkhoi08@gmail.com','248831','2025-12-08 11:53:39',1,'2025-12-08 11:38:39'),(4,'khanhkhoi08@gmail.com','266892','2025-12-08 15:07:07',0,'2025-12-08 14:52:07');
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int DEFAULT NULL,
  `concession_order_id` int DEFAULT NULL,
  `payment_reference` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_method` enum('CREDIT_CARD','DEBIT_CARD','BANK_TRANSFER','E_WALLET','CASH','POINTS','VOUCHER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_provider` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'VND',
  `status` enum('PENDING','PROCESSING','COMPLETED','FAILED','CANCELLED','REFUNDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `gateway_transaction_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gateway_response` json DEFAULT NULL,
  `initiated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  `failure_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `refund_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `payment_reference` (`payment_reference`),
  KEY `idx_payment_reference` (`payment_reference`),
  KEY `idx_booking_id` (`booking_id`),
  KEY `idx_status` (`status`),
  KEY `idx_completed_at` (`completed_at`),
  KEY `concession_order_id` (`concession_order_id`),
  KEY `idx_payments_date_status` (`completed_at`,`status`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`),
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`concession_order_id`) REFERENCES `concession_orders` (`concession_order_id`),
  CONSTRAINT `chk_payment_order` CHECK ((((`booking_id` is not null) and (`concession_order_id` is null)) or ((`booking_id` is null) and (`concession_order_id` is not null)) or ((`booking_id` is not null) and (`concession_order_id` is not null))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `points_transactions`
--

DROP TABLE IF EXISTS `points_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `points_transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `transaction_type` enum('EARN','REDEEM','EXPIRE','ADJUST','GIFT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `points_amount` int NOT NULL,
  `source_type` enum('BOOKING','BONUS','BIRTHDAY','REFERRAL','PROMOTION','MANUAL','CONCESSION') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_id` int DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `balance_before` int NOT NULL,
  `balance_after` int NOT NULL,
  `expires_at` date DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_transaction_type` (`transaction_type`),
  KEY `idx_source` (`source_type`,`source_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `created_by` (`created_by`),
  KEY `idx_points_user_date` (`user_id`,`created_at`),
  CONSTRAINT `points_transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `points_transactions_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `points_transactions`
--

LOCK TABLES `points_transactions` WRITE;
/*!40000 ALTER TABLE `points_transactions` DISABLE KEYS */;
INSERT INTO `points_transactions` VALUES (10,10,'EARN',279,'BOOKING',95,'Tích điểm từ booking BK202512080357396119',0,279,'2026-12-08',NULL,'2025-12-07 20:58:12'),(11,10,'REDEEM',-54,'MANUAL',NULL,'Sử dụng điểm giảm giá booking BK202512080411566085',279,225,NULL,NULL,'2025-12-07 21:11:58'),(12,10,'EARN',187,'BOOKING',96,'Tích điểm từ booking BK202512080411566085',225,412,'2026-12-08',NULL,'2025-12-07 21:12:29'),(13,10,'REDEEM',-54,'MANUAL',NULL,'Sử dụng điểm giảm giá booking BK202512080713332764',412,358,NULL,NULL,'2025-12-08 00:13:34'),(14,10,'REDEEM',-54,'MANUAL',NULL,'Sử dụng điểm giảm giá booking BK202512080732386335',358,304,NULL,NULL,'2025-12-08 00:32:40'),(15,10,'REDEEM',-27,'MANUAL',NULL,'Sử dụng điểm giảm giá booking BK202512080744392266',304,277,NULL,NULL,'2025-12-08 00:44:40'),(16,10,'REDEEM',-52,'MANUAL',NULL,'Sử dụng điểm giảm giá booking BK202512080751583235',277,225,NULL,NULL,'2025-12-08 00:51:58'),(17,10,'REDEEM',-225,'MANUAL',NULL,'Sử dụng điểm giảm giá booking BK202512080753311941',225,0,NULL,NULL,'2025-12-08 00:53:32'),(18,10,'EARN',243,'BOOKING',107,'Tích điểm từ booking BK202512080933460231',0,243,'2026-12-08',NULL,'2025-12-08 02:34:16'),(19,14,'EARN',829,'BOOKING',108,'Tích điểm từ booking BK202512080955213406',0,829,'2026-12-08',NULL,'2025-12-08 02:55:56'),(20,14,'REDEEM',-50,'MANUAL',NULL,'Sử dụng điểm giảm giá booking BK202512080958469833',829,779,NULL,NULL,'2025-12-08 02:58:47'),(21,14,'EARN',51,'BOOKING',109,'Tích điểm từ booking BK202512080958469833',779,830,'2026-12-08',NULL,'2025-12-08 02:59:02'),(22,12,'EARN',253,'BOOKING',110,'Tích điểm từ booking BK202512081051480946',0,253,'2026-12-08',NULL,'2025-12-08 03:53:24'),(23,10,'EARN',368,'BOOKING',111,'Tích điểm từ booking BK202512081101032420',243,611,'2026-12-08',NULL,'2025-12-08 04:02:13'),(24,10,'REDEEM',-196,'MANUAL',NULL,'Sử dụng điểm giảm giá booking BK202512081121310207',611,415,NULL,NULL,'2025-12-08 04:21:32'),(25,10,'EARN',197,'BOOKING',112,'Tích điểm từ booking BK202512081121310207',415,612,'2026-12-08',NULL,'2025-12-08 04:21:49'),(26,10,'REDEEM',-110,'MANUAL',NULL,'Sử dụng điểm giảm giá booking BK202512081125570542',612,502,NULL,NULL,'2025-12-08 04:25:58'),(27,10,'EARN',111,'BOOKING',113,'Tích điểm từ booking BK202512081125570542',502,613,'2026-12-08',NULL,'2025-12-08 04:26:25'),(28,10,'EARN',188,'BOOKING',114,'Tích điểm từ booking BK202512081129431751',613,801,'2026-12-08',NULL,'2025-12-08 04:30:57'),(29,10,'REDEEM',-214,'MANUAL',NULL,'Sử dụng điểm giảm giá booking BK202512081133310650',801,587,NULL,NULL,'2025-12-08 04:33:33'),(30,10,'EARN',214,'BOOKING',115,'Tích điểm từ booking BK202512081133310650',587,801,'2026-12-08',NULL,'2025-12-08 04:34:34'),(31,10,'REDEEM',-244,'MANUAL',NULL,'Sử dụng điểm giảm giá booking BK202512081143585795',801,557,NULL,NULL,'2025-12-08 04:44:00'),(32,10,'EARN',244,'BOOKING',116,'Tích điểm từ booking BK202512081143585795',557,801,'2026-12-08',NULL,'2025-12-08 04:44:23'),(33,10,'REDEEM',-180,'MANUAL',NULL,'Sử dụng điểm giảm giá booking BK202512081200426008',801,621,NULL,NULL,'2025-12-08 05:00:43'),(34,10,'EARN',180,'BOOKING',117,'Tích điểm từ booking BK202512081200426008',621,801,'2026-12-08',NULL,'2025-12-08 05:01:35'),(35,14,'REDEEM',-360,'MANUAL',NULL,'Sử dụng điểm giảm giá booking BK202512081727417375',830,470,NULL,NULL,'2025-12-08 10:27:42'),(36,14,'EARN',180,'BOOKING',120,'Tích điểm từ booking BK202512081912526654',470,650,'2026-12-08',NULL,'2025-12-08 12:16:38'),(37,11,'EARN',155,'BOOKING',122,'Tích điểm từ booking BK202512082055587916',0,155,'2026-12-08',NULL,'2025-12-08 13:56:20'),(38,11,'EARN',145,'BOOKING',121,'Tích điểm từ booking BK202512082054464301',155,300,'2026-12-08',NULL,'2025-12-08 13:56:27'),(39,14,'EARN',1200,'BOOKING',123,'Tích điểm từ booking BK202512082246325972',650,1850,'2026-12-08',NULL,'2025-12-08 15:46:51'),(40,14,'REDEEM',-210,'MANUAL',NULL,'Sử dụng điểm giảm giá booking BK202512082342309933',1850,1640,NULL,NULL,'2025-12-08 16:42:32'),(41,14,'EARN',252,'BOOKING',124,'Tích điểm từ booking BK202512082342309933',1640,1892,'2026-12-08',NULL,'2025-12-08 16:43:10'),(42,14,'EARN',72,'BOOKING',125,'Tích điểm từ booking BK202512082351439352',1892,1964,'2026-12-08',NULL,'2025-12-08 16:52:01'),(43,11,'EARN',109,'BOOKING',127,'Tích điểm từ booking BK202512090101488212',300,409,'2026-12-09',NULL,'2025-12-08 18:02:00'),(44,11,'EARN',269,'BOOKING',126,'Tích điểm từ booking BK202512090058322084',409,678,'2026-12-09',NULL,'2025-12-08 18:02:12'),(45,11,'EARN',180,'BOOKING',130,'Tích điểm từ booking BK202512090430022745',678,858,'2026-12-09',NULL,'2025-12-08 21:30:32'),(46,11,'EARN',459,'BOOKING',131,'Tích điểm từ booking BK202512090443288493',858,1317,'2026-12-09',NULL,'2025-12-08 21:43:45');
/*!40000 ALTER TABLE `points_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pricing_rules`
--

DROP TABLE IF EXISTS `pricing_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pricing_rules` (
  `rule_id` int NOT NULL AUTO_INCREMENT,
  `rule_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `conditions` json DEFAULT NULL,
  `rule_type` enum('SURCHARGE','DISCOUNT','FIXED_PRICE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `percentage` decimal(5,2) DEFAULT NULL,
  `valid_from` date NOT NULL,
  `valid_to` date DEFAULT NULL,
  `applies_to` json DEFAULT NULL,
  `priority` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`rule_id`),
  KEY `idx_valid_dates` (`valid_from`,`valid_to`),
  KEY `idx_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pricing_rules`
--

LOCK TABLES `pricing_rules` WRITE;
/*!40000 ALTER TABLE `pricing_rules` DISABLE KEYS */;
/*!40000 ALTER TABLE `pricing_rules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotions`
--

DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotions` (
  `promotion_id` int NOT NULL AUTO_INCREMENT,
  `promotion_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `promotion_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `promotion_type` enum('PERCENTAGE','FIXED_AMOUNT','BUY_X_GET_Y','FREE_ITEM','POINTS_MULTIPLIER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_percentage` decimal(5,2) DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT NULL,
  `min_purchase_amount` decimal(10,2) DEFAULT '0.00',
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `applicable_to` json DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `max_usage_total` int DEFAULT NULL,
  `max_usage_per_user` int DEFAULT '1',
  `current_usage` int DEFAULT '0',
  `target_user_segments` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`promotion_id`),
  UNIQUE KEY `promotion_code` (`promotion_code`),
  KEY `idx_promotion_code` (`promotion_code`),
  KEY `idx_date_range` (`start_date`,`end_date`),
  KEY `idx_is_active` (`is_active`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `promotions_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refunds`
--

DROP TABLE IF EXISTS `refunds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refunds` (
  `refund_id` int NOT NULL AUTO_INCREMENT,
  `payment_id` int NOT NULL,
  `refund_reference` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `refund_amount` decimal(12,2) NOT NULL,
  `refund_method` enum('ORIGINAL_PAYMENT','BANK_TRANSFER','POINTS','GIFT_CARD') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` enum('CUSTOMER_REQUEST','SHOWTIME_CANCELLED','TECHNICAL_ERROR','FRAUD') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('PENDING','PROCESSING','COMPLETED','FAILED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `processed_by` int DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `gateway_refund_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gateway_response` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`refund_id`),
  UNIQUE KEY `refund_reference` (`refund_reference`),
  KEY `idx_refund_reference` (`refund_reference`),
  KEY `idx_payment_id` (`payment_id`),
  KEY `idx_status` (`status`),
  KEY `processed_by` (`processed_by`),
  CONSTRAINT `refunds_ibfk_1` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`payment_id`),
  CONSTRAINT `refunds_ibfk_2` FOREIGN KEY (`processed_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refunds`
--

LOCK TABLES `refunds` WRITE;
/*!40000 ALTER TABLE `refunds` DISABLE KEYS */;
/*!40000 ALTER TABLE `refunds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'CUSTOMER','Khách hàng thông thường','2025-12-03 04:37:43'),(2,'CINEMA_STAFF','Nhân viên rạp','2025-12-03 04:37:43'),(3,'CINEMA_MANAGER','Quản lý rạp','2025-12-03 04:37:43'),(4,'SYSTEM_ADMIN','Quản trị viên hệ thống','2025-12-03 04:37:43');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seats`
--

DROP TABLE IF EXISTS `seats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seats` (
  `seat_id` int NOT NULL AUTO_INCREMENT,
  `hall_id` int NOT NULL,
  `seat_row` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `seat_number` int NOT NULL,
  `seat_type` enum('STANDARD','VIP','COUPLE','WHEELCHAIR') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'STANDARD',
  `position_x` int DEFAULT NULL,
  `position_y` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`seat_id`),
  UNIQUE KEY `unique_seat_position` (`hall_id`,`seat_row`,`seat_number`),
  KEY `idx_hall_id` (`hall_id`),
  CONSTRAINT `seats_ibfk_1` FOREIGN KEY (`hall_id`) REFERENCES `cinema_halls` (`hall_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2309 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seats`
--

LOCK TABLES `seats` WRITE;
/*!40000 ALTER TABLE `seats` DISABLE KEYS */;
INSERT INTO `seats` VALUES (1437,14,'A',1,'VIP',1,1,1),(1438,14,'A',2,'VIP',2,1,1),(1439,14,'A',3,'VIP',3,1,1),(1440,14,'A',4,'VIP',4,1,1),(1441,14,'A',5,'VIP',5,1,1),(1442,14,'A',6,'VIP',6,1,1),(1443,14,'A',7,'VIP',7,1,1),(1444,14,'A',8,'VIP',8,1,1),(1445,14,'B',1,'WHEELCHAIR',1,2,1),(1446,14,'B',2,'WHEELCHAIR',2,2,1),(1447,14,'B',3,'WHEELCHAIR',3,2,1),(1448,14,'B',4,'VIP',4,2,1),(1449,14,'B',5,'VIP',5,2,1),(1450,14,'B',6,'VIP',6,2,1),(1451,14,'B',7,'VIP',7,2,1),(1452,14,'B',8,'VIP',8,2,1),(1453,14,'C',1,'VIP',1,3,1),(1454,14,'C',2,'VIP',2,3,1),(1455,14,'C',3,'VIP',3,3,1),(1456,14,'C',4,'VIP',4,3,1),(1457,14,'C',5,'VIP',5,3,1),(1458,14,'C',6,'VIP',6,3,1),(1459,14,'C',7,'VIP',7,3,1),(1460,14,'C',8,'VIP',8,3,1),(1461,14,'D',1,'VIP',1,4,1),(1462,14,'D',2,'VIP',2,4,1),(1463,14,'D',3,'VIP',3,4,1),(1464,14,'D',4,'VIP',4,4,1),(1465,14,'D',5,'VIP',5,4,1),(1466,14,'D',6,'VIP',6,4,1),(1467,14,'D',7,'VIP',7,4,1),(1468,14,'D',8,'VIP',8,4,1),(1469,14,'E',1,'STANDARD',1,5,1),(1470,14,'E',2,'STANDARD',2,5,1),(1471,14,'E',3,'STANDARD',3,5,1),(1472,14,'E',4,'STANDARD',4,5,1),(1473,14,'E',5,'STANDARD',5,5,1),(1474,14,'E',6,'STANDARD',6,5,1),(1475,14,'E',7,'STANDARD',7,5,1),(1476,14,'E',8,'STANDARD',8,5,1),(1477,14,'F',1,'STANDARD',1,6,1),(1478,14,'F',2,'STANDARD',2,6,1),(1479,14,'F',3,'STANDARD',3,6,1),(1480,14,'F',4,'STANDARD',4,6,1),(1481,14,'F',5,'STANDARD',5,6,1),(1482,14,'F',6,'STANDARD',6,6,1),(1483,14,'F',7,'STANDARD',7,6,1),(1484,14,'F',8,'STANDARD',8,6,1),(1485,14,'G',1,'STANDARD',1,7,1),(1486,14,'G',2,'STANDARD',2,7,1),(1487,14,'G',3,'STANDARD',3,7,1),(1488,14,'G',4,'STANDARD',4,7,1),(1489,14,'G',5,'STANDARD',5,7,1),(1490,14,'G',6,'STANDARD',6,7,1),(1491,14,'G',7,'STANDARD',7,7,1),(1492,14,'G',8,'STANDARD',8,7,1),(1493,14,'H',1,'STANDARD',1,8,1),(1494,14,'H',2,'STANDARD',2,8,1),(1495,14,'H',3,'STANDARD',3,8,1),(1496,14,'H',4,'STANDARD',4,8,1),(1497,14,'H',5,'STANDARD',5,8,1),(1498,14,'H',6,'STANDARD',6,8,1),(1499,14,'H',7,'STANDARD',7,8,1),(1500,14,'H',8,'STANDARD',8,8,1),(1501,14,'I',1,'STANDARD',1,9,1),(1502,14,'I',2,'STANDARD',2,9,1),(1503,14,'I',3,'STANDARD',3,9,1),(1504,14,'I',4,'STANDARD',4,9,1),(1505,14,'I',5,'STANDARD',5,9,1),(1506,14,'I',6,'STANDARD',6,9,1),(1507,14,'I',7,'STANDARD',7,9,1),(1508,14,'I',8,'STANDARD',8,9,1),(1509,14,'J',1,'STANDARD',1,10,1),(1510,14,'J',2,'STANDARD',2,10,1),(1511,14,'J',3,'STANDARD',3,10,1),(1512,14,'J',4,'STANDARD',4,10,1),(1513,14,'J',5,'STANDARD',5,10,1),(1514,14,'J',6,'STANDARD',6,10,1),(1515,14,'J',7,'STANDARD',7,10,1),(1516,14,'J',8,'STANDARD',8,10,1),(1617,13,'A',1,'VIP',1,1,1),(1618,13,'A',2,'VIP',2,1,1),(1619,13,'A',3,'VIP',3,1,1),(1620,13,'A',4,'VIP',4,1,1),(1621,13,'A',5,'VIP',5,1,1),(1622,13,'A',6,'VIP',6,1,1),(1623,13,'A',7,'VIP',7,1,1),(1624,13,'A',8,'VIP',8,1,1),(1625,13,'A',9,'VIP',9,1,1),(1626,13,'A',10,'VIP',10,1,1),(1627,13,'B',1,'VIP',1,2,1),(1628,13,'B',2,'WHEELCHAIR',2,2,1),(1629,13,'B',3,'WHEELCHAIR',3,2,1),(1630,13,'B',4,'COUPLE',4,2,1),(1631,13,'B',5,'COUPLE',5,2,1),(1632,13,'B',6,'COUPLE',6,2,1),(1633,13,'B',7,'COUPLE',7,2,1),(1634,13,'B',8,'VIP',8,2,1),(1635,13,'B',9,'VIP',9,2,1),(1636,13,'B',10,'VIP',10,2,1),(1637,13,'C',1,'VIP',1,3,1),(1638,13,'C',2,'VIP',2,3,1),(1639,13,'C',3,'VIP',3,3,1),(1640,13,'C',4,'VIP',4,3,1),(1641,13,'C',5,'VIP',5,3,1),(1642,13,'C',6,'VIP',6,3,1),(1643,13,'C',7,'VIP',7,3,1),(1644,13,'C',8,'VIP',8,3,1),(1645,13,'C',9,'VIP',9,3,1),(1646,13,'C',10,'VIP',10,3,1),(1647,13,'D',1,'VIP',1,4,1),(1648,13,'D',2,'VIP',2,4,1),(1649,13,'D',3,'VIP',3,4,1),(1650,13,'D',4,'VIP',4,4,1),(1651,13,'D',5,'VIP',5,4,1),(1652,13,'D',6,'VIP',6,4,1),(1653,13,'D',7,'VIP',7,4,1),(1654,13,'D',8,'VIP',8,4,1),(1655,13,'D',9,'VIP',9,4,1),(1656,13,'D',10,'VIP',10,4,1),(1657,13,'E',1,'STANDARD',1,5,1),(1658,13,'E',2,'STANDARD',2,5,1),(1659,13,'E',3,'STANDARD',3,5,1),(1660,13,'E',4,'STANDARD',4,5,1),(1661,13,'E',5,'STANDARD',5,5,1),(1662,13,'E',6,'STANDARD',6,5,1),(1663,13,'E',7,'STANDARD',7,5,1),(1664,13,'E',8,'STANDARD',8,5,1),(1665,13,'E',9,'STANDARD',9,5,1),(1666,13,'E',10,'STANDARD',10,5,1),(1727,15,'A',1,'VIP',1,1,1),(1728,15,'A',2,'VIP',2,1,1),(1729,15,'A',3,'VIP',3,1,1),(1730,15,'A',4,'VIP',4,1,1),(1731,15,'A',5,'VIP',5,1,1),(1732,15,'A',6,'VIP',6,1,1),(1733,15,'A',7,'VIP',7,1,1),(1734,15,'A',8,'VIP',8,1,1),(1735,15,'A',9,'VIP',9,1,1),(1736,15,'A',10,'VIP',10,1,1),(1737,15,'B',1,'VIP',1,2,1),(1738,15,'B',2,'VIP',2,2,1),(1739,15,'B',3,'VIP',3,2,1),(1740,15,'B',4,'VIP',4,2,1),(1741,15,'B',5,'VIP',5,2,1),(1742,15,'B',6,'COUPLE',6,2,1),(1743,15,'B',7,'COUPLE',7,2,1),(1744,15,'B',8,'VIP',8,2,1),(1745,15,'B',9,'VIP',9,2,1),(1746,15,'B',10,'VIP',10,2,1),(1747,15,'C',1,'STANDARD',1,3,1),(1748,15,'C',2,'STANDARD',2,3,1),(1749,15,'C',3,'STANDARD',3,3,1),(1750,15,'C',4,'STANDARD',4,3,1),(1751,15,'C',5,'STANDARD',5,3,1),(1752,15,'C',6,'STANDARD',6,3,1),(1753,15,'C',7,'STANDARD',7,3,1),(1754,15,'C',8,'STANDARD',8,3,1),(1755,15,'C',9,'STANDARD',9,3,1),(1756,15,'C',10,'STANDARD',10,3,1),(1757,16,'A',1,'VIP',1,1,1),(1758,16,'A',2,'VIP',2,1,1),(1759,16,'A',3,'VIP',3,1,1),(1760,16,'A',4,'VIP',4,1,1),(1761,16,'A',5,'VIP',5,1,1),(1762,16,'A',6,'VIP',6,1,1),(1763,16,'A',7,'VIP',7,1,1),(1764,16,'A',8,'VIP',8,1,1),(1765,16,'A',9,'VIP',9,1,1),(1766,16,'A',10,'VIP',10,1,1),(1767,16,'B',1,'COUPLE',1,2,1),(1768,16,'B',2,'COUPLE',2,2,1),(1769,16,'B',3,'COUPLE',3,2,1),(1770,16,'B',4,'COUPLE',4,2,1),(1771,16,'B',5,'COUPLE',5,2,1),(1772,16,'B',6,'COUPLE',6,2,1),(1773,16,'B',7,'COUPLE',7,2,1),(1774,16,'B',8,'COUPLE',8,2,1),(1775,16,'B',9,'COUPLE',9,2,1),(1776,16,'B',10,'COUPLE',10,2,1),(1777,16,'C',1,'WHEELCHAIR',1,3,1),(1778,16,'C',2,'WHEELCHAIR',2,3,1),(1779,16,'C',3,'WHEELCHAIR',3,3,1),(1780,16,'C',4,'WHEELCHAIR',4,3,1),(1781,16,'C',5,'WHEELCHAIR',5,3,1),(1782,16,'C',6,'WHEELCHAIR',6,3,1),(1783,16,'C',7,'WHEELCHAIR',7,3,1),(1784,16,'C',8,'WHEELCHAIR',8,3,1),(1785,16,'C',9,'WHEELCHAIR',9,3,1),(1786,16,'C',10,'WHEELCHAIR',10,3,1),(1787,16,'D',1,'STANDARD',1,4,1),(1788,16,'D',2,'STANDARD',2,4,1),(1789,16,'D',3,'STANDARD',3,4,1),(1790,16,'D',4,'STANDARD',4,4,1),(1791,16,'D',5,'STANDARD',5,4,1),(1792,16,'D',6,'STANDARD',6,4,1),(1793,16,'D',7,'STANDARD',7,4,1),(1794,16,'D',8,'STANDARD',8,4,1),(1795,16,'D',9,'STANDARD',9,4,1),(1796,16,'D',10,'STANDARD',10,4,1),(1797,16,'E',1,'STANDARD',1,5,1),(1798,16,'E',2,'STANDARD',2,5,1),(1799,16,'E',3,'STANDARD',3,5,1),(1800,16,'E',4,'STANDARD',4,5,1),(1801,16,'E',5,'STANDARD',5,5,1),(1802,16,'E',6,'STANDARD',6,5,1),(1803,16,'E',7,'STANDARD',7,5,1),(1804,16,'E',8,'STANDARD',8,5,1),(1805,16,'E',9,'STANDARD',9,5,1),(1806,16,'E',10,'STANDARD',10,5,1),(1807,17,'A',1,'VIP',1,1,1),(1808,17,'A',2,'VIP',2,1,1),(1809,17,'A',3,'VIP',3,1,1),(1810,17,'A',4,'VIP',4,1,1),(1811,17,'A',5,'VIP',5,1,1),(1812,17,'A',6,'VIP',6,1,1),(1813,17,'A',7,'VIP',7,1,1),(1814,17,'A',8,'VIP',8,1,1),(1815,17,'A',9,'VIP',9,1,1),(1816,17,'A',10,'VIP',10,1,1),(1817,17,'B',1,'VIP',1,2,1),(1818,17,'B',2,'VIP',2,2,1),(1819,17,'B',3,'VIP',3,2,1),(1820,17,'B',4,'VIP',4,2,1),(1821,17,'B',5,'VIP',5,2,1),(1822,17,'B',6,'VIP',6,2,1),(1823,17,'B',7,'VIP',7,2,1),(1824,17,'B',8,'VIP',8,2,1),(1825,17,'B',9,'VIP',9,2,1),(1826,17,'B',10,'VIP',10,2,1),(1827,17,'C',1,'COUPLE',1,3,1),(1828,17,'C',2,'COUPLE',2,3,1),(1829,17,'C',3,'COUPLE',3,3,1),(1830,17,'C',4,'COUPLE',4,3,1),(1831,17,'C',5,'COUPLE',5,3,1),(1832,17,'C',6,'COUPLE',6,3,1),(1833,17,'C',7,'COUPLE',7,3,1),(1834,17,'C',8,'COUPLE',8,3,1),(1835,17,'C',9,'COUPLE',9,3,1),(1836,17,'C',10,'COUPLE',10,3,1),(1837,17,'D',1,'STANDARD',1,4,1),(1838,17,'D',2,'STANDARD',2,4,1),(1839,17,'D',3,'STANDARD',3,4,1),(1840,17,'D',4,'STANDARD',4,4,1),(1841,17,'D',5,'VIP',5,4,1),(1842,17,'D',6,'VIP',6,4,1),(1843,17,'D',7,'VIP',7,4,1),(1844,17,'D',8,'STANDARD',8,4,1),(1845,17,'D',9,'STANDARD',9,4,1),(1846,17,'D',10,'STANDARD',10,4,1),(1847,17,'E',1,'WHEELCHAIR',1,5,1),(1848,17,'E',2,'WHEELCHAIR',2,5,1),(1849,17,'E',3,'WHEELCHAIR',3,5,1),(1850,17,'E',4,'WHEELCHAIR',4,5,1),(1851,17,'E',5,'COUPLE',5,5,1),(1852,17,'E',6,'COUPLE',6,5,1),(1853,17,'E',7,'WHEELCHAIR',7,5,1),(1854,17,'E',8,'WHEELCHAIR',8,5,1),(1855,17,'E',9,'WHEELCHAIR',9,5,1),(1856,17,'E',10,'WHEELCHAIR',10,5,1),(1857,17,'F',1,'STANDARD',1,6,1),(1858,17,'F',2,'STANDARD',2,6,1),(1859,17,'F',3,'STANDARD',3,6,1),(1860,17,'F',4,'STANDARD',4,6,1),(1861,17,'F',5,'STANDARD',5,6,1),(1862,17,'F',6,'STANDARD',6,6,1),(1863,17,'F',7,'STANDARD',7,6,1),(1864,17,'F',8,'STANDARD',8,6,1),(1865,17,'F',9,'STANDARD',9,6,1),(1866,17,'F',10,'STANDARD',10,6,1),(1867,17,'G',1,'STANDARD',1,7,1),(1868,17,'G',2,'STANDARD',2,7,1),(1869,17,'G',3,'STANDARD',3,7,1),(1870,17,'G',4,'STANDARD',4,7,1),(1871,17,'G',5,'STANDARD',5,7,1),(1872,17,'G',6,'STANDARD',6,7,1),(1873,17,'G',7,'STANDARD',7,7,1),(1874,17,'G',8,'STANDARD',8,7,1),(1875,17,'G',9,'STANDARD',9,7,1),(1876,17,'G',10,'STANDARD',10,7,1),(1877,17,'H',1,'STANDARD',1,8,1),(1878,17,'H',2,'STANDARD',2,8,1),(1879,17,'H',3,'STANDARD',3,8,1),(1880,17,'H',4,'STANDARD',4,8,1),(1881,17,'H',5,'STANDARD',5,8,1),(1882,17,'H',6,'STANDARD',6,8,1),(1883,17,'H',7,'STANDARD',7,8,1),(1884,17,'H',8,'STANDARD',8,8,1),(1885,17,'H',9,'STANDARD',9,8,1),(1886,17,'H',10,'STANDARD',10,8,1),(1887,17,'I',1,'STANDARD',1,9,1),(1888,17,'I',2,'STANDARD',2,9,1),(1889,17,'I',3,'STANDARD',3,9,1),(1890,17,'I',4,'STANDARD',4,9,1),(1891,17,'I',5,'STANDARD',5,9,1),(1892,17,'I',6,'STANDARD',6,9,1),(1893,17,'I',7,'STANDARD',7,9,1),(1894,17,'I',8,'STANDARD',8,9,1),(1895,17,'I',9,'STANDARD',9,9,1),(1896,17,'I',10,'STANDARD',10,9,1),(1897,17,'J',1,'STANDARD',1,10,1),(1898,17,'J',2,'STANDARD',2,10,1),(1899,17,'J',3,'STANDARD',3,10,1),(1900,17,'J',4,'STANDARD',4,10,1),(1901,17,'J',5,'STANDARD',5,10,1),(1902,17,'J',6,'STANDARD',6,10,1),(1903,17,'J',7,'STANDARD',7,10,1),(1904,17,'J',8,'STANDARD',8,10,1),(1905,17,'J',9,'STANDARD',9,10,1),(1906,17,'J',10,'STANDARD',10,10,1),(1907,18,'A',1,'VIP',1,1,1),(1908,18,'A',2,'VIP',2,1,1),(1909,18,'A',3,'VIP',3,1,1),(1910,18,'A',4,'VIP',4,1,1),(1911,18,'A',5,'VIP',5,1,1),(1912,18,'A',6,'VIP',6,1,1),(1913,18,'A',7,'VIP',7,1,1),(1914,18,'A',8,'VIP',8,1,1),(1915,18,'A',9,'VIP',9,1,1),(1916,18,'A',10,'VIP',10,1,1),(1917,18,'B',1,'VIP',1,2,1),(1918,18,'B',2,'VIP',2,2,1),(1919,18,'B',3,'VIP',3,2,1),(1920,18,'B',4,'VIP',4,2,1),(1921,18,'B',5,'VIP',5,2,1),(1922,18,'B',6,'VIP',6,2,1),(1923,18,'B',7,'VIP',7,2,1),(1924,18,'B',8,'VIP',8,2,1),(1925,18,'B',9,'VIP',9,2,1),(1926,18,'B',10,'VIP',10,2,1),(1927,18,'C',1,'COUPLE',1,3,1),(1928,18,'C',2,'COUPLE',2,3,1),(1929,18,'C',3,'COUPLE',3,3,1),(1930,18,'C',4,'COUPLE',4,3,1),(1931,18,'C',5,'COUPLE',5,3,1),(1932,18,'C',6,'COUPLE',6,3,1),(1933,18,'C',7,'COUPLE',7,3,1),(1934,18,'C',8,'COUPLE',8,3,1),(1935,18,'C',9,'COUPLE',9,3,1),(1936,18,'C',10,'COUPLE',10,3,1),(1937,18,'D',1,'STANDARD',1,4,1),(1938,18,'D',2,'STANDARD',2,4,1),(1939,18,'D',3,'STANDARD',3,4,1),(1940,18,'D',4,'STANDARD',4,4,1),(1941,18,'D',5,'STANDARD',5,4,1),(1942,18,'D',6,'STANDARD',6,4,1),(1943,18,'D',7,'STANDARD',7,4,1),(1944,18,'D',8,'STANDARD',8,4,1),(1945,18,'D',9,'STANDARD',9,4,1),(1946,18,'D',10,'STANDARD',10,4,1),(1947,18,'E',1,'WHEELCHAIR',1,5,1),(1948,18,'E',2,'WHEELCHAIR',2,5,1),(1949,18,'E',3,'WHEELCHAIR',3,5,1),(1950,18,'E',4,'WHEELCHAIR',4,5,1),(1951,18,'E',5,'WHEELCHAIR',5,5,1),(1952,18,'E',6,'WHEELCHAIR',6,5,1),(1953,18,'E',7,'WHEELCHAIR',7,5,1),(1954,18,'E',8,'WHEELCHAIR',8,5,1),(1955,18,'E',9,'WHEELCHAIR',9,5,1),(1956,18,'E',10,'WHEELCHAIR',10,5,1),(1957,18,'F',1,'STANDARD',1,6,1),(1958,18,'F',2,'STANDARD',2,6,1),(1959,18,'F',3,'STANDARD',3,6,1),(1960,18,'F',4,'STANDARD',4,6,1),(1961,18,'F',5,'STANDARD',5,6,1),(1962,18,'F',6,'STANDARD',6,6,1),(1963,18,'F',7,'STANDARD',7,6,1),(1964,18,'F',8,'STANDARD',8,6,1),(1965,18,'F',9,'STANDARD',9,6,1),(1966,18,'F',10,'STANDARD',10,6,1),(1967,18,'G',1,'STANDARD',1,7,1),(1968,18,'G',2,'STANDARD',2,7,1),(1969,18,'G',3,'STANDARD',3,7,1),(1970,18,'G',4,'STANDARD',4,7,1),(1971,18,'G',5,'STANDARD',5,7,1),(1972,18,'G',6,'STANDARD',6,7,1),(1973,18,'G',7,'STANDARD',7,7,1),(1974,18,'G',8,'STANDARD',8,7,1),(1975,18,'G',9,'STANDARD',9,7,1),(1976,18,'G',10,'STANDARD',10,7,1),(1977,18,'H',1,'STANDARD',1,8,1),(1978,18,'H',2,'STANDARD',2,8,1),(1979,18,'H',3,'STANDARD',3,8,1),(1980,18,'H',4,'STANDARD',4,8,1),(1981,18,'H',5,'STANDARD',5,8,1),(1982,18,'H',6,'STANDARD',6,8,1),(1983,18,'H',7,'STANDARD',7,8,1),(1984,18,'H',8,'STANDARD',8,8,1),(1985,18,'H',9,'STANDARD',9,8,1),(1986,18,'H',10,'STANDARD',10,8,1),(1987,18,'I',1,'STANDARD',1,9,1),(1988,18,'I',2,'STANDARD',2,9,1),(1989,18,'I',3,'STANDARD',3,9,1),(1990,18,'I',4,'STANDARD',4,9,1),(1991,18,'I',5,'STANDARD',5,9,1),(1992,18,'I',6,'STANDARD',6,9,1),(1993,18,'I',7,'STANDARD',7,9,1),(1994,18,'I',8,'STANDARD',8,9,1),(1995,18,'I',9,'STANDARD',9,9,1),(1996,18,'I',10,'STANDARD',10,9,1),(1997,18,'J',1,'STANDARD',1,10,1),(1998,18,'J',2,'STANDARD',2,10,1),(1999,18,'J',3,'STANDARD',3,10,1),(2000,18,'J',4,'STANDARD',4,10,1),(2001,18,'J',5,'STANDARD',5,10,1),(2002,18,'J',6,'STANDARD',6,10,1),(2003,18,'J',7,'STANDARD',7,10,1),(2004,18,'J',8,'STANDARD',8,10,1),(2005,18,'J',9,'STANDARD',9,10,1),(2006,18,'J',10,'STANDARD',10,10,1),(2007,19,'A',1,'VIP',1,1,1),(2008,19,'A',2,'VIP',2,1,1),(2009,19,'A',3,'VIP',3,1,1),(2010,19,'A',4,'VIP',4,1,1),(2011,19,'A',5,'VIP',5,1,1),(2012,19,'B',1,'VIP',1,2,1),(2013,19,'B',2,'VIP',2,2,1),(2014,19,'B',3,'VIP',3,2,1),(2015,19,'B',4,'VIP',4,2,1),(2016,19,'B',5,'VIP',5,2,1),(2017,19,'C',1,'COUPLE',1,3,1),(2018,19,'C',2,'COUPLE',2,3,1),(2019,19,'C',3,'COUPLE',3,3,1),(2020,19,'C',4,'COUPLE',4,3,1),(2021,19,'C',5,'COUPLE',5,3,1),(2022,19,'D',1,'STANDARD',1,4,1),(2023,19,'D',2,'STANDARD',2,4,1),(2024,19,'D',3,'STANDARD',3,4,1),(2025,19,'D',4,'STANDARD',4,4,1),(2026,19,'D',5,'STANDARD',5,4,1),(2027,19,'E',1,'WHEELCHAIR',1,5,1),(2028,19,'E',2,'WHEELCHAIR',2,5,1),(2029,19,'E',3,'WHEELCHAIR',3,5,1),(2030,19,'E',4,'WHEELCHAIR',4,5,1),(2031,19,'E',5,'WHEELCHAIR',5,5,1),(2032,20,'A',1,'VIP',1,1,1),(2033,20,'A',2,'VIP',2,1,1),(2034,20,'A',3,'VIP',3,1,1),(2035,20,'A',4,'VIP',4,1,1),(2036,20,'A',5,'VIP',5,1,1),(2037,20,'B',1,'VIP',1,2,1),(2038,20,'B',2,'VIP',2,2,1),(2039,20,'B',3,'VIP',3,2,1),(2040,20,'B',4,'VIP',4,2,1),(2041,20,'B',5,'VIP',5,2,1),(2042,20,'C',1,'COUPLE',1,3,1),(2043,20,'C',2,'COUPLE',2,3,1),(2044,20,'C',3,'COUPLE',3,3,1),(2045,20,'C',4,'COUPLE',4,3,1),(2046,20,'C',5,'COUPLE',5,3,1),(2047,20,'D',1,'STANDARD',1,4,1),(2048,20,'D',2,'STANDARD',2,4,1),(2049,20,'D',3,'STANDARD',3,4,1),(2050,20,'D',4,'STANDARD',4,4,1),(2051,20,'D',5,'STANDARD',5,4,1),(2052,20,'E',1,'WHEELCHAIR',1,5,1),(2053,20,'E',2,'WHEELCHAIR',2,5,1),(2054,20,'E',3,'WHEELCHAIR',3,5,1),(2055,20,'E',4,'WHEELCHAIR',4,5,1),(2056,20,'E',5,'WHEELCHAIR',5,5,1),(2061,22,'A',1,'VIP',1,1,1),(2062,22,'A',2,'VIP',2,1,1),(2063,22,'A',3,'VIP',3,1,1),(2064,22,'A',4,'VIP',4,1,1),(2065,22,'A',5,'VIP',5,1,1),(2066,22,'A',6,'VIP',6,1,1),(2067,22,'A',7,'VIP',7,1,1),(2068,22,'A',8,'VIP',8,1,1),(2069,22,'A',9,'VIP',9,1,1),(2070,22,'A',10,'VIP',10,1,1),(2071,22,'B',1,'VIP',1,2,1),(2072,22,'B',2,'VIP',2,2,1),(2073,22,'B',3,'VIP',3,2,1),(2074,22,'B',4,'VIP',4,2,1),(2075,22,'B',5,'VIP',5,2,1),(2076,22,'B',6,'VIP',6,2,1),(2077,22,'B',7,'VIP',7,2,1),(2078,22,'B',8,'VIP',8,2,1),(2079,22,'B',9,'VIP',9,2,1),(2080,22,'B',10,'VIP',10,2,1),(2081,22,'C',1,'COUPLE',1,3,1),(2082,22,'C',2,'COUPLE',2,3,1),(2083,22,'C',3,'COUPLE',3,3,1),(2084,22,'C',4,'COUPLE',4,3,1),(2085,22,'C',5,'COUPLE',5,3,1),(2086,22,'C',6,'COUPLE',6,3,1),(2087,22,'C',7,'COUPLE',7,3,1),(2088,22,'C',8,'COUPLE',8,3,1),(2089,22,'C',9,'COUPLE',9,3,1),(2090,22,'C',10,'COUPLE',10,3,1),(2091,22,'D',1,'STANDARD',1,4,1),(2092,22,'D',2,'STANDARD',2,4,1),(2093,22,'D',3,'STANDARD',3,4,1),(2094,22,'D',4,'STANDARD',4,4,1),(2095,22,'D',5,'STANDARD',5,4,1),(2096,22,'D',6,'STANDARD',6,4,1),(2097,22,'D',7,'STANDARD',7,4,1),(2098,22,'D',8,'STANDARD',8,4,1),(2099,22,'D',9,'STANDARD',9,4,1),(2100,22,'D',10,'STANDARD',10,4,1),(2101,22,'E',1,'WHEELCHAIR',1,5,1),(2102,22,'E',2,'WHEELCHAIR',2,5,1),(2103,22,'E',3,'WHEELCHAIR',3,5,1),(2104,22,'E',4,'WHEELCHAIR',4,5,1),(2105,22,'E',5,'WHEELCHAIR',5,5,1),(2106,22,'E',6,'WHEELCHAIR',6,5,1),(2107,22,'E',7,'WHEELCHAIR',7,5,1),(2108,22,'E',8,'WHEELCHAIR',8,5,1),(2109,22,'E',9,'WHEELCHAIR',9,5,1),(2110,22,'E',10,'WHEELCHAIR',10,5,1),(2111,22,'F',1,'STANDARD',1,6,1),(2112,22,'F',2,'STANDARD',2,6,1),(2113,22,'F',3,'STANDARD',3,6,1),(2114,22,'F',4,'STANDARD',4,6,1),(2115,22,'F',5,'STANDARD',5,6,1),(2116,22,'F',6,'STANDARD',6,6,1),(2117,22,'F',7,'STANDARD',7,6,1),(2118,22,'F',8,'STANDARD',8,6,1),(2119,22,'F',9,'STANDARD',9,6,1),(2120,22,'F',10,'STANDARD',10,6,1),(2121,22,'G',1,'STANDARD',1,7,1),(2122,22,'G',2,'STANDARD',2,7,1),(2123,22,'G',3,'STANDARD',3,7,1),(2124,22,'G',4,'STANDARD',4,7,1),(2125,22,'G',5,'STANDARD',5,7,1),(2126,22,'G',6,'STANDARD',6,7,1),(2127,22,'G',7,'STANDARD',7,7,1),(2128,22,'G',8,'STANDARD',8,7,1),(2129,22,'G',9,'STANDARD',9,7,1),(2130,22,'G',10,'STANDARD',10,7,1),(2131,22,'H',1,'STANDARD',1,8,1),(2132,22,'H',2,'STANDARD',2,8,1),(2133,22,'H',3,'STANDARD',3,8,1),(2134,22,'H',4,'STANDARD',4,8,1),(2135,22,'H',5,'STANDARD',5,8,1),(2136,22,'H',6,'STANDARD',6,8,1),(2137,22,'H',7,'STANDARD',7,8,1),(2138,22,'H',8,'STANDARD',8,8,1),(2139,22,'H',9,'STANDARD',9,8,1),(2140,22,'H',10,'STANDARD',10,8,1),(2141,22,'I',1,'STANDARD',1,9,1),(2142,22,'I',2,'STANDARD',2,9,1),(2143,22,'I',3,'STANDARD',3,9,1),(2144,22,'I',4,'STANDARD',4,9,1),(2145,22,'I',5,'STANDARD',5,9,1),(2146,22,'I',6,'STANDARD',6,9,1),(2147,22,'I',7,'STANDARD',7,9,1),(2148,22,'I',8,'STANDARD',8,9,1),(2149,22,'I',9,'STANDARD',9,9,1),(2150,22,'I',10,'STANDARD',10,9,1),(2151,22,'J',1,'STANDARD',1,10,1),(2152,22,'J',2,'STANDARD',2,10,1),(2153,22,'J',3,'STANDARD',3,10,1),(2154,22,'J',4,'STANDARD',4,10,1),(2155,22,'J',5,'STANDARD',5,10,1),(2156,22,'J',6,'STANDARD',6,10,1),(2157,22,'J',7,'STANDARD',7,10,1),(2158,22,'J',8,'STANDARD',8,10,1),(2159,22,'J',9,'STANDARD',9,10,1),(2160,22,'J',10,'STANDARD',10,10,1),(2211,23,'A',1,'VIP',1,1,1),(2212,23,'A',2,'VIP',2,1,1),(2213,23,'A',3,'VIP',3,1,1),(2214,23,'A',4,'VIP',4,1,1),(2215,23,'A',5,'VIP',5,1,1),(2216,23,'A',6,'VIP',6,1,1),(2217,23,'A',7,'VIP',7,1,1),(2218,23,'A',8,'VIP',8,1,1),(2219,23,'A',9,'VIP',9,1,1),(2220,23,'A',10,'VIP',10,1,1),(2221,23,'B',1,'VIP',1,2,1),(2222,23,'B',2,'VIP',2,2,1),(2223,23,'B',3,'VIP',3,2,1),(2224,23,'B',4,'VIP',4,2,1),(2225,23,'B',5,'VIP',5,2,1),(2226,23,'B',6,'VIP',6,2,1),(2227,23,'B',7,'VIP',7,2,1),(2228,23,'B',8,'VIP',8,2,1),(2229,23,'B',9,'VIP',9,2,1),(2230,23,'B',10,'VIP',10,2,1),(2231,23,'C',1,'COUPLE',1,3,1),(2232,23,'C',2,'COUPLE',2,3,1),(2233,23,'C',3,'COUPLE',3,3,1),(2234,23,'C',4,'COUPLE',4,3,1),(2235,23,'C',5,'COUPLE',5,3,1),(2236,23,'C',6,'COUPLE',6,3,1),(2237,23,'C',7,'COUPLE',7,3,1),(2238,23,'C',8,'COUPLE',8,3,1),(2239,23,'C',9,'COUPLE',9,3,1),(2240,23,'C',10,'COUPLE',10,3,1),(2241,23,'D',1,'STANDARD',1,4,1),(2242,23,'D',2,'STANDARD',2,4,1),(2243,23,'D',3,'STANDARD',3,4,1),(2244,23,'D',4,'STANDARD',4,4,1),(2245,23,'D',5,'STANDARD',5,4,1),(2246,23,'D',6,'STANDARD',6,4,1),(2247,23,'D',7,'STANDARD',7,4,1),(2248,23,'D',8,'STANDARD',8,4,1),(2249,23,'D',9,'STANDARD',9,4,1),(2250,23,'D',10,'STANDARD',10,4,1),(2251,23,'E',1,'WHEELCHAIR',1,5,1),(2252,23,'E',2,'WHEELCHAIR',2,5,1),(2253,23,'E',3,'WHEELCHAIR',3,5,1),(2254,23,'E',4,'WHEELCHAIR',4,5,1),(2255,23,'E',5,'WHEELCHAIR',5,5,1),(2256,23,'E',6,'WHEELCHAIR',6,5,1),(2257,23,'E',7,'WHEELCHAIR',7,5,1),(2258,23,'E',8,'WHEELCHAIR',8,5,1),(2259,23,'E',9,'WHEELCHAIR',9,5,1),(2260,23,'E',10,'WHEELCHAIR',10,5,1),(2265,21,'A',1,'VIP',1,1,1),(2266,21,'A',2,'VIP',2,1,1),(2267,21,'B',1,'VIP',1,2,1),(2268,21,'B',2,'VIP',2,2,1),(2269,24,'A',1,'VIP',1,1,1),(2270,24,'A',2,'VIP',2,1,1),(2271,24,'A',3,'VIP',3,1,1),(2272,24,'A',4,'VIP',4,1,1),(2273,24,'A',5,'VIP',5,1,1),(2274,24,'A',6,'VIP',6,1,1),(2275,24,'A',7,'VIP',7,1,1),(2276,24,'A',8,'VIP',8,1,1),(2277,24,'A',9,'VIP',9,1,1),(2278,24,'A',10,'VIP',10,1,1),(2279,24,'B',1,'VIP',1,2,1),(2280,24,'B',2,'VIP',2,2,1),(2281,24,'B',3,'VIP',3,2,1),(2282,24,'B',4,'VIP',4,2,1),(2283,24,'B',5,'VIP',5,2,1),(2284,24,'B',6,'VIP',6,2,1),(2285,24,'B',7,'VIP',7,2,1),(2286,24,'B',8,'VIP',8,2,1),(2287,24,'B',9,'VIP',9,2,1),(2288,24,'B',10,'VIP',10,2,1),(2289,24,'C',1,'COUPLE',1,3,1),(2290,24,'C',2,'COUPLE',2,3,1),(2291,24,'C',3,'COUPLE',3,3,1),(2292,24,'C',4,'COUPLE',4,3,1),(2293,24,'C',5,'COUPLE',5,3,1),(2294,24,'C',6,'COUPLE',6,3,1),(2295,24,'C',7,'COUPLE',7,3,1),(2296,24,'C',8,'COUPLE',8,3,1),(2297,24,'C',9,'COUPLE',9,3,1),(2298,24,'C',10,'COUPLE',10,3,1),(2299,24,'D',1,'STANDARD',1,4,1),(2300,24,'D',2,'STANDARD',2,4,1),(2301,24,'D',3,'STANDARD',3,4,1),(2302,24,'D',4,'STANDARD',4,4,1),(2303,24,'D',5,'VIP',5,4,1),(2304,24,'D',6,'VIP',6,4,1),(2305,24,'D',7,'VIP',7,4,1),(2306,24,'D',8,'STANDARD',8,4,1),(2307,24,'D',9,'STANDARD',9,4,1),(2308,24,'D',10,'STANDARD',10,4,1);
/*!40000 ALTER TABLE `seats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `showtimes`
--

DROP TABLE IF EXISTS `showtimes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `showtimes` (
  `showtime_id` int NOT NULL AUTO_INCREMENT,
  `movie_id` int NOT NULL,
  `hall_id` int NOT NULL,
  `show_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `format_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '2D',
  `subtitle_language` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('SCHEDULED','SELLING','SOLD_OUT','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'SCHEDULED',
  `available_seats` int DEFAULT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`showtime_id`),
  KEY `idx_movie_hall_date` (`movie_id`,`hall_id`,`show_date`),
  KEY `idx_show_date` (`show_date`),
  KEY `idx_hall_id` (`hall_id`),
  KEY `idx_showtimes_date_cinema` (`show_date`,`hall_id`),
  CONSTRAINT `showtimes_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`movie_id`),
  CONSTRAINT `showtimes_ibfk_2` FOREIGN KEY (`hall_id`) REFERENCES `cinema_halls` (`hall_id`),
  CONSTRAINT `chk_showtime_valid_time` CHECK ((`start_time` < `end_time`))
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `showtimes`
--

LOCK TABLES `showtimes` WRITE;
/*!40000 ALTER TABLE `showtimes` DISABLE KEYS */;
INSERT INTO `showtimes` VALUES (16,5,14,'2025-12-08','09:30:00','11:00:00','2D','Vietnamese','SELLING',72,45000.00,'2025-12-07 20:49:38','2025-12-07 20:56:46'),(17,15,13,'2025-12-15','11:30:00','13:30:00','2D','Vietnamese','SELLING',50,95000.00,'2025-12-08 02:47:57','2025-12-08 17:14:51'),(18,7,16,'2025-12-08','11:50:00','23:20:00','2D','Vietnamese','SELLING',33,65000.00,'2025-12-08 02:50:28','2025-12-08 02:52:32'),(19,7,16,'2025-12-13','13:30:00','14:30:00','2D','Vietnamese','SELLING',48,50000.00,'2025-12-08 04:59:52','2025-12-08 17:13:27'),(20,15,14,'2025-12-09','05:00:00','07:00:00','2D','Vietnamese','SELLING',78,95000.00,'2025-12-08 16:59:02','2025-12-08 16:59:15'),(21,3,18,'2025-12-08','05:00:00','07:00:00','2D','Vietnamese','SCHEDULED',100,55000.00,'2025-12-08 17:01:51','2025-12-08 17:01:51'),(22,15,18,'2025-12-08','01:00:00','03:00:00','2D','Vietnamese','SCHEDULED',100,85000.00,'2025-12-08 17:02:27','2025-12-08 17:02:27'),(23,14,17,'2025-12-09','00:00:00','02:00:00','2D','Vietnamese','SCHEDULED',100,55000.00,'2025-12-08 17:03:00','2025-12-08 17:14:08'),(25,15,19,'2025-12-17','01:30:00','03:00:00','2D','Vietnamese','SELLING',23,45000.00,'2025-12-08 17:06:12','2025-12-08 17:15:15'),(26,15,20,'2025-12-15','20:00:00','21:30:00','2D','Vietnamese','SELLING',25,45000.00,'2025-12-08 17:07:51','2025-12-08 19:19:39'),(27,7,19,'2025-12-15','21:30:00','23:00:00','2D','Vietnamese','SELLING',25,45000.00,'2025-12-08 17:10:38','2025-12-08 17:14:12'),(28,14,18,'2025-12-17','02:00:00','04:00:00','2D','Vietnamese','SELLING',100,95000.00,'2025-12-08 17:11:43','2025-12-08 20:47:29'),(29,7,20,'2025-12-17','16:30:00','18:00:00','2D','Vietnamese','SELLING',25,45000.00,'2025-12-08 17:12:25','2025-12-08 21:36:18'),(30,15,19,'2025-12-14','19:00:00','21:00:00','2D','Vietnamese','SELLING',25,95000.00,'2025-12-08 17:12:58','2025-12-08 19:26:21'),(31,14,19,'2025-12-09','20:00:00','21:30:00','2D','Vietnamese','SELLING',25,45000.00,'2025-12-08 17:13:31','2025-12-08 17:14:34'),(32,14,20,'2025-12-13','19:00:00','21:00:00','2D','Vietnamese','SELLING',25,45000.00,'2025-12-08 17:15:23','2025-12-08 17:16:05'),(33,5,19,'2025-12-15','22:00:00','23:30:00','2D','Vietnamese','SELLING',25,45000.00,'2025-12-08 17:18:06','2025-12-08 17:21:07'),(34,5,20,'2025-12-16','16:30:00','18:00:00','2D','Vietnamese','SELLING',25,45000.00,'2025-12-08 17:20:45','2025-12-08 17:20:59'),(35,3,18,'2025-12-09','09:25:00','10:30:00','2D','Vietnamese','SELLING',100,125000.00,'2025-12-08 17:58:25','2025-12-08 17:58:25');
/*!40000 ALTER TABLE `showtimes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_configurations`
--

DROP TABLE IF EXISTS `system_configurations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_configurations` (
  `config_id` int NOT NULL AUTO_INCREMENT,
  `config_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `config_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_type` enum('STRING','INTEGER','DECIMAL','BOOLEAN','JSON') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'STRING',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `validation_rules` json DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`config_id`),
  UNIQUE KEY `config_key` (`config_key`),
  KEY `idx_category` (`category`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `system_configurations_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `system_configurations_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_configurations`
--

LOCK TABLES `system_configurations` WRITE;
/*!40000 ALTER TABLE `system_configurations` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_configurations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_logs`
--

DROP TABLE IF EXISTS `system_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_logs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `log_level` enum('DEBUG','INFO','WARNING','ERROR','CRITICAL') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `component` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `session_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `exception_details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `request_data` json DEFAULT NULL,
  `response_data` json DEFAULT NULL,
  `duration_ms` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `idx_log_level` (`log_level`),
  KEY `idx_component` (`component`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `system_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_logs`
--

LOCK TABLES `system_logs` WRITE;
/*!40000 ALTER TABLE `system_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `ticket_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `seat_id` int NOT NULL,
  `ticket_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `surcharge_amount` decimal(10,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `final_price` decimal(10,2) NOT NULL,
  `status` enum('BOOKED','PAID','USED','CANCELLED','REFUNDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'BOOKED',
  `checked_in_at` timestamp NULL DEFAULT NULL,
  `checked_in_by` int DEFAULT NULL,
  `qr_code` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ticket_id`),
  UNIQUE KEY `ticket_code` (`ticket_code`),
  UNIQUE KEY `unique_booking_seat` (`booking_id`,`seat_id`),
  KEY `idx_ticket_code` (`ticket_code`),
  KEY `idx_status` (`status`),
  KEY `seat_id` (`seat_id`),
  KEY `checked_in_by` (`checked_in_by`),
  KEY `idx_tickets_showtime_status` (`booking_id`,`status`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`seat_id`) REFERENCES `seats` (`seat_id`),
  CONSTRAINT `tickets_ibfk_3` FOREIGN KEY (`checked_in_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `chk_ticket_prices` CHECK (((`final_price` >= 0) and (`base_price` >= 0)))
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (1,95,1473,'TK16F60A6C',45000.00,0.00,0.00,54500.00,'USED','2025-12-07 21:00:29',12,NULL,NULL,NULL),(2,95,1472,'TKD816E7CC',45000.00,0.00,0.00,54500.00,'USED','2025-12-07 21:00:29',12,NULL,NULL,NULL),(3,96,1458,'TK03A50E9B',45000.00,0.00,0.00,54500.00,'PAID',NULL,NULL,NULL,NULL,NULL),(4,96,1459,'TKB32F8C69',45000.00,0.00,0.00,54500.00,'PAID',NULL,NULL,NULL,NULL,NULL),(5,97,1475,'TK52032FE4',45000.00,0.00,0.00,54500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(6,97,1474,'TK8B47C7DE',45000.00,0.00,0.00,54500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(7,98,1456,'TKD87A7F54',45000.00,0.00,0.00,54500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(8,98,1457,'TK6EBB1EC9',45000.00,0.00,0.00,54500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(9,99,1466,'TKAFD8C019',45000.00,0.00,0.00,54500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(10,99,1467,'TK559B6378',45000.00,0.00,0.00,54500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(11,100,1455,'TK2A05A019',45000.00,0.00,0.00,54500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(12,101,1463,'TKBA2B7912',45000.00,0.00,0.00,54500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(13,102,1479,'TK38677D8B',45000.00,0.00,0.00,54500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(14,102,1481,'TK566FF2AE',45000.00,0.00,0.00,54500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(15,102,1482,'TK196DA4FD',45000.00,0.00,0.00,54500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(16,102,1483,'TK15AB4A3D',45000.00,0.00,0.00,54500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(17,102,1480,'TK497F9044',45000.00,0.00,0.00,54500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(18,102,1478,'TK0440B323',45000.00,0.00,0.00,54500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(19,103,1462,'TKA531B159',45000.00,0.00,0.00,54500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(20,103,1463,'TK73D54452',45000.00,0.00,0.00,54500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(21,104,1462,'TKC9FC512B',45000.00,0.00,0.00,54500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(22,104,1463,'TK37C56F89',45000.00,0.00,0.00,54500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(23,105,1483,'TKAD337836',45000.00,0.00,0.00,54500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(24,105,1484,'TKB39580D6',45000.00,0.00,0.00,54500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(25,106,1463,'TK5C0540DF',45000.00,0.00,0.00,54500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(26,106,1464,'TK0A5B3799',45000.00,0.00,0.00,54500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(27,107,1437,'TK879EB53D',45000.00,0.00,0.00,54500.00,'USED','2025-12-08 02:36:16',12,NULL,NULL,NULL),(28,107,1444,'TK391716D3',45000.00,0.00,0.00,54500.00,'USED','2025-12-08 02:36:16',12,NULL,NULL,NULL),(29,107,1438,'TK462E868E',45000.00,0.00,0.00,54500.00,'USED','2025-12-08 02:36:16',12,NULL,NULL,NULL),(30,107,1439,'TKF1061066',45000.00,0.00,0.00,54500.00,'USED','2025-12-08 02:36:16',12,NULL,NULL,NULL),(31,108,1768,'TKC493EA80',65000.00,0.00,0.00,76500.00,'USED','2025-12-08 02:57:26',14,NULL,NULL,NULL),(32,108,1770,'TK58805D31',65000.00,0.00,0.00,76500.00,'USED','2025-12-08 02:57:26',14,NULL,NULL,NULL),(33,108,1769,'TKE360F081',65000.00,0.00,0.00,76500.00,'USED','2025-12-08 02:57:26',14,NULL,NULL,NULL),(34,109,1763,'TKC3011742',65000.00,0.00,0.00,76500.00,'USED','2025-12-08 03:02:10',12,NULL,NULL,NULL),(35,110,1772,'TKD1662F52',65000.00,0.00,0.00,76500.00,'PAID',NULL,NULL,NULL,NULL,NULL),(36,110,1771,'TK962D8123',65000.00,0.00,0.00,76500.00,'PAID',NULL,NULL,NULL,NULL,NULL),(37,111,1784,'TK3F4B1B68',65000.00,0.00,0.00,76500.00,'PAID',NULL,NULL,NULL,NULL,NULL),(38,111,1783,'TK466AF539',65000.00,0.00,0.00,76500.00,'PAID',NULL,NULL,NULL,NULL,NULL),(39,112,1791,'TK8C81BD3C',65000.00,0.00,0.00,76500.00,'PAID',NULL,NULL,NULL,NULL,NULL),(40,112,1792,'TKCC529865',65000.00,0.00,0.00,76500.00,'PAID',NULL,NULL,NULL,NULL,NULL),(41,113,1781,'TK01F0190F',65000.00,0.00,0.00,76500.00,'PAID',NULL,NULL,NULL,NULL,NULL),(42,114,1800,'TKA9B5150B',65000.00,0.00,0.00,76500.00,'PAID',NULL,NULL,NULL,NULL,NULL),(43,114,1799,'TKB75D5ACE',65000.00,0.00,0.00,76500.00,'PAID',NULL,NULL,NULL,NULL,NULL),(44,115,1775,'TK29CA66B1',65000.00,0.00,0.00,76500.00,'PAID',NULL,NULL,NULL,NULL,NULL),(45,115,1774,'TK29FA7B11',65000.00,0.00,0.00,76500.00,'PAID',NULL,NULL,NULL,NULL,NULL),(46,116,1779,'TK51E56389',65000.00,0.00,0.00,76500.00,'PAID',NULL,NULL,NULL,NULL,NULL),(47,116,1780,'TK307393BA',65000.00,0.00,0.00,76500.00,'PAID',NULL,NULL,NULL,NULL,NULL),(48,117,1762,'TK5D30F18F',50000.00,0.00,0.00,60000.00,'USED','2025-12-08 05:40:41',12,NULL,NULL,NULL),(49,117,1761,'TK9F08B129',50000.00,0.00,0.00,60000.00,'USED','2025-12-08 05:40:41',12,NULL,NULL,NULL),(50,118,1775,'TKACC0B505',50000.00,0.00,0.00,60000.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(51,118,1776,'TK605E0B22',50000.00,0.00,0.00,60000.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(52,119,1760,'TK5211805C',65000.00,0.00,0.00,76500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(53,120,1771,'TK84DEA667',50000.00,0.00,0.00,60000.00,'USED','2025-12-08 12:20:49',12,NULL,NULL,NULL),(54,120,1772,'TKB12346AB',50000.00,0.00,0.00,60000.00,'USED','2025-12-08 12:20:49',12,NULL,NULL,NULL),(55,121,1792,'TK6CD68950',50000.00,0.00,0.00,60000.00,'USED','2025-12-08 13:57:20',12,NULL,NULL,NULL),(56,121,1791,'TK4E857FA7',50000.00,0.00,0.00,60000.00,'USED','2025-12-08 13:57:20',12,NULL,NULL,NULL),(57,122,1781,'TK4A4C25CD',50000.00,0.00,0.00,60000.00,'USED','2025-12-08 13:57:08',12,NULL,NULL,NULL),(58,122,1782,'TK5A7460C1',50000.00,0.00,0.00,60000.00,'USED','2025-12-08 13:57:08',12,NULL,NULL,NULL),(59,123,1773,'TK7D212A06',50000.00,0.00,0.00,60000.00,'PAID',NULL,NULL,NULL,NULL,NULL),(60,123,1774,'TK709B3269',50000.00,0.00,0.00,60000.00,'PAID',NULL,NULL,NULL,NULL,NULL),(61,123,1775,'TK8491BA55',50000.00,0.00,0.00,60000.00,'PAID',NULL,NULL,NULL,NULL,NULL),(62,123,1776,'TKC23F5BDC',50000.00,0.00,0.00,60000.00,'PAID',NULL,NULL,NULL,NULL,NULL),(63,123,1768,'TKE6706263',50000.00,0.00,0.00,60000.00,'PAID',NULL,NULL,NULL,NULL,NULL),(64,123,1770,'TK94B4F7AE',50000.00,0.00,0.00,60000.00,'PAID',NULL,NULL,NULL,NULL,NULL),(65,123,1769,'TK1011CE2B',50000.00,0.00,0.00,60000.00,'PAID',NULL,NULL,NULL,NULL,NULL),(66,123,1767,'TK7282B039',50000.00,0.00,0.00,60000.00,'PAID',NULL,NULL,NULL,NULL,NULL),(67,123,1777,'TK36CB8213',50000.00,0.00,0.00,60000.00,'PAID',NULL,NULL,NULL,NULL,NULL),(68,123,1778,'TK9632BB94',50000.00,0.00,0.00,60000.00,'PAID',NULL,NULL,NULL,NULL,NULL),(69,124,1804,'TK8C922FD3',50000.00,0.00,0.00,60000.00,'USED','2025-12-08 16:43:57',12,NULL,NULL,NULL),(70,124,1806,'TK3595B78D',50000.00,0.00,0.00,60000.00,'USED','2025-12-08 16:43:57',12,NULL,NULL,NULL),(71,124,1805,'TK764F2E70',50000.00,0.00,0.00,60000.00,'USED','2025-12-08 16:43:57',12,NULL,NULL,NULL),(72,125,1802,'TK11446C11',50000.00,0.00,0.00,60000.00,'PAID',NULL,NULL,NULL,NULL,NULL),(73,126,1464,'TK5CA4F4DF',95000.00,0.00,0.00,109500.00,'PAID',NULL,NULL,NULL,NULL,NULL),(74,126,1465,'TK987DB60A',95000.00,0.00,0.00,109500.00,'PAID',NULL,NULL,NULL,NULL,NULL),(75,127,2039,'TKF19361BC',45000.00,0.00,0.00,54500.00,'PAID',NULL,NULL,NULL,NULL,NULL),(76,127,2040,'TKF043EAFA',45000.00,0.00,0.00,54500.00,'PAID',NULL,NULL,NULL,NULL,NULL),(77,128,2009,'TKFF24FD03',45000.00,0.00,0.00,54500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(78,128,2010,'TK71D37E0C',45000.00,0.00,0.00,54500.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(79,129,1763,'TKE18354DE',50000.00,0.00,0.00,60000.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(80,129,1764,'TKDEB80FAC',50000.00,0.00,0.00,60000.00,'CANCELLED',NULL,NULL,NULL,NULL,NULL),(81,130,1763,'TK5E854888',50000.00,0.00,0.00,60000.00,'USED','2025-12-08 21:31:18',12,NULL,NULL,NULL),(82,130,1764,'TKB6980055',50000.00,0.00,0.00,60000.00,'USED','2025-12-08 21:31:18',12,NULL,NULL,NULL),(83,131,2008,'TK78C66FC6',45000.00,0.00,0.00,54500.00,'USED','2025-12-08 21:44:04',21,NULL,NULL,NULL),(84,131,2009,'TKD36041B9',45000.00,0.00,0.00,54500.00,'USED','2025-12-08 21:44:04',21,NULL,NULL,NULL);
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_role_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `assigned_by` int DEFAULT NULL,
  PRIMARY KEY (`user_role_id`),
  UNIQUE KEY `unique_user_role` (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  KEY `assigned_by` (`assigned_by`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`),
  CONSTRAINT `user_roles_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (25,10,4,'2025-12-07 20:26:18',NULL),(27,11,4,'2025-12-07 20:34:42',10),(31,13,3,'2025-12-07 20:39:36',10),(32,12,2,'2025-12-07 20:59:12',10),(36,14,3,'2025-12-08 02:13:06',11),(38,15,2,'2025-12-08 04:19:27',10),(45,16,2,'2025-12-08 15:20:12',11),(46,17,2,'2025-12-08 15:20:28',11),(48,18,2,'2025-12-08 15:20:45',11),(49,19,2,'2025-12-08 15:20:53',11),(50,20,2,'2025-12-08 15:21:01',11),(52,21,2,'2025-12-08 15:24:49',11);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `session_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_sessions`
--

LOCK TABLES `user_sessions` WRITE;
/*!40000 ALTER TABLE `user_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_vouchers`
--

DROP TABLE IF EXISTS `user_vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_vouchers` (
  `voucher_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `promotion_id` int NOT NULL,
  `voucher_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('AVAILABLE','USED','EXPIRED','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'AVAILABLE',
  `issued_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NOT NULL,
  `booking_id` int DEFAULT NULL,
  PRIMARY KEY (`voucher_id`),
  UNIQUE KEY `voucher_code` (`voucher_code`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_voucher_code` (`voucher_code`),
  KEY `idx_status` (`status`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `promotion_id` (`promotion_id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `user_vouchers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_vouchers_ibfk_2` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`promotion_id`),
  CONSTRAINT `user_vouchers_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_vouchers`
--

LOCK TABLES `user_vouchers` WRITE;
/*!40000 ALTER TABLE `user_vouchers` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_vouchers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('MALE','FEMALE','OTHER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_email_verified` tinyint(1) DEFAULT '0',
  `is_phone_verified` tinyint(1) DEFAULT '0',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `phone_verified_at` timestamp NULL DEFAULT NULL,
  `privacy_policy_accepted` tinyint(1) DEFAULT '0',
  `privacy_policy_version` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `privacy_policy_accepted_at` timestamp NULL DEFAULT NULL,
  `terms_of_service_accepted` tinyint(1) DEFAULT '0',
  `terms_of_service_version` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `terms_of_service_accepted_at` timestamp NULL DEFAULT NULL,
  `marketing_email_consent` tinyint(1) DEFAULT '0',
  `marketing_sms_consent` tinyint(1) DEFAULT '0',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `failed_login_attempts` int DEFAULT '0',
  `locked_until` timestamp NULL DEFAULT NULL,
  `password_reset_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_expires` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone_number` (`phone_number`),
  KEY `idx_email` (`email`),
  KEY `idx_phone` (`phone_number`),
  KEY `idx_created_at` (`created_at`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (10,'khanhkhoi08@gmail.com','0915232119','$2a$10$Bevzmpf6LOkVp2GHjtoo3eLF4cRJbBDz9KuksQLEhPg/6XaTIMbF2','Nguyễn Đoàn Duy Khánh','2004-11-17','MALE',NULL,1,0,NULL,NULL,NULL,1,'1.0','2025-12-07 20:26:17',1,'1.0','2025-12-07 20:26:17',NULL,NULL,'2025-12-08 18:46:03',0,NULL,NULL,NULL,'2025-12-07 20:26:17','2025-12-08 11:39:48',NULL,NULL),(11,'nguyenvanquoc11112004@gmail.com','0337048570','$2a$10$JaE1QTROtzHBIMNEcXlLG.5DTAbRlMb56svl72OyXOeNrJVL2A87e','Quốc Bry','2004-11-11','MALE',NULL,1,0,NULL,NULL,NULL,1,'1.0','2025-12-07 20:34:23',1,'1.0','2025-12-07 20:34:23',NULL,NULL,'2025-12-08 21:12:54',0,NULL,NULL,NULL,'2025-12-07 20:34:23','2025-12-08 11:36:00',NULL,NULL),(12,'nguyenvanwuoc11112004@gmail.com','0877999484','$2a$10$oBdoBLQGqn5REEzR9q0h5edsXzwYWhEng5VdBHHtMpE3RTe3XDbGm','Nguyễn Quốc','2004-11-11','MALE',NULL,1,0,NULL,NULL,NULL,1,'1.0','2025-12-07 20:39:07',1,'1.0','2025-12-07 20:39:07',NULL,NULL,'2025-12-08 21:31:09',0,NULL,NULL,NULL,'2025-12-07 20:39:07','2025-12-07 20:39:07',NULL,NULL),(13,'quynhgiang2007@gmail.com','0915232112','$2a$10$4w9hkNzY2AdvV8IZNME8cOFZ/ryVMALKuuX/1BkQwZ17IH3xFSkkW','Trịnh Thị Hồng Giang','2007-07-06','FEMALE',NULL,1,0,NULL,NULL,NULL,1,'1.0','2025-12-07 20:39:09',1,'1.0','2025-12-07 20:39:09',NULL,NULL,'2025-12-08 02:09:15',0,NULL,NULL,NULL,'2025-12-07 20:39:09','2025-12-07 20:39:09',NULL,NULL),(14,'khanh115432@gmail.com','0836237476','$2a$10$jxCl2qhSiI.pjZlPTanfDepA9FjuDMaGEoF7v7RpTR3eMGK59ORoO','Nguyễn Hồ Duy Khánh','2005-01-12','MALE',NULL,1,0,NULL,NULL,NULL,1,'1.0','2025-12-07 22:25:32',1,'1.0','2025-12-07 22:25:32',NULL,NULL,'2025-12-08 19:12:38',0,NULL,NULL,NULL,'2025-12-07 22:25:32','2025-12-08 16:41:19',NULL,NULL),(15,'kimkhoi08@gmail.com','0916271841','$2a$10$SQTmLZBqgZidR51uLQYkF.ZcpJCI9F4aM.UniBk1VLYAZ1nk9RtJ2','Nguyễn Đoàn Kim Khôi','2008-10-20','MALE',NULL,1,0,NULL,NULL,NULL,1,'1.0','2025-12-08 04:18:56',1,'1.0','2025-12-08 04:18:56',NULL,NULL,'2025-12-08 05:16:19',0,NULL,NULL,NULL,'2025-12-08 04:18:56','2025-12-08 04:18:56',NULL,NULL),(16,'a@gmail.com','0123455555','$2a$10$nclaGAhoKs9ldBGwur/pieLjvZ/kG07eBYLmkfz./DAfGyd3BIfVC','Nhân Viên A','2004-01-11','FEMALE',NULL,1,0,NULL,NULL,NULL,1,'1.0','2025-12-08 15:17:38',1,'1.0','2025-12-08 15:17:38',NULL,NULL,'2025-12-08 19:09:34',0,NULL,NULL,NULL,'2025-12-08 15:17:38','2025-12-08 15:17:38',NULL,NULL),(17,'b@gmail.com','0123456666','$2a$10$6d63J0dWy2hV5MiA/8LRquDDaCH6iGEe05rGAuRvEGv4Uekbcjp5O','Nhân Viên B','2004-02-11','FEMALE',NULL,1,0,NULL,NULL,NULL,1,'1.0','2025-12-08 15:18:18',1,'1.0','2025-12-08 15:18:18',NULL,NULL,'2025-12-08 21:39:37',0,NULL,NULL,NULL,'2025-12-08 15:18:18','2025-12-08 15:18:18',NULL,NULL),(18,'c@gmail.com','0123456777','$2a$10$SmB9dqOuBKiALF4yhZwyOuHTLpkuoHQWfSYoSmQ/R1dOYu/1dJi2S','Nhân Viên C','2004-03-11','FEMALE',NULL,1,0,NULL,NULL,NULL,1,'1.0','2025-12-08 15:18:49',1,'1.0','2025-12-08 15:18:49',NULL,NULL,'2025-12-08 21:40:09',0,NULL,NULL,NULL,'2025-12-08 15:18:49','2025-12-08 15:18:49',NULL,NULL),(19,'d@gmail.com','0123456788','$2a$10$QwiphATQj21TKzIBp073Aux66el3r4HoppttILdcIFXyHqbryoZuW','Nhân Viên D','2004-04-11','FEMALE',NULL,1,0,NULL,NULL,NULL,1,'1.0','2025-12-08 15:19:17',1,'1.0','2025-12-08 15:19:17',NULL,NULL,'2025-12-08 21:40:28',0,NULL,NULL,NULL,'2025-12-08 15:19:17','2025-12-08 15:19:17',NULL,NULL),(20,'e@gmail.com','0123456789','$2a$10$7i93XP5tLJouCDNstn4qxOdk7zUBpHw.OK4B.mhhrLCufR4Mkg6fO','Nhân Viên E','2004-05-11','FEMALE',NULL,1,0,NULL,NULL,NULL,1,'1.0','2025-12-08 15:19:46',1,'1.0','2025-12-08 15:19:46',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-12-08 15:19:46','2025-12-08 15:19:46',NULL,NULL),(21,'f@gmail.com','0123456700','$2a$10$cXs.D6jEPOyCRaUm7/HUseS3WF1SaggoHD2YIrGxLoX5DRDS63w.K','Nhân Viên F','2004-06-11','FEMALE',NULL,1,0,NULL,NULL,NULL,1,'1.0','2025-12-08 15:24:34',1,'1.0','2025-12-08 15:24:34',NULL,NULL,'2025-12-08 21:42:12',0,NULL,NULL,NULL,'2025-12-08 15:24:34','2025-12-08 15:24:34',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `v_booking_details`
--

DROP TABLE IF EXISTS `v_booking_details`;
/*!50001 DROP VIEW IF EXISTS `v_booking_details`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_booking_details` AS SELECT 
 1 AS `booking_id`,
 1 AS `booking_code`,
 1 AS `user_id`,
 1 AS `customer_name`,
 1 AS `customer_email`,
 1 AS `movie_title`,
 1 AS `age_rating`,
 1 AS `cinema_name`,
 1 AS `hall_name`,
 1 AS `show_date`,
 1 AS `start_time`,
 1 AS `format_type`,
 1 AS `total_seats`,
 1 AS `total_amount`,
 1 AS `booking_status`,
 1 AS `payment_status`,
 1 AS `booking_date`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_cinema_concession_prices`
--

DROP TABLE IF EXISTS `v_cinema_concession_prices`;
/*!50001 DROP VIEW IF EXISTS `v_cinema_concession_prices`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_cinema_concession_prices` AS SELECT 
 1 AS `cinema_item_id`,
 1 AS `cinema_id`,
 1 AS `cinema_name`,
 1 AS `city`,
 1 AS `item_id`,
 1 AS `item_name`,
 1 AS `category_name`,
 1 AS `default_price`,
 1 AS `cinema_price`,
 1 AS `effective_price`,
 1 AS `stock_quantity`,
 1 AS `available_at_cinema`,
 1 AS `item_active`,
 1 AS `display_order`,
 1 AS `image_url`,
 1 AS `description`,
 1 AS `size`,
 1 AS `notes`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_daily_revenue`
--

DROP TABLE IF EXISTS `v_daily_revenue`;
/*!50001 DROP VIEW IF EXISTS `v_daily_revenue`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_daily_revenue` AS SELECT 
 1 AS `revenue_date`,
 1 AS `cinema_id`,
 1 AS `cinema_name`,
 1 AS `total_bookings`,
 1 AS `total_tickets`,
 1 AS `total_revenue`,
 1 AS `avg_booking_value`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_movie_performance`
--

DROP TABLE IF EXISTS `v_movie_performance`;
/*!50001 DROP VIEW IF EXISTS `v_movie_performance`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_movie_performance` AS SELECT 
 1 AS `movie_id`,
 1 AS `title`,
 1 AS `age_rating`,
 1 AS `movie_status`,
 1 AS `total_showtimes`,
 1 AS `total_bookings`,
 1 AS `total_tickets_sold`,
 1 AS `total_revenue`,
 1 AS `avg_occupancy_rate`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `v_booking_details`
--

/*!50001 DROP VIEW IF EXISTS `v_booking_details`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_booking_details` AS select `b`.`booking_id` AS `booking_id`,`b`.`booking_code` AS `booking_code`,`b`.`user_id` AS `user_id`,`u`.`full_name` AS `customer_name`,`u`.`email` AS `customer_email`,`m`.`title` AS `movie_title`,`m`.`age_rating` AS `age_rating`,`c`.`cinema_name` AS `cinema_name`,`ch`.`hall_name` AS `hall_name`,`s`.`show_date` AS `show_date`,`s`.`start_time` AS `start_time`,`s`.`format_type` AS `format_type`,`b`.`total_seats` AS `total_seats`,`b`.`total_amount` AS `total_amount`,`b`.`status` AS `booking_status`,`b`.`payment_status` AS `payment_status`,`b`.`created_at` AS `booking_date` from (((((`bookings` `b` left join `users` `u` on((`b`.`user_id` = `u`.`user_id`))) join `showtimes` `s` on((`b`.`showtime_id` = `s`.`showtime_id`))) join `movies` `m` on((`s`.`movie_id` = `m`.`movie_id`))) join `cinema_halls` `ch` on((`s`.`hall_id` = `ch`.`hall_id`))) join `cinemas` `c` on((`ch`.`cinema_id` = `c`.`cinema_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_cinema_concession_prices`
--

/*!50001 DROP VIEW IF EXISTS `v_cinema_concession_prices`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_cinema_concession_prices` AS select `cci`.`cinema_item_id` AS `cinema_item_id`,`c`.`cinema_id` AS `cinema_id`,`c`.`cinema_name` AS `cinema_name`,`c`.`city` AS `city`,`ci`.`item_id` AS `item_id`,`ci`.`item_name` AS `item_name`,`cat`.`category_name` AS `category_name`,`ci`.`price` AS `default_price`,`cci`.`cinema_price` AS `cinema_price`,coalesce(`cci`.`cinema_price`,`ci`.`price`) AS `effective_price`,`cci`.`stock_quantity` AS `stock_quantity`,`cci`.`is_available` AS `available_at_cinema`,`ci`.`is_available` AS `item_active`,`cci`.`display_order` AS `display_order`,`ci`.`image_url` AS `image_url`,`ci`.`description` AS `description`,`ci`.`size` AS `size`,`cci`.`notes` AS `notes` from (((`cinema_concession_items` `cci` join `cinemas` `c` on((`cci`.`cinema_id` = `c`.`cinema_id`))) join `concession_items` `ci` on((`cci`.`item_id` = `ci`.`item_id`))) join `concession_categories` `cat` on((`ci`.`category_id` = `cat`.`category_id`))) where ((`cci`.`is_available` = 1) and (`ci`.`is_available` = 1)) order by `c`.`cinema_name`,`cat`.`display_order`,`cci`.`display_order`,`ci`.`item_name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_daily_revenue`
--

/*!50001 DROP VIEW IF EXISTS `v_daily_revenue`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_daily_revenue` AS select cast(`b`.`booking_date` as date) AS `revenue_date`,`c`.`cinema_id` AS `cinema_id`,`c`.`cinema_name` AS `cinema_name`,count(distinct `b`.`booking_id`) AS `total_bookings`,sum(`b`.`total_seats`) AS `total_tickets`,sum((case when (`b`.`status` = 'PAID') then `b`.`total_amount` else 0 end)) AS `total_revenue`,avg((case when (`b`.`status` = 'PAID') then `b`.`total_amount` else NULL end)) AS `avg_booking_value` from (((`bookings` `b` join `showtimes` `s` on((`b`.`showtime_id` = `s`.`showtime_id`))) join `cinema_halls` `ch` on((`s`.`hall_id` = `ch`.`hall_id`))) join `cinemas` `c` on((`ch`.`cinema_id` = `c`.`cinema_id`))) where (`b`.`created_at` >= (curdate() - interval 30 day)) group by cast(`b`.`booking_date` as date),`c`.`cinema_id`,`c`.`cinema_name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_movie_performance`
--

/*!50001 DROP VIEW IF EXISTS `v_movie_performance`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_movie_performance` AS select `m`.`movie_id` AS `movie_id`,`m`.`title` AS `title`,`m`.`age_rating` AS `age_rating`,`m`.`status` AS `movie_status`,count(distinct `s`.`showtime_id`) AS `total_showtimes`,count(distinct `b`.`booking_id`) AS `total_bookings`,sum((case when (`b`.`status` = 'PAID') then `b`.`total_seats` else 0 end)) AS `total_tickets_sold`,sum((case when (`b`.`status` = 'PAID') then `b`.`total_amount` else 0 end)) AS `total_revenue`,avg(`s`.`available_seats`) AS `avg_occupancy_rate` from ((`movies` `m` left join `showtimes` `s` on((`m`.`movie_id` = `s`.`movie_id`))) left join `bookings` `b` on((`s`.`showtime_id` = `b`.`showtime_id`))) where (`s`.`show_date` >= (curdate() - interval 30 day)) group by `m`.`movie_id`,`m`.`title`,`m`.`age_rating`,`m`.`status` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-09  5:45:19
