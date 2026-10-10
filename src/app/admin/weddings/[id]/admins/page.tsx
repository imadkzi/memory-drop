import { notFound } from "next/navigation";
import { AdminManager } from "@/components/admin/admin-manager";
import { requireSession, requireWeddingAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function WeddingAdminsPage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();
  const membership = await requireWeddingAccess(session.user.id, id);
  if (!membership) notFound();

  const wedding = await prisma.wedding.findUnique({ where: { id } });
  if (!wedding) notFound();

  const admins = await prisma.weddingAdmin.findMany({
    where: { weddingId: id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  const invites = await prisma.weddingAdminInvite.findMany({
    where: {
      weddingId: id,
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-10">
      <header className="border-b border-ink/10 pb-8">
        <h1 className="font-serif text-4xl tracking-tight text-ink sm:text-5xl">
          Team
        </h1>
        <p className="mt-3 max-w-xl font-sans text-base leading-relaxed text-ink/60">
          Invite others with a private link. They create an account or sign in,
          then accept to help manage this collection.
        </p>
      </header>

      <div>
        <AdminManager
          weddingId={id}
          isOwner={membership.role === "OWNER"}
          currentUserId={session.user.id}
          admins={admins.map((admin) => ({
            id: admin.id,
            role: admin.role,
            userId: admin.userId,
            name: admin.user.name,
            email: admin.user.email,
          }))}
          invites={invites.map((invite) => ({
            id: invite.id,
            email: invite.email,
            role: "ADMIN" as const,
            status: "PENDING" as const,
            expiresAt: invite.expiresAt.toISOString(),
            createdAt: invite.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
