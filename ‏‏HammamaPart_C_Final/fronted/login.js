// This file manages user registration, login and profile editing via server communication.

// ─── REGISTER ────────────────────────────────────────────────────────────────

async function register() {
    const firstName = document.getElementById("first-name").value;
    const lastName  = document.getElementById("last-name").value;
    const email     = document.getElementById("register-email").value;
    const phone     = document.getElementById("phone").value;
    const address   = document.getElementById("address").value;
    const password  = document.getElementById("register-password").value;

    // Client-side validation
    if (!firstName || !lastName || !email || !phone || !address || !password) {
        alert("Please fill all fields");
        return;
    }

    if (!/^0\d{9}$/.test(phone)) {
        alert("Phone must be 10 digits and start with 0");
        return;
    }

    try {
        const response = await fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstName, lastName, email, phone, address, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        // Save user data to localStorage and mark as logged in
        localStorage.setItem("user", JSON.stringify({ firstName, lastName, email, phone, address, id: data.userId }));
        sessionStorage.setItem("isLoggedIn", "true");

        alert("Account created successfully!");
        const redirect = sessionStorage.getItem("redirectAfterLogin") || "Catalog.html";
        sessionStorage.removeItem("redirectAfterLogin");
        window.location.href = redirect;

    } catch (err) {
        alert("Server error during registration. Please try again.");
        console.error(err);
    }
}


// ─── LOGIN ───────────────────────────────────────────────────────────────────

async function login() {
    const email    = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        // Save user data to localStorage and mark as logged in
        localStorage.setItem("user", JSON.stringify(data.user));
        sessionStorage.setItem("isLoggedIn", "true");

        alert("Login successful!");
        const redirect = sessionStorage.getItem("redirectAfterLogin") || "Catalog.html";
        sessionStorage.removeItem("redirectAfterLogin");
        window.location.href = redirect;

    } catch (err) {
        alert("Server error during login. Please try again.");
        console.error(err);
    }
}


// ─── EDIT PROFILE ────────────────────────────────────────────────────────────

// Show the edit-profile form filled with the currently logged-in user's data
function showEditProfileForm() {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (!savedUser) return;

    document.getElementById("login-form").classList.add("hidden");
    document.getElementById("register-form").classList.add("hidden");
    document.getElementById("edit-profile-form").classList.remove("hidden");
    document.getElementById("page-title").textContent = "Edit Profile";

    document.getElementById("edit-first-name").value = savedUser.firstName || "";
    document.getElementById("edit-last-name").value  = savedUser.lastName  || "";
    document.getElementById("edit-email").value      = savedUser.email    || "";
    document.getElementById("edit-phone").value       = savedUser.phone    || "";
    document.getElementById("edit-address").value     = savedUser.address  || "";
}

// Submit the updated profile details to the server (PUT)
async function updateProfile() {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (!savedUser) {
        alert("You must be signed in to edit your profile.");
        return;
    }

    const firstName = document.getElementById("edit-first-name").value;
    const lastName  = document.getElementById("edit-last-name").value;
    const email     = document.getElementById("edit-email").value;
    const phone     = document.getElementById("edit-phone").value;
    const address   = document.getElementById("edit-address").value;

    // Client-side validation
    if (!firstName || !lastName || !email || !phone || !address) {
        alert("Please fill all fields");
        return;
    }

    if (!/^0\d{9}$/.test(phone)) {
        alert("Phone must be 10 digits and start with 0");
        return;
    }

    try {
        const response = await fetch("/user/" + savedUser.id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstName, lastName, email, phone, address })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        // Update the locally stored user with the fresh data from the server
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Profile updated successfully!");
        window.location.href = "Catalog.html";

    } catch (err) {
        alert("Server error while updating your profile. Please try again.");
        console.error(err);
    }
}


// ─── FORM EVENT LISTENERS ────────────────────────────────────────────────────

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

const editProfileForm = document.getElementById("edit-profile-form");
if (editProfileForm) {
    editProfileForm.addEventListener("submit", function(event) {
        event.preventDefault();
        updateProfile();
    });
}


// ─── NAVBAR ──────────────────────────────────────────────────────────────────

function updateCartCount() {
    const cartCount = document.getElementById("cart-count");
    if (!cartCount) return;
    const updatedCart = JSON.parse(localStorage.getItem("cart")) || [];
    cartCount.textContent = `(${updatedCart.length})`;
}

function updateNavbar() {
    const navSignIn    = document.getElementById("nav-sign-in");
    const navUserInfo  = document.getElementById("nav-user-info");
    const navUserName  = document.getElementById("nav-user-name");
    const navLogoutBtn = document.getElementById("nav-logout-btn");

    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    const savedUser  = JSON.parse(localStorage.getItem("user"));

    if (isLoggedIn === "true" && savedUser) {
        navSignIn.classList.add("hidden");
        navUserInfo.classList.remove("hidden");
        navUserName.textContent = "👤 Hello, " + savedUser.firstName;

        // Clicking the name opens the edit-profile form (only relevant on the login page)
        navUserName.addEventListener("click", function() {
            if (document.getElementById("edit-profile-form")) {
                showEditProfileForm();
            } else {
                window.location.href = "login.html#edit";
            }
        });
    } else {
        navSignIn.classList.remove("hidden");
        navUserInfo.classList.add("hidden");
    }

    if (navLogoutBtn) {
        navLogoutBtn.addEventListener("click", function() {
            sessionStorage.removeItem("isLoggedIn");
            localStorage.removeItem("cart");
            window.location.href = "home.html";
        });
    }
}

const showRegisterBtn = document.getElementById("show-register-btn");
if (showRegisterBtn) {
    showRegisterBtn.addEventListener("click", function() {
        document.getElementById("login-form").classList.add("hidden");
        document.getElementById("register-form").classList.remove("hidden");
        document.getElementById("page-title").textContent = "Register";
    });
}

updateCartCount();
updateNavbar();

// If the user arrived via the "#edit" link from another page, open the edit form directly
if (window.location.hash === "#edit") {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (isLoggedIn === "true") {
        showEditProfileForm();
    }
}
