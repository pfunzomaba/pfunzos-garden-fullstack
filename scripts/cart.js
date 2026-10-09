
(async function(){
        // load cart from server session or fallback to localStorage
        let cart = [];

        async function loadCart() {
            try {
                const res = await fetch('php/get_cart.php');
                if (res.ok) {
                    const serverCart = await res.json();
                    if (Array.isArray(serverCart) && serverCart.length) {
                        cart = serverCart;
                        localStorage.setItem('cart', JSON.stringify(cart));
                        return;
                    }
                }
            } catch (e) {
                console.warn('Could not load server cart', e);
            }

            cart = JSON.parse(localStorage.getItem('cart')) || [];
        }

        await loadCart();

        const cartItems = document.getElementById("cart-items");
        const continueBtn = document.getElementById("continue-shopping");
        const emptyBtn = document.getElementById("empty-cart");
        const checkoutButton = document.getElementById("checkout");

      

        const subtotalElement = document.getElementById("subtotal");
        const shippingElement = document.getElementById("shipping-amount");
        const totalElement = document.getElementById("total");

        const shippingCost = 35;
        let subtotal = 0;

        /* DISPLAY CART */
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-cart">Your cart is empty. Add items from the Harvest page.</td>
                </tr>
            `;
            shippingElement.textContent = "R0.00";
        } else {
            cart.forEach(item => {
                const itemPrice = parseFloat((item.price || '').toString().replace(/[^0-9.]/g, "")) || 0;
                const itemTotal = itemPrice * item.quantity;
                subtotal += itemTotal;
                cartItems.innerHTML += `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.price}</td>
                        <td>${item.quantity}</td>
                        <td>R${itemTotal.toFixed(2)}</td>
                    </tr>
                `;
            });
            shippingElement.textContent = `R${shippingCost.toFixed(2)}`;
        }

        /* TOTALS */
        subtotalElement.textContent = `R${subtotal.toFixed(2)}`;
        totalElement.textContent = `R${(subtotal + (cart.length ? shippingCost : 0)).toFixed(2)}`;

        /* CONTINUE SHOPPING */
        continueBtn.addEventListener("click", () => { window.location.href = "products.html"; });

        /* EMPTY CART */
        emptyBtn.addEventListener("click", async () => {
            if (cart.length === 0) { alert("Your cart is already empty."); return; }
            if (confirm("Empty the cart? This will remove all items.")) {
                try { await fetch('php/clear_cart.php', { method: 'POST' }); } catch (e) { console.warn(e); }
                localStorage.removeItem("cart");
                window.location.reload();
            }
        });

        /* CHECKOUT */
        checkoutButton.addEventListener("click", () => {
            console.log('checkout clicked');
            if (cart.length === 0) { alert("Your cart is empty. Add some items before checkout."); return; }
            window.location.href = 'checkout.html';
        });
    })();