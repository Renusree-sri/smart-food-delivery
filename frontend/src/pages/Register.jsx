import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

function Register() {

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function register(e) {

        e.preventDefault();

        try {

            await apiRequest(
                "/api/auth/register",
                {
                    method: "POST",
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                        role: "customer"
                    })
                }
            );

            alert("Registered successfully");

            navigate("/login");

        } catch (error) {

            alert(error.message);
        }
    }

    return (
        <div className="form-container">

            <h1>Create Account</h1>

            <form onSubmit={register}>

                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={
                        e => setName(e.target.value)
                    }
                    required
                />

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
                    minLength="6"
                    required
                />

                <button>
                    Register
                </button>

            </form>

        </div>
    );
}

export default Register;