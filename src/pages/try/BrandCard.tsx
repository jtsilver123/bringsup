import "./brandcard.css";

export interface BrandPreview {
  /** Their logo today, from their own site (image URL or data URI). Optional: some businesses have none. */
  before?: string;
  /** The refreshed logo we made (image URL or data URI). */
  after: string;
  colors: { name: string; hex: string }[];
}

/** On /try/, only when we made a logo refresh: their logo now and refreshed, and its colors. The full guide comes with the site. */
export function BrandCard({ name, brand }: { name: string; brand?: BrandPreview }) {
  if (!brand?.after) return null;
  // Hand-built payloads aren't schema-checked, so a missing or mistyped list just means no swatches.
  const colors = Array.isArray(brand.colors) ? brand.colors.filter((c) => c && typeof c.hex === "string") : [];
  return (
    <section className="wrap r-brand" aria-labelledby="r-brand-h">
      <h2 className="t3" id="r-brand-h">Your logo, refreshed</h2>
      <p className="r-brand-lead">Same {name} people already know, cleaned up so it looks sharp on a phone, a sign or a cup.</p>
      <div className={brand.before ? "rb-logos" : "rb-logos single"}>
        {brand.before && (
          <figure className="rb-logo">
            <div className="rb-tile"><img src={brand.before} alt={`${name} logo today`} /></div>
            <figcaption>Today</figcaption>
          </figure>
        )}
        {brand.before && <span className="rb-arrow" aria-hidden="true">→</span>}
        <figure className="rb-logo">
          <div className="rb-tile"><img src={brand.after} alt={`${name} logo, refreshed`} /></div>
          <figcaption>Refreshed</figcaption>
        </figure>
      </div>
      {colors.length > 0 && (
        <ul className="rb-colors" aria-label="Your colors">
          {colors.map((c) => (
            <li key={c.hex}><span className="rb-chip" style={{ background: c.hex }} /><b>{c.name}</b><code>{c.hex}</code></li>
          ))}
        </ul>
      )}
      <p className="small rb-note">Your full one-page brand guide comes with your site: your colors, fonts and how to use the logo on signs, menus and social posts.</p>
    </section>
  );
}
