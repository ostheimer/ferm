import type { Metadata } from "next";

import { AcceptInvitationClient } from "./accept-invitation-client";

export const metadata: Metadata = {
  title: "Einladung annehmen | hege",
  description: "Einladungs-Code einlösen und Mitgliedschaft im Revier aktivieren."
};

export const dynamic = "force-dynamic";

interface InvitationCodePageProps {
  searchParams: Promise<{ code?: string | string[] }>;
}

export default async function InvitationCodePage({ searchParams }: InvitationCodePageProps) {
  const params = await searchParams;
  const initialCode = pickFirstParam(params.code);

  return (
    <main className="auth-layout">
      <AcceptInvitationClient initialCode={initialCode} />
    </main>
  );
}

function pickFirstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}
