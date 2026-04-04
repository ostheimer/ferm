import { LoginForm } from "../../components/login-form";
import { redirectAuthenticatedUser } from "../../server/auth/guards";

export default async function LoginPage() {
  await redirectAuthenticatedUser();

  return <LoginForm />;
}
