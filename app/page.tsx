import Link from "next/link";

const steps = [
  {
    title: "Create or join",
    body: "The host picks a formation and shares a 5-letter room code with 3 friends.",
  },
  {
    title: "Blind bidding",
    body: "Footballers are revealed one by one. Bid bank points out loud — the host records the winner.",
  },
  {
    title: "Draft your XI",
    body: "Each squad needs exactly the formation's players. Higher points win the game.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-10 px-4 py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          4 players · 1 room · 100 bank points each
        </span>
        <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
          Tachkila
        </h1>
        <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          The football blind-bidding draft game. Reveal footballers, bid smart,
          complete your formation, and out-score your friends.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/create"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/80"
          >
            Create a room
          </Link>
          <Link
            href="/join"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-6 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Join with code
          </Link>
        </div>
      </div>

      <div className="grid w-full gap-4 sm:grid-cols-3">
        {steps.map((s, i) => (
          <div
            key={s.title}
            className="rounded-xl bg-card p-5 ring-1 ring-foreground/10"
          >
            <div className="mb-2 flex size-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {i + 1}
            </div>
            <div className="font-semibold">{s.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}