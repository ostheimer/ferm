import { Shell } from "../../components/shell";
import { getOptionalAuthContext } from "../../server/auth/context";
import { getDashboardSnapshot } from "../../server/modules/dashboard/queries";

interface AppLayoutProps {
  children?: React.ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const viewer = await getOptionalAuthContext();

  // Notification-IDs aus dem Dashboard-Snapshot pre-fetchen, damit das
  // Sidebar-Unread-Badge sofort beim ersten Render einen Wert hat.
  // Wenn kein Viewer (anonym/error), bleibt notificationIds undefined
  // und das Badge wird nicht gerendert.
  let notificationIds: ReadonlyArray<string> | undefined;
  if (viewer) {
    try {
      const snapshot = await getDashboardSnapshot({ context: viewer });
      notificationIds = snapshot.overview.letzteBenachrichtigungen.map((entry) => entry.id);
    } catch {
      // Dashboard-Snapshot-Fehler darf den App-Shell nicht blockieren —
      // Badge bleibt einfach versteckt. Das eigentliche Notification-
      // Center bietet einen eigenen Refresh-Pfad, falls jemand die
      // Liste sehen will.
      notificationIds = undefined;
    }
  }

  return (
    <Shell notificationIds={notificationIds} viewer={viewer}>
      {children}
    </Shell>
  );
}
