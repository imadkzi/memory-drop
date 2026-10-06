import { Reveal } from "@/components/ui/reveal";

export function Story() {
  return (
    <section id="story" className="light-wash border-b border-ink/8">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-2 md:gap-16 md:px-8 md:py-20">
        <Reveal>
          <h2 className="font-serif text-3xl leading-tight tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
            The best photos leave with your guests.
          </h2>
        </Reveal>
        <Reveal
          delayMs={120}
          className="space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          <p>
            Everyone captures something. Then the real work starts — chasing
            files across WhatsApp, AirDrop, email, and half-finished albums
            that never quite feel like yours.
          </p>
          <p className="text-ink/85">
            Memory Drop is a single quiet channel. Guests send. You receive.
            The collection stays private, in a Drive folder you own.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
