import Image from "next/image";

export function Polaroid({
  src,
  alt,
  className,
  caption,
}: {
  src: string;
  alt: string;
  className?: string;
  caption?: string;
}) {
  return (
    <figure className={`polaroid ${className ?? ""}`}>
      <div className="relative aspect-[4/5] overflow-hidden bg-blush-soft">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="200px"
        />
      </div>
      {caption ? (
        <figcaption className="mt-2 text-center text-[10px] tracking-wide text-ink/45">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
