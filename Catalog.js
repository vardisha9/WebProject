// This file manages the product catalog, quantity selection, cart updates, search functionality and localStorage.
const products = document.querySelectorAll(".product-card");

// Load existing cart from localStorage or create an empty cart
let cart = JSON.parse(localStorage.getItem("cart")) || [];

products.forEach(product => {
  const minusBtn = product.querySelector(".quantity-control button:first-child");
  const plusBtn = product.querySelector(".quantity-control button:last-child");
  const quantitySpan = product.querySelector(".quantity-control span");
  const addToCartBtn = product.querySelector(".product-card > button");

  const name = product.querySelector("h4").textContent;
  const priceText = product.querySelector("p:nth-of-type(2)").textContent;
  const image = product.querySelector("img").src;

  let step = 1;
  let unit = "";

  if (priceText.includes("kg")) {
    step = 0.5;
    unit = "kg";
  } else if (priceText.includes("bunch")) {
    step = 1;
    unit = "bunch";
  } else if (priceText.includes("box")) {
    step = 1;
    unit = "box";
  }

  let quantity = step;

  // Increase quantity
  plusBtn.addEventListener("click", () => {
    quantity += step;
    quantitySpan.textContent = quantity + " " + unit;
  });

  // Decrease quantity
  minusBtn.addEventListener("click", () => {
    if (quantity > step) {
      quantity -= step;
      quantitySpan.textContent = quantity + " " + unit;
    }
  });

  // 🛒 Add to Cart
  addToCartBtn.addEventListener("click", () => {

    const existingProduct = cart.find(item => item.name === name);

    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.push({
        name: name,
        quantity: quantity,
        unit: unit,
        price: parseFloat(priceText.replace("₪", "")),
        image: image
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
  });
});

// update counter
function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  if (!cartCount) return;

  const updatedCart = JSON.parse(localStorage.getItem("cart")) || [];
  cartCount.textContent = `(${updatedCart.length})`;
}

// Run when the page loads
updateCartCount();

const searchInput = document.getElementById("search-input");

if (searchInput) {
  searchInput.addEventListener("input", function () {
    const searchValue = searchInput.value.toLowerCase();

    products.forEach(product => {
      const productName = product.querySelector("h4").textContent.toLowerCase();

      if (productName.includes(searchValue)) {
        product.style.display = "block";
      } else {
        product.style.display = "none";
      }
    });
  });
}