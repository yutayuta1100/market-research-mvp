import { AdminScreen } from "@/components/admin/AdminScreen";
import { loadAdminData } from "@/lib/jobs/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const adminData = await loadAdminData("ja");

  return (
    <AdminScreen
      candidateCount={adminData.dashboard.candidates.length}
      connectorStatuses={adminData.dashboard.connectorStatuses}
      jobRuns={adminData.jobRuns}
      latestObservedAt={adminData.latestObservedAt}
      locale="ja"
      persistence={adminData.persistence}
      scheduler={adminData.scheduler}
      signalCount={adminData.signalCount}
    />
  );
}
