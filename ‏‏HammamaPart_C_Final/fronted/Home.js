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

updateCartCount();
updateNavbar();
