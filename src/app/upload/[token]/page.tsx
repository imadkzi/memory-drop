import { GuestUploadExperience } from "@/components/guest/guest-upload-experience";
import { MotionProvider } from "@/components/motion/lazy-provider";
import { hashUploadToken } from "@/lib/security/crypto";
import { prisma } from "@/lib/db/prisma";
import { mockWedding } from "@/lib/mock/data";

type Props = {
  params: Promise<{ token: string }>;
};

function GuestShell({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <main className="relative min-h-screen overflow-x-clip bg-[#f5e6df] paper-grain">
        {children}
      </main>
    </MotionProvider>
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
          driveReady={true}
        />
      </GuestShell>
    );
  }

  const tokenHash = hashUploadToken(token);
  const wedding = await prisma.wedding.findFirst({
    where: { uploadTokenHash: tokenHash },
    select: {
      name: true,
      uploadEnabled: true,
      driveConnectionId: true,
      driveFolderId: true,
    },
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
        driveReady={Boolean(wedding.driveConnectionId && wedding.driveFolderId)}
      />
    </GuestShell>
  );
}
