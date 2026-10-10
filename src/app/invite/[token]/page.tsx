import Image from "next/image";
import Link from "next/link";
import { AcceptInviteExperience } from "@/components/admin/accept-invite-experience";

type Props = { params: Promise<{ token: string }> };

export default async function InviteAcceptPage({ params }: Props) {
  const { token } = await params;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#f5e6df] px-6 py-16">
      <div className="mb-8">
        <Link href="/" className="inline-flex">
          <Image
            src="/brand/logo-bloom.webp"
            alt="MemoryDrop"
            width={280}
            height={50}
            className="h-10 w-auto object-contain sm:h-12"
            priority
          />
        </Link>
      </div>

      <div className="w-full max-w-md border border-ink/10 bg-white p-6 sm:p-8">
        <AcceptInviteExperience token={token} />
      </div>
    </main>
  );
}
