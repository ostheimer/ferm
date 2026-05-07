import { describe, expect, it } from "vitest";

import {
  generateInvitationCode,
  generateInvitationToken,
  hashInvitationSecret,
  normalizeInvitationCode
} from "./codes";

describe("generateInvitationCode", () => {
  it("liefert 11 Zeichen im Format XXX-XXX-XXX", () => {
    const code = generateInvitationCode();
    expect(code).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{3}$/);
  });

  it("nutzt nur Zeichen aus dem ambiguity-freien Alphabet", () => {
    const allowed = /^[2-9ABCDEFGHJKMNPQRSTVWXYZ-]+$/;
    for (let attempt = 0; attempt < 50; attempt += 1) {
      expect(generateInvitationCode()).toMatch(allowed);
    }
  });

  it("generiert kollisionsfrei (1000 Codes alle einzigartig)", () => {
    const codes = new Set<string>();
    for (let attempt = 0; attempt < 1000; attempt += 1) {
      codes.add(generateInvitationCode());
    }
    expect(codes.size).toBe(1000);
  });
});

describe("generateInvitationToken", () => {
  it("erzeugt einen base64url-Token mit ausreichender Laenge", () => {
    const token = generateInvitationToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token.length).toBeGreaterThanOrEqual(40);
  });

  it("ist zwischen Aufrufen verschieden", () => {
    const tokens = new Set<string>();
    for (let attempt = 0; attempt < 100; attempt += 1) {
      tokens.add(generateInvitationToken());
    }
    expect(tokens.size).toBe(100);
  });
});

describe("normalizeInvitationCode", () => {
  it("entfernt Leerzeichen und Bindestriche", () => {
    expect(normalizeInvitationCode("4FX-9KQ-22")).toBe("4FX9KQ22");
    expect(normalizeInvitationCode("4 FX 9KQ 22")).toBe("4FX9KQ22");
    expect(normalizeInvitationCode("4FX9KQ22")).toBe("4FX9KQ22");
  });

  it("normalisiert Kleinschreibung", () => {
    expect(normalizeInvitationCode("4fx-9kq-22")).toBe("4FX9KQ22");
  });
});

describe("hashInvitationSecret", () => {
  it("ist deterministisch", () => {
    const hashA = hashInvitationSecret("4FX9KQ22");
    const hashB = hashInvitationSecret("4FX9KQ22");
    expect(hashA).toBe(hashB);
  });

  it("liefert verschiedene Hashes fuer verschiedene Inputs", () => {
    const hashA = hashInvitationSecret("4FX9KQ22");
    const hashB = hashInvitationSecret("4FX9KQ23");
    expect(hashA).not.toBe(hashB);
  });

  it("hat sha256-Laenge (64 hex-Zeichen)", () => {
    expect(hashInvitationSecret("test")).toMatch(/^[a-f0-9]{64}$/);
  });

  it("matcht Code-Eingabe nach Normalisierung", () => {
    const stored = hashInvitationSecret(normalizeInvitationCode("4FX-9KQ-22"));
    const userInput = hashInvitationSecret(normalizeInvitationCode("4fx 9kq 22"));
    expect(stored).toBe(userInput);
  });
});
