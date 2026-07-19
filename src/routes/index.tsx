import { createFileRoute, Link } from "@tanstack/react-router";
import { Gift, Sparkles, Link2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-screen">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold">
          <Gift className="h-6 w-6 text-primary" />
          GiftLink
        </Link>
        <Link
          to="/create"
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-soft transition-transform hover:scale-105"
        >
          Create a gift
        </Link>
      </nav>

      <section className="mx-auto max-w-4xl px-6 pt-16 pb-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Free · No account needed
        </div>
        <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-7xl">
          A gift worth
          <br />
          <span className="bg-gradient-warm bg-clip-text text-transparent">unwrapping.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Wrap a message and a photo into a private link. Send it however you like.
          They tap — and a moment unfolds.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/create"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-warm px-8 py-4 text-base font-medium text-primary-foreground shadow-gift transition-transform hover:scale-[1.03]"
          >
            <Gift className="h-5 w-5" />
            Send your first gift
          </Link>
        </div>

        <div className="mt-24 grid gap-6 text-left sm:grid-cols-3">
          {[
            {
              icon: Gift,
              title: "Write your gift",
              body: "Add a heartfelt message and drop in a photo.",
            },
            {
              icon: Link2,
              title: "Get a private link",
              body: "A short, unguessable URL only you can share.",
            },
            {
              icon: Sparkles,
              title: "They unwrap it",
              body: "One tap, one animation, one unforgettable moment.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-3xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
