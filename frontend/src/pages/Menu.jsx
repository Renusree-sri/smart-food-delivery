import { useEffect, useState } from "react";

function Menu() {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        fetch("http://localhost:3000/api/menu")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to load menu");
                }

                return response.json();
            })
            .then((data) => {
                if (!cancelled) {
                    setMenu(data);
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    console.log("Error loading menu:", err);
                    setError("Unable to load menu");
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    function addToCart(item) {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];

        cart.push(item);

        localStorage.setItem("cart", JSON.stringify(cart));

        alert("Item added to cart");
    }

    return (
        <div>
            <h1>Food Menu</h1>

            {loading && <p>Loading menu...</p>}

            {error && <p>{error}</p>}

            {!loading && !error && menu.length === 0 && (
                <p>No menu items available.</p>
            )}

            {!loading && !error && menu.length > 0 && (
                <div>
                    {menu.map((item) => (
                        <div key={item.id}>
                            <h3>{item.name}</h3>

                            <p>
                                {item.description}
                            </p>

                            <p>
                                Price: ₹{item.price}
                            </p>

                            <button
                                onClick={() => addToCart(item)}
                            >
                                Add to Cart
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Menu;
