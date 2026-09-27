const phrases = [
  "All perfumes in store are 100% original",
  "Scan the barcode to confirm authenticity",
  "Happy shopping — we love you",
];

function MarqueeCopy({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {Array.from({ length: 4 }, (_, loop) =>
        phrases.map((phrase) => (
          <span key={`${loop}-${phrase}`} className="flex items-center">
            <span className="px-8 text-[11px] tracking-[0.22em] uppercase sm:text-xs">{phrase}</span>
            <span className="text-brass" aria-hidden>
              ◆
            </span>
          </span>
        )),
      )}
    </div>
  );
}

export function AnnouncementMarquee() {
  return (
    <div
      className="overflow-hidden border-b border-brass/40 bg-ink text-cream"
      aria-label="All perfumes in store are 100% original. Always scan the barcode to confirm the authenticity of your products. Happy shopping — we love you."
    >
      <div className="aurane-marquee flex w-max py-3">
        <MarqueeCopy />
        <MarqueeCopy hidden />
      </div>
    </div>
  );
}
