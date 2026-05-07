import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { isMailEnabled, getMailFromAddress, sendMail } from "./service";

describe("mail service stub", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.MAIL_FROM;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("ist deaktiviert ohne RESEND_API_KEY", () => {
    expect(isMailEnabled()).toBe(false);
  });

  it("ist aktiviert mit gesetztem RESEND_API_KEY", () => {
    process.env.RESEND_API_KEY = "re_test_key";
    expect(isMailEnabled()).toBe(true);
  });

  it("liefert Default MAIL_FROM, wenn keine Env gesetzt", () => {
    expect(getMailFromAddress()).toBe("noreply@hege.app");
  });

  it("respektiert MAIL_FROM, wenn gesetzt", () => {
    process.env.MAIL_FROM = "einladung@hege.app";
    expect(getMailFromAddress()).toBe("einladung@hege.app");
  });

  it("sendMail meldet delivered:false ohne Provider", async () => {
    const result = await sendMail({
      to: "test@example.com",
      subject: "Test",
      text: "Hallo"
    });
    expect(result.delivered).toBe(false);
    expect(result.reason).toBe("mail-provider-not-configured");
  });

  it("sendMail mit Provider liefert weiterhin Stub-Antwort (echter Versand kommt spaeter)", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    const result = await sendMail({
      to: "test@example.com",
      subject: "Test",
      text: "Hallo"
    });
    expect(result.delivered).toBe(false);
    expect(result.reason).toBe("mail-provider-stub");
  });
});
