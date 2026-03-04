<?php
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'campus_lost_found';

// Create connection
$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Start session
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Set charset to UTF-8
$conn->set_charset("utf8");
?>