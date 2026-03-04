-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 04, 2026 at 07:53 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `campus_lost_found`
--

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` enum('Lost','Found') NOT NULL,
  `location` varchar(255) NOT NULL,
  `item_date` date NOT NULL,
  `email_id` varchar(100) NOT NULL,
  `contact_info` varchar(50) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `status` enum('Active','Claimed','Resolved') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `user_id`, `title`, `description`, `category`, `location`, `item_date`, `email_id`, `contact_info`, `image_path`, `status`, `created_at`) VALUES
(1, 1, 'Black Laptop', 'Dell XPS 13 with stickers', 'Lost', 'Library 2nd Floor', '2026-03-01', 'test@example.com', '012-3456789', NULL, 'Active', '2026-03-03 16:05:22'),
(2, 1, 'Water Bottle', 'Blue thermal flask', 'Found', 'Cafeteria', '2026-03-02', 'test@example.com', NULL, NULL, 'Active', '2026-03-03 16:05:22'),
(4, 3, 'labubu', 'asdasdasdjjj', 'Lost', 'sadasdasdsadsad', '0000-00-00', 'weian.wong@qiu.edu.my', '121212121212', '/uploads/1772558082945.jfif', 'Active', '2026-03-03 17:14:42'),
(5, 2, 'lee simon', 'lee simon is found in the campus', 'Found', 'ASB LV2 toilet', '2026-03-03', 'weian.wong@qiu.edu.my', '0199999999', '/uploads/1772592448798.jfif', 'Active', '2026-03-04 02:47:28'),
(6, 2, 'asus laptop', 'my laptop is lost on the toilet', 'Lost', 'asb level 3 toilet', '2020-04-02', 'weian.wong@qiu.edu.my', '1212121212', '/uploads/1772592593069.jpg', 'Active', '2026-03-04 02:49:53'),
(8, 5, 'Laptop', 'i lost my laptop in campus', 'Lost', 'asb level computer lab', '1010-10-10', 'weian.wong@qiu.edu.my', '100101000', '/uploads/1772594212814.jpg', 'Active', '2026-03-04 03:16:52'),
(9, 5, 'labubu', 'i lost my keychain in campus', 'Lost', 'asb level 1 delta lab', '2020-11-11', 'weian.wong@qiu.edu.my', '10101010100', '/uploads/1772594256102.jpg', 'Active', '2026-03-04 03:17:36'),
(10, 5, 'bottle', 'i found a bottle in dustbin', 'Found', 'asb level 2 corridor', '2020-02-10', 'weian.wong@qiu.edu.my', '10101010101', '/uploads/1772594300662.jpg', 'Active', '2026-03-04 03:18:20'),
(12, 5, 'My friends', 'i lost my friends in campus', 'Lost', 'asb campus', '2020-10-11', 'weian.wong@qiu.edu.my', '12121212121', '/uploads/1772594508018.jpg', 'Active', '2026-03-04 03:21:48');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `created_at`) VALUES
(1, 'testuser', 'test@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrRUMut5IqQvJEzJxU9VHjcYqY9Z1uC', '2026-03-03 16:05:22'),
(2, 'admin', 'admin@gmail.com', '$2a$10$WynQgjOyfDn/FTlvnJwlgeDFf8jpiRg1lLcf2Lx/2JBNO2q2D8wlW', '2026-03-03 17:06:16'),
(3, 'lee simon', 'leesimon@gmail.com', '$2a$10$l4SlpAPLiks1n1KiR3EGUu/ZZAhm.0dfZBcNQDo9dWfT6EU3SOUPq', '2026-03-03 17:13:54'),
(4, 'weian', 'weian.wong@qiu.edu.my', '$2a$10$FYHSbi.KXTj5IHQnqWcGJeNcVGPplOMRkEOotpOlfOU.ht8knIQX6', '2026-03-04 02:15:33'),
(5, 'navinder', 'navinder@gmail.com', '$2a$10$nNNbgFCPGHi25crP3NtYKeKPtf6T.UNF2.ccdCginib3MdnEIh4hy', '2026-03-04 02:54:06');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
