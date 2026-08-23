import "./globals.css";

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
    <html lang="it">
      <body>
        <a className="skip-link" href="#app">
          Vai al contenuto
        </a>

        <header className="site-header">
          <div className="wrap">
            <a className="brand" href="/">
              <img
                src="/assets/logo.png"
                alt="Stemma FANTA LEGA-CULO"
                width={42}
                height={42}
              />
              <span className="brand-word">
                FANTA LEGA<span>-CULO</span>
              </span>
            </a>
            <nav className="main-nav" aria-label="Navigazione principale">
              <a href="/">Home</a>
              <a href="/albo">Albo d&apos;oro</a>
              <a href="/partecipanti">Partecipanti</a>
            </nav>
          </div>
        </header>

        <main id="app">{children}</main>

        <footer className="site-footer">
          <div className="wrap">
            <span>
              FANTA LEGA-CULO &middot; presieduta da{" "}
              <strong>Federico Ottavio</strong>
            </span>
            <span>Dal 2018/19, edizione dopo edizione</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
