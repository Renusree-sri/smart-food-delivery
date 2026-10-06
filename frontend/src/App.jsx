import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Restaurants from "./pages/Restaurants";
import Menu from "./pages/Menu";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import CustomerDashboard from "./pages/CustomerDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import DeliveryDashboard from "./pages/DeliveryDashboard";

function App() {

    return (
        <BrowserRouter>

            <Navbar />

            <Routes>

                <Route
                    path="/"
                    element={<Restaurants />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/menu/:id"
                    element={<Menu />}
                />

                <Route
                    path="/orders"
                    element={
                        <ProtectedRoute>
                            <Orders />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/orders/:id"
                    element={
                        <ProtectedRoute>
                            <OrderDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/customer"
                    element={
                        <ProtectedRoute>
                            <CustomerDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/owner"
                    element={
                        <ProtectedRoute>
                            <OwnerDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/delivery"
                    element={
                        <ProtectedRoute>
                            <DeliveryDashboard />
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;