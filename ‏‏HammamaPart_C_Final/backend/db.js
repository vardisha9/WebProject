// This file creates and exports the MySQL database connection.
const mysql = require("mysql2");
const dbConfig = require("./db.config.js");

// Create a connection to the database
const connection = mysql.createConnection({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB
});

// Open the MySQL connection
connection.connect(error => {
    if (error) {
        console.log("DB connection error: ", error.message);
        return;
    }
    console.log(`Successfully connected to the database: ${dbConfig.DB}.`);
});

module.exports = connection;