"use client";

import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/albo", label: "Albo d'oro" },
  { href: "/partecipanti", label: "Partecipanti" },
];

export default function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="main-nav" aria-label="Navigazione principale">
      {links.map(({ href, label }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <a key={href} href={href} className={isActive ? "active" : undefined}>
            {label}
          </a>
        );
      })}
    </nav>
  );
}
