// This file fetches products from the server, renders them, and manages quantity selection, cart updates, search functionality and localStorage.

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Determine the step size and unit label shown in the quantity control
function getStepAndUnit(unit) {
    if (unit === "kg") return { step: 0.5, label: "kg" };
    if (unit === "bunch") return { step: 1, label: "bunch" };
    if (unit === "box") return { step: 1, label: "box" };
    return { step: 1, label: unit };
}

// Build a single product card element from a product object returned by the server
function createProductCard(product) {
    const { step, label } = getStepAndUnit(product.unit);
    let quantity = step;

    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h4>${product.name}</h4>
        <p>Category: ${formatCategoryLabel(product.category)}</p>
        <p>₪${Number(product.price).toFixed(2)} / ${label}</p>
        <div class="quantity-control">
            <button type="button" class="minus-btn">-</button>
            <span class="quantity-display">${quantity} ${label}</span>
            <button type="button" class="plus-btn">+</button>
        </div>
        <button type="button" class="add-to-cart-btn">Add to Cart</button>
    `;

    const minusBtn = card.querySelector(".minus-btn");
    const plusBtn = card.querySelector(".plus-btn");
    const quantitySpan = card.querySelector(".quantity-display");
    const addToCartBtn = card.querySelector(".add-to-cart-btn");

    plusBtn.addEventListener("click", () => {
        quantity += step;
        quantitySpan.textContent = quantity + " " + label;
    });

    minusBtn.addEventListener("click", () => {
        if (quantity > step) {
            quantity -= step;
            quantitySpan.textContent = quantity + " " + label;
        }
    });

    // Add to Cart — open to all users, login required only at checkout
    addToCartBtn.addEventListener("click", () => {
        const existingProduct = cart.find(item => item.name === product.name);

        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            cart.push({
                name: product.name,
                quantity: quantity,
                unit: label,
                price: Number(product.price),
                image: card.querySelector("img").src
            });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
        showToast(product.name + " added to cart ✓");
    });

    return card;
}

// Turn a category slug like "seasonal-specials" into a readable label
function formatCategoryLabel(category) {
    return category
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

// Fetch all products from the server and place each one in its matching category grid
async function loadProducts() {
    try {
        const response = await fetch("/products");

        if (!response.ok) {
            console.error("Failed to load products.");
            return;
        }

        const products = await response.json();

        products.forEach(product => {
            const grid = document.querySelector(`.products-grid[data-category="${product.category}"]`);
            if (grid) {
                grid.appendChild(createProductCard(product));
            }
        });

        attachSearchListener();

    } catch (err) {
        console.error("Error fetching products: ", err);
    }
}


// Show a toast notification that disappears after 2.5 seconds
function showToast(message) {
    const toast = document.getElementById("cart-toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// update counter
function updateCartCount() {
    const cartCount = document.getElementById("cart-count");
    if (!cartCount) return;

    const updatedCart = JSON.parse(localStorage.getItem("cart")) || [];
    cartCount.textContent = `(${updatedCart.length})`;
}

// Update navbar based on login state
function updateNavbar() {
    const navSignIn = document.getElementById("nav-sign-in");
    const navUserInfo = document.getElementById("nav-user-info");
    const navUserName = document.getElementById("nav-user-name");
    const navLogoutBtn = document.getElementById("nav-logout-btn");

    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (isLoggedIn === "true" && savedUser) {
        navSignIn.classList.add("hidden");
        navUserInfo.classList.remove("hidden");
        navUserName.textContent = "👤 Hello, " + savedUser.firstName;

        // Clicking the name opens the profile editing form on the login page
        navUserName.addEventListener("click", function () {
            window.location.href = "login.html#edit";
        });
    } else {
        navSignIn.classList.remove("hidden");
        navUserInfo.classList.add("hidden");
    }

    if (navLogoutBtn) {
        navLogoutBtn.addEventListener("click", function () {
            sessionStorage.removeItem("isLoggedIn");
            localStorage.removeItem("cart");
            window.location.href = "home.html";
        });
    }
}

// Search filters the already-rendered product cards by name
function attachSearchListener() {
    const searchInput = document.getElementById("search-input");
    if (!searchInput) return;

    searchInput.addEventListener("input", function () {
        const searchValue = searchInput.value.toLowerCase();
        const allCards = document.querySelectorAll(".product-card");

        allCards.forEach(card => {
            const productName = card.querySelector("h4").textContent.toLowerCase();
            card.style.display = productName.includes(searchValue) ? "block" : "none";
        });
    });
}

// Run when the page loads
updateCartCount();
updateNavbar();
loadProducts();
