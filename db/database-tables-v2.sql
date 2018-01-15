-- phpMyAdmin SQL Dump
-- version 4.7.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jun 10, 2017 at 07:34 PM
-- Server version: 10.0.30-MariaDB
-- PHP Version: 7.0.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `smalininku_impre`
--

-- --------------------------------------------------------

--
-- Table structure for table `uploadified_galleries`
--

CREATE TABLE `uploadified_galleries` (
  `id` bigint(20) NOT NULL,
  `is_public` tinyint(1) DEFAULT NULL,
  `is_enabled` tinyint(1) DEFAULT NULL,
  `impression_date` datetime DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `story` text,
  `mapZoomLevel` int(3) DEFAULT NULL

) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `uploadified_photos`
--

CREATE TABLE `uploadified_photos` (
  `id` bigint(20) NOT NULL,
  `object_id` bigint(20) NOT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `width` varchar(10) DEFAULT NULL,
  `height` varchar(10) DEFAULT NULL,
  `ratio` varchar(32) DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  `isCover` tinyint(1) DEFAULT '0',
  `num` int(5) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `alt` varchar(255) NOT NULL,
  `geo` varchar(255) NOT NULL,
  `exif` text NOT NULL,
  `exifGeo` varchar(255) NOT NULL,
  `exifAuthor` varchar(255) NOT NULL,
  `exifTimeCreated` varchar(255) NOT NULL,
  `exifCameraMake` varchar(255) NOT NULL,
  `exifCameraModel` varchar(255) NOT NULL,
  `exifIso` varchar(16) NOT NULL,
  `exifShutter` varchar(16) NOT NULL,
  `exifAperture` varchar(16) NOT NULL,
  `exifFocalLength` varchar(16) NOT NULL

) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `uploadified_galleries`
--
ALTER TABLE `uploadified_galleries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `uploadified_photos`
--
ALTER TABLE `uploadified_photos`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `uploadified_galleries`
--
ALTER TABLE `uploadified_galleries`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1250;
--
-- AUTO_INCREMENT for table `uploadified_photos`
--
ALTER TABLE `uploadified_photos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5339;COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
