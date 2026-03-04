<?php
require_once 'config.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['error' => 'Email and password required']);
    exit;
}

// Get user
$stmt = $conn->prepare("SELECT id, username, email, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['error' => 'Invalid email or password']);
    exit;
}

$user = $result->fetch_assoc();

// Verify password
if (password_verify($password, $user['password'])) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['username'] = $user['username'];
    
    echo json_encode(['message' => 'Login successful', 'userId' => $user['id']]);
} else {
    echo json_encode(['error' => 'Invalid email or password']);
}

$stmt->close();
$conn->close();
?>