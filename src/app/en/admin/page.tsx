import { AdminScreen } from "@/components/admin/AdminScreen";
import { loadAdminData } from "@/lib/jobs/admin";

export const dynamic = "force-dynamic";

export default async function EnglishAdminPage() {
  const adminData = await loadAdminData("en");

  return (
    <AdminScreen
      candidateCount={adminData.dashboard.candidates.length}
      connectorStatuses={adminData.dashboard.connectorStatuses}
      jobRuns={adminData.jobRuns}
      latestObservedAt={adminData.latestObservedAt}
      locale="en"
      persistence={adminData.persistence}
      scheduler={adminData.scheduler}
      signalCount={adminData.signalCount}
    />
  );
}
