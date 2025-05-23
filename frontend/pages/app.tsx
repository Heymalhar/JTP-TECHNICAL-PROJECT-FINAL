import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/AppPage.module.css";
 
export default function AppPage() {
 
    const router = useRouter();
 
    const [username, setUsername] = useState<string | null>(null);
    const [trackInputs, setTrackInputs] = useState(["", "", ""]);
    const [suggestions, setSuggestions] = useState<string[][]>([[], [], []]);
    const [recommendations, setRecommendations] = useState<any[] | null>(null);
    const [history, setHistory] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [buttonLabel, setButtonLabel] = useState("Get Recommendations");
 
    useEffect(() => {
 
        const storedUser = localStorage.getItem("loggedInUsername");
        if (!storedUser) {
            router.push("/login");
        } else {
            setUsername(storedUser);
        }
 
    }, []);
 
    function logout(){
        localStorage.removeItem("loggedInUsername");
        router.push("/");
    }
 
    useEffect(() => {
 
        const timeout = setTimeout(() => {
            trackInputs.forEach((val, idx) => {
                if (val.trim()) {
                    fetch(`http://localhost:5000/api/tracks?query=${encodeURIComponent(val.trim())}`)
                        .then((res) => res.json())
                        .then((data) => {
                            const updated = [...suggestions];
                            updated[idx] = data.tracks || [];
                            setSuggestions(updated);
                        })
                        .catch(() => {});
                }
            });
        }, 300);
 
        return () => clearTimeout(timeout)
 
    }, [trackInputs]);
 
    function handleTrackChange(index: number, value: string){
        const updated = [...trackInputs];
        updated[index] = value;
        setTrackInputs(updated);
 
        const cleared = [...suggestions];
        cleared[index] = [];
        setSuggestions(cleared);
    }
 
    function selectSuggestion(index: number, value: string){
        const updated = [...trackInputs];
        updated[index] = value;
        setTrackInputs(updated);
 
        const cleared = [...suggestions];
        cleared[index] = [];
        setSuggestions(cleared)
    }

    async function handleRecommend() {

        if (!username || trackInputs.some((t) => !t.trim())){
            setError("All three track names must be filled.");
            return;
        }

        setError(null);
        setHistory(null);
        setRecommendations(null);

        setButtonLabel("Loading...")

        const trimmedTracks = trackInputs.map((t) => t.trim());

        try {

            const response = await fetch("http://localhost:5000/api/recommend", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username, track_names: trimmedTracks}),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Recommendation Failed.");
                return;
            }

            setRecommendations(data.recommendations || []);
            setButtonLabel("Get More Recommendations");

        } catch {
            setError("Failed to get recommendations.");
        }
        
    }

    async function handleHistory() {

        if(!username || trackInputs.some((t) => !t.trim())){
            setError("All three track names must be filled.");
            return;
        }

        setError(null);
        setRecommendations(null);
        setHistory(null);

        const trimmedTracks = trackInputs.map((t) => t.trim());

        try {

            const response = await fetch("http://localhost:5000/api/history", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username, track_names: trimmedTracks}),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to fetch history.");
                return;
            }

            setHistory(data.history || [{track_name: data.message}])

        } catch {
            setError("Failed to get history")
        }

    }

    return (

        <main className={styles.container}>

            <section className={styles.appCard}>

                <h1 className={styles.heading}>Welcome, {username}</h1>

                <div className={styles.trackInputSection}>

                    {[0, 1, 2].map((i) => (
                        <div className={styles.trackField} key={i}>

                            <label>{`Track ${i+1}`}</label>
                            <input
                                type="text"
                                value={trackInputs[i]}
                                onChange={(e) => handleTrackChange(i, e.target.value)}
                                className={styles.trackInput}
                            />
                            {suggestions[i].length > 0 && (
                                <ul className={styles.suggestions}>
                                    {suggestions[i].map((track) => (
                                        <li
                                            key={track}
                                            onClick={() => selectSuggestion(i, track)}
                                            className={styles.suggestionItem}
                                        >
                                            {track}
                                        </li>
                                    ))}
                                </ul>
                            )}

                        </div>
                    ))}

                </div>

                <div className={styles.buttonGroup}>
                    <button onClick={handleRecommend} className={styles.buttonPrimary}>
                        {buttonLabel}
                    </button>
                    <button onClick={handleHistory} className={styles.buttonSecondary}>
                        Show Previous Recommendations
                    </button>
                    <button onClick={logout} className={styles.logoutButton}>
                        Logout
                    </button>
                </div>

                {error && <p className={styles.error}>{error}</p>}

                {recommendations && (

                    <div className={styles.results}>

                        <h2>Recommendations:</h2>

                        <ul>
                            {recommendations.map((track, idx) => (
                                <li key={idx}>
                                    <strong>{track.track_name}</strong> by {track.artists}
                                    {track.track_genre && ` (Genre: ${track.track_genre})`} - Popularity:{" "}
                                    {track.popularity} - Score: {track.similarity_score}
                                </li>
                            ))}
                        </ul>

                    </div>

                )}

                {history && (
                    <div className={styles.results}>
                        <h2>Previous Recommendations:</h2>
                        <ul>
                            {history.map((track, idx) => (
                                <li key={idx}>
                                    <strong>{track.track_name}</strong> by {track.artists}
                                    {track.track_genre && ` (Genre: ${track.track_genre})`} - Popularity:{" "}
                                    {track.popularity} - Score: {track.similarity_score}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

            </section>

        </main>

    )
 
}
