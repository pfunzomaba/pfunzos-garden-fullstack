const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const checkoutItems = document.getElementById("checkout-items");
    const subtotalElement = document.getElementById("checkout-subtotal");
    const shippingElement = document.getElementById("checkout-shipping");
    const totalElement = document.getElementById("checkout-total");
    const totalFormElement = document.getElementById("checkout-total-form");
    const backToCart = document.getElementById("back-to-cart");
    const checkoutForm = document.getElementById("checkout-form");

    const shippingCost = 35;
    let subtotal = 0;

    if (cart.length === 0) {
        checkoutItems.innerHTML = "<p class='empty-cart-message'>Your cart is empty.</p>";
        shippingElement.textContent = "R0.00";
    } else {
        cart.forEach(item => {
            const price = parseFloat((item.price || "0").toString().replace(/[^0-9.]/g, "")) || 0;
            const itemTotal = price * (item.quantity || 1);
            subtotal += itemTotal;

            checkoutItems.innerHTML += `
                <div class="checkout-item">
                    <div class="checkout-item-details">
                        <span class="checkout-item-name">${item.name}</span>
                        <span class="checkout-item-meta">Qty: ${item.quantity}</span>
                    </div>
                    <span class="checkout-item-price">R${itemTotal.toFixed(2)}</span>
                </div>
            `;
        });

        shippingElement.textContent = `R${shippingCost.toFixed(2)}`;
    }

    subtotalElement.textContent = `R${subtotal.toFixed(2)}`;

    const orderTotal = subtotal + (cart.length ? shippingCost : 0);
    const formattedTotal = `R${orderTotal.toFixed(2)}`;
    totalElement.textContent = formattedTotal;
    if (totalFormElement) {
        totalFormElement.textContent = formattedTotal;
    }

    if (backToCart) {
        backToCart.addEventListener("click", () => {
            window.location.href = "cart.html";
        });
    }

    if (checkoutForm) {
        checkoutForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            if (cart.length === 0) {
                alert("Your cart is empty.");
                return;
            }

            const customerData = {
                name: document.getElementById("customer-name").value.trim(),
                email: document.getElementById("customer-email").value.trim(),
                phone: document.getElementById("customer-phone").value.trim(),
                cart: cart
            };

            try {
                const response = await fetch("php/place_order.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(customerData)
                });

                const result = await response.json();

                if (result.success) {
                    localStorage.removeItem("cart");
                    window.location.href = "checkout-success.html?order_id=" + encodeURIComponent(result.order_id || "");
                } else {
                    alert("Unable to place order:\n" + result.message);
                }
            } catch (error) {
                console.error("Order error:", error);
                alert("There was a problem connecting to the server.");
            }
        });
    }