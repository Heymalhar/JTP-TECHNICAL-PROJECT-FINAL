import React, {useState} from "react";
import { useRouter } from "next/router";
import styles from "../styles/SignupPage.module.css";

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

        <main className={styles.container}>

            <section className={styles.card}>

                <h1 className={styles.title}>Create Your Account</h1>

                <form onSubmit={handleSignup} className={styles.form}>

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
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                        Sign Up
                    </button>

                </form>

                {error && <p className={styles.error}>{error}</p>}
                {message && <p className={styles.success}>{message}</p>}

            </section>

        </main>

    );

}
