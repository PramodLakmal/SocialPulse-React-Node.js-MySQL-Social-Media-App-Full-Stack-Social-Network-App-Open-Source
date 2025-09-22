-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 25, 2024 at 08:49 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12
--
-- Combined database schema with Google OAuth support and RBAC
-- This file combines mydevify_social.sql and google_oauth_migration.sql

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Disable foreign key checks to avoid constraint issues during import
SET FOREIGN_KEY_CHECKS=0;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mydevify_social`
--

-- Clean up existing tables and data (in correct order to handle foreign keys)
DROP TABLE IF EXISTS `role_permissions`;
DROP TABLE IF EXISTS `comments`;
DROP TABLE IF EXISTS `likes`;
DROP TABLE IF EXISTS `posts`;
DROP TABLE IF EXISTS `relationships`;
DROP TABLE IF EXISTS `stories`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `roles`;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'admin', 'Administrator with full access to all features'),
(2, 'moderator', 'Moderator with content management permissions'),
(3, 'user', 'Regular user with standard permissions');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `resource` varchar(50) NOT NULL,
  `action` varchar(50) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `resource_action` (`resource`, `action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `description`, `resource`, `action`) VALUES
(1, 'manage_users', 'Create, read, update, delete users', 'users', 'manage'),
(2, 'manage_posts', 'Create, read, update, delete posts', 'posts', 'manage'),
(3, 'manage_comments', 'Create, read, update, delete comments', 'comments', 'manage'),
(4, 'manage_stories', 'Create, read, update, delete stories', 'stories', 'manage'),
(5, 'view_analytics', 'View system analytics and reports', 'analytics', 'view'),
(6, 'manage_roles', 'Create, read, update, delete roles', 'roles', 'manage'),
(7, 'create_post', 'Create new posts', 'posts', 'create'),
(8, 'edit_own_post', 'Edit own posts', 'posts', 'edit_own'),
(9, 'delete_own_post', 'Delete own posts', 'posts', 'delete_own'),
(10, 'create_comment', 'Create comments', 'comments', 'create'),
(11, 'edit_own_comment', 'Edit own comments', 'comments', 'edit_own'),
(12, 'delete_own_comment', 'Delete own comments', 'comments', 'delete_own'),
(13, 'create_story', 'Create stories', 'stories', 'create'),
(14, 'follow_users', 'Follow other users', 'relationships', 'create'),
(15, 'like_posts', 'Like posts', 'likes', 'create');

-- --------------------------------------------------------

--
-- Table structure for table `users`
-- Updated with Google OAuth support and RBAC
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(200) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(200) NULL,
  `name` varchar(200) NOT NULL,
  `coverPic` varchar(200) DEFAULT NULL,
  `profilePic` varchar(200) DEFAULT NULL,
  `city` varchar(200) DEFAULT NULL,
  `website` varchar(200) DEFAULT NULL,
  `bio` varchar(200) DEFAULT NULL,
  `facebookProfile` varchar(30) DEFAULT NULL,
  `instagramProfile` varchar(30) DEFAULT NULL,
  `XProfile` varchar(30) DEFAULT NULL,
  `googleId` VARCHAR(100) UNIQUE DEFAULT NULL,
  `role_id` int(11) NOT NULL DEFAULT 3,
  `status` enum('active','inactive','banned') NOT NULL DEFAULT 'active',
  `last_login` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  INDEX `idx_users_googleId` (`googleId`),
  KEY `role_id` (`role_id`),
  KEY `status` (`status`),
  KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `name`, `coverPic`, `profilePic`, `city`, `website`, `bio`, `facebookProfile`, `instagramProfile`, `XProfile`, `googleId`, `role_id`, `status`) VALUES
(1, 'admin', 'admin@socialpulse.com', '$2a$10$dJ7Kxz3DCHj4akP27DxqGujO8eqcP3GW3HBZsdL4VXLYw68FV.hAq', 'System Administrator', NULL, NULL, NULL, NULL, 'System Administrator with full access', NULL, NULL, NULL, NULL, 1, 'active'),
(2, 'xLoy', 'contactxloy@gmail.com', '$2a$10$CcYmjwVjtrHMl.sYvDQc3OlkNT1pkBcorlrkUIzkyIx7pGYN/a6lG', 'Bousaadi Louay', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active'),
(3, 'Example', 'example@example.com', '$2a$10$Txv.Mg0hqpVv7Bof4KZRr.CyaGa1CEBiT6fS15mfZWSIE6AV95MjK', 'example example', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_permission_unique` (`role_id`, `permission_id`),
  KEY `role_id` (`role_id`),
  KEY `permission_id` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
-- Admin permissions (all permissions)
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12), (1, 13), (1, 14), (1, 15),
-- Moderator permissions (content management)
(2, 2), (2, 3), (2, 4), (2, 5), (2, 7), (2, 8), (2, 9), (2, 10), (2, 11), (2, 12), (2, 13), (2, 14), (2, 15),
-- User permissions (standard user actions)
(3, 7), (3, 8), (3, 9), (3, 10), (3, 11), (3, 12), (3, 13), (3, 14), (3, 15);

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Desc` varchar(600) NOT NULL,
  `img` varchar(200) DEFAULT NULL,
  `userid` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`,`userid`),
  KEY `userid` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `Desc`, `img`, `userid`, `createdAt`) VALUES
(23, 'Step into the world of SocialPulse 2024, a vibrant React Node.js MySQL social media experience. Crafted with passion and expertise by the minds at MyDevify.com, this open-source marvel invites you to explore boundless possibilities. Dive into the heart of innovation and community. Discover more at the nexus of creativity and collaboration: \n\nhttps://github.com/mydevify/SocialPulse-React-Node.js-MySQL-Social-Media-App-Full-Stack-Social-Network-App-Open-Source/blob/main/README.md', '', 1, '2024-02-25 20:21:46'),
(24, 'Join the journey of innovation! Embrace the spirit of collaboration and make your mark on this open-source masterpiece. Your contributions are not just welcomed, but celebrated. Together, let\'s shape the future of SocialPulse 2024.', '170888903323968747470733a2f2f6d796465766966792e636f6d2f6173736574732f696e6465782e34393461633536382e706e67.png', 1, '2024-02-25 20:23:53');

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `desc` varchar(300) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `userid` int(11) NOT NULL,
  `postid` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userid` (`userid`),
  KEY `postid` (`postid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `desc`, `createdAt`, `userid`, `postid`) VALUES
(16, 'First Comment ', '2024-02-25 19:22:12', 1, 23),
(17, 'Check out MyDevify.com\n', '2024-02-25 19:29:22', 1, 24);

-- --------------------------------------------------------

--
-- Table structure for table `likes`
--

CREATE TABLE `likes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userid` int(11) NOT NULL,
  `postid` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userid` (`userid`),
  KEY `postid` (`postid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `likes`
--

INSERT INTO `likes` (`id`, `userid`, `postid`) VALUES
(827, 1, 23),
(828, 1, 24);

-- --------------------------------------------------------

--
-- Table structure for table `relationships`
--

CREATE TABLE `relationships` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `followeruserid` int(11) NOT NULL,
  `followeduserid` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `followeruserid` (`followeruserid`),
  KEY `followeduserid` (`followeduserid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stories`
--

CREATE TABLE `stories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `img` varchar(200) DEFAULT NULL,
  `userid` int(11) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userid` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stories`
--

INSERT INTO `stories` (`id`, `img`, `userid`, `createdAt`) VALUES
(9, '1708889386896photo-1534528741775-53994a69daeb.jpg', 1, '2024-02-25 19:29:46'),
(10, '1708889393853photo-1534528741775-53994a69daeb.jpg', 1, '2024-02-25 19:29:53'),
(12, '1708889450326photo-1534528741775-53994a69daeb.jpg', 1, '2024-02-25 19:30:50'),
(13, '1708889456596photo-1534528741775-53994a69daeb.jpg', 1, '2024-02-25 19:30:56');

-- Set AUTO_INCREMENT starting values
ALTER TABLE `roles` AUTO_INCREMENT=4;
ALTER TABLE `permissions` AUTO_INCREMENT=16;
ALTER TABLE `users` AUTO_INCREMENT=4;
ALTER TABLE `role_permissions` AUTO_INCREMENT=31;
ALTER TABLE `posts` AUTO_INCREMENT=25;
ALTER TABLE `comments` AUTO_INCREMENT=18;
ALTER TABLE `likes` AUTO_INCREMENT=829;
ALTER TABLE `relationships` AUTO_INCREMENT=20;
ALTER TABLE `stories` AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`postid`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `likes`
--
ALTER TABLE `likes`
  ADD CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`postid`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `relationships`
--
ALTER TABLE `relationships`
  ADD CONSTRAINT `relationships_ibfk_1` FOREIGN KEY (`followeruserid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `relationships_ibfk_2` FOREIGN KEY (`followeduserid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `stories`
--
ALTER TABLE `stories`
  ADD CONSTRAINT `stories_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;