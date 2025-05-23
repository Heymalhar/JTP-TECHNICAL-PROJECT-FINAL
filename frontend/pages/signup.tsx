import React, {useState} from "react";
import { useRouter } from "next/router";

export default function SignupPage() {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const router = useRouter();

    async function handleSignup(event: React.FormEvent) {

        event.preventDefault();
        setError(null);
        setMessage(null);

        if (!username || !email || !password) {
            setError("All fields are required.");
            return;
        }

        try{

            const response = await fetch("http://localhost:5000/api/signup", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username, email, password}),
            });

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || "Signup failed.");
                return;
            }

            setMessage(data.message || "Signup successful!");
            setTimeout(() => {
                router.push("/login");
            }, 1500);

        } catch {
            setError("Something went wrong. Please try again later.");
        }

    }

    return (

        <main>

            <h1>Sign Up Page</h1>

            <form onSubmit={handleSignup}>

                <div>
                    <label>Username: </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div>
                    <label>Email: </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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

                <button type="submit">Sign Up</button>

            </form>

            {error && <p style={{color: "red"}}>{error}</p>}
            {message && <p style={{color: "green"}}>{message}</p>}

        </main>

    );

}
