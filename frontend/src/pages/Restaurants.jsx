import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";

function Restaurants() {

    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadRestaurants();

    }, []);

    async function loadRestaurants() {

        try {

            const data =
                await apiRequest(
                    "/api/restaurants"
                );

            setRestaurants(data);

        } catch (error) {

            alert(error.message);

        } finally {

            setLoading(false);
        }
    }

    if (loading) {
        return <h2>Loading...</h2>;
    }

    return (
        <div className="container">

            <h1>Restaurants</h1>

            {restaurants.length === 0 ? (
                <p>
                    No restaurants available.
                </p>
            ) : (
                <div className="grid">

                    {restaurants.map(
                        restaurant => (

                            <div
                                className="card"
                                key={restaurant.id}
                            >

                                <h2>
                                    {restaurant.name}
                                </h2>

                                <p>
                                    {restaurant.address}
                                </p>

                                <Link
                                    className="button"
                                    to={`/menu/${restaurant.id}`}
                                >
                                    View Menu
                                </Link>

                            </div>
                        )
                    )}

                </div>
            )}

        </div>
    );
}

export default Restaurants;