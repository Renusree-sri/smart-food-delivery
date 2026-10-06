import { useEffect, useState } from "react";

function OrderDetails() {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function getOrder() {
            try {
                const orderId = localStorage.getItem("orderId");

                if (!orderId) {
                    throw new Error("Order ID not found");
                }

                const response = await fetch(
                    `http://localhost:3000/api/orders/${orderId}`
                );

                if (!response.ok) {
                    throw new Error("Failed to load order");
                }

                const data = await response.json();

                if (!cancelled) {
                    setOrder(data);
                    setLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    console.log("Error loading order:", err);
                    setError("Unable to load order");
                    setLoading(false);
                }
            }
        }

        getOrder();

        return () => {
            cancelled = true;
        };
    }, []);

    async function submitReview() {
        if (!order) {
            return;
        }

        try {
            const review = prompt("Enter your review:");

            if (!review) {
                return;
            }

            const response = await fetch(
                `http://localhost:3000/api/orders/${order.id}/review`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        review: review,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to submit review");
            }

            alert("Review submitted successfully");
        } catch (err) {
            console.log("Error submitting review:", err);
            alert("Failed to submit review");
        }
    }

    if (loading) {
        return (
            <div>
                <h1>Order Details</h1>
                <p>Loading order...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h1>Order Details</h1>
                <p>{error}</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div>
                <h1>Order Details</h1>
                <p>Order not found.</p>
            </div>
        );
    }

    return (
        <div>
            <h1>Order Details</h1>

            <h2>Order #{order.id}</h2>

            <p>
                Status: {order.status || "Pending"}
            </p>

            <p>
                Total: ₹{order.total || 0}
            </p>

            <p>
                Address: {order.address || "N/A"}
            </p>

            {order.items && order.items.length > 0 && (
                <div>
                    <h3>Items</h3>

                    {order.items.map((item, index) => (
                        <div key={item.id || index}>
                            <p>
                                {item.name} - ₹{item.price}
                            </p>

                            <p>
                                Quantity: {item.quantity || 1}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <button onClick={submitReview}>
                Submit Review
            </button>
        </div>
    );
}

export default OrderDetails;

