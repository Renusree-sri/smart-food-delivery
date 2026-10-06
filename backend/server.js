const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const {
    getDatabase,
    createTables,
    saveDatabase
} = require("./database");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "food_delivery_secret_123";

let database;

async function startDatabase() {
    database = await getDatabase();
    createTables();
}

function auth(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({
            message: "Login required"
        });
    }

    try {
        const actualToken = token.replace("Bearer ", "");

        const user = jwt.verify(actualToken, JWT_SECRET);

        req.user = user;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
}

function roleCheck(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        next();
    };
}

function getRows(query, params = []) {
    const result = database.exec(query, params);

    if (!result.length) {
        return [];
    }

    const columns = result[0].columns;
    const values = result[0].values;

    return values.map(row => {
        const object = {};

        columns.forEach((column, index) => {
            object[column] = row[index];
        });

        return object;
    });
}

function save() {
    saveDatabase();
}

/* HOME */

app.get("/", (req, res) => {
    res.json({
        message: "Smart Food Delivery API is running"
    });
});

/* REGISTER */

app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existing = getRows(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        let userRole = role || "customer";

        if (!["customer", "owner", "delivery", "admin"].includes(userRole)) {
            userRole = "customer";
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        database.run(
            `INSERT INTO users
            (name, email, password, role)
            VALUES (?, ?, ?, ?)`,
            [
                name,
                email,
                hashedPassword,
                userRole
            ]
        );

        save();

        res.json({
            message: "Registration successful"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

/* LOGIN */

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const users = getRows(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!validPassword) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

/* RESTAURANTS */

app.get("/api/restaurants", async (req, res) => {
    try {
        const restaurants = getRows(`
            SELECT
                r.id,
                r.name,
                r.address,
                u.name AS owner_name
            FROM restaurants r
            LEFT JOIN users u
            ON r.owner_id = u.id
            ORDER BY r.id DESC
        `);

        res.json(restaurants);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

app.post(
    "/api/restaurants",
    auth,
    roleCheck("owner", "admin"),
    async (req, res) => {

        try {
            const { name, address } = req.body;

            if (!name || !address) {
                return res.status(400).json({
                    message: "Restaurant name and address are required"
                });
            }

            database.run(
                `INSERT INTO restaurants
                (name, address, owner_id)
                VALUES (?, ?, ?)`,
                [
                    name,
                    address,
                    req.user.id
                ]
            );

            save();

            res.json({
                message: "Restaurant created successfully"
            });

        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }
);

/* MENU */

app.get("/api/restaurants/:id/menu", async (req, res) => {
    try {
        const menu = getRows(
            `SELECT *
             FROM menu_items
             WHERE restaurant_id = ?
             ORDER BY id DESC`,
            [req.params.id]
        );

        res.json(menu);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

app.post(
    "/api/restaurants/:id/menu",
    auth,
    roleCheck("owner", "admin"),
    async (req, res) => {

        try {
            const {
                name,
                description,
                price,
                available
            } = req.body;

            if (!name || !price) {
                return res.status(400).json({
                    message: "Name and price are required"
                });
            }

            database.run(
                `INSERT INTO menu_items
                (restaurant_id, name, description, price, available)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    req.params.id,
                    name,
                    description || "",
                    Number(price),
                    available === false ? 0 : 1
                ]
            );

            save();

            res.json({
                message: "Menu item added"
            });

        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }
);

/* UPDATE MENU AVAILABILITY */

app.put(
    "/api/menu/:id",
    auth,
    roleCheck("owner", "admin"),
    async (req, res) => {

        try {
            const { available } = req.body;

            database.run(
                `UPDATE menu_items
                 SET available = ?
                 WHERE id = ?`,
                [
                    available ? 1 : 0,
                    req.params.id
                ]
            );

            save();

            res.json({
                message: "Menu item updated"
            });

        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }
);

/* CREATE ORDER */

app.post("/api/orders", auth, roleCheck("customer"), async (req, res) => {
    try {
        const {
            restaurant_id,
            items
        } = req.body;

        if (!restaurant_id || !items || items.length === 0) {
            return res.status(400).json({
                message: "Restaurant and items are required"
            });
        }

        let total = 0;
        const checkedItems = [];

        for (const item of items) {

            const menu = getRows(
                `SELECT *
                 FROM menu_items
                 WHERE id = ?
                 AND restaurant_id = ?`,
                [
                    item.menu_item_id,
                    restaurant_id
                ]
            );

            if (menu.length === 0) {
                return res.status(400).json({
                    message: "Food item not found"
                });
            }

            if (menu[0].available !== 1) {
                return res.status(400).json({
                    message: menu[0].name + " is currently unavailable"
                });
            }

            const quantity = Number(item.quantity);

            if (quantity <= 0) {
                return res.status(400).json({
                    message: "Invalid quantity"
                });
            }

            total += menu[0].price * quantity;

            checkedItems.push({
                id: menu[0].id,
                price: menu[0].price,
                quantity
            });
        }

        database.run(
            `INSERT INTO orders
            (user_id, restaurant_id, total_amount, status)
            VALUES (?, ?, ?, 'Placed')`,
            [
                req.user.id,
                restaurant_id,
                total
            ]
        );

        const orderResult = getRows(
            `SELECT id
             FROM orders
             WHERE user_id = ?
             ORDER BY id DESC
             LIMIT 1`,
            [req.user.id]
        );

        const orderId = orderResult[0].id;

        for (const item of checkedItems) {
            database.run(
                `INSERT INTO order_items
                (order_id, menu_item_id, quantity, price)
                VALUES (?, ?, ?, ?)`,
                [
                    orderId,
                    item.id,
                    item.quantity,
                    item.price
                ]
            );
        }

        database.run(
            `INSERT INTO deliveries
            (order_id, status)
            VALUES (?, 'Pending')`,
            [orderId]
        );

        database.run(
            `INSERT INTO order_logs
            (order_id, status, changed_by)
            VALUES (?, 'Placed', ?)`,
            [
                orderId,
                req.user.id
            ]
        );

        save();

        res.json({
            message: "Order placed successfully",
            orderId
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

/* GET ORDERS */

app.get("/api/orders", auth, async (req, res) => {
    try {
        let query = `
            SELECT
                o.id,
                o.user_id,
                o.restaurant_id,
                r.name AS restaurant_name,
                o.total_amount,
                o.status,
                o.created_at,
                o.updated_at
            FROM orders o
            JOIN restaurants r
            ON o.restaurant_id = r.id
        `;

        let params = [];

        if (req.user.role === "customer") {
            query += " WHERE o.user_id = ?";
            params.push(req.user.id);
        }

        if (req.user.role === "owner") {
            query += `
                WHERE o.restaurant_id IN
                (
                    SELECT id
                    FROM restaurants
                    WHERE owner_id = ?
                )
            `;

            params.push(req.user.id);
        }

        query += " ORDER BY o.id DESC";

        const orders = getRows(query, params);

        res.json(orders);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

/* ORDER DETAILS */

app.get("/api/orders/:id", auth, async (req, res) => {
    try {
        const order = getRows(
            `SELECT
                o.*,
                r.name AS restaurant_name
             FROM orders o
             JOIN restaurants r
             ON o.restaurant_id = r.id
             WHERE o.id = ?`,
            [req.params.id]
        );

        if (order.length === 0) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        const items = getRows(
            `SELECT
                oi.*,
                m.name AS item_name
             FROM order_items oi
             JOIN menu_items m
             ON oi.menu_item_id = m.id
             WHERE oi.order_id = ?`,
            [req.params.id]
        );

        const logs = getRows(
            `SELECT
                ol.*,
                u.name AS changed_by_name
             FROM order_logs ol
             LEFT JOIN users u
             ON ol.changed_by = u.id
             WHERE ol.order_id = ?
             ORDER BY ol.id ASC`,
            [req.params.id]
        );

        const delivery = getRows(
            `SELECT
                d.*,
                u.name AS delivery_partner_name
             FROM deliveries d
             LEFT JOIN users u
             ON d.delivery_partner_id = u.id
             WHERE d.order_id = ?`,
            [req.params.id]
        );

        res.json({
            order: order[0],
            items,
            logs,
            delivery: delivery[0] || null
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

/* UPDATE ORDER STATUS */

app.put(
    "/api/orders/:id/status",
    auth,
    roleCheck("owner", "delivery", "admin"),
    async (req, res) => {

        try {
            const { status } = req.body;

            const allowedStatuses = [
                "Placed",
                "Accepted",
                "Preparing",
                "Out for Delivery",
                "Delivered"
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    message: "Invalid order status"
                });
            }

            const existing = getRows(
                `SELECT *
                 FROM orders
                 WHERE id = ?`,
                [req.params.id]
            );

            if (existing.length === 0) {
                return res.status(404).json({
                    message: "Order not found"
                });
            }

            const currentStatus = existing[0].status;

            const flow = {
                "Placed": ["Accepted"],
                "Accepted": ["Preparing"],
                "Preparing": ["Out for Delivery"],
                "Out for Delivery": ["Delivered"],
                "Delivered": []
            };

            if (
                currentStatus !== status &&
                !flow[currentStatus].includes(status)
            ) {
                return res.status(400).json({
                    message:
                        `Cannot change order from ${currentStatus} to ${status}`
                });
            }

            database.run(
                `UPDATE orders
                 SET status = ?,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [
                    status,
                    req.params.id
                ]
            );

            database.run(
                `UPDATE deliveries
                 SET status = ?
                 WHERE order_id = ?`,
                [
                    status,
                    req.params.id
                ]
            );

            database.run(
                `INSERT INTO order_logs
                (order_id, status, changed_by)
                VALUES (?, ?, ?)`,
                [
                    req.params.id,
                    status,
                    req.user.id
                ]
            );

            save();

            res.json({
                message: "Order status updated"
            });

        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }
);

/* DELIVERY PARTNERS */

app.get(
    "/api/delivery-partners",
    auth,
    roleCheck("owner", "admin"),
    async (req, res) => {

        const partners = getRows(
            `SELECT id, name, email
             FROM users
             WHERE role = 'delivery'`
        );

        res.json(partners);
    }
);

/* ASSIGN DELIVERY PARTNER */

app.put(
    "/api/orders/:id/assign",
    auth,
    roleCheck("owner", "admin"),
    async (req, res) => {

        try {
            const { delivery_partner_id } = req.body;

            const partner = getRows(
                `SELECT *
                 FROM users
                 WHERE id = ?
                 AND role = 'delivery'`,
                [delivery_partner_id]
            );

            if (partner.length === 0) {
                return res.status(400).json({
                    message: "Invalid delivery partner"
                });
            }

            database.run(
                `UPDATE deliveries
                 SET delivery_partner_id = ?,
                     assigned_at = CURRENT_TIMESTAMP
                 WHERE order_id = ?`,
                [
                    delivery_partner_id,
                    req.params.id
                ]
            );

            save();

            res.json({
                message: "Delivery partner assigned"
            });

        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }
);

/* DELIVERY ORDERS */

app.get(
    "/api/delivery/orders",
    auth,
    roleCheck("delivery"),
    async (req, res) => {

        const orders = getRows(
            `SELECT
                o.id,
                o.total_amount,
                o.status,
                r.name AS restaurant_name,
                d.status AS delivery_status
             FROM deliveries d
             JOIN orders o
             ON d.order_id = o.id
             JOIN restaurants r
             ON o.restaurant_id = r.id
             WHERE d.delivery_partner_id = ?
             ORDER BY o.id DESC`,
            [req.user.id]
        );

        res.json(orders);
    }
);

/* REVIEW */

app.post(
    "/api/reviews",
    auth,
    roleCheck("customer"),
    async (req, res) => {

        try {
            const {
                order_id,
                rating,
                comment
            } = req.body;

            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    message: "Rating must be between 1 and 5"
                });
            }

            const order = getRows(
                `SELECT *
                 FROM orders
                 WHERE id = ?
                 AND user_id = ?
                 AND status = 'Delivered'`,
                [
                    order_id,
                    req.user.id
                ]
            );

            if (order.length === 0) {
                return res.status(400).json({
                    message:
                        "You can review only your delivered orders"
                });
            }

            const existingReview = getRows(
                `SELECT *
                 FROM reviews
                 WHERE order_id = ?`,
                [order_id]
            );

            if (existingReview.length > 0) {
                return res.status(400).json({
                    message: "Review already submitted"
                });
            }

            database.run(
                `INSERT INTO reviews
                (
                    order_id,
                    user_id,
                    restaurant_id,
                    rating,
                    comment
                )
                VALUES (?, ?, ?, ?, ?)`,
                [
                    order_id,
                    req.user.id,
                    order[0].restaurant_id,
                    rating,
                    comment || ""
                ]
            );

            save();

            res.json({
                message: "Review submitted"
            });

        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }
);

/* DASHBOARD */

app.get(
    "/api/dashboard/summary",
    auth,
    roleCheck("owner", "admin"),
    async (req, res) => {

        try {
            let orderCount;
            let revenue;
            let statusCounts;

            if (req.user.role === "owner") {

                const restaurantIds = getRows(
                    `SELECT id
                     FROM restaurants
                     WHERE owner_id = ?`,
                    [req.user.id]
                );

                if (restaurantIds.length === 0) {
                    return res.json({
                        totalOrders: 0,
                        revenue: 0,
                        statuses: []
                    });
                }

                const ids = restaurantIds
                    .map(item => item.id)
                    .join(",");

                orderCount = getRows(
                    `SELECT COUNT(*) AS count
                     FROM orders
                     WHERE restaurant_id IN (${ids})`
                );

                revenue = getRows(
                    `SELECT COALESCE(SUM(total_amount), 0) AS revenue
                     FROM orders
                     WHERE restaurant_id IN (${ids})`
                );

                statusCounts = getRows(
                    `SELECT status, COUNT(*) AS count
                     FROM orders
                     WHERE restaurant_id IN (${ids})
                     GROUP BY status`
                );

            } else {

                orderCount = getRows(
                    `SELECT COUNT(*) AS count
                     FROM orders`
                );

                revenue = getRows(
                    `SELECT COALESCE(SUM(total_amount), 0) AS revenue
                     FROM orders`
                );

                statusCounts = getRows(
                    `SELECT status, COUNT(*) AS count
                     FROM orders
                     GROUP BY status`
                );
            }

            res.json({
                totalOrders: orderCount[0].count,
                revenue: revenue[0].revenue,
                statuses: statusCounts
            });

        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }
);

/* ADMIN - USERS */

app.get(
    "/api/admin/users",
    auth,
    roleCheck("admin"),
    async (req, res) => {

        const users = getRows(
            `SELECT id, name, email, role, created_at
             FROM users
             ORDER BY id DESC`
        );

        res.json(users);
    }
);

/* START */

startDatabase()
    .then(() => {

        if (require.main === module) {
            app.listen(PORT, () => {
                console.log(
                    `Backend running on http://localhost:${PORT}`
                );
            });
        }

    })
    .catch(error => {
        console.error(error);
    });

module.exports = app;