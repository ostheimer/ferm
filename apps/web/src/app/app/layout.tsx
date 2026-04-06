import type { ReactNode } from "react";

import { Shell } from "../../components/shell";
import { getOptionalAuthContext } from "../../server/auth/context";

interface AppLayoutProps {
  children: ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const viewer = await getOptionalAuthContext();

  return <Shell viewer={viewer}>{children}</Shell>;
}
