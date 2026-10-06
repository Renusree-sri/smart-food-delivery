const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

let db;

const dbPath = path.join(__dirname, "food_delivery.sqlite");

async function getDatabase() {
    if (db) {
        return db;
    }

    const SQL = await initSqlJs();

    if (fs.existsSync(dbPath)) {
        const file = fs.readFileSync(dbPath);
        db = new SQL.Database(file);
    } else {
        db = new SQL.Database();
        createTables();
        saveDatabase();
    }

    return db;
}

function createTables() {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'customer',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS restaurants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            owner_id INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(owner_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS menu_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            restaurant_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            available INTEGER DEFAULT 1,
            FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
        );

        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            restaurant_id INTEGER NOT NULL,
            total_amount REAL NOT NULL,
            status TEXT DEFAULT 'Placed',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
        );

        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            menu_item_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY(order_id) REFERENCES orders(id),
            FOREIGN KEY(menu_item_id) REFERENCES menu_items(id)
        );

        CREATE TABLE IF NOT EXISTS deliveries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER UNIQUE NOT NULL,
            delivery_partner_id INTEGER,
            status TEXT DEFAULT 'Pending',
            assigned_at TEXT,
            FOREIGN KEY(order_id) REFERENCES orders(id),
            FOREIGN KEY(delivery_partner_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER UNIQUE NOT NULL,
            user_id INTEGER NOT NULL,
            restaurant_id INTEGER NOT NULL,
            rating INTEGER NOT NULL,
            comment TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(order_id) REFERENCES orders(id),
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
        );

        CREATE TABLE IF NOT EXISTS order_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            status TEXT NOT NULL,
            changed_by INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(order_id) REFERENCES orders(id),
            FOREIGN KEY(changed_by) REFERENCES users(id)
        );
    `);
}

function saveDatabase() {
    if (!db) return;

    const data = db.export();

    fs.writeFileSync(dbPath, Buffer.from(data));
}

module.exports = {
    getDatabase,
    createTables,
    saveDatabase
};