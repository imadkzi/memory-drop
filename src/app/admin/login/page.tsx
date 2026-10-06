import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <main className="light-wash relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-10 size-[22rem] rounded-full bg-bloom/15 blur-[100px]" />
        <div className="absolute -right-16 bottom-10 size-[20rem] rounded-full bg-champagne/30 blur-[90px]" />
      </div>

      <div className="relative z-10 mb-8">
        <Link href="/" className="inline-flex">
          <Image
            src="/logo-bloom.webp"
            alt="MemoryDrop"
            width={280}
            height={50}
            className="h-10 w-auto object-contain sm:h-12"
            priority
          />
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-sm rounded-xl border border-ink/8 bg-[#faf6f2]/90 p-6 shadow-[0_18px_50px_-28px_rgba(40,20,20,0.35)] sm:p-8">
        <LoginForm />
      </div>
    </main>
  );
}
