<?php
header('Content-Type: application/json');
session_start();

// Accept POST JSON
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    echo json_encode(['success' => false, 'message' => 'No data received']);
    exit;
}

$productId = isset($data['product_id']) ? (string)$data['product_id'] : null;
$name = $data['name'] ?? '';
$price = $data['price'] ?? '';
$quantity = isset($data['quantity']) ? (int)$data['quantity'] : 1;

if (!$productId) {
    echo json_encode(['success' => false, 'message' => 'Invalid product id']);
    exit;
}

if (!isset($_SESSION['cart'])) $_SESSION['cart'] = [];

// merge by product_id
if (isset($_SESSION['cart'][$productId])) {
    $_SESSION['cart'][$productId]['quantity'] += $quantity;
} else {
    $_SESSION['cart'][$productId] = [
        'product_id' => $productId,
        'name' => $name,
        'price' => $price,
        'quantity' => $quantity
    ];
}

echo json_encode(['success' => true, 'cart' => array_values($_SESSION['cart'])]);
?>
