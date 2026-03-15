import { EmailAuthPanel } from "@/components/email-auth-panel";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center gap-4 px-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Firebase Authentication
      </h1>
      <p className="text-sm text-neutral-600">
        Sign in with email/password or Google (enable both providers in Firebase
        Console first).
      </p>
      <EmailAuthPanel />
    </main>
  );
}
