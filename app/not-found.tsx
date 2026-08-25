import Link from "next/link";

export const metadata = {
  title: "Pagina non trovata",
};

export default function NotFound() {
  return (
    <div className="section">
      <div className="wrap">
        <p className="eyebrow">Errore 404</p>
        <h1
          style={{
            fontFamily: "var(--display)",
            textTransform: "uppercase",
            fontSize: "clamp(2.4rem, 6vw, 4rem)",
            lineHeight: 0.95,
            margin: "0 0 16px",
          }}
        >
          Pagina non trovata
        </h1>
        <p
          style={{
            fontSize: "1.05rem",
            color: "var(--ink-soft)",
            maxWidth: "46ch",
            margin: "0 0 28px",
          }}
        >
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
        <Link href="/" className="btn btn-primary">
          Torna alla home
        </Link>
      </div>
    </div>
  );
}
