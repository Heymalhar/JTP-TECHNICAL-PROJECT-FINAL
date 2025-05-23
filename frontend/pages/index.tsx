import { useRouter } from "next/router";

export default function LandingPage() {

  const router = useRouter();

  return (
    <main>
      <h1>Music Recommendation System</h1>
      <p>Welcome to the music recommender. Please sign up or log in to continue.</p>
      <div>
        <button onClick={() => router.push("/signup")}>Sign Up</button>
        <button onClick={() => router.push("/login")}>Log In</button>
      </div>
    </main>
  );

}
