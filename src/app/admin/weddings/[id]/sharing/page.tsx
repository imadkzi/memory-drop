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
  let uploadUrl: string | null = null;
  let qrDataUrl: string | null = null;
  let qrError: string | null = null;

  try {
    const token = decryptSecret(wedding.encryptedUploadToken);
    uploadUrl = `${appUrl}/upload/${token}`;
    qrDataUrl = await QRCode.toDataURL(uploadUrl, {
      margin: 2,
      width: 512,
      color: { dark: "#5c2a34", light: "#ffffff" },
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
      <p className="mt-4 max-w-xl font-sans text-base leading-relaxed text-muted-foreground">
        Give your guests a simple, private way to share their photos and videos.
        Pass the link or QR code — they can upload, then leave.
      </p>

      <div className="mt-10 grid gap-5 lg:grid-cols-2 lg:gap-6">
        <section className="rounded-2xl border border-ink/10 bg-white p-6 sm:p-7">
          <h2 className="font-serif text-2xl tracking-tight text-ink">
            The link
          </h2>
          <p className="mt-3 font-sans text-sm leading-relaxed text-muted-foreground">
            Drop it on a sign, an invitation, or a quiet message. Anyone with it
            can upload photos and videos directly to your collection.
          </p>
          <div className="mt-8">
            <CopyUploadLink
              weddingId={id}
              initialUrl={uploadUrl}
              fallbackLabel={`${appUrl}/upload/…`}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-ink/10 bg-white p-6 sm:p-7">
          <QrPanel
            weddingId={id}
            initialDataUrl={qrDataUrl}
            initialError={qrError}
          />
        </section>
      </div>
    </div>
  );
}
