import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  priority = false,
  src = "/brand/logo-mark.webp",
}: {
  className?: string;
  priority?: boolean;
  src?: string;
}) {
  return (
    <Image
      src={src}
      alt="MemoryDrop"
      width={320}
      height={58}
      className={cn(
        "h-7 w-auto bg-transparent object-contain sm:h-8",
        className,
      )}
      priority={priority}
      quality={85}
    />
  );
}
