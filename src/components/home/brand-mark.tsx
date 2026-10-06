import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  priority = false,
  src = "/logo-mark.png",
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
    />
  );
}
