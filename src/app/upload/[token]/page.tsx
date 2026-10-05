import { GuestUploadExperience } from "@/components/guest/guest-upload-experience";
import { hashUploadToken } from "@/lib/security/crypto";
import { prisma } from "@/lib/db/prisma";
import { mockWedding } from "@/lib/mock/data";

type Props = {
  params: Promise<{ token: string }>;
};

function GuestShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="light-wash relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-20 top-16 size-[18rem] rounded-full bg-bloom/15 blur-[90px]" />
        <div className="absolute -right-16 bottom-20 size-[16rem] rounded-full bg-champagne/35 blur-[80px]" />
      </div>
      <div className="relative z-10">{children}</div>
    </main>
  );
}

export default async function GuestUploadPage({ params }: Props) {
  const { token } = await params;

  if (token === "demo") {
    return (
      <GuestShell>
        <GuestUploadExperience
          token="demo"
          weddingName={mockWedding.name}
          uploadEnabled={true}
        />
      </GuestShell>
    );
  }

  const tokenHash = hashUploadToken(token);
  const wedding = await prisma.wedding.findFirst({
    where: { uploadTokenHash: tokenHash },
    select: { name: true, uploadEnabled: true },
  });

  if (!wedding) {
    return (
      <GuestShell>
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
          <div className="chapter-rule mb-5 bg-bloom" />
          <h1 className="font-serif text-3xl tracking-tight text-ink sm:text-4xl">
            This link isn&apos;t valid
          </h1>
          <p className="mt-4 font-sans text-muted-foreground">
            Ask the couple for a current upload link.
          </p>
        </div>
      </GuestShell>
    );
  }

  return (
    <GuestShell>
      <GuestUploadExperience
        token={token}
        weddingName={wedding.name}
        uploadEnabled={wedding.uploadEnabled}
      />
    </GuestShell>
  );
}
