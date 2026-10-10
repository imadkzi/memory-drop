import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#f5e6df] px-6 py-16">
      <div className="mb-8">
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

      <div className="w-full max-w-sm border border-ink/10 bg-white p-6 sm:p-8">
        <LoginForm />
      </div>
    </main>
  );
}
