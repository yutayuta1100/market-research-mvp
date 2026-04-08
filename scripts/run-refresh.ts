import { runCandidateRefresh } from "@/lib/jobs/refresh-candidates";

runCandidateRefresh({
  trigger: "manual",
}).then((jobRun) => {
  console.log(JSON.stringify(jobRun, null, 2));
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
