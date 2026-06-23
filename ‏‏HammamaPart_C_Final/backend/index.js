// This is the main server file. It sets up Express, defines all routes and starts the server.
var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
const CRUD_functions = require("./CRUD_functions.js");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS, images) from the fronted folder
app.use(express.static(path.join(__dirname, "..", "fronted")));


// ─── PAGE ROUTES ─────────────────────────────────────────────────────────────

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "fronted", "home.html"));
});

// Catalog page
app.get("/catalog", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "fronted", "Catalog.html"));
});

// Cart page
app.get("/cart", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "fronted", "Cart.html"));
});

// Login page
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "fronted", "login.html"));
});


// ─── USER ROUTES ─────────────────────────────────────────────────────────────

// Register a new user
app.post("/register", CRUD_functions.registerUser);

// Login an existing user
app.post("/login", CRUD_functions.loginUser);

// Update an existing user's profile (e.g. name, email, phone, address)
app.put("/user/:id", CRUD_functions.updateUser);


// ─── ORDER ROUTES ─────────────────────────────────────────────────────────────

// Create a new order
app.post("/order", CRUD_functions.createOrder);

// Get all orders for a specific user
app.get("/orders", CRUD_functions.getOrdersByUser);

// Get all items for a specific order
app.get("/order-items", CRUD_functions.getOrderItems);


// ─── PRODUCT ROUTES ───────────────────────────────────────────────────────────

// Get all products (optionally filtered by category, e.g. /products?category=fruits)
app.get("/products", CRUD_functions.getProducts);


// ─── SERVER START ─────────────────────────────────────────────────────────────

app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});
