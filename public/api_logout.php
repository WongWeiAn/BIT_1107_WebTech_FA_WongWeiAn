<?php
require_once 'config.php';

header('Content-Type: application/json');

session_destroy();
echo json_encode(['message' => 'Logout successful']);
?>