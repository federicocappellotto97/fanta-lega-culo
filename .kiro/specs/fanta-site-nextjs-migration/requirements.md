# Requirements Document

## Introduction

Migrazione dell'intero progetto `fanta-lega-culo` da Vite + vanilla JS a Next.js (App Router, TypeScript), consolidando in un'unica repository il sito web della lega privata di fantacalcio e il bot Telegram attualmente ospitati separatamente in `ottavio.dev`. Al termine della migrazione, `ottavio.dev` non conterrà più alcun codice relativo al fantacalcio.

Le quattro pagine attuali (Home, Albo d'oro, Partecipanti, scheda manager) vengono convertite in page components del App Router di Next.js. La fonte unica di dati è il layer `lib/data/` di `fanta-lega-culo`, che usa lo schema ricco di `fanta-lega-culo/js/` (nome + fondazione + colori + emoji). Il bot Telegram viene spostato in `lib/bot/` (logica) e `app/api/telegram/route.ts` (endpoint).

## Glossary

- **Site**: il progetto `fanta-lega-culo` dopo la migrazione a Next.js
- **Bot**: il bot Telegram Fantacalcio, precedentemente in `ottavio.dev/lib/fantabot/` e `ottavio.dev/pages/api/fantabot/telegram.js`
- **DataLayer**: il modulo `lib/data/` contenente `managers.ts`, `squads.ts`, `halloffame.ts` — fonte unica di verità per i dati della lega
- **Manager**: partecipante alla lega di fantacalcio, identificato da slug stabile
- **Squad**: squadra storica della lega, identificata da slug stabile
- **Edizione**: stagione della lega (es. `"8.0"`, `"2025/26"`)
- **Palmares**: insieme di campionati, coppe, supercoppe e retrocessioni vinti da un manager
- **Medagliere**: classifica aggregata dei manager per trofei vinti
- **AlboDOro**: storico stagione per stagione di campioni, coppa, supercoppa e retrocesso
- **AppRouter**: sistema di routing file-system di Next.js 13+ con directory `app/`
- **RouteHandler**: file `route.ts` nell'App Router, equivalente alle API Routes del Pages Router
- **ottavio.dev**: sito personale da cui viene rimosso tutto il codice fantacalcio

---

## Requirements

### Requirement 1 — Conversione del progetto a Next.js (App Router, TypeScript)

**User Story:** As a developer, I want fanta-lega-culo to be a Next.js App Router project written in TypeScript, so that the codebase is consistent with modern React conventions and supports server-side features needed by the bot.

#### Acceptance Criteria

1. THE Site SHALL be a Next.js project (version ≥ 14) configured with the App Router and TypeScript.
2. THE Site SHALL include a `tsconfig.json` with `strict: true` and path alias `@/*` pointing to the project root.
3. THE Site SHALL include a `next.config.ts` (or `next.config.js`) that enables static file serving from the existing `public/` directory unchanged.
4. THE Site SHALL depend on `next`, `react`, `react-dom`, and `typescript` in `package.json`, replacing the existing `vite` dependency.
5. WHEN the project is built with `next build`, THE Site SHALL produce no TypeScript compilation errors.

---

### Requirement 2 — DataLayer: fonte unica di verità

**User Story:** As a developer, I want a single TypeScript data layer in `lib/data/`, so that both the UI pages and the bot share identical data without duplication.

#### Acceptance Criteria

1. THE DataLayer SHALL export a `MANAGERS` array typed with a `Manager` interface from `lib/data/managers.ts`, containing all fields present in `fanta-lega-culo/js/managers.js` (id, nome, fotoColore, fotoBN, presenteDal, presenteFinoAl, squadre).
2. THE DataLayer SHALL export a `SQUADS` record typed with a `Squad` interface from `lib/data/squads.ts`, containing all fields present in `fanta-lega-culo/js/squads.js` (nome, fondazione, colori, emoji?).
3. THE DataLayer SHALL export `ALBO_D_ORO`, `getPalmares`, `getMedagliere`, and `getManagerName` from `lib/data/halloffame.ts`, functionally equivalent to `fanta-lega-culo/js/halloffame.js`.
4. THE DataLayer SHALL export helper functions `getSquadName`, `getSquadData`, `getSquadCrestPath`, `getSquadShirtPath` from `lib/data/squads.ts`, functionally equivalent to `fanta-lega-culo/js/squads.js`.
5. IF a field exists only in `fanta-lega-culo/js/squads.js` (fondazione, colori, emoji) and not in `ottavio.dev/lib/fantabot/squads.js`, THEN THE DataLayer SHALL use the richer schema from `fanta-lega-culo/js/squads.js`.
6. THE DataLayer SHALL NOT duplicate data: each of MANAGERS, SQUADS, and ALBO_D_ORO is defined in exactly one file.

---

### Requirement 3 — Pagine Next.js: Home

**User Story:** As a visitor, I want to view the league's home page at the root URL `/`, so that I can see key league statistics, the latest season result, the all-time podium, and a preview of the current managers.

#### Acceptance Criteria

1. THE Site SHALL serve the Home page at the URL `/`.
2. THE Site SHALL render the Home page as a Next.js Server Component located at `app/page.tsx`.
3. THE Site SHALL display on the Home page: total editions count, total manager count, active manager count, last season result (winner, coppa, supercoppa, retrocesso), all-time top-3 podium, and a preview grid of active managers.
4. WHEN a visitor clicks a manager card on the Home page, THE Site SHALL navigate to the URL `/manager/[id]`.
5. WHEN a visitor clicks the "Albo d'oro" link on the Home page, THE Site SHALL navigate to `/albo`.
6. WHEN a visitor clicks the "Partecipanti" link on the Home page, THE Site SHALL navigate to `/partecipanti`.

---

### Requirement 4 — Pagine Next.js: Albo d'oro

**User Story:** As a visitor, I want to view the hall of fame at `/albo`, so that I can browse season results and the aggregate medal table.

#### Acceptance Criteria

1. THE Site SHALL serve the Albo d'oro page at the URL `/albo`.
2. THE Site SHALL render the Albo d'oro page as a Next.js Server Component located at `app/albo/page.tsx`.
3. THE Site SHALL display two tab views on the Albo d'oro page: "Stagione per stagione" (all editions in reverse order) and "Medagliere" (sorted by campionati, coppe, supercoppe, then ascending retrocessioni).
4. WHEN a visitor clicks a manager name on the Albo d'oro page, THE Site SHALL navigate to `/manager/[id]`.

---

### Requirement 5 — Pagine Next.js: Partecipanti

**User Story:** As a visitor, I want to browse all managers at `/partecipanti`, so that I can find any past or current participant and open their individual card.

#### Acceptance Criteria

1. THE Site SHALL serve the Partecipanti page at the URL `/partecipanti`.
2. THE Site SHALL render the Partecipanti page as a Next.js Server Component located at `app/partecipanti/page.tsx`.
3. THE Site SHALL display a figurina grid with all managers, active managers listed before ex-managers, each group sorted alphabetically by `nome` in Italian locale.
4. WHEN a visitor clicks a figurina card, THE Site SHALL navigate to `/manager/[id]`.

---

### Requirement 6 — Pagine Next.js: scheda manager

**User Story:** As a visitor, I want to view an individual manager's profile at `/manager/[id]`, so that I can see their career history, current squad details, and trophy cabinet.

#### Acceptance Criteria

1. THE Site SHALL serve individual manager pages at the URL pattern `/manager/[id]`.
2. THE Site SHALL render each manager page as a Next.js Server Component located at `app/manager/[id]/page.tsx`.
3. THE Site SHALL call `generateStaticParams` in `app/manager/[id]/page.tsx` to pre-render one page for each manager id in MANAGERS at build time.
4. WHEN a visitor navigates to `/manager/[id]` with an id not present in MANAGERS, THE Site SHALL render a 404-equivalent "not found" page using Next.js `notFound()`.
5. THE Site SHALL display on the manager page: manager name, league presence (presenteDal/presenteFinoAl), current squad card (nome, fondazione, colori, emoji), career timeline, and palmares (campionati, coppe, supercoppe, retrocessioni).
6. THE Site SHALL include a breadcrumb link from the manager page back to `/partecipanti`.

---

### Requirement 7 — Migrare il bot Telegram in `lib/bot/`

**User Story:** As a developer, I want the Telegram bot logic centralized in `lib/bot/`, so that helper functions and AI are decoupled from the HTTP handler and can be tested independently.

#### Acceptance Criteria

1. THE Bot logic from `ottavio.dev/lib/fantabot/helper.js` SHALL be migrated to `lib/bot/helper.ts` in the Site.
2. THE Bot logic from `ottavio.dev/lib/fantabot/ai.js` SHALL be migrated to `lib/bot/ai.ts` in the Site.
3. THE Bot's `lib/bot/ai.ts` SHALL import MANAGERS, ALBO_D_ORO, and getSquadName exclusively from the DataLayer (`lib/data/`), not from any local copy.
4. THE Bot's `lib/bot/helper.ts` SHALL import getEmoji and team definitions without duplicating squad data already present in the DataLayer.
5. THE Site SHALL place CSV data files (classifica, calendario, rose) and `regolamento.txt` in `lib/bot/data/`, migrated from `ottavio.dev/lib/fantabot/data/`.
6. WHEN `lib/bot/ai.ts` imports CSV files, THE Bot SHALL use Next.js-compatible static import syntax (same pattern already used in `ottavio.dev/lib/fantabot/ai.js`).

---

### Requirement 8 — Endpoint Telegram Bot (`app/api/telegram/route.ts`)

**User Story:** As an operator, I want the Telegram webhook to be served at `POST /api/telegram`, so that it receives updates from Telegram and dispatches them to the correct handler.

#### Acceptance Criteria

1. THE Site SHALL expose a POST Route Handler at `app/api/telegram/route.ts`.
2. WHEN a POST request arrives at `/api/telegram`, THE Site SHALL parse the JSON body and dispatch to the appropriate command handler.
3. THE Site SHALL support all commands present in `ottavio.dev/pages/api/fantabot/telegram.js`: `/ranking`, `/next`, `/teams`, `/halloffame`, `/managers`, `/ai`.
4. THE Site SHALL resolve manager photo URLs using the Site's own domain (read from `process.env.NEXT_PUBLIC_SITE_URL` or equivalent), replacing the hardcoded `https://www.ottavio.dev` base URL.
5. THE Site SHALL read `BOT_TOKEN` and `GEMINI_API_KEY` from environment variables, with no hardcoded credentials.
6. IF the request method is not POST, THEN THE Route Handler SHALL return HTTP 405.

---

### Requirement 9 — Convenzione percorsi foto manager

**User Story:** As a developer, I want photo paths to follow a single convention, so that both the UI and the Telegram bot resolve manager images from the same location without path differences.

#### Acceptance Criteria

1. THE DataLayer SHALL define `fotoColore` paths for each manager as `/assets/managers/<filename>` (matching the convention already used in `fanta-lega-culo/js/managers.js`).
2. THE DataLayer SHALL define `fotoBN` paths for each manager as `/assets/managers/bw/<filename>` (matching the convention already used in `fanta-lega-culo/js/managers.js`).
3. THE Site SHALL serve images from `public/assets/managers/` and `public/assets/managers/bw/` via Next.js static file serving.
4. WHEN `lib/bot/helper.ts` or `app/api/telegram/route.ts` builds an absolute photo URL for Telegram, THE Bot SHALL prepend the value of `process.env.NEXT_PUBLIC_SITE_URL` to the relative `fotoColore`/`fotoBN` path.

---

### Requirement 10 — Rimozione del codice fantacalcio da ottavio.dev

**User Story:** As a developer, I want all fantacalcio code removed from ottavio.dev, so that there is only one source of truth and no risk of divergent data.

#### Acceptance Criteria

1. THE ottavio.dev project SHALL have `ottavio.dev/lib/fantabot/` deleted entirely.
2. THE ottavio.dev project SHALL have `ottavio.dev/pages/api/fantabot/` deleted entirely.
3. THE ottavio.dev project SHALL have the `cheerio` dependency removed from `package.json` if it is used only by the fantabot code.
4. WHEN the `ottavio.dev` project is built after cleanup, THE ottavio.dev project SHALL produce no errors related to missing fantabot imports.

---

### Requirement 11 — Navigazione e layout globale

**User Story:** As a visitor, I want consistent navigation across all pages, so that I can move between Home, Albo d'oro, and Partecipanti from any page.

#### Acceptance Criteria

1. THE Site SHALL include a root layout at `app/layout.tsx` that wraps all pages with the `<html lang="it">` element, site header (logo + nav), and site footer.
2. THE Site SHALL include in the site header navigation links to `/`, `/albo`, and `/partecipanti`.
3. THE Site SHALL preserve the visual styling defined in `public/css/style.css` by importing it in the root layout.
4. THE Site SHALL set the `<title>` and `<meta name="description">` per-page using Next.js `metadata` exports, matching the titles used in the current Vite SPA.
