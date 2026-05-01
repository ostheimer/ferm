import { redirectAuthenticatedUser } from "../../server/auth/guards";

import { RegistrationForm } from "./registration-form";

export const dynamic = "force-dynamic";

export default async function RegistrierenPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await redirectAuthenticatedUser();

  const query = (await Promise.resolve(searchParams)) ?? {};
  const defaultPlanKey = readPlanKey(query.planKey ?? query.plan) ?? "starter";

  return (
    <main className="auth-layout">
      <RegistrationForm defaultPlanKey={defaultPlanKey} />
    </main>
  );
}

function readPlanKey(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (candidate === "starter" || candidate === "revier") {
    return candidate;
  }

  return undefined;
}
