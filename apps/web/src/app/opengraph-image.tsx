import { ImageResponse } from "next/og";

/**
 * Dynamisches OpenGraph-Bild fuer die Landing-Seite.
 *
 * Wir bauen das Bild als JSX (nicht als statisches PNG), damit Tagline,
 * Brandfarben und Wordmark mit den Tokens nachziehen, ohne dass jemand
 * ein Asset neu rendern muss. Das Bild wird von Next on-demand bei der
 * ersten Anforderung gerendert und danach gecacht.
 *
 * Hinweis: `next/og` laeuft im Edge-Runtime und unterstuetzt nur ein
 * eingeschraenktes CSS-Subset (Flexbox, kein CSS Grid). Wir verzichten
 * deshalb auf den HegeWordmark-Component (SVG mit `<text>`) und setzen
 * den Schriftzug direkt als Text mit Georgia-Fallback.
 */
export const runtime = "edge";
export const alt = "hege — Reviermanagement für Jagdgesellschaften";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #fff8ec 0%, #f1e8cf 60%, #cfd9a6 100%)",
          fontFamily: "Georgia, serif"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "20px",
              background: "#11231b",
              color: "#cfd9a6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              fontWeight: 700
            }}
          >
            h
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#24493a",
              letterSpacing: "0.06em",
              textTransform: "uppercase"
            }}
          >
            Reviermanagement
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px"
          }}
        >
          <div
            style={{
              fontSize: "120px",
              fontWeight: 700,
              color: "#11231b",
              letterSpacing: "-4px",
              lineHeight: 1
            }}
          >
            hege
          </div>
          <div
            style={{
              fontSize: "44px",
              color: "#24493a",
              lineHeight: 1.15,
              maxWidth: "900px",
              fontWeight: 600
            }}
          >
            Revierbetrieb, Protokolle und Feldmeldungen in einer klaren Oberfläche.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "22px",
            color: "#5b6b62"
          }}
        >
          <span>Backoffice und App auf einer Datenbasis</span>
          <span>Für Jagdgesellschaften in Österreich</span>
        </div>
      </div>
    ),
    size
  );
}
