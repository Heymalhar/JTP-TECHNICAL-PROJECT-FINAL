import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/LoginPage.module.css"

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
            sessionStorage.setItem("loggedInUsername", username);

            setTimeout(() => {
                router.push("/app");
            }, 1000);

        } catch {
            setError("Something went wrong. Please try again.")
        }

    }

    return (
        
        <main className={styles.container}>

            <section className={styles.card}>

                <h1 className={styles.title}>Login</h1>
                
                <form onSubmit={handleLogin} className={styles.form}>

                    <label className={styles.label}>
                        Username
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={styles.input}
                        />
                    </label>

                    <label className={styles.label}>
                        Password
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                        />
                    </label>

                    <button type="submit" className={styles.submitButton}>
                        Login
                    </button>

                </form>

                {error && <p className={styles.error}>{error}</p>}
                {message && <p className={styles.success}>{message}</p>}

            </section>

        </main>

    )

}
