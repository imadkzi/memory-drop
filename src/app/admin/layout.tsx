import Image from "next/image";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="light-wash relative min-h-screen overflow-x-clip">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <Image
          src="/floral-asset.webp"
          alt=""
          width={900}
          height={600}
          sizes="(max-width: 640px) 18rem, 26rem"
          className="absolute top-1/2 -left-16 w-[18rem] max-w-none -translate-y-1/2 -rotate-[12deg] opacity-70 sm:-left-12 sm:w-[22rem] md:w-[26rem]"
          loading="lazy"
          quality={70}
        />
        <Image
          src="/floral-asset.webp"
          alt=""
          width={900}
          height={600}
          sizes="(max-width: 640px) 26rem, 40rem"
          className="absolute -right-16 -bottom-16 w-[26rem] max-w-none rotate-[12deg] -scale-x-100 opacity-65 sm:-right-20 sm:-bottom-20 sm:w-[34rem] md:w-[40rem]"
          loading="lazy"
          quality={70}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
