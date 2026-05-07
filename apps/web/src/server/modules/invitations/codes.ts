import { createHash, randomBytes } from "node:crypto";

/**
 * Erlaubtes Alphabet fuer Einladungscodes.
 *
 * Bewusst ohne 0/O/I/1/L/U, damit Code per Telefon/Whatsapp eindeutig bleibt.
 * 32 Zeichen Crockford-Base32-Variante.
 */
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

const CODE_LENGTH = 9;
const CODE_GROUP_SIZE = 3;

/**
 * Erzeugt einen menschenlesbaren 9-Zeichen-Code in 3er-Gruppen,
 * z. B. "4FX-9KQ-22". Crypto-secure (`randomBytes`).
 */
export function generateInvitationCode(): string {
  const buffer = randomBytes(CODE_LENGTH);
  let code = "";

  for (let index = 0; index < CODE_LENGTH; index += 1) {
    const byte = buffer[index] ?? 0;
    code += CODE_ALPHABET[byte % CODE_ALPHABET.length];
  }

  return [
    code.slice(0, CODE_GROUP_SIZE),
    code.slice(CODE_GROUP_SIZE, CODE_GROUP_SIZE * 2),
    code.slice(CODE_GROUP_SIZE * 2)
  ].join("-");
}

/**
 * Erzeugt ein 32-Byte-Token fuer den Magic-Link, base64url-encoded.
 */
export function generateInvitationToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Normalisiert einen Code fuer Vergleich/Hashing:
 * - Whitespace und Bindestriche entfernen
 * - Uppercase
 *
 * Damit funktionieren auch Eingaben wie "4fx 9kq 22" oder "4FX9KQ22".
 */
export function normalizeInvitationCode(input: string): string {
  return input.replace(/[\s-]/g, "").toUpperCase();
}

/**
 * Hash-Funktion fuer Codes und Tokens. Wir speichern nur den Hash;
 * der Klartext wird einmal zurueckgegeben und ist danach unwiederbringlich.
 */
export function hashInvitationSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}
