import Link from "next/link";
export default function NotFound() {
  return <div className="site-width section empty-state">
    <span className="eyebrow">A NEW DIRECTION</span>
    <h3>This opportunity couldn’t be found.</h3>
    <p>Explore the current listings to find your next possibility.</p>
    <Link href="/explore" className="cta cta-green mt-6">Explore lands →</Link>
  </div>;
}
