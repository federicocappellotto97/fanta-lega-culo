import { notFound } from "next/navigation";
import { MANAGERS } from "@/lib/data/managers";
import { getPalmares } from "@/lib/data/halloffame";
import {
  getSquadName,
  getSquadData,
  getSquadCrestPath,
  getSquadShirtPath,
} from "@/lib/data/squads";
import { FallbackImg, HideOnErrorImg } from "@/app/components/FallbackImg";

export function generateStaticParams() {
  return MANAGERS.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const manager = MANAGERS.find((m) => m.id === params.id);
  if (!manager) return {};
  return { title: manager.nome };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default function ManagerPage({ params }: { params: { id: string } }) {
  const manager = MANAGERS.find((m) => m.id === params.id);
  if (!manager) notFound();

  const { campionati, coppe, supercoppe, retrocessioni } = getPalmares(
    manager.id,
  );
  const isActive = manager.presenteFinoAl === null;
  const currentSquadEntry =
    manager.squadre.find((s) => s.al === null) ??
    manager.squadre[manager.squadre.length - 1];
  const currentSquadName = getSquadName(currentSquadEntry.squadId);

  const statusText = isActive
    ? `In lega dalla ${manager.presenteDal}`
    : `Ex-manager (${manager.presenteDal} \u2013 ${manager.presenteFinoAl})`;

  const managerPhotoFallback = `https://picsum.photos/seed/${encodeURIComponent(manager.id)}/480/640`;
  const crestFallback = `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(currentSquadEntry.squadId)}&backgroundColor=1d2d51,e30b13`;

  // Medals chips for badge-row
  const medalChips: React.ReactNode[] = [];
  if (campionati.length)
    medalChips.push(
      <span key="c" className="medal gold">
        🏆 Campionati × {campionati.length}
      </span>,
    );
  if (coppe.length)
    medalChips.push(
      <span key="k" className="medal silver">
        🥈 Coppe × {coppe.length}
      </span>,
    );
  if (supercoppe.length)
    medalChips.push(
      <span key="s" className="medal bronze">
        🎖️ Supercoppe × {supercoppe.length}
      </span>,
    );
  if (retrocessioni.length)
    medalChips.push(
      <span key="r" className="medal down">
        📉 Retrocessioni × {retrocessioni.length}
      </span>,
    );
  if (medalChips.length === 0)
    medalChips.push(
      <span key="empty" className="medal">
        Bacheca vuota
      </span>,
    );

  // Current squad card (active managers only)
  const currentSquadSection = isActive ? (
    (() => {
      const squadData = getSquadData(currentSquadEntry.squadId);
      const [color1, color2] = squadData.colori;
      const logoSrc = getSquadCrestPath(currentSquadEntry.squadId);
      const shirtSrc = getSquadShirtPath(currentSquadEntry.squadId);
      const logoCrestFallback = `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(currentSquadEntry.squadId)}&backgroundColor=1d2d51,e30b13`;

      return (
        <div
          className="squad-card"
          style={{
            ["--squad-c1" as string]: color1,
            ["--squad-c2" as string]: color2,
          }}
        >
          <div className="squad-card-banner" />
          <div className="squad-card-body">
            <div className="squad-card-visuals">
              <FallbackImg
                src={logoSrc}
                fallback={logoCrestFallback}
                alt={`Logo ${squadData.nome}`}
                className="squad-card-logo"
                width={96}
                height={96}
              />
              <HideOnErrorImg
                src={shirtSrc}
                alt={`Maglia ${squadData.nome}`}
                className="squad-card-shirt"
                width={72}
                height={72}
              />
            </div>
            <div className="squad-card-info">
              <p className="squad-card-label">Squadra attuale</p>
              <h2 className="squad-card-name">
                {squadData.emoji ? (
                  <span className="squad-emoji">{squadData.emoji}</span>
                ) : null}{" "}
                {squadData.nome}
              </h2>
              <div className="squad-card-meta">
                <div className="squad-meta-item">
                  <span className="squad-meta-key">In rosa dalla</span>
                  <span className="squad-meta-val">
                    Edizione {currentSquadEntry.dal}
                  </span>
                </div>
                <div className="squad-meta-item">
                  <span className="squad-meta-key">Colori sociali</span>
                  <span className="squad-meta-val squad-colors">
                    <span
                      className="color-swatch"
                      style={{ background: color1 }}
                      title={color1}
                    />
                    <span
                      className="color-swatch"
                      style={{ background: color2 }}
                      title={color2}
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    })()
  ) : (
    <div className="crest-chip">
      <FallbackImg
        src={getSquadCrestPath(currentSquadEntry.squadId)}
        fallback={crestFallback}
        alt={currentSquadName}
        width={30}
        height={30}
      />
      <span className="name">{currentSquadName}</span>
    </div>
  );

  // Timeline items
  const timelineItems = manager.squadre.map((s) => {
    const isCurrent = s.al === null;
    const range = s.al
      ? `${s.dal} \u2013 ${s.al}`
      : `dalla ${s.dal} \u2013 oggi`;
    const squadName = getSquadName(s.squadId);
    const crest = getSquadCrestPath(s.squadId);
    const crestFb = `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(s.squadId)}&backgroundColor=1d2d51,e30b13`;

    return (
      <li key={s.squadId + s.dal} className={isCurrent ? "current" : ""}>
        <div
          className={`timeline-squad${isCurrent ? " timeline-squad--current" : ""}`}
        >
          <FallbackImg
            src={crest}
            fallback={crestFb}
            alt={squadName}
            className="timeline-crest"
          />
          <div className="timeline-info">
            <span className="team-name">{squadName}</span>
            <span className="range">{range}</span>
          </div>
        </div>
      </li>
    );
  });

  return (
    <section className="section" style={{ paddingTop: 32 }}>
      <div className="wrap">
        <p className="breadcrumb">
          <a href="/partecipanti">Partecipanti</a> / {escapeHtml(manager.nome)}
        </p>

        <div className="manager-hero">
          {/* Left: figurina card */}
          <div className={`figurina manager-card${isActive ? "" : " ex"}`}>
            <div className="figurina-photo">
              <FallbackImg
                src={manager.fotoColore}
                fallback={managerPhotoFallback}
                alt={manager.nome}
                width={480}
                height={640}
              />
              <span className="figurina-edition">
                dalla {manager.presenteDal}
              </span>
              {!isActive && <span className="figurina-status ex">Ex</span>}
            </div>
            <h3>{manager.nome}</h3>
            <p className="team">{currentSquadName}</p>
          </div>

          {/* Right: manager intro */}
          <div className="manager-intro">
            <p className="kicker">Scheda manager</p>
            <h1>{manager.nome}</h1>
            <p className="subtitle">{statusText}</p>

            {currentSquadSection}

            <div className="badge-row" style={{ marginTop: 22 }}>
              {medalChips}
            </div>

            <div className="section-head" style={{ marginBottom: 14 }}>
              <h2 style={{ fontSize: "1.3rem" }}>Bacheca</h2>
            </div>
            <div className="trophy-list">
              <div className="trophy-row">
                <div className="what">🏆 Campionati</div>
                <div style={{ textAlign: "right" }}>
                  <div className="count">{campionati.length}</div>
                  <div className="editions">{campionati.join(", ") || "—"}</div>
                </div>
              </div>
              <div className="trophy-row">
                <div className="what">🥈 Coppe Culo</div>
                <div style={{ textAlign: "right" }}>
                  <div className="count">{coppe.length}</div>
                  <div className="editions">{coppe.join(", ") || "—"}</div>
                </div>
              </div>
              <div className="trophy-row">
                <div className="what">🎖️ Supercoppe</div>
                <div style={{ textAlign: "right" }}>
                  <div className="count">{supercoppe.length}</div>
                  <div className="editions">{supercoppe.join(", ") || "—"}</div>
                </div>
              </div>
              <div className="trophy-row down">
                <div className="what">📉 Retrocessioni</div>
                <div style={{ textAlign: "right" }}>
                  <div className="count">{retrocessioni.length}</div>
                  <div className="editions">
                    {retrocessioni.join(", ") || "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="section-head" style={{ margin: "32px 0 14px" }}>
              <h2 style={{ fontSize: "1.3rem" }}>Carriera</h2>
            </div>
            <ul className="timeline">{timelineItems}</ul>
          </div>
        </div>
      </div>
    </section>
  );
}
