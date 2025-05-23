import { useState, useEffect } from "react";
import { useRouter } from "next/router";

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

    function logout() {
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

        return () => clearTimeout(timeout);
    }, [trackInputs]);

    function handleTrackChange(index: number, value: string) {
        const updated = [...trackInputs];
        updated[index] = value;
        setTrackInputs(updated);

        const cleared = [...suggestions];
        cleared[index] = [];
        setSuggestions(cleared);
    }

    function selectSuggestion(index: number, value: string) {
        const updated = [...trackInputs];
        updated[index] = value;
        setTrackInputs(updated);

        const cleared = [...suggestions];
        cleared[index] = [];
        setSuggestions(cleared);
    }

    async function handleRecommend() {
        if (!username || trackInputs.some((t) => !t.trim())) {
            setError("All three track names must be filled.");
            return;
        }

        const trimmedTracks = trackInputs.map((t) => t.trim());

        try {
            const response = await fetch("http://localhost:5000/api/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, track_names: trimmedTracks }),
            });

            const data = await response.json();
            if (!response.ok) {
                setError(data.error || "Recommendation Failed.");
                return;
            }

            setRecommendations(data.recommendations || []);
            setButtonLabel("Get More Recommendations.");

        } catch {
            setError("Failed to get recommendations.");
        }
    }

    async function handleHistory() {
        if (!username || trackInputs.some((t) => !t.trim())) {
            setError("All three track names must be filled.");
            return;
        }

        const trimmedTracks = trackInputs.map((t) => t.trim());

        try {
            const response = await fetch("http://localhost:5000/api/history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, track_names: trimmedTracks }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to fetch history.");
                return;
            }

            if (data.message) {
                setHistory([{ track_name: data.message }]);
            } else {
                setHistory(data.history || []);
            }

        } catch {
            setError("Failed to get history.");
        }
    }

    return (
        <main>
            <h1>Welcome, {username}</h1>

            {[0, 1, 2].map((i) => (
                <div key={i}>
                    <label>{`Track ${i + 1}:`}</label>
                    <input
                        type="text"
                        value={trackInputs[i]}
                        onChange={(e) => handleTrackChange(i, e.target.value)}
                    />
                    <ul>
                        {suggestions[i].map((track) => (
                            <li key={track} onClick={() => selectSuggestion(i, track)}>
                                {track}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}

            <button onClick={handleRecommend}>{buttonLabel}</button>
            <button onClick={handleHistory}>Show Previous Recommendations</button>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {recommendations && (
                <div>
                    <h2>Recommendations:</h2>
                    <ul>
                        {recommendations.map((track, idx) => (
                            <li key={idx}>
                                <strong>{track.track_name}</strong> by {track.artists}{" "}
                                {track.track_genre && ` (Genre: ${track.track_genre})`} - Popularity:{" "}
                                {track.popularity} - Similarity Score: {track.similarity_score}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {history && (
                <div>
                    <h2>Previous Recommendations</h2>
                    <ul>
                        {history.map((track, idx) => (
                            <li key={idx}>
                                <strong>{track.track_name}</strong> by {track.artists}{" "}
                                {track.track_genre && ` (Genre: ${track.track_genre})`} - Popularity:{" "}
                                {track.popularity} - Similarity Score: {track.similarity_score}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button onClick={logout}>Logout</button>
        </main>
    );
}
