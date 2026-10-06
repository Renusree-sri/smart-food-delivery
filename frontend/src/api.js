const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function apiRequest(
    url,
    options = {}
) {

    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
        API_URL + url,
        {
            ...options,
            headers
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Something went wrong"
        );
    }

    return data;
}

export default API_URL;