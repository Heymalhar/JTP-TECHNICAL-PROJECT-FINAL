import { useState } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const router = useRouter();

    async function handleLogin(event: React.FormEvent) {
        
        event.preventDefault();
        setError(null);
        setMessage(null);

        if(!username || !password) {
            setError("Username and password are required.");
            return;
        }

        try {

            const response = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username, password}),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Login Failed.");
                return;
            }

            setMessage(data.message || "Login Successful!");
            localStorage.setItem("loggedInUsername", username);

            setTimeout(() => {
                router.push("/app");
            }, 1000);

        } catch {
            setError("Something went wrong. Please try again.")
        }

    }

    return (
        
        <main>

            <h1>Login Page</h1>

            <form onSubmit={handleLogin}>

                <div>
                    <label>Username: </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div>
                    <label>Password: </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button type="submit">Login</button>

            </form>

            {error && <p style={{color: "red"}}>{error}</p>}
            {message && <p style={{color: "green"}}></p>}

        </main>

    )

}
