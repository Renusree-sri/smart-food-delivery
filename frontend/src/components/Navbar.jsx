import { Link, useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    function logout() {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    }

    return (
        <nav className="navbar">

            <h2>FoodExpress</h2>

            <div>

                <Link to="/">
                    Restaurants
                </Link>

                {user && (
                    <Link to="/orders">
                        My Orders
                    </Link>
                )}

                {user && user.role === "owner" && (
                    <Link to="/owner">
                        Owner Dashboard
                    </Link>
                )}

                {user && user.role === "delivery" && (
                    <Link to="/delivery">
                        Delivery Dashboard
                    </Link>
                )}

                {user ? (
                    <button onClick={logout}>
                        Logout
                    </button>
                ) : (
                    <>
                        <Link to="/login">
                            Login
                        </Link>

                        <Link to="/register">
                            Register
                        </Link>
                    </>
                )}

            </div>

        </nav>
    );
}

export default Navbar;