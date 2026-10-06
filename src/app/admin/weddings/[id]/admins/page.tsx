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
    <div className="rounded-2xl border border-ink/8 bg-white/95 p-6 shadow-[0_12px_40px_-28px_rgba(40,20,20,0.25)] sm:p-8 lg:p-10">
      <p className="font-sans text-[11px] tracking-[0.28em] text-bloom uppercase">
        People
      </p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight text-ink sm:text-5xl">
        Team
      </h1>
      <p className="mt-4 max-w-xl font-sans text-base leading-relaxed text-muted-foreground">
        Invite others with a private link. They create an account or sign in,
        then accept to help manage this collection.
      </p>

      <div className="mt-10">
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
