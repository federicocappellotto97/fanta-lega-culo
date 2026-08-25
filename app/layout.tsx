import "./globals.css";
import Link from "next/link";
import MainNav from "./components/MainNav";

export const metadata = {
  title: {
    default: "FANTA LEGA-CULO",
    template: "%s — FANTA LEGA-CULO",
  },
  description:
    "Albo d'oro, partecipanti e schede manager della FANTA LEGA-CULO, lega privata di fantacalcio dal 2018.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#app">
          Vai al contenuto
        </a>

        <header className="site-header">
          <div className="wrap">
            <Link className="brand" href="/">
              <img
                src="/assets/logo.png"
                alt="Stemma FANTA LEGA-CULO"
                width={42}
                height={42}
              />
              <span className="brand-word">
                FANTA LEGA<span>-CULO</span>
              </span>
            </Link>
            <MainNav />
          </div>
        </header>

        <main id="app">{children}</main>

        <footer className="site-footer">
          <div className="wrap">
            <span>
              FANTA LEGA-CULO &middot; presieduta dal{" "}
              <strong>Presidente Federico Ottavio</strong>
            </span>
            <div>
              <span>Dal 2018/19, edizione dopo edizione</span>
              <br />
              <em>Stiamo lavorando per voi</em>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
