import { MANAGERS, type Manager } from "@/lib/data/managers";
import { getPalmares } from "@/lib/data/halloffame";
import { getSquadName } from "@/lib/data/squads";
import { FallbackImg } from "@/app/components/FallbackImg";

export const metadata = { title: "Partecipanti" };

function currentSquadId(manager: Manager): string {
  const entry =
    manager.squadre.find((s) => s.al === null) ??
    manager.squadre[manager.squadre.length - 1];
  return entry.squadId;
}

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
      {label} &times; {count}
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
        key="camp"
        cls="gold"
        label="🏆 Campionati"
        count={campionati.length}
      />,
    );
  if (coppe.length)
    chips.push(
      <MedalChip
        key="coppe"
        cls="silver"
        label="🥈 Coppe"
        count={coppe.length}
      />,
    );
  if (supercoppe.length)
    chips.push(
      <MedalChip
        key="super"
        cls="bronze"
        label="🎖️ Supercoppe"
        count={supercoppe.length}
      />,
    );
  if (retrocessioni.length)
    chips.push(
      <MedalChip
        key="retro"
        cls="down"
        label="📉 Retrocessioni"
        count={retrocessioni.length}
      />,
    );
  if (!chips.length)
    chips.push(
      <span key="empty" className="medal">
        Bacheca vuota
      </span>,
    );

  return <>{chips}</>;
}

function FigurinaCard({ manager }: { manager: Manager }) {
  const active = manager.presenteFinoAl === null;
  const squadId = currentSquadId(manager);
  const fallback = `https://picsum.photos/seed/${encodeURIComponent(manager.id)}/480/640`;

  return (
    <a
      className={`figurina${active ? "" : " ex"}`}
      href={`/manager/${manager.id}`}
    >
      <div className="figurina-photo">
        <FallbackImg
          src={manager.fotoColore}
          fallback={fallback}
          alt={manager.nome}
          width={480}
          height={640}
        />
        <span className="figurina-edition">dalla {manager.presenteDal}</span>
        {!active && <span className="figurina-status ex">Ex</span>}
      </div>
      <h3>{manager.nome}</h3>
      <p className="team">{getSquadName(squadId)}</p>
      <div className="medals">
        <CompactMedals managerId={manager.id} />
      </div>
    </a>
  );
}

export default function PartecipantiPage() {
  const sorted = [...MANAGERS].sort((a, b) => {
    const aActive = a.presenteFinoAl === null;
    const bActive = b.presenteFinoAl === null;
    if (aActive !== bActive) return aActive ? -1 : 1;
    return a.nome.localeCompare(b.nome, "it");
  });

  return (
    <section className="section" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <div className="section-head">
          <h2>Partecipanti</h2>
          <span className="sub">
            {MANAGERS.length} manager, dalla 1.0 a oggi
          </span>
        </div>
        <p className="section-tease">
          Ogni figurina apre la scheda completa del manager: squadre nel tempo,
          trofei vinti e retrocessioni da ricordargli a ogni cena.
        </p>
        <div className="figurina-grid">
          {sorted.map((manager) => (
            <FigurinaCard key={manager.id} manager={manager} />
          ))}
        </div>
      </div>
    </section>
  );
}
