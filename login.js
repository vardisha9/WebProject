// This file manages user registration, login validation and localStorage-based session simulation.
function register() {

    const firstName = document.getElementById("first-name").value;
    const lastName = document.getElementById("last-name").value;
    const email = document.getElementById("register-email").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
    const password = document.getElementById("register-password").value;

    // validation
    if (!firstName || !lastName || !email || !phone || !address || !password) {
        alert("Please fill all fields");
        return;
    }

    if (!/^0\d{9}$/.test(phone)) {
        alert("Phone must be 10 digits and start with 0");
        return;
    }

    const user = {
        firstName,
        lastName,
        email,
        phone,
        address,
        password
    };

    localStorage.setItem("user", JSON.stringify(user));
    sessionStorage.setItem("isLoggedIn", "true");

    alert("Account created successfully!");
    window.location.href = "catalog.html";
}

function login() {

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (!savedUser) {
        alert("No user found, please register");
        return;
    }

    if (email === savedUser.email && password === savedUser.password) {
        sessionStorage.setItem("isLoggedIn", "true");
        alert("Login successful!");
        window.location.href = "catalog.html";
    } else {
        alert("Wrong email or password");
    }
}

const registerForm = document.getElementById("register-form");

if (registerForm) {
    registerForm.addEventListener("submit", function(event) {
        event.preventDefault();
        register();
    });
}

const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", function(event) {
    event.preventDefault();
    login();
  });
}

function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  if (!cartCount) return;

  const updatedCart = JSON.parse(localStorage.getItem("cart")) || [];
  cartCount.textContent = `(${updatedCart.length})`;
}

updateCartCount();

const showRegisterBtn = document.getElementById("show-register-btn");

if (showRegisterBtn) {
  showRegisterBtn.addEventListener("click", function() {
    document.getElementById("login-form").classList.add("hidden");
    document.getElementById("register-form").classList.remove("hidden");
    document.querySelector("h1").textContent = "Register";
  });
}