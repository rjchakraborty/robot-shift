import type { Metadata } from "next";
import Link from "next/link";
import { AuthActionHandler } from "./auth-action-handler";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Account action",
  description: "Complete a secure Robot/Shift account action.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthActionPage() {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <Link href="/" className={styles.brand}>Robot/Shift</Link>
        <AuthActionHandler />
        <Link href="/privacy/">Privacy & telemetry</Link>
      </section>
    </main>
  );
}
