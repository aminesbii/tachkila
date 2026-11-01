import Link from "next/link";

const steps = [
  {
    title: "Host sets the table",
    body: "The host creates the room, picks the formation and the 2–6 game players. The host never plays and holds no points.",
  },
  {
    title: "Everyone bids out loud",
    body: "Footballers come up goalkeepers first, then defenders, midfielders and attackers, left to right. The host only types the final bid and assigns the winner.",
  },
  {
    title: "Draft your XI",
    body: "Each game player completes the formation's squad. The team with the most points wins.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-10 px-4 py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          2–6 game players · one screen, no app for the players · 100 bank points each
        </span>
        <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
          Tachkila
        </h1>
        <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          The football live auction draft game. The host runs the whole room on one screen while
          everyone around the table bids out loud.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/create"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/80"
          >
            Create a room
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