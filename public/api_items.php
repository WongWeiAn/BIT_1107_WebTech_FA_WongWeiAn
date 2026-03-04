<?php
require_once 'config.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get all items
        $result = $conn->query("SELECT * FROM items ORDER BY created_at DESC");
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
        echo json_encode($items);
        break;
        
    case 'POST':
        // Create new item
        $title = $_POST['title'] ?? '';
        $description = $_POST['description'] ?? '';
        $category = $_POST['category'] ?? '';
        $location = $_POST['location'] ?? '';
        $item_date = $_POST['item_date'] ?? '';
        $email_id = $_POST['email_id'] ?? '';
        $contact_info = $_POST['contact_info'] ?? '';
        
        if (empty($title) || empty($description) || empty($category) || empty($location) || empty($item_date) || empty($email_id)) {
            echo json_encode(['error' => 'Required fields missing']);
            exit;
        }
        
        // Handle image upload - FIXED PATH
        $image_path = null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $upload_dir = 'uploads/';  // CHANGED: from '../uploads/' to 'uploads/'
            if (!file_exists($upload_dir)) {
                mkdir($upload_dir, 0777, true);
            }
            
            $file_extension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $filename = time() . '_' . uniqid() . '.' . $file_extension;
            $target_path = $upload_dir . $filename;
            
            if (move_uploaded_file($_FILES['image']['tmp_name'], $target_path)) {
                $image_path = $filename;
            }
        }
        
        $user_id = $_SESSION['user_id'] ?? null;
        
        $stmt = $conn->prepare("INSERT INTO items (title, description, category, location, item_date, email_id, contact_info, image_path, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssssssi", $title, $description, $category, $location, $item_date, $email_id, $contact_info, $image_path, $user_id);
        
        if ($stmt->execute()) {
            echo json_encode(['message' => 'Item created successfully', 'id' => $stmt->insert_id]);
        } else {
            echo json_encode(['error' => 'Failed to create item: ' . $conn->error]);
        }
        $stmt->close();
        break;
        
    default:
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

$conn->close();
?>