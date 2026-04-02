import { CandidateDetailScreen } from "@/components/candidates/CandidateDetailScreen";

export const dynamic = "force-dynamic";

export default async function CandidatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;

  return <CandidateDetailScreen locale="ja" slug={resolvedParams.slug} />;
}
