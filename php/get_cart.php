<?php
header('Content-Type: application/json');
session_start();

$cart = $_SESSION['cart'] ?? [];
echo json_encode(array_values($cart));
?>
