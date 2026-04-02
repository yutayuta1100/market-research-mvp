import { CandidateDetailScreen } from "@/components/candidates/CandidateDetailScreen";

export const dynamic = "force-dynamic";

export default async function EnglishCandidatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;

  return <CandidateDetailScreen locale="en" slug={resolvedParams.slug} />;
}
