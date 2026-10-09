<?php

header("Content-Type: application/json");

require_once "db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request."
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$name = trim($data["name"] ?? "");
$email = trim($data["email"] ?? "");
$phone = trim($data["phone"] ?? "");
$cart = $data["cart"] ?? [];

if ($name === "" || $email === "" || $phone === "") {
    echo json_encode([
        "success" => false,
        "message" => "Please complete all customer details."
    ]);
    exit;
}

if (empty($cart)) {
    echo json_encode([
        "success" => false,
        "message" => "Your cart is empty."
    ]);
    exit;
}

try {

    $conn->begin_transaction();

    /*  CREATE CUSTOMER*/

    $customerSQL = "
        INSERT INTO customers (name, email, phone)
        VALUES (?, ?, ?)
    ";

    $customerStmt = $conn->prepare($customerSQL);

    $customerStmt->bind_param(
        "sss",
        $name,
        $email,
        $phone
    );

    $customerStmt->execute();

    $customerId = $conn->insert_id;


    /* CREATE ORDE */

    $orderSQL = "
        INSERT INTO orders
        (customer_id, order_date, status)
        VALUES (?, CURDATE(), 'Pending')
    ";

    $orderStmt = $conn->prepare($orderSQL);

    $orderStmt->bind_param(
        "i",
        $customerId
    );

    $orderStmt->execute();

    $orderId = $conn->insert_id;


    /*  CREATE ORDER ITEMS */

    foreach ($cart as $item) {

        $productId = (int)($item["product_id"] ?? 0);
        $quantity = (int)($item["quantity"] ?? 0);

        if ($productId <= 0 || $quantity <= 0) {
            throw new Exception("Invalid product information.");
        }


        // Get REAL price from database

        $priceSQL = "
            SELECT price
            FROM products
            WHERE product_id = ?
        ";

        $priceStmt = $conn->prepare($priceSQL);

        $priceStmt->bind_param(
            "i",
            $productId
        );

        $priceStmt->execute();

        $result = $priceStmt->get_result();

        if ($result->num_rows === 0) {
            throw new Exception("Product not found.");
        }

        $product = $result->fetch_assoc();

        $price = (float)$product["price"];


        // Insert order item

        $itemSQL = "
            INSERT INTO order_items
            (order_id, product_id, quantity, price)
            VALUES (?, ?, ?, ?)
        ";

        $itemStmt = $conn->prepare($itemSQL);

        $itemStmt->bind_param(
            "iiid",
            $orderId,
            $productId,
            $quantity,
            $price
        );

        $itemStmt->execute();
    }


    /*EVERYTHING SUCCESSFUL*/

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Order placed successfully.",
        "order_id" => $orderId
    ]);

} catch (Exception $e) {

    $conn->rollback();

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}

?>