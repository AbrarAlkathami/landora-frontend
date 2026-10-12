import Link from "next/link";

/** The investor-page Sarj logo, shared without changing its mark or lettering. */
export function SarjLogo({ href = "/", inverse = false }: { href?: string; inverse?: boolean }) {
  return (
    <Link href={href} className={`sarj-logo${inverse ? " sarj-logo-inverse" : ""}`} aria-label="Sarj Real Estate home">
      <span className="sarj-logo-symbol" aria-hidden="true"><span /><span /><span /></span>
      <span className="sarj-logo-word">SARJ<small>REAL ESTATE</small></span>
      {/* <span className="sarj-logo-ar" lang="ar">سَرج</span> */}
    </Link>
  );
}
