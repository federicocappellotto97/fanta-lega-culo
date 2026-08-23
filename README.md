# FANTA LEGA-CULO — sito

Sito statico (nessun build, nessuna dipendenza da installare): un `index.html`
+ CSS + qualche file JS. Apri la cartella su un hosting qualsiasi e funziona.

## Struttura

```
index.html
css/style.css
js/managers.js      ← dati manager (id, nome, foto, squadre nel tempo)
js/squads.js         ← nomi squadre per slug
js/halloffame.js     ← albo d'oro edizione per edizione + calcolo palmares
js/app.js             ← routing e rendering delle pagine
assets/logo.png
assets/managers/      ← foto a colori dei manager
assets/managers/bw/   ← foto bianco/nero (per usi futuri, non ancora mostrate a schermo)
assets/squads/         ← stemmi squadra
```

I dati di `managers.js` e `halloffame.js` sono la stessa "fonte unica di
verità" che usi già nel bot Telegram — stessi id, stessa struttura. Se
aggiungi un manager o un'edizione al bot, replica la stessa modifica qui (o
fammelo fare in una prossima chat, allegando i file aggiornati).

## Come funziona il routing

Una sola pagina HTML, navigazione via `#/...`:
- `#/` → home
- `#/albo` → albo d'oro (stagione per stagione + medagliere)
- `#/partecipanti` → griglia di tutti i manager
- `#/manager/<id>` → scheda del singolo manager — **questo è il link da
  mettere sul biglietto da visita**, es.
  `https://tuosito.it/#/manager/ferracin`

## Foto e stemmi: sostituzione automatica

Per ora ogni foto è un placeholder generato al volo. Non devi toccare il
codice per sistemarle: basta caricare il file vero nel posto giusto, con
il nome giusto, e il placeholder sparisce da solo.

- Foto manager a colori → `assets/managers/<id>.jpg` (es. `ferracin.jpg`)
- Foto manager bianco/nero → `assets/managers/bw/<id>.jpg`
- Stemma squadra → `assets/squads/<slug-squadra>.png` (es. `fininvest.png`,
  PNG trasparente consigliato)

Gli id di ogni manager e gli slug di ogni squadra sono quelli già usati nel
bot — li trovi in `js/managers.js` (campo `id`) e `js/squads.js` (chiavi
dell'oggetto `SQUADS`). Formato immagine libero (jpg/png/webp), basta che
il nome file coincida.

## Come vederlo in locale

Il sito usa moduli JS (`type="module"`), quindi **non funziona aprendo
`index.html` a doppio clic** (i browser bloccano gli import di moduli su
`file://`). Serve un server locale minimo, es. da questa cartella:

```
python3 -m http.server 8000
```

poi apri `http://localhost:8000`.

## Come pubblicarlo

Qualsiasi hosting statico va bene — dato che gestisci già domini/cPanel,
la via più diretta è caricare tutta questa cartella via FTP/File Manager
nella document root del dominio che vuoi usare. In alternativa, per un
setup a costo zero: GitHub Pages, Netlify o Vercel (drag-and-drop della
cartella). Non serve build né database.
