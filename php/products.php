<?php

require_once "db.php";

$sql = "SELECT 
            product_id,
            product_name,
            category,
            description,
            price,
            quantity,
            harvest_date,
            image_url,
            unit
        FROM products
        ORDER BY product_id";

$result = $conn->query($sql);

$products = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
}

header("Content-Type: application/json");

echo json_encode($products);

?>