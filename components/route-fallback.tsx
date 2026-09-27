"use client";

export function RouteLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16">
      <div className="h-3 w-24 bg-cream-deep" />
      <div className="mt-4 h-10 w-2/3 max-w-md bg-cream-deep" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="aspect-[3/4] bg-cream-deep" />
            <div className="h-3 w-1/2 bg-cream-deep" />
            <div className="h-3 w-1/3 bg-line" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-start justify-center px-5 py-20">
      <p className="text-xs uppercase tracking-[0.28em] text-brass-deep">Aurane</p>
      <h1 className="mt-3 font-serif text-4xl">Something slipped.</h1>
      <p className="mt-4 text-sm leading-6 text-ink-soft">
        This page could not be opened. Please try again in a moment.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 h-12 bg-ink px-6 text-sm text-cream"
      >
        Try again
      </button>
    </div>
  );
}
