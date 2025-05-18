import {useState, useEffect} from "react";
import styles from "../styles/Home.module.css";

export default function Home(){

  const [username, setUsername] = useState("");
  const [trackInputs, setTrackInputs] = useState(["", "", ""]);
  const [suggestions, setSuggestions] = useState<string[][]>([[], [], []]);
  const [recommendations, setRecommendations] = useState<any [] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      trackInputs.forEach((val, idx) => {
        if (val.trim().length > 0) {
          fetch(`http://localhost:5000/api/tracks?query=${encodeURIComponent(val.trim())}`)
            .then((res) => res.json())
            .then((data) => {
              const updatedSuggestions = [...suggestions];
              updatedSuggestions[idx] = data.tracks || [];
              setSuggestions(updatedSuggestions);
            })
            .catch(() => {});
        }
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [trackInputs]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setRecommendations(null);
    setLoading(true);

    const trackList = trackInputs.map((t) => t.trim()).filter(Boolean);

    if (!username || trackList.length < 3) {
      setError("Please enter a username and all three track names.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, track_names: trackList }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unknown error occurred.");
        setLoading(false);
        return;
      }

      setRecommendations(data.recommendations || []);
    } catch {
      setError("Failed to fetch recommendations.");
    }
    setLoading(false);
  }

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

  return (
    <main className={styles.main}>

      <h1 className={styles.resultsHeader}>Music Recommendation System</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Username:</label>
        <input
          className={styles.input}
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {[0,1,2].map((i) => (
        <div key={i} className={styles.inputGroup}>
          <label className={styles.label}>{`Track ${i + 1}:`}</label>
          <input
            className={styles.input}
            type="text"
            value={trackInputs[i]}
            onChange={(e) => handleTrackChange(i, e.target.value)}
          />
          <ul className={styles.suggestionList}>
            {suggestions[i].map((track) => (
                <li
                  key={track}
                  className={styles.suggestionItem}
                  onClick={() => selectSuggestion(i, track)}
                >
                  {track}
                </li>
            ))}
          </ul>
        </div>
      ))}
      
      <button
        type="submit"
        disabled={loading}
        className={`${styles.button} ${loading ? styles.disabledButton : ""}`}
      >
        {loading ? "Loading..." : "Get Recommendations"}
      </button>

      </form>

      {error && (
        <div className={styles.error}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {recommendations && (
        <div className={styles.results}>
          <h2 className={styles.resultsHeader}>Recommendations:</h2>
          <ul className={styles.resultList}>
            {recommendations.map((track, idx) => (
              <li key={idx} className={styles.resultItem}>
                <strong>{track.track_name}</strong> by {track.artists}{" "}
                {track.track_genre && ` (Genre: ${track.track_genre})`} - Popularity:{" "}
                {track.popularity} - Similarity Score: {track.similarity_score}
              </li>
            ))}
          </ul>
        </div>
      )}

    </main>
  );

}