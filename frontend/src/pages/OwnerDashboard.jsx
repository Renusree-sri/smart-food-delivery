import { useEffect, useState } from "react";
import { apiRequest } from "../api";

function OwnerDashboard() {

    const [summary, setSummary] =
        useState(null);

    const [orders, setOrders] =
        useState([]);

    useEffect(() => {

        loadData();

    }, []);

    async function loadData() {

        try {

            const dashboard =
                await apiRequest(
                    "/api/dashboard/summary"
                );

            const orderData =
                await apiRequest(
                    "/api/orders"
                );

            setSummary(dashboard);
            setOrders(orderData);

        } catch (error) {

            alert(error.message);
        }
    }

    async function updateStatus(
        orderId,
        status
    ) {

        try {

            await apiRequest(
                `/api/orders/${orderId}/status`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        status
                    })
                }
            );

            loadData();

        } catch (error) {

            alert(error.message);
        }
    }

    return (
        <div className="container">

            <h1>
                Restaurant Dashboard
            </h1>

            {summary && (

                <div className="grid">

                    <div className="card">

                        <h2>
                            Total Orders
                        </h2>

                        <h1>
                            {summary.totalOrders}
                        </h1>

                    </div>

                    <div className="card">

                        <h2>
                            Revenue
                        </h2>

                        <h1>
                            ₹{summary.revenue}
                        </h1>

                    </div>

                </div>
            )}

            <h2>
                Restaurant Orders
            </h2>

            {orders.map(order => (

                <div
                    className="card"
                    key={order.id}
                >

                    <h3>
                        Order #{order.id}
                    </h3>

                    <p>
                        ₹{order.total_amount}
                    </p>

                    <p>
                        Current:
                        {" "}
                        {order.status}
                    </p>

                    <div className="status-buttons">

                        {order.status ===
                            "Placed" && (

                            <button
                                onClick={() =>
                                    updateStatus(
                                        order.id,
                                        "Accepted"
                                    )
                                }
                            >
                                Accept
                            </button>
                        )}

                        {order.status ===
                            "Accepted" && (

                            <button
                                onClick={() =>
                                    updateStatus(
                                        order.id,
                                        "Preparing"
                                    )
                                }
                            >
                                Start Preparing
                            </button>
                        )}

                        {order.status ===
                            "Preparing" && (

                            <button
                                onClick={() =>
                                    updateStatus(
                                        order.id,
                                        "Out for Delivery"
                                    )
                                }
                            >
                                Out for Delivery
                            </button>
                        )}

                    </div>

                </div>
            ))}

        </div>
    );
}

export default OwnerDashboard;