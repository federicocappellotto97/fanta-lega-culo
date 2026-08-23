# Design Document

## Fanta Site — Next.js Migration

---

## Overview

Il progetto `fanta-lega-culo` viene convertito da Vite + vanilla JS SPA a un sito Next.js 14 con App Router e TypeScript strict. Tutti i dati e la logica del bot Telegram vengono consolidati qui, eliminando ogni riferimento fantacalcio da `ottavio.dev`.

L'architettura è volutamente semplice: nessun database, nessun CMS, nessun server-side state. I dati della lega sono statici (file TypeScript), le pagine vengono pre-renderizzate a build time come Server Components, e il bot Telegram è un singolo Route Handler.

---

## Architecture

```
fanta-lega-culo/
├── app/
│   ├── layout.tsx                  # Root layout: <html lang="it">, nav, footer
│   ├── page.tsx                    # Home (/)
│   ├── albo/
│   │   └── page.tsx                # Albo d'oro (/albo)
│   ├── partecipanti/
│   │   └── page.tsx                # Partecipanti (/partecipanti)
│   ├── manager/
│   │   └── [id]/
│   │       └── page.tsx            # Scheda manager (/manager/[id])
│   └── api/
│       └── telegram/
│           └── route.ts            # POST /api/telegram (webhook bot)
├── lib/
│   ├── data/
│   │   ├── managers.ts             # MANAGERS array + Manager interface
│   │   ├── squads.ts               # SQUADS record + Squad interface + helpers
│   │   └── halloffame.ts           # ALBO_D_ORO + getPalmares + getMedagliere
│   └── bot/
│       ├── helper.ts               # getClassifica, getNextMatch, fetchSquadre
│       ├── ai.ts                   # rispondiAI (Gemini)
│       └── data/
│           ├── classifica-8.0.csv
│           ├── calendario-8.0.csv
│           ├── rose-8.0.csv
│           └── regolamento.txt
├── public/                         # Invariato
│   ├── css/style.css
│   └── assets/
│       ├── logo.png
│       ├── managers/               # foto colore: <name>.jpg/png
│       │   └── bw/                 # foto b/n: <slug>.jpg/png
│       └── squads/
│           ├── logos/              # <slug>.png
│           └── shirts/             # <slug>.png
├── next.config.ts
├── tsconfig.json
└── package.json
```

### Rendering strategy

| Percorso | Tipo | Motivazione |
|---|---|---|
| `/` | Server Component (SSG) | Dati statici, nessuna interattività |
| `/albo` | Server Component (SSG) + Client tab | Tabs gestite client-side |
| `/partecipanti` | Server Component (SSG) | Dati statici |
| `/manager/[id]` | Server Component (SSG via `generateStaticParams`) | Una pagina per manager a build time |
| `/api/telegram` | Route Handler (Node.js runtime) | Deve fare fetch esterne, non può essere edge |

Le pagine usano `generateStaticParams` dove applicabile. Non c'è `revalidate` perché i dati cambiano solo a seguito di un deploy manuale.

### Data flow

```
lib/data/ (managers.ts, squads.ts, halloffame.ts)
    │
    ├──► app/page.tsx          (ALBO_D_ORO, MANAGERS, getMedagliere)
    ├──► app/albo/page.tsx     (ALBO_D_ORO, getMedagliere)
    ├──► app/partecipanti/page.tsx  (MANAGERS)
    ├──► app/manager/[id]/page.tsx  (MANAGERS, getPalmares, getSquadData)
    │
    └──► lib/bot/ai.ts         (MANAGERS, ALBO_D_ORO, getSquadName)
             │
             └──► app/api/telegram/route.ts
```

Il DataLayer è il single source of truth. Né `lib/bot/` né `app/api/telegram/route.ts` definiscono dati propri: importano tutto da `lib/data/`.

---

## Components and Interfaces

### DataLayer — `lib/data/`

#### `managers.ts`

```typescript
export interface SquadEntry {
  squadId: string;       // slug stabile, chiave di SQUADS
  dal: string;           // edizione inizio (es. "1.0")
  al: string | null;     // edizione fine, null = squadra attuale
}

export interface Manager {
  id: string;
  nome: string;
  fotoColore: string;    // es. "/assets/managers/giovanni-ferracin.jpg"
  fotoBN: string;        // es. "/assets/managers/bw/ferracin.jpg"
  presenteDal: string;
  presenteFinoAl: string | null;
  squadre: SquadEntry[];
}

export const MANAGERS: Manager[] = [ /* ... */ ];
```

#### `squads.ts`

```typescript
export interface Squad {
  nome: string;
  fondazione: string;               // edizione in cui la squadra è stata fondata
  colori: [string, string];         // coppia hex CSS
  emoji?: string;                   // opzionale
}

export const SQUADS: Record<string, Squad> = { /* ... */ };

export function getSquadName(slug: string): string;
export function getSquadData(slug: string): Squad;
export function getSquadCrestPath(slug: string): string; // /assets/squads/logos/<slug>.png
export function getSquadShirtPath(slug: string): string; // /assets/squads/shirts/<slug>.png
```

#### `halloffame.ts`

```typescript
export interface Edizione {
  edizione: string;
  stagione: string;
  campionatoId: string;
  versioneCoppa: string | null;
  coppaId: string | null;
  versioneSupercoppa: string | null;
  supercoppaId: string | null;
  retrocessoId: string;
  retrocessoSquadId: string;
}

export interface Palmares {
  campionati: string[];
  coppe: string[];
  supercoppe: string[];
  retrocessioni: string[];
}

export interface MedagliereRow {
  manager: Manager;
  campionati: string[];
  coppe: string[];
  supercoppe: string[];
  retrocessioni: string[];
}

export const ALBO_D_ORO: Edizione[];
export function getPalmares(managerId: string): Palmares;
export function getMedagliere(): MedagliereRow[];
export function getManagerName(id: string): string;
// Aggiuntive per il bot Telegram (già in ottavio.dev/lib/fantabot/halloffame.js)
export function getAlboDOroPerStagione(): string;
export function getAlboDOroPerAllenatore(): string;
```

`getAlboDOroPerStagione` e `getAlboDOroPerAllenatore` sono le funzioni testuali usate dal bot per rispondere ai comandi `/halloffame`. Vengono spostate qui da `ottavio.dev/lib/fantabot/halloffame.js` anziché duplicarle in `lib/bot/`.

---

### Pages

#### `app/layout.tsx`

```typescript
import "@/../public/css/style.css";

export const metadata = {
  title: { default: "FANTA LEGA-CULO", template: "%s — FANTA LEGA-CULO" },
  description: "Lega privata di fantacalcio dal 2018.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <header>
          <nav>
            <a href="/">Home</a>
            <a href="/albo">Albo d'oro</a>
            <a href="/partecipanti">Partecipanti</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer>...</footer>
      </body>
    </html>
  );
}
```

Il CSS globale `public/css/style.css` viene importato direttamente nel layout. Non viene spostato né rinominato.

Nota: i link di navigazione usano `<a>` plain HTML (non `<Link>` di Next.js) per mantenere la compatibilità con la struttura visuale esistente senza introdurre dipendenze su componenti client-only nel layout. Se in futuro si vuole aggiungere prefetch, si può sostituire con `<Link>` senza toccare il CSS.

#### `app/page.tsx` — Home

```typescript
import { MANAGERS } from "@/lib/data/managers";
import { ALBO_D_ORO, getMedagliere } from "@/lib/data/halloffame";

export const metadata = { title: "FANTA LEGA-CULO" };

export default function HomePage() {
  const editions = ALBO_D_ORO.length;
  const managersCount = MANAGERS.length;
  const activeCount = MANAGERS.filter((m) => m.presenteFinoAl === null).length;
  const latest = ALBO_D_ORO[ALBO_D_ORO.length - 1];
  const podio = getMedagliere().slice(0, 3);
  const active = MANAGERS.filter((m) => m.presenteFinoAl === null);

  return ( /* hero + stat-row + ultima stagione + podio + album */ );
}
```

#### `app/albo/page.tsx` — Albo d'oro

Le tabs "Stagione per stagione" / "Medagliere" richiedono stato client-side. La pagina è un Server Component che importa dati e passa tutto a un `AlboTabs` Client Component (piccolo wrapper con `useState`).

```typescript
// app/albo/page.tsx — Server Component
import { ALBO_D_ORO, getMedagliere } from "@/lib/data/halloffame";
import { AlboTabs } from "@/app/albo/AlboTabs";

export const metadata = { title: "Albo d'oro" };

export default function AlboPage() {
  return <AlboTabs editions={[...ALBO_D_ORO].reverse()} medagliere={getMedagliere()} />;
}
```

```typescript
// app/albo/AlboTabs.tsx — Client Component
"use client";
import { useState } from "react";
// render seasons | medagliere based on active tab
```

#### `app/partecipanti/page.tsx` — Partecipanti

```typescript
import { MANAGERS } from "@/lib/data/managers";

export const metadata = { title: "Partecipanti" };

export default function PartecipantiPage() {
  const sorted = [...MANAGERS].sort((a, b) => {
    const aActive = a.presenteFinoAl === null;
    const bActive = b.presenteFinoAl === null;
    if (aActive !== bActive) return aActive ? -1 : 1;
    return a.nome.localeCompare(b.nome, "it");
  });
  return ( /* figurina grid */ );
}
```

#### `app/manager/[id]/page.tsx` — Scheda manager

```typescript
import { notFound } from "next/navigation";
import { MANAGERS } from "@/lib/data/managers";
import { getPalmares } from "@/lib/data/halloffame";
import { getSquadData } from "@/lib/data/squads";

export function generateStaticParams() {
  return MANAGERS.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const manager = MANAGERS.find((m) => m.id === params.id);
  if (!manager) return {};
  return { title: manager.nome };
}

export default function ManagerPage({ params }: { params: { id: string } }) {
  const manager = MANAGERS.find((m) => m.id === params.id);
  if (!manager) notFound();
  const palmares = getPalmares(manager.id);
  // render: breadcrumb + figurina card + squad card + timeline + bacheca
}
```

---

### Bot Logic — `lib/bot/`

#### `lib/bot/helper.ts`

Migrazione diretta di `ottavio.dev/lib/fantabot/helper.js` → TypeScript. Dipendenze:
- `cheerio` (da installare in `fanta-lega-culo`)
- Nessuna importazione da DataLayer (helper.ts gestisce solo dati live dal sito fantacalcio.it)

La costante `TEAMS` resta locale a `helper.ts` — contiene id numerici leghe.fantacalcio.it che non hanno corrispondenza nel DataLayer (quello usa slug stabili, non id numerici di terze parti).

```typescript
export function getEmoji(teamName: string): string;
export async function getClassifica(): Promise<string>;
export async function getNextMatch(): Promise<string>;
export async function fetchSquadre(): Promise<Array<{ id: number; icon: string; name: string }>>;
export async function fetchInfoSquadre(): Promise<SquadInfo[]>;
```

#### `lib/bot/ai.ts`

Migrazione di `ottavio.dev/lib/fantabot/ai.js` → TypeScript, con import del DataLayer:

```typescript
import { MANAGERS } from "@/lib/data/managers";
import { ALBO_D_ORO, getPalmares } from "@/lib/data/halloffame";
import { getSquadName } from "@/lib/data/squads";
// CSV via static import (stesso pattern già in uso in ottavio.dev)
import classificaCSV from "./data/classifica-8.0.csv";
import calendarioCSV from "./data/calendario-8.0.csv";
import roseCSV from "./data/rose-8.0.csv";
import regolamentoTXT from "./data/regolamento.txt";

export async function rispondiAI(
  domanda: string,
  opts?: { username?: string; firstName?: string }
): Promise<string>;
```

Per abilitare gli import di `.csv` e `.txt` come stringhe serve una dichiarazione in `next.config.ts` (webpack rule `raw-loader` o `asset/source`) oppure una dichiarazione di tipo ambient:

```typescript
// types/file-types.d.ts
declare module "*.csv" { const content: string; export default content; }
declare module "*.txt" { const content: string; export default content; }
```

e nel `next.config.ts`:

```typescript
webpack(config) {
  config.module.rules.push(
    { test: /\.csv$/, type: "asset/source" },
    { test: /\.txt$/, type: "asset/source" }
  );
  return config;
}
```

#### `app/api/telegram/route.ts`

Route Handler App Router, rimpiazza `ottavio.dev/pages/api/fantabot/telegram.js`.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { MANAGERS } from "@/lib/data/managers";
import { getPalmares, getAlboDOroPerStagione, getAlboDOroPerAllenatore } from "@/lib/data/halloffame";
import { getSquadName } from "@/lib/data/squads";
import { rispondiAI } from "@/lib/bot/ai";
import { fetchInfoSquadre, fetchSquadre, getClassifica, getEmoji, getNextMatch } from "@/lib/bot/helper";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

export async function POST(req: NextRequest): Promise<NextResponse> { /* ... */ }

export function GET(): NextResponse {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
```

Differenza rispetto all'originale Pages Router:
- `export async function POST` invece di `export default function handler`
- Non esiste `res.status().send()`: si usa `NextResponse`
- `req.json()` al posto di `req.body` (body già parsato in Pages Router, raw in App Router)
- `PHOTO_BASE_URL` hardcodato → `process.env.NEXT_PUBLIC_SITE_URL`

---

## Data Models

### Manager

| Campo | Tipo | Note |
|---|---|---|
| `id` | `string` | Slug stabile, usato in URL e come FK in ALBO_D_ORO |
| `nome` | `string` | Nome visualizzato |
| `fotoColore` | `string` | Path relativo: `/assets/managers/<file>` |
| `fotoBN` | `string` | Path relativo: `/assets/managers/bw/<slug>` |
| `presenteDal` | `string` | Edizione di ingresso (es. `"1.0"`) |
| `presenteFinoAl` | `string \| null` | `null` = manager attivo |
| `squadre` | `SquadEntry[]` | Storico in ordine cronologico; ultimo con `al: null` = squadra attuale |

### Squad

| Campo | Tipo | Note |
|---|---|---|
| `nome` | `string` | Nome visualizzato |
| `fondazione` | `string` | Edizione di fondazione |
| `colori` | `[string, string]` | Coppia di colori hex per la squad card |
| `emoji` | `string \| undefined` | Opzionale; usato anche dal bot per identifier visivo |

### Edizione (ALBO_D_ORO entry)

| Campo | Tipo | Note |
|---|---|---|
| `edizione` | `string` | Es. `"8.0"` |
| `stagione` | `string` | Es. `"2025/26"` |
| `campionatoId` | `string` | FK → Manager.id |
| `versioneCoppa` | `string \| null` | `null` se coppa non disputata |
| `coppaId` | `string \| null` | FK → Manager.id, `null` se coppa non disputata |
| `versioneSupercoppa` | `string \| null` | `null` se supercoppa non disputata |
| `supercoppaId` | `string \| null` | FK → Manager.id, `null` se non disputata |
| `retrocessoId` | `string` | FK → Manager.id |
| `retrocessoSquadId` | `string` | FK → SQUADS key (slug) |

---

## Configuration

### `package.json` (dipendenze rilevanti)

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "cheerio": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/cheerio": "^0.22.35"
  }
}
```

`vite` viene rimosso.

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    config.module.rules.push(
      { test: /\.csv$/, type: "asset/source" },
      { test: /\.txt$/, type: "asset/source" }
    );
    return config;
  },
};

export default nextConfig;
```

### Variabili d'ambiente (`.env.local`)

```
BOT_TOKEN=...
GEMINI_API_KEY=...
NEXT_PUBLIC_SITE_URL=https://fanta-lega-culo.example.com
```

---

## Error Handling

### Pagina manager non trovata

`app/manager/[id]/page.tsx` chiama `notFound()` di Next.js quando l'id non è presente in MANAGERS. Next.js renderizza automaticamente `app/not-found.tsx` se presente, altrimenti la 404 di default. Si consiglia di creare un `app/not-found.tsx` con un messaggio coerente con lo stile del sito (analogo al `pageNotFound()` attuale).

### Foto mancanti

Le immagini manager e squadre usano `onError` per fallback su placeholder generativi (stessa logica di `app.js` attuale). In Next.js questo si ottiene con un componente `<img>` con `onError` — non con `<Image>` di Next.js che non supporta `onError` server-side. Mantenere `<img>` plain per compatibilità con il comportamento attuale.

### Bot: errori Telegram API

Errori nelle chiamate a `api.telegram.org` vengono loggati (`console.error`) ma non rilanciati: il Route Handler risponde sempre `200 OK` a Telegram per evitare retry infiniti. Questo è il comportamento corretto per i webhook Telegram.

### Bot: Gemini API non disponibile

`rispondiAI` ritorna una stringa di errore leggibile invece di lanciare. `GEMINI_API_KEY` mancante → risposta immediata `"⚠️ GEMINI_API_KEY non configurata."` senza chiamata di rete.

### Bot: metodo HTTP non POST

Il Route Handler espone solo `POST`. Qualsiasi altro metodo riceve `405 Method Not Allowed`. In App Router, esportare solo `POST` fa sì che Next.js risponda automaticamente 405 per gli altri metodi — non è necessario esportare `GET`, `PUT` ecc. esplicitamente, ma è documentato per chiarezza.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Manager interface conformance

*For any* element in the `MANAGERS` array, the element SHALL have all required fields of the `Manager` interface (`id`, `nome`, `fotoColore`, `fotoBN`, `presenteDal`, `presenteFinoAl`, `squadre`) with the correct types, and each `SquadEntry` in `squadre` SHALL have `squadId`, `dal`, and `al` fields.

**Validates: Requirements 2.1**

---

### Property 2: Squad interface conformance

*For any* key in the `SQUADS` record, the associated value SHALL have all required fields of the `Squad` interface (`nome`, `fondazione`, `colori`) with the correct types.

**Validates: Requirements 2.2**

---

### Property 3: getPalmares consistency with ALBO_D_ORO

*For any* manager id present in `MANAGERS`, the result of `getPalmares(id)` SHALL be equivalent to counting directly from `ALBO_D_ORO`: `campionati.length` equals the number of editions where `campionatoId === id`, `coppe.length` equals editions where `coppaId === id`, `supercoppe.length` equals editions where `supercoppaId === id`, and `retrocessioni.length` equals editions where `retrocessoId === id`.

**Validates: Requirements 2.3**

---

### Property 4: getSquadName returns nome field

*For any* slug that is a key in `SQUADS`, `getSquadName(slug)` SHALL return exactly `SQUADS[slug].nome`.

**Validates: Requirements 2.4**

---

### Property 5: getMedagliere sort invariant

*For any* two adjacent entries `a` and `b` (at positions `i` and `i+1`) in the array returned by `getMedagliere()`, the following sort invariant SHALL hold: `b.campionati.length > a.campionati.length`, OR (`b.campionati.length === a.campionati.length` AND `b.coppe.length > a.coppe.length`), OR (campionati and coppe are equal AND `b.supercoppe.length > a.supercoppe.length`), OR (campionati, coppe, supercoppe are all equal AND `a.retrocessioni.length <= b.retrocessioni.length`).

**Validates: Requirements 4.3**

---

### Property 6: Partecipanti sort invariant

*For any* two adjacent entries `a` and `b` in the sorted managers list used by the Partecipanti page, the sort invariant SHALL hold: if `a` is active and `b` is not, `a` comes first; if both are active or both are ex-managers, `a.nome.localeCompare(b.nome, 'it') <= 0`.

**Validates: Requirements 5.3**

---

### Property 7: generateStaticParams covers all managers

The set of `id` values returned by `generateStaticParams` in `app/manager/[id]/page.tsx` SHALL equal the set of `id` values in `MANAGERS` — no omissions, no extras.

**Validates: Requirements 6.3**

---

### Property 8: Manager page renders all required sections

*For any* manager in `MANAGERS`, the rendered output of the manager page SHALL include the manager's `nome`, their `presenteDal` value, the name of their current squad (the entry with `al === null`), at least one palmares row (campionati, coppe, supercoppe, or retrocessioni), and a breadcrumb link to `/partecipanti`.

**Validates: Requirements 6.5, 6.6**

---

### Property 9: Photo paths follow convention

*For any* manager in `MANAGERS`, `fotoColore` SHALL start with `/assets/managers/` and `fotoBN` SHALL start with `/assets/managers/bw/`.

**Validates: Requirements 9.1, 9.2**

---

### Property 10: Bot absolute photo URL uses SITE_URL

*For any* manager in `MANAGERS`, when the bot builds an absolute photo URL for Telegram (by prepending `process.env.NEXT_PUBLIC_SITE_URL` to `fotoColore` or `fotoBN`), the resulting URL SHALL start with the value of `NEXT_PUBLIC_SITE_URL`.

**Validates: Requirements 8.4, 9.4**
