import { useEffect, useState } from "react";

function DeliveryDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let ignore = false;

        async function getOrders() {
            try {
                setError("");

                const response = await fetch(
                    "http://localhost:3000/api/orders"
                );

                if (!response.ok) {
                    throw new Error("Failed to load orders");
                }

                const data = await response.json();

                if (!ignore) {
                    setOrders(data);
                }
            } catch (err) {
                if (!ignore) {
                    console.log("Error loading orders:", err);
                    setError("Unable to load orders");
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        getOrders();

        return () => {
            ignore = true;
        };
    }, []);

    async function updateOrderStatus(orderId, status) {
        try {
            const response = await fetch(
                `http://localhost:3000/api/orders/${orderId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        status: status,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update order");
            }

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.id === orderId
                        ? { ...order, status: status }
                        : order
                )
            );
        } catch (err) {
            console.log("Error updating order:", err);
            alert("Failed to update order status");
        }
    }

    if (loading) {
        return (
            <div>
                <h1>Delivery Dashboard</h1>
                <p>Loading orders...</p>
            </div>
        );
    }

    return (
        <div>
            <h1>Delivery Dashboard</h1>

            {error && <p>{error}</p>}

            {!error && orders.length === 0 && (
                <p>No orders available.</p>
            )}

            {orders.map((order) => (
                <div key={order.id}>
                    <h2>Order #{order.id}</h2>

                    <p>
                        Customer:{" "}
                        {order.customerName || order.customer_name || "N/A"}
                    </p>

                    <p>
                        Address: {order.address || "N/A"}
                    </p>

                    <p>
                        Total: ₹{order.total || 0}
                    </p>

                    <p>
                        Status: {order.status || "Pending"}
                    </p>

                    {order.status !== "Delivered" && (
                        <button
                            onClick={() =>
                                updateOrderStatus(
                                    order.id,
                                    "Delivered"
                                )
                            }
                        >
                            Mark as Delivered
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}

export default DeliveryDashboard;
