

    const productGrid = document.getElementById("produce-grid");
    const filterButtons = document.querySelectorAll(".filter-buttons button");
    const loadMoreBtn = document.getElementById("load-more-btn");

    let allProducts = [];
    let currentFilter = "all";
    let currentItems = 8;


    // CART
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const cartCounter = document.getElementById("cart-count");

    function updateCartCounter() {

        const cartCount = cart.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        if (cartCounter) {
            cartCounter.textContent = cartCount;
        }
    }

    updateCartCounter();


   
    // LOAD PRODUCTS FROM DATABASE
    fetch("php/products.php")

        .then(response => {

            if (!response.ok) {
                throw new Error("Could not load products.");
            }

            return response.json();
        })

        .then(products => {

            allProducts = products;

            displayProducts();

        })

        .catch(error => {

            console.error("Error loading products:", error);

            productGrid.innerHTML =
                "<p>Unable to load products.</p>";

        });


   
    // DISPLAY PRODUCTS
    function displayProducts() {

        productGrid.innerHTML = "";

        const filteredProducts = allProducts.filter(product => {

            if (currentFilter === "all") {
                return true;
            }

            return product.category.toLowerCase() === currentFilter;
        });


        const productsToShow =
            filteredProducts.slice(0, currentItems);


        productsToShow.forEach(product => {

            const card = document.createElement("div");

            card.classList.add(
                "produce-card",
                product.category.toLowerCase()
            );


            const stock = Number(product.quantity);

            const isInStock = stock > 0;

            const availability =
                isInStock
                    ? "In Stock"
                    : "Out of Stock";


            card.innerHTML = `

                <div class="produce-image">

                    <img
                        src="${product.image_url}"
                        alt="${product.product_name}"
                        loading="lazy"
                    >

                    <span class="tag">
                        ${product.category}
                    </span>

                </div>


                <div class="produce-content">

                    <div class="product-header">

                        <h3>
                            ${product.product_name}
                        </h3>

                        <span class="price">
                            R${Number(product.price).toFixed(2)}/${product.unit}
                        </span>

                    </div>


                    <p>
                        ${product.description}
                    </p>


                    <div class="stock-info">

                        <span class="availability ${isInStock ? "" : "out-of-stock"}">
                            ${availability}
                        </span>

                        <span class="quantity-left">
                            ${stock} ${product.unit} left
                        </span>

                    </div>


                    <div class="cart-section">

                        <div class="quantity-box">

                            <button class="minus">-</button>

                            <span class="quantity">1</span>

                            <button class="plus">+</button>

                        </div>


                        <button
                            class="basket-btn"
                            ${!isInStock ? "disabled" : ""}
                        >
                            ${isInStock ? "Add to Cart" : "Out of Stock"}
                        </button>

                    </div>

                </div>
            `;


          
            // QUANTITY BUTTONS
            const plusButton =
                card.querySelector(".plus");

            const minusButton =
                card.querySelector(".minus");

            const quantitySpan =
                card.querySelector(".quantity");


            plusButton.addEventListener("click", () => {

                let quantity =
                    Number(quantitySpan.textContent);


                if (quantity < stock) {

                    quantity++;

                    quantitySpan.textContent =
                        quantity;
                }

            });


            minusButton.addEventListener("click", () => {

                let quantity =
                    Number(quantitySpan.textContent);


                if (quantity > 1) {

                    quantity--;

                    quantitySpan.textContent =
                        quantity;
                }

            });


          
            // ADD TO CART

            const addButton =
                card.querySelector(".basket-btn");


            addButton.addEventListener("click", () => {

                const quantity =
                    Number(quantitySpan.textContent);


                const existingItem =
                    cart.find(
                        item =>
                        item.product_id ===
                        Number(product.product_id)
                    );


                if (existingItem) {

                    existingItem.quantity += quantity;

                } else {

                    cart.push({

                        product_id:
                            Number(product.product_id),

                        name:
                            product.product_name,

                        price:
                            `R${Number(product.price).toFixed(2)}/${product.unit}`,

                        quantity:
                            quantity

                    });

                }


                localStorage.setItem(
                    "cart",
                    JSON.stringify(cart)
                );


                updateCartCounter();

            });


            productGrid.appendChild(card);

        });



        // LOAD MORE BUTTON

        if (currentItems >= filteredProducts.length) {

            loadMoreBtn.style.display = "none";

        } else {

            loadMoreBtn.style.display = "inline-block";

        }

    }



    // FILTER BUTTONS
    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            filterButtons.forEach(btn =>
                btn.classList.remove("active")
            );


            button.classList.add("active");


            currentFilter =
                button.getAttribute("data-filter");


            currentItems = 8;


            displayProducts();

        });

    });


  
    // LOAD MORE
    loadMoreBtn.addEventListener("click", () => {

        currentItems += 8;

        displayProducts();

    });
