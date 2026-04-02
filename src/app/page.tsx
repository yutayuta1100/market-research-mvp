import { DashboardScreen } from "@/components/candidates/DashboardScreen";

type SearchParams = Record<string, string | string[] | undefined>;

export const dynamic = "force-dynamic";

export default function Home({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  return <DashboardScreen locale="ja" searchParams={searchParams} />;
}
