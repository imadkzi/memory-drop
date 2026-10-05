import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function WeddingIndexPage({ params }: Props) {
  const { id } = await params;
  redirect(`/admin/weddings/${id}/media`);
}
