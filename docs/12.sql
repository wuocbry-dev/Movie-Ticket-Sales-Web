-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: movie_ticket_sales
-- ------------------------------------------------------
-- Server version	8.0.42

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
  `booking_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int DEFAULT NULL,
  `showtime_id` int NOT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `booking_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `total_seats` int NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `service_fee` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('PENDING','CONFIRMED','PAID','CANCELLED','REFUNDED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_status` enum('PENDING','PROCESSING','COMPLETED','FAILED','REFUNDED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `payment_reference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `hold_expires_at` timestamp NULL DEFAULT NULL,
  `qr_code` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invoice_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invoice_issued_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`booking_id`),
  UNIQUE KEY `booking_code` (`booking_code`),
  KEY `idx_booking_code` (`booking_code`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_showtime_id` (`showtime_id`),
  KEY `idx_status` (`status`),
  KEY `idx_booking_date` (`booking_date`),
  KEY `idx_bookings_date_status` (`booking_date`,`status`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`showtime_id`) REFERENCES `showtimes` (`showtime_id`),
  CONSTRAINT `chk_booking_amounts` CHECK (((`total_amount` >= 0) and (`subtotal` >= 0)))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,'BK20251018001',4,1,NULL,NULL,NULL,'2025-10-18 04:00:55',2,180000.00,0.00,0.00,0.00,180000.00,'PAID',NULL,'COMPLETED',NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-18 04:00:55','2025-10-18 04:00:55'),(2,'BK20251018002',5,4,NULL,NULL,NULL,'2025-10-18 04:00:55',3,270000.00,0.00,0.00,0.00,270000.00,'PAID',NULL,'COMPLETED',NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-18 04:00:55','2025-10-18 04:00:55'),(3,'BK20251018003',6,6,NULL,NULL,NULL,'2025-10-18 04:00:55',4,300000.00,0.00,0.00,0.00,300000.00,'PENDING',NULL,'PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-18 04:00:55','2025-10-18 04:00:55');
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
  `chain_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` tinytext COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`chain_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cinema_chains`
--

LOCK TABLES `cinema_chains` WRITE;
/*!40000 ALTER TABLE `cinema_chains` DISABLE KEYS */;
INSERT INTO `cinema_chains` VALUES (1,'CGV Cinemas',NULL,NULL,'Chuỗi rạp chiếu phim CGV',1,'2025-10-13 14:36:02','2025-10-13 14:36:02'),(2,'Galaxy Cinema',NULL,NULL,'Chuỗi rạp chiếu phim Galaxy',1,'2025-10-13 14:36:02','2025-10-13 14:36:02'),(3,'Lotte Cinema',NULL,NULL,'Chuỗi rạp chiếu phim Lotte',1,'2025-10-13 14:36:02','2025-10-13 14:36:02'),(4,'BHD Star Cineplex',NULL,NULL,'Chuỗi rạp chiếu phim BHD Star',1,'2025-10-13 14:36:02','2025-10-13 14:36:02');
/*!40000 ALTER TABLE `cinema_chains` ENABLE KEYS */;
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
  `hall_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hall_type` enum('2D','3D','IMAX','4DX','SCREENX') COLLATE utf8mb4_unicode_ci DEFAULT '2D',
  `total_seats` int NOT NULL,
  `rows_count` int NOT NULL,
  `seats_per_row` int NOT NULL,
  `seat_layout` json DEFAULT NULL,
  `screen_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sound_system` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`hall_id`),
  KEY `idx_cinema_id` (`cinema_id`),
  CONSTRAINT `cinema_halls_ibfk_1` FOREIGN KEY (`cinema_id`) REFERENCES `cinemas` (`cinema_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cinema_halls`
--

LOCK TABLES `cinema_halls` WRITE;
/*!40000 ALTER TABLE `cinema_halls` DISABLE KEYS */;
INSERT INTO `cinema_halls` VALUES (1,1,'Cinema 1','2D',120,10,12,NULL,NULL,NULL,1,'2025-10-18 03:59:29','2025-10-18 03:59:29'),(2,1,'Cinema 2','3D',100,10,10,NULL,NULL,NULL,1,'2025-10-18 03:59:29','2025-10-18 03:59:29'),(3,1,'IMAX','IMAX',160,10,16,NULL,NULL,NULL,1,'2025-10-18 03:59:29','2025-10-18 03:59:29'),(4,2,'Cinema 1','2D',100,10,10,NULL,NULL,NULL,1,'2025-10-18 03:59:29','2025-10-18 03:59:29'),(5,2,'Cinema 2','3D',100,10,10,NULL,NULL,NULL,1,'2025-10-18 03:59:29','2025-10-18 03:59:29'),(6,3,'Cinema 1','2D',120,10,12,NULL,NULL,NULL,1,'2025-10-18 03:59:29','2025-10-18 03:59:29'),(7,4,'Cinema 1','2D',100,10,10,NULL,NULL,NULL,1,'2025-10-18 03:59:29','2025-10-18 03:59:29'),(8,5,'Cinema 1','2D',120,10,12,NULL,NULL,NULL,1,'2025-10-18 03:59:29','2025-10-18 03:59:29');
/*!40000 ALTER TABLE `cinema_halls` ENABLE KEYS */;
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
  `cinema_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` tinytext COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `legal_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `opening_hours` json DEFAULT NULL,
  `facilities` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cinema_id`),
  KEY `idx_city` (`city`),
  KEY `idx_chain_id` (`chain_id`),
  CONSTRAINT `cinemas_ibfk_1` FOREIGN KEY (`chain_id`) REFERENCES `cinema_chains` (`chain_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cinemas`
--

LOCK TABLES `cinemas` WRITE;
/*!40000 ALTER TABLE `cinemas` DISABLE KEYS */;
INSERT INTO `cinemas` VALUES (1,1,'CGV Vincom Center','72 Lê Thánh Tôn, Bến Nghé','Hồ Chí Minh','Quận 1','02838277747','cgv.vincom@cgv.vn','0123456789',NULL,NULL,NULL,NULL,NULL,1,'2025-10-18 03:59:21','2025-10-18 03:59:21'),(2,1,'CGV Aeon Mall','30 Bờ Bao Tân Thắng, Sơn Kỳ','Hồ Chí Minh','Tân Phú','02838477748','cgv.aeonmall@cgv.vn','0123456790',NULL,NULL,NULL,NULL,NULL,1,'2025-10-18 03:59:21','2025-10-18 03:59:21'),(3,2,'Galaxy MIPEC Tower','229 Tây Sơn','Hà Nội','Đống Đa','02432222333','galaxy.mipec@galaxy.vn','0123456791',NULL,NULL,NULL,NULL,NULL,1,'2025-10-18 03:59:21','2025-10-18 03:59:21'),(4,3,'Lotte Cinema Landmark','5B Tôn Đức Thắng, Bến Nghé','Hồ Chí Minh','Quận 1','02838222333','lotte.landmark@lotte.vn','0123456792',NULL,NULL,NULL,NULL,NULL,1,'2025-10-18 03:59:21','2025-10-18 03:59:21'),(5,4,'BHD Star Phạm Hùng','Tầng 4, TTTM The Garden','Hà Nội','Nam Từ Liêm','02437878999','bhd.phamhung@bhd.vn','0123456793',NULL,NULL,NULL,NULL,NULL,1,'2025-10-18 03:59:21','2025-10-18 03:59:21');
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
  `category_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` tinytext COLLATE utf8mb4_unicode_ci,
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `concession_categories`
--

LOCK TABLES `concession_categories` WRITE;
/*!40000 ALTER TABLE `concession_categories` DISABLE KEYS */;
INSERT INTO `concession_categories` VALUES (1,'Combo Bắp Nước','Các combo bắp rang bơ và nước uống',1,1,'2025-10-13 14:36:02','2025-10-13 14:36:02'),(2,'Đồ uống','Nước ngọt, nước ép, trà sữa',2,1,'2025-10-13 14:36:02','2025-10-13 14:36:02'),(3,'Snacks','Kẹo, bánh kẹo các loại',3,1,'2025-10-13 14:36:02','2025-10-13 14:36:02'),(4,'Thức ăn nhanh','Hotdog, bánh mì, nachos',4,1,'2025-10-13 14:36:02','2025-10-13 14:36:02');
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
  `item_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` tinytext COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `size` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `calories` int DEFAULT NULL,
  `ingredients` tinytext COLLATE utf8mb4_unicode_ci,
  `stock_quantity` int DEFAULT '0',
  `low_stock_threshold` int DEFAULT '5',
  `is_combo` tinyint(1) DEFAULT '0',
  `combo_items` json DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  `available_cinemas` json DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`item_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_is_available` (`is_available`),
  CONSTRAINT `concession_items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `concession_categories` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `concession_items`
--

LOCK TABLES `concession_items` WRITE;
/*!40000 ALTER TABLE `concession_items` DISABLE KEYS */;
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
  `customization_notes` tinytext COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_item_id`),
  KEY `idx_concession_order_id` (`concession_order_id`),
  KEY `idx_item_id` (`item_id`),
  CONSTRAINT `concession_order_items_ibfk_1` FOREIGN KEY (`concession_order_id`) REFERENCES `concession_orders` (`concession_order_id`) ON DELETE CASCADE,
  CONSTRAINT `concession_order_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `concession_items` (`item_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `concession_order_items`
--

LOCK TABLES `concession_order_items` WRITE;
/*!40000 ALTER TABLE `concession_order_items` DISABLE KEYS */;
INSERT INTO `concession_order_items` VALUES (1,1,1,1,79000.00,79000.00,NULL,'2025-10-18 04:01:11'),(2,2,3,1,159000.00,159000.00,NULL,'2025-10-18 04:01:11');
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
  `order_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cinema_id` int NOT NULL,
  `pickup_time` timestamp NULL DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('PENDING','CONFIRMED','PREPARING','READY','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `payment_status` enum('PENDING','PAID','REFUNDED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `notes` tinytext COLLATE utf8mb4_unicode_ci,
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `concession_orders`
--

LOCK TABLES `concession_orders` WRITE;
/*!40000 ALTER TABLE `concession_orders` DISABLE KEYS */;
INSERT INTO `concession_orders` VALUES (1,1,4,'CO20251018001',1,NULL,79000.00,0.00,0.00,79000.00,'COMPLETED','PAID',NULL,'2025-10-18 04:01:08','2025-10-18 04:01:08'),(2,2,5,'CO20251018002',2,NULL,159000.00,0.00,0.00,159000.00,'COMPLETED','PAID',NULL,'2025-10-18 04:01:08','2025-10-18 04:01:08');
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
  `tier_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tier_name_display` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_annual_spending` decimal(12,2) DEFAULT '0.00',
  `min_visits_per_year` int DEFAULT '0',
  `points_earn_rate` decimal(5,2) DEFAULT '1.00',
  `birthday_gift_description` tinytext COLLATE utf8mb4_unicode_ci,
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `membership_tiers`
--

LOCK TABLES `membership_tiers` WRITE;
/*!40000 ALTER TABLE `membership_tiers` DISABLE KEYS */;
INSERT INTO `membership_tiers` VALUES (1,'BRONZE','Thành viên Đồng',0.00,0,1.00,'Combo bắp nước sinh nhật',0.00,0,0,0,1,1,'2025-10-13 14:36:02','2025-10-13 14:36:02'),(2,'SILVER','Thành viên Bạc',2000000.00,0,1.20,'Combo bắp nước + 1 vé 2D',0.00,1,0,0,2,1,'2025-10-13 14:36:02','2025-10-13 14:36:02'),(3,'GOLD','Thành viên Vàng',5000000.00,0,1.50,'Combo bắp nước + 2 vé 2D/3D',0.00,2,0,0,3,1,'2025-10-13 14:36:02','2025-10-13 14:36:02'),(4,'PLATINUM','Thành viên Bạch Kim',10000000.00,0,2.00,'Combo bắp nước + 3 vé mọi định dạng',0.00,4,0,0,4,1,'2025-10-13 14:36:02','2025-10-13 14:36:02'),(5,'DIAMOND','Thành viên Kim Cương',20000000.00,0,2.50,'Combo bắp nước + 5 vé mọi định dạng + ưu tiên đặt chỗ',0.00,6,0,0,5,1,'2025-10-13 14:36:02','2025-10-13 14:36:02');
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
  `membership_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tier_id` int NOT NULL,
  `total_points` int DEFAULT '0',
  `available_points` int DEFAULT '0',
  `lifetime_spending` decimal(12,2) DEFAULT '0.00',
  `annual_spending` decimal(12,2) DEFAULT '0.00',
  `total_visits` int DEFAULT '0',
  `tier_start_date` date DEFAULT NULL,
  `next_tier_review_date` date DEFAULT NULL,
  `status` enum('ACTIVE','SUSPENDED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `memberships`
--

LOCK TABLES `memberships` WRITE;
/*!40000 ALTER TABLE `memberships` DISABLE KEYS */;
INSERT INTO `memberships` VALUES (1,4,'MB000000004',1,0,0,0.00,0.00,0,'2025-10-18','2026-10-18','ACTIVE','2025-10-17 20:26:11','2025-10-17 20:26:11'),(2,5,'MB000000005',1,0,0,0.00,0.00,0,'2025-10-18','2026-10-18','ACTIVE','2025-10-17 20:28:25','2025-10-17 20:28:25'),(3,13,'MB000000013',1,0,0,0.00,0.00,0,'2025-10-18','2026-10-18','ACTIVE','2025-10-17 21:09:40','2025-10-17 21:09:40');
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
INSERT INTO `movie_genre_mapping` VALUES (1,1),(2,1),(1,2),(2,2),(4,2),(2,4),(4,4),(5,4),(1,6),(5,7),(3,8),(3,10);
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
  `genre_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `genre_name_en` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` tinytext COLLATE utf8mb4_unicode_ci,
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
INSERT INTO `movie_genres` VALUES (1,'Hành động','Action',NULL,1),(2,'Phiêu lưu','Adventure',NULL,1),(3,'Hài hước','Comedy',NULL,1),(4,'Chính kịch','Drama',NULL,1),(5,'Kinh dị','Horror',NULL,1),(6,'Khoa học viễn tưởng','Sci-Fi',NULL,1),(7,'Lãng mạn','Romance',NULL,1),(8,'Hoạt hình','Animation',NULL,1),(9,'Tài liệu','Documentary',NULL,1),(10,'Gia đình','Family',NULL,1);
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
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `age_rating` enum('P','K','T13','T16','T18') COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_warning` tinytext COLLATE utf8mb4_unicode_ci,
  `synopsis` tinytext COLLATE utf8mb4_unicode_ci,
  `synopsis_en` tinytext COLLATE utf8mb4_unicode_ci,
  `duration_minutes` int NOT NULL,
  `release_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `language` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtitle_language` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `director` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cast` tinytext COLLATE utf8mb4_unicode_ci,
  `producer` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `poster_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `backdrop_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trailer_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('COMING_SOON','NOW_SHOWING','END_SHOWING') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COMING_SOON',
  `is_featured` tinyint(1) DEFAULT '0',
  `imdb_rating` decimal(3,1) DEFAULT NULL,
  `imdb_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`movie_id`),
  KEY `idx_status` (`status`),
  KEY `idx_release_date` (`release_date`),
  KEY `idx_age_rating` (`age_rating`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movies`
--

LOCK TABLES `movies` WRITE;
/*!40000 ALTER TABLE `movies` DISABLE KEYS */;
INSERT INTO `movies` VALUES (1,'Người Nhện: Không Còn Nhà','Spider-Man: No Way Home','T13',NULL,NULL,NULL,148,'2025-10-01','2025-11-30','USA','English',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'NOW_SHOWING',0,NULL,NULL,'2025-10-18 03:59:58','2025-10-18 03:59:58'),(2,'Báo Đen: Wakanda Mãi Mãi','Black Panther: Wakanda Forever','T13',NULL,NULL,NULL,161,'2025-10-05','2025-11-30','USA','English',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'NOW_SHOWING',0,NULL,NULL,'2025-10-18 03:59:58','2025-10-18 03:59:58'),(3,'Doraemon: Nobita và Vùng Đất Lý Tưởng Trên Bầu Trời','Doraemon: Nobitas Sky Utopia','P',NULL,NULL,NULL,108,'2025-10-10','2025-11-15','Japan','Japanese',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'NOW_SHOWING',0,NULL,NULL,'2025-10-18 03:59:58','2025-10-18 03:59:58'),(4,'Oppenheimer','Oppenheimer','T18',NULL,NULL,NULL,180,'2025-10-15','2025-12-15','USA','English',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'NOW_SHOWING',0,NULL,NULL,'2025-10-18 03:59:58','2025-10-18 03:59:58'),(5,'Tấm Cám: Chuyện Chưa Kể','Tam Cam: The Untold Story','T13',NULL,NULL,NULL,115,'2025-11-01',NULL,'Vietnam','Vietnamese',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'COMING_SOON',0,NULL,NULL,'2025-10-18 03:59:58','2025-10-18 03:59:58');
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
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` tinytext COLLATE utf8mb4_unicode_ci NOT NULL,
  `notification_type` enum('INFO','SUCCESS','WARNING','ERROR','PROMOTIONAL') COLLATE utf8mb4_unicode_ci DEFAULT 'INFO',
  `channels` json DEFAULT NULL,
  `template_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int DEFAULT NULL,
  `concession_order_id` int DEFAULT NULL,
  `payment_reference` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_method` tinytext COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_provider` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'VND',
  `status` enum('PENDING','PROCESSING','COMPLETED','FAILED','CANCELLED','REFUNDED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `gateway_transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gateway_response` json DEFAULT NULL,
  `initiated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  `failure_reason` tinytext COLLATE utf8mb4_unicode_ci,
  `refund_reason` tinytext COLLATE utf8mb4_unicode_ci,
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,NULL,'PAY20251018001','CREDIT_CARD',NULL,180000.00,'VND','COMPLETED',NULL,NULL,'2025-10-18 04:01:05','2025-10-18 04:01:05',NULL,NULL,'2025-10-18 04:01:05','2025-10-18 04:01:05'),(2,2,NULL,'PAY20251018002','E_WALLET',NULL,270000.00,'VND','COMPLETED',NULL,NULL,'2025-10-18 04:01:05','2025-10-18 04:01:05',NULL,NULL,'2025-10-18 04:01:05','2025-10-18 04:01:05'),(3,3,NULL,'PAY20251018003','BANK_TRANSFER',NULL,300000.00,'VND','PENDING',NULL,NULL,'2025-10-18 04:01:05',NULL,NULL,NULL,'2025-10-18 04:01:05','2025-10-18 04:01:05');
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
  `transaction_type` enum('EARN','REDEEM','EXPIRE','ADJUST','GIFT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `points_amount` int NOT NULL,
  `source_type` enum('BOOKING','BONUS','BIRTHDAY','REFERRAL','PROMOTION','MANUAL','CONCESSION') COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_id` int DEFAULT NULL,
  `description` tinytext COLLATE utf8mb4_unicode_ci,
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `points_transactions`
--

LOCK TABLES `points_transactions` WRITE;
/*!40000 ALTER TABLE `points_transactions` DISABLE KEYS */;
INSERT INTO `points_transactions` VALUES (1,4,'EARN',180,'BOOKING',1,NULL,100,280,NULL,NULL,'2025-10-18 04:01:14'),(2,5,'EARN',270,'BOOKING',2,NULL,2000,2270,NULL,NULL,'2025-10-18 04:01:14'),(3,6,'EARN',300,'BOOKING',3,NULL,5000,5300,NULL,NULL,'2025-10-18 04:01:14');
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
  `rule_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` tinytext COLLATE utf8mb4_unicode_ci,
  `conditions` json DEFAULT NULL,
  `rule_type` tinytext COLLATE utf8mb4_unicode_ci NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pricing_rules`
--

LOCK TABLES `pricing_rules` WRITE;
/*!40000 ALTER TABLE `pricing_rules` DISABLE KEYS */;
INSERT INTO `pricing_rules` VALUES (1,'Giảm giá thứ 3 hàng tuần','Giảm 20% cho mọi suất chiếu vào thứ 3',NULL,'DISCOUNT',NULL,20.00,'2025-01-01','2025-12-31',NULL,0,1,'2025-10-18 04:00:16','2025-10-18 04:00:16'),(2,'Phụ thu cuối tuần','Tăng 10% giá vé cho các suất chiếu cuối tuần',NULL,'SURCHARGE',NULL,10.00,'2025-01-01','2025-12-31',NULL,0,1,'2025-10-18 04:00:16','2025-10-18 04:00:16'),(3,'Happy Hour sáng sớm','Giảm 30% cho suất chiếu trước 12h',NULL,'DISCOUNT',NULL,30.00,'2025-01-01','2025-12-31',NULL,0,1,'2025-10-18 04:00:16','2025-10-18 04:00:16'),(4,'Giá cố định U22','Giá cố định 50.000đ cho khách hàng dưới 22 tuổi',NULL,'FIXED_PRICE',50000.00,NULL,'2025-01-01','2025-12-31',NULL,0,1,'2025-10-18 04:00:16','2025-10-18 04:00:16');
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
  `promotion_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `promotion_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` tinytext COLLATE utf8mb4_unicode_ci,
  `promotion_type` tinytext COLLATE utf8mb4_unicode_ci NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
INSERT INTO `promotions` VALUES (1,'WELCOME2025','Chào mừng 2025',NULL,'PERCENTAGE',15.00,NULL,100000.00,NULL,NULL,'2025-01-01 00:00:00','2025-12-31 00:00:00',NULL,1,0,NULL,1,'2025-10-18 04:00:47','2025-10-18 04:00:47',NULL),(2,'BIRTHDAY25','Quà sinh nhật',NULL,'PERCENTAGE',25.00,NULL,0.00,NULL,NULL,'2025-01-01 00:00:00','2025-12-31 00:00:00',NULL,1,0,NULL,1,'2025-10-18 04:00:47','2025-10-18 04:00:47',NULL),(3,'MEMBER50K','Giảm 50K cho thành viên',NULL,'FIXED_AMOUNT',NULL,NULL,200000.00,NULL,NULL,'2025-10-01 00:00:00','2025-12-31 00:00:00',NULL,1,0,NULL,1,'2025-10-18 04:00:47','2025-10-18 04:00:47',NULL);
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
  `refund_reference` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `refund_amount` decimal(12,2) NOT NULL,
  `refund_method` tinytext COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` tinytext COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason_description` tinytext COLLATE utf8mb4_unicode_ci,
  `status` enum('PENDING','PROCESSING','COMPLETED','FAILED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `processed_by` int DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `gateway_refund_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `role_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` tinytext COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'CUSTOMER','Khách hàng thông thường','2025-10-13 14:36:02'),(2,'CINEMA_STAFF','Nhân viên rạp','2025-10-13 14:36:02'),(3,'CINEMA_MANAGER','Quản lý rạp','2025-10-13 14:36:02'),(4,'SYSTEM_ADMIN','Quản trị viên hệ thống','2025-10-13 14:36:02');
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
  `seat_row` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `seat_number` int NOT NULL,
  `seat_type` enum('STANDARD','VIP','COUPLE','WHEELCHAIR') COLLATE utf8mb4_unicode_ci DEFAULT 'STANDARD',
  `position_x` int DEFAULT NULL,
  `position_y` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`seat_id`),
  UNIQUE KEY `unique_seat_position` (`hall_id`,`seat_row`,`seat_number`),
  KEY `idx_hall_id` (`hall_id`),
  CONSTRAINT `seats_ibfk_1` FOREIGN KEY (`hall_id`) REFERENCES `cinema_halls` (`hall_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=128 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seats`
--

LOCK TABLES `seats` WRITE;
/*!40000 ALTER TABLE `seats` DISABLE KEYS */;
INSERT INTO `seats` VALUES (1,1,'A',1,'STANDARD',NULL,NULL,1),(2,1,'A',2,'STANDARD',NULL,NULL,1),(3,1,'A',3,'STANDARD',NULL,NULL,1),(4,1,'A',4,'STANDARD',NULL,NULL,1),(5,1,'A',5,'STANDARD',NULL,NULL,1),(6,1,'A',6,'STANDARD',NULL,NULL,1),(7,1,'A',7,'STANDARD',NULL,NULL,1),(8,1,'A',8,'STANDARD',NULL,NULL,1),(9,1,'A',9,'STANDARD',NULL,NULL,1),(10,1,'A',10,'STANDARD',NULL,NULL,1),(11,1,'A',11,'STANDARD',NULL,NULL,1),(12,1,'A',12,'STANDARD',NULL,NULL,1),(13,1,'B',1,'STANDARD',NULL,NULL,1),(14,1,'B',2,'STANDARD',NULL,NULL,1),(15,1,'B',3,'STANDARD',NULL,NULL,1),(16,1,'B',4,'STANDARD',NULL,NULL,1),(17,1,'B',5,'STANDARD',NULL,NULL,1),(18,1,'B',6,'STANDARD',NULL,NULL,1),(19,1,'B',7,'STANDARD',NULL,NULL,1),(20,1,'B',8,'STANDARD',NULL,NULL,1),(21,1,'B',9,'STANDARD',NULL,NULL,1),(22,1,'B',10,'STANDARD',NULL,NULL,1),(23,1,'B',11,'STANDARD',NULL,NULL,1),(24,1,'B',12,'STANDARD',NULL,NULL,1),(25,1,'C',1,'VIP',NULL,NULL,1),(26,1,'C',2,'VIP',NULL,NULL,1),(27,1,'C',3,'VIP',NULL,NULL,1),(28,1,'C',4,'VIP',NULL,NULL,1),(29,1,'C',5,'VIP',NULL,NULL,1),(30,1,'C',6,'VIP',NULL,NULL,1),(31,1,'C',7,'VIP',NULL,NULL,1),(32,1,'C',8,'VIP',NULL,NULL,1),(33,1,'C',9,'VIP',NULL,NULL,1),(34,1,'C',10,'VIP',NULL,NULL,1),(35,1,'C',11,'VIP',NULL,NULL,1),(36,1,'C',12,'VIP',NULL,NULL,1),(37,1,'D',1,'VIP',NULL,NULL,1),(38,1,'D',2,'VIP',NULL,NULL,1),(39,1,'D',3,'VIP',NULL,NULL,1),(40,1,'D',4,'VIP',NULL,NULL,1),(41,1,'D',5,'VIP',NULL,NULL,1),(42,1,'D',6,'VIP',NULL,NULL,1),(43,1,'D',7,'VIP',NULL,NULL,1),(44,1,'D',8,'VIP',NULL,NULL,1),(45,1,'D',9,'VIP',NULL,NULL,1),(46,1,'D',10,'VIP',NULL,NULL,1),(47,1,'D',11,'VIP',NULL,NULL,1),(48,1,'D',12,'VIP',NULL,NULL,1),(49,1,'E',1,'VIP',NULL,NULL,1),(50,1,'E',2,'VIP',NULL,NULL,1),(51,1,'E',3,'VIP',NULL,NULL,1),(52,1,'E',4,'VIP',NULL,NULL,1),(53,1,'E',5,'VIP',NULL,NULL,1),(54,1,'E',6,'VIP',NULL,NULL,1),(55,1,'E',7,'VIP',NULL,NULL,1),(56,1,'E',8,'VIP',NULL,NULL,1),(57,1,'E',9,'VIP',NULL,NULL,1),(58,1,'E',10,'VIP',NULL,NULL,1),(59,1,'E',11,'VIP',NULL,NULL,1),(60,1,'E',12,'VIP',NULL,NULL,1),(61,1,'F',1,'VIP',NULL,NULL,1),(62,1,'F',2,'VIP',NULL,NULL,1),(63,1,'F',3,'VIP',NULL,NULL,1),(64,1,'F',4,'VIP',NULL,NULL,1),(65,1,'F',5,'VIP',NULL,NULL,1),(66,1,'F',6,'VIP',NULL,NULL,1),(67,1,'F',7,'VIP',NULL,NULL,1),(68,1,'F',8,'VIP',NULL,NULL,1),(69,1,'F',9,'VIP',NULL,NULL,1),(70,1,'F',10,'VIP',NULL,NULL,1),(71,1,'F',11,'VIP',NULL,NULL,1),(72,1,'F',12,'VIP',NULL,NULL,1),(73,1,'G',1,'COUPLE',NULL,NULL,1),(74,1,'G',2,'COUPLE',NULL,NULL,1),(75,1,'G',3,'COUPLE',NULL,NULL,1),(76,1,'G',4,'COUPLE',NULL,NULL,1),(77,1,'G',5,'COUPLE',NULL,NULL,1),(78,1,'G',6,'COUPLE',NULL,NULL,1),(79,1,'G',7,'COUPLE',NULL,NULL,1),(80,1,'G',8,'COUPLE',NULL,NULL,1),(81,1,'G',9,'COUPLE',NULL,NULL,1),(82,1,'G',10,'COUPLE',NULL,NULL,1),(83,1,'G',11,'COUPLE',NULL,NULL,1),(84,1,'G',12,'COUPLE',NULL,NULL,1),(85,1,'H',1,'COUPLE',NULL,NULL,1),(86,1,'H',2,'COUPLE',NULL,NULL,1),(87,1,'H',3,'COUPLE',NULL,NULL,1),(88,1,'H',4,'COUPLE',NULL,NULL,1),(89,1,'H',5,'COUPLE',NULL,NULL,1),(90,1,'H',6,'COUPLE',NULL,NULL,1),(91,1,'H',7,'COUPLE',NULL,NULL,1),(92,1,'H',8,'COUPLE',NULL,NULL,1),(93,1,'H',9,'COUPLE',NULL,NULL,1),(94,1,'H',10,'COUPLE',NULL,NULL,1),(95,1,'H',11,'COUPLE',NULL,NULL,1),(96,1,'H',12,'COUPLE',NULL,NULL,1),(97,1,'I',1,'STANDARD',NULL,NULL,1),(98,1,'I',2,'STANDARD',NULL,NULL,1),(99,1,'I',3,'STANDARD',NULL,NULL,1),(100,1,'I',4,'STANDARD',NULL,NULL,1);
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
  `format_type` enum('2D','3D','IMAX','4DX','SCREENX') COLLATE utf8mb4_unicode_ci DEFAULT '2D',
  `subtitle_language` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('SCHEDULED','SELLING','SOLD_OUT','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'SCHEDULED',
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `showtimes`
--

LOCK TABLES `showtimes` WRITE;
/*!40000 ALTER TABLE `showtimes` DISABLE KEYS */;
INSERT INTO `showtimes` VALUES (1,1,1,'2025-10-18','10:00:00','12:28:00','2D',NULL,'SCHEDULED',120,90000.00,'2025-10-18 04:00:08','2025-10-18 04:00:08'),(2,1,2,'2025-10-18','13:00:00','15:28:00','3D',NULL,'SCHEDULED',100,120000.00,'2025-10-18 04:00:08','2025-10-18 04:00:08'),(3,1,3,'2025-10-18','16:00:00','18:28:00','IMAX',NULL,'SCHEDULED',160,150000.00,'2025-10-18 04:00:08','2025-10-18 04:00:08'),(4,2,4,'2025-10-18','11:00:00','13:41:00','2D',NULL,'SCHEDULED',100,90000.00,'2025-10-18 04:00:08','2025-10-18 04:00:08'),(5,2,5,'2025-10-18','14:00:00','16:41:00','3D',NULL,'SCHEDULED',100,120000.00,'2025-10-18 04:00:08','2025-10-18 04:00:08'),(6,3,6,'2025-10-18','09:00:00','10:48:00','2D',NULL,'SCHEDULED',120,75000.00,'2025-10-18 04:00:08','2025-10-18 04:00:08'),(7,3,6,'2025-10-18','13:00:00','14:48:00','2D',NULL,'SCHEDULED',120,75000.00,'2025-10-18 04:00:08','2025-10-18 04:00:08'),(8,4,7,'2025-10-18','14:00:00','17:00:00','2D',NULL,'SCHEDULED',100,90000.00,'2025-10-18 04:00:08','2025-10-18 04:00:08'),(9,4,8,'2025-10-18','19:00:00','22:00:00','2D',NULL,'SCHEDULED',120,90000.00,'2025-10-18 04:00:08','2025-10-18 04:00:08');
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
  `config_key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `config_value` tinytext COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_type` enum('STRING','INTEGER','DECIMAL','BOOLEAN','JSON') COLLATE utf8mb4_unicode_ci DEFAULT 'STRING',
  `description` tinytext COLLATE utf8mb4_unicode_ci,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_configurations`
--

LOCK TABLES `system_configurations` WRITE;
/*!40000 ALTER TABLE `system_configurations` DISABLE KEYS */;
INSERT INTO `system_configurations` VALUES (1,'SEAT_HOLD_DURATION_MINUTES','10','INTEGER','Thời gian giữ ghế khi đặt vé (phút)','BOOKING',NULL,NULL,NULL,'2025-10-13 14:36:02','2025-10-13 14:36:02'),(2,'MAX_TICKETS_PER_BOOKING','8','INTEGER','Số lượng vé tối đa trong một lần đặt','BOOKING',NULL,NULL,NULL,'2025-10-13 14:36:02','2025-10-13 14:36:02'),(3,'BOOKING_CANCEL_DEADLINE_MINUTES','60','INTEGER','Thời gian tối thiểu trước giờ chiếu để hủy vé (phút)','BOOKING',NULL,NULL,NULL,'2025-10-13 14:36:02','2025-10-13 14:36:02'),(4,'POINTS_TO_VND_RATE','1000','DECIMAL','1 điểm = bao nhiêu VND','POINTS',NULL,NULL,NULL,'2025-10-13 14:36:02','2025-10-13 14:36:02'),(5,'DEFAULT_SERVICE_FEE_PERCENTAGE','3.0','DECIMAL','Phí dịch vụ mặc định (%)','PAYMENT',NULL,NULL,NULL,'2025-10-13 14:36:02','2025-10-13 14:36:02'),(6,'MAX_REFUND_REQUESTS_PER_MONTH','3','INTEGER','Số lần hủy vé tối đa mỗi tháng','REFUND',NULL,NULL,NULL,'2025-10-13 14:36:02','2025-10-13 14:36:02');
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
  `log_level` enum('DEBUG','INFO','WARNING','ERROR','CRITICAL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `component` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` tinytext COLLATE utf8mb4_unicode_ci,
  `exception_details` tinytext COLLATE utf8mb4_unicode_ci,
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
  `ticket_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `surcharge_amount` decimal(10,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `final_price` decimal(10,2) NOT NULL,
  `status` enum('BOOKED','PAID','USED','CANCELLED','REFUNDED') COLLATE utf8mb4_unicode_ci DEFAULT 'BOOKED',
  `checked_in_at` timestamp NULL DEFAULT NULL,
  `checked_in_by` int DEFAULT NULL,
  `qr_code` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (1,1,1,'TK20251018001-1',90000.00,0.00,0.00,90000.00,'PAID',NULL,NULL,NULL,'2025-10-18 04:01:00','2025-10-18 04:01:00'),(2,1,2,'TK20251018001-2',90000.00,0.00,0.00,90000.00,'PAID',NULL,NULL,NULL,'2025-10-18 04:01:00','2025-10-18 04:01:00'),(3,2,45,'TK20251018002-1',90000.00,0.00,0.00,90000.00,'PAID',NULL,NULL,NULL,'2025-10-18 04:01:00','2025-10-18 04:01:00'),(4,2,46,'TK20251018002-2',90000.00,0.00,0.00,90000.00,'PAID',NULL,NULL,NULL,'2025-10-18 04:01:00','2025-10-18 04:01:00'),(5,2,47,'TK20251018002-3',90000.00,0.00,0.00,90000.00,'PAID',NULL,NULL,NULL,'2025-10-18 04:01:00','2025-10-18 04:01:00'),(6,3,72,'TK20251018003-1',75000.00,0.00,0.00,75000.00,'BOOKED',NULL,NULL,NULL,'2025-10-18 04:01:00','2025-10-18 04:01:00'),(7,3,73,'TK20251018003-2',75000.00,0.00,0.00,75000.00,'BOOKED',NULL,NULL,NULL,'2025-10-18 04:01:00','2025-10-18 04:01:00'),(8,3,74,'TK20251018003-3',75000.00,0.00,0.00,75000.00,'BOOKED',NULL,NULL,NULL,'2025-10-18 04:01:00','2025-10-18 04:01:00'),(9,3,75,'TK20251018003-4',75000.00,0.00,0.00,75000.00,'BOOKED',NULL,NULL,NULL,'2025-10-18 04:01:00','2025-10-18 04:01:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,4,1,'2025-10-17 20:26:11',NULL),(2,5,1,'2025-10-17 20:28:25',NULL),(9,13,1,'2025-10-17 21:09:40',NULL);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` tinytext COLLATE utf8mb4_unicode_ci,
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
  `voucher_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('AVAILABLE','USED','EXPIRED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'AVAILABLE',
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_vouchers`
--

LOCK TABLES `user_vouchers` WRITE;
/*!40000 ALTER TABLE `user_vouchers` DISABLE KEYS */;
INSERT INTO `user_vouchers` VALUES (1,4,1,'WELCOME2025-001','AVAILABLE','2025-10-18 04:00:51',NULL,'2025-12-31 16:59:59',NULL),(2,5,2,'BIRTHDAY25-001','AVAILABLE','2025-10-18 04:00:51',NULL,'2025-12-31 16:59:59',NULL),(3,6,3,'MEMBER50K-001','AVAILABLE','2025-10-18 04:00:51',NULL,'2025-12-31 16:59:59',NULL);
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
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` tinytext COLLATE utf8mb4_unicode_ci,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_email_verified` tinyint(1) DEFAULT '0',
  `is_phone_verified` tinyint(1) DEFAULT '0',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `phone_verified_at` timestamp NULL DEFAULT NULL,
  `privacy_policy_accepted` tinyint(1) DEFAULT '0',
  `privacy_policy_version` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `privacy_policy_accepted_at` timestamp NULL DEFAULT NULL,
  `terms_of_service_accepted` tinyint(1) DEFAULT '0',
  `terms_of_service_version` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `terms_of_service_accepted_at` timestamp NULL DEFAULT NULL,
  `marketing_email_consent` tinyint(1) DEFAULT '0',
  `marketing_sms_consent` tinyint(1) DEFAULT '0',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `failed_login_attempts` int DEFAULT '0',
  `locked_until` timestamp NULL DEFAULT NULL,
  `password_reset_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (4,'user@example.com','0901234567','$2a$10$6E7.N9lbecZAOH.uG7p6C.UjxtK/otKyxWwYfMevmOxEQmZi4hk7y','Nguyen Van A','1995-05-15','MALE',NULL,1,0,NULL,NULL,NULL,1,'1.0','2025-10-17 20:26:11',1,'1.0','2025-10-17 20:26:11',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-17 20:26:11','2025-10-17 20:26:11',NULL,NULL),(10,'customer1@gmail.com','0901234570','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LcdYShZvBOHURwj.6','Lê Văn C','1998-03-10','MALE',NULL,1,1,0,NULL,NULL,0,NULL,NULL,0,NULL,NULL,0,0,NULL,0,NULL,NULL,NULL,'2025-10-18 03:53:59','2025-10-18 03:53:59',NULL,NULL),(11,'customer2@gmail.com','0901234571','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LcdYShZvBOHURwj.6','Phạm Thị D','2000-12-25','FEMALE',NULL,1,1,0,NULL,NULL,0,NULL,NULL,0,NULL,NULL,0,0,NULL,0,NULL,NULL,NULL,'2025-10-18 03:53:59','2025-10-18 03:53:59',NULL,NULL),(12,'customer3@gmail.com','0901234572','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LcdYShZvBOHURwj.6','Hoàng Văn E','1997-07-18','MALE',NULL,1,1,0,NULL,NULL,0,NULL,NULL,0,NULL,NULL,0,0,NULL,0,NULL,NULL,NULL,'2025-10-18 03:53:59','2025-10-18 03:53:59',NULL,NULL),(13,'khanhkhoi08@gmail.com','0915232119','$2a$10$iY6Ed16PtSagBQyNsC./XukZW5qpo2kF4i.3naqdD1uQLftkxvEI2','Nguyen Doan Duy Khanh','2004-11-11','MALE',NULL,1,0,NULL,NULL,NULL,1,'1.0','2025-10-17 21:09:40',1,'1.0','2025-10-17 21:09:40',NULL,NULL,'2025-10-17 21:10:47',0,NULL,NULL,NULL,'2025-10-17 21:09:40','2025-10-17 21:09:40',NULL,NULL);
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
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_booking_details` AS select `b`.`booking_id` AS `booking_id`,`b`.`booking_code` AS `booking_code`,`b`.`user_id` AS `user_id`,`u`.`full_name` AS `customer_name`,`u`.`email` AS `customer_email`,`m`.`title` AS `movie_title`,`m`.`age_rating` AS `age_rating`,`c`.`cinema_name` AS `cinema_name`,`ch`.`hall_name` AS `hall_name`,`s`.`show_date` AS `show_date`,`s`.`start_time` AS `start_time`,`s`.`format_type` AS `format_type`,`b`.`total_seats` AS `total_seats`,`b`.`total_amount` AS `total_amount`,`b`.`status` AS `booking_status`,`b`.`payment_status` AS `payment_status`,`b`.`created_at` AS `booking_date` from (((((`bookings` `b` left join `users` `u` on((`b`.`user_id` = `u`.`user_id`))) join `showtimes` `s` on((`b`.`showtime_id` = `s`.`showtime_id`))) join `movies` `m` on((`s`.`movie_id` = `m`.`movie_id`))) join `cinema_halls` `ch` on((`s`.`hall_id` = `ch`.`hall_id`))) join `cinemas` `c` on((`ch`.`cinema_id` = `c`.`cinema_id`))) */;
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
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
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
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
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

-- Dump completed on 2025-10-18 18:28:47
