const bcrypt = require("bcryptjs");

const {
    getDatabase,
    createTables,
    saveDatabase
} = require("./database");

async function seed() {

    const db = await getDatabase();

    createTables();

    const password = await bcrypt.hash("123456", 10);

    /* USERS */

    db.run(
        `INSERT OR IGNORE INTO users
        (name, email, password, role)
        VALUES (?, ?, ?, ?)`,
        [
            "Customer One",
            "customer@gmail.com",
            password,
            "customer"
        ]
    );

    db.run(
        `INSERT OR IGNORE INTO users
        (name, email, password, role)
        VALUES (?, ?, ?, ?)`,
        [
            "Restaurant Owner",
            "owner@gmail.com",
            password,
            "owner"
        ]
    );

    db.run(
        `INSERT OR IGNORE INTO users
        (name, email, password, role)
        VALUES (?, ?, ?, ?)`,
        [
            "Delivery Partner",
            "delivery@gmail.com",
            password,
            "delivery"
        ]
    );

    db.run(
        `INSERT OR IGNORE INTO users
        (name, email, password, role)
        VALUES (?, ?, ?, ?)`,
        [
            "Admin",
            "admin@gmail.com",
            password,
            "admin"
        ]
    );

    const owner = db.exec(
        `SELECT id
         FROM users
         WHERE email = 'owner@gmail.com'`
    );

    const ownerId = owner[0].values[0][0];

    /* RESTAURANT */

    db.run(
        `INSERT INTO restaurants
        (name, address, owner_id)
        SELECT ?, ?, ?
        WHERE NOT EXISTS
        (
            SELECT 1
            FROM restaurants
            WHERE name = ?
        )`,
        [
            "Spicy Kitchen",
            "Vijayawada Main Road",
            ownerId,
            "Spicy Kitchen"
        ]
    );

    const restaurant = db.exec(
        `SELECT id
         FROM restaurants
         WHERE name = 'Spicy Kitchen'`
    );

    const restaurantId = restaurant[0].values[0][0];

    /* MENU */

    db.run(
        `INSERT INTO menu_items
        (restaurant_id, name, description, price, available)
        SELECT ?, ?, ?, ?, ?
        WHERE NOT EXISTS
        (
            SELECT 1
            FROM menu_items
            WHERE restaurant_id = ?
            AND name = ?
        )`,
        [
            restaurantId,
            "Chicken Biryani",
            "Delicious chicken biryani",
            180,
            1,
            restaurantId,
            "Chicken Biryani"
        ]
    );

    db.run(
        `INSERT INTO menu_items
        (restaurant_id, name, description, price, available)
        SELECT ?, ?, ?, ?, ?
        WHERE NOT EXISTS
        (
            SELECT 1
            FROM menu_items
            WHERE restaurant_id = ?
            AND name = ?
        )`,
        [
            restaurantId,
            "Veg Biryani",
            "Fresh vegetable biryani",
            140,
            1,
            restaurantId,
            "Veg Biryani"
        ]
    );

    db.run(
        `INSERT INTO menu_items
        (restaurant_id, name, description, price, available)
        SELECT ?, ?, ?, ?, ?
        WHERE NOT EXISTS
        (
            SELECT 1
            FROM menu_items
            WHERE restaurant_id = ?
            AND name = ?
        )`,
        [
            restaurantId,
            "Paneer Butter Masala",
            "Paneer cooked in rich gravy",
            160,
            1,
            restaurantId,
            "Paneer Butter Masala"
        ]
    );

    saveDatabase();

    console.log("Seed data inserted successfully");
}

seed();