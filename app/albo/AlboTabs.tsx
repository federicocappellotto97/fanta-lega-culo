"use client";

import { useState } from "react";
import type { Edizione, MedagliereRow } from "@/lib/data/halloffame";
import { getManagerName } from "@/lib/data/halloffame";
import { getSquadName } from "@/lib/data/squads";

interface Props {
  editions: Edizione[];
  medagliere: MedagliereRow[];
}

type Tab = "stagioni" | "medagliere";

// ─── Season row ──────────────────────────────────────────────────────────────

function SeasonRow({ ed }: { ed: Edizione }) {
  const managerLink = (id: string | null) =>
    id ? (
      <a href={`/manager/${id}`}>{getManagerName(id)}</a>
    ) : null;

  return (
    <div className="season-row">
      <div className="season-badge">
        <span className="ed">{ed.edizione}</span>
        <span className="yr">{ed.stagione}</span>
      </div>

      <div className="season-cell">
        <span className="k">🏆 Campionato</span>
        <span className="v">{managerLink(ed.campionatoId)}</span>
      </div>

      <div className={`season-cell${!ed.coppaId ? " empty" : ""}`}>
        <span className="k">🥈 Coppa Culo</span>
        <span className="v">
          {ed.coppaId ? managerLink(ed.coppaId) : "Non fatta"}
        </span>
      </div>

      <div className={`season-cell${!ed.supercoppaId ? " empty" : ""}`}>
        <span className="k">🎖️ Supercoppa</span>
        <span className="v">
          {ed.supercoppaId ? managerLink(ed.supercoppaId) : "Non fatta"}
        </span>
      </div>

      <div className="season-cell">
        <span className="k">📉 Retrocesso</span>
        <span className="v">
          <a href={`/manager/${ed.retrocessoId}`}>
            {getManagerName(ed.retrocessoId)} ({getSquadName(ed.retrocessoSquadId)})
          </a>
        </span>
      </div>
    </div>
  );
}

// ─── Podio row ────────────────────────────────────────────────────────────────

function PodioRow({ row, index }: { row: MedagliereRow; index: number }) {
  const pos = index + 1;
  const posIcon = (["🥇", "🥈", "🥉"] as const)[index] ?? `#${pos}`;
  const manager = row.manager;

  const seed = encodeURIComponent(manager.id);
  const fallback = `https://picsum.photos/seed/${seed}/480/640`;

  const chips: React.ReactNode[] = [];
  if (row.campionati.length)
    chips.push(
      <span key="c" className="medal gold">
        🏆 Campionati × {row.campionati.length}
      </span>,
    );
  if (row.coppe.length)
    chips.push(
      <span key="k" className="medal silver">
        🥈 Coppe × {row.coppe.length}
      </span>,
    );
  if (row.supercoppe.length)
    chips.push(
      <span key="s" className="medal bronze">
        🎖️ Supercoppe × {row.supercoppe.length}
      </span>,
    );
  if (row.retrocessioni.length)
    chips.push(
      <span key="r" className="medal down">
        📉 Retrocessioni × {row.retrocessioni.length}
      </span>,
    );
  if (!chips.length)
    chips.push(
      <span key="empty" className="medal">
        Bacheca vuota
      </span>,
    );

  return (
    <div className={`podio-row rank-${pos}`}>
      <div className="podio-pos">{posIcon}</div>
      <div className="podio-photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={manager.fotoColore}
          alt={manager.nome}
          width={46}
          height={46}
          loading="lazy"
          onError={(e) => {
            const img = e.currentTarget;
            img.onerror = null;
            img.src = fallback;
          }}
        />
      </div>
      <div className="podio-name">
        <a href={`/manager/${manager.id}`}>{manager.nome}</a>
      </div>
      <div className="podio-medals">{chips}</div>
    </div>
  );
}

// ─── AlboTabs (main export) ───────────────────────────────────────────────────

export default function AlboTabs({ editions, medagliere }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("stagioni");

  return (
    <section className="section" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <div className="section-head">
          <h2>Albo d&apos;oro</h2>
          <div className="tabs" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === "stagioni"}
              aria-controls="panel-stagioni"
              id="tab-stagioni"
              className={activeTab === "stagioni" ? "active" : undefined}
              onClick={() => setActiveTab("stagioni")}
            >
              Stagione per stagione
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "medagliere"}
              aria-controls="panel-medagliere"
              id="tab-medagliere"
              className={activeTab === "medagliere" ? "active" : undefined}
              onClick={() => setActiveTab("medagliere")}
            >
              Medagliere
            </button>
          </div>
        </div>

        <div
          id="panel-stagioni"
          role="tabpanel"
          aria-labelledby="tab-stagioni"
          className={`tab-panel${activeTab === "stagioni" ? " active" : ""}`}
        >
          <div className="season-list">
            {editions.map((ed) => (
              <SeasonRow key={ed.edizione} ed={ed} />
            ))}
          </div>
        </div>

        <div
          id="panel-medagliere"
          role="tabpanel"
          aria-labelledby="tab-medagliere"
          className={`tab-panel${activeTab === "medagliere" ? " active" : ""}`}
        >
          <p className="section-tease">
            Ordinato per campionati vinti, poi coppe, poi supercoppe. A parità
            di titoli vince chi è retrocesso meno volte — l&apos;unica
            classifica dove la vergogna conta davvero.
          </p>
          <div className="medagliere">
            {medagliere.map((row, i) => (
              <PodioRow key={row.manager.id} row={row} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
