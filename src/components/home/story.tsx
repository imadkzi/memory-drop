"use client";

import { Reveal } from "@/components/ui/reveal";
import { ParallaxPhotoSection } from "@/components/home/parallax-photo-bg";
import { photos } from "@/components/home/photos";

export function Story() {
  return (
    <ParallaxPhotoSection
      id="story"
      src={photos.lakeTerrace}
      className="border-b border-ink/8 text-ink"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-20 md:px-8 md:py-28">
        <div>
          <div className="chapter-rule mb-6 bg-ink" />
          <h2 className="font-serif text-3xl leading-tight tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
            The best photos leave with your guests.
          </h2>
        </div>
        <Reveal className="space-y-5 text-base leading-relaxed text-ink/70 sm:text-lg md:pt-10">
          <p>
            Everyone captures something. Then the real work starts: chasing
            files across WhatsApp, AirDrop, email, and half-finished albums
            that never quite feel like yours.
          </p>
          <p className="text-ink/90">
            Memory Drop is a single quiet channel. Guests send. You receive.
            The day ends in one place, not scattered across chats and half-finished
            albums.
          </p>
        </Reveal>
      </div>
    </ParallaxPhotoSection>
  );
}
