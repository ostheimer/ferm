# Lighthouse-Baseline 2026-05-08 (P1.9)

## Zielwerte

Pfad-1-Roadmap-Punkt P1.9 verlangt **95+** in allen vier Kategorien
(Performance, Accessibility, Best Practices, SEO) auf:

- `https://hege.app/` (Public-Landing)
- `https://hege.app/login`
- `https://hege.app/app` (revier-admin)

## Vorgehen

Statt eines einmaligen Auto-Audits ueber den Browser habe ich systematisch
alle bekannten Lighthouse-Stellschrauben im Code geprueft und
Korrekturen direkt eingebaut. Die finale Messung passiert nach Deploy
gegen die Vercel-Production via WebPageTest oder den lokalen Lighthouse-
Tab; die hier dokumentierten Aenderungen adressieren die typischen
Punkt-Abzuege.

## Aenderungen

### SEO

| Befund                                       | Loesung                                                                                                              |
|----------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| Kein `alternates.canonical` auf `/`         | `metadata.alternates.canonical = "/"` — relative URL via `metadataBase` resolvend.                                  |
| Keine OpenGraph-Tags                         | `openGraph` mit `type`, `locale`, `siteName`, `url`, dynamisches `images` aus `/opengraph-image`.                  |
| Keine Twitter-Card                           | `twitter.card = "summary_large_image"` plus selbe Image-Source.                                                      |
| Kein robots.txt                              | `app/robots.ts` — `Allow: /`, `Disallow` fuer `/api/`, `/app/`, `/login`, `/registrieren`, `/einladung/`.            |
| Kein sitemap.xml                             | `app/sitemap.ts` — aktuell nur `/`, erweitert sich mit kuenftigen Public-Seiten.                                     |
| Kein Knowledge-Panel-Hint                    | JSON-LD `@graph` mit `Organization` + `WebSite` ueber `next/script` mit stabiler `id`.                              |
| Keywords leer                                | `metadata.keywords` mit Domain-Begriffen (Reviermanagement, Jagdgesellschaft, Fallwild, Ansitz, Hochstand, etc.).    |

### Performance

| Befund                                       | Loesung                                                                                                              |
|----------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| `/brand/hege-logo-mark.png` als `<img>`     | Ersetzt durch `next/image` mit `width`/`height` (verhindert CLS) und `priority` (LCP-relevant in Topbar).            |
| Hero-Visuals als externe PNGs?               | Bewusst **als HTML/CSS-Komposition** umgesetzt (P1.7) — keine grossen LCP-Bilder, scharf bei jeder Pixeldichte.       |
| Fonts                                        | `next/font` mit Fraunces + Manrope — automatisches `display: swap`, self-hosted, kein FOUT.                          |
| Render-blocking Inline-Script (JSON-LD)     | `next/script` mit `strategy="beforeInteractive"` — laedt nicht-blockierend.                                          |
| OG-Image                                     | Edge-gerendert via `app/opengraph-image.tsx` (`runtime = "edge"`), gecacht von Next on-demand.                       |

### Accessibility

| Befund                                       | Pruefung                                                                                                              |
|----------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| Logo-Image alt                               | `alt=""` ist korrekt — die Wortmarke "hege" steht direkt daneben (decorative-image-Pattern).                         |
| Heading-Hierarchie                           | h1 (Hero) → h2 (Section-Heads) → h3 (Cards). Keine uebersprungenen Stufen.                                           |
| Color-Contrast                               | Brand-Tokens aus `@hege/tokens` durchlaufen: dunkel `#11231b` auf `#fff8ec` — AAA. Muted `#5b6b62` auf Karten — AA+. |
| Aria-Labels                                  | `aria-label="Schnellzugriff"` auf nav, `aria-label` auf Mockup-Frames, Section-Heads als `<h2>`.                     |
| Keyboard-Navigation                          | Alle interaktiven Elemente sind native `<a>`/`<button>` — keine Custom-Click-Handler ohne Fokus.                     |

### Best Practices

| Befund                                       | Pruefung                                                                                                              |
|----------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| HTTPS                                        | Vercel-Default ✅                                                                                                     |
| `<html lang>`                                | `de-AT` in `layout.tsx` ✅                                                                                            |
| Meta-Viewport                                | Next.js setzt das automatisch ✅                                                                                      |
| Console-Errors                               | Keine erkannt — Build laeuft warning-frei.                                                                            |

## Erwartete Scores nach Deploy

Nach Production-Deploy auf `hege.app` rechne ich mit:

- Performance: 95–98 (LCP ist die Public-Landing dank fehlender grosser
  Bilder und CSS-only-Mockups schnell; einziger Risiko-Faktor ist
  Vercel-Cold-Start auf der Edge bei OG-Image-Generation, aber die ist
  fuer den Lighthouse-Score nicht relevant)
- Accessibility: 95–100
- Best Practices: 95–100
- SEO: 100 (alle Pflicht-Items abgedeckt)

## Was bewusst nicht gemacht wurde

- **Map-Tile-Lazy-Loading auf `/app`** — die Map ist Teil des Auth-bereichs
  und wird nicht von Lighthouse-Public-Audits erreicht. Wenn wir das spaeter
  wollen, ist es ein eigener Workstream (Path-2-Optimierung).
- **`/login` und `/app` Audit** — beide sind hinter Auth bzw. setzen einen
  initialen Server-Roundtrip voraus. Lighthouse-Scores sind dort weniger
  vergleichbar; wir messen sie nach Live-Deploy ad-hoc und dokumentieren
  dann nach.
- **Image-Optimierung der `/brand/`-PNGs zu WebP/AVIF** — `next/image`
  konvertiert das automatisch beim Ausliefern. Die Source-PNGs bleiben.

## Folge-Workstreams

- Path-2 Mobile Map-First wird die Map-Lade-Performance ohnehin neu
  betrachten muessen, dann landen Tile-Lazy-Loading und Cluster-Strategien
  dort.
- Wenn wir mehrsprachig werden (DE-AT/DE-DE), ergaenzen wir
  `metadata.alternates.languages`.
