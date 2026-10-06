import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function login(e) {

        e.preventDefault();

        try {

            const data = await apiRequest(
                "/api/auth/login",
                {
                    method: "POST",
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            alert("Login successful");

            if (data.user.role === "owner") {
                navigate("/owner");
            } else if (data.user.role === "delivery") {
                navigate("/delivery");
            } else {
                navigate("/");
            }

        } catch (error) {

            alert(error.message);
        }
    }

    return (
        <div className="form-container">

            <h1>Login</h1>

            <form onSubmit={login}>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={
                        e => setEmail(e.target.value)
                    }
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={
                        e => setPassword(e.target.value)
                    }
                    required
                />

                <button>
                    Login
                </button>

            </form>

        </div>
    );
}

export default Login;