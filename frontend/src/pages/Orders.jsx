import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";

function Orders() {

    const [orders, setOrders] = useState([]);

    useEffect(() => {

        loadOrders();

    }, []);

    async function loadOrders() {

        try {

            const data =
                await apiRequest(
                    "/api/orders"
                );

            setOrders(data);

        } catch (error) {

            alert(error.message);
        }
    }

    return (
        <div className="container">

            <h1>Order History</h1>

            {orders.length === 0 ? (

                <p>No orders found.</p>

            ) : (

                orders.map(order => (

                    <div
                        className="card"
                        key={order.id}
                    >

                        <h2>
                            Order #{order.id}
                        </h2>

                        <p>
                            Restaurant:
                            {" "}
                            {order.restaurant_name}
                        </p>

                        <p>
                            Amount:
                            {" "}
                            ₹{order.total_amount}
                        </p>

                        <p>
                            Status:
                            {" "}
                            <strong>
                                {order.status}
                            </strong>
                        </p>

                        <Link
                            className="button"
                            to={`/orders/${order.id}`}
                        >
                            Track Order
                        </Link>

                    </div>
                ))
            )}

        </div>
    );
}

export default Orders;