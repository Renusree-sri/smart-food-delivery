import { Link } from "react-router-dom";

function CustomerDashboard() {

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    return (
        <div className="container">

            <h1>
                Welcome {user?.name}
            </h1>

            <div className="grid">

                <div className="card">

                    <h2>
                        Browse Restaurants
                    </h2>

                    <Link to="/">
                        View Restaurants
                    </Link>

                </div>

                <div className="card">

                    <h2>
                        My Orders
                    </h2>

                    <Link to="/orders">
                        View Orders
                    </Link>

                </div>

            </div>

        </div>
    );
}

export default CustomerDashboard;