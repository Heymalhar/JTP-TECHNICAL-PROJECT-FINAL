import { useRouter } from "next/router";
import styles from "../styles/LandingPage.module.css";

export default function LandingPage() {

  const router = useRouter();

  return (

    <main className={styles.container}>

      <section className={styles.hero}>

        <div className={styles.headingWrapper}>

          <h1 className={styles.title}>Music Recommendation System</h1>
          <p className={styles.subtitle}>
            Unlock the power of personalized music delivery - tailored just for you.
          </p>

          <div className={styles.buttons}>
            <button
              className={styles.ctaPrimary}
              onClick={() => router.push("/signup")}
              type="button"
            >
              Create Account
            </button>
            <button
              className={styles.ctaSecondary}
              onClick={() => router.push("/login")}
              type="button"
            >
              Sign In
            </button>
          </div>

        </div>

      </section>

    </main>

  )

}
