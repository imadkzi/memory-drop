import { FolderHeart, Images, QrCode, Upload } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const chapters = [
  {
    title: "Create the wedding",
    copy: "Name the day. Connect your Google Drive. A private folder is ready before the first guest arrives.",
    icon: FolderHeart,
  },
  {
    title: "Pass the link",
    copy: "A URL or QR code on a card, a sign, an invitation. Guests open it on their phone and start.",
    icon: QrCode,
  },
  {
    title: "They contribute",
    copy: "Photos and videos leave their camera roll and arrive in your collection. No gallery for them to wander through.",
    icon: Upload,
  },
  {
    title: "You keep everything",
    copy: "Preview, download, delete. Add an admin if you want help sorting after the weekend.",
    icon: Images,
  },
];

export function Flow() {
  return (
    <section id="flow" className="relative z-0 overflow-x-clip bg-[#f6f0ea]">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-20">
        <Reveal className="mb-10 max-w-xl">
          <h2 className="mt-3 font-serif text-3xl tracking-tight text-ink sm:text-4xl">
            Four quiet moves.
          </h2>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2">
          {chapters.map((chapter, index) => {
            const Icon = chapter.icon;
            return (
              <Reveal key={chapter.title} delayMs={index * 80}>
                <article className="rounded-xl border border-ink/8 bg-[#faf6f2] p-6 shadow-[0_10px_30px_-18px_rgba(40,20,20,0.35)] sm:p-7">
                  <div
                    className={`mb-5 flex size-11 items-center justify-center rounded-lg ${
                      (Math.floor(index / 2) + index) % 2 === 0
                        ? "bg-bloom-soft text-bloom"
                        : "bg-champagne-soft text-[oklch(0.55_0.08_75)]"
                    }`}
                  >
                    <Icon className="size-5" strokeWidth={1.5} aria-hidden />
                  </div>
                  <h3 className="font-serif text-2xl tracking-tight text-ink">
                    {chapter.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                    {chapter.copy}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
