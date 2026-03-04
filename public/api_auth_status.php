<?php
require_once 'config.php';

header('Content-Type: application/json');

if (isset($_SESSION['user_id'])) {
    echo json_encode(['loggedIn' => true, 'user' => $_SESSION['user_id']]);
} else {
    echo json_encode(['loggedIn' => false]);
}
?>