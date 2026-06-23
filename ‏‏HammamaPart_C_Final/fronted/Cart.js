// This file manages the shopping cart, quantity updates, checkout validation and order simulation.
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function renderCart() {
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    cartTotal.textContent = "0";
    updateCartCount();
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-img">
      <div>
        <h3>${item.name}</h3>
        <p>Quantity: ${item.quantity} ${item.unit}</p>
        <p>Price: ₪${item.price}</p>
        <p>Subtotal: ₪${itemTotal.toFixed(2)}</p>
        <button class="minus-btn">-</button>
        <button class="plus-btn">+</button>
        <button class="remove-btn">Remove</button>
      </div>
    `;

    const minusBtn = div.querySelector(".minus-btn");
    const plusBtn = div.querySelector(".plus-btn");
    const removeBtn = div.querySelector(".remove-btn");

    const step = item.unit === "kg" ? 0.5 : 1;

    plusBtn.addEventListener("click", () => {
      item.quantity += step;
      saveCart();
      renderCart();
    });

    minusBtn.addEventListener("click", () => {
      if (item.quantity > step) {
        item.quantity -= step;
      } else {
        cart.splice(index, 1);
      }
      saveCart();
      renderCart();
    });

    removeBtn.addEventListener("click", () => {
      cart.splice(index, 1);
      saveCart();
      renderCart();
    });

    cartItemsContainer.appendChild(div);
  });

  cartTotal.textContent = total.toFixed(2);
  updateCartCount();
}

renderCart();

// Show or hide the order form
function showOrderForm() {
  const orderForm = document.getElementById("order-form-section");
  const savedUser = JSON.parse(localStorage.getItem("user"));

  // Pre-fill fields from registered user data if available
  if (savedUser) {
    const addressField = document.getElementById("order-address");
    if (addressField && savedUser.address) {
      addressField.value = savedUser.address;
    }
  }

  orderForm.classList.remove("hidden");
  orderForm.scrollIntoView({ behavior: "smooth" });
}

const confirmOrderBtn = document.getElementById("confirm-order-btn");

if (confirmOrderBtn) {
  confirmOrderBtn.addEventListener("click", function () {
    cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    const isLoggedIn = sessionStorage.getItem("isLoggedIn");

    if (isLoggedIn !== "true") {
      sessionStorage.setItem("redirectAfterLogin", "Cart.html");
      window.location.href = "login.html";
      return;
    }

    showOrderForm();
  });
}

// Handle final order submission from the order form
const submitOrderBtn = document.getElementById("submit-order-btn");

if (submitOrderBtn) {
    submitOrderBtn.addEventListener("click", async function() {
        const address = document.getElementById("order-address").value.trim();
        const city    = document.getElementById("order-city").value.trim();
        const zip     = document.getElementById("order-zip").value.trim();
        const notes   = document.getElementById("order-notes").value.trim();

        // Client-side validation
        if (!address || !city || !zip) {
            alert("Please fill in all delivery details.");
            return;
        }

        const savedUser   = JSON.parse(localStorage.getItem("user"));
        const currentCart = JSON.parse(localStorage.getItem("cart")) || [];
        const totalPrice  = currentCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const orderData = {
            userId: savedUser ? savedUser.id : null,
            address,
            city,
            zip,
            notes,
            items: currentCart,
            totalPrice: parseFloat(totalPrice.toFixed(2))
        };

        try {
            const response = await fetch("/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (!response.ok) {
                alert("Error placing order: " + data.message);
                return;
            }

            alert("Your order has been received! It will be delivered to: " + address + ", " + city);
            localStorage.removeItem("cart");
            cart = [];
            document.getElementById("order-form-section").classList.add("hidden");
            renderCart();

        } catch (err) {
            alert("Server error. Please try again.");
            console.error(err);
        }
    });
}

function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  if (!cartCount) return;

  const updatedCart = JSON.parse(localStorage.getItem("cart")) || [];
  cartCount.textContent = `(${updatedCart.length})`;
}

// Update confirm order button text based on login state
function updateConfirmBtn() {
  const btn = document.getElementById("confirm-order-btn");
  if (!btn) return;

  const isLoggedIn = sessionStorage.getItem("isLoggedIn");
  if (isLoggedIn !== "true") {
    btn.textContent = "Sign in to Complete Order";
  } else {
    btn.textContent = "Confirm Order";
  }
}

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

updateCartCount();
updateConfirmBtn();
updateNavbar();
