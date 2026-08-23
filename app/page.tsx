import { MANAGERS } from "@/lib/data/managers";
import {
  ALBO_D_ORO,
  getMedagliere,
  getManagerName,
  getPalmares,
  type Edizione,
  type MedagliereRow,
} from "@/lib/data/halloffame";
import { getSquadName, getSquadCrestPath } from "@/lib/data/squads";
import type { Manager } from "@/lib/data/managers";
import { FallbackImg } from "@/app/components/FallbackImg";

export const metadata = { title: "FANTA LEGA-CULO" };

/* ---------- Image helpers ---------- */

function managerFallback(id: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(id)}/480/640`;
}

function crestFallback(slug: string) {
  return `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(slug)}&backgroundColor=1d2d51,e30b13`;
}

/* ---------- Medal chips ---------- */

function MedalChip({
  cls,
  label,
  count,
}: {
  cls: string;
  label: string;
  count: number;
}) {
  return (
    <span className={`medal ${cls}`}>
      {label} × {count}
    </span>
  );
}

function CompactMedals({ managerId }: { managerId: string }) {
  const { campionati, coppe, supercoppe, retrocessioni } =
    getPalmares(managerId);
  const chips: React.ReactNode[] = [];
  if (campionati.length)
    chips.push(
      <MedalChip
        key="c"
        cls="gold"
        label="🏆 Campionati"
        count={campionati.length}
      />,
    );
  if (coppe.length)
    chips.push(
      <MedalChip key="k" cls="silver" label="🥈 Coppe" count={coppe.length} />,
    );
  if (supercoppe.length)
    chips.push(
      <MedalChip
        key="s"
        cls="bronze"
        label="🎖️ Supercoppe"
        count={supercoppe.length}
      />,
    );
  if (retrocessioni.length)
    chips.push(
      <MedalChip
        key="r"
        cls="down"
        label="📉 Retrocessioni"
        count={retrocessioni.length}
      />,
    );
  if (!chips.length) return <span className="medal">Bacheca vuota</span>;
  return <>{chips}</>;
}

/* ---------- Figurina card ---------- */

function FigurinaCard({ manager }: { manager: Manager }) {
  const squad =
    manager.squadre.find((s) => s.al === null) ??
    manager.squadre[manager.squadre.length - 1];
  const active = manager.presenteFinoAl === null;

  return (
    <a
      className={`figurina${active ? "" : " ex"}`}
      href={`/manager/${manager.id}`}
    >
      <div className="figurina-photo">
        <FallbackImg
          src={manager.fotoColore}
          fallback={managerFallback(manager.id)}
          alt={manager.nome}
          width={480}
          height={640}
        />
        <span className="figurina-edition">dalla {manager.presenteDal}</span>
        {!active && <span className="figurina-status ex">Ex</span>}
      </div>
      <h3>{manager.nome}</h3>
      <p className="team">{getSquadName(squad.squadId)}</p>
      <div className="medals">
        <CompactMedals managerId={manager.id} />
      </div>
    </a>
  );
}

/* ---------- Season row ---------- */

function SeasonCell({
  label,
  value,
  empty,
}: {
  label: string;
  value: React.ReactNode | null;
  empty: string;
}) {
  return (
    <div className={`season-cell${value ? "" : " empty"}`}>
      <span className="k">{label}</span>
      <span className="v">{value ?? empty}</span>
    </div>
  );
}

function SeasonRow({ ed }: { ed: Edizione }) {
  return (
    <div className="season-row">
      <div className="season-badge">
        <span className="ed">{ed.edizione}</span>
        <span className="yr">{ed.stagione}</span>
      </div>
      <SeasonCell
        label="🏆 Campionato"
        value={
          <a href={`/manager/${ed.campionatoId}`}>
            {getManagerName(ed.campionatoId)}
          </a>
        }
        empty="—"
      />
      <SeasonCell
        label="🥈 Coppa Culo"
        value={
          ed.coppaId ? (
            <a href={`/manager/${ed.coppaId}`}>{getManagerName(ed.coppaId)}</a>
          ) : null
        }
        empty="Non fatta"
      />
      <SeasonCell
        label="🎖️ Supercoppa"
        value={
          ed.supercoppaId ? (
            <a href={`/manager/${ed.supercoppaId}`}>
              {getManagerName(ed.supercoppaId)}
            </a>
          ) : null
        }
        empty="Non fatta"
      />
      <SeasonCell
        label="📉 Retrocesso"
        value={
          <a href={`/manager/${ed.retrocessoId}`}>
            {getManagerName(ed.retrocessoId)} (
            {getSquadName(ed.retrocessoSquadId)})
          </a>
        }
        empty="—"
      />
    </div>
  );
}

/* ---------- Podio row ---------- */

const PODIO_ICONS = ["🥇", "🥈", "🥉"] as const;

function PodioRow({ row, index }: { row: MedagliereRow; index: number }) {
  const pos = index + 1;
  const posIcon = PODIO_ICONS[index] ?? `#${pos}`;
  const chips: React.ReactNode[] = [];
  if (row.campionati.length)
    chips.push(
      <MedalChip key="c" cls="gold" label="🏆" count={row.campionati.length} />,
    );
  if (row.coppe.length)
    chips.push(
      <MedalChip key="k" cls="silver" label="🥈" count={row.coppe.length} />,
    );
  if (row.supercoppe.length)
    chips.push(
      <MedalChip
        key="s"
        cls="bronze"
        label="🎖️"
        count={row.supercoppe.length}
      />,
    );
  if (row.retrocessioni.length)
    chips.push(
      <MedalChip
        key="r"
        cls="down"
        label="📉"
        count={row.retrocessioni.length}
      />,
    );

  return (
    <div className={`podio-row rank-${pos}`}>
      <div className="podio-pos">{posIcon}</div>
      <div className="podio-photo">
        <FallbackImg
          src={row.manager.fotoColore}
          fallback={managerFallback(row.manager.id)}
          alt={row.manager.nome}
          width={46}
          height={46}
        />
      </div>
      <div className="podio-name">
        <a href={`/manager/${row.manager.id}`}>{row.manager.nome}</a>
      </div>
      <div className="podio-medals">
        {chips.length ? chips : <span className="medal">Bacheca vuota</span>}
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

export default function HomePage() {
  const editions = ALBO_D_ORO.length;
  const managersCount = MANAGERS.length;
  const activeCount = MANAGERS.filter((m) => m.presenteFinoAl === null).length;
  const latest = ALBO_D_ORO[ALBO_D_ORO.length - 1];
  const podio = getMedagliere().slice(0, 3);
  const active = MANAGERS.filter((m) => m.presenteFinoAl === null);

  return (
    <>
      {/* ---- Hero ---- */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-crest">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logo.png"
              alt="Stemma FANTA LEGA-CULO"
              width={150}
              height={150}
            />
          </div>
          <div>
            <p className="eyebrow">
              Lega privata di fantacalcio &middot; dal 2018
            </p>
            <h1>
              FANTA
              <br />
              LEGA<span className="accent">-CULO</span>
            </h1>
            <p className="lede">
              Tredici manager, un solo trofeo che conta davvero: non essere
              l&apos;ultimo. Qui dentro trovi l&apos;albo d&apos;oro, i
              partecipanti e la scheda di ciascuno &mdash; fantapunti, sfottò e
              retrocessioni comprese.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="/albo">
                Albo d&apos;oro
              </a>
              <a className="btn btn-ghost" href="/partecipanti">
                Partecipanti
              </a>
            </div>
            <div className="stat-row">
              <div className="stat">
                <span className="num">{editions}</span>
                <span className="label">Edizioni giocate</span>
              </div>
              <div className="stat">
                <span className="num">{managersCount}</span>
                <span className="label">Manager totali</span>
              </div>
              <div className="stat">
                <span className="num">{activeCount}</span>
                <span className="label">In lega ora</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Ultima stagione ---- */}
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <h2>Ultima stagione</h2>
            <span className="sub">
              Edizione {latest.edizione} &middot; {latest.stagione}
            </span>
          </div>
          <div className="season-list">
            <SeasonRow ed={latest} />
          </div>
        </div>
      </section>

      {/* ---- Podio di sempre ---- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <h2>Il podio di sempre</h2>
            <a className="sub" href="/albo">
              Vedi il medagliere completo &rarr;
            </a>
          </div>
          <div className="medagliere">
            {podio.map((row, i) => (
              <PodioRow key={row.manager.id} row={row} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ---- L'album ---- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <h2>L&apos;album</h2>
            <a className="sub" href="/partecipanti">
              Vedi tutti i partecipanti &rarr;
            </a>
          </div>
          <div className="figurina-grid">
            {active.map((m) => (
              <FigurinaCard key={m.id} manager={m} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
