<?php
require_once 'config.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$username = $data['username'] ?? '';
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['error' => 'Email and password required']);
    exit;
}

// Check if user exists
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(['error' => 'User already exists']);
    exit;
}

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insert user
$stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
$defaultUsername = $username ?: explode('@', $email)[0];
$stmt->bind_param("sss", $defaultUsername, $email, $hashedPassword);

if ($stmt->execute()) {
    echo json_encode(['message' => 'Registration successful! Please login.']);
} else {
    echo json_encode(['error' => 'Failed to create user: ' . $conn->error]);
}

$stmt->close();
$conn->close();
?>