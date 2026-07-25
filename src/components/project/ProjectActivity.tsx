import { ActivityFeed } from "@/components/common/ActivityFeed";
import { EmptyState } from "@/components/common/EmptyState";
import { activityForProject } from "@/data/activity";

export function ProjectActivity({ projectId }: { projectId: string }) {
  const entries = activityForProject(projectId);
  if (entries.length === 0) return <EmptyState title="No activity yet" />;
  return <ActivityFeed entries={entries} />;
}
