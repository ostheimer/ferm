import type { Metadata } from "next";

import { AcceptInvitationClient } from "../accept-invitation-client";

export const metadata: Metadata = {
  title: "Einladung annehmen | hege",
  description: "Magic-Link für eine Einladung in eine Jagdgesellschaft."
};

export const dynamic = "force-dynamic";

interface InvitationLinkPageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitationLinkPage({ params }: InvitationLinkPageProps) {
  const { token } = await params;

  return (
    <main className="auth-layout">
      <AcceptInvitationClient initialToken={token} />
    </main>
  );
}
