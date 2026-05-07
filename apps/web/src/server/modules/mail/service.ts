/**
 * Mail-Versand-Stub.
 *
 * Aktuell ein No-op-Provider. Sobald ein echter Mail-Provider gewuenscht ist
 * (z. B. Resend), kann hier der Versand-Pfad ergaenzt werden, ohne dass die
 * Aufrufer (z. B. Member-Invitation-Service) ihren Code aendern muessen.
 *
 * Aktivierung:
 *   - `RESEND_API_KEY` in Vercel/`.env` setzen
 *   - Optional: `MAIL_FROM` (Default `noreply@hege.app`)
 *
 * Solange kein Provider konfiguriert ist, liefert `sendMail` `delivered:false`
 * und das aufrufende Feature kann den Code-Pfad als Fallback nutzen.
 */

interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface MailDeliveryResult {
  delivered: boolean;
  providerId?: string;
  reason?: string;
}

export function isMailEnabled(): boolean {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  return Boolean(apiKey && apiKey.length > 0);
}

export function getMailFromAddress(): string {
  return process.env.MAIL_FROM?.trim() || "noreply@hege.app";
}

export async function sendMail(message: MailMessage): Promise<MailDeliveryResult> {
  if (!isMailEnabled()) {
    return {
      delivered: false,
      reason: "mail-provider-not-configured"
    };
  }

  // Aktuell nur Stub. Echter Resend-Versand kommt mit dem Mail-Provider-PR.
  // Wir geben absichtlich `delivered: false` zurueck, damit aufrufende
  // Features die Mail nicht als zugestellt markieren, solange der Provider
  // nicht echt angeschlossen ist.
  return {
    delivered: false,
    reason: "mail-provider-stub"
  };
}

// Re-Export, falls Tests die MailMessage-Form brauchen.
export type { MailMessage };
