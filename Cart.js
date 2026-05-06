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

const confirmOrderBtn = document.getElementById("confirm-order-btn");

if (confirmOrderBtn) {
  confirmOrderBtn.addEventListener("click", function() {
    cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    const isLoggedIn = sessionStorage.getItem("isLoggedIn");

    if (isLoggedIn === "true") {
      alert("Your order has been received");

      localStorage.removeItem("cart");
      cart = [];
      renderCart();
    } else {
      window.location.href = "login.html";
    }
  });
}

function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  if (!cartCount) return;

  const updatedCart = JSON.parse(localStorage.getItem("cart")) || [];
  cartCount.textContent = `(${updatedCart.length})`;
}

updateCartCount();