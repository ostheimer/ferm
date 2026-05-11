import { describe, expect, it } from "vitest";

import { buildCsv, escapeCsvCell } from "./escape";

describe("escapeCsvCell", () => {
  it("Werte ohne Sonderzeichen bleiben unquotiert", () => {
    expect(escapeCsvCell("Hochstand 4")).toBe("Hochstand 4");
    expect(escapeCsvCell("Reh")).toBe("Reh");
  });

  it("Werte mit Komma werden quotiert", () => {
    expect(escapeCsvCell("Strasshof, Niederoesterreich")).toBe(
      '"Strasshof, Niederoesterreich"'
    );
  });

  it("Anfuehrungszeichen werden verdoppelt", () => {
    expect(escapeCsvCell('Er sagte "Servus"')).toBe('"Er sagte ""Servus"""');
  });

  it("Werte mit Newline werden quotiert", () => {
    expect(escapeCsvCell("Zeile 1\nZeile 2")).toBe('"Zeile 1\nZeile 2"');
  });
});

describe("buildCsv", () => {
  it("Header + Zeilen werden mit Newlines verbunden", () => {
    const csv = buildCsv(["id", "name"], [["a", "Reh"], ["b", "Auerhahn"]]);
    expect(csv).toBe("id,name\na,Reh\nb,Auerhahn");
  });

  it("null/undefined Cells werden zu Leerstring", () => {
    const csv = buildCsv(["a", "b", "c"], [["x", null, undefined]]);
    expect(csv).toBe("a,b,c\nx,,");
  });

  it("Numbers werden via String()-Cast geschrieben", () => {
    const csv = buildCsv(["count"], [[42], [3.14]]);
    expect(csv).toBe("count\n42\n3.14");
  });

  it("Cell-Werte mit Komma in einer Zeile werden korrekt quotiert", () => {
    const csv = buildCsv(["a", "b"], [["x", "y,z"]]);
    expect(csv).toBe("a,b\nx,\"y,z\"");
  });
});
