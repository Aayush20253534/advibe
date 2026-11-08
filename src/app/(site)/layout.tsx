import { brand } from "@/config/brand";
import { siteOrigin } from "@/services/site-origin.mjs";
import { PublicShell } from "@/components/layout/public-shell";

export default function SiteLayout({children}:{children:React.ReactNode}) {
  const origin = siteOrigin(process.env.NEXT_PUBLIC_APP_URL);
  const website = origin ? { "@context": "https://schema.org", "@type": "WebSite", name: brand.name, url: origin, inLanguage: "en-IN" } : null;
  return <PublicShell>
    {website && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website).replace(/</g, "\\u003c") }} />}
    {children}
  </PublicShell>;
}
