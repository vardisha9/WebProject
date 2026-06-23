// This file contains all CRUD functions for handling client requests.
const sql = require("./db.js");


// ─── USERS ───────────────────────────────────────────────────────────────────

// Register a new user
const registerUser = function(req, res) {
    const { firstName, lastName, email, phone, address, password } = req.body;

    // Server-side validation
    if (!firstName || !lastName || !email || !phone || !address || !password) {
        res.status(400).send({ message: "All fields are required." });
        return;
    }

    if (!/^0\d{9}$/.test(phone)) {
        res.status(400).send({ message: "Phone must be 10 digits and start with 0." });
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).send({ message: "Invalid email format." });
        return;
    }

    // Check if email already exists
    sql.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) {
            res.status(500).send({ message: "Error checking email: " + err });
            return;
        }
        if (results.length > 0) {
            res.status(400).send({ message: "Email already registered." });
            return;
        }

        // Insert new user
        const newUser = { first_name: firstName, last_name: lastName, email, phone, address, password };
        sql.query("INSERT INTO users SET ?", newUser, (err, result) => {
            if (err) {
                res.status(500).send({ message: "Error creating user: " + err });
                return;
            }
            console.log("Registered new user, ID: ", result.insertId);
            res.send({ message: "Account created successfully!", userId: result.insertId });
        });
    });
};


// Login an existing user
const loginUser = function(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).send({ message: "Email and password are required." });
        return;
    }

    sql.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, results) => {
        if (err) {
            res.status(500).send({ message: "Error during login: " + err });
            return;
        }
        if (results.length === 0) {
            res.status(401).send({ message: "Wrong email or password." });
            return;
        }

        const user = results[0];
        console.log("User logged in: ", user.email);
        res.send({
            message: "Login successful!",
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                phone: user.phone,
                address: user.address
            }
        });
    });
};


// Update an existing user's profile details
const updateUser = function(req, res) {
    const userId = req.params.id;
    const { firstName, lastName, email, phone, address } = req.body;

    if (!userId) {
        res.status(400).send({ message: "User id is required." });
        return;
    }

    // Server-side validation
    if (!firstName || !lastName || !email || !phone || !address) {
        res.status(400).send({ message: "All fields are required." });
        return;
    }

    if (!/^0\d{9}$/.test(phone)) {
        res.status(400).send({ message: "Phone must be 10 digits and start with 0." });
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).send({ message: "Invalid email format." });
        return;
    }

    // Make sure the new email isn't already used by a different user
    sql.query("SELECT * FROM users WHERE email = ? AND id != ?", [email, userId], (err, results) => {
        if (err) {
            res.status(500).send({ message: "Error checking email: " + err });
            return;
        }
        if (results.length > 0) {
            res.status(400).send({ message: "Email already used by another account." });
            return;
        }

        const updatedUser = { first_name: firstName, last_name: lastName, email, phone, address };

        sql.query("UPDATE users SET ? WHERE id = ?", [updatedUser, userId], (err, result) => {
            if (err) {
                res.status(500).send({ message: "Error updating user: " + err });
                return;
            }
            if (result.affectedRows === 0) {
                res.status(404).send({ message: "User not found." });
                return;
            }
            console.log("Updated user, ID: ", userId);
            res.send({
                message: "Profile updated successfully!",
                user: { id: Number(userId), firstName, lastName, email, phone, address }
            });
        });
    });
};


// ─── ORDERS ──────────────────────────────────────────────────────────────────

// Create a new order with its items
const createOrder = function(req, res) {
    const { userId, address, city, zip, notes, items, totalPrice } = req.body;

    // Server-side validation
    if (!userId || !address || !city || !zip || !items || items.length === 0) {
        res.status(400).send({ message: "Missing required order fields." });
        return;
    }

    if (isNaN(totalPrice) || totalPrice <= 0) {
        res.status(400).send({ message: "Invalid total price." });
        return;
    }

    // Insert the order
    const newOrder = {
        user_id: userId,
        delivery_address: address,
        delivery_city: city,
        delivery_zip: zip,
        notes: notes || "",
        total_price: totalPrice
    };

    sql.query("INSERT INTO orders SET ?", newOrder, (err, orderResult) => {
        if (err) {
            res.status(500).send({ message: "Error creating order: " + err });
            return;
        }

        const orderId = orderResult.insertId;

        // Insert each order item
        const itemValues = items.map(item => [orderId, item.name, item.quantity, item.unit, item.price]);

        sql.query("INSERT INTO order_items (order_id, product_name, quantity, unit, price) VALUES ?", [itemValues], (err) => {
            if (err) {
                res.status(500).send({ message: "Error saving order items: " + err });
                return;
            }
            console.log("Order created, ID: ", orderId);
            res.send({ message: "Order placed successfully!", orderId });
        });
    });
};


// Get all orders for a specific user
const getOrdersByUser = function(req, res) {
    const userId = req.query.userId;

    if (!userId) {
        res.status(400).send({ message: "userId is required." });
        return;
    }

    sql.query("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", [userId], (err, orders) => {
        if (err) {
            res.status(500).send({ message: "Error fetching orders: " + err });
            return;
        }
        console.log("Fetched orders for user: ", userId);
        res.send(orders);
    });
};


// Get all items for a specific order
const getOrderItems = function(req, res) {
    const orderId = req.query.orderId;

    if (!orderId) {
        res.status(400).send({ message: "orderId is required." });
        return;
    }

    sql.query("SELECT * FROM order_items WHERE order_id = ?", [orderId], (err, items) => {
        if (err) {
            res.status(500).send({ message: "Error fetching order items: " + err });
            return;
        }
        console.log("Fetched items for order: ", orderId);
        res.send(items);
    });
};


// ─── PRODUCTS ────────────────────────────────────────────────────────────────

// Get all products, optionally filtered by category
const getProducts = function(req, res) {
    const category = req.query.category;

    let query = "SELECT * FROM products";
    const params = [];

    if (category) {
        query += " WHERE category = ?";
        params.push(category);
    }

    sql.query(query, params, (err, products) => {
        if (err) {
            res.status(500).send({ message: "Error fetching products: " + err });
            return;
        }
        console.log("Fetched " + products.length + " products.");
        res.send(products);
    });
};


// ─── EXPORTS ─────────────────────────────────────────────────────────────────

module.exports = { registerUser, loginUser, updateUser, createOrder, getOrdersByUser, getOrderItems, getProducts };
