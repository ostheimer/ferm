import { LoginForm } from "../../components/login-form";
import { toSafePostAuthPath } from "../../lib/auth-redirects";
import { redirectAuthenticatedUser } from "../../server/auth/guards";

interface LoginPageProps {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const nextTarget = toSafePostAuthPath(readSearchParam((await Promise.resolve(searchParams))?.next));

  await redirectAuthenticatedUser(nextTarget);

  return (
    <main className="auth-layout">
      <LoginForm nextTarget={nextTarget} />
    </main>
  );
}

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
