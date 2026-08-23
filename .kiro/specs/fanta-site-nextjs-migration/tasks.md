# Piano di implementazione: Fanta Site — Migrazione Next.js

## Overview

Conversione del progetto `fanta-lega-culo` da Vite + vanilla JS a Next.js 14 App Router + TypeScript strict. Il lavoro si divide in cinque blocchi principali: setup progetto, DataLayer, pagine UI, bot Telegram, e rimozione del codice da `ottavio.dev`.

## Tasks

- [x] 1. Setup progetto Next.js e configurazione
  - Rimuovi `vite` da `package.json` e aggiungi `next`, `react`, `react-dom`, `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `cheerio`, `@types/cheerio`
  - Crea `tsconfig.json` con `strict: true`, path alias `@/*` e plugin `next`
  - Crea `next.config.ts` con webpack rules per importare `.csv` e `.txt` come stringhe (`asset/source`)
  - Crea `types/file-types.d.ts` con le dichiarazioni ambient per `*.csv` e `*.txt`
  - Crea `app/` directory con file `next-env.d.ts` nella root (generato automaticamente da Next.js al primo build)
  - Aggiorna gli script in `package.json`: `dev: next dev`, `build: next build`, `start: next start`
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. DataLayer — `lib/data/`
  - [x] 2.1 Crea `lib/data/managers.ts` con interfacce `SquadEntry` e `Manager` e array `MANAGERS`
    - Converti `js/managers.js` in TypeScript strict, preservando tutti i dati e i path delle foto
    - Verifica che tutti i path `fotoColore` inizino con `/assets/managers/` e `fotoBN` con `/assets/managers/bw/`
    - _Requirements: 2.1, 9.1, 9.2_

  - [ ]\* 2.2 Scrivi property test per Manager interface conformance
    - **Property 1: Manager interface conformance**
    - Verifica che ogni elemento di `MANAGERS` abbia tutti i campi richiesti con i tipi corretti
    - Verifica che ogni `SquadEntry` in `squadre` abbia `squadId`, `dal`, `al`
    - **Validates: Requirements 2.1**

  - [ ]\* 2.3 Scrivi property test per photo path convention
    - **Property 9: Photo paths follow convention**
    - Verifica che `fotoColore` inizi con `/assets/managers/` e `fotoBN` con `/assets/managers/bw/`
    - **Validates: Requirements 9.1, 9.2**

  - [x] 2.4 Crea `lib/data/squads.ts` con interfaccia `Squad`, record `SQUADS` e funzioni helper
    - Converti `js/squads.js` in TypeScript strict, preservando lo schema ricco (nome, fondazione, colori, emoji?)
    - Esporta `getSquadName`, `getSquadData`, `getSquadCrestPath`, `getSquadShirtPath`
    - _Requirements: 2.2, 2.4, 2.5_

  - [ ]\* 2.5 Scrivi property test per Squad interface conformance
    - **Property 2: Squad interface conformance**
    - Verifica che ogni valore in `SQUADS` abbia `nome`, `fondazione`, `colori` con i tipi corretti
    - **Validates: Requirements 2.2**

  - [ ]\* 2.6 Scrivi property test per getSquadName
    - **Property 4: getSquadName returns nome field**
    - Verifica che `getSquadName(slug)` ritorni esattamente `SQUADS[slug].nome` per ogni slug valido
    - **Validates: Requirements 2.4**

  - [x] 2.7 Crea `lib/data/halloffame.ts` con `ALBO_D_ORO`, `getPalmares`, `getMedagliere`, `getManagerName`, `getAlboDOroPerStagione`, `getAlboDOroPerAllenatore`
    - Converti `js/halloffame.js` in TypeScript strict con le interfacce `Edizione`, `Palmares`, `MedagliereRow`
    - Aggiungi `getAlboDOroPerStagione` e `getAlboDOroPerAllenatore` (funzioni testuali usate dal bot, da migrare da `ottavio.dev/lib/fantabot/halloffame.js`)
    - _Requirements: 2.3, 2.6_

  - [ ]\* 2.8 Scrivi property test per getPalmares consistency
    - **Property 3: getPalmares consistency with ALBO_D_ORO**
    - Verifica che i conteggi di `getPalmares(id)` corrispondano ai conteggi diretti su `ALBO_D_ORO`
    - **Validates: Requirements 2.3**

  - [ ]\* 2.9 Scrivi property test per getMedagliere sort invariant
    - **Property 5: getMedagliere sort invariant**
    - Verifica che ogni coppia adiacente rispetti l'ordinamento: campionati → coppe → supercoppe → retrocessioni ASC
    - **Validates: Requirements 4.3**

- [x] 3. Checkpoint — Verifica DataLayer
  - Assicurati che tutti i test passino. Chiedi all'utente se ci sono domande prima di procedere.

- [x] 4. Root layout e navigazione globale
  - Crea `app/layout.tsx` con `<html lang="it">`, header con logo + nav, footer
  - Importa `public/css/style.css` nel layout (path: `@/../public/css/style.css`)
  - Esporta `metadata` con titolo di default `"FANTA LEGA-CULO"` e template `"%s — FANTA LEGA-CULO"`
  - I link di navigazione usano `<a>` plain (non `<Link>`) come da design
  - Crea `app/not-found.tsx` con messaggio coerente con lo stile del sito
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 5. Pagina Home (`app/page.tsx`)
  - [x] 5.1 Implementa `app/page.tsx` come Server Component
    - Calcola: `editions`, `managersCount`, `activeCount`, `latest` (ultima edizione), `podio` (top-3 medagliere), `active` (manager attivi)
    - Renderizza: hero con stat-row, sezione "Ultima stagione", sezione "Il podio di sempre", sezione "L'album" con griglia manager attivi
    - I link manager puntano a `/manager/[id]`, "Albo d'oro" a `/albo`, "Partecipanti" a `/partecipanti`
    - Esporta `metadata` con `title: "FANTA LEGA-CULO"`
    - Usa `<img>` plain con `onError` per fallback placeholder (non `<Image>` di Next.js)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]\* 5.2 Scrivi property test per Partecipanti sort invariant
    - **Property 6: Partecipanti sort invariant**
    - Verifica che attivi vengano prima degli ex-manager e che in ogni gruppo l'ordine sia `localeCompare(_, _, 'it') <= 0`
    - **Validates: Requirements 5.3**

- [ ] 6. Pagina Albo d'oro (`app/albo/`)
  - [~] 6.1 Implementa `app/albo/AlboTabs.tsx` come Client Component (`"use client"`)
    - Gestisce `useState` per la tab attiva ("stagioni" | "medagliere")
    - Renderizza tab "Stagione per stagione" (edizioni in ordine inverso) e tab "Medagliere"
    - Click su nome manager naviga a `/manager/[id]`
    - _Requirements: 4.3, 4.4_

  - [x] 6.2 Implementa `app/albo/page.tsx` come Server Component
    - Importa `ALBO_D_ORO` e `getMedagliere`, passa i dati ad `AlboTabs`
    - Esporta `metadata` con `title: "Albo d'oro"`
    - _Requirements: 4.1, 4.2_

- [x] 7. Pagina Partecipanti (`app/partecipanti/page.tsx`)
  - Implementa come Server Component
  - Ordina: attivi prima degli ex, poi `localeCompare(nome, 'it')` in ogni gruppo
  - Renderizza griglia di figurina card, ogni card link a `/manager/[id]`
  - Esporta `metadata` con `title: "Partecipanti"`
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 8. Pagina scheda manager (`app/manager/[id]/page.tsx`)
  - [x] 8.1 Implementa `app/manager/[id]/page.tsx` come Server Component con `generateStaticParams`
    - `generateStaticParams` ritorna `MANAGERS.map(m => ({ id: m.id }))`
    - `generateMetadata` ritorna `{ title: manager.nome }` o `{}` se non trovato
    - Chiama `notFound()` se l'id non esiste in `MANAGERS`
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 8.2 Renderizza il contenuto della scheda manager
    - Breadcrumb link a `/partecipanti`
    - Figurina card (foto, nome, squadra attuale, status ex/attivo)
    - Squad card con colori, logo, maglia, fondazione (solo se attivo)
    - Bacheca trofei: campionati, coppe, supercoppe, retrocessioni con edizioni
    - Timeline carriera con loghi squadre
    - _Requirements: 6.5, 6.6_

  - [ ]\* 8.3 Scrivi property test per generateStaticParams coverage
    - **Property 7: generateStaticParams covers all managers**
    - Verifica che l'insieme degli id in `generateStaticParams` sia uguale all'insieme degli id in `MANAGERS`
    - **Validates: Requirements 6.3**

  - [ ]\* 8.4 Scrivi property test per manager page required sections
    - **Property 8: Manager page renders all required sections**
    - Verifica che per ogni manager il render includa nome, presenteDal, squadra attuale, almeno una riga palmares, breadcrumb a `/partecipanti`
    - **Validates: Requirements 6.5, 6.6**

- [x] 9. Checkpoint — Verifica pagine UI
  - Assicurati che `next build` completi senza errori TypeScript. Chiedi all'utente se ci sono domande prima di procedere.

- [x] 10. Bot Telegram — `lib/bot/`
  - [x] 10.1 Crea `lib/bot/data/` e copia i file CSV e `regolamento.txt` da `ottavio.dev/lib/fantabot/data/`
    - Copia: `classifica-8.0.csv`, `calendario-8.0.csv`, `rose-8.0.csv`, `regolamento.txt`
    - _Requirements: 7.5_

  - [x] 10.2 Implementa `lib/bot/helper.ts` (migrazione da `ottavio.dev/lib/fantabot/helper.js`)
    - Converti in TypeScript strict; la costante `TEAMS` rimane locale (id numerici leghe.fantacalcio.it)
    - Esporta: `getEmoji`, `getClassifica`, `getNextMatch`, `fetchSquadre`, `fetchInfoSquadre`
    - _Requirements: 7.1, 7.4_

  - [x] 10.3 Implementa `lib/bot/ai.ts` (migrazione da `ottavio.dev/lib/fantabot/ai.js`)
    - Converti in TypeScript strict; importa `MANAGERS`, `ALBO_D_ORO`, `getPalmares` da `lib/data/`; importa `getSquadName` da `lib/data/squads`
    - Usa static import per CSV e TXT: `import classificaCSV from "./data/classifica-8.0.csv"`
    - `GEMINI_API_KEY` mancante → ritorna `"⚠️ GEMINI_API_KEY non configurata."` senza chiamata di rete
    - Esporta: `rispondiAI(domanda, opts?)`
    - _Requirements: 7.2, 7.3, 7.6_

- [x] 11. Route Handler Telegram (`app/api/telegram/route.ts`)
  - Implementa `export async function POST(req: NextRequest)` che rimpiazza `ottavio.dev/pages/api/fantabot/telegram.js`
  - Supporta tutti i comandi: `/ranking`, `/next`, `/teams`, `/halloffame`, `/managers`, `/ai`
  - Legge `BOT_TOKEN` e `GEMINI_API_KEY` da env, nessuna credenziale hardcoded
  - URL foto costruite come `${process.env.NEXT_PUBLIC_SITE_URL}${manager.fotoColore}` (non hardcoded `ottavio.dev`)
  - Non-POST → HTTP 405 (in App Router basta esportare solo `POST`)
  - Il Route Handler risponde sempre `200 OK` a Telegram per evitare retry infiniti
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]\* 11.1 Scrivi property test per bot absolute photo URL
    - **Property 10: Bot absolute photo URL uses SITE_URL**
    - Verifica che l'URL assoluto per Telegram inizi con `process.env.NEXT_PUBLIC_SITE_URL`
    - **Validates: Requirements 8.4, 9.4**

- [x] 12. Checkpoint — Verifica bot e build finale
  - Assicurati che `next build` completi senza errori TypeScript. Chiedi all'utente se ci sono domande prima di procedere.

- [x] 13. Rimozione codice fantacalcio da `ottavio.dev`
  - Elimina `ottavio.dev/lib/fantabot/` (directory completa)
  - Elimina `ottavio.dev/pages/api/fantabot/` (directory completa)
  - Rimuovi la dipendenza `cheerio` da `ottavio.dev/package.json` se usata solo dal fantabot
  - Verifica che `ottavio.dev` compili senza errori dopo la pulizia
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

## Note

- I task contrassegnati con `*` sono opzionali e possono essere saltati per un MVP più veloce
- Il design usa il `Correctness Properties` section → i property test sono inclusi come sub-task opzionali
- Il DataLayer è il single source of truth: né `lib/bot/` né `app/api/telegram/route.ts` definiscono dati propri
- I link di navigazione usano `<a>` plain HTML (non `<Link>`) per mantenere la compatibilità con il CSS esistente
- I fallback immagine usano `<img>` plain con `onError` (non `<Image>` di Next.js) per compatibilità server-side
- Creare `.env.local` con `BOT_TOKEN`, `GEMINI_API_KEY`, `NEXT_PUBLIC_SITE_URL` per lo sviluppo locale
- `public/css/style.css` non viene spostato né rinominato

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "2.4"] },
    { "id": 1, "tasks": ["2.2", "2.3", "2.5", "2.6", "2.7"] },
    { "id": 2, "tasks": ["2.8", "2.9", "4"] },
    { "id": 3, "tasks": ["5.1", "6.1", "7", "8.1", "10.1", "10.2"] },
    { "id": 4, "tasks": ["5.2", "6.2", "8.2", "10.3"] },
    { "id": 5, "tasks": ["8.3", "8.4", "11"] },
    { "id": 6, "tasks": ["11.1", "13"] }
  ]
}
```
