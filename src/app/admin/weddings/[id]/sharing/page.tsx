import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { CopyUploadLink } from "@/components/admin/copy-upload-link";
import { QrPanel } from "@/components/admin/qr-panel";
import { requireSession, requireWeddingAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { decryptSecret } from "@/lib/security/crypto";
import { getEnv } from "@/lib/validation/env";

type Props = { params: Promise<{ id: string }> };

export default async function WeddingSharingPage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();
  const membership = await requireWeddingAccess(session.user.id, id);
  if (!membership) notFound();

  const wedding = await prisma.wedding.findUnique({ where: { id } });
  if (!wedding) notFound();

  const appUrl = getEnv().NEXT_PUBLIC_APP_URL;
  const guestPathHint = `${appUrl}/upload/…`;

  let qrDataUrl: string | null = null;
  let qrError: string | null = null;
  try {
    const token = decryptSecret(wedding.encryptedUploadToken);
    const url = `${appUrl}/upload/${token}`;
    qrDataUrl = await QRCode.toDataURL(url, {
      margin: 2,
      width: 512,
      color: { dark: "#5c2a34", light: "#fffaf7" },
    });
  } catch {
    qrError = "QR code unavailable.";
  }

  return (
    <div className="rounded-2xl border border-ink/8 bg-white/95 p-6 shadow-[0_12px_40px_-28px_rgba(40,20,20,0.25)] sm:p-8 lg:p-10">
      <p className="font-sans text-[11px] tracking-[0.28em] text-bloom uppercase">
        For your guests
      </p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight text-ink sm:text-5xl">
        Link &amp; Sharing
      </h1>
      <p className="mt-4 max-w-md font-sans text-base leading-relaxed text-muted-foreground">
        One private channel. Pass the link or the code — guests contribute, then leave.
      </p>

      <div className="mt-12 grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
        <section>
          <div className="chapter-rule mb-5 bg-bloom" />
          <h2 className="font-serif text-2xl tracking-tight text-ink">The link</h2>
          <p className="mt-3 font-sans text-sm leading-relaxed text-muted-foreground">
            Drop it on a sign, an invitation, or a quiet message. Anyone with it can upload.
          </p>
          <div className="mt-8">
            <CopyUploadLink weddingId={id} fallbackLabel={guestPathHint} />
          </div>
        </section>

        <QrPanel weddingId={id} initialDataUrl={qrDataUrl} initialError={qrError} />
      </div>
    </div>
  );
}
